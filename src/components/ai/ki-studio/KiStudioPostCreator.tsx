'use client';

import { useMutation } from '@tanstack/react-query';
import {
  Calendar,
  Clock,
  ImagePlus,
  RefreshCw,
  Upload,
} from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

import { InstagramPostPreview } from '@/components/ai/ki-studio/InstagramPostPreview';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { aiService } from '@/services/ai.service';
import { mediaService } from '@/services/media.service';
import { postsService } from '@/services/posts.service';
import { ApiClientError } from '@/services/api-client';
import { de } from '@/lib/i18n/de';
import { resolveMediaUrl } from '@/lib/storage-url';
import type { AiGeneration, BusinessProfile } from '@/types/api';

type VariantKey = 'A' | 'B' | 'C';

const VARIANT_KEYS: VariantKey[] = ['A', 'B', 'C'];

const VARIANT_TONE: Record<VariantKey, string> = {
  A: 'Casual & einladend',
  B: 'Professionell & vertrauensvoll',
  C: 'Emotional & storytelling',
};

const VARIANT_PROMPTS: Record<VariantKey, string> = {
  A: 'Variante A: Einladend und locker, mit warmen Formulierungen und leichtem Humor.',
  B: 'Variante B: Professionell und vertrauenswürdig, Fokus auf Qualität und Expertise.',
  C: 'Variante C: Emotional und storytelling-orientiert, mit starker Hook-Zeile.',
};

function slugifyUsername(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '')
      .slice(0, 20) || 'deinbusiness'
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function buildPostContent(generation: AiGeneration): string {
  const parts = [generation.caption.trim()];
  if (generation.call_to_action) parts.push(generation.call_to_action.trim());
  if (generation.hashtags?.length) parts.push(generation.hashtags.join(' '));
  return parts.filter(Boolean).join('\n\n');
}

function defaultScheduleDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function defaultScheduleTime(): string {
  return '11:30';
}

function StepBadge({ number }: { number: number }) {
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-on-primary">
      {number}
    </span>
  );
}

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-outline-soft bg-fill-soft px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-on-surface-variant">
        {label}
      </p>
      <p className="mt-0.5 text-xs font-medium text-on-surface">{value}</p>
    </div>
  );
}

type KiStudioPostCreatorProps = {
  workspaceId: number;
  profile: BusinessProfile;
  onGenerated?: () => void;
};

