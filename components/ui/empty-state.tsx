import { ReactNode } from 'react';

function Plate() {
  return (
    <svg width="112" height="88" viewBox="0 0 112 88" aria-hidden="true">
      <ellipse cx="56" cy="54" rx="38" ry="16" fill="none" stroke="var(--color-accent)" strokeWidth="2" />
      <ellipse cx="56" cy="48" rx="26" ry="10" fill="none" stroke="var(--color-primary)" strokeWidth="2" />
      <path d="M40 36c6-12 26-12 32 0" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SearchMark() {
  return (
    <svg width="112" height="88" viewBox="0 0 112 88" aria-hidden="true">
      <circle cx="48" cy="40" r="16" fill="none" stroke="var(--color-primary)" strokeWidth="2" />
      <path d="M60 52l14 14" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ChartMark() {
  return (
    <svg width="112" height="88" viewBox="0 0 112 88" aria-hidden="true">
      <path d="M24 64h64" stroke="var(--color-line)" strokeWidth="2" strokeLinecap="round" />
      <path d="M32 58l14-16 12 8 18-22" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="76" cy="28" r="3" fill="var(--color-accent)" />
    </svg>
  );
}

const marks = { plate: Plate, search: SearchMark, chart: ChartMark };

export function EmptyState({
  mark = 'plate',
  title,
  text,
  action,
}: {
  mark?: keyof typeof marks;
  title: string;
  text: string;
  action?: ReactNode;
}) {
  const Mark = marks[mark];
  return (
    <div className="rounded-card bg-surface px-6 py-10 text-center shadow-soft">
      <div className="mx-auto mb-3 flex justify-center">
        <Mark />
      </div>
      <p className="font-display text-h3">{title}</p>
      <p className="mx-auto mt-2 max-w-xs text-sm text-muted">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
