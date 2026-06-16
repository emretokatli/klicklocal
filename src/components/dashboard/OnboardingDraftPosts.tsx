'use client';

import { useMutation } from '@tanstack/react-query';
import { CheckCircle2, ImageIcon, Send, Share2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { de } from '@/lib/i18n/de';
import { mergeOnboardingData } from '@/lib/onboarding-wizard/constants';
import type { SamplePost } from '@/lib/onboarding-wizard/constants';
import { ApiClientError } from '@/services/api-client';
import { postsService } from '@/services/posts.service';
import { usePaywall } from '@/store/paywall-context';

type OnboardingDraftPostsProps = {
  workspaceId: number;
  /** Raw onboarding_data from the auth session; may be null/partial. */
  onboardingData: Record<string, unknown> | null | undefined;
};

/** Build the publishable content from the editable caption + hashtags. */
function buildContent(caption: string, hashtags: string): string {
  const parts = [caption.trim()];
  if (hashtags.trim()) parts.push(hashtags.trim());
  return parts.filter(Boolean).join('\n\n');
}

function DraftPostCard({
  post,
  index,
  workspaceId,
}: {
  post: SamplePost;
  index: number;
  workspaceId: number;
}) {
  const t = de.dashboard.draftPosts;
  const { open: openPaywall } = usePaywall();

  const [caption, setCaption] = useState(post.caption);
  const [hashtags, setHashtags] = useState(post.hashtags.join(' '));

  const publishMutation = useMutation({
    mutationFn: () =>
      postsService.quickPublish(workspaceId, {
        platform: 'instagram',
        content: buildContent(caption, hashtags),
      }),
    onError: (e: Error) => {
      // The subscription.required + feature.quota middleware reply with 402.
      // The api-client interceptor already opens the central paywall modal;
      // here we just tailor its headline to the publish flow.
      if (e instanceof ApiClientError && e.status === 402) {
        openPaywall('publish');
      }
    },
  });

  const apiError =
    publishMutation.error instanceof ApiClientError
      ? publishMutation.error
      : null;

  // 402 → central paywall modal. A 422 with a `platform` error means no social
  // account is connected yet (a business rule, not a bad request) — guide the
  // user to connect one instead of showing a raw "Validation failed." message.
  const isPaywall = apiError?.status === 402;
  const needsAccount =
    apiError?.status === 422 && Boolean(apiError.errors?.platform);

  // Prefer the first field-level message over the generic envelope message.
  const firstFieldError = apiError?.errors
    ? Object.values(apiError.errors)[0]?.[0]
    : undefined;

  const published = publishMutation.isSuccess;
  const otherError =
    publishMutation.isError && !isPaywall && !needsAccount
      ? apiError
        ? (firstFieldError ?? apiError.message)
        : t.publishFailed
      : null;

  return (
    <li className="rounded-2xl border border-outline-soft bg-fill-soft p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">
          {t.postLabel(index + 1)}
        </span>
        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-medium text-primary">
          {t.badge}
        </span>
      </div>

      <label className="mb-1.5 block text-xs font-semibold text-on-surface-variant">
        {t.captionLabel}
      </label>
      <Textarea
        rows={5}
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        disabled={published}
        className="resize-none bg-surface"
      />

      <label className="mb-1.5 mt-3 block text-xs font-semibold text-on-surface-variant">
        {t.hashtagsLabel}
      </label>
      <Input
        value={hashtags}
        onChange={(e) => setHashtags(e.target.value)}
        disabled={published}
        placeholder={t.hashtagsPlaceholder}
        className="bg-surface"
      />

      {post.suggested_image_idea.trim() !== '' && (
        <div className="mt-3 flex items-start gap-2 border-t border-outline-soft pt-3 text-xs text-on-surface-variant">
          <ImageIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            <span className="font-medium text-on-surface">
              {t.imageIdeaLabel}:{' '}
            </span>
            {post.suggested_image_idea}
          </span>
        </div>
      )}

      {needsAccount && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-primary/30 bg-primary/10 p-3 text-xs text-on-surface">
          <Share2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          <span>
            {t.noAccount}{' '}
            <Link
              href="/social-accounts"
              className="font-medium text-primary underline"
            >
              {t.noAccountCta}
            </Link>
          </span>
        </div>
      )}

      {otherError && <p className="mt-3 text-sm text-error">{otherError}</p>}

      {published ? (
        <div className="mt-4 flex items-center gap-2 text-sm font-medium text-primary">
          <CheckCircle2 className="h-4 w-4" />
          {t.publishSuccess}
        </div>
      ) : (
        <Button
          className="mt-4 w-full"
          disabled={publishMutation.isPending || caption.trim() === ''}
          onClick={() => publishMutation.mutate()}
        >
          <Send className="h-4 w-4" />
          {publishMutation.isPending ? t.publishing : t.publishCta}
        </Button>
      )}
    </li>
  );
}

/**
 * Surfaces the AI sample posts generated during onboarding as editable drafts on
 * the dashboard. Editing is free; publishing routes through quick-publish so the
 * subscription/quota paywall triggers naturally. Renders nothing when there are
 * no sample posts (graceful null guard — never crashes the dashboard).
 */
export function OnboardingDraftPosts({
  workspaceId,
  onboardingData,
}: OnboardingDraftPostsProps) {
  const posts = mergeOnboardingData(onboardingData).samplePosts;

  if (!posts || posts.length === 0) return null;

  const t = de.dashboard.draftPosts;

  return (
    <Card id="erste-posts" className="mt-6 scroll-mt-24">
      <CardHeader>
        <CardTitle>{t.title}</CardTitle>
        <p className="text-sm text-on-surface-variant">{t.description}</p>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-4 lg:grid-cols-3">
          {posts.map((post, index) => (
            <DraftPostCard
              key={index}
              post={post}
              index={index}
              workspaceId={workspaceId}
            />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
