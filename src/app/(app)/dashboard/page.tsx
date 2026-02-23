import { auth } from '@/lib/firebase/client';
import { getTasksForUser } from '@/lib/firebase/firestore';
import { DashboardClient } from '@/components/dashboard/dashboard-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function DashboardPage() {
  const user = auth.currentUser;

  if (!user) {
    // This should be handled by AuthGuard, but as a fallback
    return (
        <div className="flex h-full items-center justify-center">
            <p>Please log in to see your tasks.</p>
        </div>
    );
  }

  const tasks = await getTasksForUser(user.uid);

  return (
    <Card>
        <CardHeader>
            <CardTitle>My Tasks</CardTitle>
            <CardDescription>View, manage, and create your tasks.</CardDescription>
        </CardHeader>
        <CardContent>
            <DashboardClient initialTasks={tasks} userId={user.uid} />
        </CardContent>
    </Card>
  );
}
