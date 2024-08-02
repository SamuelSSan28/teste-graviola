import { IsOptional, IsDateString } from 'class-validator';

export class DashboardParamsDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
