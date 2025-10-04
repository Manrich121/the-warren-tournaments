'use client';

import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const [q] = useState(queryClient);

  return (
    <QueryClientProvider client={q}>
      <SessionProvider>{children}</SessionProvider>
    </QueryClientProvider>
  );
}
