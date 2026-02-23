'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { updateUserProfileClient } from '@/lib/auth-client';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { User } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { User as UserIcon } from 'lucide-react';

const formSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters.'),
});

interface ProfileFormProps {
  user: User;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const defaultAvatar = PlaceHolderImages.find(p => p.id === 'default-avatar');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: user.displayName || '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const result = await updateUserProfileClient(values.displayName);
    setIsLoading(false);

    if (result.error) {
      toast({
        title: 'Update Failed',
        description: result.error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Profile Updated',
        description: result.message,
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
        <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
                <AvatarImage src={user.photoURL || defaultAvatar?.imageUrl} />
                <AvatarFallback className="text-3xl">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserIcon />}
                </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
                <h3 className="text-xl font-bold">{user.displayName}</h3>
                <p className="text-muted-foreground">{user.email}</p>
            </div>
        </div>
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Name</FormLabel>
              <FormControl>
                <Input placeholder="Your Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
                <Input value={user.email || ''} disabled />
            </FormControl>
        </FormItem>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </form>
    </Form>
  );
}
