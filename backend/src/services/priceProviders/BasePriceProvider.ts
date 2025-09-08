export interface PriceData {
  symbol: string;
  price_usd: number;
  timestamp: Date;
  source: string;
}

export abstract class BasePriceProvider {
  protected name: string;

  constructor(name: string) {
    this.name = name;
  }

  abstract fetchPrices(symbols: string[]): Promise<PriceData[]>;

  getName(): string {
    return this.name;
  }

  protected createPriceData(symbol: string, price: number): PriceData {
    return {
      symbol: symbol.toUpperCase(),
      price_usd: price,
      timestamp: new Date(),
      source: this.name
    };
  }
}