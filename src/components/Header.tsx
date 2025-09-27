'use client';

import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const handleAuthButtonClick = () => {
    if (session) {
      signOut({ callbackUrl: '/' });
    } else {
      router.push('/login');
    }
  };

  const isOnLoginPage = pathname === '/login';

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-2">
        <Link href="/">
          <div className="flex gap-2 items-center">
            <Image src={'/logo.svg'} alt="The Warren logo" className="w-8 h-8" width={32} height={32} />
            <h1 className="text-lg font-semibold">The Warren Tournaments</h1>
          </div>
        </Link>
        <div className="flex gap-2">
          {!isOnLoginPage && (
            <Button variant="ghost" size="sm" onClick={handleAuthButtonClick} disabled={status === 'loading'}>
              {status === 'loading' ? '...' : session ? 'Sign Out' : 'Sign In'}
            </Button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
