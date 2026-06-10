'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { ApiClientError } from '@/services/api-client';
import { adminService } from '@/services/admin.service';
import { useAuth } from '@/store/auth-context';

export default function AdminSubscriptionsPage() {
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();
  const [workspaceId, setWorkspaceId] = useState('');
  const [planId, setPlanId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [demoOpen, setDemoOpen] = useState(false);
  const [demoWorkspaceId, setDemoWorkspaceId] = useState('');
  const [demoDays, setDemoDays] = useState('14');
  const [demoNotice, setDemoNotice] = useState<string | null>(null);

  const subsQuery = useQuery({
    queryKey: ['admin', 'subscriptions'],
    queryFn: () => adminService.subscriptions(),
    enabled: hasPermission('manage_subscriptions'),
  });

  const workspacesQuery = useQuery({
    queryKey: ['admin', 'workspaces'],
    queryFn: () => adminService.workspaces(),
    enabled: hasPermission('manage_subscriptions'),
  });

  const plansQuery = useQuery({
    queryKey: ['admin', 'plans'],
    queryFn: () => adminService.plans(),
    enabled: hasPermission('manage_subscriptions'),
  });

  const assignMutation = useMutation({
    mutationFn: () =>
      adminService.assignSubscription(Number(workspaceId), Number(planId)),
    onSuccess: () => {
      setWorkspaceId('');
      setPlanId('');
      setError(null);
      void queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions'] });
    },
    onError: (e: Error) => {
      setError(
        e instanceof ApiClientError
          ? e.message
          : de.admin.subscriptions.assignFailed,
      );
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => adminService.cancelSubscription(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions'] });
    },
  });

  const demoMutation = useMutation({
    mutationFn: () =>
      adminService.grantDemo(Number(demoWorkspaceId), Number(demoDays)),
    onSuccess: () => {
      setDemoNotice(de.admin.subscriptions.demoSuccess);
      setDemoWorkspaceId('');
      setDemoDays('14');
      void queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions'] });
    },
    onError: (e: Error) => {
      setDemoNotice(
        e instanceof ApiClientError ? e.message : de.admin.subscriptions.demoFailed,
      );
    },
  });

  if (!hasPermission('manage_subscriptions')) {
    return <p className="text-sm text-on-surface-variant">{de.common.noData}</p>;
  }

  return (
    <div>
      <PageHeader
        title={de.admin.subscriptions.title}
        description={de.admin.subscriptions.description}
        action={
          <Button variant="outline" onClick={() => { setDemoNotice(null); setDemoOpen(true); }}>
            {de.admin.subscriptions.demo}
          </Button>
        }
      />

      <Dialog open={demoOpen} onOpenChange={setDemoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{de.admin.subscriptions.demoTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-on-surface-variant">
                {de.admin.subscriptions.selectWorkspace}
              </Label>
              <Select value={demoWorkspaceId} onValueChange={setDemoWorkspaceId}>
                <SelectTrigger>
                  <SelectValue placeholder={de.admin.subscriptions.selectWorkspace} />
                </SelectTrigger>
                <SelectContent>
                  {workspacesQuery.data?.map((ws) => (
                    <SelectItem key={ws.id} value={String(ws.id)}>
                      {ws.name} ({ws.owner?.email ?? ws.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-on-surface-variant" htmlFor="demo-days">
                {de.admin.subscriptions.demoDays}
              </Label>
              <Input
                id="demo-days"
                type="number"
                min={1}
                max={365}
                value={demoDays}
                onChange={(e) => setDemoDays(e.target.value)}
              />
            </div>
            {demoNotice && (
              <p className={`text-sm ${demoNotice === de.admin.subscriptions.demoSuccess ? 'text-primary' : 'text-error'}`}>
                {demoNotice}
              </p>
            )}
            <Button
              className="w-full"
              disabled={!demoWorkspaceId || !demoDays || demoMutation.isPending}
              onClick={() => demoMutation.mutate()}
            >
              {de.admin.subscriptions.demoStart}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="mb-6">
        <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1">
            <label className="text-xs text-on-surface-variant">
              {de.admin.subscriptions.selectWorkspace}
            </label>
            <Select value={workspaceId} onValueChange={setWorkspaceId}>
              <SelectTrigger>
                <SelectValue placeholder={de.admin.subscriptions.selectWorkspace} />
              </SelectTrigger>
              <SelectContent>
                {workspacesQuery.data?.map((ws) => (
                  <SelectItem key={ws.id} value={String(ws.id)}>
                    {ws.name} ({ws.owner?.email ?? ws.id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-xs text-on-surface-variant">
              {de.admin.subscriptions.selectPlan}
            </label>
            <Select value={planId} onValueChange={setPlanId}>
              <SelectTrigger>
                <SelectValue placeholder={de.admin.subscriptions.selectPlan} />
              </SelectTrigger>
              <SelectContent>
                {plansQuery.data?.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            disabled={!workspaceId || !planId || assignMutation.isPending}
            onClick={() => assignMutation.mutate()}
          >
            {de.admin.subscriptions.assign}
          </Button>
        </CardContent>
      </Card>

      {error && <p className="mb-4 text-sm text-error">{error}</p>}

      {!subsQuery.data?.length && !subsQuery.isLoading && (
        <EmptyState title={de.admin.subscriptions.empty} description="" />
      )}

      {subsQuery.data && subsQuery.data.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{de.admin.subscriptions.workspace}</TableHead>
                  <TableHead>{de.admin.subscriptions.plan}</TableHead>
                  <TableHead>{de.admin.subscriptions.provider}</TableHead>
                  <TableHead>{de.admin.subscriptions.status}</TableHead>
                  <TableHead>{de.common.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subsQuery.data.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      {sub.workspace?.name ?? sub.workspace_id}
                    </TableCell>
                    <TableCell>{sub.plan?.name ?? sub.plan_id}</TableCell>
                    <TableCell>{sub.provider}</TableCell>
                    <TableCell>{sub.status}</TableCell>
                    <TableCell>
                      {['active', 'trialing', 'past_due'].includes(sub.status) && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={cancelMutation.isPending}
                          onClick={() => cancelMutation.mutate(sub.id)}
                        >
                          {de.admin.subscriptions.cancel}
                        </Button>
                      )}
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
