import { useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';

export const useComponentStyle = () => {
  const { theme } = useTheme();
  const styles = theme?.styles;

  return {
    // CARD styles
    card: useMemo(() => {
      const style = styles?.card || 'elevated';
      const base = 'bg-card-bg transition-all duration-300';
      const variants: Record<string, string> = {
        elevated: 'rounded-xl shadow-sm border border-border/50 hover:shadow-md',
        flat:     'rounded-xl border border-border',
        bordered: 'rounded-xl border-2 border-border',
        glass:    'bg-white/70 backdrop-blur-md rounded-xl border border-white/20 shadow-lg',
      };
      return `${base} ${variants[style] || variants.elevated}`;
    }, [styles?.card]),

    // BUTTON styles
    buttonBase: useMemo(() => {
      const style = styles?.button || 'rounded';
      const variants: Record<string, string> = {
        rounded: 'rounded-xl',
        pill:    'rounded-full',
        square:  'rounded-none',
      };
      return variants[style] || variants.rounded;
    }, [styles?.button]),

    // TABLE styles
    tableRow: useMemo(() => {
      const style = styles?.table || 'striped';
      const base = 'transition-colors duration-200';
      const variants: Record<string, string> = {
        striped:  'odd:bg-transparent even:bg-page-bg/40 hover:bg-accent/5',
        bordered: 'border-b border-border hover:bg-accent/5',
        clean:    'border-b border-border/30 hover:bg-page-bg/60',
      };
      return `${base} ${variants[style] || variants.striped}`;
    }, [styles?.table]),

    // SPACING density
    cardPadding: useMemo(() => {
      const density = styles?.density || 'default';
      const variants: Record<string, string> = {
        compact:     'p-3 sm:p-4',
        default:     'p-4 sm:p-6',
        comfortable: 'p-6 sm:p-8',
      };
      return variants[density] || variants.default;
    }, [styles?.density]),
  };
};
