import { getMonthLabel } from './formatters';
import type { ProjectionPoint, ConversionSignal } from '../types';

export function calcProjection(
  monthlyBRL: number,
  months: number,
  pessimisticPct: number,
  neutralPct: number,
  optimisticPct: number
): ProjectionPoint[] {
  const points: ProjectionPoint[] = [];
  let pess = monthlyBRL;
  let neut = monthlyBRL;
  let opti = monthlyBRL;

  for (let i = 0; i <= months; i++) {
    points.push({
      month: getMonthLabel(i),
      pessimistic: Math.round(pess),
      neutral: Math.round(neut),
      optimistic: Math.round(opti),
    });
    pess *= 1 + pessimisticPct / 100;
    neut *= 1 + neutralPct / 100;
    opti *= 1 + optimisticPct / 100;
  }
  return points;
}

export function calcMonthlySavingsNeeded(
  targetBRL: number,
  months: number,
  monthlyChangePct: number
): number {
  if (months <= 0) return 0;
  if (monthlyChangePct === 0) return targetBRL / months;
  const r = monthlyChangePct / 100;
  const fvFactor = (Math.pow(1 + r, months) - 1) / r;
  return targetBRL / fvFactor;
}

// Deterministic seeded random — consistent per day/currency, no re-render flicker
function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

export function getDailySeed(currency: string): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate() + currency.charCodeAt(0) * 7;
}

export function simulateTrend(baseRate: number, days = 14, seed = 42): number[] {
  const trend: number[] = [baseRate];
  for (let i = 1; i < days; i++) {
    const rand = seededRandom(seed + i);
    const noise = (rand - 0.48) * baseRate * 0.005;
    trend.push(Math.max(0.01, trend[i - 1] + noise));
  }
  return trend;
}

export function analyzeConversionSignal(
  rates: number[],
  currency: string
): ConversionSignal & { reasonKey: string; reasonParams?: Record<string, string | number>; vsAvg7dPct: number } {
  if (rates.length < 2) {
    return { recommendation: 'neutral', reason: '', reasonKey: 'bestday.insufficient', trend: rates, strength: 0, vsAvg7dPct: 0 };
  }

  const recent = rates.slice(-7);
  const avg7d = recent.reduce((a, b) => a + b, 0) / recent.length;
  const last = recent[recent.length - 1];
  const prev = recent[recent.length - 2];
  const dayChange = ((last - prev) / prev) * 100;
  const vsAvg7dPct = ((last - avg7d) / avg7d) * 100;

  const changes = recent.slice(1).map((v, i) => v - recent[i]);
  const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
  const strength = Math.abs(avgChange / last) * 100;
  const isUpTrend = avgChange > 0;
  const isStrongTrend = strength > 0.1;

  if (isUpTrend && isStrongTrend && dayChange > 0) {
    const risingDays = changes.filter((c) => c > 0).length;
    return {
      recommendation: 'convert',
      reason: '',
      reasonKey: 'bestday.risingToday',
      reasonParams: { currency, days: risingDays, pct: dayChange.toFixed(2) },
      trend: recent,
      strength,
      vsAvg7dPct,
    };
  }

  if (!isUpTrend && isStrongTrend) {
    const daysToWait = Math.min(3, Math.round(Math.abs(avgChange / (avgChange || 0.01)))) || 2;
    return {
      recommendation: 'wait',
      reason: '',
      reasonKey: 'bestday.falling',
      reasonParams: { currency },
      daysToWait,
      trend: recent,
      strength,
      vsAvg7dPct,
    };
  }

  return { recommendation: 'neutral', reason: '', reasonKey: 'bestday.stableNeutral', trend: recent, strength, vsAvg7dPct };
}
