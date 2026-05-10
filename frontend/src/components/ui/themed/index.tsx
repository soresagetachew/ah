import React from 'react';

// --- THEMED CARD ---
export const ThemedCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-card-bg rounded-lg border border-border shadow-card hover:shadow-card-hover transition-all duration-200 ${className}`}>
    {children}
  </div>
);

// --- THEMED BUTTON ---
type ButtonVariant = 'primary' | 'accent' | 'success' | 'danger' | 'ghost' | 'outline';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/10',
  accent:  'bg-accent text-white hover:bg-accent-hover shadow-lg shadow-accent/10',
  success: 'bg-success text-white hover:opacity-90 shadow-lg shadow-success/10',
  danger:  'bg-danger text-white hover:opacity-90 shadow-lg shadow-danger/10',
  ghost:   'bg-transparent text-text-primary hover:bg-page-bg border border-transparent',
  outline: 'bg-transparent text-text-primary hover:bg-page-bg border border-border',
};

export const ThemedButton = ({ variant = 'primary', className = '', ...props }: ButtonProps) => (
  <button 
    className={`px-5 py-2.5 rounded-md text-xs font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${BUTTON_VARIANTS[variant]} ${className}`} 
    {...props} 
  />
);

// --- THEMED INPUT ---
export const ThemedInput = ({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input 
    className={`w-full bg-card-bg border border-border text-text-primary placeholder:text-text-muted rounded-md px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all duration-150 ${className}`} 
    {...props} 
  />
);
