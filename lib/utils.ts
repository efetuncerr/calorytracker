import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { calculateNutrients } from '@/lib/calc';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export { calculateNutrients };

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
