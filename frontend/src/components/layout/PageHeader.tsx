import React, { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PrimaryAction {
  label: string;
  onClick: () => void;
  icon?: any;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: ReactNode;
  primaryAction?: PrimaryAction;
  badge?: { label: string; color: string };
}

export default function PageHeader({ 
  title, 
  subtitle, 
  breadcrumbs, 
  actions, 
  primaryAction,
  badge 
}: PageHeaderProps) {
  return (
    <div className="pb-4 mb-4 lg:pb-6 lg:mb-6 border-b border-border animate-in fade-in slide-in-from-top-2 duration-500">
      {/* Breadcrumb — hidden on mobile */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="hidden lg:flex items-center gap-1.5 text-xs text-text-muted mb-2 font-medium uppercase tracking-wider">
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={crumb.label}>
              {i > 0 && <ChevronRight className="w-3 h-3 text-slate-300" />}
              {crumb.href ? (
                <Link to={crumb.href} className="hover:text-accent transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-slate-400">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Title + actions row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2">
            <h1 className="text-xl lg:text-2xl font-bold text-text-primary tracking-tight leading-tight">
              {title}
            </h1>
            {badge && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${badge.color}`}>
                {badge.label}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs lg:text-sm text-text-secondary mt-1 truncate max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>

        {/* Actions Row */}
        {(actions || primaryAction) && (
          <div className="flex-shrink-0">
            {/* Show only primary action button on mobile */}
            <div className="lg:hidden">
              {primaryAction && (
                <button
                  onClick={primaryAction.onClick}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-accent text-white text-[10px] font-black uppercase tracking-widest min-h-[44px] transition-all active:scale-95 shadow-lg shadow-accent/20"
                >
                  {primaryAction.icon && (
                    <primaryAction.icon className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">{primaryAction.label}</span>
                  <span className="sm:hidden">New</span>
                </button>
              )}
            </div>
            {/* All actions on desktop */}
            <div className="hidden lg:flex items-center gap-2">
              {actions}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
