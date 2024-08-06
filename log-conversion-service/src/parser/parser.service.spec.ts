import { Test, TestingModule } from '@nestjs/testing';
import { ParserService } from './parser.service';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { BadRequestException } from '@nestjs/common';
import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
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
    it('should transform log data into file format', async () => {
      const sourceUrl = 'http://example.com/log';
      
      // Usando o formato correto para os dados de log
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
    
      expect(result).toEqual({
        fileName: expect.any(String),
        content: [
          '"MINHA CDN" GET 200 /robots.txt 100 312 HIT',
          '"MINHA CDN" POST 200 /myImages 319 101 MISS',
          '"MINHA CDN" GET 404 /not-found 143 199 MISS',
          '"MINHA CDN" GET 200 /robots.txt 245 312 INVALIDATE',
        ],
      });
    
      expect(mockFirestore.collection).toHaveBeenCalledWith('logConversions');
      expect(mockFirestore.add).toHaveBeenCalled();
    });
  
    it('should transform log data into JSON format', async () => {
      const sourceUrl = 'http://example.com/log';
      // Usando o formato correto para os dados de log
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
    
      expect(result).toEqual({
        content: {
          received: logData,
          converted: [
            '"MINHA CDN" GET 200 /robots.txt 100 312 HIT',
            '"MINHA CDN" POST 200 /myImages 319 101 MISS',
            '"MINHA CDN" GET 404 /not-found 143 199 MISS',
            '"MINHA CDN" GET 200 /robots.txt 245 312 INVALIDATE',
          ].join('\n'),
        },
      });
    
      expect(mockFirestore.collection).toHaveBeenCalledWith('logConversions');
      expect(mockFirestore.add).toHaveBeenCalled();
    });
    
    it('should throw BadRequestException if no data received', async () => {
      const sourceUrl = 'http://example.com/empty-log';
      
      const response: AxiosResponse<string> = {
        data: '',
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

      await expect(service.transformLog(sourceUrl)).rejects.toThrow(
        BadRequestException,
      );

      expect(mockFirestore.collection).toHaveBeenCalledWith('logConversions');
      expect(mockFirestore.add).toHaveBeenCalled();
    });

    it('should handle errors from the HTTP request', async () => {
      const sourceUrl = 'http://example.com/error-log';
      jest.spyOn(httpService, 'get').mockReturnValue(throwError(() => new Error('Request failed')));

      await expect(service.transformLog(sourceUrl)).rejects.toThrow(
        'Request failed',
      );

      expect(mockFirestore.collection).toHaveBeenCalledWith('logConversions');
      expect(mockFirestore.add).toHaveBeenCalled();
    });
  });

  describe('formatLine', () => {

    it('should format line correctly', () => {
      const line = '312|200|HIT|"GET /robots.txt HTTP/1.1"|100.2';
      const formattedLine = service['formatLine'](line);
    
      expect(formattedLine).toBe('"MINHA CDN" GET 200 /robots.txt 100 312 HIT');
    });
    
    it('should extract HTTP method correctly', () => {
      const request = '"GET /path HTTP/1.1"';
      const method = service['extractHttpMethod'](request);
    
      expect(method).toBe('GET');
    });   

    it('should extract path correctly', () => {
      const request = 'GET /path/to/resource';
      const path = service['extractPath'](request);

      expect(path).toBe('/path/to/resource');
    });

    it('should return UNKNOWN method if none found', () => {
      const request = '/path/to/resource';
      const method = service['extractHttpMethod'](request);

      expect(method).toBe('UNKNOWN');
    });

    it('should return /unknown path if none found', () => {
      const request = 'GET ';
      const path = service['extractPath'](request);

      expect(path).toBe('/unknown');
    });
  });
});
