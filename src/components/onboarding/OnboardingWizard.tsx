'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2 } from 'lucide-react';

import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { OptionChip, OptionSection } from '@/components/onboarding/OptionChip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  INITIAL_ONBOARDING_WIZARD_DATA,
  isOnboardingWizardStep,
  mergeOnboardingData,
  ONBOARDING_CUSTOMER_SOURCES,
  ONBOARDING_INDUSTRIES,
  ONBOARDING_PRIMARY_GOALS,
  ONBOARDING_REVENUE_OPTIONS,
  ONBOARDING_SOCIAL_CHANNELS,
  ONBOARDING_TEAM_SIZES,
  ONBOARDING_WIZARD_STEPS,
  type OnboardingSocialChannel,
  type OnboardingWizardData,
  type OnboardingWizardStep,
} from '@/lib/onboarding-wizard/constants';
import { setStoredWorkspaceId } from '@/lib/token';
import { de } from '@/lib/i18n/de';
import { ApiClientError } from '@/services/api-client';
import { userOnboardingService } from '@/services/user-onboarding.service';
import { websiteAnalysisService } from '@/services/website-analysis.service';
import { useAuth } from '@/store/auth-context';

function stepIndex(step: OnboardingWizardStep) {
  return ONBOARDING_WIZARD_STEPS.indexOf(step);
}

function toggleSocialChannel(
  current: OnboardingSocialChannel[],
  channel: OnboardingSocialChannel,
): OnboardingSocialChannel[] {
  if (channel === 'Keine') {
    return current.includes('Keine') ? [] : ['Keine'];
  }

  const withoutNone = current.filter((item) => item !== 'Keine');

  return withoutNone.includes(channel)
    ? withoutNone.filter((item) => item !== channel)
    : [...withoutNone, channel];
}

