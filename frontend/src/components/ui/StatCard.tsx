import { TrendingUp, TrendingDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState, useEffect } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; direction: 'up' | 'down'; label: string };
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple';
  onClick?: () => void;
}

const colorMap = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-500', border: 'border-blue-500' },
  green: { bg: 'bg-emerald-50', text: 'text-emerald-500', border: 'border-emerald-500' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-500', border: 'border-amber-500' },
  red: { bg: 'bg-red-50', text: 'text-red-500', border: 'border-red-500' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-500', border: 'border-purple-500' },
};

export default function StatCard({ label, value, icon: Icon, trend, color = 'blue', onClick }: StatCardProps) {
  const styles = colorMap[color];
  const [displayValue, setDisplayValue] = useState<string | number>(typeof value === 'number' ? 0 : value);

  useEffect(() => {
    if (typeof value !== 'number') return;
    
    let start = 0;
    const end = value;
    const duration = 800;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
      
      const current = Math.floor(start + (end - start) * easedProgress);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(end);
      }
    };

    requestAnimationFrame(animate);
  }, []); // Only on first mount

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-2xl p-6 shadow-sm border border-slate-100 border-l-4 ${styles.border} transition-all duration-300 group ${
        onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-1 transform' : ''
      }`}
    >
      <div className="flex justify-between items-start">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
        <div className={`p-2 rounded-xl ${styles.bg} ${styles.text} transition-transform duration-500 group-hover:rotate-12`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      
      <div className="mt-3">
        <h3 className="text-3xl font-semibold text-slate-900 tabular-nums tracking-tight">
          {typeof value === 'number' ? displayValue.toLocaleString() : value}
        </h3>
      </div>

      {trend && (
        <div className="flex items-center gap-1.5 mt-3">
          {trend.direction === 'up' ? (
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500" />
          )}
          <span className={`text-xs font-semibold uppercase tracking-wide ${trend.direction === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
            {trend.value}%
          </span>
          <span className="text-xs text-slate-500 ml-1">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
