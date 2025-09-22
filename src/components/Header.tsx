'use client';

import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export function Header({ title = 'The Warren Tournaments' }: { title?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const handleAuthButtonClick = () => {
    if (session) {
      signOut({ callbackUrl: '/' });
    } else {
      router.push('/admin/login');
    }
  };

  const isOnAdminPage = pathname === '/admin/dashboard';
  const isOnLoginPage = pathname === '/admin/login';

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-2">
        <h1 className="text-lg font-semibold">{title}</h1>
        <div className="flex gap-2">
          {session && (
            <Link href={isOnAdminPage ? '/' : '/admin/dashboard'}>
              <Button variant="outline" size="sm">
                {isOnAdminPage ? 'Public Site' : 'Admin Dashboard'}
              </Button>
            </Link>
          )}
          {!isOnLoginPage && (
            <Button variant="ghost" size="sm" onClick={handleAuthButtonClick} disabled={status === 'loading'}>
              {status === 'loading' ? '...' : session ? 'Sign Out' : 'Admin'}
            </Button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
