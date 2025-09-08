import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { CurrencyPrice } from '../entities/CurrencyPrice';
import { reject, cache } from '../helpers/requestHelpers';
import { isValidCurrency } from '../helpers/currencyHelpers';

export const priceController = {
  async getCurrencyConversion(req: Request, res: Response) {
    try {
      const { timestamp, currency1, currency2 } = req.query;
      
      if (!currency1 || !currency2)
        return reject(res, 400, 'Missing required parameters: currency1, currency2');

      if (!isValidCurrency(currency1 as string))
        return reject(res, 400, `Currency ${currency1} is not supported`);

      if (!isValidCurrency(currency2 as string))
        return reject(res, 400, `Currency ${currency2} is not supported`);

      const targetTime = timestamp ? new Date(timestamp as string) : new Date();
      if (isNaN(targetTime.getTime())) 
        return reject(res, 400, 'Invalid timestamp format');

      const repository = AppDataSource.getRepository(CurrencyPrice);
      const getPrice = (currency: string) => repository
        .createQueryBuilder('cp')
        .where('cp.symbol = :symbol', { symbol: currency.toUpperCase() })
        .andWhere('cp.timestamp <= :timestamp', { timestamp: targetTime })
        .orderBy('cp.timestamp', 'DESC')
        .limit(1)
        .getOne();

      const [price1, price2] = await Promise.all([
        getPrice(currency1 as string),
        getPrice(currency2 as string)
      ]);

      if (!price1) 
        return reject(res, 404, `No price data found for ${currency1} at or before ${timestamp}`);

      if (!price2) 
        return reject(res, 404, `No price data found for ${currency2} at or before ${timestamp}`);

      const conversionRate = Number(price1.price_usd) / Number(price2.price_usd);

      cache(res, 60);

      return res.json({
        from: currency1,
        to: currency2,
        rate: conversionRate,
        timestamp: timestamp,
        data_timestamps: {
          [currency1 as string]: price1.timestamp,
          [currency2 as string]: price2.timestamp
        }
      });

    } catch (error) {
      console.error('Error in getCurrencyConversion:', error);
      return reject(res, 500);
    }
  }
}
