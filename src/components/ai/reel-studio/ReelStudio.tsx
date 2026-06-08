'use client';

import { useEffect, useMemo, useState } from 'react';
import { Globe } from 'lucide-react';

import { ReelCopilotPanel } from '@/components/ai/reel-studio/ReelCopilotPanel';
import { ReelExportPanel } from '@/components/ai/reel-studio/ReelExportPanel';
import { ReelPhonePreview } from '@/components/ai/reel-studio/ReelPhonePreview';
import { ReelScriptEditor } from '@/components/ai/reel-studio/ReelScriptEditor';
import { useGenerateContent } from '@/hooks/use-ai';
import { useReelPlayback, useReelSynth } from '@/hooks/use-reel-playback';
import { INITIAL_REEL_SCRIPTS, REEL_SOUND_STYLES } from '@/lib/reel-studio/data';
import type {
  PlatformOverlay,
  ReelLanguage,
  ReelScriptData,
  ReelTone,
} from '@/lib/reel-studio/types';
import {
  buildReelPrompt,
  getFullReelScriptExport,
  getSceneIndex,
  mapGenerationToReelScript,
  resolveNicheFromBusinessType,
} from '@/lib/reel-studio/utils';
import { ApiClientError } from '@/services/api-client';
import type { BusinessProfile } from '@/types/api';
import { de } from '@/lib/i18n/de';

type ReelStudioProps = {
  workspaceId: number;
  profile: BusinessProfile;
  onGenerated?: () => void;
};

export function ReelStudio({ workspaceId, profile, onGenerated }: ReelStudioProps) {
  const generate = useGenerateContent(workspaceId);
  const playback = useReelPlayback();

  const [language, setLanguage] = useState<ReelLanguage>('de');
  const [selectedTone, setSelectedTone] = useState<ReelTone>('energetic');
  const [selectedSound, setSelectedSound] = useState(REEL_SOUND_STYLES[0]);
  const [overlayType, setOverlayType] = useState<PlatformOverlay>('instagram');
  const [volume, setVolume] = useState(0.4);

  const [scriptData, setScriptData] = useState<ReelScriptData>(INITIAL_REEL_SCRIPTS.de);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  const [editedHook, setEditedHook] = useState(scriptData.scene1Hook);
  const [editedSolution, setEditedSolution] = useState(scriptData.scene2Solution);
  const [editedFeatures, setEditedFeatures] = useState(scriptData.scene3Features);
  const [editedTagline, setEditedTagline] = useState(scriptData.scene4Tagline);
  const [editedCta, setEditedCta] = useState(scriptData.scene4Cta);

  useEffect(() => {
    setScriptData(INITIAL_REEL_SCRIPTS[language]);
  }, [language]);

  useEffect(() => {
    setEditedHook(scriptData.scene1Hook);
    setEditedSolution(scriptData.scene2Solution);
    setEditedFeatures(scriptData.scene3Features);
    setEditedTagline(scriptData.scene4Tagline);
    setEditedCta(scriptData.scene4Cta);
  }, [scriptData]);

  const currentScript = useMemo<ReelScriptData>(
    () => ({
      scene1Hook: editedHook,
      scene2Solution: editedSolution,
      scene3Features: editedFeatures,
      scene4Tagline: editedTagline,
      scene4Cta: editedCta,
      socialCaption: scriptData.socialCaption,
      hashtags: scriptData.hashtags,
    }),
    [editedHook, editedSolution, editedFeatures, editedTagline, editedCta, scriptData],
  );

  const currentSceneIdx = getSceneIndex(playback.playTime);
  const previewNiche = useMemo(
    () => resolveNicheFromBusinessType(profile.business_type),
    [profile.business_type],
  );
  const nicheLabel = profile.business_name;

  useReelSynth(playback.isPlaying, volume, selectedSound.tempo);

  async function handleGenerate() {
    setErrorMsg(null);
    try {
      const generation = await generate.mutateAsync({
        prompt: buildReelPrompt({
          language,
          tone: selectedTone,
          profile,
        }),
      });
      setScriptData(mapGenerationToReelScript(generation, language));
      playback.setPlayTime(0);
      playback.setIsPlaying(true);
      onGenerated?.();
    } catch (error) {
      setErrorMsg(
        error instanceof ApiClientError
          ? error.message
          : de.ai.reelStudio.generateFallback,
      );
      setScriptData(INITIAL_REEL_SCRIPTS[language]);
    }
  }

  function jumpToScene(scene: 1 | 2 | 3 | 4) {
    const startTimes = { 1: 0.5, 2: 3.5, 3: 7.5, 4: 11.5 } as const;
    playback.setPlayTime(startTimes[scene]);
    playback.setIsPlaying(true);
  }

  function copyCaption() {
    void navigator.clipboard.writeText(
      `${currentScript.socialCaption}\n\n${currentScript.hashtags.join(' ')}`,
    );
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  }

  function copyScript() {
    void navigator.clipboard.writeText(
      getFullReelScriptExport({
        language,
        nicheLabel,
        script: currentScript,
      }),
    );
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-surface-container-high px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-on-surface">{de.ai.reelStudio.badge}</p>
          <p className="text-xs text-on-surface-variant">{de.ai.reelStudio.subtitle}</p>
        </div>
        <div className="flex rounded-xl border border-white/10 bg-surface-container p-0.5">
          {(['de', 'en'] as ReelLanguage[]).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setLanguage(value)}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                language === value
                  ? 'bg-primary/15 text-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Globe className="h-3.5 w-3.5" />
              {value.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-12">
        <section className="space-y-6 xl:col-span-4">
          <ReelCopilotPanel
            profile={profile}
            selectedTone={selectedTone}
            isGenerating={generate.isPending}
            errorMsg={errorMsg}
            onToneChange={setSelectedTone}
            onGenerate={() => void handleGenerate()}
          />
          <ReelScriptEditor
            editedHook={editedHook}
            editedSolution={editedSolution}
            editedFeatures={editedFeatures}
            editedTagline={editedTagline}
            editedCta={editedCta}
            onHookChange={setEditedHook}
            onSolutionChange={setEditedSolution}
            onFeaturesChange={setEditedFeatures}
            onTaglineChange={setEditedTagline}
            onCtaChange={setEditedCta}
          />
        </section>

        <section className="xl:col-span-5">
          <ReelPhonePreview
            niche={previewNiche}
            script={currentScript}
            currentSceneIdx={currentSceneIdx}
            overlayType={overlayType}
            playTime={playback.playTime}
            isPlaying={playback.isPlaying}
            volume={volume}
            selectedSound={selectedSound}
            onTogglePlay={playback.togglePlay}
            onReset={playback.reset}
            onVolumeToggle={() => setVolume((value) => (value > 0 ? 0 : 0.4))}
            onVolumeChange={setVolume}
            onSoundChange={setSelectedSound}
            onOverlayChange={setOverlayType}
          />
        </section>

        <section className="xl:col-span-3">
          <ReelExportPanel
            currentSceneIdx={currentSceneIdx}
            script={currentScript}
            editedHook={editedHook}
            editedSolution={editedSolution}
            editedFeatures={editedFeatures}
            editedTagline={editedTagline}
            onJumpToScene={jumpToScene}
            onCopyCaption={copyCaption}
            onCopyScript={copyScript}
            copiedCaption={copiedCaption}
            copiedScript={copiedScript}
          />
        </section>
      </div>
    </div>
  );
}
