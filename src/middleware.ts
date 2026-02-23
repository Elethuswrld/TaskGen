import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('firebase-auth');
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isProtectedPage = pathname.startsWith('/dashboard') || pathname.startsWith('/profile');

  if (isAuthPage) {
    // If the user is logged in (has a session cookie) and tries to access login/signup,
    // redirect them to the dashboard.
    if (sessionCookie) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  } else if (isProtectedPage) {
    // If the user is not logged in and tries to access a protected page,
    // redirect them to the login page.
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// Apply middleware to all routes that need protection or redirection logic.
export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*', '/login', '/signup'],
};
