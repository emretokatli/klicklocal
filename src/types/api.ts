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
