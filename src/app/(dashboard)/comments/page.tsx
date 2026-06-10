'use client';

import { useState } from 'react';
import { MessageCircle, ThumbsUp, Minus, ThumbsDown } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Card, CardContent } from '@/components/ui/card';
import { useComments } from '@/hooks/use-comments';
import { useWorkspace } from '@/store/workspace-context';
import { cn } from '@/lib/utils';
import type { Comment } from '@/types/api';

const PLATFORMS = ['instagram', 'tiktok', 'facebook', 'linkedin'] as const;
const SENTIMENTS = ['positive', 'neutral', 'negative'] as const;

const sentimentConfig = {
  positive: { label: 'Positiv',  icon: ThumbsUp,   cls: 'text-green-500  bg-green-500/10'  },
  neutral:  { label: 'Neutral',  icon: Minus,       cls: 'text-yellow-500 bg-yellow-500/10' },
  negative: { label: 'Negativ',  icon: ThumbsDown,  cls: 'text-red-500    bg-red-500/10'    },
};

function CommentCard({ comment }: { comment: Comment }) {
  const sentiment = sentimentConfig[comment.sentiment];
  const SentimentIcon = sentiment.icon;

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
              <span className="font-medium text-on-surface">@{comment.author}</span>
              <span>·</span>
              <span className="capitalize">{comment.platform}</span>
              {comment.commented_at && (
                <>
                  <span>·</span>
                  <span>{new Date(comment.commented_at).toLocaleDateString('de-DE')}</span>
                </>
              )}
            </div>
            <p className="text-sm text-on-surface">{comment.text}</p>
          </div>
          <div className={cn('flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium', sentiment.cls)}>
            <SentimentIcon className="h-3.5 w-3.5" />
            <span>{sentiment.label}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CommentsPage() {
  const { workspaceId } = useWorkspace();
  const [platform, setPlatform] = useState<string | undefined>();
  const [sentiment, setSentiment] = useState<string | undefined>();

  const { data: comments, isLoading } = useComments(workspaceId, { platform, sentiment });

  if (!workspaceId) {
    return <EmptyState title="Kein Workspace ausgewählt" description="" />;
  }

  return (
    <div>
      <PageHeader
        title="Kommentare"
        description="Kommentare und Reaktionen von deinen Social-Media-Kanälen"
      />

      {/* Filter Row */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setPlatform(undefined)}
          className={cn(
            'rounded-full px-3 py-1 text-xs font-medium transition',
            !platform ? 'bg-primary text-on-primary' : 'bg-white/5 text-on-surface-variant hover:bg-white/10',
          )}
        >
          Alle
        </button>
        {PLATFORMS.map((p) => (
          <button
            key={p}
            onClick={() => setPlatform(platform === p ? undefined : p)}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium capitalize transition',
              platform === p ? 'bg-primary text-on-primary' : 'bg-white/5 text-on-surface-variant hover:bg-white/10',
            )}
          >
            {p}
          </button>
        ))}
        <span className="mx-2 self-center text-white/20">|</span>
        {SENTIMENTS.map((s) => (
          <button
            key={s}
            onClick={() => setSentiment(sentiment === s ? undefined : s)}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium transition',
              sentiment === s
                ? s === 'positive' ? 'bg-green-500/20 text-green-400'
                  : s === 'negative' ? 'bg-red-500/20 text-red-400'
                  : 'bg-yellow-500/20 text-yellow-400'
                : 'bg-white/5 text-on-surface-variant hover:bg-white/10',
            )}
          >
            {sentimentConfig[s].label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <LoadingSpinner />
        </div>
      )}

      {!isLoading && (!comments || comments.length === 0) && (
        <EmptyState
          title="Keine Kommentare"
          description="Wenn deine Social-Media-Konten verbunden sind, erscheinen hier die Kommentare."
        />
      )}

      {comments && comments.length > 0 && (
        <div className="space-y-3">
          {comments.map((comment) => (
            <CommentCard key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
}
