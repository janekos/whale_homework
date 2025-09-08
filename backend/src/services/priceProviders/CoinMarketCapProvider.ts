import { BasePriceProvider, PriceData } from './BasePriceProvider';

interface CoinMarketCapResponse {
  status: {
    error_code: number;
    error_message?: string;
  };
  data: {
    [key: string]: {
      id: number;
      name: string;
      symbol: string;
      quote: {
        USD: {
          price: number;
          last_updated: string;
        };
      };
    };
  };
}

export class CoinMarketCapProvider extends BasePriceProvider {
  private apiKey: string;
  private baseUrl: string = 'https://pro-api.coinmarketcap.com/v1';

  constructor() {
    super('CoinMarketCap');
    this.apiKey = process.env.COINMARKETCAP_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('COINMARKETCAP_API_KEY environment variable is required');
    }
  }

  async fetchPrices(symbols: string[]): Promise<PriceData[]> {
    try {
      const symbolsParam = symbols.join(',');
      const url = `${this.baseUrl}/cryptocurrency/quotes/latest?symbol=${symbolsParam}&convert=USD`;

      const response = await fetch(url, {
        headers: {
          'X-CMC_PRO_API_KEY': this.apiKey,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`CoinMarketCap API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as CoinMarketCapResponse;

      if (data.status.error_code !== 0) {
        throw new Error(`CoinMarketCap API error: ${data.status.error_message}`);
      }

      const priceData: PriceData[] = [];
      
      for (const symbol of symbols) {
        const coinData = data.data[symbol.toUpperCase()];
        if (coinData && coinData.quote.USD) {
          priceData.push(this.createPriceData(
            coinData.symbol,
            coinData.quote.USD.price
          ));
        }
      }

      return priceData;
    } catch (error) {
      console.error(`Error fetching prices from CoinMarketCap:`, error);
      throw error;
    }
  }
}
