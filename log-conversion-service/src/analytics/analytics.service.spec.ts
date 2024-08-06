import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { DashboardParamsDto } from './dtos/dashboard-params.dto';
import { FirebaseConfigService } from '@src/firebase-config/firebase-config.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let firestoreMock: any;

  beforeEach(async () => {
    // Mock para o admin.firestore.Timestamp
    const TimestampMock = {
      fromDate: (date: Date) => ({
        toDate: () => date,
        toMillis: () => date.getTime(),
        seconds: Math.floor(date.getTime() / 1000),
        nanoseconds: 0,
      }),
    };

    // Simular o comportamento do Firestore
    const FirestoreMock = {
      getFirestoreInstance: jest.fn(() => ({
        collection: jest.fn(() => ({
          where: jest.fn().mockReturnThis(),
          get: jest.fn(() =>
            Promise.resolve({
              forEach: jest.fn((callback) => {
                const docs = [
                  {
                    data: () => ({
                      date: TimestampMock.fromDate(
                        new Date('2024-08-02T01:27:53.052Z'),
                      ),
                      success: true,
                      processingTime: 120,
                    }),
                  },
                  {
                    data: () => ({
                      date: TimestampMock.fromDate(
                        new Date('2024-08-03T01:27:53.052Z'),
                      ),
                      success: false,
                      processingTime: 150,
                    }),
                  },
                ];
                docs.forEach((doc) => callback(doc));
              }),
            }),
          ),
        })),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: FirebaseConfigService, useValue: FirestoreMock },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    firestoreMock = module.get<FirebaseConfigService>(FirebaseConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should calculate statistics correctly with default dates', async () => {
    const stats = await service.getStatistics({});
    expect(stats.totalConversions).toBe(2);
    expect(stats.totalSuccess).toBe(1);
    expect(stats.totalErrors).toBe(1);
    expect(stats.averageProcessingTime).toBeCloseTo(135, 2);
    expect(Object.keys(stats.conversionsPerDay).length).toBe(2);
  });

  it('should calculate statistics correctly with specified dates', async () => {
    const query: DashboardParamsDto = {
      startDate: '2024-08-01',
      endDate: '2024-08-02',
    };
    const stats = await service.getStatistics(query);
    expect(stats.totalConversions).toBe(2); // Only count the first day
    expect(stats.totalSuccess).toBe(1);
    expect(stats.totalErrors).toBe(1);
    expect(stats.averageProcessingTime).toBe(135);
    expect(stats.conversionsPerDay['02/08/2024']).toBe(1);
  });

   
});
