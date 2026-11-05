'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { useEffect, useState } from 'react';

const ORDER = ['system', 'light', 'dark'] as const;
const NAMES = { system: 'Sistem', light: 'Açık', dark: 'Koyu' };

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [ready, setReady] = useState(false);

  useEffect(() => setReady(true), []);

  async function change() {
    const current = ORDER.includes(theme as (typeof ORDER)[number]) ? (theme as (typeof ORDER)[number]) : 'system';
    const next = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length];
    setTheme(next);
    await fetch('/api/theme', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: next }),
    }).catch(() => undefined);
  }

  const dark = ready && resolvedTheme === 'dark';
  const currentName = ready ? NAMES[(theme as keyof typeof NAMES) || 'system'] : 'Sistem';

  return (
    <button
      type="button"
      onClick={change}
      aria-label="Temayı değiştir"
      title={currentName}
      className="inline-flex h-11 w-11 items-center justify-center rounded-control text-ink"
    >
      {dark ? <Moon size={18} aria-hidden="true" /> : <Sun size={18} aria-hidden="true" />}
    </button>
  );
}
