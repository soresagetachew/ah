import React from 'react';
import { useComponentStyle } from '../../../hooks/useComponentStyle';

// --- THEMED CARD ---
export const ThemedCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  const { card, cardPadding } = useComponentStyle();
  return (
    <div className={`${card} ${cardPadding} ${className}`}>
      {children}
    </div>
  );
};

// --- THEMED BUTTON ---
type ButtonVariant = 'primary' | 'accent' | 'success' | 'danger' | 'ghost' | 'outline';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export const ThemedButton = ({ variant = 'primary', className = '', ...props }: ButtonProps) => {
  const { buttonBase } = useComponentStyle();
  
  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/10',
    accent:  'bg-accent text-white hover:bg-accent-hover shadow-lg shadow-accent/10',
    success: 'bg-success text-white hover:opacity-90 shadow-lg shadow-success/10',
    danger:  'bg-danger text-white hover:opacity-90 shadow-lg shadow-danger/10',
    ghost:   'bg-transparent text-text-primary hover:bg-page-bg border border-transparent',
    outline: 'bg-transparent text-text-primary hover:bg-page-bg border border-border',
  };

  return (
    <button 
      className={`
        ${variants[variant]} 
        ${buttonBase} 
        px-5 py-2.5 text-xs font-black uppercase tracking-widest 
        transition-all active:scale-95 disabled:opacity-50 
        disabled:pointer-events-none focus:outline-none focus:ring-4 focus:ring-accent/10
        ${className}
      `} 
      {...props} 
    />
  );
};

// --- THEMED INPUT ---
export const ThemedInput = ({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) => {
  const { buttonBase } = useComponentStyle(); // Reusing buttonBase for rounding consistency
  return (
    <input 
      className={`
        w-full bg-card-bg border border-border text-text-primary 
        placeholder:text-text-muted ${buttonBase} px-4 py-2.5 
        text-sm font-bold focus:outline-none focus:ring-4 
        focus:ring-accent/10 focus:border-accent transition-all duration-150 
        ${className}
      `} 
      {...props} 
    />
  );
};

// --- THEMED TABLE ROW ---
export const ThemedTableRow = ({ children, className = '', ...props }: React.HTMLAttributes<HTMLTableRowElement>) => {
  const { tableRow } = useComponentStyle();
  return (
    <tr className={`${tableRow} ${className}`} {...props}>
      {children}
    </tr>
  );
};
