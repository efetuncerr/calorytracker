import { prisma } from '@/lib/prisma';

const MAX_FAILS = 5;
const WINDOW_MS = 15 * 60 * 1000;

export async function loginAllowed(ip: string): Promise<{ ok: true } | { ok: false; message: string }> {
  const since = new Date(Date.now() - WINDOW_MS);
  const fails = await prisma.loginAttempt.count({
    where: { ip, failedAt: { gte: since } },
  });
  if (fails >= MAX_FAILS) {
    return { ok: false, message: 'Çok fazla başarısız deneme. 15 dakika sonra tekrar deneyin.' };
  }
  return { ok: true };
}

export async function recordLoginFailure(ip: string) {
  await prisma.loginAttempt.create({ data: { ip: ip.slice(0, 64) } });
}

export async function clearLoginFailures(ip: string) {
  await prisma.loginAttempt.deleteMany({ where: { ip } });
}

export function clientIp(headers: Headers) {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim().slice(0, 64);
  return (headers.get('x-real-ip') || 'local').slice(0, 64);
}
