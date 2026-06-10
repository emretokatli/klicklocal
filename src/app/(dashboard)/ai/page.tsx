'use client';

import { useState } from 'react';

import { KiStudioPostCreator } from '@/components/ai/ki-studio/KiStudioPostCreator';
import { ReelStudio } from '@/components/ai/reel-studio/ReelStudio';
import { GeneratedContentCard } from '@/components/ai/GeneratedContentCard';
import { SubscriptionGate } from '@/components/billing/SubscriptionGate';
import { BusinessProfileForm } from '@/components/business/BusinessProfileForm';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { PageHeader } from '@/components/shared/PageHeader';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  useBusinessProfile,
  useSaveBusinessProfile,
} from '@/hooks/use-business-profile';
import { useAiHistory } from '@/hooks/use-ai';
import { usePostMutations } from '@/hooks/use-posts';
import { de } from '@/lib/i18n/de';
import { ApiClientError } from '@/services/api-client';
import type { AiGeneration } from '@/types/api';
import { useWorkspace } from '@/store/workspace-context';

type Tab = 'reel-studio' | 'post-creator';

function buildPostContent(generation: AiGeneration): string {
  const parts = [generation.caption.trim()];
  if (generation.call_to_action) parts.push(generation.call_to_action.trim());
  if (generation.hashtags?.length) parts.push(generation.hashtags.join(' '));
  return parts.filter(Boolean).join('\n\n');
}

export default function AiStudioPage() {
  const { workspaceId } = useWorkspace();
  const profileQuery = useBusinessProfile(workspaceId);
  const saveProfile = useSaveBusinessProfile(workspaceId);
  const historyQuery = useAiHistory(workspaceId);
  const postMutations = usePostMutations(workspaceId);

  const [profileError, setProfileError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleCreatePost(generation: AiGeneration) {
    setNotice(null);
    try {
      await postMutations.create.mutateAsync({
        content: buildPostContent(generation),
        media_id: generation.media_id,
      });
      setNotice(de.ai.postCreated);
    } catch {
      setNotice(de.posts.errors.create);
    }
  }

  if (!workspaceId) {
    return (
      <div>
        <PageHeader title={de.ai.title} description={de.ai.description} />
        <EmptyState title={de.ai.noWorkspace} description={de.ai.noWorkspace} />
      </div>
    );
  }

  return (
    <SubscriptionGate>
      <AiStudioContent
        workspaceId={workspaceId}
        profileQuery={profileQuery}
        saveProfile={saveProfile}
        historyQuery={historyQuery}
        postMutations={postMutations}
        profileError={profileError}
        setProfileError={setProfileError}
        notice={notice}
        setNotice={setNotice}
        handleCreatePost={handleCreatePost}
      />
    </SubscriptionGate>
  );
}

function AiStudioContent({
  workspaceId,
  profileQuery,
  saveProfile,
  historyQuery,
  postMutations,
  profileError,
  setProfileError,
  notice,
  setNotice,
  handleCreatePost,
}: {
  workspaceId: number;
  profileQuery: ReturnType<typeof useBusinessProfile>;
  saveProfile: ReturnType<typeof useSaveBusinessProfile>;
  historyQuery: ReturnType<typeof useAiHistory>;
  postMutations: ReturnType<typeof usePostMutations>;
  profileError: string | null;
  setProfileError: (v: string | null) => void;
  notice: string | null;
  setNotice: (v: string | null) => void;
  handleCreatePost: (generation: AiGeneration) => Promise<void>;
}) {
  const [activeTab, setActiveTab] = useState<Tab>('post-creator');

  if (profileQuery.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner />
      </div>
    );
  }

  const profile = profileQuery.data;

  if (!profile) {
    return (
      <div className="max-w-2xl">
        <PageHeader
          title={de.ai.needProfileTitle}
          description={de.ai.needProfileDesc}
        />
        <Card>
          <CardHeader>
            <CardTitle>{de.business.title}</CardTitle>
            <CardDescription>{de.business.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <BusinessProfileForm
              initial={null}
              pending={saveProfile.isPending}
              error={profileError}
              onSubmit={async (payload) => {
                setProfileError(null);
                try {
                  await saveProfile.mutateAsync(payload);
                } catch (e) {
                  setProfileError(
                    e instanceof ApiClientError
                      ? e.message
                      : de.business.saveFailed,
                  );
                }
              }}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={de.ai.title} description={de.ai.description} />

      {notice && (
        <p className="mb-4 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
          {notice}
        </p>
      )}

      {/* Tab navigation */}
      <div className="mb-6 flex gap-1 border-b border-white/10">
        {(
          [
            { key: 'post-creator', label: de.ai.tabPostCreator },
            { key: 'reel-studio', label: de.ai.tabReelStudio },
          ] as { key: Tab; label: string }[]
        ).map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`-mb-px px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === key
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'reel-studio' && (
        <ReelStudio
          workspaceId={workspaceId}
          profile={profile}
          onGenerated={() => void historyQuery.refetch()}
        />
      )}

      {activeTab === 'post-creator' && (
        <KiStudioPostCreator
          workspaceId={workspaceId}
          profile={profile}
          onGenerated={() => void historyQuery.refetch()}
        />
      )}

      {/* History — always visible below tabs */}
      <div className="mt-10 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-on-surface-variant">
          {de.ai.historyTitle}
        </h2>
        {historyQuery.isLoading ? (
          <LoadingSpinner />
        ) : (historyQuery.data?.length ?? 0) === 0 ? (
          <p className="text-sm text-on-surface-variant">{de.ai.historyEmpty}</p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {historyQuery.data!.map((generation) => (
              <GeneratedContentCard
                key={generation.id}
                generation={generation}
                onCreatePost={(gen) => void handleCreatePost(gen)}
                creatingPost={postMutations.create.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
