import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('firebase-auth')?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isProtectedPage = pathname.startsWith('/dashboard') || pathname.startsWith('/profile');
  
  let decodedToken = null;
  if (token) {
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error) {
      // Invalid token, clear it
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('firebase-auth');
      return response;
    }
  }

  if (isAuthPage) {
    if (decodedToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  } else if (isProtectedPage) {
    if (!decodedToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// Apply middleware to all routes that need protection or redirection logic.
export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*', '/login', '/signup'],
};
