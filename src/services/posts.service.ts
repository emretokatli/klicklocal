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

  create(workspaceId: number, title: string, content: string) {
    return apiPost<{ post: Post }>('/posts', {
      workspace_id: workspaceId,
      title,
      content,
    }).then((d) => d.post);
  },

  update(id: number, payload: { title?: string; content?: string }) {
    return apiPut<{ post: Post }>(`/posts/${id}`, payload).then((d) => d.post);
  },

  remove(id: number) {
    return apiDelete<null>(`/posts/${id}`);
  },

  schedule(id: number, scheduledAt: string) {
    return apiPost<{ post: Post }>(`/posts/${id}/schedule`, {
      scheduled_at: scheduledAt,
    }).then((d) => d.post);
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
