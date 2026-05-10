import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  iconClassName?: string;
  containerClassName?: string;
  className?: string;
}

export default function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action,
  iconClassName = "text-slate-400",
  containerClassName = "bg-slate-100",
  className = "py-20"
}: EmptyStateProps) {
  return (
    <div className={`${className} flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500`}>
      <div className={`w-20 h-20 rounded-full ${containerClassName} flex items-center justify-center transition-transform hover:scale-110 duration-500`}>
        <Icon className={`w-8 h-8 ${iconClassName}`} />
      </div>
      
      <h3 className="text-lg font-semibold text-slate-900 mt-6 tracking-tight">
        {title}
      </h3>
      
      <p className="text-sm text-slate-700 mt-2 max-w-xs leading-relaxed">
        {description}
      </p>
      
      {action && (
        <button
          onClick={action.onClick}
          className="mt-8 px-8 py-3 bg-blue-500 text-white rounded-xl text-xs font-semibold uppercase tracking-wide hover:bg-blue-600 transition-all shadow-md active:scale-95"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
