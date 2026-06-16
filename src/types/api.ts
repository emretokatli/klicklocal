export type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
};

export type ApiError = {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
};

export type User = {
  id: number;
  name: string;
  email: string;
  onboarding_step?: string | null;
  onboarding_completed_at?: string | null;
  onboarding_data?: Record<string, unknown> | null;
};

export type UserAbilities = {
  platform_roles: string[];
  platform_permissions: string[];
  workspace_role: string | null;
  workspace_permissions: string[];
};

export type AuthSession = {
  user: User;
  abilities: UserAbilities;
  is_platform_admin: boolean;
  subscription_limits: Record<string, number | boolean | null>;
  billing?: BillingOverview | null;
  onboarding_completed: boolean;
  onboarding_step?: string | null;
  onboarding_data?: Record<string, unknown> | null;
};

export type AdminUser = User & {
  platform_roles?: string[];
};

export type PlanFeature = {
  id: number;
  plan_id: number;
  feature_key: string;
  feature_value: string;
};

export type Plan = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  monthly_price: string | number;
  yearly_price: string | number;
  trial_days: number;
  is_active: boolean;
  sort_order: number;
  features?: PlanFeature[];
};

export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'cancelled'
  | 'expired'
  | 'past_due';

export type Subscription = {
  id: number;
  workspace_id: number;
  plan_id: number;
  provider: string;
  status: SubscriptionStatus;
  billing_cycle: string;
  trial_ends_at: string | null;
  starts_at: string | null;
  ends_at: string | null;
  cancelled_at: string | null;
  renewal_at: string | null;
  workspace?: Workspace & { owner?: User };
  plan?: Pick<Plan, 'id' | 'name' | 'slug'>;
};

export type MeteredUsageItem = {
  used: number;
  limit: number | boolean | null;
  remaining: number | null;
};

export type BillingOverview = {
  subscription: Subscription | null;
  plan: Plan | null;
  usage: Record<string, MeteredUsageItem>;
  features: Record<string, string>;
  available_plans?: Plan[];
};

export type TopupPackage = {
  key: string;
  label: string;
  amount: number;
  price: number;
};

export type Transaction = {
  id: number;
  subscription_id: number;
  provider: string;
  provider_transaction_id: string | null;
  amount: string | number;
  currency: string;
  status: string;
  created_at: string;
  subscription?: Subscription;
};

export type Invoice = {
  id: number;
  workspace_id: number;
  invoice_number: string;
  amount: string | number;
  currency: string;
  status: string;
  pdf_url: string | null;
  paid_at: string | null;
  created_at: string;
};

export type Coupon = {
  id: number;
  code: string;
  name: string;
  type: 'percent' | 'fixed';
  value: string | number;
  max_redemptions: number | null;
  redeemed_count: number;
  is_active: boolean;
  valid_from: string | null;
  valid_until: string | null;
};

export type SubscriptionUsageRow = {
  id: number;
  workspace_id: number;
  feature_key: string;
  used_value: number;
  reset_at: string;
  workspace?: { id: number; name: string };
};

export type AiPromptCategory = 'caption' | 'content' | 'reply' | 'hashtag' | 'other';

export type AiPromptTemplate = {
  id: number;
  key: string;
  name: string;
  category: AiPromptCategory;
  description: string | null;
  template: string;
  variables: string[] | null;
  is_active: boolean;
  version: number;
};

export type WebAnalyzeResult = {
  website: string;
  score: number | null;
  band: string | null;
  report_markdown: string;
  session_id: string | null;
  duration_ms: number | null;
  model: string | null;
  errors: string[];
  total_cost_usd?: number | null;
  num_turns?: number | null;
  cached?: boolean;
};

export type WebAnalyzeRunStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed';

export type WebAnalyzeRun = {
  id: string;
  website: string;
  status: WebAnalyzeRunStatus;
  partial: boolean;
  error_message: string | null;
  total_cost_usd: number | null;
  num_turns: number | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string | null;
  result: WebAnalyzeResult | null;
};

