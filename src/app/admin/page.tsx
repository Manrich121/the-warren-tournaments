'use client';

import { redirect } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function AdminPage() {
  const session = useSession();
  if (session) {
    redirect('/admin/dashboard');
  } else {
    redirect('/admin/login');
  }
}
