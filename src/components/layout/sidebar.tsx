'use client';

import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Logo } from '../icons/logo';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { signOut } from '@/lib/actions';
import { Button } from '../ui/button';
import { LogOut, User as UserIcon, LayoutDashboard, Cog } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function AppSidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const defaultAvatar = PlaceHolderImages.find(p => p.id === 'default-avatar');

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Logo className="text-primary" />
          <span className="text-lg font-semibold">TaskDash</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/dashboard" passHref legacyBehavior>
              <SidebarMenuButton
                isActive={pathname.startsWith('/dashboard')}
                icon={<LayoutDashboard />}
                tooltip="Dashboard"
              >
                Dashboard
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/profile" passHref legacyBehavior>
                <SidebarMenuButton 
                  isActive={pathname.startsWith('/profile')}
                  icon={<Cog />} 
                  tooltip="Profile"
                >
                    Profile
                </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.photoURL || defaultAvatar?.imageUrl} alt={user?.displayName || 'User'} />
            <AvatarFallback>
              {user?.displayName?.charAt(0).toUpperCase() || <UserIcon size={16} />}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium">{user?.displayName}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => signOut()} aria-label="Log out">
            <LogOut size={16} />
          </Button>
        </div>
      </SidebarFooter>
    </>
  );
}
