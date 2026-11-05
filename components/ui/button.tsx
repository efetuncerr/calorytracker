import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes } from 'react';

const variants = {
  primary: 'bg-primary-fill text-on-primary hover:bg-[var(--color-primary-fill-hover)]',
  secondary: 'border border-line bg-surface text-ink hover:bg-bg',
  ghost: 'bg-transparent text-ink hover:bg-bg',
};

export function buttonClass(variant: keyof typeof variants = 'primary', className?: string) {
  return cn(
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-control px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50',
    variants[variant],
    className
  );
}

export function Button({
  variant = 'primary',
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  loading?: boolean;
}) {
  return (
    <button
      className={buttonClass(variant, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
      )}
      {children}
    </button>
  );
}
