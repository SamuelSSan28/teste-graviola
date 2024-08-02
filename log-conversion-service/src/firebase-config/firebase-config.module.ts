import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FirebaseConfigService } from './firebase-config.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [FirebaseConfigService],
  exports: [FirebaseConfigService]
})
export class FirebaseConfigModule {}
