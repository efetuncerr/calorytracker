import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth';

function loggedOut(req: NextRequest) {
  const response = NextResponse.redirect(new URL('/giris', req.url));
  clearSessionCookie(response);
  return response;
}

export async function GET(req: NextRequest) {
  return loggedOut(req);
}

export async function POST(req: NextRequest) {
  return loggedOut(req);
}
