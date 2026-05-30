'use client';

import { useQuery } from '@tanstack/react-query';

import { UsageMeters } from '@/components/billing/UsageMeters';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { billingService } from '@/services/billing.service';
import { de } from '@/lib/i18n/de';
import { useWorkspace } from '@/store/workspace-context';

export default function CustomerUsagePage() {
  const { workspaceId, workspace } = useWorkspace();

  const query = useQuery({
    queryKey: ['usage', workspaceId],
    queryFn: () => billingService.usage(workspaceId!),
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
        title={de.nav.usage}
        description={workspace?.name ?? ''}
      />
      {query.data && <UsageMeters usage={query.data} title={de.billing.usageTitle} />}
    </div>
  );
}
