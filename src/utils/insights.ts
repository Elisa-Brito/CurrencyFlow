import type { Wallet, ExchangeRates } from '../types';
import { getRateToBRL } from '../hooks/useExchangeRates';
import { simulateTrend, getDailySeed } from './calculators';

export type InsightSeverity = 'danger' | 'warning' | 'info' | 'success';

export interface Insight {
  id: string;
  severity: InsightSeverity;
  titleKey: string;
  titleParams?: Record<string, string | number>;
  bodyKey: string;
  bodyParams?: Record<string, string | number>;
  impact?: number;
}

export const CURRENCY_VOLATILITY: Record<string, { level: 'low' | 'medium' | 'high'; monthlyStd: number }> = {
  USD: { level: 'medium', monthlyStd: 3.5 },
  EUR: { level: 'medium', monthlyStd: 4.0 },
  GBP: { level: 'high', monthlyStd: 5.2 },
  CAD: { level: 'medium', monthlyStd: 3.8 },
  AUD: { level: 'high', monthlyStd: 5.6 },
  CHF: { level: 'low', monthlyStd: 2.8 },
};

export function generateInsights(wallets: Wallet[], rates: ExchangeRates): Insight[] {
  if (!wallets.length) return [];

  const insights: Insight[] = [];
  const getRate = (c: string) => getRateToBRL(rates, c);

  const totalBRL = wallets.reduce((acc, w) => acc + w.monthlyAmount * getRate(w.currency), 0);
  if (totalBRL === 0) return [];

  // Per-currency totals
  const byCurrency: Record<string, number> = {};
  for (const w of wallets) {
    byCurrency[w.currency] = (byCurrency[w.currency] ?? 0) + w.monthlyAmount * getRate(w.currency);
  }

  const sorted = Object.entries(byCurrency).sort((a, b) => b[1] - a[1]);
  const [dominantCurrency, dominantBRL] = sorted[0];
  const dominantPct = (dominantBRL / totalBRL) * 100;
  const dominantRate = getRate(dominantCurrency);

  // Simulate 14-day trend (seeded = consistent per day)
  const seed = getDailySeed(dominantCurrency);
  const trend = simulateTrend(dominantRate, 14, seed);
  const rate7dAgo = trend[0];
  const weekChangePct = ((dominantRate - rate7dAgo) / rate7dAgo) * 100;

  const totalLastWeek = wallets.reduce((acc, w) => {
    const rate = w.currency === dominantCurrency ? rate7dAgo : getRate(w.currency);
    return acc + w.monthlyAmount * rate;
  }, 0);
  const weekBRLDelta = totalBRL - totalLastWeek;

  // 1. Week gain/loss — most urgent insight
  if (Math.abs(weekBRLDelta) > 20) {
    const gained = weekBRLDelta > 0;
    insights.push({
      id: 'week-change',
      severity: gained ? 'success' : 'warning',
      titleKey: gained ? 'insights.weekGainTitle' : 'insights.weekLossTitle',
      bodyKey: gained ? 'insights.weekGainBody' : 'insights.weekLossBody',
      bodyParams: {
        amount: Math.abs(weekBRLDelta),
        pct: Math.abs(weekChangePct).toFixed(1),
        currency: dominantCurrency,
      },
      impact: weekBRLDelta,
    });
  }

  // 2. 5% drop sensitivity
  if (dominantBRL > 0) {
    const dropImpact = dominantBRL * 0.05;
    insights.push({
      id: 'sensitivity',
      severity: dominantPct > 70 ? 'danger' : 'warning',
      titleKey: 'insights.sensitivityTitle',
      bodyKey: 'insights.sensitivityBody',
      bodyParams: { currency: dominantCurrency, pct: 5, amount: dropImpact },
      impact: -dropImpact,
    });
  }

  // 3. Concentration or diversification
  if (dominantPct >= 70) {
    insights.push({
      id: 'concentration',
      severity: 'warning',
      titleKey: 'insights.concentrationTitle',
      titleParams: { currency: dominantCurrency },
      bodyKey: 'insights.concentrationBody',
      bodyParams: { pct: dominantPct.toFixed(0), currency: dominantCurrency },
    });
  } else if (sorted.length > 1) {
    insights.push({
      id: 'diversified',
      severity: 'success',
      titleKey: 'insights.diversifiedTitle',
      bodyKey: 'insights.diversifiedBody',
      bodyParams: { count: sorted.length },
    });
  }

  // 4. Trend signal
  const recent7 = trend.slice(-7);
  const trendSlope = recent7[recent7.length - 1] - recent7[0];
  const trendPct = Math.abs(trendSlope / dominantRate) * 100;
  if (trendPct > 0.3) {
    const going_up = trendSlope > 0;
    insights.push({
      id: 'trend',
      severity: going_up ? 'info' : 'warning',
      titleKey: going_up ? 'insights.trendUpTitle' : 'insights.trendDownTitle',
      titleParams: { currency: dominantCurrency },
      bodyKey: going_up ? 'insights.trendUpBody' : 'insights.trendDownBody',
      bodyParams: { currency: dominantCurrency },
    });
  }

  return insights.slice(0, 4);
}

export function getWalletWeekChange(
  monthlyBRL: number,
  currency: string,
  currentRate: number
): { pct: number; brlDelta: number } {
  const seed = getDailySeed(currency);
  const trend = simulateTrend(currentRate, 14, seed);
  const rate7dAgo = trend[0];
  const pct = ((currentRate - rate7dAgo) / rate7dAgo) * 100;
  const brlDelta = monthlyBRL * (pct / 100);
  return { pct, brlDelta };
}