export function OnboardingWizard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const statusQuery = useQuery({
    queryKey: ['auth', 'onboarding'],
    queryFn: () => userOnboardingService.status(),
  });

  const [step, setStep] = useState<OnboardingWizardStep>('get-started');
  const [data, setData] = useState<OnboardingWizardData>(INITIAL_ONBOARDING_WIZARD_DATA);
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [analysisStarted, setAnalysisStarted] = useState(false);

  useEffect(() => {
    if (!statusQuery.data || hydrated) return;

    const saved = mergeOnboardingData(statusQuery.data.onboarding_data);
    setData(saved);

    const savedStep = statusQuery.data.onboarding_step;
    if (isOnboardingWizardStep(savedStep)) {
      setStep(savedStep);
    }

    setHydrated(true);
  }, [hydrated, statusQuery.data]);

  const patch = useCallback((partial: Partial<OnboardingWizardData>) => {
    setData((current) => mergeOnboardingData({ ...current, ...partial }));
  }, []);

  const currentIndex = stepIndex(step);
  const isWideStep = step === 'kyc';

  const canContinue = useMemo(() => {
    switch (step) {
      case 'get-started':
        return true;
      case 'your-name':
        return data.firstName.trim().length > 0;
      case 'business-name':
        return data.businessName.trim().length > 0;
      case 'website':
        return data.website.trim().length > 0;
      case 'kyc':
        return (
          data.industry !== '' &&
          data.teamSize !== '' &&
          data.monthlyRevenue !== '' &&
          data.customerSource !== '' &&
          data.socialMediaChannels.length > 0
        );
      case 'check-website':
        return false;
      case 'result-check-website':
        return data.description.trim().length > 0;
      case 'target':
        return data.targetAudience.trim().length > 0;
      case 'business-special':
        return data.uniqueValueProposition.trim().length > 0;
      case 'additional':
        return true;
      case 'start':
        return data.primaryGoal !== '';
      case 'account':
        return (
          data.password.trim().length >= 8 &&
          data.password === data.passwordConfirmation
        );
      default:
        return false;
    }
  }, [data, step]);

  const persistAndGo = useCallback(
    async (nextStep: OnboardingWizardStep) => {
      await userOnboardingService.saveProgress(nextStep, data);
      await queryClient.invalidateQueries({ queryKey: ['auth'] });
      setStep(nextStep);
    },
    [data, queryClient],
  );

  const goBack = useCallback(() => {
    const prev = ONBOARDING_WIZARD_STEPS[currentIndex - 1];
    if (!prev || step === 'check-website') return;
    setError(null);
    setStep(prev);
  }, [currentIndex, step]);

  const runWebsiteAnalysis = useCallback(async () => {
    if (data.description.trim()) {
      setStep('result-check-website');
      return;
    }

    setError(null);
    setAnalysisStarted(true);

    try {
      const analysis = await websiteAnalysisService.analyze({
        website: data.website.trim(),
        business_name: data.businessName.trim(),
        industry: data.industry,
      });

      const merged = {
        description: analysis.description,
        targetAudience: analysis.target_audience,
        uniqueValueProposition: analysis.unique_value_proposition,
        additionalNotes: analysis.additional_notes,
        city: analysis.city ?? '',
      };

      patch(merged);
      await userOnboardingService.saveProgress('result-check-website', {
        ...data,
        ...merged,
      });
      setStep('result-check-website');
    } catch (e) {
      setError(
        e instanceof ApiClientError
          ? e.message
          : de.registerWizard.errors.analysisFailed,
      );
      setStep('result-check-website');
    } finally {
      setAnalysisStarted(false);
    }
  }, [data, patch]);

  useEffect(() => {
    if (step !== 'check-website' || analysisStarted || !hydrated) return;
    void runWebsiteAnalysis();
  }, [analysisStarted, hydrated, runWebsiteAnalysis, step]);

  async function handleFinish() {
    setError(null);
    setPending(true);

    try {
      const result = await userOnboardingService.complete({
        password: data.password,
        password_confirmation: data.passwordConfirmation,
        first_name: data.firstName.trim(),
        business_name: data.businessName.trim(),
        website: data.website.trim() || null,
        industry: data.industry,
        team_size: data.teamSize || null,
        monthly_revenue: data.monthlyRevenue || null,
        customer_source: data.customerSource || null,
        social_media_channels: data.socialMediaChannels,
        description: data.description.trim() || null,
        target_audience: data.targetAudience.trim() || null,
        unique_value_proposition: data.uniqueValueProposition.trim() || null,
        additional_notes: data.additionalNotes.trim() || null,
        primary_goal: data.primaryGoal || null,
        city: data.city.trim() || null,
      });

      setStoredWorkspaceId(result.workspace.id);
      await queryClient.resetQueries();
      router.replace('/ai');
    } catch (e) {
      setError(
        e instanceof ApiClientError
          ? e.message
          : de.registerWizard.errors.setupFailed,
      );
    } finally {
      setPending(false);
    }
  }

  async function handlePrimaryAction() {
    setError(null);

    if (step === 'account') {
      await handleFinish();
      return;
    }

    const next = ONBOARDING_WIZARD_STEPS[currentIndex + 1];
    if (!next) return;

    setPending(true);
    try {
      await persistAndGo(next);
    } catch (e) {
      setError(
        e instanceof ApiClientError
          ? e.message
          : de.registerWizard.errors.saveFailed,
      );
    } finally {
      setPending(false);
    }
  }

  if (statusQuery.isLoading || !hydrated) {
    return (
      <OnboardingShell
        stepIndex={0}
        totalSteps={ONBOARDING_WIZARD_STEPS.length}
      >
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </OnboardingShell>
    );
  }

  const showFooter = step !== 'check-website';
  const showBack = step !== 'get-started' && step !== 'check-website';

  const footer = showFooter ? (
    <div className="space-y-4">
      {step !== 'get-started' && (
        <Button
          className="w-full"
          disabled={!canContinue || pending}
          onClick={() => void handlePrimaryAction()}
        >
          {pending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {step === 'account'
                ? de.registerWizard.finishing
                : de.registerWizard.saving}
            </>
          ) : step === 'account' ? (
            de.registerWizard.finish
          ) : step === 'additional' ? (
            de.registerWizard.continueOptional
          ) : (
            de.registerWizard.continue
          )}
        </Button>
      )}
      {step === 'get-started' && (
        <Button className="w-full" onClick={() => void handlePrimaryAction()}>
          {de.registerWizard.getStarted.cta}
        </Button>
      )}
      {showBack && (
        <button
          type="button"
          onClick={goBack}
          className="flex w-full items-center justify-center gap-1 text-sm text-on-surface-variant transition hover:text-on-surface"
        >
          <ArrowLeft className="h-4 w-4" />
          {de.registerWizard.back}
        </button>
      )}
    </div>
  ) : undefined;

  return (
    <OnboardingShell
      stepIndex={currentIndex}
      totalSteps={ONBOARDING_WIZARD_STEPS.length}
      wide={isWideStep}
      footer={footer}
    >
      {error && (
        <p className="mb-6 rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
          {error}
        </p>
      )}

      {step === 'get-started' && <IntroStep />}

      {step === 'your-name' && (
        <TextStep
          title={de.registerWizard.yourName.title}
          placeholder={de.registerWizard.yourName.placeholder}
          value={data.firstName}
          onChange={(value) => patch({ firstName: value })}
        />
      )}

      {step === 'business-name' && (
        <TextStep
          title={de.registerWizard.businessName.title}
          placeholder={de.registerWizard.businessName.placeholder}
          value={data.businessName}
          onChange={(value) => patch({ businessName: value })}
        />
      )}

      {step === 'website' && (
        <TextStep
          title={de.registerWizard.website.title}
          placeholder={de.registerWizard.website.placeholder}
          value={data.website}
          onChange={(value) => patch({ website: value })}
          inputMode="url"
        />
      )}

      {step === 'kyc' && <KycStep data={data} patch={patch} />}

      {step === 'check-website' && <CheckWebsiteStep pending={analysisStarted} />}

      {step === 'result-check-website' && (
        <TextareaStep
          title={de.registerWizard.resultWebsite.title}
          description={de.registerWizard.resultWebsite.description}
          placeholder={de.registerWizard.resultWebsite.placeholder}
          value={data.description}
          onChange={(value) => patch({ description: value })}
        />
      )}

      {step === 'target' && (
        <TextareaStep
          title={de.registerWizard.target.title}
          description={de.registerWizard.target.description}
          placeholder={de.registerWizard.target.placeholder}
          value={data.targetAudience}
          onChange={(value) => patch({ targetAudience: value })}
        />
      )}

      {step === 'business-special' && (
        <TextareaStep
          title={de.registerWizard.businessSpecial.title}
          description={de.registerWizard.businessSpecial.description}
          placeholder={de.registerWizard.businessSpecial.placeholder}
          value={data.uniqueValueProposition}
          onChange={(value) => patch({ uniqueValueProposition: value })}
        />
      )}

      {step === 'additional' && (
        <TextareaStep
          title={de.registerWizard.additional.title}
          description={de.registerWizard.additional.description}
          placeholder={de.registerWizard.additional.placeholder}
          value={data.additionalNotes}
          onChange={(value) => patch({ additionalNotes: value })}
          optional
        />
      )}

      {step === 'start' && (
        <StartStep
          value={data.primaryGoal}
          onChange={(value) => patch({ primaryGoal: value })}
        />
      )}

      {step === 'account' && (
        <AccountStep
          email={user?.email ?? ''}
          password={data.password}
          passwordConfirmation={data.passwordConfirmation}
          onPasswordChange={(value) => patch({ password: value })}
          onPasswordConfirmationChange={(value) =>
            patch({ passwordConfirmation: value })
          }
        />
      )}
    </OnboardingShell>
  );
}

