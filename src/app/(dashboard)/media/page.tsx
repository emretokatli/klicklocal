'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { de } from '@/lib/i18n/de';
import { resolveMediaUrl } from '@/lib/storage-url';
import { formatBytes } from '@/lib/utils';
import { ApiClientError } from '@/services/api-client';
import { mediaService } from '@/services/media.service';
import { useWorkspace } from '@/store/workspace-context';

export default function MediaPage() {
  const { workspaceId } = useWorkspace();
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaQuery = useQuery({
    queryKey: ['media', workspaceId],
    queryFn: () => mediaService.list(workspaceId!),
    enabled: workspaceId !== null,
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) =>
      mediaService.upload(workspaceId!, file, setProgress),
    onSuccess: () => {
      setProgress(0);
      void queryClient.invalidateQueries({ queryKey: ['media', workspaceId] });
    },
    onError: (e: Error) => {
      setProgress(0);
      setError(
        e instanceof ApiClientError ? e.message : de.media.uploadFailed,
      );
    },
  });

  return (
    <div>
      <PageHeader
        title={de.media.title}
        description={de.media.description}
        action={
          <Button
            disabled={!workspaceId || uploadMutation.isPending}
            onClick={() => document.getElementById('media-upload')?.click()}
          >
            {de.media.upload}
          </Button>
        }
      />

      <input
        id="media-upload"
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime"
        className="hidden"
        disabled={!workspaceId || uploadMutation.isPending}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            setError(null);
            uploadMutation.mutate(file);
          }
          e.target.value = '';
        }}
      />

      {uploadMutation.isPending && (
        <Card className="mb-6 p-4">
          <p className="mb-2 text-sm text-on-surface-variant">
            {de.media.uploading}
          </p>
          <Progress value={progress} />
        </Card>
      )}

      {error && <p className="mb-4 text-sm text-error">{error}</p>}

      {mediaQuery.isLoading && (
        <div className="flex justify-center py-16">
          <LoadingSpinner />
        </div>
      )}

      {mediaQuery.isSuccess && mediaQuery.data.length === 0 && (
        <EmptyState
          title={de.media.emptyTitle}
          description={de.media.emptyDesc}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {mediaQuery.data?.map(({ media, url }) => {
          const src = resolveMediaUrl(media.file_path, url);
          const isImage = media.mime_type.startsWith('image/');

          return (
            <Card key={media.id} className="overflow-hidden">
              <a
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="block aspect-square bg-surface-container-high"
              >
                {isImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={src}
                    alt={media.file_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-on-surface-variant">
                    {de.media.video}
                  </div>
                )}
              </a>
              <div className="border-t border-white/10 p-3">
                <p className="truncate text-sm font-medium">{media.file_name}</p>
                <p className="text-xs text-on-surface-variant">
                  {formatBytes(media.file_size)}
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
