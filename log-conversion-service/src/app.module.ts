import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AnalyticsModule } from './analytics/analytics.module';
import { ParserController } from './parser/parser.controller';
import { ParserModule } from './parser/parser.module';
import { FirebaseConfigModule } from './firebase-config/firebase-config.module';
import { AnalyticsController } from './analytics/analytics.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    FirebaseConfigModule,
    ParserModule,
    AnalyticsModule,
  ],
  controllers: [ParserController, AnalyticsController],
  providers: [],
})
export class AppModule {}