function IntroStep() {
  return (
    <div className="space-y-3 text-center sm:text-left">
      <h1 className="text-2xl font-semibold tracking-tight text-on-surface sm:text-3xl">
        {de.registerWizard.getStarted.title}
      </h1>
      <p className="text-base leading-relaxed text-on-surface-variant">
        {de.registerWizard.getStarted.description}
      </p>
    </div>
  );
}

function TextStep({
  title,
  placeholder,
  value,
  onChange,
  inputMode,
}: {
  title: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  inputMode?: 'text' | 'url' | 'email';
}) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight text-on-surface sm:text-3xl">
        {title}
      </h1>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        autoFocus
        className="h-12 border-white/10 bg-transparent text-base"
      />
    </div>
  );
}

function TextareaStep({
  title,
  description,
  placeholder,
  value,
  onChange,
  optional = false,
}: {
  title: string;
  description: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  optional?: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-on-surface sm:text-3xl">
          {title}
        </h1>
        <p className="text-base leading-relaxed text-on-surface-variant">
          {description}
        </p>
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={6}
        autoFocus
        className="min-h-[160px] resize-y border-white/10 bg-transparent text-base"
      />
      {optional && (
        <p className="text-xs text-on-surface-variant">
          {de.registerWizard.optionalHint}
        </p>
      )}
    </div>
  );
}

