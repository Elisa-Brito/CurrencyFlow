import { useState, useMemo } from 'react';
import { RotateCcw, SlidersHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useWalletStore } from '../store/walletStore';
import { useRatesStore } from '../store/ratesStore';
import { getRateToBRL } from '../hooks/useExchangeRates';
import { formatBRL, formatRate, currencyFlag } from '../utils/formatters';

export function Simulator() {
  const { wallets } = useWalletStore();
  const { rates } = useRatesStore();
  const { t } = useTranslation();

  // Unique currencies from wallets
  const currencies = useMemo(
    () => [...new Set(wallets.map((w) => w.currency))],
    [wallets]
  );

  // Slider multipliers (1.0 = current rate)
  const [multipliers, setMultipliers] = useState<Record<string, number>>(() =>
    Object.fromEntries(currencies.map((c) => [c, 1.0]))
  );

  if (!rates) return null;

  const currentRates = Object.fromEntries(
    currencies.map((c) => [c, getRateToBRL(rates, c)])
  );

  const totalCurrent = wallets.reduce(
    (acc, w) => acc + w.monthlyAmount * (currentRates[w.currency] ?? 0),
    0
  );

  const totalSimulated = wallets.reduce(
    (acc, w) => acc + w.monthlyAmount * (currentRates[w.currency] ?? 0) * (multipliers[w.currency] ?? 1),
    0
  );

  const delta = totalSimulated - totalCurrent;
  const deltaPct = totalCurrent > 0 ? (delta / totalCurrent) * 100 : 0;

  const reset = () => setMultipliers(Object.fromEntries(currencies.map((c) => [c, 1.0])));

  if (wallets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <SlidersHorizontal size={32} className="text-slate-500 mb-4" />
        <p className="text-slate-400 font-body">{t('simulator.noWallets')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">{t('simulator.title')}</h1>
          <p className="text-slate-400 text-sm font-body mt-1">{t('simulator.subtitle')}</p>
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-sm font-body transition-colors"
        >
          <RotateCcw size={14} />
          {t('simulator.resetAll')}
        </button>
      </div>

      {/* Summary bar */}
      <div className={`rounded-2xl border p-5 transition-all ${
        Math.abs(delta) < 1 ? 'bg-navy-800/60 border-white/5' :
        delta > 0 ? 'bg-emerald-500/8 border-emerald-500/20' :
        'bg-rose-500/8 border-rose-500/20'
      }`}>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-xs text-slate-400 font-body uppercase tracking-wider mb-1">{t('simulator.totalCurrent')}</p>
            <p className="font-mono text-xl font-semibold text-white">{formatBRL(totalCurrent)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-body uppercase tracking-wider mb-1">{t('simulator.totalSimulated')}</p>
            <p className={`font-mono text-xl font-semibold ${
              Math.abs(delta) < 1 ? 'text-white' : delta > 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>{formatBRL(totalSimulated)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-body uppercase tracking-wider mb-1">{t('simulator.difference')}</p>
            <p className={`font-mono text-xl font-semibold ${
              Math.abs(delta) < 1 ? 'text-slate-400' : delta > 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {delta >= 0 ? '+' : ''}{formatBRL(delta)}
              <span className="text-sm ml-1 opacity-70">
                ({deltaPct >= 0 ? '+' : ''}{deltaPct.toFixed(1)}%)
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Currency sliders */}
      <div className="bg-navy-800/60 border border-white/5 rounded-2xl p-6 backdrop-blur-sm space-y-8">
        <p className="text-xs text-slate-400 font-body">{t('simulator.instructions')}</p>

        {currencies.map((currency) => {
          const currentRate = currentRates[currency] ?? 0;
          const mult = multipliers[currency] ?? 1;
          const simRate = currentRate * mult;
          const rateDeltaPct = (mult - 1) * 100;

          // Wallets for this currency
          const cWallets = wallets.filter((w) => w.currency === currency);
          const cCurrentBRL = cWallets.reduce((a, w) => a + w.monthlyAmount * currentRate, 0);
          const cSimBRL = cWallets.reduce((a, w) => a + w.monthlyAmount * simRate, 0);
          const cDelta = cSimBRL - cCurrentBRL;

          return (
            <div key={currency} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{currencyFlag(currency)}</span>
                  <span className="font-display font-semibold text-white">{currency}/BRL</span>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div>
                    <p className="text-xs text-slate-500 font-body">{t('simulator.currentRate')}</p>
                    <p className="font-mono text-sm text-slate-300">{formatRate(currentRate)}</p>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div>
                    <p className="text-xs text-slate-500 font-body">{t('simulator.simulatedRate')}</p>
                    <p className={`font-mono text-sm font-semibold ${
                      Math.abs(rateDeltaPct) < 0.1 ? 'text-white' : rateDeltaPct > 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {formatRate(simRate)}
                      <span className="text-xs ml-1 opacity-70">
                        ({rateDeltaPct >= 0 ? '+' : ''}{rateDeltaPct.toFixed(1)}%)
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <input
                type="range"
                min={0.7}
                max={1.3}
                step={0.005}
                value={mult}
                onChange={(e) =>
                  setMultipliers((prev) => ({ ...prev, [currency]: parseFloat(e.target.value) }))
                }
                className="w-full accent-blue-500 cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${
                    mult < 1 ? '#f43f5e' : '#3b82f6'
                  } ${((mult - 0.7) / 0.6) * 100}%, #1e293b ${((mult - 0.7) / 0.6) * 100}%)`,
                }}
              />

              <div className="flex justify-between text-xs font-mono text-slate-500">
                <span>−30%</span>
                <span className="text-slate-600">taxa atual</span>
                <span>+30%</span>
              </div>

              {/* Per-wallet impact for this currency */}
              <div className="space-y-2 pt-1">
                {cWallets.map((w) => {
                  const wCurrent = w.monthlyAmount * currentRate;
                  const wSim = w.monthlyAmount * simRate;
                  const wDelta = wSim - wCurrent;
                  return (
                    <div key={w.id} className="flex items-center justify-between bg-white/3 rounded-lg px-3 py-2">
                      <span className="text-xs text-slate-400 font-body truncate">{w.name}</span>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-mono text-slate-300">{formatBRL(wSim)}</span>
                        {Math.abs(wDelta) > 0.5 && (
                          <span className={`text-xs font-mono ${wDelta > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {wDelta > 0 ? '+' : ''}{formatBRL(wDelta)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {Math.abs(cDelta) > 0.5 && (
                <div className={`flex items-center justify-between text-xs font-mono px-3 py-2 rounded-lg ${
                  cDelta > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                }`}>
                  <span className="font-body">{t('simulator.walletImpact')}</span>
                  <span>{cDelta > 0 ? '+' : ''}{formatBRL(cDelta)}{t('simulator.perMonth')}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
