const symbolsEnv = process.env.CRYPTO_SYMBOLS || 'BTC,ETH,USDT,BNB,SOL,XRP,ADA,DOGE';
export const allowedCurrencies = symbolsEnv.split(',').map(s => s.trim().toUpperCase());

export function isValidCurrency(currency: string): boolean {
  return allowedCurrencies.includes(currency.toUpperCase());
}
