'use client';

import { Clapperboard, Film, Image as ImageIcon, Music2 } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { de } from '@/lib/i18n/de';

const t = de.dashboard.content;

/**
 * Entry point into the existing /ai flow (ContentGenerationWizard + Reel Studio).
 * Each format deep-links into /ai with platform/format/tab query params —
 * "Reel"/"TikTok Video" point at the Reel Studio tab, posts/stories at the
 * post creator. No content generation happens here.
 */
const FORMATS = [
  {
    key: 'instagramPost',
    label: t.formats.instagramPost,
    icon: ImageIcon,
    href: '/ai?platform=instagram&format=post&tab=post-creator',
  },
  {
    key: 'story',
    label: t.formats.story,
    icon: Film,
    href: '/ai?platform=instagram&format=story&tab=post-creator',
  },
  {
    key: 'reel',
    label: t.formats.reel,
    icon: Clapperboard,
    href: '/ai?platform=instagram&format=reel&tab=reel-studio',
  },
  {
    key: 'tiktok',
    label: t.formats.tiktok,
    icon: Music2,
    href: '/ai?platform=tiktok&format=video&tab=reel-studio',
  },
] as const;

export function ContentCard() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <h3 className="text-base font-semibold text-on-surface">{t.title}</h3>
          <p className="text-xs text-on-surface-variant">{t.subtitle}</p>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {FORMATS.map(({ key, label, icon: Icon, href }) => (
            <Link
              key={key}
              href={href}
              className="group flex flex-col items-center gap-2 rounded-xl border border-outline-soft p-4 text-center transition-colors hover:border-primary/40 hover:bg-fill-soft"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium text-on-surface">
                {label}
              </span>
            </Link>
          ))}
        </div>

        <Button asChild className="w-full">
          <Link href="/ai">{t.openStudio}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
