'use client';

import { useMutation } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { SocialProviderIcon } from '@/components/admin/providers/SocialProviderIcon';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { de } from '@/lib/i18n/de';
import { ApiClientError } from '@/services/api-client';
import { socialAccountsService } from '@/services/social-accounts.service';
import type { SocialAccount } from '@/types/api';

type SupportedProvider = 'instagram' | 'tiktok';

type ProviderLabels =
  | typeof de.socialAccounts.instagram
  | typeof de.socialAccounts.tiktok;

type ConnectionStatus = {
  connected: boolean;
  account: SocialAccount | null;
};

type SocialProviderConnectionCardProps = {
  provider: SupportedProvider;
  workspaceId: number;
  labels: ProviderLabels;
  statusQuery: UseQueryResult<ConnectionStatus>;
  onToast: (message: string) => void;
  onError: (message: string) => void;
};

const connectFns: Record<
  SupportedProvider,
  (workspaceId: number) => Promise<string>
> = {
  instagram: socialAccountsService.instagramConnect,
  tiktok: socialAccountsService.tiktokConnect,
};

const disconnectFns: Record<
  SupportedProvider,
  (workspaceId: number) => Promise<null>
> = {
  instagram: socialAccountsService.instagramDisconnect,
  tiktok: socialAccountsService.tiktokDisconnect,
};

export function SocialProviderConnectionCard({
  provider,
  workspaceId,
  labels,
  statusQuery,
  onToast,
  onError,
}: SocialProviderConnectionCardProps) {
  const account = statusQuery.data?.account;
  const connected = statusQuery.data?.connected ?? false;

  const connectMutation = useMutation({
    mutationFn: () => connectFns[provider](workspaceId),
    onSuccess: (url) => {
      window.location.href = url;
    },
    onError: (e: Error) => {
      onError(
        e instanceof ApiClientError ? e.message : labels.connectFailed,
      );
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: () => disconnectFns[provider](workspaceId),
    onSuccess: () => {
      onToast(labels.successDisconnected);
      void statusQuery.refetch();
    },
    onError: (e: Error) => {
      onError(
        e instanceof ApiClientError ? e.message : labels.disconnectFailed,
      );
    },
  });

  return (
    <Card className="max-w-xl">
      <CardHeader className="flex flex-row items-center gap-3">
        <SocialProviderIcon provider={provider} />
        <CardTitle>{labels.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm">
          <span className="text-on-surface-variant">{de.common.status}: </span>
          <span className="font-medium">
            {connected
              ? labels.connected
              : account?.status === 'expired'
                ? labels.expired
                : labels.disconnected}
          </span>
        </p>

        {account && (
          <div className="space-y-1 text-sm text-on-surface-variant">
            {account.account_name && (
              <p>
                {labels.accountName}:{' '}
                <span className="text-on-surface">{account.account_name}</span>
              </p>
            )}
            {account.username && (
              <p>
                {labels.username}:{' '}
                <span className="text-on-surface">
                  {provider === 'instagram' ? '@' : ''}
                  {account.username}
                </span>
              </p>
            )}
            {account.token_expires_at && (
              <p>
                {labels.tokenExpiry}:{' '}
                {new Date(account.token_expires_at).toLocaleString('de-DE')}
                {account.token_expired && (
                  <span className="ml-2 text-error">({labels.tokenExpired})</span>
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
            {labels.connect}
          </Button>
          <Button
            variant="outline"
            disabled={!connected || disconnectMutation.isPending}
            onClick={() => disconnectMutation.mutate()}
          >
            {labels.disconnect}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
