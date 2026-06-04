'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { DataTable } from '@/components/shared/DataTable';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { usePosts, usePostMutations } from '@/hooks/use-posts';
import { de } from '@/lib/i18n/de';
import { formatDate } from '@/lib/utils';
import { ApiClientError } from '@/services/api-client';
import { mediaService } from '@/services/media.service';
import { socialAccountsService } from '@/services/social-accounts.service';
import type { Post } from '@/types/api';
import { useWorkspace } from '@/store/workspace-context';

const PAGE_SIZE = 8;

export default function PostsPage() {
  const { workspaceId } = useWorkspace();
  const postsQuery = usePosts(workspaceId);
  const mutations = usePostMutations(workspaceId);
  const [page, setPage] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [editPost, setEditPost] = useState<Post | null>(null);
  const [schedulePost, setSchedulePost] = useState<Post | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mediaId, setMediaId] = useState<number | null>(null);
  const [scheduledAt, setScheduledAt] = useState('');
  const [publishToInstagram, setPublishToInstagram] = useState(true);

  const mediaQuery = useQuery({
    queryKey: ['media', workspaceId],
    queryFn: () => mediaService.list(workspaceId!),
    enabled: workspaceId !== null,
  });

  const instagramQuery = useQuery({
    queryKey: ['instagram', 'status', workspaceId],
    queryFn: () => socialAccountsService.instagramStatus(workspaceId!),
    enabled: workspaceId !== null,
  });

  const instagramAccountId = instagramQuery.data?.connected
    ? instagramQuery.data.account?.id
    : undefined;

  const paginated = useMemo(() => {
    const all = postsQuery.data ?? [];
    const start = page * PAGE_SIZE;
    return all.slice(start, start + PAGE_SIZE);
  }, [postsQuery.data, page]);

  const totalPages = Math.max(
    1,
    Math.ceil((postsQuery.data?.length ?? 0) / PAGE_SIZE),
  );

  function resetForm() {
    setTitle('');
    setContent('');
    setMediaId(null);
    setScheduledAt('');
    setPublishToInstagram(true);
    setError(null);
  }

  function instagramAccountIds(): number[] | undefined {
    if (!publishToInstagram || instagramAccountId === undefined) {
      return undefined;
    }

    return [instagramAccountId];
  }

  async function handleCreate() {
    try {
      await mutations.create.mutateAsync({
        title,
        content,
        media_id: mediaId,
      });
      setCreateOpen(false);
      resetForm();
    } catch (e) {
      setError(
        e instanceof ApiClientError ? e.message : de.posts.errors.create,
      );
    }
  }

  async function handleUpdate() {
    if (!editPost) return;
    try {
      await mutations.update.mutateAsync({
        id: editPost.id,
        title,
        content,
        media_id: mediaId,
      });
      setEditPost(null);
      resetForm();
    } catch (e) {
      setError(
        e instanceof ApiClientError ? e.message : de.posts.errors.update,
      );
    }
  }

  async function handleSchedule() {
    if (!schedulePost) return;
    try {
      await mutations.schedule.mutateAsync({
        id: schedulePost.id,
        scheduledAt: new Date(scheduledAt).toISOString(),
        socialAccountIds: instagramAccountIds(),
      });
      setSchedulePost(null);
      resetForm();
    } catch (e) {
      setError(
        e instanceof ApiClientError ? e.message : de.posts.errors.schedule,
      );
    }
  }

  async function handleDelete(post: Post) {
    if (!confirm(de.posts.deleteConfirm)) return;
    try {
      await mutations.remove.mutateAsync(post.id);
    } catch (e) {
      setError(
        e instanceof ApiClientError ? e.message : de.posts.errors.delete,
      );
    }
  }

  async function handlePublishNow(post: Post) {
    try {
      await mutations.publishNow.mutateAsync({
        id: post.id,
        socialAccountIds: instagramAccountIds(),
      });
    } catch (e) {
      setError(
        e instanceof ApiClientError ? e.message : de.posts.errors.publish,
      );
    }
  }

  const columns = [
    {
      key: 'title',
      header: de.posts.titleLabel,
      cell: (row: Post) => row.title || de.posts.untitled,
    },
    {
      key: 'status',
      header: de.common.status,
      cell: (row: Post) => <StatusBadge status={row.status} />,
    },
    {
      key: 'scheduled',
      header: de.posts.scheduledColumn,
      cell: (row: Post) => formatDate(row.scheduled_at),
    },
    {
      key: 'actions',
      header: de.common.actions,
      cell: (row: Post) => (
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEditPost(row);
              setTitle(row.title ?? '');
              setContent(row.content ?? '');
              setMediaId(row.media_id ?? null);
            }}
          >
            {de.posts.edit}
          </Button>
          {(row.status === 'draft' || row.status === 'failed') && (
            <>
              {instagramAccountId !== undefined && (
                <Button
                  size="sm"
                  variant="default"
                  disabled={mutations.publishNow.isPending}
                  onClick={() => void handlePublishNow(row)}
                >
                  {de.posts.publishNow}
                </Button>
              )}
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setSchedulePost(row);
                  setScheduledAt('');
                  setMediaId(row.media_id ?? null);
                }}
              >
                {de.posts.schedule}
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="destructive"
            onClick={() => void handleDelete(row)}
          >
            {de.posts.delete}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={de.posts.title}
        description={de.posts.description}
        action={
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button disabled={!workspaceId}>{de.posts.newPost}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{de.posts.createPost}</DialogTitle>
              </DialogHeader>
              <PostForm
                title={title}
                content={content}
                mediaId={mediaId}
                mediaOptions={(mediaQuery.data ?? []).map((m) => ({
                  id: m.media.id,
                  file_name: m.media.file_name,
                }))}
                onTitleChange={setTitle}
                onContentChange={setContent}
                onMediaIdChange={setMediaId}
                error={error}
                onSubmit={() => void handleCreate()}
                submitLabel={de.common.create}
                pending={mutations.create.isPending}
              />
            </DialogContent>
          </Dialog>
        }
      />

      {error && !createOpen && !editPost && !schedulePost && (
        <p className="mb-4 text-sm text-error">{error}</p>
      )}

      {postsQuery.isLoading && (
        <div className="flex justify-center py-16">
          <LoadingSpinner />
        </div>
      )}

      {!postsQuery.isLoading && !workspaceId && (
        <EmptyState
          title={de.posts.noWorkspaceTitle}
          description={de.posts.noWorkspaceDesc}
        />
      )}

      {!postsQuery.isLoading && workspaceId && (
        <>
          <div className="glass-card overflow-hidden rounded-2xl">
            <DataTable
              columns={columns}
              data={paginated}
              emptyMessage={de.posts.empty}
            />
          </div>
          {(postsQuery.data?.length ?? 0) > PAGE_SIZE && (
            <div className="mt-4 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                {de.common.previous}
              </Button>
              <span className="text-sm text-on-surface-variant">
                {de.common.pageOf(page + 1, totalPages)}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                {de.common.next}
              </Button>
            </div>
          )}
        </>
      )}

      <Dialog open={!!editPost} onOpenChange={(o) => !o && setEditPost(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{de.posts.editPost}</DialogTitle>
          </DialogHeader>
          <PostForm
            title={title}
            content={content}
            mediaId={mediaId}
            mediaOptions={(mediaQuery.data ?? []).map((m) => ({
              id: m.media.id,
              file_name: m.media.file_name,
            }))}
            onTitleChange={setTitle}
            onContentChange={setContent}
            onMediaIdChange={setMediaId}
            error={error}
            onSubmit={() => void handleUpdate()}
            submitLabel={de.common.save}
            pending={mutations.update.isPending}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!schedulePost}
        onOpenChange={(o) => !o && setSchedulePost(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{de.posts.schedulePost}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {error && <p className="text-sm text-error">{error}</p>}
            <div className="space-y-2">
              <Label htmlFor="scheduled">{de.posts.publishAt}</Label>
              <Input
                id="scheduled"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
            </div>
            {instagramAccountId !== undefined && (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={publishToInstagram}
                  onChange={(e) => setPublishToInstagram(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20"
                />
                {de.posts.publishInstagram}
              </label>
            )}
            <Button
              className="w-full"
              disabled={!scheduledAt || mutations.schedule.isPending}
              onClick={() => void handleSchedule()}
            >
              {de.posts.schedule}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PostForm({
  title,
  content,
  mediaId,
  mediaOptions,
  onTitleChange,
  onContentChange,
  onMediaIdChange,
  error,
  onSubmit,
  submitLabel,
  pending,
}: {
  title: string;
  content: string;
  mediaId: number | null;
  mediaOptions: { id: number; file_name: string }[];
  onTitleChange: (v: string) => void;
  onContentChange: (v: string) => void;
  onMediaIdChange: (v: number | null) => void;
  error: string | null;
  onSubmit: () => void;
  submitLabel: string;
  pending: boolean;
}) {
  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-error">{error}</p>}
      <div className="space-y-2">
        <Label>{de.posts.titleLabel}</Label>
        <Input value={title} onChange={(e) => onTitleChange(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>{de.posts.contentLabel}</Label>
        <Textarea
          rows={4}
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>{de.posts.mediaLabel}</Label>
        <select
          className="w-full rounded-md border border-white/20 bg-transparent px-3 py-2 text-sm"
          value={mediaId ?? ''}
          onChange={(e) =>
            onMediaIdChange(e.target.value ? Number(e.target.value) : null)
          }
        >
          <option value="">—</option>
          {mediaOptions.map((m) => (
            <option key={m.id} value={m.id}>
              {m.file_name}
            </option>
          ))}
        </select>
      </div>
      <Button
        className="w-full"
        disabled={!content.trim() || pending}
        onClick={onSubmit}
      >
        {submitLabel}
      </Button>
    </div>
  );
}
