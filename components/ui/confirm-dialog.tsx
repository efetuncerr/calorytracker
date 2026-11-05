'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';

type Ask = {
  title: string;
  text: string;
  confirmLabel?: string;
};

export function useConfirm() {
  const [ask, setAsk] = useState<(Ask & { done: (ok: boolean) => void }) | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  function askConfirm(options: Ask) {
    return new Promise<boolean>((resolve) => {
      setAsk({ ...options, done: resolve });
    });
  }

  function close(ok: boolean) {
    ask?.done(ok);
    setAsk(null);
  }

  const dialog = mounted && ask ? createPortal(<ConfirmDialog {...ask} onClose={close} />, document.body) : null;
  return { askConfirm, dialog };
}

function ConfirmDialog({
  title,
  text,
  confirmLabel = 'Sil',
  onClose,
}: Ask & { onClose: (ok: boolean) => void }) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))]" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <button type="button" className="absolute inset-0 bg-ink/50" aria-label="İptal" onClick={() => onClose(false)} />
      <div className="relative max-h-[calc(100dvh-2rem)] w-full max-w-sm overflow-y-auto rounded-card border border-line bg-surface p-5 shadow-soft sm:p-6">
        <h2 id="confirm-title" className="font-display text-h3 text-ink">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
        <div className="mt-5 flex flex-col-reverse gap-2 min-[420px]:flex-row">
          <Button type="button" variant="secondary" className="min-h-11 flex-1" onClick={() => onClose(false)}>
            İptal
          </Button>
          <Button
            type="button"
            className="min-h-11 flex-1 bg-[var(--color-danger-text)] text-[var(--color-bg)] hover:opacity-90"
            onClick={() => onClose(true)}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
