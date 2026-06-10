'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useAuth } from '@/store/auth-context';

/** Redirects users who already finished onboarding away from /onboarding */
export function CompleteOnboardingGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isLoading, isAuthenticated, session } = useAuth();

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    if (session?.onboarding_completed) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, router, session?.onboarding_completed]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (session?.onboarding_completed) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return <>{children}</>;
}

/** Previously blocked dashboard access; now just handles loading state */
export function OnboardingGate({ children }: { children: ReactNode }) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return <>{children}</>;
}

/** Previously redirected incomplete onboarding users from home; now just renders children */
export function HomeOnboardingRedirect({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
