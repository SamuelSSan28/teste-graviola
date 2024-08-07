import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FirebaseConfigService {
  private firestore: admin.firestore.Firestore;

  constructor(private configService: ConfigService) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: this.configService.get<string>('FIREBASE_PROJECT_ID'),
        privateKey: this.configService
          .get<string>('FIREBASE_PRIVATE_KEY')
          .replace(/\\n/g, '\n'),
        clientEmail: this.configService.get<string>('FIREBASE_CLIENT_EMAIL'),
      }),
    });

    this.firestore = admin.firestore();
    this.testConnection();
  }

  private async testConnection() {
    try {
      const testDoc = await this.firestore
        .collection('test')
        .doc('connectionTest')
        .get();

      console.log(
        'Firebase Connection Successful',
        testDoc.exists
          ? 'Document retrieved successfully'
          : 'Document not found',
      );
    } catch (error) {
      console.error('Failed to connect to Firebase', error);
    }
  }

  getFirestoreInstance() {
    return this.firestore;
  }
}
