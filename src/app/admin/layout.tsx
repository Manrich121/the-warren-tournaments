'use client';

import { AdminNav } from '@/components/AdminNav';
import { Header } from '@/components/Header';
import { useSession } from 'next-auth/react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { status } = useSession();

  return (
    <div>
      <Header />
      <div className="container mx-auto space-y-6">
        {status == 'authenticated' ? <AdminNav /> : null}
        {children}
      </div>
    </div>
  );
}
