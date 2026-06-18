import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts';
import { useWalletStore } from '../store/walletStore';
import { useRatesStore } from '../store/ratesStore';
import { getRateToBRL } from '../hooks/useExchangeRates';
import { calcProjection } from '../utils/calculators';
import { formatBRL } from '../utils/formatters';

const CustomTooltip = ({ active, payload, label, t }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-navy-800 border border-white/10 rounded-xl p-3 shadow-xl min-w-[180px]">
      <p className="text-xs text-slate-400 mb-2 font-body">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="text-sm font-mono" style={{ color: p.color }}>
          {p.name === 'optimistic' ? t('projections.optimistic') :
           p.name === 'neutral' ? t('projections.neutral') :
           t('projections.pessimistic')}:{' '}
          {formatBRL(p.value)}
        </p>
      ))}
    </div>
  );
};

function SliderRow({ label, value, onChange, color, suffix }: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  color: string;
  suffix: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
      <span className="text-sm font-body text-slate-300 w-24 shrink-0">{label}</span>
      <input
        type="range"
        min={-10}
        max={10}
        step={0.5}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1 accent-blue-500"
      />
      <span className="font-mono text-sm w-20 text-right shrink-0" style={{ color }}>
        {value >= 0 ? '+' : ''}{value}%{suffix}
      </span>
    </div>
  );
}

export function Projections() {
  const { wallets } = useWalletStore();
  const { rates } = useRatesStore();
  const { t } = useTranslation();
  const [pessimistic, setPessimistic] = useState(-5);
  const [neutral, setNeutral] = useState(0);
  const [optimistic, setOptimistic] = useState(5);

  const totalBRL = wallets.reduce((acc, w) => {
    if (!rates) return acc;
    return acc + w.monthlyAmount * getRateToBRL(rates, w.currency);
  }, 0);

  const data = calcProjection(totalBRL, 6, pessimistic, neutral, optimistic);
  const last = data[data.length - 1];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">{t('projections.title')}</h1>
        <p className="text-slate-400 text-sm font-body mt-1">{t('projections.subtitle')}</p>
      </div>

      {/* Scenario sliders */}
      <div className="bg-navy-800/60 border border-white/5 rounded-2xl p-6 backdrop-blur-sm space-y-5">
        <h2 className="font-display font-semibold text-white">{t('projections.configTitle')}</h2>
        <SliderRow label={t('projections.pessimistic')} value={pessimistic} onChange={setPessimistic} color="#f43f5e" suffix={t('projections.perMonth')} />
        <SliderRow label={t('projections.neutral')} value={neutral} onChange={setNeutral} color="#3b82f6" suffix={t('projections.perMonth')} />
        <SliderRow label={t('projections.optimistic')} value={optimistic} onChange={setOptimistic} color="#10b981" suffix={t('projections.perMonth')} />
      </div>

      {/* Chart */}
      <div className="bg-navy-800/60 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
        <h2 className="font-display font-semibold text-white mb-1">{t('projections.chartTitle')}</h2>
        <p className="text-xs text-slate-400 font-body mb-6">{t('projections.chartSubtitle')}</p>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip t={t} />} />
            <Legend
              formatter={(v) =>
                v === 'optimistic' ? t('projections.optimistic') :
                v === 'neutral' ? t('projections.neutral') :
                t('projections.pessimistic')
              }
              wrapperStyle={{ fontSize: 12, fontFamily: 'DM Sans' }}
            />
            <ReferenceLine y={totalBRL} stroke="#ffffff20" strokeDasharray="4 4" label={{ value: 'Atual', fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
            <Line type="monotone" dataKey="optimistic" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', strokeWidth: 0, r: 3 }} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="neutral" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: '#3b82f6', strokeWidth: 0, r: 3 }} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="pessimistic" stroke="#f43f5e" strokeWidth={2.5} dot={{ fill: '#f43f5e', strokeWidth: 0, r: 3 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { key: 'pessimistic', label: t('projections.pessimistic'), color: 'rose', value: last?.pessimistic ?? 0, pct: pessimistic },
          { key: 'neutral', label: t('projections.neutral'), color: 'blue', value: last?.neutral ?? 0, pct: neutral },
          { key: 'optimistic', label: t('projections.optimistic'), color: 'emerald', value: last?.optimistic ?? 0, pct: optimistic },
        ].map(({ key, label, color, value, pct }) => {
          const delta = value - totalBRL;
          const deltaColor = delta >= 0 ? 'text-emerald-400' : 'text-rose-400';
          return (
            <div key={key} className="bg-navy-800/60 border border-white/5 rounded-2xl p-5 backdrop-blur-sm">
              <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-mono mb-3 ${
                color === 'rose' ? 'bg-rose-500/10 text-rose-400' :
                color === 'blue' ? 'bg-blue-500/10 text-blue-400' :
                'bg-emerald-500/10 text-emerald-400'
              }`}>
                {pct >= 0 ? '+' : ''}{pct}%{t('projections.perMonth')}
              </div>
              <p className="text-xs text-slate-400 font-body mb-1">{label} — {t('projections.month6')}</p>
              <p className="font-mono text-xl font-semibold text-white">{formatBRL(value)}</p>
              <p className={`text-xs font-mono mt-1 ${deltaColor}`}>
                {delta >= 0 ? '+' : ''}{formatBRL(delta)} {t('projections.vsToday')}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
