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
        'file',
      );

      if (!Array.isArray(content)) {
        // Se content não for um array, é tratado como erro para este endpoint específico
        res.status(400).json({ message: 'Unexpected content format.' });
        return;
      }

      // Define os cabeçalhos para download de arquivo de texto
      res.set({
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      });

      // Envia o conteúdo como string unida por '\n'
      res.send(content.join('\n'));
    } catch (error) {
      res
        .status(400)
        .json({ message: 'Conversion failed', error: error.message });
    }
  }

  @Post('convertToStr')
  async convertLogToStr(
    @Body() parseLogDto: ParseLogDto,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const response = await this.parserService.transformLog(
        parseLogDto.sourceUrl,
        'json',
      );

      res.set({
        'Content-Type': 'aplication/json',
      });

      res.json(response.content);
    } catch (error) {
      res
        .status(400)
        .json({ message: 'Conversion failed', error: error.message });
    }
  }
}
