import React, { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type ButtonHTMLAttributes, type SelectHTMLAttributes } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// DESIGN TOKENS — Single source of truth for Settings page
// ═══════════════════════════════════════════════════════════════════════════

// TYPOGRAPHY
export const TYPOGRAPHY = {
  pageTitle: 'text-xl font-semibold text-slate-900',
  sectionTitle: 'text-sm font-semibold text-slate-900',
  fieldLabel: 'text-xs font-medium text-slate-500',
  helperText: 'text-xs font-normal text-slate-400',
  inputValue: 'text-sm font-normal text-slate-900',
  tableHeader: 'text-xs font-semibold text-slate-400 uppercase tracking-wide',
  tableBody: 'text-sm font-normal text-slate-900',
  badgeText: 'text-xs font-medium',
  buttonTextPrimary: 'text-sm font-medium',
  buttonTextSmall: 'text-xs font-medium',
  errorMessage: 'text-xs font-normal text-red-600',
  sectionGroupLabel: 'text-[10px] font-bold text-slate-400 uppercase tracking-widest',
} as const;

// SPACING
export const SPACING = {
  cardPadding: 'p-5',
  cardGap: 'space-y-4',
  fieldGap: 'gap-1.5',
  formGap: 'space-y-4',
  sectionGap: 'space-y-5',
  iconGap: 'gap-2',
  rowGap: 'gap-3',
} as const;

// BORDER RADIUS
export const RADIUS = {
  card: 'rounded-xl',
  input: 'rounded-lg',
  button: 'rounded-lg',
  buttonSmall: 'rounded-md',
  badge: 'rounded-full',
  toggle: 'rounded-full',
} as const;

// HEIGHTS
export const HEIGHTS = {
  input: 'h-9',
  textarea: 'min-h-[80px]',
  button: 'h-9',
  buttonSmall: 'h-7',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

// Card - Standard settings card
interface CardProps {
  children: React.ReactNode;
  className?: string;
}
export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white border border-slate-200 rounded-xl p-5 shadow-none ${className}`}>
      {children}
    </div>
  );
}

// SectionTitle - Title for a section within a card
interface SectionTitleProps {
  children: React.ReactNode;
  className?: string;
}
export function SectionTitle({ children, className = '' }: SectionTitleProps) {
  return (
    <h3 className={`text-sm font-semibold text-slate-900 ${className}`}>
      {children}
    </h3>
  );
}

// FieldLabel - Label for form fields
interface FieldLabelProps {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}
export function FieldLabel({ children, htmlFor, className = '' }: FieldLabelProps) {
  return (
    <label htmlFor={htmlFor} className={`text-xs font-medium text-slate-500 ${className}`}>
      {children}
    </label>
  );
}

// HelperText - Helper/description text
interface HelperTextProps {
  children: React.ReactNode;
  className?: string;
}
export function HelperText({ children, className = '' }: HelperTextProps) {
  return (
    <p className={`text-xs font-normal text-slate-400 ${className}`}>
      {children}
    </p>
  );
}

// Input - Standard input field
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error = false, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`h-9 px-3 text-sm font-normal text-slate-900 border-slate-200 hover:border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all ${
          error ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : ''
        } ${className}`}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

// Textarea - Standard textarea
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', error = false, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`min-h-[80px] px-3 py-2 text-sm font-normal text-slate-900 border-slate-200 hover:border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none ${
          error ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : ''
        } ${className}`}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

// Select - Standard select field
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', error = false, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`h-9 px-3 text-sm font-normal text-slate-900 border-slate-200 hover:border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white ${
          error ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : ''
        } ${className}`}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = 'Select';

// Button - Primary button
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'small';
  isLoading?: boolean;
}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles = 'font-medium outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantStyles = {
      primary: 'h-9 bg-blue-500 hover:bg-blue-600 text-white rounded-lg',
      secondary: 'h-9 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg',
      danger: 'h-9 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg',
      small: 'h-7 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-xs',
    } as const;

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = 'Button';

// Badge - Status badge
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  className?: string;
}
export function Badge({ children, variant = 'neutral', className = '' }: BadgeProps) {
  const variantStyles = {
    success: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    warning: 'text-amber-600 bg-amber-50 border-amber-200',
    danger: 'text-red-600 bg-red-50 border-red-200',
    info: 'text-blue-600 bg-blue-50 border-blue-200',
    neutral: 'text-slate-600 bg-slate-50 border-slate-200',
  } as const;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}

// Divider - Section divider
export function Divider() {
  return <div className="border-t border-slate-100 my-5" />;
}

// Toggle - Toggle switch
interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
}
export function Toggle({ checked, onChange, disabled = false, label }: ToggleProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          checked ? 'bg-blue-500' : 'bg-slate-200'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
      {label && <span className="text-sm font-normal text-slate-900">{label}</span>}
    </label>
  );
}

// FormGroup - Wrapper for form field with label and helper
interface FormGroupProps {
  label?: string;
  helper?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}
export function FormGroup({ label, helper, error, children, className = '' }: FormGroupProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <FieldLabel>{label}</FieldLabel>}
      {children}
      {helper && !error && <HelperText>{helper}</HelperText>}
      {error && <p className="text-xs font-normal text-red-600">{error}</p>}
    </div>
  );
}

// SectionGroup - Group of related fields
interface SectionGroupProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}
export function SectionGroup({ title, children, className = '' }: SectionGroupProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {title && (
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {title}
        </p>
      )}
      {children}
    </div>
  );
}

// FieldRow - Horizontal row of fields
interface FieldRowProps {
  children: React.ReactNode;
  className?: string;
}
export function FieldRow({ children, className = '' }: FieldRowProps) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${className}`}>
      {children}
    </div>
  );
}
