import '@testing-library/jest-dom'

// Mock environment variables
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_API_URL: 'http://localhost:3001/v1/api',
    VITE_CRYPTO_SYMBOLS: 'BTC,ETH,USDT,BNB,SOL,XRP,ADA,DOGE'
  },
  writable: true
})
