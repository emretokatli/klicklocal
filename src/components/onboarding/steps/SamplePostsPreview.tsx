'use client';

import { ImageIcon } from 'lucide-react';

import { de } from '@/lib/i18n/de';
import type { SamplePost } from '@/lib/onboarding-wizard/constants';

type SamplePostsPreviewProps = {
  posts: SamplePost[];
};

/**
 * Read-only "aha moment" step: shows the 3 industry-specific Instagram posts the
 * AI generated from the user's own website analysis, right before they set a
 * password. Renders nothing if there are no posts (graceful null guard — the
 * wizard skips this step in that case).
 */
export function SamplePostsPreview({ posts }: SamplePostsPreviewProps) {
  if (!posts || posts.length === 0) return null;

  const t = de.registerWizard.samplePosts;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-on-surface sm:text-3xl">
          {t.title}
        </h1>
        <p className="text-base leading-relaxed text-on-surface-variant">
          {t.description}
        </p>
      </div>

      <ul className="space-y-4">
        {posts.map((post, index) => (
          <li
            key={index}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">
                {t.postLabel(index + 1)}
              </span>
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-medium text-primary">
                {t.badge}
              </span>
            </div>

            <p className="whitespace-pre-line text-sm leading-relaxed text-on-surface">
              {post.caption}
            </p>

            {post.hashtags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {post.hashtags.map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="rounded-full bg-white/[0.06] px-2 py-0.5 text-xs text-on-surface-variant"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {post.suggested_image_idea.trim() !== '' && (
              <div className="mt-3 flex items-start gap-2 border-t border-white/10 pt-3 text-xs text-on-surface-variant">
                <ImageIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  <span className="font-medium text-on-surface">
                    {t.imageIdeaLabel}:{' '}
                  </span>
                  {post.suggested_image_idea}
                </span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
