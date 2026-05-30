'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { de } from '@/lib/i18n/de';
import { adminService } from '@/services/admin.service';
import { useAuth } from '@/store/auth-context';

export default function AdminCouponsPage() {
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');

  const query = useQuery({
    queryKey: ['admin', 'coupons'],
    queryFn: () => adminService.coupons(),
    enabled: hasPermission('manage_subscriptions'),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      adminService.createCoupon({
        code: code.toUpperCase(),
        name,
        type: 'percent',
        value: 10,
        is_active: true,
      }),
    onSuccess: () => {
      setCode('');
      setName('');
      void queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
    },
  });

  if (!hasPermission('manage_subscriptions')) {
    return <p className="text-sm text-on-surface-variant">{de.common.noData}</p>;
  }

  return (
    <div>
      <PageHeader
        title={de.admin.coupons.title}
        description={de.admin.coupons.description}
      />

      <Card className="mb-6">
        <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row">
          <Input
            placeholder={de.admin.coupons.code}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1"
          />
          <Input
            placeholder={de.settings.name}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1"
          />
          <Button
            disabled={!code.trim() || !name.trim() || createMutation.isPending}
            onClick={() => createMutation.mutate()}
          >
            {de.admin.coupons.create}
          </Button>
        </CardContent>
      </Card>

      {!query.data?.length && !query.isLoading && (
        <EmptyState title={de.admin.coupons.empty} description="" />
      )}

      {query.data && query.data.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{de.admin.coupons.code}</TableHead>
                  <TableHead>{de.settings.name}</TableHead>
                  <TableHead>{de.admin.coupons.type}</TableHead>
                  <TableHead>{de.admin.coupons.value}</TableHead>
                  <TableHead>{de.admin.coupons.redemptions}</TableHead>
                  <TableHead>{de.admin.plans.active}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.data.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono">{c.code}</TableCell>
                    <TableCell>{c.name}</TableCell>
                    <TableCell>{c.type}</TableCell>
                    <TableCell>{c.value}%</TableCell>
                    <TableCell>
                      {c.redeemed_count}
                      {c.max_redemptions != null ? ` / ${c.max_redemptions}` : ''}
                    </TableCell>
                    <TableCell>{c.is_active ? '✓' : '—'}</TableCell>
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
