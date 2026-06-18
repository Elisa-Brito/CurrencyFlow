import { LayoutDashboard, Wallet, TrendingUp, Target, CalendarCheck, ChevronLeft, SlidersHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '../store/uiStore';
import type { NavPage } from '../types';

const NAV_IDS: { id: NavPage; icon: React.ElementType }[] = [
  { id: 'dashboard', icon: LayoutDashboard },
  { id: 'wallets', icon: Wallet },
  { id: 'projections', icon: TrendingUp },
  { id: 'planning', icon: Target },
  { id: 'bestday', icon: CalendarCheck },
  { id: 'simulator', icon: SlidersHorizontal },
];

export function Sidebar() {
  const { currentPage, sidebarOpen, setPage, toggleSidebar } = useUIStore();
  const { t } = useTranslation();

  return (
    <aside className={`relative flex flex-col transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-60' : 'w-16'} shrink-0`}>
      <div className="flex flex-col h-full bg-navy-900 border-r border-white/5">
        <div className="flex items-center gap-3 px-4 h-16 border-b border-white/5">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shrink-0">
            <span className="text-white font-display font-bold text-sm">CF</span>
          </div>
          {sidebarOpen && (
            <span className="font-display font-bold text-white text-lg tracking-tight whitespace-nowrap">
              Currency<span className="text-blue-400">Flow</span>
            </span>
          )}
        </div>

        <nav className="flex flex-col gap-1 p-3 flex-1">
          {NAV_IDS.map(({ id, icon: Icon }) => {
            const active = currentPage === id;
            return (
              <button
                key={id}
                onClick={() => setPage(id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  active ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={18} className={`shrink-0 transition-colors ${active ? 'text-blue-400' : 'group-hover:text-white'}`} />
                {sidebarOpen && (
                  <span className="font-body text-sm font-medium whitespace-nowrap">{t(`nav.${id}`)}</span>
                )}
                {active && sidebarOpen && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />}
              </button>
            );
          })}
        </nav>

        <button
          onClick={toggleSidebar}
          className="flex items-center justify-center h-12 border-t border-white/5 text-slate-500 hover:text-white transition-colors"
        >
          <ChevronLeft size={16} className={`transition-transform duration-300 ${sidebarOpen ? '' : 'rotate-180'}`} />
        </button>
      </div>
    </aside>
  );
}
