'use client';

import type { ReactNode } from 'react';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { OnboardingGate } from '@/components/auth/OnboardingGate';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { AppModeProvider } from '@/store/app-mode-context';
import { WorkspaceProvider } from '@/store/workspace-context';

export default function DashboardGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ProtectedRoute>
      <OnboardingGate>
        <AppModeProvider>
          <WorkspaceProvider>
            <DashboardLayout>{children}</DashboardLayout>
          </WorkspaceProvider>
        </AppModeProvider>
      </OnboardingGate>
    </ProtectedRoute>
  );
}
