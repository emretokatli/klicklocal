'use client';

import { Heart, MessageCircle, MoreHorizontal, Send } from 'lucide-react';

import { de } from '@/lib/i18n/de';

type InstagramPostPreviewProps = {
  username: string;
  businessName: string;
  imageUrl: string | null;
  caption: string;
  hashtags: string[];
};

function buildCaptionText(caption: string, hashtags: string[]): string {
  const tags = hashtags.length ? `\n\n${hashtags.join(' ')}` : '';
  return `${caption.trim()}${tags}`;
}

export function InstagramPostPreview({
  username,
  businessName,
  imageUrl,
  caption,
  hashtags,
}: InstagramPostPreviewProps) {
  const fullCaption = buildCaptionText(caption, hashtags);
  const initial = businessName.trim().charAt(0).toUpperCase() || 'K';

  return (
    <div className="flex flex-col items-center">
      <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
        {de.ai.kiStudio.previewLabel}
      </p>

      <div className="relative w-full max-w-[320px] overflow-hidden rounded-[40px] border-4 border-outline-variant bg-surface-container-lowest p-3 shadow-2xl">
        <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-surface-container-high" />

        <div className="overflow-hidden rounded-[32px] bg-black">
          {/* Status bar */}
          <div className="flex items-center justify-between px-4 py-2 text-[10px] font-medium text-white/90">
            <span>9:41</span>
            <div className="flex gap-1">
              <span className="h-2 w-3 rounded-sm bg-white/80" />
              <span className="h-2 w-3 rounded-sm bg-white/80" />
              <span className="h-2 w-2 rounded-full bg-white/80" />
            </div>
          </div>

          {/* Post header */}
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-on-primary">
                {initial}
              </div>
              <span className="text-xs font-semibold text-white">{username}</span>
            </div>
            <MoreHorizontal className="h-4 w-4 text-white/70" />
          </div>

          {/* Image */}
          <div className="aspect-square w-full bg-surface-container-high">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-on-surface-variant">
                {de.ai.kiStudio.noImagePreview}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 px-3 py-2.5">
            <Heart className="h-5 w-5 text-white" />
            <MessageCircle className="h-5 w-5 text-white" />
            <Send className="h-5 w-5 text-white" />
          </div>

          {/* Caption */}
          <div className="space-y-1 px-3 pb-4">
            <p className="text-xs font-semibold text-white">
              {de.ai.kiStudio.previewLikes}
            </p>
            {fullCaption ? (
              <p className="text-xs leading-relaxed text-white/90">
                <span className="font-semibold">{username}</span>{' '}
                {fullCaption}
              </p>
            ) : (
              <p className="text-xs italic text-white/40">
                {de.ai.kiStudio.previewEmptyCaption}
              </p>
            )}
            <p className="text-[10px] uppercase tracking-wide text-white/40">
              {de.ai.kiStudio.previewJustNow}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
