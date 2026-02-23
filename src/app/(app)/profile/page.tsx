import { ProfileForm } from '@/components/profile/profile-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { getUserProfile } from '@/lib/firebase/firestore';
import type { User } from 'firebase/auth';

const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

async function getUserFromToken(): Promise<User | null> {
  const token = cookies().get('firebase-auth')?.value;
  if (!token) return null;

  try {
    if (!FIREBASE_PROJECT_ID) throw new Error('Firebase project ID not configured.');
    
    const JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'));
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
      audience: FIREBASE_PROJECT_ID,
    });
    
    if (!payload.sub) return null;

    // Fetch full profile from Firestore using the UID from the token
    const userProfile = await getUserProfile(payload.sub);
    
    // The ProfileForm expects an object that looks like Firebase's User type.
    // We can cast our UserProfile type since it's compatible.
    return userProfile as User;

  } catch (error) {
    console.error("Token verification or profile fetch failed:", error);
    return null;
  }
}

export default async function ProfilePage() {
  const user = await getUserFromToken();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="grid gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Manage your account settings.</CardDescription>
            </CardHeader>
            <CardContent>
                <ProfileForm user={user} />
            </CardContent>
        </Card>
    </div>
  );
}
