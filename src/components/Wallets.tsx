import { useState } from 'react';
import { Plus, Trash2, Edit3, Check, X, DollarSign, Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useWalletStore } from '../store/walletStore';
import { useRatesStore } from '../store/ratesStore';
import { getRateToBRL } from '../hooks/useExchangeRates';
import { formatBRL, formatRate, currencyFlag, currencyName } from '../utils/formatters';
import { CURRENCY_VOLATILITY, getWalletWeekChange } from '../utils/insights';
import type { Currency, Wallet } from '../types';

const CURRENCIES: Currency[] = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'CHF'];

const VOL_COLORS = {
  low: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  medium: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  high: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
};

function WalletForm({ onSave, onCancel, initial }: {
  onSave: (data: Omit<Wallet, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  initial?: Wallet;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState(initial?.name ?? '');
  const [currency, setCurrency] = useState<Currency>(initial?.currency ?? 'USD');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [amount, setAmount] = useState(initial?.monthlyAmount.toString() ?? '');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount) return;
    onSave({ name, currency, description, monthlyAmount: parseFloat(amount) });
  };

  return (
    <form onSubmit={submit} className="bg-navy-800/80 border border-blue-500/30 rounded-2xl p-5 space-y-4 backdrop-blur-sm">
      <h3 className="font-display font-semibold text-white">
        {initial ? t('wallets.editWallet') : t('wallets.newWallet')}
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block font-body">{t('wallets.form.name')}</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('wallets.form.namePlaceholder')}
            className="w-full bg-navy-900 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm font-body placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors" required />
        </div>
        <div>
          <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block font-body">{t('wallets.form.currency')}</label>
          <select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)}
            className="w-full bg-navy-900 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm font-body focus:outline-none focus:border-blue-500 transition-colors">
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{currencyFlag(c)} {c} — {currencyName(c)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block font-body">{t('wallets.form.amount')} ({currency})</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="5000" min="0" step="0.01"
            className="w-full bg-navy-900 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors" required />
        </div>
        <div className="col-span-2">
          <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block font-body">{t('wallets.form.description')}</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('wallets.form.descriptionPlaceholder')}
            className="w-full bg-navy-900 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm font-body placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors" />
        </div>
      </div>
      <div className="flex gap-3 pt-1">
        <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-xl text-sm font-body font-medium transition-colors">
          <Check size={14} /> {t('wallets.form.save')}
        </button>
        <button type="button" onClick={onCancel} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-sm font-body font-medium transition-colors">
          <X size={14} /> {t('wallets.form.cancel')}
        </button>
      </div>
    </form>
  );
}

export function Wallets() {
  const { wallets, addWallet, removeWallet, updateWallet } = useWalletStore();
  const { rates } = useRatesStore();
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const handleAdd = (data: Omit<Wallet, 'id' | 'createdAt'>) => { addWallet(data); setShowForm(false); };
  const handleUpdate = (id: string, data: Omit<Wallet, 'id' | 'createdAt'>) => { updateWallet(id, data); setEditId(null); };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">{t('wallets.title')}</h1>
          <p className="text-slate-400 text-sm font-body mt-1">{t('wallets.subtitle')}</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-400 text-white rounded-xl text-sm font-body font-medium transition-colors shadow-lg shadow-blue-500/20">
          <Plus size={16} /> {t('wallets.newWallet')}
        </button>
      </div>

      {showForm && <WalletForm onSave={handleAdd} onCancel={() => setShowForm(false)} />}

      {wallets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <DollarSign size={28} className="text-slate-500" />
          </div>
          <p className="text-slate-400 font-body">{t('wallets.emptyTitle')}</p>
          <p className="text-slate-500 text-sm font-body mt-1">{t('wallets.emptySubtitle')}</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {wallets.map((wallet) => {
            if (editId === wallet.id) {
              return (
                <WalletForm key={wallet.id} initial={wallet}
                  onSave={(data) => handleUpdate(wallet.id, data)}
                  onCancel={() => setEditId(null)} />
              );
            }

            const brlRate = rates ? getRateToBRL(rates, wallet.currency) : 0;
            const brlValue = wallet.monthlyAmount * brlRate;
            const vol = CURRENCY_VOLATILITY[wallet.currency] ?? { level: 'medium', monthlyStd: 4 };
            const volLabel = t(`wallets.card.vol${vol.level.charAt(0).toUpperCase() + vol.level.slice(1)}`);
            const impact1pct = brlValue * 0.01;
            const weekChange = brlRate > 0 ? getWalletWeekChange(brlValue, wallet.currency, brlRate) : null;

            return (
              <div key={wallet.id}
                className="bg-navy-800/60 border border-white/5 rounded-2xl p-5 backdrop-blur-sm hover:border-white/10 transition-all group">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{currencyFlag(wallet.currency)}</div>
                    <div>
                      <h3 className="font-display font-semibold text-white">{wallet.name}</h3>
                      {wallet.description && <p className="text-xs text-slate-400 font-body mt-0.5">{wallet.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditId(wallet.id)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                      <Edit3 size={13} />
                    </button>
                    <button onClick={() => removeWallet(wallet.id)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Main value */}
                <div className="flex items-end justify-between py-3 border-t border-white/5">
                  <div>
                    <p className="text-xs text-slate-400 font-body">{t('wallets.card.brlEquiv')}</p>
                    <p className="font-mono text-2xl font-bold text-emerald-400 mt-0.5">{formatBRL(brlValue)}</p>
                  </div>
                  {weekChange && Math.abs(weekChange.brlDelta) > 1 && (
                    <div className={`text-right ${weekChange.brlDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      <p className="text-xs font-body text-slate-400">{t('wallets.card.weekChange')}</p>
                      <p className="font-mono text-sm font-semibold mt-0.5">
                        {weekChange.brlDelta >= 0 ? '+' : ''}{formatBRL(weekChange.brlDelta)}
                      </p>
                      <p className="text-xs font-mono opacity-70">
                        {weekChange.pct >= 0 ? '+' : ''}{weekChange.pct.toFixed(1)}%
                      </p>
                    </div>
                  )}
                </div>

                {/* Rate */}
                <div className="flex items-center justify-between py-2 border-t border-white/5">
                  <span className="text-xs text-slate-400 font-body">{t('wallets.card.currentRate')}</span>
                  <span className="font-mono text-xs text-slate-300">
                    1 {wallet.currency} = R$ {formatRate(brlRate)}
                  </span>
                </div>

                {/* Monthly in source currency */}
                <div className="flex items-center justify-between py-2 border-t border-white/5">
                  <span className="text-xs text-slate-400 font-body">{t('wallets.card.monthly')}</span>
                  <span className="font-mono text-sm text-white">
                    {wallet.currency} {wallet.monthlyAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Analysis row */}
                <div className="flex items-center gap-2 pt-3 border-t border-white/5 flex-wrap">
                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-body ${VOL_COLORS[vol.level]}`}>
                    <Activity size={10} />
                    {t('wallets.card.volatility')}: {volLabel}
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-body text-slate-300">
                    {t('wallets.card.impact1pct')}: <span className="font-mono text-amber-400 ml-1">{formatBRL(impact1pct)}</span>
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
