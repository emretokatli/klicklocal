'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

import { createQueryClient } from '@/lib/query-client';
import { AuthProvider } from '@/store/auth-context';
import { ThemeProvider } from '@/store/theme-context';

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
