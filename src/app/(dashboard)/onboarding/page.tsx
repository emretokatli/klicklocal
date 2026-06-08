'use client';

import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { AiGeneratorPanel } from '@/components/ai/AiGeneratorPanel';
import { BusinessProfileForm } from '@/components/business/BusinessProfileForm';
import { OnboardingStepper } from '@/components/onboarding/OnboardingStepper';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePostMutations } from '@/hooks/use-posts';
import { useBusinessProfile, useSaveBusinessProfile } from '@/hooks/use-business-profile';
import { de } from '@/lib/i18n/de';
import { ApiClientError } from '@/services/api-client';
import { businessProfileService } from '@/services/business-profile.service';
import { onboardingService } from '@/services/onboarding.service';
import { socialAccountsService } from '@/services/social-accounts.service';
import { workspacesService } from '@/services/workspaces.service';
import type { AiGeneration, Post } from '@/types/api';
import { useWorkspace } from '@/store/workspace-context';

const STEP_LABELS = [
  de.onboarding.steps.business,
  de.onboarding.steps.instagram,
  de.onboarding.steps.generate,
  de.onboarding.steps.schedule,
];

function buildPostContent(generation: AiGeneration): string {
  const parts = [generation.caption.trim()];
  if (generation.call_to_action) parts.push(generation.call_to_action.trim());
  if (generation.hashtags?.length) parts.push(generation.hashtags.join(' '));
  return parts.filter(Boolean).join('\n\n');
}

