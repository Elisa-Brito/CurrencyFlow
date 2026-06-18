import { useExchangeRates } from './hooks/useExchangeRates';
import { useUIStore } from './store/uiStore';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { Dashboard } from './components/Dashboard';
import { Wallets } from './components/Wallets';
import { Projections } from './components/Projections';
import { Planning } from './components/Planning';
import { BestDay } from './components/BestDay';
import { Simulator } from './components/Simulator';

export default function App() {
  useExchangeRates();
  const { currentPage } = useUIStore();

  const pages = {
    dashboard: <Dashboard />,
    wallets: <Wallets />,
    projections: <Projections />,
    planning: <Planning />,
    bestday: <BestDay />,
    simulator: <Simulator />,
  };

  return (
    <div className="flex h-screen bg-navy-950 overflow-hidden font-body">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {pages[currentPage]}
        </main>
      </div>
    </div>
  );
}
