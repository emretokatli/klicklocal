'use client';

import { useQuery } from '@tanstack/react-query';
import { Sparkles } from 'lucide-react';
import { useState } from 'react';

import { GeneratedContentCard } from '@/components/ai/GeneratedContentCard';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { useGenerateContent } from '@/hooks/use-ai';
import { de } from '@/lib/i18n/de';
import { ApiClientError } from '@/services/api-client';
import { mediaService } from '@/services/media.service';
import type { AiGeneration } from '@/types/api';

export function AiGeneratorPanel({
  workspaceId,
  onGenerated,
  onCreatePost,
  creatingPost,
}: {
  workspaceId: number | null;
  onGenerated?: (generation: AiGeneration) => void;
  onCreatePost?: (generation: AiGeneration) => void;
  creatingPost?: boolean;
}) {
  const generate = useGenerateContent(workspaceId);
  const [mediaId, setMediaId] = useState<number | null>(null);
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AiGeneration | null>(null);

  const mediaQuery = useQuery({
    queryKey: ['media', workspaceId],
    queryFn: () => mediaService.list(workspaceId!),
    enabled: workspaceId !== null,
  });

  async function handleGenerate() {
    setError(null);
    try {
      const generation = await generate.mutateAsync({
        media_id: mediaId,
        prompt: prompt.trim() || null,
      });
      setResult(generation);
      onGenerated?.(generation);
    } catch (e) {
      setError(
        e instanceof ApiClientError ? e.message : de.ai.generateFailed,
      );
    }
  }

  return (
    <div className="space-y-5">
      <div className="space-y-4 glass-card rounded-2xl p-5">
        <div className="space-y-2">
          <Label htmlFor="ai-media">{de.ai.imageLabel}</Label>
          <NativeSelect
            id="ai-media"
            value={mediaId ?? ''}
            onChange={(e) =>
              setMediaId(e.target.value ? Number(e.target.value) : null)
            }
          >
            <option value="">{de.ai.noImage}</option>
            {(mediaQuery.data ?? []).map((m) => (
              <option key={m.media.id} value={m.media.id}>
                {m.media.file_name}
              </option>
            ))}
          </NativeSelect>
          <p className="text-xs text-on-surface-variant">{de.ai.imageHint}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ai-prompt">{de.ai.promptLabel}</Label>
          <Textarea
            id="ai-prompt"
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={de.ai.promptPlaceholder}
          />
        </div>

        {error && <p className="text-sm text-error">{error}</p>}

        <Button
          className="w-full gap-2"
          disabled={!workspaceId || generate.isPending}
          onClick={() => void handleGenerate()}
        >
          <Sparkles className="h-4 w-4" />
          {generate.isPending ? de.ai.generating : de.ai.generate}
        </Button>
      </div>

      {result ? (
        <GeneratedContentCard
          generation={result}
          onCreatePost={onCreatePost}
          creatingPost={creatingPost}
        />
      ) : (
        <p className="text-sm text-on-surface-variant">{de.ai.emptyResult}</p>
      )}
    </div>
  );
}
