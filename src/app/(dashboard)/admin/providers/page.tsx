'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { de } from '@/lib/i18n/de';
import { ApiClientError } from '@/services/api-client';
import { adminService } from '@/services/admin.service';
import { useAuth } from '@/store/auth-context';
import type { InstagramProviderSettings } from '@/types/api';

export default function AdminProvidersPage() {
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();
  const [form, setForm] = useState<InstagramProviderSettings | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ['admin', 'providers'],
    queryFn: () => adminService.providers(),
    enabled: hasPermission('manage_social_providers'),
  });

  useEffect(() => {
    const instagram = query.data?.find((p) => p.provider === 'instagram');
    if (instagram) setForm(instagram);
  }, [query.data]);

  const saveMutation = useMutation({
    mutationFn: () =>
      adminService.updateInstagramProvider({
        enabled: form?.enabled,
        app_id: form?.app_id,
        callback_url: form?.callback_url,
      }),
    onSuccess: () => {
      setMessage(de.admin.providers.saved);
      setError(null);
      void queryClient.invalidateQueries({ queryKey: ['admin', 'providers'] });
    },
    onError: (e: Error) => {
      setError(
        e instanceof ApiClientError ? e.message : de.admin.providers.saveFailed,
      );
    },
  });

  if (!hasPermission('manage_social_providers')) {
    return <p className="text-sm text-on-surface-variant">{de.common.noData}</p>;
  }

  if (!form) {
    return null;
  }

  return (
    <div>
      <PageHeader
        title={de.admin.providers.title}
        description={de.admin.providers.description}
      />

      {message && (
        <p className="mb-4 text-sm text-primary">{message}</p>
      )}
      {error && <p className="mb-4 text-sm text-error">{error}</p>}

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>{de.admin.providers.instagram}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-on-surface-variant">
            {de.admin.providers.providerStatus}:{' '}
            <span className="font-medium text-on-surface">
              {form.configured
                ? de.admin.providers.configured
                : de.admin.providers.notConfigured}
            </span>
          </p>

          <div className="flex items-center gap-2">
            <input
              id="ig-enabled"
              type="checkbox"
              checked={form.enabled}
              onChange={(e) =>
                setForm({ ...form, enabled: e.target.checked })
              }
              className="h-4 w-4 rounded border-white/20"
            />
            <Label htmlFor="ig-enabled">{de.admin.providers.enabled}</Label>
          </div>

          <div className="space-y-2">
            <Label>{de.admin.providers.appId}</Label>
            <Input
              value={form.app_id ?? ''}
              onChange={(e) =>
                setForm({ ...form, app_id: e.target.value || null })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>{de.admin.providers.callbackUrl}</Label>
            <Input
              value={form.callback_url}
              onChange={(e) =>
                setForm({ ...form, callback_url: e.target.value })
              }
            />
            {form.default_callback_url && (
              <p className="text-xs text-on-surface-variant">
                {de.admin.providers.defaultCallback}: {form.default_callback_url}
              </p>
            )}
          </div>

          <p className="text-xs text-on-surface-variant">
            {de.admin.providers.secretHint}
          </p>

          <Button
            disabled={saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
          >
            {de.common.save}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
