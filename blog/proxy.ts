import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const session = request.cookies.get('admin_session');
  const isAuthenticated = session?.value === 'authenticated';
  const { pathname } = request.nextUrl;

  if (pathname === '/admin/login') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  if (!isAuthenticated) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
