import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { DashboardParamsDto } from './dtos/dashboard-params.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('dashboard')
  getDashboardData(@Query() query: DashboardParamsDto) {
    return this.analyticsService.getStatistics(query);
  }
}