export default function OnboardingPage() {
  const router = useRouter();
  const { workspaceId, setWorkspaceId, refetch } = useWorkspace();

  const [createdWorkspaceId, setCreatedWorkspaceId] = useState<number | null>(
    null,
  );
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [createdPost, setCreatedPost] = useState<Post | null>(null);
  const [scheduledAt, setScheduledAt] = useState('');
  const [done, setDone] = useState(false);

  const wid = createdWorkspaceId ?? workspaceId;

  const profileQuery = useBusinessProfile(wid);
  const saveProfile = useSaveBusinessProfile(wid);
  const postMutations = usePostMutations(wid);

  const instagramQuery = useQuery({
    queryKey: ['instagram', 'status', wid],
    queryFn: () => socialAccountsService.instagramStatus(wid!),
    enabled: wid !== null && step === 2,
  });

  async function persistStep(targetStep: number, targetWorkspaceId: number) {
    try {
      await onboardingService.update(targetWorkspaceId, { step: targetStep });
    } catch {
      /* non-blocking */
    }
  }

  async function handleBusinessSubmit(payload: {
    business_name: string;
    business_type: string;
    city: string;
    description?: string | null;
    tone_of_voice?: string | null;
    products_services?: string | null;
  }) {
    setError(null);
    try {
      let targetId = wid;

      if (!targetId) {
        const workspace = await workspacesService.create(payload.business_name);
        targetId = workspace.id;
        setCreatedWorkspaceId(targetId);
        setWorkspaceId(targetId);
        await businessProfileService.save(targetId, payload);
        refetch();
      } else {
        await saveProfile.mutateAsync(payload);
      }

      await persistStep(2, targetId);
      setStep(2);
    } catch (e) {
      setError(
        e instanceof ApiClientError ? e.message : de.business.saveFailed,
      );
    }
  }

  async function handleConnectInstagram() {
    if (!wid) return;
    setError(null);
    try {
      const url = await socialAccountsService.instagramConnect(wid);
      window.location.href = url;
    } catch (e) {
      setError(
        e instanceof ApiClientError
          ? e.message
          : de.onboarding.instagram.connectFailed,
      );
    }
  }

  async function handleCreatePost(generation: AiGeneration) {
    if (!wid) return;
    setError(null);
    try {
      const post = await postMutations.create.mutateAsync({
        content: buildPostContent(generation),
        media_id: generation.media_id,
      });
      setCreatedPost(post);
      await persistStep(4, wid);
      setStep(4);
    } catch (e) {
      setError(
        e instanceof ApiClientError ? e.message : de.posts.errors.create,
      );
    }
  }

  async function handleSchedule() {
    if (!createdPost || !scheduledAt) return;
    setError(null);
    try {
      await postMutations.schedule.mutateAsync({
        id: createdPost.id,
        scheduledAt: new Date(scheduledAt).toISOString(),
      });
      await finish();
    } catch (e) {
      setError(
        e instanceof ApiClientError ? e.message : de.posts.errors.schedule,
      );
    }
  }

  async function finish() {
    if (wid) {
      try {
        await onboardingService.update(wid, { completed: true });
      } catch {
        /* non-blocking */
      }
    }
    setDone(true);
  }

  function goNext(target: number) {
    if (wid) void persistStep(target, wid);
    setStep(target);
  }

  if (done) {
    return (
      <div className="mx-auto max-w-xl py-10 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-primary" />
        <h1 className="mt-4 text-2xl font-semibold text-on-surface">
          {de.onboarding.done.title}
        </h1>
        <p className="mt-2 text-on-surface-variant">
          {de.onboarding.done.description}
        </p>
        <Button className="mt-6" onClick={() => router.push('/dashboard')}>
          {de.onboarding.finish}
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-on-surface">
          {de.onboarding.title}
        </h1>
        <p className="mt-1 text-on-surface-variant">
          {de.onboarding.subtitle}
        </p>
      </div>

      <div className="mb-6">
        <OnboardingStepper steps={STEP_LABELS} current={step} />
        <p className="mt-2 text-xs text-on-surface-variant">
          {de.onboarding.stepLabel(step, STEP_LABELS.length)}
        </p>
      </div>

      {error && (
        <p className="mb-4 rounded-xl border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
          {error}
        </p>
      )}

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>{de.onboarding.business.title}</CardTitle>
            <CardDescription>
              {de.onboarding.business.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BusinessProfileForm
              initial={profileQuery.data ?? null}
              pending={saveProfile.isPending}
              submitLabel={de.onboarding.next}
              onSubmit={(payload) => void handleBusinessSubmit(payload)}
            />
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>{de.onboarding.instagram.title}</CardTitle>
            <CardDescription>
              {de.onboarding.instagram.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {instagramQuery.data?.connected ? (
              <p className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
                <CheckCircle2 className="h-4 w-4" />
                {de.onboarding.instagram.connected}
              </p>
            ) : (
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => void handleConnectInstagram()}
              >
                <Share2 className="h-4 w-4" />
                {de.onboarding.instagram.connect}
              </Button>
            )}

            <div className="flex items-center justify-between gap-3">
              <Button variant="ghost" onClick={() => goNext(1)}>
                {de.onboarding.back}
              </Button>
              <Button onClick={() => goNext(3)}>
                {instagramQuery.data?.connected
                  ? de.onboarding.next
                  : de.onboarding.skip}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>{de.onboarding.generate.title}</CardTitle>
            <CardDescription>
              {de.onboarding.generate.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <AiGeneratorPanel
              workspaceId={wid}
              onCreatePost={(g) => void handleCreatePost(g)}
              creatingPost={postMutations.create.isPending}
            />
            <div className="flex items-center justify-between gap-3">
              <Button variant="ghost" onClick={() => goNext(2)}>
                {de.onboarding.back}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>{de.onboarding.schedule.title}</CardTitle>
            <CardDescription>
              {de.onboarding.schedule.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {createdPost && (
              <p className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
                <CheckCircle2 className="h-4 w-4" />
                {de.onboarding.generate.created}
              </p>
            )}

            <div className="space-y-2">
              <Label htmlFor="onboarding-schedule">
                {de.onboarding.schedule.when}
              </Label>
              <Input
                id="onboarding-schedule"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
            </div>

            <Button
              className="w-full"
              disabled={!scheduledAt || postMutations.schedule.isPending}
              onClick={() => void handleSchedule()}
            >
              {de.onboarding.schedule.schedule}
            </Button>

            <div className="flex items-center justify-between gap-3">
              <Button variant="ghost" onClick={() => setStep(3)}>
                {de.onboarding.back}
              </Button>
              <Button variant="ghost" onClick={() => void finish()}>
                {de.onboarding.schedule.skipSchedule}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
