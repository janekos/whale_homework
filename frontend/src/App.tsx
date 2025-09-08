import React from 'react';
import CurrencyConverter from './components/CurrencyConverter';

const App: React.FC = () => {
  return (
    <div className="container">
      <h1>Crypto Currency Converter</h1>
      <CurrencyConverter />
    </div>
  );
};

export default App;
