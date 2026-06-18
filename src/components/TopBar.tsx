import { RefreshCw, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useRatesStore } from '../store/ratesStore';
import { useExchangeRates, getDisplayRates } from '../hooks/useExchangeRates';
import { formatRate, formatDate } from '../utils/formatters';

export function TopBar() {
  const { rates, loading } = useRatesStore();
  const { refresh } = useExchangeRates();
  const { t, i18n } = useTranslation();

  const displayRates = rates ? getDisplayRates(rates) : [];
  const tickerItems = [...displayRates, ...displayRates];

  const toggleLang = () => {
    const next = i18n.language === 'pt-BR' ? 'en' : 'pt-BR';
    i18n.changeLanguage(next);
    localStorage.setItem('currencyflow-lang', next);
  };

  return (
    <header className="h-14 bg-navy-900 border-b border-white/5 flex items-center gap-4 px-4 shrink-0">
      {/* Live ticker */}
      <div className="flex-1 overflow-hidden relative">
        <div className="flex items-center gap-2">
          <span className="shrink-0 text-xs font-mono text-emerald-400 font-semibold tracking-widest uppercase">
            LIVE
          </span>
          <div className="overflow-hidden flex-1">
            <div className={`flex gap-8 ${loading ? 'opacity-50' : ''} animate-ticker whitespace-nowrap`}>
              {tickerItems.map((item, i) => (
                <span key={i} className="inline-flex items-center gap-2 text-sm font-mono shrink-0">
                  <span className="text-slate-400">{item.currency}/BRL</span>
                  <span className="text-white font-semibold">{formatRate(item.brl)}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-3 shrink-0">
        {rates && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Clock size={11} />
            <span>{t('topbar.updated')} {formatDate(rates.lastUpdated)}</span>
          </div>
        )}

        {/* Language toggle */}
        <button
          onClick={toggleLang}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-mono font-semibold transition-all"
          title={i18n.language === 'pt-BR' ? 'Switch to English' : 'Mudar para Português'}
        >
          {i18n.language === 'pt-BR' ? '🇧🇷 PT' : '🇺🇸 EN'}
        </button>

        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-medium transition-all"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          {t('topbar.refresh')}
        </button>
      </div>
    </header>
  );
}
