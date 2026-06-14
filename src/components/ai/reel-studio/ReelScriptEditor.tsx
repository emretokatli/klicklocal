'use client';

import { Layers } from 'lucide-react';

import { Textarea } from '@/components/ui/textarea';
import { de } from '@/lib/i18n/de';

type ReelScriptEditorProps = {
  editedHook: string;
  editedSolution: string;
  editedFeatures: string;
  editedTagline: string;
  editedCta: string;
  onHookChange: (value: string) => void;
  onSolutionChange: (value: string) => void;
  onFeaturesChange: (value: string) => void;
  onTaglineChange: (value: string) => void;
  onCtaChange: (value: string) => void;
};

export function ReelScriptEditor({
  editedHook,
  editedSolution,
  editedFeatures,
  editedTagline,
  editedCta,
  onHookChange,
  onSolutionChange,
  onFeaturesChange,
  onTaglineChange,
  onCtaChange,
}: ReelScriptEditorProps) {
  const copy = de.ai.reelStudio;

  return (
    <div className="glass-card space-y-4 rounded-2xl p-5">
      <div className="flex items-center gap-2 border-b border-outline-soft pb-3">
        <Layers className="h-5 w-5 text-primary" />
        <h2 className="text-base font-semibold">{copy.editorTitle}</h2>
      </div>

      <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1">
        <ScriptField
          label={copy.scenes.hook}
          badge={copy.badges.hook}
          value={editedHook}
          onChange={onHookChange}
          maxLength={50}
        />
        <ScriptField
          label={copy.scenes.solution}
          badge={copy.badges.solution}
          value={editedSolution}
          onChange={onSolutionChange}
          maxLength={60}
        />
        <ScriptField
          label={copy.scenes.features}
          badge={copy.badges.features}
          value={editedFeatures}
          onChange={onFeaturesChange}
          maxLength={65}
        />
        <div className="space-y-1">
          <FieldHeader label={copy.scenes.cta} badge={copy.badges.cta} />
          <input
            type="text"
            value={editedTagline}
            onChange={(e) => onTaglineChange(e.target.value)}
            className="mb-1.5 h-10 w-full rounded-xl border border-outline-soft bg-surface-container-high px-3 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <input
            type="text"
            value={editedCta}
            onChange={(e) => onCtaChange(e.target.value)}
            className="h-10 w-full rounded-xl border border-outline-soft bg-surface-container-high px-3 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
      </div>

      <p className="border-t border-outline-soft pt-2 text-center text-[10px] text-on-surface-variant">
        {copy.livePreviewHint}
      </p>
    </div>
  );
}

function ScriptField({
  label,
  badge,
  value,
  onChange,
  maxLength,
}: {
  label: string;
  badge: string;
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
}) {
  return (
    <div className="space-y-1">
      <FieldHeader label={label} badge={badge} />
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        rows={2}
        className="min-h-12 resize-none text-xs"
      />
    </div>
  );
}

function FieldHeader({ label, badge }: { label: string; badge: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="font-semibold text-on-surface">{label}</span>
      <span className="rounded border border-primary/20 bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] text-primary">
        {badge}
      </span>
    </div>
  );
}
