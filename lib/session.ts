import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { readSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function getUserId() {
  const jar = await cookies();
  const token = jar.get('auth-token')?.value;
  if (!token) return null;
  try {
    const session = await readSession(token);
    return session.userId;
  } catch {
    return null;
  }
}

export async function requireUser() {
  const userId = await getUserId();
  const user = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
  if (!user) redirect('/api/auth/logout');
  return user;
}
