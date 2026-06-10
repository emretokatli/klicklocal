'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { ChevronLeft, Copy, Check } from 'lucide-react';
import { useState, useCallback } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { useGenerateContent } from '@/hooks/use-ai';
import { de } from '@/lib/i18n/de';
import { ApiClientError } from '@/services/api-client';
import { aiService } from '@/services/ai.service';
import { mediaService } from '@/services/media.service';
import { postsService } from '@/services/posts.service';
import { socialAccountsService } from '@/services/social-accounts.service';
import type { AiGeneration } from '@/types/api';

// ── types ─────────────────────────────────────────────────────────────────────

type Platform = 'instagram' | 'facebook' | 'tiktok' | 'linkedin';
type ContentType = 'post' | 'reel' | 'story' | 'video';
type QuickPlatform = 'instagram' | 'tiktok';

const CONTENT_TYPES_BY_PLATFORM: Record<Platform, ContentType[]> = {
  instagram: ['post', 'reel', 'story'],
  tiktok: ['post', 'reel', 'story'],
  facebook: ['post', 'video'],
  linkedin: ['post'],
};

const PLATFORM_COLOR: Record<Platform, string> = {
  instagram: '#E1306C',
  facebook: '#1877F2',
  tiktok: '#010101',
  linkedin: '#0A66C2',
};

const QUICK_PLATFORM_LABEL: Record<QuickPlatform, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
};

// ── helpers ───────────────────────────────────────────────────────────────────

function useCopyText() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copy = useCallback((text: string, key: string) => {
    void navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    });
  }, []);

  return { copiedKey, copy };
}

// ── sub-components ────────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="mb-6 flex items-center gap-2">
      {([1, 2, 3] as const).map((n) => (
        <div
          key={n}
          className={`h-1.5 flex-1 rounded-full transition-all ${
            n <= step ? 'bg-primary' : 'bg-white/10'
          }`}
        />
      ))}
    </div>
  );
}

function OptionGrid<T extends string>({
  options,
  selected,
  onSelect,
  getLabel,
  getColor,
}: {
  options: T[];
  selected: T | null;
  onSelect: (v: T) => void;
  getLabel: (v: T) => string;
  getColor?: (v: T) => string;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {options.map((opt) => {
        const active = opt === selected;
        const color = getColor?.(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onSelect(opt)}
            style={active && color ? { borderColor: color, color } : undefined}
            className={`rounded-2xl border px-4 py-5 text-sm font-semibold transition focus:outline-none ${
              active
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-white/15 bg-white/5 text-on-surface hover:border-white/30 hover:bg-white/10'
            }`}
          >
            {getLabel(opt)}
          </button>
        );
      })}
    </div>
  );
}

function CopyButton({
  text,
  copyKey,
  copiedKey,
  onCopy,
}: {
  text: string;
  copyKey: string;
  copiedKey: string | null;
  onCopy: (text: string, key: string) => void;
}) {
  const copied = copiedKey === copyKey;
  return (
    <button
      type="button"
      onClick={() => onCopy(text, copyKey)}
      className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-on-surface-variant hover:bg-white/10 hover:text-on-surface transition"
      title={copied ? de.aiWizard.copied : de.aiWizard.copyCaption}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-primary" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      {copied ? de.aiWizard.copied : de.ai.copy}
    </button>
  );
}

// ── result view ───────────────────────────────────────────────────────────────

