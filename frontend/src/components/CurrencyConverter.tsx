import React, { useState, useMemo } from 'react';
import { convertCurrency, getAvailableCurrencies } from '../services/priceService';
import { ConversionResult } from '../types/Price';

const CurrencyConverter: React.FC = () => {
  const supportedCurrencies = getAvailableCurrencies();
  const [currency1, setCurrency1] = useState(supportedCurrencies[0] || 'USDT');
  const [currency2, setCurrency2] = useState(supportedCurrencies[1] || 'TON');
  const [timestamp, setTimestamp] = useState('');
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currency1Options = useMemo(() => 
    supportedCurrencies.filter((currency: string) => currency !== currency2),
    [currency2]
  );

  const currency2Options = useMemo(() => 
    supportedCurrencies.filter((currency: string) => currency !== currency1),
    [currency1]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const conversionResult = await convertCurrency(currency1, currency2, timestamp);
      setResult(conversionResult);
    } catch (err: any) {
      setError(err.message || 'Failed to get conversion rate');
    } finally {
      setLoading(false);
    }
  };

  const handleUseCurrentTime = () => {
    setTimestamp(new Date().toISOString().slice(0, 16));
  };

  const handleSwapCurrencies = () => {
    const temp = currency1;
    setCurrency1(currency2);
    setCurrency2(temp);
    
    setResult(null);
    setError(null);
  };

  return (
    <div className="currency-converter">
      <form onSubmit={handleSubmit} className="converter-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="currency1">From Currency:</label>
            <select
              id="currency1"
              value={currency1}
              onChange={(e) => setCurrency1(e.target.value)}
              required
            >
              {currency1Options.map((currency: string) => (
                <option key={currency} value={currency}>{currency}</option>
              ))}
            </select>
          </div>

          <div className="swap-button-container">
            <button 
              type="button" 
              onClick={handleSwapCurrencies}
              className="btn-swap"
              title="Swap currencies"
            >
              ⇄
            </button>
          </div>

          <div className="form-group">
            <label htmlFor="currency2">To Currency:</label>
            <select
              id="currency2"
              value={currency2}
              onChange={(e) => setCurrency2(e.target.value)} 
              required
            >
              {currency2Options.map((currency: string) => (
                <option key={currency} value={currency}>{currency}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="timestamp">Timestamp (optional):</label>
          <div className="timestamp-input">
            <input
              type="datetime-local"
              id="timestamp"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              placeholder="Leave empty for latest price"
            />
            <button type="button" onClick={handleUseCurrentTime} className="btn-secondary">
              Use Current Time
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading || currency1 === currency2} className="btn-primary">
          {loading ? 'Converting...' : 'Get Conversion Rate'}
        </button>
      </form>

      {error && (
        <div className="error-message">
          <h3>Error:</h3>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="result">
          <h3>Conversion Result:</h3>
          <div className="result-card">
            <p className="conversion-rate">
              <strong>1 {result.from} = {result.rate.toFixed(8)} {result.to}</strong>
            </p>
            <div className="result-details">
              <p><strong>Query Timestamp:</strong> {result.timestamp || 'Latest'}</p>
              <p><strong>{result.from} Data From:</strong> {new Date(result.data_timestamps[result.from]).toLocaleString()}</p>
              <p><strong>{result.to} Data From:</strong> {new Date(result.data_timestamps[result.to]).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencyConverter;
