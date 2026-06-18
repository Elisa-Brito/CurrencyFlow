import { useEffect, useCallback } from 'react';
import { useRatesStore } from '../store/ratesStore';
import type { ExchangeRates } from '../types';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'CHF'];

async function fetchRates(): Promise<ExchangeRates> {
  const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
  if (!response.ok) throw new Error('Falha ao buscar taxas de câmbio');
  const data = await response.json();
  return {
    base: 'USD',
    rates: data.rates,
    lastUpdated: new Date(),
  };
}

export function useExchangeRates() {
  const { setRates, setLoading, setError } = useRatesStore();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rates = await fetchRates();
      setRates(rates);
    } catch (err) {
      setError('Não foi possível carregar as taxas. Usando dados simulados.');
      // Fallback with realistic rates
      setRates({
        base: 'USD',
        rates: {
          BRL: 5.12,
          EUR: 0.92,
          GBP: 0.79,
          CAD: 1.36,
          AUD: 1.53,
          CHF: 0.88,
          USD: 1,
        },
        lastUpdated: new Date(),
      });
    }
  }, [setRates, setLoading, setError]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [load]);

  return { refresh: load };
}

export function getRateToBRL(rates: ExchangeRates, currency: string): number {
  if (currency === 'BRL') return 1;
  const brlPerUsd = rates.rates['BRL'] ?? 5.0;
  const currencyPerUsd = rates.rates[currency] ?? 1;
  return brlPerUsd / currencyPerUsd;
}

export function getDisplayRates(rates: ExchangeRates) {
  return CURRENCIES.map((currency) => ({
    currency,
    brl: getRateToBRL(rates, currency),
  }));
}
