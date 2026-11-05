'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export const COOKIE_OK = 'almina-cookie-ok';

export function cookieAccepted() {
  return localStorage.getItem(COOKIE_OK) === '1';
}

export default function CookieNotice() {
  const [open, setOpen] = useState(false);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (!cookieAccepted()) setOpen(true);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]" role="dialog" aria-modal="true" aria-labelledby="cookie-title">
      <div className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-card bg-surface p-5 shadow-soft sm:p-6">
        <h2 id="cookie-title" className="font-display text-h3">Çerezler</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Girişte seni hatırlamak için zorunlu bir oturum çerezi kullanılır. Reklam veya takip çerezi yok. Onaylamadan giriş yapılamaz.
        </p>
        {denied && <p className="mt-3 text-sm text-danger-text">Oturum çerezi olmadan giriş yapılamaz.</p>}
        <div className="mt-5 flex flex-col-reverse gap-2 min-[420px]:flex-row">
          <Button type="button" variant="secondary" className="flex-1" onClick={() => setDenied(true)}>
            Reddet
          </Button>
          <Button
            type="button"
            className="flex-1"
            onClick={() => {
              localStorage.setItem(COOKIE_OK, '1');
              setOpen(false);
            }}
          >
            Kabul et
          </Button>
        </div>
      </div>
    </div>
  );
}
