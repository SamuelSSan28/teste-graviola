import { Injectable, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as admin from 'firebase-admin';
import { FirebaseConfigService } from '@src/firebase-config/firebase-config.service';

@Injectable()
export class ParserService {
  private firestore: admin.firestore.Firestore;

  constructor(
    private httpService: HttpService,
    firebaseService: FirebaseConfigService,
  ) {
    this.firestore = firebaseService.getFirestoreInstance();
  }

  async transformLog(
    sourceUrl: string,
    outputFormat: 'file' | 'json' = 'file',
  ): Promise<{ fileName?: string; content: string[] | object }> {
    const startTime = Date.now();
    let logData = this.initializeLogData();

    try {
      const response = await this.fetchLogData(sourceUrl);
      const nonEmptyLines = this.validateAndExtractLines(response.data);

      const transformedLines = nonEmptyLines.map((line) =>
        this.formatLine(line),
      );

      logData = this.updateLogData(
        logData,
        true,
        transformedLines.length,
        startTime,
      );

      return this.formatOutput(response.data, transformedLines, outputFormat);
    } catch (error) {
      logData = this.updateLogData(logData, false, 0, startTime);
      throw error;
    } finally {
      await this.logToFirestore(logData);
    }
  }

  private initializeLogData() {
    return {
      date: admin.firestore.Timestamp.fromDate(new Date()),
      success: false,
      linesProcessed: 0,
      processingTime: 0,
    };
  }

  private async fetchLogData(sourceUrl: string) {
    return firstValueFrom(this.httpService.get<string>(sourceUrl));
  }

  private validateAndExtractLines(data: string): string[] {
    if (!data || data.trim() === '') {
      throw new BadRequestException('No data received from the source URL.');
    }

    const logLines = data.split('\n');
    return logLines.filter((line) => line.trim() !== '');
  }

  private updateLogData(
    logData: any,
    success: boolean,
    linesProcessed: number,
    startTime: number,
  ) {
    return {
      ...logData,
      success,
      linesProcessed,
      processingTime: Date.now() - startTime,
    };
  }

  private async logToFirestore(logData: any) {
    await this.firestore.collection('logConversions').add(logData);
  }

  private formatOutput(
    originalData: string,
    transformedLines: string[],
    outputFormat: 'file' | 'json',
  ): { fileName?: string; content: string[] | object } {
    if (outputFormat === 'json') {
      return {
        content: {
          received: originalData,
          converted: transformedLines.join('\n'),
        },
      };
    } else {
      return {
        fileName: `converted_${Date.now()}.txt`,
        content: transformedLines,
      };
    }
  }

  private formatLine(line: string): string {
    const parts = line.split('|');
  
    if (parts.length < 5) {
      throw new Error('Linha de log está no formato incorreto');
    }
  
    const host = parts[0]; // Host do log
    const status = parts[1]; // Código de status HTTP
    const cacheStatus = parts[2]; // Status do cache
    const requestDetails = parts[3]; // Detalhes da requisição
    const time = parseFloat(parts[4]); // Tempo de resposta
  
    // Método HTTP e o caminho da requisição
    const method = this.extractHttpMethod(requestDetails);
    const path = this.extractPath(requestDetails);
  
    const roundedTime = isNaN(time) ? 0 : Math.round(time);
  
    return `"MINHA CDN" ${method} ${status} ${path} ${roundedTime} ${host} ${cacheStatus}`;
  }
  
  private extractHttpMethod(request: string): string {
    const match = request.match(/"(GET|POST|PUT|DELETE)/);
    return match ? match[1] : 'UNKNOWN';
  }
  
  private extractPath(request: string): string {
    const match = request.match(/\/\S*/);
    return match ? match[0] : '/unknown';
  }
  
}
