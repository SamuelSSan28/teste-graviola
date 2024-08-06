import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { DashboardParamsDto } from './dtos/dashboard-params.dto';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let analyticsService: AnalyticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        {
          provide: AnalyticsService,
          useValue: {
            getStatistics: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
    analyticsService = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return dashboard data using getStatistics from service', async () => {
    const mockStatistics = {
      totalConversions: 5,
      totalSuccess: 3,
      totalErrors: 2,
      averageProcessingTime: 100,
      conversionsPerDay: { '01/08/2024': 1, '02/08/2024': 4 },
      timeProcessedByDay: { '01/08/2024': 50, '02/08/2024': 150 },
    };

    const query: DashboardParamsDto = { startDate: '2024-08-01', endDate: '2024-08-02' };
    
    // Simular a resposta do serviço
    jest.spyOn(analyticsService, 'getStatistics').mockResolvedValueOnce(mockStatistics);

    const result = await controller.getDashboardData(query);

    expect(analyticsService.getStatistics).toHaveBeenCalledWith(query);
    expect(result).toEqual(mockStatistics);
  });

  it('should handle default parameters', async () => {
    const mockStatistics = {
      totalConversions: 10,
      totalSuccess: 7,
      totalErrors: 3,
      averageProcessingTime: 110,
      conversionsPerDay: { '01/08/2024': 5, '02/08/2024': 5 },
      timeProcessedByDay: { '01/08/2024': 250, '02/08/2024': 250 },
    };

    // Simular a resposta do serviço
    jest.spyOn(analyticsService, 'getStatistics').mockResolvedValueOnce(mockStatistics);

    const result = await controller.getDashboardData({});

    expect(analyticsService.getStatistics).toHaveBeenCalledWith({});
    expect(result).toEqual(mockStatistics);
  });
});
