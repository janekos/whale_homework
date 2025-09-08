import axios from 'axios';
import { ConversionResult } from '../types/Price';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/v1/api';

export const getAvailableCurrencies = (): string[] => {
  const cryptoSymbols = import.meta.env.VITE_CRYPTO_SYMBOLS || 'USDT,TON';
  return cryptoSymbols.split(',').map((symbol: string) => symbol.trim().toUpperCase());
};

export const convertCurrency = async (
  currency1: string,
  currency2: string,
  timestamp?: string
): Promise<ConversionResult> => {
  try {
    const params = new URLSearchParams({
      currency1,
      currency2,
    });

    if (timestamp) {
      params.append('timestamp', timestamp);
    }

    const response = await axios.get(`${API_BASE_URL}/prices/convert?${params}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error('Failed to fetch conversion rate');
  }
};
