'use client';

import type { ReactNode } from 'react';

import { CompleteOnboardingGuard } from '@/components/auth/OnboardingGate';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

import './onboarding.css';

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <CompleteOnboardingGuard>{children}</CompleteOnboardingGuard>
    </ProtectedRoute>
  );
}
