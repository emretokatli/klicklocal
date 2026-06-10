import { useQuery } from '@tanstack/react-query';
import { commentsService } from '@/services/comments.service';

export function useComments(
  workspaceId: number | null,
  filters?: { platform?: string; sentiment?: string },
) {
  return useQuery({
    queryKey: ['comments', workspaceId, filters],
    queryFn: () => commentsService.list(workspaceId!, filters),
    enabled: workspaceId !== null,
  });
}
