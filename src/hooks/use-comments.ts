import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

export function useCommentStats(workspaceId: number | null, platform?: string) {
  return useQuery({
    queryKey: ['comment-stats', workspaceId, platform ?? null],
    queryFn: () => commentsService.stats(workspaceId!, { platform }),
    enabled: workspaceId !== null,
  });
}

export function useSuggestReply(workspaceId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: number) => commentsService.suggestReply(commentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['comments', workspaceId] });
    },
  });
}

export function useReplyToComment(workspaceId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, replyText }: { commentId: number; replyText: string }) =>
      commentsService.reply(commentId, replyText),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['comments', workspaceId] });
      void queryClient.invalidateQueries({ queryKey: ['comment-stats', workspaceId] });
    },
  });
}
