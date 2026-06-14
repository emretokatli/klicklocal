'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Lock,
  Minus,
  Send,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { SubscriptionGate } from '@/components/billing/SubscriptionGate';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  useComments,
  useCommentStats,
  useReplyToComment,
  useSuggestReply,
} from '@/hooks/use-comments';
import { useWorkspace } from '@/store/workspace-context';
import { de } from '@/lib/i18n/de';
import { cn } from '@/lib/utils';
import { ApiClientError } from '@/services/api-client';
import type { Comment } from '@/types/api';

const PLATFORMS = ['instagram', 'tiktok', 'facebook', 'linkedin'] as const;
const SENTIMENTS = ['positive', 'neutral', 'negative'] as const;

const sentimentConfig = {
  positive: { label: de.comments.sentiments.positive, icon: ThumbsUp,   cls: 'text-green-500  bg-green-500/10'  },
  neutral:  { label: de.comments.sentiments.neutral,  icon: Minus,      cls: 'text-yellow-500 bg-yellow-500/10' },
  negative: { label: de.comments.sentiments.negative, icon: ThumbsDown, cls: 'text-red-500    bg-red-500/10'    },
};

function StatsRow({
  workspaceId,
  platform,
}: {
  workspaceId: number;
  platform?: string;
}) {
  const { data: stats, isLoading } = useCommentStats(workspaceId, platform);

  if (isLoading) {
    return (
      <div className="mb-6 grid grid-cols-3 gap-3">
        {SENTIMENTS.map((s) => (
          <Skeleton key={s} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="mb-6 grid grid-cols-3 gap-3">
      {SENTIMENTS.map((s) => {
        const config = sentimentConfig[s];
        const SentimentIcon = config.icon;
        const count = stats[s];
        const percent =
          stats.total > 0 ? `${Math.round((count / stats.total) * 100)} %` : de.comments.statsEmpty;

        return (
          <Card key={s}>
            <CardContent className="pt-4">
              <div className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium', config.cls)}>
                <SentimentIcon className="h-3.5 w-3.5" />
                <span>{config.label}</span>
              </div>
              <p className="mt-2 text-2xl font-semibold text-on-surface">{percent}</p>
              <p className="text-xs text-on-surface-variant">{de.comments.statsCount(count)}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function ReplyActions({ comment, workspaceId }: { comment: Comment; workspaceId: number }) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [paymentRequired, setPaymentRequired] = useState(false);

  const suggestMutation = useSuggestReply(workspaceId);
  const replyMutation = useReplyToComment(workspaceId);

  const isManual = comment.external_id === null;

  const handleError = (e: unknown, fallback: string) => {
    if (e instanceof ApiClientError && e.status === 402) {
      setPaymentRequired(true);
      return;
    }
    setError(e instanceof ApiClientError ? e.message : fallback);
  };

  const suggest = () => {
    setError(null);
    suggestMutation.mutate(comment.id, {
      onSuccess: (updated) => {
        setDraft(updated.suggested_reply ?? '');
        setEditorOpen(true);
      },
      onError: (e) => handleError(e, de.comments.suggestError),
    });
  };

  const openEditor = () => {
    setError(null);
    if (comment.suggested_reply) {
      setDraft(comment.suggested_reply);
      setEditorOpen(true);
      return;
    }
    suggest();
  };

  const send = () => {
    const replyText = draft.trim();
    if (replyText === '') {
      setError(de.comments.replyEmpty);
      return;
    }
    setError(null);
    replyMutation.mutate(
      { commentId: comment.id, replyText },
      { onError: (e) => handleError(e, de.comments.replyError) },
    );
  };

  if (paymentRequired) {
    return <UpgradeNotice />;
  }

  if (!editorOpen) {
    return (
      <div className="mt-3">
        <Button
          size="sm"
          variant="outline"
          onClick={openEditor}
          disabled={suggestMutation.isPending}
        >
          <Sparkles className="mr-1.5 h-3.5 w-3.5" />
          {suggestMutation.isPending ? de.comments.suggesting : de.comments.suggest}
        </Button>
        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-2 rounded-xl border border-primary/20 bg-primary/5 p-3">
      <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-primary">
        <Sparkles className="h-3.5 w-3.5" />
        {de.comments.suggestionLabel}
      </div>
      <Textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={de.comments.replyPlaceholder}
        rows={3}
        maxLength={2000}
        disabled={replyMutation.isPending}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={suggest}
          disabled={suggestMutation.isPending || replyMutation.isPending}
        >
          {suggestMutation.isPending ? de.comments.suggesting : de.comments.regenerate}
        </Button>
        <span title={isManual ? de.comments.manualNoReply : undefined}>
          <Button
            size="sm"
            onClick={send}
            disabled={isManual || replyMutation.isPending || suggestMutation.isPending}
          >
            <Send className="mr-1.5 h-3.5 w-3.5" />
            {replyMutation.isPending ? de.comments.sending : de.comments.send}
          </Button>
        </span>
      </div>
      {isManual && (
        <p className="text-xs text-on-surface-variant">{de.comments.manualNoReply}</p>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

function UpgradeNotice() {
  return (
    <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-outline-soft bg-fill-soft p-3">
      <div className="flex items-center gap-2">
        <Lock className="h-4 w-4 text-primary" />
        <div>
          <p className="text-sm font-medium text-on-surface">{de.billing.noSubscription}</p>
          <p className="text-xs text-on-surface-variant">{de.billing.gateDescription}</p>
        </div>
      </div>
      <Button asChild size="sm">
        <Link href="/billing">{de.billing.gateAction}</Link>
      </Button>
    </div>
  );
}

function RepliedBlock({ comment }: { comment: Comment }) {
  return (
    <div className="mt-3 space-y-1.5 rounded-xl border border-green-500/20 bg-green-500/5 p-3">
      <div className="flex items-center gap-1.5 text-xs font-medium text-green-400">
        <CheckCircle2 className="h-3.5 w-3.5" />
        {comment.replied_at
          ? de.comments.repliedAt(new Date(comment.replied_at).toLocaleDateString('de-DE'))
          : de.comments.repliedLabel}
      </div>
      <p className="text-sm text-on-surface">{comment.reply_text}</p>
    </div>
  );
}

function CommentCard({ comment, workspaceId }: { comment: Comment; workspaceId: number }) {
  const sentiment = sentimentConfig[comment.sentiment];
  const SentimentIcon = sentiment.icon;
  const isReplied = comment.replied_at !== null;

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

        {isReplied ? (
          <RepliedBlock comment={comment} />
        ) : (
          <SubscriptionGate fallback={<UpgradeNotice />}>
            <ReplyActions comment={comment} workspaceId={workspaceId} />
          </SubscriptionGate>
        )}
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
      <PageHeader title={de.comments.title} description={de.comments.description} />

      {/* Filter Row */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setPlatform(undefined)}
          className={cn(
            'rounded-full px-3 py-1 text-xs font-medium transition',
            !platform ? 'bg-primary text-on-primary' : 'bg-fill-soft text-on-surface-variant hover:bg-fill-strong',
          )}
        >
          {de.comments.filterAll}
        </button>
        {PLATFORMS.map((p) => (
          <button
            key={p}
            onClick={() => setPlatform(platform === p ? undefined : p)}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium capitalize transition',
              platform === p ? 'bg-primary text-on-primary' : 'bg-fill-soft text-on-surface-variant hover:bg-fill-strong',
            )}
          >
            {p}
          </button>
        ))}
        <span className="mx-2 self-center text-on-surface-variant/40">|</span>
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
                : 'bg-fill-soft text-on-surface-variant hover:bg-fill-strong',
            )}
          >
            {sentimentConfig[s].label}
          </button>
        ))}
      </div>

      <StatsRow workspaceId={workspaceId} platform={platform} />

      {isLoading && (
        <div className="flex justify-center py-16">
          <LoadingSpinner />
        </div>
      )}

      {!isLoading && (!comments || comments.length === 0) && (
        <EmptyState
          title={de.comments.noComments}
          description={de.comments.noCommentsHint}
        />
      )}

      {comments && comments.length > 0 && (
        <div className="space-y-3">
          {comments.map((comment) => (
            <CommentCard key={comment.id} comment={comment} workspaceId={workspaceId} />
          ))}
        </div>
      )}
    </div>
  );
}
