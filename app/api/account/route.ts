import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { clearSessionCookie } from '@/lib/auth';
import { getUserId } from '@/lib/session';

const deleteSchema = z.object({
  password: z.string().min(1, 'Şifreni yaz'),
});

export async function DELETE(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Şifre gerekli' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    return NextResponse.json({ error: 'Şifre hatalı' }, { status: 401 });
  }

  await prisma.$transaction([
    prisma.logEntry.deleteMany({ where: { userId } }),
    prisma.passwordResetToken.deleteMany({ where: { userId } }),
    prisma.foodPortion.deleteMany({ where: { food: { createdByUserId: userId } } }),
    prisma.food.deleteMany({ where: { createdByUserId: userId } }),
    prisma.user.delete({ where: { id: userId } }),
  ]);

  const response = NextResponse.json({ success: true });
  clearSessionCookie(response);
  return response;
}
