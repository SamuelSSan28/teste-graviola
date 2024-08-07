import { Test, TestingModule } from '@nestjs/testing';
import { ParserController } from './parser.controller';
import { ParserService } from './parser.service';
import { ParseLogDto } from './dto/parse-log.dto';
import { Response } from 'express';
import { of } from 'rxjs';

describe('ParserController', () => {
  let controller: ParserController;
  let parserService: ParserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParserController],
      providers: [
        {
          provide: ParserService,
          useValue: {
            transformLog: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ParserController>(ParserController);
    parserService = module.get<ParserService>(ParserService);
  });

  describe('convertLog', () => {
    it('should convert log and send as file', async () => {
      const mockResponse = {
        set: jest.fn(),
        send: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const parseLogDto: ParseLogDto = {
        sourceUrl: 'http://example.com/log',
      };

      const fileName = 'converted_log.txt';
      const content = ['line1', 'line2'];

      jest.spyOn(parserService, 'transformLog').mockResolvedValueOnce({
        fileName,
        content,
      });

      await controller.convertLog(parseLogDto, mockResponse);

      expect(mockResponse.set).toHaveBeenCalledWith({
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      });

      expect(mockResponse.send).toHaveBeenCalledWith('line1\nline2');
    });

    it('should return error if content format is unexpected', async () => {
      const mockResponse = {
        set: jest.fn(),
        send: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const parseLogDto: ParseLogDto = {
        sourceUrl: 'http://example.com/log',
      };

      const fileName = 'converted_log.txt';
      const content = { key: 'value' }; // Simulate unexpected format

      jest.spyOn(parserService, 'transformLog').mockResolvedValueOnce({
        fileName,
        content,
      });

      await controller.convertLog(parseLogDto, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Unexpected content format.',
      });
    });

    it('should handle transformation errors', async () => {
      const mockResponse = {
        set: jest.fn(),
        send: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const parseLogDto: ParseLogDto = {
        sourceUrl: 'http://example.com/log',
      };

      const errorMessage = 'Transformation error';

      jest.spyOn(parserService, 'transformLog').mockRejectedValueOnce(
        new Error(errorMessage),
      );

      await controller.convertLog(parseLogDto, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Falha na conversão',
        error: errorMessage,
      });
    });
  });

  describe('convertLogToStr', () => {
    it('should convert log and send as JSON', async () => {
      const mockResponse = {
        set: jest.fn(),
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const parseLogDto: ParseLogDto = {
        sourceUrl: 'http://example.com/log',
      };

      const content = {
        received: 'original log data',
        converted: 'converted log data',
      };

      jest.spyOn(parserService, 'transformLog').mockResolvedValueOnce({
        content,
      });

      await controller.convertLogToStr(parseLogDto, mockResponse);

      expect(mockResponse.set).toHaveBeenCalledWith({
        'Content-Type': 'aplication/json',
      });

      expect(mockResponse.json).toHaveBeenCalledWith(content);
    });

    it('should handle transformation errors', async () => {
      const mockResponse = {
        set: jest.fn(),
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const parseLogDto: ParseLogDto = {
        sourceUrl: 'http://example.com/log',
      };

      const errorMessage = 'Transformation error';

      jest.spyOn(parserService, 'transformLog').mockRejectedValueOnce(
        new Error(errorMessage),
      );

      await controller.convertLogToStr(parseLogDto, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Falha na conversão',
        error: errorMessage,
      });
    });
  });
});
