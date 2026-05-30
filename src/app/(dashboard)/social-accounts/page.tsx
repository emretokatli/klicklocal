'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Share2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { de } from '@/lib/i18n/de';
import { ApiClientError } from '@/services/api-client';
import { socialAccountsService } from '@/services/social-accounts.service';
import { useWorkspace } from '@/store/workspace-context';

export default function SocialAccountsPage() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const { workspaceId, workspace } = useWorkspace();
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const statusQuery = useQuery({
    queryKey: ['instagram', 'status', workspaceId],
    queryFn: () => socialAccountsService.instagramStatus(workspaceId!),
    enabled: workspaceId !== null,
  });

  useEffect(() => {
    const result = searchParams.get('instagram');
    const message = searchParams.get('message');
    if (result === 'connected') {
      setToast(de.socialAccounts.instagram.successConnected);
      void queryClient.invalidateQueries({ queryKey: ['instagram', 'status', workspaceId] });
    } else if (result === 'error') {
      setError(message ?? de.socialAccounts.instagram.errorOAuth);
    }
  }, [searchParams, queryClient, workspaceId]);

  const connectMutation = useMutation({
    mutationFn: () => socialAccountsService.instagramConnect(workspaceId!),
    onSuccess: (url) => {
      window.location.href = url;
    },
    onError: (e: Error) => {
      setError(
        e instanceof ApiClientError
          ? e.message
          : de.socialAccounts.instagram.connectFailed,
      );
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: () => socialAccountsService.instagramDisconnect(workspaceId!),
    onSuccess: () => {
      setToast(de.socialAccounts.instagram.successDisconnected);
      setError(null);
      void queryClient.invalidateQueries({ queryKey: ['instagram', 'status', workspaceId] });
    },
    onError: (e: Error) => {
      setError(
        e instanceof ApiClientError
          ? e.message
          : de.socialAccounts.instagram.disconnectFailed,
      );
    },
  });

  if (!workspaceId) {
    return (
      <EmptyState
        title={de.socialAccounts.noWorkspace}
        description={de.dashboard.selectWorkspace}
      />
    );
  }

  const account = statusQuery.data?.account;
  const connected = statusQuery.data?.connected ?? false;

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

      <Card className="max-w-xl">
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af]">
            <Share2 className="h-5 w-5 text-white" />
          </div>
          <CardTitle>{de.socialAccounts.instagram.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">
            <span className="text-on-surface-variant">{de.common.status}: </span>
            <span className="font-medium">
              {connected
                ? de.socialAccounts.instagram.connected
                : account?.status === 'expired'
                  ? de.socialAccounts.instagram.expired
                  : de.socialAccounts.instagram.disconnected}
            </span>
          </p>

          {account && (
            <div className="space-y-1 text-sm text-on-surface-variant">
              {account.account_name && (
                <p>
                  {de.socialAccounts.instagram.accountName}:{' '}
                  <span className="text-on-surface">{account.account_name}</span>
                </p>
              )}
              {account.username && (
                <p>
                  {de.socialAccounts.instagram.username}:{' '}
                  <span className="text-on-surface">@{account.username}</span>
                </p>
              )}
              {account.token_expires_at && (
                <p>
                  {de.socialAccounts.instagram.tokenExpiry}:{' '}
                  {new Date(account.token_expires_at).toLocaleString('de-DE')}
                  {account.token_expired && (
                    <span className="ml-2 text-error">
                      ({de.socialAccounts.instagram.tokenExpired})
                    </span>
                  )}
                </p>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              disabled={connectMutation.isPending || connected}
              onClick={() => connectMutation.mutate()}
            >
              {de.socialAccounts.instagram.connect}
            </Button>
            <Button
              variant="outline"
              disabled={!connected || disconnectMutation.isPending}
              onClick={() => disconnectMutation.mutate()}
            >
              {de.socialAccounts.instagram.disconnect}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
