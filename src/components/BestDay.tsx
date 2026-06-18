import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { CheckCircle, AlertCircle, Clock, TrendingUp, TrendingDown, Minus, ArrowUp, ArrowDown } from 'lucide-react';
import { useRatesStore } from '../store/ratesStore';
import { getRateToBRL } from '../hooks/useExchangeRates';
import { analyzeConversionSignal, simulateTrend, getDailySeed } from '../utils/calculators';
import { formatRate, currencyFlag } from '../utils/formatters';
import type { Currency } from '../types';

const CURRENCIES: Currency[] = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'CHF'];

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-navy-800 border border-white/10 rounded-xl p-3 shadow-xl">
      <p className="text-sm font-mono text-white">R$ {formatRate(payload[0].value)}</p>
    </div>
  );
};

export function BestDay() {
  const { rates } = useRatesStore();
  const { t } = useTranslation();
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('USD');

  const baseRate = rates ? getRateToBRL(rates, selectedCurrency) : 5.1;
  const seed = getDailySeed(selectedCurrency);
  const trendData = simulateTrend(baseRate, 14, seed);
  const signal = analyzeConversionSignal(trendData, selectedCurrency);

  const avg7d = trendData.slice(-7).reduce((a, b) => a + b, 0) / 7;
  const current = trendData[trendData.length - 1];
  const vsAvg7dPct = signal.vsAvg7dPct;
  const isAboveAvg = vsAvg7dPct >= 0;

  const chartData = trendData.map((rate, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (trendData.length - 1 - i));
    return {
      day: i === trendData.length - 1
        ? t('bestday.today')
        : d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      rate,
    };
  });

  const today = new Date().getDay();
  const weeklyPattern = [0.2, 0.4, 0.6, 0.8, 0.5, -0.3, -0.5];
  const dayLabels: string[] = t('bestday.days', { returnObjects: true }) as string[];
  const lineColor = signal.recommendation === 'convert' ? '#10b981' : signal.recommendation === 'wait' ? '#f43f5e' : '#3b82f6';

  const signalConfig = {
    convert: {
      icon: CheckCircle,
      label: t('bestday.convert'),
      description: t('bestday.convertDesc'),
      bg: 'bg-emerald-500/10 border-emerald-500/30',
      iconColor: 'text-emerald-400',
      badge: 'bg-emerald-500/20 text-emerald-300',
      windowKey: 'bestday.bestWindowGood',
    },
    wait: {
      icon: AlertCircle,
      label: t('bestday.wait'),
      description: signal.daysToWait
        ? t('bestday.waitDays_other', { count: signal.daysToWait })
        : t('bestday.fallTrend'),
      bg: 'bg-rose-500/10 border-rose-500/30',
      iconColor: 'text-rose-400',
      badge: 'bg-rose-500/20 text-rose-300',
      windowKey: 'bestday.bestWindowWait',
    },
    neutral: {
      icon: Clock,
      label: t('bestday.neutral'),
      description: t('bestday.neutralDesc'),
      bg: 'bg-amber-500/10 border-amber-500/30',
      iconColor: 'text-amber-400',
      badge: 'bg-amber-500/20 text-amber-300',
      windowKey: 'bestday.bestWindowNeutral',
    },
  };

  const cfg = signalConfig[signal.recommendation];
  const SignalIcon = cfg.icon;

  // vs 7-day average summary
  const vsAvgKey = Math.abs(vsAvg7dPct) < 0.05
    ? 'bestday.atAvg7d'
    : isAboveAvg ? 'bestday.aboveAvg7d' : 'bestday.belowAvg7d';

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">{t('bestday.title')}</h1>
        <p className="text-slate-400 text-sm font-body mt-1">{t('bestday.subtitle')}</p>
      </div>

      {/* Currency selector */}
      <div className="flex gap-2 flex-wrap">
        {CURRENCIES.map((c) => (
          <button key={c} onClick={() => setSelectedCurrency(c)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-body font-medium transition-all ${
              selectedCurrency === c
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
            }`}>
            <span>{currencyFlag(c)}</span>{c}
          </button>
        ))}
      </div>

      {/* vs 7-day average — prominent comparison */}
      <div className={`rounded-2xl border p-4 flex items-center gap-4 ${
        Math.abs(vsAvg7dPct) < 0.05 ? 'bg-slate-500/10 border-slate-500/20' :
        isAboveAvg ? 'bg-emerald-500/10 border-emerald-500/25' : 'bg-rose-500/10 border-rose-500/25'
      }`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          Math.abs(vsAvg7dPct) < 0.05 ? 'bg-slate-500/20' :
          isAboveAvg ? 'bg-emerald-500/20' : 'bg-rose-500/20'
        }`}>
          {Math.abs(vsAvg7dPct) < 0.05
            ? <Minus size={18} className="text-slate-400" />
            : isAboveAvg
            ? <ArrowUp size={18} className="text-emerald-400" />
            : <ArrowDown size={18} className="text-rose-400" />}
        </div>
        <div className="flex-1">
          <p className={`text-sm font-body font-medium ${
            Math.abs(vsAvg7dPct) < 0.05 ? 'text-slate-300' :
            isAboveAvg ? 'text-emerald-300' : 'text-rose-300'
          }`}>
            {t(vsAvgKey, { pct: Math.abs(vsAvg7dPct).toFixed(2) })}
          </p>
          <p className="text-xs text-slate-400 font-body mt-0.5">
            {t('bestday.vsAvg7d')}: {formatRate(avg7d)} · {t('bestday.currentRate')}: {formatRate(current)}
          </p>
        </div>
      </div>

      {/* Main signal card */}
      <div className={`rounded-2xl border p-6 backdrop-blur-sm ${cfg.bg}`}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-white/5">
            <SignalIcon size={24} className={cfg.iconColor} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="font-display font-bold text-white text-xl">{cfg.label}</h2>
              <span className={`text-xs px-2.5 py-1 rounded-lg font-mono ${cfg.badge}`}>
                {currencyFlag(selectedCurrency)} {selectedCurrency}/BRL
              </span>
            </div>
            <p className="text-slate-300 font-body text-sm">{cfg.description}</p>
            <p className="text-slate-400 font-body text-xs mt-1">
              {t(signal.reasonKey, signal.reasonParams ?? {})}
            </p>
          </div>
        </div>

        {/* Conversion window recommendation */}
        <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2">
          <span className="text-xs font-body text-slate-400">{t('bestday.bestWindowTitle')}:</span>
          <span className={`text-xs font-body font-medium ${cfg.iconColor}`}>{t(cfg.windowKey)}</span>
        </div>
      </div>

      {/* Trend chart */}
      <div className="bg-navy-800/60 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display font-semibold text-white">{t('bestday.trendTitle')}</h2>
            <p className="text-xs text-slate-400 font-body mt-0.5">
              {currencyFlag(selectedCurrency)} {selectedCurrency}/BRL — {t('bestday.trendSubtitle')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 font-body">{t('bestday.trendStrength')}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(signal.strength * 100, 100)}%` }} />
              </div>
              <span className="text-xs font-mono text-slate-300">{signal.strength.toFixed(2)}%</span>
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
            <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} interval={1} />
            <YAxis tickFormatter={(v) => formatRate(v)} tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={avg7d} stroke="#ffffff25" strokeDasharray="4 4"
              label={{ value: '7d avg', fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono', position: 'insideTopRight' }} />
            <Line type="monotone" dataKey="rate" stroke={lineColor} strokeWidth={2.5}
              dot={(props: any) => {
                const { cx, cy, index } = props;
                if (index === chartData.length - 1) {
                  return (
                    <g key={index}>
                      <circle cx={cx} cy={cy} r={5} fill={lineColor} />
                      <circle cx={cx} cy={cy} r={9} fill="none" stroke={lineColor} strokeWidth={1.5} opacity={0.4} />
                    </g>
                  );
                }
                return <g key={index} />;
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Weekly pattern */}
      <div className="bg-navy-800/60 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
        <h2 className="font-display font-semibold text-white mb-1">{t('bestday.weeklyTitle')}</h2>
        <p className="text-xs text-slate-400 font-body mb-5">
          {t('bestday.weeklySubtitle')} {selectedCurrency} {t('bestday.weeklySubtitle2')}
        </p>
        <div className="flex items-end gap-2 h-20">
          {weeklyPattern.map((score, i) => {
            const height = Math.abs(score) * 60 + 10;
            const isPositive = score >= 0;
            const isToday = (today === 0 ? 6 : today - 1) === i;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full rounded-t-lg transition-all duration-500 relative"
                  style={{
                    height: `${height}px`,
                    backgroundColor: isToday ? '#3b82f6' : isPositive ? '#10b98140' : '#f43f5e40',
                    border: isToday ? '1px solid #3b82f6' : 'none',
                  }}>
                  {isToday && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-blue-400 text-xs font-mono whitespace-nowrap">
                      {t('bestday.today')}
                    </div>
                  )}
                </div>
                <span className="text-xs font-mono text-slate-400">
                  {dayLabels[i] ?? ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-slate-500 font-body mt-4">{t('bestday.disclaimer')}</p>
      </div>
    </div>
  );
}
