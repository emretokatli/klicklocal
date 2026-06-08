'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { SocialProviderConnectionCard } from '@/components/social-accounts/SocialProviderConnectionCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { de } from '@/lib/i18n/de';
import { socialAccountsService } from '@/services/social-accounts.service';
import { useWorkspace } from '@/store/workspace-context';

export default function SocialAccountsPage() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const { workspaceId, workspace } = useWorkspace();
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const instagramStatusQuery = useQuery({
    queryKey: ['instagram', 'status', workspaceId],
    queryFn: () => socialAccountsService.instagramStatus(workspaceId!),
    enabled: workspaceId !== null,
  });

  const tiktokStatusQuery = useQuery({
    queryKey: ['tiktok', 'status', workspaceId],
    queryFn: () => socialAccountsService.tiktokStatus(workspaceId!),
    enabled: workspaceId !== null,
  });

  useEffect(() => {
    const instagramResult = searchParams.get('instagram');
    const tiktokResult = searchParams.get('tiktok');
    const message = searchParams.get('message');

    if (instagramResult === 'connected') {
      setToast(de.socialAccounts.instagram.successConnected);
      void queryClient.invalidateQueries({
        queryKey: ['instagram', 'status', workspaceId],
      });
    } else if (instagramResult === 'error') {
      setError(message ?? de.socialAccounts.instagram.errorOAuth);
    }

    if (tiktokResult === 'connected') {
      setToast(de.socialAccounts.tiktok.successConnected);
      void queryClient.invalidateQueries({
        queryKey: ['tiktok', 'status', workspaceId],
      });
    } else if (tiktokResult === 'error') {
      setError(message ?? de.socialAccounts.tiktok.errorOAuth);
    }
  }, [searchParams, queryClient, workspaceId]);

  if (!workspaceId) {
    return (
      <EmptyState
        title={de.socialAccounts.noWorkspace}
        description={de.dashboard.selectWorkspace}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title={de.socialAccounts.title}
        description={`${de.socialAccounts.description} — ${workspace?.name ?? ''}`}
      />

      {toast && (
        <p className="mb-4 rounded-lg bg-primary/15 px-3 py-2 text-sm text-primary">
          {toast}
        </p>
      )}
      {error && <p className="mb-4 text-sm text-error">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-2">
        <SocialProviderConnectionCard
          provider="instagram"
          workspaceId={workspaceId}
          labels={de.socialAccounts.instagram}
          statusQuery={instagramStatusQuery}
          onToast={setToast}
          onError={setError}
        />
        <SocialProviderConnectionCard
          provider="tiktok"
          workspaceId={workspaceId}
          labels={de.socialAccounts.tiktok}
          statusQuery={tiktokStatusQuery}
          onToast={setToast}
          onError={setError}
        />
      </div>
    </div>
  );
}
