import { DollarSign, TrendingUp, Wallet, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useWalletStore } from '../store/walletStore';
import { useRatesStore } from '../store/ratesStore';
import { getRateToBRL } from '../hooks/useExchangeRates';
import { calcProjection } from '../utils/calculators';
import { formatBRL, currencyFlag } from '../utils/formatters';
import { StatCard } from './StatCard';
import { InsightsPanel } from './InsightsPanel';

const CustomTooltip = ({ active, payload, label, t }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-navy-800 border border-white/10 rounded-xl p-3 shadow-xl">
      <p className="text-xs text-slate-400 mb-2 font-body">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="text-sm font-mono" style={{ color: p.color }}>
          {t(`dashboard.${p.name}`)}: {formatBRL(p.value)}
        </p>
      ))}
    </div>
  );
};

export function Dashboard() {
  const { wallets } = useWalletStore();
  const { rates, loading } = useRatesStore();
  const { t } = useTranslation();

  const totalBRL = wallets.reduce((acc, w) => {
    if (!rates) return acc;
    return acc + w.monthlyAmount * getRateToBRL(rates, w.currency);
  }, 0);

  const projections = calcProjection(totalBRL, 6, -5, 0, 5);

  const walletCountLabel = wallets.length === 1
    ? `1 ${t('dashboard.wallet')}`
    : `${wallets.length} ${t('dashboard.wallets_plural')}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-body">Carregando taxas de câmbio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">{t('dashboard.title')}</h1>
        <p className="text-slate-400 text-sm font-body mt-1">{t('dashboard.subtitle')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t('dashboard.totalIncome')}
          value={formatBRL(totalBRL)}
          sub={`${walletCountLabel} ${t('dashboard.active')}`}
          subPositive
          icon={<DollarSign size={18} />}
          accent="emerald"
        />
        <StatCard
          label={t('dashboard.optimisticScenario')}
          value={formatBRL(projections[6]?.optimistic ?? 0)}
          sub={t('dashboard.optimisticSub')}
          subPositive
          icon={<TrendingUp size={18} />}
          accent="blue"
        />
        <StatCard
          label={t('dashboard.activeWallets')}
          value={wallets.length.toString()}
          sub={wallets.map((w) => w.currency).join(', ')}
          subPositive
          icon={<Wallet size={18} />}
          accent="amber"
        />
        <StatCard
          label={t('dashboard.currencies')}
          value={[...new Set(wallets.map((w) => w.currency))].length.toString()}
          sub={t('dashboard.diversification')}
          subPositive
          icon={<Globe size={18} />}
          accent="rose"
        />
      </div>

      {/* Insights — most important section */}
      <InsightsPanel />

      {/* Projection chart */}
      <div className="bg-navy-800/60 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
        <h2 className="font-display font-semibold text-white mb-1">{t('dashboard.chartTitle')}</h2>
        <p className="text-xs text-slate-400 font-body mb-6">{t('dashboard.chartSubtitle')}</p>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={projections} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorOpt" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorNeut" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPess" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip t={t} />} />
            <Legend
              formatter={(v) => v === 'optimistic' ? t('dashboard.optimistic') : v === 'neutral' ? t('dashboard.neutral') : t('dashboard.pessimistic')}
              wrapperStyle={{ fontSize: 12, fontFamily: 'DM Sans' }}
            />
            <Area type="monotone" dataKey="optimistic" stroke="#10b981" fill="url(#colorOpt)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="neutral" stroke="#3b82f6" fill="url(#colorNeut)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="pessimistic" stroke="#f43f5e" fill="url(#colorPess)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Wallets composition */}
      <div className="bg-navy-800/60 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
        <h2 className="font-display font-semibold text-white mb-4">{t('dashboard.walletsTitle')}</h2>
        <div className="space-y-3">
          {wallets.map((w) => {
            const brl = rates ? w.monthlyAmount * getRateToBRL(rates, w.currency) : 0;
            const pct = totalBRL > 0 ? (brl / totalBRL) * 100 : 0;
            return (
              <div key={w.id} className="flex items-center gap-4">
                <span className="text-xl">{currencyFlag(w.currency)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-body text-white truncate">{w.name}</span>
                    <span className="text-sm font-mono text-emerald-400 shrink-0">{formatBRL(brl)}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <span className="text-xs font-mono text-slate-400 w-12 text-right shrink-0">{pct.toFixed(0)}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
