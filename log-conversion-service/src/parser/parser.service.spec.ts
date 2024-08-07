import { Test, TestingModule } from '@nestjs/testing';
import { ParserService } from './parser.service';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { FirebaseConfigService } from '@src/firebase-config/firebase-config.service';

// Mock Firebase Firestore
const mockFirestore = {
  collection: jest.fn().mockReturnThis(),
  add: jest.fn(),
};

describe('ParserService', () => {
  let service: ParserService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParserService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: FirebaseConfigService,
          useValue: {
            getFirestoreInstance: jest.fn().mockReturnValue(mockFirestore),
          },
        },
      ],
    }).compile();

    service = module.get<ParserService>(ParserService);
    httpService = module.get<HttpService>(HttpService);
  });

  describe('transformLog', () => {

    it('should transform log data into file format with headers', async () => {
      const sourceUrl = 'http://example.com/log';

      // Log data formatted correctly
      const logData = [
        '312|200|HIT|"GET /robots.txt HTTP/1.1"|100.2',
        '101|200|MISS|"POST /myImages HTTP/1.1"|319.4',
        '199|404|MISS|"GET /not-found HTTP/1.1"|142.9',
        '312|200|INVALIDATE|"GET /robots.txt HTTP/1.1"|245.1',
      ].join('\n');

      const response: AxiosResponse<string> = {
        data: logData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: {},
          method: 'get',
          url: sourceUrl,
        } as InternalAxiosRequestConfig,
      };

      jest.spyOn(httpService, 'get').mockReturnValue(of(response));

      const result = await service.transformLog(sourceUrl, 'file');

      const headers = [
        '#Version: 1.0',
        `#Date: ${new Date().toLocaleString('pt-BR')}`,
        '#Fields: provider http-method status-code uri-path time-taken response-size cache-status',
      ];

      expect(result.content).toEqual([
        ...headers,
        '"MINHA CDN" GET 200 /robots.txt 100 312 HIT',
        '"MINHA CDN" POST 200 /myImages 319 101 MISS',
        '"MINHA CDN" GET 404 /not-found 143 199 MISS',
        '"MINHA CDN" GET 200 /robots.txt 245 312 INVALIDATE',
      ]);

      expect(mockFirestore.collection).toHaveBeenCalledWith('logConversions');
      expect(mockFirestore.add).toHaveBeenCalled();
    });

    it('should transform log data into JSON format with headers', async () => {
      const sourceUrl = 'http://example.com/log';

      // Log data formatted correctly
      const logData = [
        '312|200|HIT|"GET /robots.txt HTTP/1.1"|100.2',
        '101|200|MISS|"POST /myImages HTTP/1.1"|319.4',
        '199|404|MISS|"GET /not-found HTTP/1.1"|142.9',
        '312|200|INVALIDATE|"GET /robots.txt HTTP/1.1"|245.1',
      ].join('\n');

      const response: AxiosResponse<string> = {
        data: logData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: {},
          method: 'get',
          url: sourceUrl,
        } as InternalAxiosRequestConfig,
      };

      jest.spyOn(httpService, 'get').mockReturnValue(of(response));

      const result = await service.transformLog(sourceUrl, 'json');

      const headers = [
        '#Version: 1.0',
        `#Date: ${new Date().toLocaleString('pt-BR')}`,
        '#Fields: provider http-method status-code uri-path time-taken response-size cache-status',
      ];

      expect(result.content).toEqual({
        received: logData,
        converted: [
          ...headers,
          '"MINHA CDN" GET 200 /robots.txt 100 312 HIT',
          '"MINHA CDN" POST 200 /myImages 319 101 MISS',
          '"MINHA CDN" GET 404 /not-found 143 199 MISS',
          '"MINHA CDN" GET 200 /robots.txt 245 312 INVALIDATE',
        ].join('\n'),
      });

      expect(mockFirestore.collection).toHaveBeenCalledWith('logConversions');
      expect(mockFirestore.add).toHaveBeenCalled();
    });

    it('should throw an error if the log line is malformed', async () => {
      const sourceUrl = 'http://example.com/malformed-log';
      const malformedLogData = '312|200|INVALID|"GET /robots.txt HTTP/1.1"';

      const response: AxiosResponse<string> = {
        data: malformedLogData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: {},
          method: 'get',
          url: sourceUrl,
        } as InternalAxiosRequestConfig,
      };

      jest.spyOn(httpService, 'get').mockReturnValue(of(response));

      await expect(service.transformLog(sourceUrl, 'json')).rejects.toThrow(
        'Linha de log está no formato incorreto na linha 1.',
      );

      expect(mockFirestore.collection).toHaveBeenCalledWith('logConversions');
      expect(mockFirestore.add).toHaveBeenCalled();
    });

    it('should handle extraction errors for HTTP method', async () => {
      const sourceUrl = 'http://example.com/invalid-method';
      const invalidMethodLogData = '312|200|HIT|"/robots.txt HTTP/1.1"|100.2'; // Missing HTTP method

      const response: AxiosResponse<string> = {
        data: invalidMethodLogData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: {},
          method: 'get',
          url: sourceUrl,
        } as InternalAxiosRequestConfig,
      };

      jest.spyOn(httpService, 'get').mockReturnValue(of(response));

      await expect(service.transformLog(sourceUrl, 'json')).rejects.toThrow(
        'Erro ao extrair o método HTTP na linha 1.',
      );

      expect(mockFirestore.collection).toHaveBeenCalledWith('logConversions');
      expect(mockFirestore.add).toHaveBeenCalled();
    });

    it('should handle extraction errors for URI path', async () => {
      const sourceUrl = 'http://example.com/invalid-path';
      const invalidPathLogData = '312|200|HIT|"GET "|100.2'; // Missing URI path

      const response: AxiosResponse<string> = {
        data: invalidPathLogData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: {},
          method: 'get',
          url: sourceUrl,
        } as InternalAxiosRequestConfig,
      };

      jest.spyOn(httpService, 'get').mockReturnValue(of(response));

      await expect(service.transformLog(sourceUrl, 'json')).rejects.toThrow(
        'Erro ao extrair o caminho da URI na linha 1.',
      );

      expect(mockFirestore.collection).toHaveBeenCalledWith('logConversions');
      expect(mockFirestore.add).toHaveBeenCalled();
    });

    it('should handle 100 lines of log data efficiently', async () => {
      const sourceUrl = 'http://example.com/large-log';

      // Create a large log data string with 100 lines
      const logData = new Array(100)
        .fill('312|200|HIT|"GET /robots.txt HTTP/1.1"|100.2')
        .join('\n');

      const response: AxiosResponse<string> = {
        data: logData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: {},
          method: 'get',
          url: sourceUrl,
        } as InternalAxiosRequestConfig,
      };

      jest.spyOn(httpService, 'get').mockReturnValue(of(response));

      const result = await service.transformLog(sourceUrl, 'file');

      const headers = [
        '#Version: 1.0',
        `#Date: ${new Date().toLocaleString('pt-BR')}`,
        '#Fields: provider http-method status-code uri-path time-taken response-size cache-status',
      ];

      if (Array.isArray(result.content)) {
        expect(result.content.length).toBe(103);
      } else {
        fail('Expected result.content to be an array of strings');
      }
       
      expect(result.content.slice(headers.length)).toEqual(
        new Array(100).fill('"MINHA CDN" GET 200 /robots.txt 100 312 HIT'),
      );

      expect(mockFirestore.collection).toHaveBeenCalledWith('logConversions');
      expect(mockFirestore.add).toHaveBeenCalled();
    });
  });

  describe('formatLine', () => {

    it('should format line correctly', () => {
      const line = '312|200|HIT|"GET /robots.txt HTTP/1.1"|100.2';
      const formattedLine = service['formatLine'](line, 1);

      expect(formattedLine).toBe('"MINHA CDN" GET 200 /robots.txt 100 312 HIT');
    });

    it('should throw error for malformed line', () => {
      const malformedLine = '312|200|HIT|"GET /robots.txt HTTP/1.1"'; // Missing time

      expect(() => service['formatLine'](malformedLine, 1)).toThrow(
        'Linha de log está no formato incorreto na linha 1.',
      );
    });

    it('should extract HTTP method correctly', () => {
      const request = '"GET /path HTTP/1.1"';
      const method = service['extractHttpMethod'](request, 1);

      expect(method).toBe('GET');
    });

    it('should throw error if HTTP method is not found', () => {
      const request = '/path HTTP/1.1';

      expect(() => service['extractHttpMethod'](request, 1)).toThrow(
        'Erro ao extrair o método HTTP na linha 1.',
      );
    });

    it('should extract path correctly', () => {
      const request = 'GET /path/to/resource';
      const path = service['extractPath'](request, 1);

      expect(path).toBe('/path/to/resource');
    });

    it('should throw error if URI path is not found', () => {
      const request = 'GET ';

      expect(() => service['extractPath'](request, 1)).toThrow(
        'Erro ao extrair o caminho da URI na linha 1.',
      );
    });
  });
});
