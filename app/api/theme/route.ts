import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/session';

const themeSchema = z.enum(['light', 'dark', 'system']);

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ theme: null });
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { theme: true } });
  return NextResponse.json({ theme: user?.theme || 'system' });
}

export async function PATCH(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ ok: true });

  const body = await req.json().catch(() => null);
  const parsed = themeSchema.safeParse(body?.theme);
  if (!parsed.success) return NextResponse.json({ error: 'Tema geçersiz' }, { status: 400 });

  await prisma.user.update({ where: { id: userId }, data: { theme: parsed.data } });
  return NextResponse.json({ theme: parsed.data });
}
