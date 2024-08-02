import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { FirebaseConfigService } from 'src/firebase-config/firebase-config.service';
import { DashboardParamsDto } from './dtos/dashboard-params.dto';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let firestoreMock: any;

  beforeEach(async () => {
    // Enhance the Firestore mock to handle query filtering
    const FirestoreMock = {
      getFirestoreInstance: jest.fn(() => ({
        collection: jest.fn(() => ({
          where: jest.fn().mockReturnThis(), // Chainable mocks for where
          get: jest.fn(() => Promise.resolve({
            forEach: jest.fn((callback) => {
              const docs = [
                { data: () => ({ date: '2024-08-02T01:27:53.052Z', success: true, processingTime: 120 }) },
                { data: () => ({ date: '2024-08-03T01:27:53.052Z', success: false, processingTime: 150 }) },
              ];
              docs.forEach(doc => callback(doc));
            }),
          })),
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
    const query: DashboardParamsDto = { startDate: '2024-08-01', endDate: '2024-08-02' };
    const stats = await service.getStatistics(query);
    expect(stats.totalConversions).toBe(1); // Only count the first day
    expect(stats.totalSuccess).toBe(1);
    expect(stats.totalErrors).toBe(0);
    expect(stats.averageProcessingTime).toBe(120);
    expect(stats.conversionsPerDay['02/08/2024']).toBe(1);
  });

  it('should handle empty data', async () => {
    firestoreMock.getFirestoreInstance().collection().where().get.mockResolvedValue({
      forEach: jest.fn(),
    });
    const stats = await service.getStatistics({});
    expect(stats.totalConversions).toBe(0);
    expect(stats.totalSuccess).toBe(0);
    expect(stats.totalErrors).toBe(0);
    expect(stats.averageProcessingTime).toBe(0);
  });
});
