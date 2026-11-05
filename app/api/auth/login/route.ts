import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { setSessionCookie, signSession } from '@/lib/auth';
import { clearLoginFailures, clientIp, loginAllowed, recordLoginFailure } from '@/lib/rate-limit';
import { firstZodError, loginSchema } from '@/lib/validators';

const DUMMY_HASH = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers);
  const limit = await loginAllowed(ip);
  if (!limit.ok) {
    return NextResponse.json({ error: limit.message }, { status: 429 });
  }

  try {
    const parsed = loginSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: firstZodError(parsed.error) }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    const hash = user?.passwordHash || DUMMY_HASH;
    const matches = await bcrypt.compare(parsed.data.password, hash);

    if (!user || !matches) {
      await recordLoginFailure(ip);
      return NextResponse.json({ error: 'E-posta veya şifre hatalı' }, { status: 401 });
    }

    await clearLoginFailures(ip);
    const token = await signSession(user.id, user.email);
    const response = NextResponse.json({ success: true });
    setSessionCookie(response, token);
    return response;
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
