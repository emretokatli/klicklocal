import type { UserAbilities } from '@/types/api';

export const PLATFORM_PERMISSIONS = {
  manageUsers: 'manage_users',
  managePlans: 'manage_plans',
  manageSubscriptions: 'manage_subscriptions',
  manageAiPrompts: 'manage_ai_prompts',
  manageSettings: 'manage_platform_settings',
  viewUsage: 'view_usage_analytics',
} as const;

export function hasPlatformPermission(
  abilities: UserAbilities | undefined,
  permission: string,
): boolean {
  if (!abilities) return false;
  if (abilities.platform_roles.includes('super_admin')) return true;
  return abilities.platform_permissions.includes(permission);
}

export function workspaceRoleLabel(role: string | null): string {
  const labels: Record<string, string> = {
    owner: 'Inhaber',
    manager: 'Manager',
    editor: 'Editor',
    viewer: 'Betrachter',
  };
  return role ? (labels[role] ?? role) : '—';
}

export function platformRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    super_admin: 'Super-Admin',
    admin: 'Admin',
    support: 'Support',
  };
  return labels[role] ?? role;
}
