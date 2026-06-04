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
    mutationFn: (payload: {
      title?: string;
      content?: string;
      media_id?: number | null;
    }) => postsService.create(workspaceId!, payload),
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
      media_id?: number | null;
    }) => postsService.update(id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => postsService.remove(id),
    onSuccess: invalidate,
  });

  const schedule = useMutation({
    mutationFn: ({
      id,
      scheduledAt,
      socialAccountIds,
    }: {
      id: number;
      scheduledAt: string;
      socialAccountIds?: number[];
    }) => postsService.schedule(id, scheduledAt, socialAccountIds),
    onSuccess: invalidate,
  });

  const publishNow = useMutation({
    mutationFn: ({
      id,
      socialAccountIds,
    }: {
      id: number;
      socialAccountIds?: number[];
    }) => postsService.publishNow(id, socialAccountIds),
    onSuccess: invalidate,
  });

  return { create, update, remove, schedule, publishNow };
}
