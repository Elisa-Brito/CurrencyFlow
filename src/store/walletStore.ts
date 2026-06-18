import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Wallet, Currency } from '../types';

interface WalletStore {
  wallets: Wallet[];
  addWallet: (wallet: Omit<Wallet, 'id' | 'createdAt'>) => void;
  removeWallet: (id: string) => void;
  updateWallet: (id: string, updates: Partial<Omit<Wallet, 'id' | 'createdAt'>>) => void;
}

const DEMO_WALLETS: Wallet[] = [
  {
    id: 'demo-1',
    name: 'Salário Principal',
    currency: 'USD' as Currency,
    description: 'Empresa americana — dev remoto',
    monthlyAmount: 5000,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    name: 'Freelance EU',
    currency: 'EUR' as Currency,
    description: 'Projetos de design europeus',
    monthlyAmount: 1200,
    createdAt: new Date().toISOString(),
  },
];

export const useWalletStore = create<WalletStore>()(
  persist(
    (set) => ({
      wallets: DEMO_WALLETS,
      addWallet: (data) =>
        set((state) => ({
          wallets: [
            ...state.wallets,
            { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
          ],
        })),
      removeWallet: (id) =>
        set((state) => ({ wallets: state.wallets.filter((w) => w.id !== id) })),
      updateWallet: (id, updates) =>
        set((state) => ({
          wallets: state.wallets.map((w) => (w.id === id ? { ...w, ...updates } : w)),
        })),
    }),
    { name: 'currencyflow-wallets' }
  )
);
