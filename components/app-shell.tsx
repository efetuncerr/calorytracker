'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Salad, UserRound, Utensils } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ThemeToggle from '@/components/theme-toggle';
import Brand from '@/components/brand';
import { Sheet } from '@/components/ui/sheet';
import { Button, buttonClass } from '@/components/ui/button';

const LINKS = [
  { href: '/dashboard', label: 'Bugün', icon: Utensils },
  { href: '/foods', label: 'Besinler', icon: Salad },
  { href: '/stats', label: 'İstatistik', icon: BarChart3 },
  { href: '/profile', label: 'Profil', icon: UserRound },
];

function active(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AppShell({ name, children }: { name: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const initial = name.trim().slice(0, 1).toLocaleUpperCase('tr');

  useEffect(() => {
    function close(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div className="min-h-screen bg-bg">
      <a href="#icerik" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-surface focus:px-3 focus:py-2">
        İçeriğe geç
      </a>
      <header className="sticky top-0 z-30 border-b border-line bg-surface">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4 sm:gap-3">
          <Link href="/dashboard" className="shrink-0" aria-label="ALMINA calory tracker">
            <Brand />
          </Link>
          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex" aria-label="Ana menü">
            {LINKS.map((item) =>
              item.href === '/profile' ? (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => setRequestOpen(true)}
                  className={`inline-flex min-h-11 items-center rounded-control px-3 text-sm font-semibold ${active(pathname, item.href) ? 'bg-bg text-ink' : 'text-muted'}`}
                >
                  {item.label}
                </button>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex min-h-11 items-center rounded-control px-3 text-sm font-semibold ${active(pathname, item.href) ? 'bg-bg text-ink' : 'text-muted'}`}
                  aria-current={active(pathname, item.href) ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-control bg-bg font-semibold text-ink"
                aria-label="Kullanıcı menüsü"
                aria-expanded={open}
                aria-haspopup="menu"
                onClick={() => setOpen((value) => !value)}
              >
                {initial}
              </button>
              {open && (
                <div role="menu" className="absolute right-0 mt-2 w-44 rounded-card bg-surface p-2 shadow-soft">
                  <p className="truncate px-3 py-2 text-sm text-muted">{name}</p>
                  <form action="/api/auth/logout" method="POST">
                    <button type="submit" role="menuitem" className="min-h-11 w-full rounded-control px-3 py-2 text-left text-sm font-semibold text-danger-text hover:bg-bg">
                      Çıkış
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main id="icerik" className="mx-auto w-full min-w-0 max-w-5xl px-4 py-5 pb-28 lg:pb-10">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden" aria-label="Alt menü">
        <ul className="mx-auto grid max-w-lg grid-cols-4">
          {LINKS.map((item) => {
            const Icon = item.icon;
            const on = active(pathname, item.href);
            return (
              <li key={item.href}>
                {item.href === '/profile' ? (
                  <button
                    type="button"
                    onClick={() => setRequestOpen(true)}
                    className={`flex min-h-14 w-full flex-col items-center justify-center gap-1 text-xs font-semibold ${on ? 'text-success-text' : 'text-muted'}`}
                  >
                    <Icon size={18} aria-hidden="true" />
                    {item.label}
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex min-h-14 flex-col items-center justify-center gap-1 text-xs font-semibold ${on ? 'text-success-text' : 'text-muted'}`}
                    aria-current={on ? 'page' : undefined}
                  >
                    <Icon size={18} aria-hidden="true" />
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <Sheet open={requestOpen} title="İsteklerinizi belirtin" onClose={() => setRequestOpen(false)}>
        <h2 className="font-display text-h3">İsteklerinizi belirtin</h2>
        <img src="/almina.jpg" alt="Almina" className="mt-4 max-h-[42vh] w-full rounded-card object-cover" />
        <p className="mt-4 text-center text-sm text-ink">
          Eklenmesini istediğiniz ürünler için Almina'ya wpden ulaşınız.
        </p>
        <div className="mt-5 flex gap-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={() => setRequestOpen(false)}>
            Kapat
          </Button>
          <Link href="/profile" className={buttonClass('primary', 'flex-1')} onClick={() => setRequestOpen(false)}>
            Profile git
          </Link>
        </div>
      </Sheet>
    </div>
  );
}
