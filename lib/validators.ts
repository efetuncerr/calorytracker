import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Ad en az 2 karakter olmalı').max(80, 'Ad çok uzun'),
  email: z.string().trim().email('Geçerli bir e-posta girin').max(200),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalı').max(100, 'Şifre çok uzun'),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Geçerli bir e-posta girin'),
  password: z.string().min(1, 'Şifre gerekli'),
});

export const forgotSchema = z.object({
  email: z.string().trim().email('Geçerli bir e-posta girin'),
});

export const resetSchema = z.object({
  token: z.string().min(20, 'Sıfırlama bağlantısı geçersiz'),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalı').max(100, 'Şifre çok uzun'),
});

export function firstZodError(error: z.ZodError) {
  return error.issues[0]?.message || 'Bilgiler geçersiz';
}
