import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  subPositive?: boolean;
  icon?: ReactNode;
  accent?: 'blue' | 'emerald' | 'amber' | 'rose';
}

const accentClasses = {
  blue: 'from-blue-500/20 to-transparent border-blue-500/20',
  emerald: 'from-emerald-500/20 to-transparent border-emerald-500/20',
  amber: 'from-amber-500/20 to-transparent border-amber-500/20',
  rose: 'from-rose-500/20 to-transparent border-rose-500/20',
};

const iconAccent = {
  blue: 'bg-blue-500/20 text-blue-400',
  emerald: 'bg-emerald-500/20 text-emerald-400',
  amber: 'bg-amber-500/20 text-amber-400',
  rose: 'bg-rose-500/20 text-rose-400',
};

export function StatCard({ label, value, sub, subPositive, icon, accent = 'blue' }: StatCardProps) {
  return (
    <div
      className={`relative rounded-2xl border bg-gradient-to-br p-5 ${accentClasses[accent]} backdrop-blur-sm overflow-hidden`}
    >
      {/* Glow */}
      <div
        className={`absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-20 ${
          accent === 'blue' ? 'bg-blue-500' :
          accent === 'emerald' ? 'bg-emerald-500' :
          accent === 'amber' ? 'bg-amber-500' : 'bg-rose-500'
        }`}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-body text-slate-400 uppercase tracking-widest mb-2">{label}</p>
          <p className="font-mono text-2xl font-semibold text-white truncate">{value}</p>
          {sub && (
            <p className={`text-xs font-mono mt-1.5 ${subPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {sub}
            </p>
          )}
        </div>
        {icon && (
          <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${iconAccent[accent]}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