export type WebAnalyzeRunSummary = {
  id: string;
  website: string;
  status: WebAnalyzeRunStatus;
  partial: boolean;
  error_message: string | null;
  score: number | null;
  band: string | null;
  has_report: boolean;
  total_cost_usd: number | null;
  completed_at: string | null;
  created_at: string | null;
};

export type PlatformSettings = {
  app_name: string;
  support_email: string;
  default_timezone: string;
  maintenance_mode: boolean;
  trial_days: number;
};

export type UsageSummary = {
  ai: number;
  social_api: number;
  queue_job: number;
  storage: number;
};

export type UsageRecord = {
  id: number;
  type: string;
  metric: string;
  quantity: number;
  recorded_at: string;
  workspace?: { id: number; name: string };
  user?: { id: number; name: string; email: string };
};

export type AppMode = 'customer' | 'admin';

export type Workspace = {
  id: number;
  name: string;
  slug: string;
  timezone: string;
  owner_id?: number;
  owner?: User;
  onboarding_step?: number;
  onboarding_completed_at?: string | null;
};

export type BusinessProfile = {
  id: number;
  workspace_id: number;
  business_name: string;
  business_type: string | null;
  city: string | null;
  description: string | null;
  tone_of_voice: string | null;
  products_services: string | null;
  website?: string | null;
  team_size?: string | null;
  monthly_revenue?: string | null;
  customer_source?: string | null;
  social_media_channels?: string[] | null;
  target_audience?: string | null;
  unique_value_proposition?: string | null;
  additional_notes?: string | null;
  primary_goal?: string | null;
};

export type BusinessProfileInput = {
  business_name: string;
  business_type: string;
  city?: string | null;
  description?: string | null;
  tone_of_voice?: string | null;
  products_services?: string | null;
  website?: string | null;
  team_size?: string | null;
  monthly_revenue?: string | null;
  customer_source?: string | null;
  social_media_channels?: string[] | null;
  target_audience?: string | null;
  unique_value_proposition?: string | null;
  additional_notes?: string | null;
  primary_goal?: string | null;
};

export type WebsiteAnalysisBand =
  | 'Kritisch'
  | 'Ausbaufähig'
  | 'Solide'
  | 'Stark';

/** Full analysis — only sent to subscribed (full-tier) workspaces. */
export type WebsiteAnalysisFull = {
  score: number;
  band: WebsiteAnalysisBand;
  summary: string;
  services: string[];
  seo_assessment: string;
  strengths: string[];
  weaknesses: string[];
  brand_tone: string;
  target_audience: string;
  growth_note: string;
};

/** Teaser analysis — sent to unsubscribed workspaces (no full lists/detail). */
export type WebsiteAnalysisTeaser = {
  score: number;
  band: WebsiteAnalysisBand;
  summary: string;
  brand_tone: string;
  strengths_count: number;
  weaknesses_count: number;
  locked_sections: string[];
};

export type WebsiteAnalysisResponse =
  | {
      available: true;
      tier: 'full';
      website: string | null;
      analyzed_at: string | null;
      analysis: WebsiteAnalysisFull;
    }
  | {
      available: true;
      tier: 'teaser';
      website: string | null;
      analyzed_at: string | null;
      analysis: WebsiteAnalysisTeaser;
    }
  | {
      available: false;
      tier: 'full' | 'teaser';
      website: string | null;
      analyzed_at: string | null;
      analysis: null;
    };

export type ContentPlanSuggestion = {
  day: string;
  date: string;
  category: string;
  category_label: string;
  platform: string;
  idea: string;
  trend_title: string | null;
};

export type ContentPlanResponse = {
  week_start: string;
  suggestions: ContentPlanSuggestion[];
};

export type Trend = {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  score: number;
  fit: boolean;
  comment: string;
  suggestion: string;
};

export type TrendsResponse = {
  business_type: string | null;
  trends: Trend[];
};

export type AiGeneration = {
  id: number;
  workspace_id: number;
  user_id: number | null;
  media_id: number | null;
  prompt: string | null;
  caption: string;
  story_text: string | null;
  hashtags: string[] | null;
  call_to_action: string | null;
  model: string | null;
  tokens_used: number;
  platform: string | null;
  content_type: string | null;
  seo_focus: string | null;
  generated_image_url: string | null;
  created_at: string;
  media?: Pick<MediaItem, 'id' | 'file_name' | 'file_path'> | null;
};

