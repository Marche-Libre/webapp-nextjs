import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Background layers (white base)
        bg: {
          base: '#ffffff',
          elevated: '#f8fafc',
          surface: '#f1f5f9',
          'surface-2': '#e2e8f0',
        },

        // Primary — Blue
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          DEFAULT: '#3b82f6',
          glow: 'rgba(59, 130, 246, 0.15)',
        },

        // Text hierarchy
        text: {
          primary: '#0f172a',
          secondary: '#475569',
          muted: '#94a3b8',
          disabled: '#cbd5e1',
        },

        // Border
        border: {
          subtle: 'rgba(0, 0, 0, 0.04)',
          default: 'rgba(0, 0, 0, 0.08)',
          strong: 'rgba(0, 0, 0, 0.15)',
          primary: 'rgba(59, 130, 246, 0.4)',
        },

        // Status colors
        success: {
          DEFAULT: '#22c55e',
          bg: 'rgba(34, 197, 94, 0.08)',
        },
        warning: {
          DEFAULT: '#f59e0b',
          bg: 'rgba(245, 158, 11, 0.08)',
        },
        error: {
          DEFAULT: '#ef4444',
          bg: 'rgba(239, 68, 68, 0.08)',
        },
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },

      fontSize: {
        xs: ['11px', { lineHeight: '16px' }],
        sm: ['13px', { lineHeight: '20px' }],
        base: ['15px', { lineHeight: '24px' }],
        lg: ['17px', { lineHeight: '28px' }],
        xl: ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
        '4xl': ['36px', { lineHeight: '44px' }],
        '5xl': ['48px', { lineHeight: '56px' }],
        '6xl': ['60px', { lineHeight: '68px' }],
      },

      spacing: {
        // 4px base unit system
        0.5: '2px',
        1: '4px',
        1.5: '6px',
        2: '8px',
        2.5: '10px',
        3: '12px',
        3.5: '14px',
        4: '16px',
        5: '20px',
        6: '24px',
        7: '28px',
        8: '32px',
        9: '36px',
        10: '40px',
        11: '44px',
        12: '48px',
        14: '56px',
        16: '64px',
        20: '80px',
        24: '96px',
        28: '112px',
        32: '128px',
        36: '144px',
        40: '160px',
        44: '176px',
        48: '192px',
        52: '208px',
        56: '224px',
        60: '240px',
        64: '256px',
        72: '288px',
        80: '320px',
        96: '384px',
      },

      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        '3xl': '32px',
        full: '9999px',
      },

      boxShadow: {
        // Card elevation
        card: '0 1px 3px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)',
        'card-hover':
          '0 4px 12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.06)',

        // Glow effects
        'glow-primary':
          '0 0 20px rgba(59, 130, 246, 0.15), 0 0 40px rgba(59, 130, 246, 0.05)',
        'glow-primary-sm': '0 0 10px rgba(59, 130, 246, 0.12)',

        // Focus ring
        focus: '0 0 0 3px rgba(59, 130, 246, 0.3)',

        // Modal
        modal: '0 25px 60px rgba(0, 0, 0, 0.15)',
      },

      animation: {
        'slide-up': 'slide-up 0.25s ease-out',
        'fade-in': 'fade-in 0.15s ease-out',
        shimmer: 'shimmer 1.5s ease-in-out infinite',
      },

      keyframes: {
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },

      transitionDuration: {
        fast: '100ms',
        base: '150ms',
        moderate: '250ms',
        slow: '400ms',
        crawl: '600ms',
      },

      maxWidth: {
        content: '1200px',
        prose: '65ch',
      },

      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },

      backdropBlur: {
        xs: '2px',
        sm: '4px',
        DEFAULT: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
    },
  },
  plugins: [],
}

export default config
