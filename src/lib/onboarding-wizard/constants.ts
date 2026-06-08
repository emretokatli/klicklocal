export const ONBOARDING_INDUSTRIES = [
  'Professionelle Dienstleistungen',
  'Kreative Dienstleistungen',
  'Bildung',
  'E-Commerce',
  'Café & Bäckerei',
  'Imbiss',
  'Einzelhändler',
  'Mode-Boutique',
  'Friseur- & Kosmetiksalon',
  'Personal Trainer & Fitness',
  'Handwerker & Werkstatt',
] as const;

export const ONBOARDING_TEAM_SIZES = [
  'Nur ich',
  '2 Personen',
  '3-5 Personen',
  '6-10 Personen',
  '10+ Personen',
] as const;

export const ONBOARDING_REVENUE_OPTIONS = [
  'Noch kein Umsatz',
  'Unter €1k',
  '€1k - €5k',
  '€5k - €10k',
  '€10k - €25k',
  '€25k - €50k',
  '€50k - €100k',
  '€100k+',
] as const;

export const ONBOARDING_CUSTOMER_SOURCES = [
  'Mundpropaganda',
  'Google-Suche',
  'Bezahlte Werbung',
  'Organische soziale Medien',
  'Kaltakquise',
  'Veranstaltungen',
  'Partnerschaften',
  'Andere',
  'Noch keine Kunden',
] as const;

export const ONBOARDING_SOCIAL_CHANNELS = [
  'Facebook',
  'Instagram',
  'LinkedIn',
  'YouTube',
  'TikTok',
  'X (Twitter)',
  'Andere',
  'Keine',
] as const;

export const ONBOARDING_PRIMARY_GOALS = [
  { value: 'social-media', label: '📅 Social Media verwalten' },
  { value: 'website', label: '🧑‍💻 Website erstellen' },
  { value: 'strategy', label: '📍 Geschäftsstrategie planen' },
  { value: 'content', label: '🖼️ Inhalte & Grafiken erstellen' },
  { value: 'leads', label: '📣 Neue Leads finden' },
  { value: 'email', label: '✉️ E-Mail-Postfach verwalten' },
  { value: 'seo', label: '📈 SEO-Rankings verbessern' },
  { value: 'other', label: 'Andere' },
] as const;

export type OnboardingIndustry = (typeof ONBOARDING_INDUSTRIES)[number];
export type OnboardingTeamSize = (typeof ONBOARDING_TEAM_SIZES)[number];
export type OnboardingRevenue = (typeof ONBOARDING_REVENUE_OPTIONS)[number];
export type OnboardingCustomerSource = (typeof ONBOARDING_CUSTOMER_SOURCES)[number];
export type OnboardingSocialChannel = (typeof ONBOARDING_SOCIAL_CHANNELS)[number];
export type OnboardingPrimaryGoal = (typeof ONBOARDING_PRIMARY_GOALS)[number]['value'];

export type OnboardingWizardStep =
  | 'get-started'
  | 'your-name'
  | 'business-name'
  | 'website'
  | 'kyc'
  | 'check-website'
  | 'result-check-website'
  | 'target'
  | 'business-special'
  | 'additional'
  | 'start'
  | 'account';

export const ONBOARDING_WIZARD_STEPS: OnboardingWizardStep[] = [
  'get-started',
  'your-name',
  'business-name',
  'website',
  'kyc',
  'check-website',
  'result-check-website',
  'target',
  'business-special',
  'additional',
  'start',
  'account',
];

export type OnboardingWizardData = {
  firstName: string;
  businessName: string;
  website: string;
  industry: OnboardingIndustry | '';
  teamSize: OnboardingTeamSize | '';
  monthlyRevenue: OnboardingRevenue | '';
  customerSource: OnboardingCustomerSource | '';
  socialMediaChannels: OnboardingSocialChannel[];
  description: string;
  targetAudience: string;
  uniqueValueProposition: string;
  additionalNotes: string;
  primaryGoal: OnboardingPrimaryGoal | '';
  city: string;
  password: string;
  passwordConfirmation: string;
};

export const INITIAL_ONBOARDING_WIZARD_DATA: OnboardingWizardData = {
  firstName: '',
  businessName: '',
  website: '',
  industry: '',
  teamSize: '',
  monthlyRevenue: '',
  customerSource: '',
  socialMediaChannels: [],
  description: '',
  targetAudience: '',
  uniqueValueProposition: '',
  additionalNotes: '',
  primaryGoal: '',
  city: '',
  password: '',
  passwordConfirmation: '',
};

export type WebsiteAnalysisResult = {
  description: string;
  target_audience: string;
  unique_value_proposition: string;
  additional_notes: string;
  city: string | null;
};

export function isOnboardingWizardStep(value: string): value is OnboardingWizardStep {
  return (ONBOARDING_WIZARD_STEPS as readonly string[]).includes(value);
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function asStringArray(value: unknown): OnboardingSocialChannel[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is OnboardingSocialChannel => typeof item === 'string');
}

export function mergeOnboardingData(
  saved: Partial<OnboardingWizardData> | Record<string, unknown> | null | undefined,
): OnboardingWizardData {
  const raw = saved ?? {};

  return {
    firstName: asString(raw.firstName),
    businessName: asString(raw.businessName),
    website: asString(raw.website),
    industry: asString(raw.industry) as OnboardingWizardData['industry'],
    teamSize: asString(raw.teamSize) as OnboardingWizardData['teamSize'],
    monthlyRevenue: asString(raw.monthlyRevenue) as OnboardingWizardData['monthlyRevenue'],
    customerSource: asString(raw.customerSource) as OnboardingWizardData['customerSource'],
    socialMediaChannels: asStringArray(raw.socialMediaChannels),
    description: asString(raw.description),
    targetAudience: asString(raw.targetAudience),
    uniqueValueProposition: asString(raw.uniqueValueProposition),
    additionalNotes: asString(raw.additionalNotes),
    primaryGoal: asString(raw.primaryGoal) as OnboardingWizardData['primaryGoal'],
    city: asString(raw.city),
    password: asString(raw.password),
    passwordConfirmation: asString(raw.passwordConfirmation),
  };
}
