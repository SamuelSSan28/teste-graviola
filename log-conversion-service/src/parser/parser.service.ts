import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as admin from 'firebase-admin';
import { FirebaseConfigService } from '@src/firebase-config/firebase-config.service';
import { AxiosError } from 'axios';

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

      const transformedLines = nonEmptyLines.map(
        (line, index) => this.formatLine(line, index + 1), // Pass the line number for error context
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
      throw new Error(`${error?.message || error}`);
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
      throw new Error('Nenhum dado recebido da URL de origem.');
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
    // Add header lines for the file format
    const headers = [
      '#Version: 1.0',
      `#Date: ${new Date().toLocaleString('pt-BR')}`,
      '#Fields: provider http-method status-code uri-path time-taken response-size cache-status',
    ];
    const fileContent = headers.concat(transformedLines);

    if (outputFormat === 'json') {
      return {
        content: {
          received: originalData,
          converted: fileContent.join('\n'),
        },
      };
    } else {
      return {
        fileName: `converted_${Date.now()}.txt`,
        content: fileContent,
      };
    }
  }

  private formatLine(line: string, lineNumber: number): string {
    const parts = line.split('|');

    if (parts.length < 5) {
      throw new Error(
        `Linha de log está no formato incorreto na linha ${lineNumber}.`,
      );
    }

    const host = parts[0]; // Host do log
    const status = parts[1]; // Código de status HTTP
    const cacheStatus = parts[2]; // Status do cache
    const requestDetails = parts[3]; // Detalhes da requisição
    const time = parseFloat(parts[4]); // Tempo de resposta

    // Método HTTP e o caminho da requisição
    const method = this.extractHttpMethod(requestDetails, lineNumber);
    const path = this.extractPath(requestDetails, lineNumber);

    const roundedTime = isNaN(time) ? 0 : Math.round(time);

    return `"MINHA CDN" ${method} ${status} ${path} ${roundedTime} ${host} ${cacheStatus}`;
  }

  private extractHttpMethod(request: string, lineNumber: number): string {
    const match = request.match(/"(GET|POST|PUT|DELETE)/);
    if (!match) {
      throw new Error(`Erro ao extrair o método HTTP na linha ${lineNumber}.`);
    }
    return match[1];
  }

  private extractPath(request: string, lineNumber: number): string {
    const match = request.match(/\/\S*/);
    if (!match) {
      throw new Error(
        `Erro ao extrair o caminho da URI na linha ${lineNumber}.`,
      );
    }
    return match[0];
  }
}
