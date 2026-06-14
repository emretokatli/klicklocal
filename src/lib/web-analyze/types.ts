export type CategoryScore = {
  name: string;
  points: number;
  max: number;
};

export type GrowthForecastRow = {
  horizon: string;
  growth: string;
  revenue: string;
  revenueMin?: number;
  revenueMax?: number;
};

export type CrmField = {
  label: string;
  value: string;
};

export type ParsedWebAnalyzeReport = {
  businessName: string;
  url: string;
  score: number | null;
  band: string | null;
  categories: CategoryScore[];
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  seoAssessment: string;
  crm: CrmField[];
  marketPotential: string;
  growthForecast: GrowthForecastRow[];
  growthAssumptions: string;
  growthDisclaimer: string | null;
  talkingPoints: string[];
  preamble: string | null;
  /** v2 sections — empty/null when parsing a v1 report */
  socialAudit: string;
  googleVisibility: string;
  klicklocalPitch: string[];
  internalNotes: string | null;
};
