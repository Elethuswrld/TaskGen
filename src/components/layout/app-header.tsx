'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import { capitalize } from '@/lib/utils';

export function AppHeader() {
  const pathname = usePathname();
  const pageTitle = capitalize(pathname.split('/').pop() || 'Dashboard');

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card px-4 md:px-6">
      <SidebarTrigger className="md:hidden" />
      <h1 className="text-lg font-semibold md:text-xl">{pageTitle}</h1>
    </header>
  );
}
