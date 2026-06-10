import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api-client';
import type { Post, PostStats } from '@/types/api';

export const postsService = {
  list(workspaceId: number) {
    return apiGet<{ posts: Post[] }>(
      `/posts?workspace_id=${workspaceId}`,
    ).then((d) => d.posts);
  },

  get(id: number) {
    return apiGet<{ post: Post }>(`/posts/${id}`).then((d) => d.post);
  },

  create(
    workspaceId: number,
    payload: { title?: string; content?: string; media_id?: number | null },
  ) {
    return apiPost<{ post: Post }>('/posts', {
      workspace_id: workspaceId,
      ...payload,
    }).then((d) => d.post);
  },

  update(
    id: number,
    payload: { title?: string; content?: string; media_id?: number | null },
  ) {
    return apiPut<{ post: Post }>(`/posts/${id}`, payload).then((d) => d.post);
  },

  remove(id: number) {
    return apiDelete<null>(`/posts/${id}`);
  },

  schedule(
    id: number,
    scheduledAt: string,
    socialAccountIds?: number[],
  ) {
    return apiPost<{ post: Post }>(`/posts/${id}/schedule`, {
      scheduled_at: scheduledAt,
      ...(socialAccountIds?.length
        ? { social_account_ids: socialAccountIds }
        : {}),
    }).then((d) => d.post);
  },

  publishNow(id: number, socialAccountIds?: number[]) {
    return apiPost<{ post: Post }>(`/posts/${id}/publish`, {
      ...(socialAccountIds?.length
        ? { social_account_ids: socialAccountIds }
        : {}),
    }).then((d) => d.post);
  },

  quickPublish(
    workspaceId: number,
    data: { platform: string; content: string; media_id?: number | null },
  ) {
    return apiPost<{ post_id: number; message: string }>(
      '/posts/quick-publish',
      data,
    );
  },

  computeStats(posts: Post[]): PostStats {
    return posts.reduce(
      (acc, post) => {
        acc.total += 1;
        if (post.status === 'scheduled' || post.status === 'processing') {
          acc.scheduled += 1;
        } else if (post.status === 'published') {
          acc.published += 1;
        } else if (post.status === 'failed') {
          acc.failed += 1;
        } else if (post.status === 'draft') {
          acc.draft += 1;
        }
        return acc;
      },
      { total: 0, scheduled: 0, published: 0, failed: 0, draft: 0 },
    );
  },
};