export function KiStudioPostCreator({
  workspaceId,
  profile,
  onGenerated,
}: KiStudioPostCreatorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [concept, setConcept] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [mediaId, setMediaId] = useState<number | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [variants, setVariants] = useState<Partial<Record<VariantKey, AiGeneration>>>({});
  const [selectedVariant, setSelectedVariant] = useState<VariantKey>('A');
  const [generateError, setGenerateError] = useState<string | null>(null);

  const [scheduleDate, setScheduleDate] = useState(defaultScheduleDate);
  const [scheduleTime, setScheduleTime] = useState(defaultScheduleTime);
  const [scheduleNotice, setScheduleNotice] = useState<string | null>(null);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => mediaService.upload(workspaceId, file),
    onSuccess: (data) => {
      setMediaId(data.media.id);
      setImagePreviewUrl(resolveMediaUrl(data.media.file_path, data.url));
      setUploadError(null);
    },
    onError: (e: Error) => {
      setUploadError(
        e instanceof ApiClientError ? e.message : de.ai.kiStudio.uploadFailed,
      );
    },
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const basePrompt = concept.trim();
      if (!basePrompt) throw new Error(de.ai.kiStudio.conceptRequired);
      if (!mediaId) throw new Error(de.ai.kiStudio.imageRequired);

      const results = await Promise.all(
        VARIANT_KEYS.map((key) =>
          aiService.generate(workspaceId, {
            media_id: mediaId,
            platform: 'instagram',
            content_type: 'post',
            prompt: `${basePrompt}\n\n${VARIANT_PROMPTS[key]}`,
          }),
        ),
      );

      return VARIANT_KEYS.reduce(
        (acc, key, idx) => {
          acc[key] = results[idx];
          return acc;
        },
        {} as Record<VariantKey, AiGeneration>,
      );
    },
    onSuccess: (data) => {
      setVariants(data);
      setSelectedVariant('A');
      setGenerateError(null);
      onGenerated?.();
    },
    onError: (e: Error) => {
      setGenerateError(
        e instanceof ApiClientError ? e.message : de.ai.generateFailed,
      );
    },
  });

  const scheduleMutation = useMutation({
    mutationFn: async () => {
      const generation = variants[selectedVariant];
      if (!generation) throw new Error(de.ai.kiStudio.selectVariantFirst);

      const scheduledAt = new Date(`${scheduleDate}T${scheduleTime}:00`).toISOString();
      const post = await postsService.create(workspaceId, {
        content: buildPostContent(generation),
        media_id: mediaId,
      });
      await postsService.schedule(post.id, scheduledAt);
      return post;
    },
    onSuccess: () => {
      setScheduleNotice(de.ai.kiStudio.scheduleSuccess);
      setScheduleError(null);
    },
    onError: (e: Error) => {
      setScheduleError(
        e instanceof ApiClientError ? e.message : de.ai.kiStudio.scheduleFailed,
      );
      setScheduleNotice(null);
    },
  });

  const handleFileSelect = useCallback(
    (file: File | null) => {
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        setUploadError(de.ai.kiStudio.invalidImage);
        return;
      }
      setUploadedFile(file);
      setMediaId(null);
      setImagePreviewUrl(URL.createObjectURL(file));
      setUploadError(null);
      uploadMutation.mutate(file);
    },
    [uploadMutation],
  );

  const activeGeneration = variants[selectedVariant];
  const username = slugifyUsername(profile.business_name);
  const hasVariants = VARIANT_KEYS.every((k) => variants[k]);
  const canGenerate =
    concept.trim().length > 0 && !!mediaId && !uploadMutation.isPending;

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
      {/* Left: workflow */}
      <div className="space-y-4">
        {/* Concept / theme */}
        <div className="rounded-2xl border border-outline-soft bg-surface-container-high p-5">
          <label className="mb-2 block text-sm font-semibold text-on-surface">
            {de.ai.kiStudio.conceptLabel}
          </label>
          <Textarea
            rows={3}
            maxLength={500}
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            placeholder={de.ai.kiStudio.conceptPlaceholder}
            className="resize-none bg-fill-soft"
          />
          <p className="mt-1.5 text-xs text-on-surface-variant">
            {de.ai.kiStudio.conceptHint}
          </p>
        </div>

        {/* Step 1: Upload */}
        <div className="rounded-2xl border border-outline-soft bg-surface-container-high p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <StepBadge number={1} />
              <h3 className="text-sm font-semibold text-on-surface">
                {de.ai.kiStudio.step1Title}
              </h3>
            </div>
            {uploadedFile && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-medium text-primary hover:underline"
              >
                {de.ai.kiStudio.replaceImage}
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
          />

          {imagePreviewUrl ? (
            <div className="relative overflow-hidden rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreviewUrl}
                alt=""
                className="max-h-72 w-full object-cover"
              />
              {uploadedFile && (
                <div className="absolute left-2 top-2 rounded-lg bg-black/60 px-2 py-1 text-[10px] text-white/90">
                  {uploadedFile.name} · {formatFileSize(uploadedFile.size)}
                </div>
              )}
              {uploadMutation.isPending && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm text-white">
                  {de.common.loading}
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-outline-soft bg-fill-soft py-12 transition hover:border-primary/40 hover:bg-fill-strong"
            >
              <Upload className="h-8 w-8 text-primary" />
              <span className="text-sm font-medium text-on-surface">
                {de.ai.kiStudio.uploadCta}
              </span>
              <span className="text-xs text-on-surface-variant">
                {de.ai.kiStudio.uploadHint}
              </span>
            </button>
          )}

          {uploadError && (
            <p className="mt-2 text-sm text-error">{uploadError}</p>
          )}
        </div>

        {/* Step 2: Generate variants */}
        <div className="rounded-2xl border border-outline-soft bg-surface-container-high p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <StepBadge number={2} />
              <h3 className="text-sm font-semibold text-on-surface">
                {de.ai.kiStudio.step2Title}
              </h3>
            </div>
            {hasVariants && (
              <button
                type="button"
                onClick={() => generateMutation.mutate()}
                disabled={!canGenerate || generateMutation.isPending}
                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline disabled:opacity-40"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${generateMutation.isPending ? 'animate-spin' : ''}`}
                />
                {de.ai.kiStudio.regenerate}
              </button>
            )}
          </div>

          {!hasVariants ? (
            <div className="space-y-3">
              <p className="text-sm text-on-surface-variant">
                {de.ai.kiStudio.step2Hint}
              </p>
              {generateError && (
                <p className="text-sm text-error">{generateError}</p>
              )}
              <Button
                className="w-full"
                disabled={!canGenerate || generateMutation.isPending}
                onClick={() => generateMutation.mutate()}
              >
                {generateMutation.isPending
                  ? de.ai.kiStudio.generatingVariants
                  : de.ai.kiStudio.generateVariants}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Variant tabs */}
              <div className="flex gap-2">
                {VARIANT_KEYS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedVariant(key)}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                      selectedVariant === key
                        ? 'bg-on-surface text-surface'
                        : 'bg-fill-strong text-on-surface-variant hover:bg-fill-stronger hover:text-on-surface'
                    }`}
                  >
                    {de.ai.kiStudio.variant(key)}
                  </button>
                ))}
              </div>

              {activeGeneration && (
                <>
                  <div className="rounded-xl border border-primary/20 bg-primary/10 p-4">
                    <p className="text-sm leading-relaxed text-on-surface">
                      {activeGeneration.caption}
                      {activeGeneration.hashtags?.length ? (
                        <>
                          {' '}
                          {activeGeneration.hashtags.join(' ')}
                        </>
                      ) : null}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <MetaCard
                      label={de.ai.kiStudio.metaTone}
                      value={VARIANT_TONE[selectedVariant]}
                    />
                    <MetaCard
                      label={de.ai.kiStudio.metaPlatform}
                      value={de.ai.kiStudio.platformInstagram}
                    />
                    <MetaCard
                      label={de.ai.kiStudio.metaReach}
                      value={de.ai.kiStudio.estimatedReach(selectedVariant)}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Step 3: Schedule */}
        <div className="rounded-2xl border border-outline-soft bg-surface-container-high p-5">
          <div className="mb-4 flex items-center gap-3">
            <StepBadge number={3} />
            <h3 className="text-sm font-semibold text-on-surface">
              {de.ai.kiStudio.step3Title}
            </h3>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-on-surface-variant">
                <Calendar className="h-3 w-3" />
                {de.ai.kiStudio.dateLabel}
              </label>
              <Input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                disabled={!hasVariants}
                className="bg-fill-soft"
              />
            </div>
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-on-surface-variant">
                <Clock className="h-3 w-3" />
                {de.ai.kiStudio.timeLabel}
              </label>
              <Input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                disabled={!hasVariants}
                className="bg-fill-soft"
              />
              <p className="text-[10px] font-medium text-primary">
                {de.ai.kiStudio.peakEngagement}
              </p>
            </div>
          </div>

          {scheduleNotice && (
            <p className="mt-3 text-sm text-primary">{scheduleNotice}</p>
          )}
          {scheduleError && (
            <p className="mt-3 text-sm text-error">{scheduleError}</p>
          )}

          <Button
            className="mt-4 w-full"
            disabled={!hasVariants || scheduleMutation.isPending}
            onClick={() => scheduleMutation.mutate()}
          >
            <ImagePlus className="h-4 w-4" />
            {scheduleMutation.isPending
              ? de.common.loading
              : de.ai.kiStudio.scheduleCta}
          </Button>
        </div>
      </div>

      {/* Right: preview — sticky on desktop */}
      <div className="xl:sticky xl:top-6 xl:self-start">
        <InstagramPostPreview
          username={username}
          businessName={profile.business_name}
          imageUrl={imagePreviewUrl}
          caption={activeGeneration?.caption ?? ''}
          hashtags={activeGeneration?.hashtags ?? []}
        />
      </div>
    </div>
  );
}
