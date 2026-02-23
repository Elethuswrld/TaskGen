import { getTasksForUser } from '@/lib/firebase/firestore';
import { DashboardClient } from '@/components/dashboard/dashboard-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cookies } from 'next/headers';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { redirect } from 'next/navigation';

const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

async function getUserIdFromToken(): Promise<string | null> {
  const token = cookies().get('firebase-auth')?.value;
  if (!token) return null;

  try {
    if (!FIREBASE_PROJECT_ID) throw new Error('Firebase project ID not configured.');
    
    const JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'));
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
      audience: FIREBASE_PROJECT_ID,
    });
    
    return payload.sub || null;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}


export default async function DashboardPage() {
  const userId = await getUserIdFromToken();

  if (!userId) {
    // This should be handled by middleware, but as a fallback, redirect
    redirect('/login');
  }

  const tasks = await getTasksForUser(userId);

  return (
    <Card>
        <CardHeader>
            <CardTitle>My Tasks</CardTitle>
            <CardDescription>View, manage, and create your tasks.</CardDescription>
        </CardHeader>
        <CardContent>
            <DashboardClient initialTasks={tasks} userId={userId} />
        </CardContent>
    </Card>
  );
}
