// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL DESIGN TOKENS — Single source of truth for the entire platform
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

// COLORS
export const COLORS = {
  primary: {
    bg: 'bg-blue-500',
    hover: 'hover:bg-blue-600',
    text: 'text-blue-500',
    light: 'bg-blue-50',
  },
  success: {
    bg: 'bg-emerald-500',
    text: 'text-emerald-600',
    light: 'bg-emerald-50',
  },
  warning: {
    bg: 'bg-amber-500',
    text: 'text-amber-600',
    light: 'bg-amber-50',
  },
  danger: {
    bg: 'bg-red-500',
    text: 'text-red-600',
    light: 'bg-red-50',
  },
  neutral: {
    bg: 'bg-slate-500',
    text: 'text-slate-600',
    light: 'bg-slate-50',
  },
} as const;
