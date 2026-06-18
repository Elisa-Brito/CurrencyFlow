import { create } from 'zustand';
import type { ExchangeRates } from '../types';

interface RatesStore {
  rates: ExchangeRates | null;
  loading: boolean;
  error: string | null;
  setRates: (rates: ExchangeRates) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useRatesStore = create<RatesStore>((set) => ({
  rates: null,
  loading: true,
  error: null,
  setRates: (rates) => set({ rates, loading: false, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
}));
