import { createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { firstZodError, resetSchema } from '@/lib/validators';

export async function POST(req: NextRequest) {
  try {
    const parsed = resetSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: firstZodError(parsed.error) }, { status: 400 });
    }

    const tokenHash = createHash('sha256').update(parsed.data.token).digest('hex');
    const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

    if (!record || record.expiresAt.getTime() < Date.now()) {
      return NextResponse.json(
        { error: 'Sıfırlama bağlantısı geçersiz veya süresi dolmuş' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    await prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    });
    await prisma.passwordResetToken.deleteMany({ where: { userId: record.userId } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Şifre güncellenemedi' }, { status: 500 });
  }
}
