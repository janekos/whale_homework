import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CurrencyConverter from '../components/CurrencyConverter';
import * as priceService from '../services/priceService';
import { ConversionResult } from '../types/Price';

// Mock the price service
vi.mock('../services/priceService');

describe('CurrencyConverter', () => {
  const mockGetAvailableCurrencies = vi.mocked(priceService.getAvailableCurrencies);
  const mockConvertCurrency = vi.mocked(priceService.convertCurrency);

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAvailableCurrencies.mockReturnValue(['BTC', 'ETH', 'USDT', 'SOL']);
  });

  it('should render currency converter form', () => {
    render(<CurrencyConverter />);
    
    expect(screen.getByLabelText(/from currency/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/to currency/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/timestamp/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /get conversion rate/i })).toBeInTheDocument();
  });

  it('should populate currency dropdowns with available currencies', () => {
    render(<CurrencyConverter />);
    
    const currency1Select = screen.getByLabelText(/from currency/i);
    const currency2Select = screen.getByLabelText(/to currency/i);
    
    // Check that options are populated (BTC should be in currency1, ETH in currency2)
    expect(currency1Select).toHaveValue('BTC');
    expect(currency2Select).toHaveValue('ETH');
  });

  it('should filter out selected currency from other dropdown', () => {
    render(<CurrencyConverter />);
    
    const currency1Select = screen.getByLabelText(/from currency/i);
    const currency2Select = screen.getByLabelText(/to currency/i);
    
    // Currency2 should not contain BTC (which is selected in currency1)
    const currency2Options = Array.from(currency2Select.querySelectorAll('option')).map(opt => opt.value);
    expect(currency2Options).not.toContain('BTC');
    
    // Currency1 should not contain ETH (which is selected in currency2)
    const currency1Options = Array.from(currency1Select.querySelectorAll('option')).map(opt => opt.value);
    expect(currency1Options).not.toContain('ETH');
  });

  it('should successfully convert currencies', async () => {
    const user = userEvent.setup();
    const mockResult = {
      from: 'BTC',
      to: 'ETH',
      rate: 20.5,
      timestamp: '2023-01-01T00:00:00Z',
      data_timestamps: {
        BTC: '2023-01-01T00:00:00Z',
        ETH: '2023-01-01T00:00:00Z'
      }
    };

    mockConvertCurrency.mockResolvedValue(mockResult);

    render(<CurrencyConverter />);
    
    const submitButton = screen.getByRole('button', { name: /get conversion rate/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/conversion result/i)).toBeInTheDocument();
      expect(screen.getByText(/1 BTC = 20.50000000 ETH/i)).toBeInTheDocument();
    });

    expect(mockConvertCurrency).toHaveBeenCalledWith('BTC', 'ETH', '');
  });

  it('should display error when conversion fails', async () => {
    const user = userEvent.setup();
    mockConvertCurrency.mockRejectedValue(new Error('API Error'));

    render(<CurrencyConverter />);
    
    const submitButton = screen.getByRole('button', { name: /get conversion rate/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /error/i })).toBeInTheDocument();
      expect(screen.getByText(/api error/i)).toBeInTheDocument();
    });
  });

  it('should use current time when button is clicked', async () => {
    const user = userEvent.setup();
    render(<CurrencyConverter />);
    
    const useCurrentTimeButton = screen.getByRole('button', { name: /use current time/i });
    const timestampInput = screen.getByLabelText(/timestamp/i);
    
    expect(timestampInput).toHaveValue('');
    
    await user.click(useCurrentTimeButton);
    
    // Should have a timestamp value now (we can't check exact value due to timing)
    expect(timestampInput).not.toHaveValue('');
  });

  it('should disable submit button when currencies are the same', () => {
    // Mock the return value to have same currencies
    mockGetAvailableCurrencies.mockReturnValue(['BTC', 'BTC']); // Invalid but for testing
    
    render(<CurrencyConverter />);
    
    const submitButton = screen.getByRole('button', { name: /get conversion rate/i });
    
    // When both currencies are BTC, button should be disabled
    expect(submitButton).toBeDisabled();
  });

  it('should show loading state during conversion', async () => {
    const user = userEvent.setup();
    // Create a promise that we can control
    let resolvePromise: (value: any) => void;
    const mockPromise = new Promise<any>((resolve) => {
      resolvePromise = resolve;
    });
    
    mockConvertCurrency.mockReturnValue(mockPromise);

    render(<CurrencyConverter />);
    
    const submitButton = screen.getByRole('button', { name: /get conversion rate/i });
    await user.click(submitButton);

    // Should show loading state
    expect(screen.getByText(/converting.../i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    // Resolve the promise
    resolvePromise!({
      from: 'BTC',
      to: 'ETH',
      rate: 20.5,
      data_timestamps: { BTC: '2023-01-01', ETH: '2023-01-01' }
    });

    await waitFor(() => {
      expect(screen.getByText(/get conversion rate/i)).toBeInTheDocument();
    });
  });

  it('should include timestamp in API call when provided', async () => {
    const user = userEvent.setup();
    mockConvertCurrency.mockResolvedValue({
      from: 'BTC',
      to: 'ETH',
      rate: 20.5,
      data_timestamps: { BTC: '2023-01-01', ETH: '2023-01-01' }
    });

    render(<CurrencyConverter />);
    
    const timestampInput = screen.getByLabelText(/timestamp/i);
    const submitButton = screen.getByRole('button', { name: /get conversion rate/i });
    
    await user.type(timestampInput, '2023-01-01T12:00');
    await user.click(submitButton);

    expect(mockConvertCurrency).toHaveBeenCalledWith('BTC', 'ETH', '2023-01-01T12:00');
  });
});
