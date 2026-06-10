'use client';

import { useQuery } from '@tanstack/react-query';
import { Lock } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { de } from '@/lib/i18n/de';
import { billingService } from '@/services/billing.service';
import { useWorkspace } from '@/store/workspace-context';

export function SubscriptionGate({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { workspaceId } = useWorkspace();

  const { data: subscription, isLoading } = useQuery({
    queryKey: ['subscription', workspaceId],
    queryFn: () => billingService.subscription(workspaceId!),
    enabled: workspaceId !== null,
  });

  if (!workspaceId) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="space-y-3 pt-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const isActive =
    subscription?.status === 'active' || subscription?.status === 'trialing';

  if (!isActive) {
    if (fallback !== undefined) return <>{fallback}</>;
    return (
      <div className="flex items-center justify-center py-16">
        <Card className="w-full max-w-sm">
          <CardContent className="flex flex-col items-center gap-4 pb-8 pt-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold">
                {de.billing.noSubscription}
              </h3>
              <p className="text-sm text-on-surface-variant">
                {de.billing.gateDescription}
              </p>
            </div>
            <Button asChild>
              <Link href="/billing">{de.billing.gateAction}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
