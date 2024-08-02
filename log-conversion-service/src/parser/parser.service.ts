import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as admin from 'firebase-admin';
import { FirebaseConfigService } from 'src/firebase-config/firebase-config.service';

@Injectable()
export class ParserService {
  private firestore: admin.firestore.Firestore;

  constructor(
    private httpService: HttpService,
    firebaseServirce: FirebaseConfigService,
  ) {
    this.firestore = firebaseServirce.getFirestoreInstance();
  }

  async transformLog(
    sourceUrl: string,
  ): Promise<{ fileName: string; content: string[] }> {
    const startTime = Date.now();
    
    let logData = {
      date: admin.firestore.Timestamp.fromDate(new Date()),
      success: false, // Inicia como falso
      linesProcessed: 0,
      processingTime: 0,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.get<string>(sourceUrl),
      );
      const logLines = response.data.split('\n');
      const nonEmptyLines = logLines.filter((line) => line.trim() !== '');
      const transformedLines = nonEmptyLines.map((line) =>
        this.formatLine(line),
      );

      logData.success = true; // Marca como sucesso se chegou até aqui
      logData.linesProcessed = transformedLines.length;
      logData.processingTime = Date.now() - startTime;

      return {
        fileName: `converted_${Date.now()}.txt`,
        content: transformedLines,
      };
    } catch (error) {
      logData.success = false;
      logData.processingTime = Date.now() - startTime;
      throw error; // Re-lança o erro para ser tratado pelo controller
    } finally {
      // Registrar informações no Firebase independentemente de sucesso ou falha
      await this.firestore.collection('logConversions').add(logData);
    }
  }

  private formatLine(line: string): string {
    const parts = line.split('|');
    const method = this.extractHttpMethod(parts[3]);
    const path = this.extractPath(parts[3]);
    const roundedTime = Math.round(parseFloat(parts[4]));
    return `"MINHA CDN" ${method} ${parts[1]} ${path} ${roundedTime} ${parts[0]} ${parts[2]}`;
  }

  private extractHttpMethod(request: string): string {
    const match = request.match(/GET|POST|PUT|DELETE/);
    return match ? match[0] : 'UNKNOWN';
  }

  private extractPath(request: string): string {
    const match = request.match(/\/\S*/);
    return match ? match[0] : '/unknown';
  }
}
