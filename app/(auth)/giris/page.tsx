'use client';

import { FormEvent, Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { cookieAccepted } from '@/components/cookie-notice';

function GirisForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const registered = params.get('yeni') === '1';
  const resetDone = params.get('sifre') === '1';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!cookieAccepted()) {
      setError('Devam etmek için çerez onayını kabul et.');
      return;
    }
    setError('');
    setLoading(true);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || 'E-posta veya şifre hatalı');
      return;
    }
    router.push(params.get('next') || '/dashboard');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-card border border-line bg-surface p-5 shadow-soft sm:p-6">
      <h2 className="text-xl font-semibold text-ink">Giriş yap</h2>
      <p className="mt-1 mb-5 text-sm text-muted">Hesabınla devam et</p>

      {registered && (
        <p className="mb-4 rounded-control bg-accent px-3 py-2 text-sm text-success-text">
          Hesabın oluşturuldu. Giriş yapabilirsin.
        </p>
      )}
      {resetDone && (
        <p className="mb-4 rounded-control bg-accent px-3 py-2 text-sm text-success-text">
          Şifren güncellendi. Giriş yapabilirsin.
        </p>
      )}
      {error && (
        <p role="alert" className="mb-4 rounded-control bg-bg px-3 py-2 text-sm text-danger-text">
          {error}
        </p>
      )}

      <label className="mb-1 block text-sm font-medium text-ink" htmlFor="email">
        E-posta
      </label>
      <input
        id="email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mb-4 h-12 w-full rounded-control border border-line px-3 text-base outline-none focus:border-primary"
        required
      />

      <label className="mb-1 block text-sm font-medium text-ink" htmlFor="password">
        Şifre
      </label>
      <input
        id="password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mb-2 h-12 w-full rounded-control border border-line px-3 text-base outline-none focus:border-primary"
        required
      />
      <div className="mb-5 text-right">
        <Link href="/sifre-sifirla" className="text-sm font-medium text-success-text">
          Şifremi unuttum
        </Link>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="h-12 w-full rounded-control bg-primary-fill text-on-primary text-base font-semibold text-on-primary disabled:opacity-60"
      >
        {loading ? 'Giriş yapılıyor...' : 'Giriş yap'}
      </button>

      <p className="mt-5 text-center text-sm text-muted">
        Hesabın yok mu?{' '}
        <Link href="/kayit" className="font-semibold text-success-text">
          Kayıt ol
        </Link>
      </p>
    </form>
  );
}

export default function GirisPage() {
  return (
    <Suspense>
      <GirisForm />
    </Suspense>
  );
}
