'use client';

import { Check, Copy, FileText, Video } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { ReelScriptData } from '@/lib/reel-studio/types';
import { de } from '@/lib/i18n/de';

export function ReelExportPanel({
  currentSceneIdx,
  script,
  editedHook,
  editedSolution,
  editedFeatures,
  editedTagline,
  onJumpToScene,
  onCopyCaption,
  onCopyScript,
  copiedCaption,
  copiedScript,
}: {
  currentSceneIdx: 1 | 2 | 3 | 4;
  script: ReelScriptData;
  editedHook: string;
  editedSolution: string;
  editedFeatures: string;
  editedTagline: string;
  onJumpToScene: (scene: 1 | 2 | 3 | 4) => void;
  onCopyCaption: () => void;
  onCopyScript: () => void;
  copiedCaption: boolean;
  copiedScript: boolean;
}) {
  const copy = de.ai.reelStudio;
  const scenes = [
    { s: '0-3s', t: copy.timeline.hook, text: editedHook, idx: 1 as const },
    { s: '3-7s', t: copy.timeline.solution, text: editedSolution, idx: 2 as const },
    { s: '7-11s', t: copy.timeline.features, text: editedFeatures, idx: 3 as const },
    { s: '11-15s', t: copy.timeline.cta, text: editedTagline, idx: 4 as const },
  ];

  return (
    <div className="space-y-6">
      <div className="glass-card space-y-4 rounded-2xl p-5">
        <h3 className="flex items-center gap-2 border-b border-white/10 pb-2 text-sm font-semibold">
          <Video className="h-4 w-4 text-primary" />
          {copy.timelineTitle}
        </h3>
        <div className="space-y-2">
          {scenes.map((scene) => (
            <button
              key={scene.s}
              type="button"
              onClick={() => onJumpToScene(scene.idx)}
              className={`w-full rounded-xl border p-2.5 text-left text-xs transition ${
                currentSceneIdx === scene.idx
                  ? 'border-primary/30 bg-primary/10'
                  : 'border-transparent bg-surface-container-high hover:bg-surface-container-highest'
              }`}
            >
              <div className="mb-1 flex items-center justify-between font-mono text-[10px]">
                <span className="font-bold text-primary">{scene.s}</span>
                <span className="text-on-surface-variant">{scene.t}</span>
              </div>
              <p className="truncate text-[11px] text-on-surface-variant">
                &quot;{scene.text}&quot;
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card space-y-3 rounded-2xl p-5">
        <h3 className="flex items-center gap-2 border-b border-white/10 pb-2 text-sm font-semibold">
          <FileText className="h-4 w-4 text-secondary" />
          {copy.captionTitle}
        </h3>
        <p className="max-h-40 overflow-y-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-surface-container-high p-2.5 text-[11px] leading-relaxed text-on-surface-variant">
          {script.socialCaption}
        </p>
        <div className="flex flex-wrap gap-1">
          {script.hashtags.map((tag) => (
            <span
              key={tag}
              className="rounded border border-primary/20 bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] text-primary"
            >
              {tag}
            </span>
          ))}
        </div>
        <Button variant="outline" className="w-full gap-2" onClick={onCopyCaption}>
          {copiedCaption ? (
            <>
              <Check className="h-4 w-4 text-primary" />
              {copy.copied}
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              {copy.copyCaption}
            </>
          )}
        </Button>
      </div>

      <div className="glass-card space-y-3 rounded-2xl p-5">
        <h3 className="text-xs font-bold uppercase tracking-widest text-tertiary">
          {copy.exportTitle}
        </h3>
        <p className="text-[10px] leading-relaxed text-on-surface-variant">
          {copy.exportDescription}
        </p>
        <Button className="w-full gap-2" onClick={onCopyScript}>
          {copiedScript ? (
            <>
              <Check className="h-4 w-4" />
              {copy.exportCopied}
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              {copy.copyScript}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
