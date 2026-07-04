/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Tokens semânticos — resolvem via CSS variables (ver index.css)
        bg: 'var(--bg)',
        panel: 'var(--panel)',
        'panel-alt': 'var(--panel-alt)',
        line: 'var(--line)',
        'line-soft': 'var(--line-soft)',
        'line-2': 'var(--line-2)',
        primary: 'var(--primary)',
        'primary-2': 'var(--primary-2)',
        purple: 'var(--purple)',
        pink: 'var(--pink)',
        amber: 'var(--amber)',
        destructive: 'var(--destructive)',
        text: 'var(--text)',
        'text-dim': 'var(--text-dim)',
        'text-faint': 'var(--text-faint)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,.04), 0 6px 16px rgba(15,23,42,.03)',
        result: '0 8px 24px rgba(37,99,235,.22)',
      },
    },
  },
  plugins: [],
};
