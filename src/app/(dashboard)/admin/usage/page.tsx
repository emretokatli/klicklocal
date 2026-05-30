'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { UsageMeters } from '@/components/billing/UsageMeters';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { de } from '@/lib/i18n/de';
import type { BillingOverview, MeteredUsageItem } from '@/types/api';
import { adminService } from '@/services/admin.service';
import { useAuth } from '@/store/auth-context';

export default function AdminUsagePage() {
  const { hasPermission } = useAuth();
  const [workspaceFilter, setWorkspaceFilter] = useState<string>('all');

  const workspacesQuery = useQuery({
    queryKey: ['admin', 'workspaces'],
    queryFn: () => adminService.workspaces(),
    enabled: hasPermission('view_usage_analytics'),
  });

  const usageQuery = useQuery({
    queryKey: ['admin', 'usage', workspaceFilter],
    queryFn: () =>
      adminService.usage(
        workspaceFilter !== 'all'
          ? { workspace_id: Number(workspaceFilter) }
          : { limit: 50 },
      ),
    enabled: hasPermission('view_usage_analytics'),
  });

  if (!hasPermission('view_usage_analytics')) {
    return <p className="text-sm text-on-surface-variant">{de.common.noData}</p>;
  }

  const billingSummary = usageQuery.data?.billing_summary as
    | BillingOverview
    | undefined;
  const metered = billingSummary?.usage as
    | Record<string, MeteredUsageItem>
    | undefined;

  return (
    <div>
      <PageHeader
        title={de.admin.usage.title}
        description={de.admin.usage.description}
      />

      <div className="mb-6 max-w-xs">
        <Select value={workspaceFilter} onValueChange={setWorkspaceFilter}>
          <SelectTrigger>
            <SelectValue placeholder={de.admin.usage.filterWorkspace} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{de.admin.usage.allWorkspaces}</SelectItem>
            {workspacesQuery.data?.map((ws) => (
              <SelectItem key={ws.id} value={String(ws.id)}>
                {ws.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {metered && workspaceFilter !== 'all' && (
        <div className="mb-6 max-w-xl">
          <UsageMeters
            usage={metered}
            title={de.admin.usage.metered}
          />
        </div>
      )}

      {usageQuery.data?.subscription_usage &&
        workspaceFilter !== 'all' && (
          <Card className="mb-6 max-w-xl">
            <CardHeader>
              <CardTitle className="text-base">{de.admin.usage.metered}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {Object.entries(usageQuery.data.subscription_usage).map(
                ([key, val]) => (
                  <span
                    key={key}
                    className="rounded-lg bg-white/5 px-2 py-1 text-xs"
                  >
                    {key}: {val}
                  </span>
                ),
              )}
            </CardContent>
          </Card>
        )}

      {usageQuery.data?.analytics_records && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{de.admin.usage.analytics}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{de.common.status}</TableHead>
                  <TableHead>{de.admin.usage.metric}</TableHead>
                  <TableHead>{de.admin.usage.quantity}</TableHead>
                  <TableHead>{de.admin.usage.workspace}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usageQuery.data.analytics_records.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.type}</TableCell>
                    <TableCell>{r.metric}</TableCell>
                    <TableCell>{r.quantity}</TableCell>
                    <TableCell>{r.workspace?.name ?? '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
