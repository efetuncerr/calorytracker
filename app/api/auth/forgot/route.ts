import { createHash, randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { firstZodError, forgotSchema } from '@/lib/validators';

export async function POST(req: NextRequest) {
  try {
    const parsed = forgotSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: firstZodError(parsed.error) }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    const message = 'Eğer bu e-posta kayıtlıysa şifre sıfırlama bağlantısı hazır.';

    if (!user) {
      return NextResponse.json({ message });
    }

    const raw = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(raw).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    const payload: { message: string; resetUrl?: string } = { message };
    if (process.env.NODE_ENV !== 'production') {
      payload.resetUrl = `/sifre-sifirla/${raw}`;
    }
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json({ error: 'İstek tamamlanamadı' }, { status: 500 });
  }
}
