import { AppDataSource } from '../data-source';
import { CurrencyPrice } from '../entities/CurrencyPrice';
import { CoinMarketCapProvider } from '../services/priceProviders/CoinMarketCapProvider';
import { BasePriceProvider } from '../services/priceProviders/BasePriceProvider';
import { allowedCurrencies } from '../helpers/currencyHelpers';

const providers: BasePriceProvider[] = [
  new CoinMarketCapProvider()
];

export async function priceFetchJobHandler(job: any) {
  console.log('Starting price fetch job...');
  
  try {
    const repository = AppDataSource.getRepository(CurrencyPrice);
    
    if (providers.length === 0) {
      throw new Error('No price providers configured');
    }
    
    let totalSaved = 0;
    
    const providerPromises = providers.map(async (provider) => {
      try {
        const prices = await provider.fetchPrices(allowedCurrencies);
        console.log(`Fetched ${prices.length} price records from ${provider.getName()}`);
        return prices;
      } catch (error) {
        console.error(`Failed to fetch prices from ${provider.getName()}:`, error);
        return [];
      }
    });
    
    const results = await Promise.allSettled(providerPromises);
    
    const allPrices = results
      .filter(result => result.status === 'fulfilled')
      .flatMap(result => result.value);
    
    if (allPrices.length > 0) {
      const currencyPrices = allPrices.map(priceData => 
        repository.create({
          symbol: priceData.symbol,
          price_usd: priceData.price_usd,
          timestamp: priceData.timestamp,
          source: priceData.source,
        })
      );
      
      await repository.save(currencyPrices);
      totalSaved = allPrices.length;
      console.log(`Bulk inserted ${totalSaved} price records`);
    }
    
    console.log(`Price fetch job completed. Total records saved: ${totalSaved}`);
  } catch (error) {
    console.error('Price fetch job failed:', error);
    throw error;
  }
}
