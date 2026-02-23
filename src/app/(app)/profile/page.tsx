import { auth } from '@/lib/firebase/client';
import { ProfileForm } from '@/components/profile/profile-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const user = auth.currentUser;

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
