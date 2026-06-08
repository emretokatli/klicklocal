'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { de } from '@/lib/i18n/de';
import type { AiGeneration } from '@/types/api';

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      className="h-7 gap-1.5 px-2 text-xs"
      onClick={() => void copy()}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      {copied ? de.ai.copied : de.ai.copy}
    </Button>
  );
}

function Section({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
          {label}
        </span>
        <CopyButton value={value} />
      </div>
      <p className="whitespace-pre-wrap rounded-xl bg-white/5 px-4 py-3 text-sm leading-relaxed text-on-surface">
        {value}
      </p>
    </div>
  );
}

export function GeneratedContentCard({
  generation,
  onCreatePost,
  creatingPost,
}: {
  generation: AiGeneration;
  onCreatePost?: (generation: AiGeneration) => void;
  creatingPost?: boolean;
}) {
  const hashtags = generation.hashtags ?? [];
  const hashtagText = hashtags.join(' ');

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <Section label={de.ai.caption} value={generation.caption} />
        {generation.story_text && (
          <Section label={de.ai.storyText} value={generation.story_text} />
        )}
        {hashtags.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                {de.ai.hashtags}
              </span>
              <CopyButton value={hashtagText} />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {hashtags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs text-primary"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
        {generation.call_to_action && (
          <Section
            label={de.ai.callToAction}
            value={generation.call_to_action}
          />
        )}

        {onCreatePost && (
          <Button
            className="w-full"
            disabled={creatingPost}
            onClick={() => onCreatePost(generation)}
          >
            {creatingPost ? de.common.loading : de.ai.createPost}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
