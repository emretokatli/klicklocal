import { Badge } from '@/components/ui/badge';
import { POST_STATUS_LABELS } from '@/lib/i18n/de';
import type { PostStatus } from '@/types/api';

const variantMap: Record<
  PostStatus,
  'draft' | 'scheduled' | 'processing' | 'published' | 'failed'
> = {
  draft: 'draft',
  scheduled: 'scheduled',
  processing: 'processing',
  published: 'published',
  failed: 'failed',
};

export function StatusBadge({ status }: { status: PostStatus }) {
  return (
    <Badge variant={variantMap[status]} className="normal-case">
      {POST_STATUS_LABELS[status]}
    </Badge>
  );
}
