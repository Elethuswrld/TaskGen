import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('firebase-auth')?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isAppPage = pathname.startsWith('/dashboard') || pathname.startsWith('/profile');
  const isAdminPage = pathname.startsWith('/admin');
  
  let decodedToken = null;
  if (token) {
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error) {
      // Invalid token, clear it and redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('firebase-auth');
      return response;
    }
  }

  // If user is authenticated...
  if (decodedToken) {
    // ...and tries to access an auth page, redirect to dashboard
    if (isAuthPage) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // ...and tries to access an admin page without admin role, redirect to dashboard
    if (isAdminPage && decodedToken.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  } 
  // If user is not authenticated...
  else {
    // ...and tries to access a protected (app or admin) page, redirect to login
    if (isAppPage || isAdminPage) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// Apply middleware to all routes that need protection or redirection logic.
export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/profile/:path*',
    '/admin/:path*',
    '/login', 
    '/signup'
],
};
