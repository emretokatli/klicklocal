'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { de } from '@/lib/i18n/de';
import { ApiClientError } from '@/services/api-client';
import { workspacesService } from '@/services/workspaces.service';

export default function WorkspacesPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => workspacesService.list(),
  });

  const createMutation = useMutation({
    mutationFn: () => workspacesService.create(name),
    onSuccess: () => {
      setName('');
      void queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
    onError: (e: Error) => {
      setError(
        e instanceof ApiClientError ? e.message : de.workspaces.createFailed,
      );
    },
  });

  return (
    <div>
      <PageHeader
        title={de.workspaces.title}
        description={de.workspaces.description}
      />

      <Card className="mb-6">
        <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row">
          <Input
            placeholder={de.workspaces.namePlaceholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1"
          />
          <Button
            disabled={!name.trim() || createMutation.isPending}
            onClick={() => createMutation.mutate()}
          >
            {de.workspaces.create}
          </Button>
        </CardContent>
      </Card>

      {error && <p className="mb-4 text-sm text-error">{error}</p>}

      {query.data?.length === 0 && (
        <EmptyState
          title={de.workspaces.emptyTitle}
          description={de.workspaces.emptyDesc}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {query.data?.map((ws) => (
          <Card key={ws.id}>
            <CardContent className="pt-6">
              <p className="font-medium">{ws.name}</p>
              <p className="text-sm text-on-surface-variant">{ws.slug}</p>
              <p className="mt-1 text-xs text-on-surface-variant/70">
                {ws.timezone}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
