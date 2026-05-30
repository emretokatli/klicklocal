'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useAuth } from '@/store/auth-context';

export function AdminRoute({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isLoading, isPlatformAdmin } = useAuth();

  useEffect(() => {
    if (!isLoading && !isPlatformAdmin) {
      router.replace('/dashboard');
    }
  }, [isLoading, isPlatformAdmin, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isPlatformAdmin) {
    return null;
  }

  return <>{children}</>;
}
