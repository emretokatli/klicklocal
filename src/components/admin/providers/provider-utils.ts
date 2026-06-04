import type { SocialProviderKey, SocialProviderSettings } from '@/types/api';

export function providerAppIdLabel(provider: SocialProviderKey): string {
  if (provider === 'tiktok') return 'Client Key';
  return 'App ID';
}

export function providerVersionLabel(provider: SocialProviderKey): string {
  if (provider === 'tiktok') return 'API-Version';
  return 'Graph-Version';
}

export function providerAppIdHint(
  provider: SocialProviderKey,
  hints: {
    instagram: string;
    facebook: string;
    tiktok: string;
  },
): string {
  return hints[provider];
}

export function statusBadgeVariant(
  status: SocialProviderSettings['status'],
): 'default' | 'secondary' | 'draft' {
  if (status === 'ready') return 'default';
  if (status === 'setup') return 'secondary';
  return 'draft';
}

export function statusLabel(
  status: SocialProviderSettings['status'],
  labels: { ready: string; setup: string; disabled: string },
): string {
  if (status === 'ready') return labels.ready;
  if (status === 'setup') return labels.setup;
  return labels.disabled;
}

export function scopesToText(scopes: string[]): string {
  return scopes.join(', ');
}

export function textToScopes(value: string): string[] {
  return value
    .split(',')
    .map((scope) => scope.trim())
    .filter(Boolean);
}
