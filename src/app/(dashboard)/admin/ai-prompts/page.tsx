'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
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
import { adminService } from '@/services/admin.service';
import { useAuth } from '@/store/auth-context';

export default function AdminAiPromptsPage() {
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();

  const query = useQuery({
    queryKey: ['admin', 'ai-prompts'],
    queryFn: () => adminService.aiPrompts(),
    enabled: hasPermission('manage_ai_prompts'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      adminService.setAiPromptActive(id, active),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'ai-prompts'] });
    },
  });

  if (!hasPermission('manage_ai_prompts')) {
    return <p className="text-sm text-on-surface-variant">{de.common.noData}</p>;
  }

  return (
    <div>
      <PageHeader
        title={de.admin.aiPrompts.title}
        description={de.admin.aiPrompts.description}
      />
      {!query.data?.length && !query.isLoading && (
        <EmptyState title={de.admin.aiPrompts.empty} description="" />
      )}
      {query.data && query.data.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{de.admin.aiPrompts.key}</TableHead>
                  <TableHead>{de.settings.name}</TableHead>
                  <TableHead>{de.admin.aiPrompts.category}</TableHead>
                  <TableHead>{de.admin.aiPrompts.active}</TableHead>
                  <TableHead>{de.common.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.data.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs">{p.key}</TableCell>
                    <TableCell>{p.name}</TableCell>
                    <TableCell>{p.category}</TableCell>
                    <TableCell>{p.is_active ? '✓' : '—'}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={toggleMutation.isPending}
                        onClick={() =>
                          toggleMutation.mutate({
                            id: p.id,
                            active: !p.is_active,
                          })
                        }
                      >
                        {de.admin.aiPrompts.toggleActive}
                      </Button>
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
