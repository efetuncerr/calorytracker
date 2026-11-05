'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type ThemeChoice = 'light' | 'dark' | 'system';

const ThemeContext = createContext<{
  theme: ThemeChoice;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ThemeChoice) => void;
}>({
  theme: 'system',
  resolvedTheme: 'light',
  setTheme: () => undefined,
});

export function useTheme() {
  return useContext(ThemeContext);
}

function systemDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function apply(theme: ThemeChoice) {
  const dark = theme === 'dark' || (theme !== 'light' && systemDark());
  document.documentElement.classList.toggle('dark', dark);
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  return dark ? 'dark' : 'light';
}

export default function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeChoice>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const initial: ThemeChoice = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
    setThemeState(initial);
    setResolvedTheme(apply(initial));
    document.documentElement.classList.add('theme-ready');

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      const current = localStorage.getItem('theme');
      if (current === 'light' || current === 'dark') return;
      setResolvedTheme(apply('system'));
    };
    media.addEventListener('change', onChange);

    if (!stored) {
      fetch('/api/theme')
        .then(async (response) => {
          if (!response.ok) return;
          const data = await response.json();
          if (data.theme === 'light' || data.theme === 'dark' || data.theme === 'system') {
            localStorage.setItem('theme', data.theme);
            setThemeState(data.theme);
            setResolvedTheme(apply(data.theme));
          }
        })
        .catch(() => undefined);
    }

    return () => media.removeEventListener('change', onChange);
  }, []);

  function setTheme(next: ThemeChoice) {
    localStorage.setItem('theme', next);
    setThemeState(next);
    setResolvedTheme(apply(next));
  }

  return <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>{children}</ThemeContext.Provider>;
}
