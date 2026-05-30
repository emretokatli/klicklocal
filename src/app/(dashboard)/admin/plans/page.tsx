'use client';

import { useQuery } from '@tanstack/react-query';

import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { de } from '@/lib/i18n/de';
import { formatMoney } from '@/lib/format-money';
import { adminService } from '@/services/admin.service';
import { useAuth } from '@/store/auth-context';

export default function AdminPlansPage() {
  const { hasPermission } = useAuth();

  const query = useQuery({
    queryKey: ['admin', 'plans'],
    queryFn: () => adminService.plans(),
    enabled: hasPermission('manage_plans'),
  });

  if (!hasPermission('manage_plans')) {
    return <p className="text-sm text-on-surface-variant">{de.common.noData}</p>;
  }

  return (
    <div>
      <PageHeader
        title={de.admin.plans.title}
        description={de.admin.plans.description}
      />

      {!query.data?.length && !query.isLoading && (
        <EmptyState title={de.admin.plans.empty} description="" />
      )}

      {query.data && query.data.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{de.settings.name}</TableHead>
                  <TableHead>{de.admin.plans.slug}</TableHead>
                  <TableHead>{de.admin.plans.monthly}</TableHead>
                  <TableHead>{de.admin.plans.yearly}</TableHead>
                  <TableHead>{de.admin.plans.trialDays}</TableHead>
                  <TableHead>{de.admin.plans.active}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.data.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell>{plan.slug}</TableCell>
                    <TableCell>{formatMoney(plan.monthly_price)}</TableCell>
                    <TableCell>{formatMoney(plan.yearly_price)}</TableCell>
                    <TableCell>{plan.trial_days}</TableCell>
                    <TableCell>{plan.is_active ? '✓' : '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {query.data?.map((plan) =>
        plan.features && plan.features.length > 0 ? (
          <Card key={`f-${plan.id}`} className="mt-4">
            <CardContent className="pt-6">
              <p className="mb-2 text-sm font-medium">
                {plan.name} — {de.admin.plans.features}
              </p>
              <div className="flex flex-wrap gap-2">
                {plan.features.map((f) => (
                  <span
                    key={f.id}
                    className="rounded-lg bg-white/5 px-2 py-1 text-xs"
                  >
                    {f.feature_key}: {f.feature_value}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null,
      )}
    </div>
  );
}
