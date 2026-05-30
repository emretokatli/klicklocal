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

export default function AdminTransactionsPage() {
  const { hasPermission } = useAuth();

  const query = useQuery({
    queryKey: ['admin', 'transactions'],
    queryFn: () => adminService.transactions(),
    enabled: hasPermission('manage_subscriptions'),
  });

  if (!hasPermission('manage_subscriptions')) {
    return <p className="text-sm text-on-surface-variant">{de.common.noData}</p>;
  }

  return (
    <div>
      <PageHeader
        title={de.admin.transactions.title}
        description={de.admin.transactions.description}
      />

      {!query.data?.length && !query.isLoading && (
        <EmptyState title={de.admin.transactions.empty} description="" />
      )}

      {query.data && query.data.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>{de.admin.transactions.amount}</TableHead>
                  <TableHead>{de.admin.transactions.provider}</TableHead>
                  <TableHead>{de.admin.transactions.status}</TableHead>
                  <TableHead>{de.admin.transactions.date}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.data.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>{tx.id}</TableCell>
                    <TableCell>
                      {formatMoney(tx.amount, tx.currency)}
                    </TableCell>
                    <TableCell>{tx.provider}</TableCell>
                    <TableCell>{tx.status}</TableCell>
                    <TableCell>
                      {new Date(tx.created_at).toLocaleString('de-DE')}
                    </TableCell>
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
