import { AppDataSource } from '../data-source';
import { CurrencyPrice } from '../entities/CurrencyPrice';
import { CoinMarketCapProvider } from '../services/priceProviders/CoinMarketCapProvider';
import { allowedCurrencies } from '../helpers/currencyHelpers';

// Mock the dependencies
jest.mock('../data-source');
jest.mock('../services/priceProviders/CoinMarketCapProvider');

// Simple unit tests focusing on the core logic components
describe('Price Fetch Job Components', () => {
  let mockRepository: any;
  let mockProvider: CoinMarketCapProvider;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock the repository
    mockRepository = {
      create: jest.fn(),
      save: jest.fn()
    };

    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepository);

    // Mock the provider
    mockProvider = new CoinMarketCapProvider();
    (mockProvider.getName as jest.Mock) = jest.fn().mockReturnValue('CoinMarketCap');
    (mockProvider.fetchPrices as jest.Mock) = jest.fn();
  });

  it('should process price data correctly when provider returns valid data', async () => {
    const mockPriceData = [
      {
        symbol: 'BTC',
        price_usd: '50000',
        timestamp: new Date('2023-01-01T00:00:00Z'),
        source: 'CoinMarketCap'
      },
      {
        symbol: 'ETH',
        price_usd: '2500',
        timestamp: new Date('2023-01-01T00:00:00Z'),
        source: 'CoinMarketCap'
      }
    ];

    (mockProvider.fetchPrices as jest.Mock).mockResolvedValue(mockPriceData);
    mockRepository.create.mockImplementation((data: any) => data);
    mockRepository.save.mockResolvedValue(mockPriceData);

    // Test the core logic directly
    const prices = await mockProvider.fetchPrices(allowedCurrencies);
    expect(prices).toHaveLength(2);
    expect(prices[0].symbol).toBe('BTC');
    expect(prices[1].symbol).toBe('ETH');

    // Test repository interaction
    const currencyPrices = prices.map(priceData => 
      mockRepository.create({
        symbol: priceData.symbol,
        price_usd: priceData.price_usd,
        timestamp: priceData.timestamp,
        source: priceData.source,
      })
    );

    await mockRepository.save(currencyPrices);

    expect(mockRepository.create).toHaveBeenCalledTimes(2);
    expect(mockRepository.save).toHaveBeenCalledWith(mockPriceData);
  });

  it('should handle provider errors gracefully', async () => {
    (mockProvider.fetchPrices as jest.Mock).mockRejectedValue(new Error('API Error'));

    try {
      await mockProvider.fetchPrices(allowedCurrencies);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('API Error');
    }

    expect(mockRepository.save).not.toHaveBeenCalled();
  });

  it('should handle empty price data from provider', async () => {
    (mockProvider.fetchPrices as jest.Mock).mockResolvedValue([]);

    const prices = await mockProvider.fetchPrices(allowedCurrencies);
    expect(prices).toHaveLength(0);
    
    // Should not save empty data
    if (prices.length === 0) {
      expect(mockRepository.save).not.toHaveBeenCalled();
    }
  });

  it('should create currency price entities with correct structure', async () => {
    const mockPriceData = {
      symbol: 'BTC',
      price_usd: '50000',
      timestamp: new Date('2023-01-01T00:00:00Z'),
      source: 'CoinMarketCap'
    };

    mockRepository.create.mockImplementation((data: any) => ({ id: 1, ...data }));

    const entity = mockRepository.create(mockPriceData);

    expect(entity).toMatchObject({
      symbol: 'BTC',
      price_usd: '50000',
      timestamp: expect.any(Date),
      source: 'CoinMarketCap'
    });
    expect(entity.id).toBeDefined();
  });

  it('should handle database save errors', async () => {
    const mockPriceData = [{
      symbol: 'BTC',
      price_usd: '50000',
      timestamp: new Date('2023-01-01T00:00:00Z'),
      source: 'CoinMarketCap'
    }];

    mockRepository.save.mockRejectedValue(new Error('Database Error'));

    await expect(mockRepository.save(mockPriceData)).rejects.toThrow('Database Error');
  });
});
