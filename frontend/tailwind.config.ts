import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover:   'var(--color-primary-hover)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover:   'var(--color-accent-hover)',
          light:   'var(--color-accent-light)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          light:   'var(--color-success-light)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          light:   'var(--color-warning-light)',
        },
        danger: {
          DEFAULT: 'var(--color-danger)',
          light:   'var(--color-danger-light)',
        },
        sidebar: {
          bg:     'var(--color-sidebar-bg)',
          text:   'var(--color-sidebar-text)',
          active: 'var(--color-sidebar-active)',
          hover:  'var(--color-sidebar-hover)',
        },
        page:   { bg: 'var(--color-page-bg)' },
        card:   { bg: 'var(--color-card-bg)' },
        border: { DEFAULT: 'var(--color-border)' },
        text: {
          primary:   'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted:     'var(--color-text-muted)',
        },
      },
      fontFamily: {
        sans: ['var(--font-family)', 'sans-serif'],
      },
      fontSize: {
        base: 'var(--font-size-base)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      boxShadow: {
        card:       'var(--card-shadow)',
        'card-hover': 'var(--card-shadow-hover)',
      },
      width: {
        sidebar:           'var(--sidebar-width)',
        'sidebar-collapsed': 'var(--sidebar-collapsed-width)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'slide-up': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' }
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' }
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out forwards',
        'bounce-once': 'bounce 1s ease-in-out 1',
        'slide-up': 'slide-up 0.25s ease-out',
        'scale-in': 'scale-in 0.15s ease-out',
      }
    },
  },
  plugins: [],
} satisfies Config
