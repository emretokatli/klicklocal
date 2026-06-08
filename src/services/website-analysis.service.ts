import { apiPost } from '@/services/api-client';

import type { WebsiteAnalysisResult } from '@/lib/register-wizard/constants';

export const websiteAnalysisService = {
  analyze(payload: {
    website: string;
    business_name?: string;
    industry?: string;
  }) {
    return apiPost<{ analysis: WebsiteAnalysisResult }>(
      '/onboarding/analyze-website',
      payload,
      { skipAuth: true },
    ).then((data) => data.analysis);
  },
};
