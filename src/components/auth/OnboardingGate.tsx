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

/** Blocks dashboard access until user onboarding is complete */
export function OnboardingGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isLoading, isAuthenticated, session, isPlatformAdmin } = useAuth();

  useEffect(() => {
    if (isLoading || !isAuthenticated || isPlatformAdmin) return;
    if (session && !session.onboarding_completed) {
      router.replace('/onboarding');
    }
  }, [isAuthenticated, isLoading, isPlatformAdmin, router, session]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (isAuthenticated && !isPlatformAdmin && session && !session.onboarding_completed) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return <>{children}</>;
}

/** Redirects authenticated users with incomplete onboarding away from marketing home */
export function HomeOnboardingRedirect({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isLoading, isAuthenticated, session, isPlatformAdmin } = useAuth();

  useEffect(() => {
    if (isLoading || !isAuthenticated || isPlatformAdmin) return;
    if (session && !session.onboarding_completed) {
      router.replace('/onboarding');
    }
  }, [isAuthenticated, isLoading, isPlatformAdmin, router, session]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (isAuthenticated && !isPlatformAdmin && session && !session.onboarding_completed) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return <>{children}</>;
}