function ResultView({
  result,
  workspaceId,
  platform,
  contentType,
  onReset,
}: {
  result: AiGeneration;
  workspaceId: number;
  platform: Platform | null;
  contentType: ContentType | null;
  onReset: () => void;
}) {
  const { copiedKey, copy } = useCopyText();
  const [imageUrl, setImageUrl] = useState<string | null>(
    result.generated_image_url ?? null,
  );
  const [imageError, setImageError] = useState<string | null>(null);

  const [quickPlatform, setQuickPlatform] = useState<QuickPlatform | null>(
    platform === 'instagram' || platform === 'tiktok' ? platform : null,
  );
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  const igStatusQuery = useQuery({
    queryKey: ['social-accounts', 'instagram', 'status', workspaceId],
    queryFn: () => socialAccountsService.instagramStatus(workspaceId),
  });
  const ttStatusQuery = useQuery({
    queryKey: ['social-accounts', 'tiktok', 'status', workspaceId],
    queryFn: () => socialAccountsService.tiktokStatus(workspaceId),
  });

  const imageMutation = useMutation({
    mutationFn: () =>
      aiService.generateImage(workspaceId, {
        platform: platform ?? 'instagram',
        content_type: contentType ?? 'post',
        generation_id: result.id,
      }),
    onSuccess: (data) => {
      setImageUrl(data.image_url);
      setImageError(null);
    },
    onError: (e: Error) => {
      setImageError(
        e instanceof ApiClientError ? e.message : de.ai.generateFailed,
      );
    },
  });

  const shareMutation = useMutation({
    mutationFn: () =>
      postsService.quickPublish(workspaceId, {
        platform: quickPlatform!,
        content: result.caption ?? '',
        media_id: null,
      }),
    onSuccess: () => {
      const label = QUICK_PLATFORM_LABEL[quickPlatform!];
      setPublishSuccess(de.ai.wizard.shareSuccess(label));
      setPublishError(null);
    },
    onError: (e: Error) => {
      setPublishError(
        e instanceof ApiClientError ? e.message : de.ai.wizard.shareError,
      );
      setPublishSuccess(null);
    },
  });

  const igConnected = !!igStatusQuery.data?.connected;
  const ttConnected = !!ttStatusQuery.data?.connected;
  const isConnected = (p: QuickPlatform) =>
    p === 'instagram' ? igConnected : ttConnected;

  const hashtagsText = (result.hashtags ?? []).join(' ');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-on-surface-variant">
          {de.aiWizard.resultTitle}
        </p>
        <Button size="sm" variant="outline" onClick={onReset}>
          {de.aiWizard.reset}
        </Button>
      </div>

      {/* Main result card */}
      <div className="rounded-2xl border border-white/10 bg-surface-container-high p-5 space-y-5">

        {/* Caption */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-on-surface-variant">
              {de.ai.caption}
            </label>
            <CopyButton
              text={result.caption}
              copyKey="caption"
              copiedKey={copiedKey}
              onCopy={copy}
            />
          </div>
          <Textarea
            readOnly
            rows={4}
            value={result.caption}
            className="resize-none bg-white/5 text-sm"
          />
        </div>

        {/* Story text */}
        {result.story_text && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-on-surface-variant">
                {de.ai.storyText}
              </label>
              <CopyButton
                text={result.story_text}
                copyKey="story"
                copiedKey={copiedKey}
                onCopy={copy}
              />
            </div>
            <Textarea
              readOnly
              rows={2}
              value={result.story_text}
              className="resize-none bg-white/5 text-sm"
            />
          </div>
        )}

        {/* Hashtags */}
        {(result.hashtags ?? []).length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-on-surface-variant">
                {de.ai.hashtags}
              </label>
              <CopyButton
                text={hashtagsText}
                copyKey="hashtags"
                copiedKey={copiedKey}
                onCopy={copy}
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(result.hashtags ?? []).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => copy(tag, `tag-${tag}`)}
                  title={copiedKey === `tag-${tag}` ? de.aiWizard.copied : tag}
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                    copiedKey === `tag-${tag}`
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-white/15 bg-white/5 text-on-surface-variant hover:border-white/30 hover:text-on-surface'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Call to action */}
        {result.call_to_action && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-on-surface-variant">
                {de.ai.callToAction}
              </label>
              <CopyButton
                text={result.call_to_action}
                copyKey="cta"
                copiedKey={copiedKey}
                onCopy={copy}
              />
            </div>
            <p className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-on-surface">
              {result.call_to_action}
            </p>
          </div>
        )}

        {/* Generated image */}
        {imageUrl && (
          <div className="space-y-1">
            <label className="text-xs font-medium text-on-surface-variant">
              Generiertes Bild
            </label>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="KI-generiertes Bild"
              className="max-h-64 w-full rounded-xl object-cover"
            />
          </div>
        )}

        {/* Image generation button */}
        {imageError && <p className="text-sm text-error">{imageError}</p>}
        <Button
          variant="outline"
          className="w-full"
          disabled={imageMutation.isPending}
          onClick={() => imageMutation.mutate()}
        >
          {imageMutation.isPending ? de.ai.generating : de.aiWizard.generateImage}
        </Button>
      </div>

      {/* Quick publish */}
      <div className="rounded-2xl border border-white/10 bg-surface-container-high p-5 space-y-4">
        <p className="text-sm font-semibold text-on-surface">
          {de.ai.wizard.shareTitle}
        </p>

        <div className="flex gap-3">
          {(['instagram', 'tiktok'] as const).map((p) => {
            const connected = isConnected(p);
            const active = quickPlatform === p;
            return (
              <button
                key={p}
                type="button"
                disabled={!connected}
                title={!connected ? de.ai.wizard.shareNotConnected : undefined}
                onClick={() => {
                  setQuickPlatform(p);
                  setPublishSuccess(null);
                  setPublishError(null);
                }}
                style={
                  active
                    ? { borderColor: PLATFORM_COLOR[p], color: PLATFORM_COLOR[p] }
                    : undefined
                }
                className={`rounded-2xl border px-5 py-3 text-sm font-semibold transition focus:outline-none ${
                  active
                    ? 'border-current bg-primary/10'
                    : connected
                    ? 'border-white/15 bg-white/5 text-on-surface hover:border-white/30 hover:bg-white/10'
                    : 'cursor-not-allowed border-white/10 bg-white/5 text-on-surface-variant opacity-40'
                }`}
              >
                {de.ai.wizard.platforms[p]}
              </button>
            );
          })}
        </div>

        {publishSuccess && (
          <p className="text-sm text-primary">{publishSuccess}</p>
        )}
        {publishError && (
          <p className="text-sm text-error">{publishError}</p>
        )}

        <Button
          className="w-full"
          disabled={!quickPlatform || shareMutation.isPending}
          onClick={() => shareMutation.mutate()}
        >
          {shareMutation.isPending
            ? de.common.loading
            : quickPlatform
            ? de.ai.wizard.shareOn(QUICK_PLATFORM_LABEL[quickPlatform])
            : de.ai.wizard.shareTitle}
        </Button>
      </div>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export function ContentGenerationWizard({
  workspaceId,
}: {
  workspaceId: number;
}) {
  const generate = useGenerateContent(workspaceId);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [contentType, setContentType] = useState<ContentType | null>(null);
  const [prompt, setPrompt] = useState('');
  const [seoFocus, setSeoFocus] = useState('');
  const [mediaId, setMediaId] = useState<number | null>(null);
  const [result, setResult] = useState<AiGeneration | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaQuery = useQuery({
    queryKey: ['media', workspaceId],
    queryFn: () => mediaService.list(workspaceId),
    enabled: step === 3,
  });

  function selectPlatform(p: Platform) {
    setPlatform(p);
    setContentType(null);
    setStep(2);
  }

  function selectContentType(ct: ContentType) {
    setContentType(ct);
    setStep(3);
  }

  function goBack() {
    if (step === 2) setStep(1);
    if (step === 3) setStep(2);
    setError(null);
  }

  function reset() {
    setStep(1);
    setPlatform(null);
    setContentType(null);
    setPrompt('');
    setSeoFocus('');
    setMediaId(null);
    setResult(null);
    setError(null);
  }

  async function handleSubmit() {
    if (!platform || !contentType) return;
    setError(null);
    try {
      const generation = await generate.mutateAsync({
        platform,
        content_type: contentType,
        prompt: prompt.trim() || null,
        seo_focus: seoFocus.trim() || null,
        media_id: mediaId,
      });
      setResult(generation);
    } catch (e) {
      setError(
        e instanceof ApiClientError ? e.message : de.ai.generateFailed,
      );
    }
  }

  const availableContentTypes =
    platform ? CONTENT_TYPES_BY_PLATFORM[platform] : [];

  const platforms: Platform[] = ['instagram', 'facebook', 'tiktok', 'linkedin'];

  if (result) {
    return (
      <ResultView
        result={result}
        workspaceId={workspaceId}
        platform={platform}
        contentType={contentType}
        onReset={reset}
      />
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-surface-container-high p-5">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-on-surface">
          {de.aiWizard.title}
        </h2>
        {step > 1 && (
          <button
            type="button"
            onClick={goBack}
            className="flex items-center gap-1 text-xs text-on-surface-variant hover:text-on-surface"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            {de.aiWizard.back}
          </button>
        )}
      </div>

      <StepIndicator step={step} />

      {step === 1 && (
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant">{de.aiWizard.step1}</p>
          <OptionGrid
            options={platforms}
            selected={platform}
            onSelect={selectPlatform}
            getLabel={(p) => de.ai.wizard.platforms[p]}
            getColor={(p) => PLATFORM_COLOR[p]}
          />
        </div>
      )}

      {step === 2 && platform && (
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant">{de.aiWizard.step2}</p>
          <OptionGrid
            options={availableContentTypes}
            selected={contentType}
            onSelect={selectContentType}
            getLabel={(ct) => de.ai.wizard.contentTypes[ct]}
          />
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant">{de.aiWizard.step3}</p>

          <div className="space-y-2">
            <label className="text-xs font-medium text-on-surface-variant">
              {de.aiWizard.promptLabel}
            </label>
            <Textarea
              rows={3}
              maxLength={300}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={de.ai.promptPlaceholder}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-on-surface-variant">
              {de.aiWizard.seoLabel}
            </label>
            <Input
              value={seoFocus}
              onChange={(e) => setSeoFocus(e.target.value)}
              placeholder={de.aiWizard.seoPlaceholder}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-on-surface-variant">
              {de.ai.wizard.mediaLabel}
            </label>
            <NativeSelect
              value={mediaId ?? ''}
              onChange={(e) =>
                setMediaId(e.target.value ? Number(e.target.value) : null)
              }
            >
              <option value="">{de.ai.wizard.noMedia}</option>
              {(mediaQuery.data ?? []).map((m) => (
                <option key={m.media.id} value={m.media.id}>
                  {m.media.file_name}
                </option>
              ))}
            </NativeSelect>
          </div>

          {error && <p className="text-sm text-error">{error}</p>}

          <Button
            className="w-full"
            disabled={generate.isPending}
            onClick={() => void handleSubmit()}
          >
            {generate.isPending ? de.ai.generating : de.aiWizard.generate}
          </Button>
        </div>
      )}
    </div>
  );
}
