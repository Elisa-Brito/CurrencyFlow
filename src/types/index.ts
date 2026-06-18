export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'CHF';

export interface Wallet {
  id: string;
  name: string;
  currency: Currency;
  description: string;
  monthlyAmount: number;
  createdAt: string;
}

export interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  lastUpdated: Date;
}

export interface ProjectionScenario {
  label: string;
  monthlyChange: number;
  color: string;
}

export interface ProjectionPoint {
  month: string;
  pessimistic: number;
  neutral: number;
  optimistic: number;
}

export interface FinancialGoal {
  targetAmount: number;
  timeframeMonths: number;
  currentMonthlySavings: number;
}

export type NavPage = 'dashboard' | 'wallets' | 'projections' | 'planning' | 'bestday' | 'simulator';

export interface ConversionSignal {
  recommendation: 'convert' | 'wait' | 'neutral';
  reason: string;
  reasonKey: string;
  reasonParams?: Record<string, string | number>;
  daysToWait?: number;
  trend: number[];
  strength: number;
}
