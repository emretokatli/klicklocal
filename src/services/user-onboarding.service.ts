import { apiGet, apiPatch, apiPost } from '@/services/api-client';
import type { User, Workspace } from '@/types/api';

import type { OnboardingWizardData, OnboardingWizardStep } from '@/lib/onboarding-wizard/constants';

export type UserOnboardingStatus = {
  user: User;
  onboarding_completed: boolean;
  onboarding_step: OnboardingWizardStep | string;
  onboarding_data: Partial<OnboardingWizardData>;
};

export const userOnboardingService = {
  status() {
    return apiGet<UserOnboardingStatus>('/auth/onboarding');
  },

  saveProgress(step: OnboardingWizardStep, data: Partial<OnboardingWizardData>) {
    return apiPatch<UserOnboardingStatus>('/auth/onboarding', { step, data });
  },

  complete(payload: {
    password: string;
    password_confirmation: string;
    first_name: string;
    business_name: string;
    website?: string | null;
    industry: string;
    team_size?: string | null;
    monthly_revenue?: string | null;
    customer_source?: string | null;
    social_media_channels?: string[] | null;
    description?: string | null;
    target_audience?: string | null;
    unique_value_proposition?: string | null;
    additional_notes?: string | null;
    primary_goal?: string | null;
    city?: string | null;
  }) {
    return apiPost<{ user: User; workspace: Workspace }>(
      '/auth/onboarding/complete',
      payload,
    );
  },
};
