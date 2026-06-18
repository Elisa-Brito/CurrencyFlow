import { useState } from 'react';
import { Target, Calculator } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useWalletStore } from '../store/walletStore';
import { useRatesStore } from '../store/ratesStore';
import { getRateToBRL } from '../hooks/useExchangeRates';
import { calcMonthlySavingsNeeded } from '../utils/calculators';
import { formatBRL } from '../utils/formatters';

interface ScenarioResult {
  label: string;
  pct: number;
  monthly: number;
  color: string;
  bgColor: string;
}

function formatTimeframe(months: number, t: (key: string) => string): string {
  if (months >= 12) {
    const years = Math.floor(months / 12);
    const rem = months % 12;
    const yearsLabel = `${years} ${years === 1 ? t('planning.year') : t('planning.years')}`;
    if (rem > 0) return `${yearsLabel} ${t('planning.and')} ${rem} ${rem === 1 ? t('planning.month') : t('planning.months')}`;
    return yearsLabel;
  }
  return `${months} ${months === 1 ? t('planning.month') : t('planning.months')}`;
}

export function Planning() {
  const { wallets } = useWalletStore();
  const { rates } = useRatesStore();
  const { t } = useTranslation();
  const [targetAmount, setTargetAmount] = useState('100000');
  const [timeframeMonths, setTimeframeMonths] = useState('24');

  const totalBRL = wallets.reduce((acc, w) => {
    if (!rates) return acc;
    return acc + w.monthlyAmount * getRateToBRL(rates, w.currency);
  }, 0);

  const target = parseFloat(targetAmount) || 0;
  const months = parseInt(timeframeMonths) || 1;

  const scenarios: ScenarioResult[] = [
    {
      label: t('projections.pessimistic'),
      pct: -2,
      monthly: calcMonthlySavingsNeeded(target, months, -2),
      color: '#f43f5e',
      bgColor: 'bg-rose-500/10 border-rose-500/20',
    },
    {
      label: t('projections.neutral'),
      pct: 0,
      monthly: calcMonthlySavingsNeeded(target, months, 0),
      color: '#3b82f6',
      bgColor: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      label: t('projections.optimistic'),
      pct: 2,
      monthly: calcMonthlySavingsNeeded(target, months, 2),
      color: '#10b981',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20',
    },
  ];

  const walletCountLabel = wallets.length === 1
    ? `1 ${t('planning.wallet')}`
    : `${wallets.length} ${t('planning.wallets_plural')}`;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">{t('planning.title')}</h1>
        <p className="text-slate-400 text-sm font-body mt-1">{t('planning.subtitle')}</p>
      </div>

      {/* Goal form */}
      <div className="bg-navy-800/60 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <Target size={18} className="text-blue-400" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-white">{t('planning.goalTitle')}</h2>
            <p className="text-xs text-slate-400 font-body">{t('planning.goalSubtitle')}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block font-body">
              {t('planning.targetAmount')}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">R$</span>
              <input
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                min="0"
                step="1000"
                className="w-full bg-navy-900 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1.5 font-body">{formatBRL(target)}</p>
          </div>

          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block font-body">
              {t('planning.timeframe')}
            </label>
            <input
              type="number"
              value={timeframeMonths}
              onChange={(e) => setTimeframeMonths(e.target.value)}
              min="1"
              max="360"
              className="w-full bg-navy-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-blue-500 transition-colors"
            />
            <p className="text-xs text-slate-500 mt-1.5 font-body">{formatTimeframe(months, t)}</p>
          </div>
        </div>
      </div>

      {/* Current income context */}
      <div className="bg-navy-800/60 border border-white/5 rounded-2xl p-5 backdrop-blur-sm flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
          <Calculator size={18} className="text-emerald-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-slate-300 font-body">
            {t('planning.currentIncome')}{' '}
            <span className="font-mono text-emerald-400 font-semibold">{formatBRL(totalBRL)}</span>
          </p>
          <p className="text-xs text-slate-500 font-body mt-0.5">
            {t('planning.basedOnRates')} {walletCountLabel}
          </p>
        </div>
      </div>

      {/* Scenario results */}
      <div>
        <h2 className="font-display font-semibold text-white mb-4">{t('planning.howMuch')}</h2>
        <div className="grid grid-cols-3 gap-4">
          {scenarios.map((s) => {
            const savingsRatio = totalBRL > 0 ? (s.monthly / totalBRL) * 100 : 0;
            const feasible = s.monthly <= totalBRL;
            return (
              <div key={s.label} className={`rounded-2xl border p-5 backdrop-blur-sm ${s.bgColor}`}>
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="text-xs font-mono px-2 py-1 rounded-lg"
                    style={{ color: s.color, backgroundColor: `${s.color}20` }}
                  >
                    {s.pct >= 0 ? '+' : ''}{s.pct}%{t('projections.perMonth')}
                  </span>
                  <span className={`text-xs font-body ${feasible ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {feasible ? t('planning.feasible') : t('planning.aboveIncome')}
                  </span>
                </div>

                <p className="text-xs text-slate-400 font-body mb-1">{s.label}</p>
                <p className="font-mono text-2xl font-bold text-white mb-1">{formatBRL(s.monthly)}</p>
                <p className="text-xs font-body text-slate-400">{t('planning.perMonth')}</p>

                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-xs font-body text-slate-400">
                    <span>{t('planning.incomePercent')}</span>
                    <span style={{ color: s.color }}>{savingsRatio.toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(savingsRatio, 100)}%`, backgroundColor: s.color }}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5">
                  <p className="text-xs text-slate-400 font-body">
                    {t('planning.totalAccumulated')} {months} {t('planning.months')}
                  </p>
                  <p className="font-mono text-sm font-semibold mt-0.5" style={{ color: s.color }}>
                    {formatBRL(target)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insight */}
      <div className="bg-navy-800/60 border border-white/5 rounded-2xl p-5 backdrop-blur-sm">
        <h3 className="font-display font-semibold text-white mb-2">{t('planning.insightTitle')}</h3>
        <p className="text-sm text-slate-400 font-body leading-relaxed">
          {t('planning.insightText')}{' '}
          <span className="text-blue-400 font-mono font-semibold">{formatBRL(scenarios[1].monthly)}</span>
          {' '}{t('planning.insightText2')}{' '}
          {months}{' '}{t('planning.months')}{' '}
          {t('planning.insightText3')}{' '}
          <span className="text-white font-mono font-semibold">{formatBRL(target)}</span>.
          {totalBRL > 0 && (
            <>
              {' '}{t('planning.insightText4')}{' '}
              <span className="text-blue-400 font-mono font-semibold">
                {((scenarios[1].monthly / totalBRL) * 100).toFixed(0)}%
              </span>{' '}
              {t('planning.insightText5')}
            </>
          )}
        </p>
      </div>
    </div>
  );
}
