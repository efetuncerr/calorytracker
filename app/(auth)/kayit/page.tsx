'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function KayitPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || 'Kayıt tamamlanamadı');
      return;
    }
    router.push('/giris?yeni=1');
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-card border border-line bg-surface p-5 shadow-soft sm:p-6">
      <h2 className="text-xl font-semibold text-ink">Kayıt ol</h2>
      <p className="mt-1 mb-5 text-sm text-muted">Birkaç saniyede hesap aç</p>

      {error && (
        <p role="alert" className="mb-4 rounded-control bg-bg px-3 py-2 text-sm text-danger-text">
          {error}
        </p>
      )}

      <label className="mb-1 block text-sm font-medium text-ink" htmlFor="name">
        Ad
      </label>
      <input
        id="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mb-4 h-12 w-full rounded-control border border-line px-3 text-base outline-none focus:border-primary"
        required
      />

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
        autoComplete="new-password"
        minLength={8}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mb-1 h-12 w-full rounded-control border border-line px-3 text-base outline-none focus:border-primary"
        required
      />
      <p className="mb-5 text-xs text-muted">En az 8 karakter</p>

      <button
        type="submit"
        disabled={loading}
        className="h-12 w-full rounded-control bg-primary-fill text-on-primary text-base font-semibold text-on-primary disabled:opacity-60"
      >
        {loading ? 'Kaydediliyor...' : 'Hesap oluştur'}
      </button>

      <p className="mt-5 text-center text-sm text-muted">
        Zaten hesabın var mı?{' '}
        <Link href="/giris" className="font-semibold text-success-text">
          Giriş yap
        </Link>
      </p>
    </form>
  );
}