export type PostStatus =
  | 'draft'
  | 'scheduled'
  | 'processing'
  | 'published'
  | 'failed';

export type Post = {
  id: number;
  workspace_id: number;
  user_id: number;
  title: string | null;
  content: string | null;
  media_id: number | null;
  media?: MediaItem | null;
  status: PostStatus;
  scheduled_at: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type MediaItem = {
  id: number;
  workspace_id: number;
  user_id: number;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  mime_type: string;
};

export type MediaWithUrl = {
  media: MediaItem;
  url: string;
};

export interface Comment {
  id: number;
  workspace_id: number;
  post_id: number | null;
  platform: 'instagram' | 'tiktok' | 'facebook' | 'linkedin';
  external_id: string | null;
  author: string;
  text: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  commented_at: string | null;
  suggested_reply: string | null;
  reply_text: string | null;
  replied_at: string | null;
  created_at: string;
}

export interface CommentStats {
  total: number;
  positive: number;
  neutral: number;
  negative: number;
}

export type PostStats = {
  total: number;
  scheduled: number;
  published: number;
  failed: number;
  draft: number;
};

export type SocialAccountStatus =
  | 'connected'
  | 'disconnected'
  | 'expired'
  | 'error';

export type SocialAccount = {
  id: number;
  workspace_id: number;
  provider: string;
  provider_account_id: string;
  account_name: string | null;
  username: string | null;
  status: SocialAccountStatus;
  token_expires_at: string | null;
  token_expired: boolean;
  metadata?: Record<string, unknown> | null;
};

export type InstagramConnectionStatus = {
  connected: boolean;
  account: SocialAccount | null;
};

export type TikTokConnectionStatus = {
  connected: boolean;
  account: SocialAccount | null;
};

export type FacebookConnectionStatus = {
  connected: boolean;
  account: SocialAccount | null;
};

export type TikTokPrivacyLevel =
  | 'PUBLIC_TO_EVERYONE'
  | 'MUTUAL_FOLLOW_FRIENDS'
  | 'FOLLOWER_OF_CREATOR'
  | 'SELF_ONLY';

export type TikTokCreatorInfo = {
  privacy_level_options: TikTokPrivacyLevel[];
  comment_disabled: boolean;
  duet_disabled: boolean;
  stitch_disabled: boolean;
  max_video_post_duration_sec?: number | null;
  creator_username?: string | null;
  creator_nickname?: string | null;
  creator_avatar_url?: string | null;
};

export type TikTokCreatorInfoResponse = {
  audited: boolean;
  creator_info: TikTokCreatorInfo;
};

/** Per-post TikTok publishing options sent with quick-publish / post create. */
export type TikTokPublishOptions = {
  privacy_level: TikTokPrivacyLevel;
  disable_comment: boolean;
  disable_duet: boolean;
  disable_stitch: boolean;
  /** Commercial content disclosure is enabled (paid partnership / promotion). */
  brand_content_toggle: boolean;
  brand_organic_toggle: boolean;
};

export type SocialProviderKey = 'facebook' | 'instagram' | 'tiktok';

export type SocialProviderStatus = 'ready' | 'setup' | 'disabled';

export type SocialProviderSettings = {
  provider: SocialProviderKey;
  name: string;
  description: string;
  enabled: boolean;
  app_id: string | null;
  callback_url: string;
  configured: boolean;
  has_app_secret: boolean;
  default_callback_url: string | null;
  scopes: string[];
  api_version: string;
  status: SocialProviderStatus;
  setup_title: string;
  setup_description: string;
  secret_env_key: string;
  setup_doc: string | null;
  before_save: string[];
  usage_note: string;
};

/** @deprecated Use SocialProviderSettings */
export type InstagramProviderSettings = SocialProviderSettings;

export type UpdateSocialProviderPayload = {
  enabled?: boolean;
  app_id?: string | null;
  callback_url?: string | null;
  api_version?: string | null;
  scopes?: string[];
};
