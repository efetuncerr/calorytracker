'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function YeniSifrePage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await fetch('/api/auth/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: params.token, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || 'Şifre güncellenemedi');
      return;
    }
    router.push('/giris?sifre=1');
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-card border border-line bg-surface p-5 shadow-soft sm:p-6">
      <h2 className="text-xl font-semibold text-ink">Yeni şifre</h2>
      <p className="mt-1 mb-5 text-sm text-muted">En az 8 karakterlik yeni bir şifre seç.</p>

      {error && (
        <p role="alert" className="mb-4 rounded-control bg-bg px-3 py-2 text-sm text-danger-text">
          {error}
        </p>
      )}

      <label className="mb-1 block text-sm font-medium text-ink" htmlFor="password">
        Yeni şifre
      </label>
      <input
        id="password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mb-5 h-12 w-full rounded-control border border-line px-3 text-base outline-none focus:border-primary"
        required
      />

      <button
        type="submit"
        disabled={loading}
        className="h-12 w-full rounded-control bg-primary-fill text-on-primary text-base font-semibold text-on-primary disabled:opacity-60"
      >
        {loading ? 'Kaydediliyor...' : 'Şifreyi güncelle'}
      </button>

      <p className="mt-5 text-center text-sm">
        <Link href="/giris" className="font-semibold text-success-text">
          Girişe dön
        </Link>
      </p>
    </form>
  );
}
