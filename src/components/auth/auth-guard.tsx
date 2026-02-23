'use client';

import { useAuth } from '@/hooks/use-auth';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { CheckCircle, Loader } from 'lucide-react';

const AUTH_ROUTES = ['/login', '/signup'];
const PROTECTED_ROUTES = ['/dashboard', '/profile'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) {
      return;
    }

    const isAuthRoute = AUTH_ROUTES.includes(pathname);
    const isProtectedRoute = PROTECTED_ROUTES.some(p => pathname.startsWith(p));

    if (!user && isProtectedRoute) {
      router.push('/login');
    }

    if (user && isAuthRoute) {
      router.push('/dashboard');
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <div className="flex items-center space-x-2">
          <Loader className="animate-spin text-primary" />
          <p className="text-muted-foreground">Loading TaskDash...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
