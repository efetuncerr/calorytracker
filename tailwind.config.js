/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        ink: 'var(--color-ink)',
        muted: 'var(--color-muted)',
        primary: 'var(--color-primary)',
        'primary-hover': 'var(--color-primary-hover)',
        'primary-fill': 'var(--color-primary-fill)',
        'primary-fill-hover': 'var(--color-primary-fill-hover)',
        'on-primary': 'var(--color-on-primary)',
        accent: 'var(--color-accent)',
        line: 'var(--color-line)',
        success: 'var(--color-success)',
        'success-text': 'var(--color-success-text)',
        warning: 'var(--color-warning)',
        'warning-text': 'var(--color-warning-text)',
        danger: 'var(--color-danger)',
        'danger-text': 'var(--color-danger-text)',
        kcal: 'var(--macro-kcal)',
        protein: 'var(--macro-protein)',
        carb: 'var(--macro-carb)',
        fat: 'var(--macro-fat)',
      },
      fontFamily: {
        sans: ['var(--font-body)', 'Inter', 'sans-serif'],
        display: ['var(--font-display)', 'Nunito', 'sans-serif'],
      },
      fontSize: {
        body: ['1rem', { lineHeight: '1.6' }],
        h3: ['1.125rem', { lineHeight: '1.3', fontWeight: '700' }],
        h2: ['1.375rem', { lineHeight: '1.25', fontWeight: '700' }],
        h1: ['1.75rem', { lineHeight: '1.2', fontWeight: '700' }],
      },
      borderRadius: {
        card: '16px',
        control: '12px',
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
      },
      spacing: {
        5: '1.25rem',
      },
    },
  },
  plugins: [],
};
