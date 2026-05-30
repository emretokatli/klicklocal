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
import { billingService } from '@/services/billing.service';
import { useWorkspace } from '@/store/workspace-context';

export default function InvoicesPage() {
  const { workspaceId, workspace } = useWorkspace();

  const query = useQuery({
    queryKey: ['invoices', workspaceId],
    queryFn: () => billingService.invoices(workspaceId!),
    enabled: workspaceId !== null,
  });

  if (!workspaceId) {
    return (
      <EmptyState
        title={de.billing.noWorkspace}
        description={de.dashboard.selectWorkspace}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title={de.nav.invoices}
        description={workspace?.name ?? ''}
      />

      {!query.data?.length && !query.isLoading && (
        <EmptyState
          title={de.billing.noInvoices}
          description=""
        />
      )}

      {query.data && query.data.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{de.billing.invoiceNumber}</TableHead>
                  <TableHead>{de.billing.amount}</TableHead>
                  <TableHead>{de.common.status}</TableHead>
                  <TableHead>{de.billing.paidAt}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.data.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-mono text-xs">
                      {inv.invoice_number}
                    </TableCell>
                    <TableCell>
                      {formatMoney(inv.amount, inv.currency)}
                    </TableCell>
                    <TableCell>{inv.status}</TableCell>
                    <TableCell>
                      {inv.paid_at
                        ? new Date(inv.paid_at).toLocaleDateString('de-DE')
                        : '—'}
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
