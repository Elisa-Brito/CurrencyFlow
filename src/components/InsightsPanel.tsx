import { AlertTriangle, TrendingDown, TrendingUp, Info, Shield, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useWalletStore } from '../store/walletStore';
import { useRatesStore } from '../store/ratesStore';
import { generateInsights, type Insight, type InsightSeverity } from '../utils/insights';
import { formatBRL } from '../utils/formatters';

const SEVERITY_CFG: Record<InsightSeverity, {
  icon: React.ElementType;
  bg: string;
  border: string;
  iconColor: string;
  dot: string;
}> = {
  danger: { icon: AlertTriangle, bg: 'bg-rose-500/8', border: 'border-rose-500/25', iconColor: 'text-rose-400', dot: 'bg-rose-400' },
  warning: { icon: TrendingDown, bg: 'bg-amber-500/8', border: 'border-amber-500/25', iconColor: 'text-amber-400', dot: 'bg-amber-400' },
  info: { icon: Info, bg: 'bg-blue-500/8', border: 'border-blue-500/25', iconColor: 'text-blue-400', dot: 'bg-blue-400' },
  success: { icon: TrendingUp, bg: 'bg-emerald-500/8', border: 'border-emerald-500/25', iconColor: 'text-emerald-400', dot: 'bg-emerald-400' },
};

function fmtParams(params: Record<string, string | number> | undefined): Record<string, string> {
  if (!params) return {};
  return Object.fromEntries(
    Object.entries(params).map(([k, v]) =>
      k === 'amount' && typeof v === 'number' ? [k, formatBRL(v)] : [k, String(v)]
    )
  );
}

export function InsightsPanel() {
  const { wallets } = useWalletStore();
  const { rates } = useRatesStore();
  const { t } = useTranslation();

  if (!rates) return null;

  const insights = generateInsights(wallets, rates);

  return (
    <div className="bg-navy-800/60 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display font-semibold text-white">{t('insights.title')}</h2>
          <p className="text-xs text-slate-400 font-body mt-0.5">{t('insights.subtitle')}</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <Zap size={11} className="text-blue-400" />
          <span className="text-xs font-mono text-blue-300">{insights.length} {t('insights.count')}</span>
        </div>
      </div>

      {insights.length === 0 ? (
        <div className="flex items-center gap-3 py-4">
          <Shield size={18} className="text-slate-500" />
          <p className="text-sm text-slate-400 font-body">{t('insights.noData')}</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {insights.map((insight: Insight) => {
            const cfg = SEVERITY_CFG[insight.severity];
            const Icon = cfg.icon;
            return (
              <div key={insight.id} className={`rounded-xl border p-4 ${cfg.bg} ${cfg.border}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-white/5 mt-0.5`}>
                    <Icon size={14} className={cfg.iconColor} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-display font-semibold mb-1 ${cfg.iconColor}`}>
                      {t(insight.titleKey, fmtParams(insight.titleParams))}
                    </p>
                    <p className="text-xs text-slate-300 font-body leading-relaxed">
                      {t(insight.bodyKey, fmtParams(insight.bodyParams))}
                    </p>
                    {insight.impact !== undefined && (
                      <div className={`mt-2 inline-flex items-center gap-1 text-xs font-mono font-semibold px-2 py-0.5 rounded-md ${
                        insight.impact >= 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                      }`}>
                        {insight.impact >= 0 ? '+' : ''}{formatBRL(insight.impact)}/mês
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
