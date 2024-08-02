import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';  // Correct import from @nestjs/axios
import { ParserController } from './parser.controller';
import { ParserService } from './parser.service';

@Module({
  imports: [HttpModule],
  controllers: [ParserController],
  providers: [ParserService],
  exports: [ParserService]  // Ensure ParserService is exported if it's used outside this module
})
export class ParserModule {}
