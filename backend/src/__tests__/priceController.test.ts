import { Request, Response } from 'express';
import { priceController } from '../controllers/priceController';
import { AppDataSource } from '../data-source';
import { CurrencyPrice } from '../entities/CurrencyPrice';

// Mock the data source
jest.mock('../data-source');

describe('Price Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockRepository: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    mockRequest = {
      query: {}
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis()
    };

    // Mock the repository
    mockRepository = {
      createQueryBuilder: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getOne: jest.fn()
    };

    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepository);
  });

  describe('getCurrencyConversion', () => {
    it('should return error when currency1 is missing', async () => {
      mockRequest.query = { currency2: 'ETH' };

      await priceController.getCurrencyConversion(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Missing required parameters: currency1, currency2'
      });
    });

    it('should return error when currency2 is missing', async () => {
      mockRequest.query = { currency1: 'BTC' };

      await priceController.getCurrencyConversion(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Missing required parameters: currency1, currency2'
      });
    });

    it('should return error for invalid currency', async () => {
      mockRequest.query = { currency1: 'INVALID', currency2: 'ETH' };

      await priceController.getCurrencyConversion(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Currency INVALID is not supported'
      });
    });

    it('should return error for invalid timestamp', async () => {
      mockRequest.query = { 
        currency1: 'BTC', 
        currency2: 'ETH', 
        timestamp: 'invalid-date' 
      };

      await priceController.getCurrencyConversion(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid timestamp format'
      });
    });

    it('should return successful conversion rate when prices are found', async () => {
      const mockTimestamp = '2023-01-01T00:00:00Z';
      mockRequest.query = { 
        currency1: 'BTC', 
        currency2: 'ETH',
        timestamp: mockTimestamp
      };

      const mockPrice1 = {
        symbol: 'BTC',
        price_usd: '50000',
        timestamp: new Date('2023-01-01T00:00:00Z')
      };

      const mockPrice2 = {
        symbol: 'ETH',
        price_usd: '2500',
        timestamp: new Date('2023-01-01T00:00:00Z')
      };

      // Mock the query builder chain for both currencies
      mockRepository.getOne
        .mockResolvedValueOnce(mockPrice1)
        .mockResolvedValueOnce(mockPrice2);

      await priceController.getCurrencyConversion(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.set).toHaveBeenCalledWith('Cache-Control', 'public, max-age=60');
      expect(mockResponse.json).toHaveBeenCalledWith({
        from: 'BTC',
        to: 'ETH',
        rate: 20, // 50000 / 2500
        timestamp: mockTimestamp,
        data_timestamps: {
          BTC: mockPrice1.timestamp,
          ETH: mockPrice2.timestamp
        }
      });
    });

    it('should return error when price data not found for currency1', async () => {
      mockRequest.query = { 
        currency1: 'BTC', 
        currency2: 'ETH',
        timestamp: '2023-01-01T00:00:00Z'
      };

      // Mock first currency not found, second currency found
      mockRepository.getOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ symbol: 'ETH', price_usd: '2500' });

      await priceController.getCurrencyConversion(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'No price data found for BTC at or before 2023-01-01T00:00:00Z'
      });
    });

    it('should handle database errors gracefully', async () => {
      mockRequest.query = { currency1: 'BTC', currency2: 'ETH' };
      
      mockRepository.getOne.mockRejectedValue(new Error('Database error'));

      await priceController.getCurrencyConversion(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Internal Server Error'
      });
    });
  });
});
