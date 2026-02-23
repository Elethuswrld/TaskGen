'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onIdTokenChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import type { UserProfile } from '@/lib/types';
import { setCookie, deleteCookie } from 'cookies-next';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        setCookie('firebase-auth', token, { path: '/' });
        const { uid, email, displayName, photoURL } = firebaseUser;
        setUser({ uid, email, displayName, photoURL });
      } else {
        deleteCookie('firebase-auth', { path: '/' });
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