function KycStep({
  data,
  patch,
}: {
  data: OnboardingWizardData;
  patch: (partial: Partial<OnboardingWizardData>) => void;
}) {
  return (
    <div className="max-h-[min(70vh,640px)] space-y-6 overflow-y-auto pr-1">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-on-surface sm:text-3xl">
          {de.registerWizard.kyc.title}
        </h1>
        <p className="text-base leading-relaxed text-on-surface-variant">
          {de.registerWizard.kyc.description}
        </p>
      </div>

      <OptionSection title={de.registerWizard.kyc.industry}>
        {ONBOARDING_INDUSTRIES.map((option) => (
          <OptionChip
            key={option}
            label={option}
            selected={data.industry === option}
            onClick={() => patch({ industry: option })}
          />
        ))}
      </OptionSection>

      <OptionSection title={de.registerWizard.kyc.teamSize}>
        {ONBOARDING_TEAM_SIZES.map((option) => (
          <OptionChip
            key={option}
            label={option}
            selected={data.teamSize === option}
            onClick={() => patch({ teamSize: option })}
          />
        ))}
      </OptionSection>

      <OptionSection title={de.registerWizard.kyc.revenue}>
        {ONBOARDING_REVENUE_OPTIONS.map((option) => (
          <OptionChip
            key={option}
            label={option}
            selected={data.monthlyRevenue === option}
            onClick={() => patch({ monthlyRevenue: option })}
          />
        ))}
      </OptionSection>

      <OptionSection title={de.registerWizard.kyc.customers}>
        {ONBOARDING_CUSTOMER_SOURCES.map((option) => (
          <OptionChip
            key={option}
            label={option}
            selected={data.customerSource === option}
            onClick={() => patch({ customerSource: option })}
          />
        ))}
      </OptionSection>

      <OptionSection title={de.registerWizard.kyc.socialMedia}>
        {ONBOARDING_SOCIAL_CHANNELS.map((option) => (
          <OptionChip
            key={option}
            label={option}
            selected={data.socialMediaChannels.includes(option)}
            onClick={() =>
              patch({
                socialMediaChannels: toggleSocialChannel(
                  data.socialMediaChannels,
                  option,
                ),
              })
            }
          />
        ))}
      </OptionSection>
    </div>
  );
}

function CheckWebsiteStep({ pending }: { pending: boolean }) {
  return (
    <div className="space-y-4 text-center sm:text-left">
      <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary sm:mx-0" />
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-on-surface sm:text-3xl">
          {de.registerWizard.checkWebsite.title}
        </h1>
        <p className="text-base leading-relaxed text-on-surface-variant">
          {de.registerWizard.checkWebsite.description}
        </p>
      </div>
    </div>
  );
}

function StartStep({
  value,
  onChange,
}: {
  value: OnboardingWizardData['primaryGoal'];
  onChange: (value: OnboardingWizardData['primaryGoal']) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-on-surface sm:text-3xl">
          {de.registerWizard.start.title}
        </h1>
        <p className="text-base leading-relaxed text-on-surface-variant">
          {de.registerWizard.start.description}
        </p>
      </div>
      <div className="grid gap-2">
        {ONBOARDING_PRIMARY_GOALS.map((option) => (
          <OptionChip
            key={option.value}
            label={option.label}
            selected={value === option.value}
            onClick={() => onChange(option.value)}
          />
        ))}
      </div>
    </div>
  );
}

function AccountStep({
  email,
  password,
  passwordConfirmation,
  onPasswordChange,
  onPasswordConfirmationChange,
}: {
  email: string;
  password: string;
  passwordConfirmation: string;
  onPasswordChange: (value: string) => void;
  onPasswordConfirmationChange: (value: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-on-surface sm:text-3xl">
          {de.registerWizard.account.title}
        </h1>
        <p className="text-base leading-relaxed text-on-surface-variant">
          {de.registerWizard.account.description}
        </p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-on-surface-variant">{de.auth.email}</Label>
          <Input value={email} disabled className="h-11 border-white/10 bg-transparent opacity-70" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="register-password">{de.auth.password}</Label>
          <Input
            id="register-password"
            type="password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            autoComplete="new-password"
            autoFocus
            className="h-11 border-white/10 bg-transparent"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="register-password-confirm">
            {de.registerWizard.account.passwordConfirm}
          </Label>
          <Input
            id="register-password-confirm"
            type="password"
            value={passwordConfirmation}
            onChange={(e) => onPasswordConfirmationChange(e.target.value)}
            autoComplete="new-password"
            className="h-11 border-white/10 bg-transparent"
          />
          <p className="text-xs text-on-surface-variant">
            {de.registerWizard.account.passwordHint}
          </p>
        </div>
      </div>
    </div>
  );
}
