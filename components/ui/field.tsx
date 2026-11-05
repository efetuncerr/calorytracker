import { cn } from '@/lib/utils';
import { InputHTMLAttributes, ReactNode } from 'react';

export function Field({
  label,
  icon,
  className,
  id,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label?: string; icon?: ReactNode }) {
  return (
    <label className="block" htmlFor={id}>
      {label && <span className="mb-1 block text-sm text-muted">{label}</span>}
      <span className="flex min-h-11 items-center gap-2 rounded-control border border-line bg-surface px-3 focus-within:border-primary">
        {icon && <span className="text-muted" aria-hidden="true">{icon}</span>}
        <input id={id} className={cn('h-11 w-full bg-transparent text-base text-ink outline-none', className)} {...props} />
      </span>
    </label>
  );
}
