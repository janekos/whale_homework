import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { convertCurrency, getAvailableCurrencies } from '../services/priceService';

// Mock axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn()
  }
}));

const mockedAxios = axios as any;

describe('Price Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAvailableCurrencies', () => {
    it('should return default currencies when env var is not set', () => {
      // Mock import.meta.env to not have VITE_CRYPTO_SYMBOLS
      const originalEnv = import.meta.env.VITE_CRYPTO_SYMBOLS;
      // @ts-ignore
      delete import.meta.env.VITE_CRYPTO_SYMBOLS;

      const currencies = getAvailableCurrencies();
      expect(currencies).toEqual(['USDT', 'TON']);

      // Restore
      // @ts-ignore
      import.meta.env.VITE_CRYPTO_SYMBOLS = originalEnv;
    });

    it('should return currencies from environment variable', () => {
      // Mock import.meta.env
      const originalEnv = import.meta.env.VITE_CRYPTO_SYMBOLS;
      // @ts-ignore
      import.meta.env.VITE_CRYPTO_SYMBOLS = 'BTC,ETH,USDT';

      const currencies = getAvailableCurrencies();
      expect(currencies).toEqual(['BTC', 'ETH', 'USDT']);

      // Restore
      // @ts-ignore
      import.meta.env.VITE_CRYPTO_SYMBOLS = originalEnv;
    });

    it('should handle currencies with whitespace', () => {
      const originalEnv = import.meta.env.VITE_CRYPTO_SYMBOLS;
      // @ts-ignore
      import.meta.env.VITE_CRYPTO_SYMBOLS = ' BTC , ETH , USDT ';

      const currencies = getAvailableCurrencies();
      expect(currencies).toEqual(['BTC', 'ETH', 'USDT']);

      // @ts-ignore
      import.meta.env.VITE_CRYPTO_SYMBOLS = originalEnv;
    });
  });

  describe('convertCurrency', () => {
    it('should successfully convert currency', async () => {
      const mockResponse = {
        data: {
          from: 'BTC',
          to: 'ETH',
          rate: 20.5,
          timestamp: '2023-01-01T00:00:00Z',
          data_timestamps: {
            BTC: '2023-01-01T00:00:00Z',
            ETH: '2023-01-01T00:00:00Z'
          }
        }
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await convertCurrency('BTC', 'ETH', '2023-01-01T00:00:00Z');

      expect(result).toEqual(mockResponse.data);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:3001/v1/api/prices/convert?currency1=BTC&currency2=ETH&timestamp=2023-01-01T00%3A00%3A00Z'
      );
    });

    it('should convert without timestamp', async () => {
      const mockResponse = {
        data: {
          from: 'BTC',
          to: 'ETH',
          rate: 20.5,
          data_timestamps: {
            BTC: '2023-01-01T00:00:00Z',
            ETH: '2023-01-01T00:00:00Z'
          }
        }
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await convertCurrency('BTC', 'ETH');

      expect(result).toEqual(mockResponse.data);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:3001/v1/api/prices/convert?currency1=BTC&currency2=ETH'
      );
    });

    it('should handle API error responses', async () => {
      const errorResponse = {
        response: {
          data: {
            error: 'Currency BTC is not supported'
          }
        }
      };

      mockedAxios.get.mockRejectedValue(errorResponse);

      await expect(convertCurrency('BTC', 'INVALID')).rejects.toThrow('Currency BTC is not supported');
    });

    it('should handle network errors', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network Error'));

      await expect(convertCurrency('BTC', 'ETH')).rejects.toThrow('Failed to fetch conversion rate');
    });

    it('should handle empty error response', async () => {
      const errorResponse = {
        response: {
          data: {}
        }
      };

      mockedAxios.get.mockRejectedValue(errorResponse);

      await expect(convertCurrency('BTC', 'ETH')).rejects.toThrow('Failed to fetch conversion rate');
    });
  });
});
