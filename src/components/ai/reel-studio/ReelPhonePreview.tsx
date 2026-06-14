'use client';

import {
  Calendar,
  Pause,
  Play,
  RotateCcw,
  Smartphone,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';

import { SocialProviderIcon } from '@/components/admin/providers/SocialProviderIcon';
import { NativeSelect } from '@/components/ui/native-select';

import { Logo } from '@/components/brand/Logo';
import { Button } from '@/components/ui/button';
import { REEL_SOUND_STYLES } from '@/lib/reel-studio/data';
import type {
  PlatformOverlay,
  ReelBusinessNiche,
  ReelScriptData,
  ReelSoundStyle,
} from '@/lib/reel-studio/types';
import { de } from '@/lib/i18n/de';

type ReelPhonePreviewProps = {
  niche: ReelBusinessNiche;
  script: ReelScriptData;
  currentSceneIdx: 1 | 2 | 3 | 4;
  overlayType: PlatformOverlay;
  playTime: number;
  isPlaying: boolean;
  volume: number;
  selectedSound: ReelSoundStyle;
  onTogglePlay: () => void;
  onReset: () => void;
  onVolumeToggle: () => void;
  onVolumeChange: (value: number) => void;
  onSoundChange: (sound: ReelSoundStyle) => void;
  onOverlayChange: (overlay: PlatformOverlay) => void;
};

export function ReelPhonePreview(props: ReelPhonePreviewProps) {
  const copy = de.ai.reelStudio;

  return (
    <div className="flex flex-col items-center">
      <div className="relative aspect-[9/16] w-full max-w-[320px] overflow-hidden rounded-[48px] border-4 border-outline-variant bg-surface-container-lowest p-3.5 shadow-2xl">
        <div className="absolute left-1/2 top-1.5 z-40 h-6 w-32 -translate-x-1/2 rounded-full bg-surface-container-low" />
        <div className="relative h-full w-full overflow-hidden rounded-[38px] bg-black">
          {props.currentSceneIdx === 1 && (
            <SceneOne niche={props.niche} hook={props.script.scene1Hook} />
          )}
          {props.currentSceneIdx === 2 && (
            <SceneTwo solution={props.script.scene2Solution} />
          )}
          {props.currentSceneIdx === 3 && (
            <SceneThree features={props.script.scene3Features} />
          )}
          {props.currentSceneIdx === 4 && (
            <SceneFour
              niche={props.niche}
              tagline={props.script.scene4Tagline}
              cta={props.script.scene4Cta}
            />
          )}
          {props.overlayType !== 'none' && (
            <PlatformOverlayUi overlayType={props.overlayType} />
          )}
        </div>
      </div>

      <div className="glass-card mt-6 w-full max-w-[320px] space-y-4 rounded-2xl p-4">
        <Timeline playTime={props.playTime} title={copy.pacingTitle} />
        <PlaybackControls
          isPlaying={props.isPlaying}
          volume={props.volume}
          onTogglePlay={props.onTogglePlay}
          onReset={props.onReset}
          onVolumeToggle={props.onVolumeToggle}
          onVolumeChange={props.onVolumeChange}
        />
        <SoundPicker
          selectedSound={props.selectedSound}
          audioLabel={copy.audioLabel}
          onSoundChange={props.onSoundChange}
        />
        <OverlayPicker
          overlayType={props.overlayType}
          label={copy.overlayLabel}
          cleanLabel={copy.overlayClean}
          onOverlayChange={props.onOverlayChange}
        />
      </div>
    </div>
  );
}

function Timeline({ playTime, title }: { playTime: number; title: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between font-mono text-xs text-on-surface-variant">
        <span className="font-semibold text-primary">{title}</span>
        <span>{playTime.toFixed(1)}s / 15.0s</span>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-surface-container-lowest">
        <div
          className="absolute left-0 h-full rounded-full bg-gradient-to-r from-primary to-tertiary transition-all duration-75"
          style={{ width: `${(playTime / 15) * 100}%` }}
        />
      </div>
    </div>
  );
}

function PlaybackControls({
  isPlaying,
  volume,
  onTogglePlay,
  onReset,
  onVolumeToggle,
  onVolumeChange,
}: {
  isPlaying: boolean;
  volume: number;
  onTogglePlay: () => void;
  onReset: () => void;
  onVolumeToggle: () => void;
  onVolumeChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button size="icon" variant={isPlaying ? 'outline' : 'default'} onClick={onTogglePlay}>
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button size="icon" variant="outline" onClick={onReset}>
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Button size="icon" variant="outline" onClick={onVolumeToggle}>
          {volume > 0 ? (
            <Volume2 className="h-4 w-4 text-primary" />
          ) : (
            <VolumeX className="h-4 w-4" />
          )}
        </Button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className="w-16 accent-primary"
        />
      </div>
    </div>
  );
}

function SoundPicker({
  selectedSound,
  audioLabel,
  onSoundChange,
}: {
  selectedSound: ReelSoundStyle;
  audioLabel: string;
  onSoundChange: (sound: ReelSoundStyle) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-outline-soft bg-surface-container-high p-2.5">
      <div>
        <p className="text-[9px] text-on-surface-variant">{audioLabel}</p>
        <NativeSelect
          value={selectedSound.id}
          onChange={(e) => {
            const sound = REEL_SOUND_STYLES.find((item) => item.id === e.target.value);
            if (sound) onSoundChange(sound);
          }}
          className="h-auto border-0 bg-transparent px-0 py-0 text-[11px] font-semibold focus:ring-0"
        >
          {REEL_SOUND_STYLES.map((sound) => (
            <option key={sound.id} value={sound.id}>
              {sound.name}
            </option>
          ))}
        </NativeSelect>
      </div>
      <span className="font-mono text-[10px] text-tertiary">{selectedSound.tempo} BPM</span>
    </div>
  );
}

function OverlayPicker({
  overlayType,
  label,
  cleanLabel,
  onOverlayChange,
}: {
  overlayType: PlatformOverlay;
  label: string;
  cleanLabel: string;
  onOverlayChange: (overlay: PlatformOverlay) => void;
}) {
  return (
    <div className="space-y-1.5">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-on-surface">
        <Smartphone className="h-3.5 w-3.5 text-primary" />
        {label}
      </p>
      <div className="grid grid-cols-3 gap-1.5">
        {(['instagram', 'tiktok', 'none'] as PlatformOverlay[]).map((overlay) => (
          <button
            key={overlay}
            type="button"
            onClick={() => onOverlayChange(overlay)}
            className={`rounded-xl py-1.5 text-xs transition ${
              overlayType === overlay
                ? 'border border-primary/30 bg-primary/10 text-on-surface'
                : 'bg-surface-container-high text-on-surface-variant'
            }`}
          >
            {overlay === 'instagram'
              ? 'Instagram'
              : overlay === 'tiktok'
                ? 'TikTok'
                : cleanLabel}
          </button>
        ))}
      </div>
    </div>
  );
}

function SceneOne({ niche, hook }: { niche: ReelBusinessNiche; hook: string }) {
  return (
    <>
      <img src={niche.image1} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-5 pt-10 text-center">
        <span className="mb-2 rounded-full border border-error/30 bg-error/20 px-2 py-0.5 text-[9px] uppercase tracking-wider text-error">
          Hook
        </span>
        <h3 className="rounded bg-error px-2 py-1 text-lg font-black uppercase leading-tight text-white">
          {hook}
        </h3>
      </div>
    </>
  );
}

function SceneTwo({ solution }: { solution: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-container-low p-4">
      <div className="w-full space-y-3 rounded-2xl border border-outline-soft bg-surface-container-high p-3">
        <div className="flex items-center gap-1.5 text-[9px] font-semibold text-primary">
          <Sparkles className="h-3 w-3" />
          Klicklocal Copilot
        </div>
        <div className="rounded-lg border border-outline-soft bg-surface-container-lowest p-2">
          <div className="mb-1.5 h-1.5 rounded bg-gradient-to-r from-primary to-tertiary" />
          <p className="truncate text-[8px] italic text-on-surface-variant">{solution}</p>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-outline-soft bg-surface-container-lowest p-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-tertiary" />
            <div>
              <p className="text-[8px] font-medium text-on-surface">Auto-Schedule Feed</p>
              <p className="text-[7px] text-on-surface-variant">Instagram, TikTok, FB</p>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-6 rounded-xl border border-white/10 bg-black/75 px-3 py-2 text-center text-sm font-bold text-white">
        {solution}
      </p>
    </div>
  );
}

function SceneThree({ features }: { features: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-container-low p-4">
      <div className="mb-5 flex gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-500 p-2">
          <SocialProviderIcon provider="instagram" size="sm" />
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-outline-soft bg-surface-container-high p-2">
          <SocialProviderIcon provider="tiktok" size="sm" />
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 p-2">
          <SocialProviderIcon provider="facebook" size="sm" />
        </div>
      </div>
      <p className="rounded-xl border border-primary/30 bg-surface-container-high px-3 py-2 text-center text-sm font-black uppercase text-on-surface">
        {features}
      </p>
    </div>
  );
}

function SceneFour({
  niche,
  tagline,
  cta,
}: {
  niche: ReelBusinessNiche;
  tagline: string;
  cta: string;
}) {
  return (
    <>
      <img src={niche.image4} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-t from-surface/90 via-surface/40 to-transparent" />
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 p-6 pt-12 text-center">
        <div className="rounded-2xl bg-gradient-to-tr from-primary to-tertiary p-1">
          <div className="rounded-[14px] bg-surface p-2">
            <Logo size={48} />
          </div>
        </div>
        <p className="rounded-lg border border-white/10 bg-black/75 p-2 text-xs italic text-white">
          &quot;{tagline}&quot;
        </p>
        <div className="rounded-full bg-gradient-to-r from-primary to-tertiary px-4 py-2 text-[10px] font-black uppercase tracking-wide text-on-primary">
          {cta}
        </div>
      </div>
    </>
  );
}

function PlatformOverlayUi({ overlayType }: { overlayType: PlatformOverlay }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-30">
      <div className="absolute inset-x-0 top-0 flex h-16 items-center justify-between bg-gradient-to-b from-black/80 to-transparent p-3 text-[10px] text-white/70">
        <span className="font-semibold">09:41</span>
        <span className="font-bold text-white">
          {overlayType === 'instagram' ? 'REELS' : 'For You'}
        </span>
        <span />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/95 to-transparent p-4">
        <p className="text-[10px] font-semibold text-white">@klicklocal.app</p>
      </div>
      <div className="absolute inset-x-0 top-14 bottom-24 border border-dashed border-error/25" />
    </div>
  );
}
