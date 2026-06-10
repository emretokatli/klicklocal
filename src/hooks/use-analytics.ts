import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics.service';

export function useKpi(workspaceId: number | null) {
  return useQuery({
    queryKey: ['analytics-kpi', workspaceId],
    queryFn: () => analyticsService.kpi(workspaceId!),
    enabled: workspaceId !== null,
  });
}
