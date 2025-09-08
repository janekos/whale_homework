### Whale homework

This is a simple cryptocurrency price conversion application built with a React frontend and a Node.js backend. The application allows users to convert amounts between different cryptocurrencies based on real-time exchange rates fetched from the Coinmarketcap API.

Api runs a job every minute to fetch the latest prices for a set of cryptocurrencies and stores them in a PostgreSQL database. The frontend provides a user interface to select currencies, enter amounts, and view conversion results.

Api only security measure is rate limiting to 100 requests per hour per IP.

### Setup

Add your Coinmarketcap API key in the .env file in the root folder.

To run this project just call `docker-compose up --build` in the root directory and the frontend will be available at http://localhost:3002 and the backend at http://localhost:3001. Or set whatever ports you want in .env file.

Let the backend job run at least once to get any data in the database.

If you want more currencies you can add them in the .env file in  CRYPTO_SYMBOLS variable.

### Future improvements

- Redis caching for the backend to cache frequent requests and reduce database load.
- Separate worker service instances for fetching prices to improve scalability.
- Better ui, maybe charts to show price trends and historical data.
- More tests.
- More data providers for redundancy. Currently has only Coinmarketcap but can add CoinGecko, CryptoCompare, etc.