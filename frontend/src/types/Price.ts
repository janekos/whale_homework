export interface ConversionResult {
  from: string;
  to: string;
  rate: number;
  timestamp?: string;
  data_timestamps: {
    [currency: string]: string;
  };
}
