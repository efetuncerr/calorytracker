'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';

export default function SifreSifirlaPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [resetUrl, setResetUrl] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    setResetUrl('');
    setLoading(true);
    const res = await fetch('/api/auth/forgot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || 'İstek tamamlanamadı');
      return;
    }
    setMessage(data.message);
    if (data.resetUrl) setResetUrl(data.resetUrl);
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-card border border-line bg-surface p-5 shadow-soft sm:p-6">
      <h2 className="text-xl font-semibold text-ink">Şifremi unuttum</h2>
      <p className="mt-1 mb-5 text-sm text-muted">
        E-postanı yaz. Kayıtlıysa 1 saat geçerli bir sıfırlama bağlantısı oluşturulur.
      </p>

      {error && (
        <p role="alert" className="mb-4 rounded-control bg-bg px-3 py-2 text-sm text-danger-text">
          {error}
        </p>
      )}
      {message && (
        <p className="mb-4 rounded-control bg-accent px-3 py-2 text-sm text-success-text">{message}</p>
      )}
      {resetUrl && (
        <Link
          href={resetUrl}
          className="mb-4 block rounded-control bg-primary-fill px-3 py-3 text-center text-sm font-semibold text-on-primary"
        >
          Yeni şifre belirle
        </Link>
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
        className="mb-5 h-12 w-full rounded-control border border-line px-3 text-base outline-none focus:border-primary"
        required
      />

      <button
        type="submit"
        disabled={loading}
        className="h-12 w-full rounded-control bg-primary-fill text-on-primary text-base font-semibold text-on-primary disabled:opacity-60"
      >
        {loading ? 'Hazırlanıyor...' : 'Sıfırlama bağlantısı oluştur'}
      </button>

      <p className="mt-5 text-center text-sm">
        <Link href="/giris" className="font-semibold text-success-text">
          Girişe dön
        </Link>
      </p>
    </form>
  );
}
