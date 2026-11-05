export default function Brand({ stacked = false }: { stacked?: boolean }) {
  return (
    <span className={stacked ? 'flex flex-col items-center gap-3' : 'flex items-center gap-2.5'}>
      <svg width={stacked ? 56 : 40} height={stacked ? 56 : 40} viewBox="0 0 40 40" aria-hidden="true">
        <rect width="40" height="40" rx="12" fill="var(--color-primary-fill)" />
        <path d="M11 29 20 9l9 20" fill="none" stroke="var(--color-on-primary)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15.2 22.5h9.6" stroke="var(--color-accent)" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
      <span className={stacked ? 'text-center' : 'leading-none'}>
        <span className="block font-display text-sm font-bold tracking-[0.08em] text-ink sm:text-[15px] sm:tracking-[0.16em]">ALMINA</span>
        <span className="mt-1 hidden text-[10px] font-medium tracking-[0.12em] text-muted sm:block">calory tracker</span>
      </span>
    </span>
  );
}
