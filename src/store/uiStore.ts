import { create } from 'zustand';
import type { NavPage } from '../types';

interface UIStore {
  currentPage: NavPage;
  sidebarOpen: boolean;
  setPage: (page: NavPage) => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  currentPage: 'dashboard',
  sidebarOpen: true,
  setPage: (page) => set({ currentPage: page }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));
