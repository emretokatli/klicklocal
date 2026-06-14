'use client';

import { Building2, RefreshCw, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import type { ReelTone } from '@/lib/reel-studio/types';
import type { BusinessProfile } from '@/types/api';
import { de } from '@/lib/i18n/de';

type ReelCopilotPanelProps = {
  profile: BusinessProfile;
  selectedTone: ReelTone;
  isGenerating: boolean;
  errorMsg: string | null;
  onToneChange: (tone: ReelTone) => void;
  onGenerate: () => void;
};

export function ReelCopilotPanel({
  profile,
  selectedTone,
  isGenerating,
  errorMsg,
  onToneChange,
  onGenerate,
}: ReelCopilotPanelProps) {
  const copy = de.ai.reelStudio;

  return (
    <div className="glass-card space-y-4 rounded-2xl p-5">
      <div className="flex items-center gap-2 border-b border-outline-soft pb-3">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="text-base font-semibold">{copy.setupTitle}</h2>
      </div>

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
          <Building2 className="h-3.5 w-3.5" />
          {copy.businessContextLabel}
        </div>
        <p className="text-sm font-semibold text-on-surface">{profile.business_name}</p>
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-on-surface-variant">
          {profile.business_type && <span>{profile.business_type}</span>}
          {profile.city && <span>{profile.city}</span>}
        </div>
        <p className="mt-2 text-[11px] text-on-surface-variant">{copy.businessContextHint}</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="reel-tone">{copy.toneLabel}</Label>
        <NativeSelect
          id="reel-tone"
          value={selectedTone}
          onChange={(e) => onToneChange(e.target.value as ReelTone)}
        >
          <option value="energetic">{copy.tones.energetic}</option>
          <option value="humorous">{copy.tones.humorous}</option>
          <option value="pain-point">{copy.tones.painPoint}</option>
          <option value="professional">{copy.tones.professional}</option>
        </NativeSelect>
      </div>

      <Button className="w-full gap-2" disabled={isGenerating} onClick={onGenerate}>
        {isGenerating ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin" />
            {copy.generating}
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            {copy.generate}
          </>
        )}
      </Button>

      {errorMsg && (
        <p className="rounded-xl border border-error/30 bg-error/10 px-3 py-2 text-xs text-error">
          {errorMsg}
        </p>
      )}
    </div>
  );
}
