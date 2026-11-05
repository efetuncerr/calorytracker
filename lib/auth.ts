import { SignJWT, jwtVerify } from 'jose';
import { NextResponse } from 'next/server';

const secret = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'dev-secret-key-change-me-32chars!!'
);

export async function signSession(userId: string, email: string) {
  return new SignJWT({ userId, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

export async function readSession(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload as { userId: string; email: string };
}

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set('auth-token', '', { maxAge: 0, path: '/' });
}
