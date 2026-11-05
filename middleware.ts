import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'dev-secret-key-change-me-32chars!!'
);

const PROTECTED = ['/dashboard', '/log', '/foods', '/stats', '/profile'];
const GUEST_ONLY = ['/giris', '/kayit', '/login', '/register'];

function matches(pathname: string, bases: string[]) {
  return bases.some((base) => pathname === base || pathname.startsWith(`${base}/`));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth-token')?.value;
  let loggedIn = false;

  if (token) {
    try {
      await jwtVerify(token, secret);
      loggedIn = true;
    } catch {
      loggedIn = false;
    }
  }

  if (matches(pathname, PROTECTED) && !loggedIn) {
    const url = new URL('/giris', request.url);
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if ((pathname === '/' || matches(pathname, GUEST_ONLY)) && loggedIn) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (pathname === '/login') return NextResponse.redirect(new URL('/giris', request.url));
  if (pathname === '/register') return NextResponse.redirect(new URL('/kayit', request.url));
  if (pathname === '/forgot-password') return NextResponse.redirect(new URL('/sifre-sifirla', request.url));

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
