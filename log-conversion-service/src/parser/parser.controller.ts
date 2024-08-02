import { Controller, Post, Body, Res } from '@nestjs/common';
import { ParserService } from './parser.service';
import { ParseLogDto } from './dto/parse-log.dto';
import { Response } from 'express';

@Controller('parser')
export class ParserController {
  constructor(private readonly parserService: ParserService) {}

  @Post('convert')
  async convertLog(
    @Body() parseLogDto: ParseLogDto,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const { fileName, content } = await this.parserService.transformLog(
        parseLogDto.sourceUrl,
      );
      res.set({
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      });
      res.send(content.join('\n'));
    } catch (error) {
      res
        .status(400)
        .json({ message: 'Conversion failed', error: error.message });
    }
  }
}
