'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { platformRoleLabel } from '@/lib/permissions';
import { ApiClientError } from '@/services/api-client';
import { adminService } from '@/services/admin.service';
import { useAuth } from '@/store/auth-context';

const PLATFORM_ROLES = ['super_admin', 'admin', 'support'] as const;

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const query = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => adminService.users(),
    enabled: hasPermission('manage_users'),
  });

  const saveMutation = useMutation({
    mutationFn: ({ id, roles }: { id: number; roles: string[] }) =>
      adminService.updateUserRoles(id, roles),
    onSuccess: () => {
      setEditingId(null);
      setError(null);
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (e: Error) => {
      setError(
        e instanceof ApiClientError ? e.message : de.admin.users.saveFailed,
      );
    },
  });

  if (!hasPermission('manage_users')) {
    return (
      <p className="text-sm text-on-surface-variant">{de.common.noData}</p>
    );
  }

  return (
    <div>
      <PageHeader
        title={de.admin.users.title}
        description={de.admin.users.description}
      />
      {error && <p className="mb-4 text-sm text-error">{error}</p>}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{de.settings.name}</TableHead>
                <TableHead>{de.admin.users.email}</TableHead>
                <TableHead>{de.admin.users.roles}</TableHead>
                <TableHead className="w-[200px]">{de.common.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.data?.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    {u.platform_roles?.length
                      ? u.platform_roles.map(platformRoleLabel).join(', ')
                      : de.admin.users.noRoles}
                  </TableCell>
                  <TableCell>
                    {editingId === u.id ? (
                      <div className="flex flex-col gap-2">
                        <Select
                          value={selectedRoles[0] ?? '__none__'}
                          onValueChange={(v) =>
                            setSelectedRoles(v === '__none__' ? [] : [v])
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">
                              {de.admin.users.noRoles}
                            </SelectItem>
                            {PLATFORM_ROLES.map((r) => (
                              <SelectItem key={r} value={r}>
                                {platformRoleLabel(r)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            disabled={saveMutation.isPending}
                            onClick={() =>
                              saveMutation.mutate({
                                id: u.id,
                                roles: selectedRoles,
                              })
                            }
                          >
                            {de.admin.users.saveRoles}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingId(null)}
                          >
                            {de.common.cancel}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingId(u.id);
                          setSelectedRoles(u.platform_roles ?? []);
                        }}
                      >
                        {de.posts.edit}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
