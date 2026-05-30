import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { postsService } from '@/services/posts.service';

export function usePosts(workspaceId: number | null) {
  return useQuery({
    queryKey: ['posts', workspaceId],
    queryFn: () => postsService.list(workspaceId!),
    enabled: workspaceId !== null,
  });
}

export function usePostMutations(workspaceId: number | null) {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['posts', workspaceId] });

  const create = useMutation({
    mutationFn: (payload: { title: string; content: string }) =>
      postsService.create(workspaceId!, payload.title, payload.content),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({
      id,
      ...payload
    }: {
      id: number;
      title?: string;
      content?: string;
    }) => postsService.update(id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => postsService.remove(id),
    onSuccess: invalidate,
  });

  const schedule = useMutation({
    mutationFn: ({ id, scheduledAt }: { id: number; scheduledAt: string }) =>
      postsService.schedule(id, scheduledAt),
    onSuccess: invalidate,
  });

  return { create, update, remove, schedule };
}
