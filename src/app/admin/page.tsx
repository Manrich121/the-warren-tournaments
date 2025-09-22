'use client';

import { redirect } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

export default function AdminPage() {
  const { status } = useSession();
  useEffect(() => {
    if (status == 'authenticated') {
      redirect('/admin/dashboard');
    } else if (status == 'unauthenticated') {
      redirect('/admin/login');
    }
  }, [status]);
}
