'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { ProviderConfigPanel } from '@/components/admin/providers/ProviderConfigPanel';
import { ProviderDirectory } from '@/components/admin/providers/ProviderDirectory';
import { PageHeader } from '@/components/shared/PageHeader';
import { Badge } from '@/components/ui/badge';
import { de } from '@/lib/i18n/de';
import { ApiClientError } from '@/services/api-client';
import { adminService } from '@/services/admin.service';
import { useAuth } from '@/store/auth-context';
import type { SocialProviderKey, SocialProviderSettings } from '@/types/api';

const t = de.admin.providers;

export default function AdminProvidersPage() {
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();
  const [selectedProvider, setSelectedProvider] =
    useState<SocialProviderKey>('instagram');
  const [forms, setForms] = useState<
    Partial<Record<SocialProviderKey, SocialProviderSettings>>
  >({});
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ['admin', 'providers'],
    queryFn: () => adminService.providers(),
    enabled: hasPermission('manage_social_providers'),
  });

  useEffect(() => {
    if (!query.data?.length) return;

    setForms((current) => {
      const next = { ...current };
      for (const provider of query.data) {
        next[provider.provider] = provider;
      }
      return next;
    });

    setSelectedProvider((current) =>
      query.data.some((provider) => provider.provider === current)
        ? current
        : query.data[0].provider,
    );
  }, [query.data]);

  const activeProvider = useMemo(
    () => query.data?.find((provider) => provider.provider === selectedProvider),
    [query.data, selectedProvider],
  );

  const activeForm = forms[selectedProvider] ?? activeProvider ?? null;

  const saveMutation = useMutation({
    mutationFn: () =>
      adminService.updateProvider(selectedProvider, {
        enabled: activeForm?.enabled,
        app_id: activeForm?.app_id,
        callback_url: activeForm?.callback_url,
        api_version: activeForm?.api_version,
        scopes: activeForm?.scopes,
      }),
    onSuccess: (provider) => {
      setMessage(t.saved);
      setError(null);
      setForms((current) => ({
        ...current,
        [provider.provider]: provider,
      }));
      void queryClient.invalidateQueries({ queryKey: ['admin', 'providers'] });
    },
    onError: (e: Error) => {
      setError(e instanceof ApiClientError ? e.message : t.saveFailed);
    },
  });

  if (!hasPermission('manage_social_providers')) {
    return <p className="text-sm text-on-surface-variant">{de.common.noData}</p>;
  }

  if (query.isLoading || !query.data?.length || !activeProvider || !activeForm) {
    return null;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={t.title}
        description={t.description}
        action={
          <Badge variant="draft" className="uppercase tracking-widest">
            {query.data.length} {t.providerCount}
          </Badge>
        }
      />

      {message && <p className="text-sm text-primary">{message}</p>}
      {error && <p className="text-sm text-error">{error}</p>}

      <ProviderDirectory
        providers={query.data}
        selectedProvider={selectedProvider}
        onSelect={setSelectedProvider}
        labels={{
          chooseProvider: t.chooseProvider,
          providerCount: t.providerCount,
          statusReady: t.statusReady,
          statusSetup: t.statusSetup,
          statusDisabled: t.statusDisabled,
        }}
      />

      <ProviderConfigPanel
        provider={activeProvider}
        form={activeForm}
        onChange={(next) =>
          setForms((current) => ({
            ...current,
            [selectedProvider]: next,
          }))
        }
        onSave={() => saveMutation.mutate()}
        isSaving={saveMutation.isPending}
        labels={{
          apiConfiguration: t.apiConfiguration,
          configureHint: t.configureHint,
          enabled: t.enabled,
          disabled: t.disabled,
          callbackUrl: t.callbackUrl,
          permissions: t.permissions,
          permissionsHint: t.permissionsHint,
          providerStatus: t.providerStatus,
          configured: t.configured,
          notConfigured: t.notConfigured,
          secretHint: t.secretHint,
          defaultCallback: t.defaultCallback,
          setupDoc: t.setupDoc,
          beforeSave: t.beforeSave,
          usedByChannels: t.usedByChannels,
          pageNote: t.pageNote,
          saveConfiguration: t.saveConfiguration,
          appIdHint: t.appIdHint,
          facebookAppIdHint: t.facebookAppIdHint,
          tiktokClientKeyHint: t.tiktokClientKeyHint,
        }}
      />
    </div>
  );
}
