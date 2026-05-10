import { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: ReactNode;
  badge?: { label: string; color: string };
}

export default function PageHeader({ title, subtitle, breadcrumbs, actions, badge }: PageHeaderProps) {
  return (
    <div className="pb-6 mb-6 border-b border-slate-200 animate-in fade-in slide-in-from-top-2 duration-500">
      {/* Breadcrumb Row */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide mb-2 text-slate-500">
          {breadcrumbs.map((bc, i) => (
            <div key={i} className="flex items-center gap-2">
              {i > 0 && <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />}
              {bc.href ? (
                <Link to={bc.href} className="hover:text-blue-600 transition-colors">
                  {bc.label}
                </Link>
              ) : (
                <span className="text-slate-400 font-medium">{bc.label}</span>
              )}
            </div>
          ))}
        </nav>
      )}

      {/* Main Row */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2">
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">{title}</h1>
            {badge && (
              <span role="status" aria-label={`Status: ${badge.label}`} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${badge.color}`}>
                {badge.label}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-slate-700 mt-1 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* Actions Row */}
        {actions && (
          <div className="flex flex-wrap items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
