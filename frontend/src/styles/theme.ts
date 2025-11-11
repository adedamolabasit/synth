export const theme = {
  colors: {
    primary: {
      navy: '#0f172a',
      charcoal: '#1e293b',
      slate: '#334155',
      lightSlate: '#475569',
    },
    accent: {
      blue: '#3b82f6',
      cyan: '#06b6d4',
      magenta: '#ec4899',
      purple: '#a855f7',
    },
    status: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#f43f5e',
      info: '#3b82f6',
    },
    glass: {
      bg: 'rgba(15, 23, 42, 0.7)',
      border: 'rgba(148, 163, 184, 0.1)',
      hover: 'rgba(15, 23, 42, 0.85)',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px',
  },
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '350ms cubic-bezier(0.4, 0, 0.2, 1)',
    spring: '500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  shadows: {
    glow: {
      blue: '0 0 20px rgba(59, 130, 246, 0.5)',
      cyan: '0 0 20px rgba(6, 182, 212, 0.5)',
      magenta: '0 0 20px rgba(236, 72, 153, 0.5)',
    },
    elevation: {
      low: '0 2px 8px rgba(0, 0, 0, 0.3)',
      medium: '0 4px 16px rgba(0, 0, 0, 0.4)',
      high: '0 8px 32px rgba(0, 0, 0, 0.5)',
    },
  },
  typography: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: '"Fira Code", "Cascadia Code", Consolas, monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    lineHeight: {
      tight: '1.2',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
};

export type Theme = typeof theme;
