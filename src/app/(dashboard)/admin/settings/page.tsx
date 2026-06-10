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
import type { PlatformSettings } from '@/types/api';

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();
  const [form, setForm] = useState<PlatformSettings | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: () => adminService.settings(),
    enabled: hasPermission('manage_platform_settings'),
  });

  useEffect(() => {
    if (!query.data) return;
    const timer = setTimeout(() => { setForm(query.data!); }, 0);
    return () => { clearTimeout(timer); };
  }, [query.data]);

  const saveMutation = useMutation({
    mutationFn: () => adminService.updateSettings(form!),
    onSuccess: () => {
      setMessage(de.admin.settings.saved);
      setError(null);
      void queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
    },
    onError: (e: Error) => {
      setError(
        e instanceof ApiClientError ? e.message : de.admin.settings.saveFailed,
      );
    },
  });

  if (!hasPermission('manage_platform_settings')) {
    return <p className="text-sm text-on-surface-variant">{de.common.noData}</p>;
  }

  if (!form) {
    return null;
  }

  return (
    <div>
      <PageHeader
        title={de.admin.settings.title}
        description={de.admin.settings.description}
      />
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>{de.admin.settings.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{de.admin.settings.appName}</Label>
            <Input
              value={form.app_name}
              onChange={(e) =>
                setForm({ ...form, app_name: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>{de.admin.settings.supportEmail}</Label>
            <Input
              type="email"
              value={form.support_email}
              onChange={(e) =>
                setForm({ ...form, support_email: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>{de.admin.settings.timezone}</Label>
            <Input
              value={form.default_timezone}
              onChange={(e) =>
                setForm({ ...form, default_timezone: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>{de.admin.settings.trialDays}</Label>
            <Input
              type="number"
              value={form.trial_days}
              onChange={(e) =>
                setForm({ ...form, trial_days: Number(e.target.value) })
              }
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.maintenance_mode}
              onChange={(e) =>
                setForm({ ...form, maintenance_mode: e.target.checked })
              }
            />
            {de.admin.settings.maintenance}
          </label>
          <Button
            disabled={saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
          >
            {de.common.save}
          </Button>
          {message && <p className="text-sm text-primary">{message}</p>}
          {error && <p className="text-sm text-error">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
