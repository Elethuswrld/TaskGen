import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Dashboard</CardTitle>
        <CardDescription>This is a protected admin-only area.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Welcome, admin! You have access to special privileges and administrative tools.</p>
      </CardContent>
    </Card>
  );
}
