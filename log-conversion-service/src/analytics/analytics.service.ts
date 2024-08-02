import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FirebaseConfigService } from 'src/firebase-config/firebase-config.service';
import { DashboardParamsDto } from './dtos/dashboard-params.dto';

@Injectable()
export class AnalyticsService {
  private firestore: admin.firestore.Firestore;

  constructor(firebaseService: FirebaseConfigService) {
    this.firestore = firebaseService.getFirestoreInstance();
  }

  async getStatistics(query: DashboardParamsDto) {
    const stats = {
      totalConversions: 0,
      totalSuccess: 0,
      totalErrors: 0,
      conversionsPerDay: {},
      timeProcessedByDay: {},
      averageProcessingTime: 0,
    };

    const endDate = query.endDate ? new Date(query.endDate) : new Date();
    const startDate = query.startDate
      ? new Date(query.startDate)
      : new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days before endDate

    const processingTimes = [];
    const snapshot = await this.firestore
      .collection('logConversions')
      .where('date', '>=', admin.firestore.Timestamp.fromDate(startDate))
      .where('date', '<=', admin.firestore.Timestamp.fromDate(endDate))
      .get();

    snapshot.forEach((doc) => {
      const data = doc.data();
      const formattedDate = this.formatDate(data.date);

      // Aggregate counts
      this.aggregateCounts(data, stats, formattedDate, processingTimes);
    });

    // Process averages
    this.calculateAverages(stats, processingTimes);

    return stats;
  }

  private formatDate(timestamp: admin.firestore.Timestamp): string {
    const date = timestamp.toDate(); // Convert Firestore Timestamp to JavaScript Date
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  }

  private aggregateCounts(
    data: any,
    stats: any,
    date: string,
    processingTimes: number[],
  ) {
    stats.totalConversions++;
    if (data.success) {
      stats.totalSuccess++;
    } else {
      stats.totalErrors++;
    }
    this.incrementDateCount(stats.conversionsPerDay, date);
    if (data.processingTime != null) {
      this.collectTimeData(stats.timeProcessedByDay, date, data.processingTime);
      processingTimes.push(data.processingTime);
    }
  }

  private incrementDateCount(obj: { [key: string]: number }, date: string) {
    if (obj[date]) {
      obj[date]++;
    } else {
      obj[date] = 1;
    }
  }

  private collectTimeData(
    obj: { [key: string]: number[] },
    date: string,
    time: number,
  ) {
    if (obj[date]) {
      obj[date].push(time);
    } else {
      obj[date] = [time];
    }
  }

  private calculateAverages(stats: any, processingTimes: number[]) {
    Object.keys(stats.timeProcessedByDay).forEach((day) => {
      const times = stats.timeProcessedByDay[day];
      stats.timeProcessedByDay[day] =
        times.reduce((a, b) => a + b, 0) / times.length;
    });
    if (processingTimes.length > 0) {
      stats.averageProcessingTime =
        processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length;
    }
  }
}
