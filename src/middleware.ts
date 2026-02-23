import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createRemoteJWKSet, jwtVerify } from 'jose';

const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('firebase-auth')?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isAppPage = pathname.startsWith('/dashboard') || pathname.startsWith('/profile');
  const isAdminPage = pathname.startsWith('/admin');

  let decodedTokenPayload = null;
  if (token) {
    try {
      if (!FIREBASE_PROJECT_ID) {
        throw new Error('Firebase project ID is not configured.');
      }
      const JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'));
      
      const { payload } = await jwtVerify(token, JWKS, {
        issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
        audience: FIREBASE_PROJECT_ID,
      });

      decodedTokenPayload = payload;
    } catch (error) {
      console.error("Token verification failed:", error);
      // Invalid token, clear it and redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('firebase-auth');
      return response;
    }
  }

  // If user is authenticated...
  if (decodedTokenPayload) {
    // ...and tries to access an auth page, redirect to dashboard
    if (isAuthPage) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // ...and tries to access an admin page without admin role, redirect to dashboard
    if (isAdminPage && (decodedTokenPayload as any).role !== 'admin') {
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
