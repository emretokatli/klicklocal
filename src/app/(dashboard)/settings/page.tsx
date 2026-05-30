'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { de } from '@/lib/i18n/de';
import {
  platformRoleLabel,
  workspaceRoleLabel,
} from '@/lib/permissions';
import { useAuth } from '@/store/auth-context';
import { useAppMode } from '@/store/app-mode-context';
import { useWorkspace } from '@/store/workspace-context';

export default function SettingsPage() {
  const { user, session, abilities, isPlatformAdmin } = useAuth();
  const { workspaceId } = useWorkspace();
  const { mode } = useAppMode();

  return (
    <div>
      <PageHeader
        title={de.settings.title}
        description={de.settings.description}
      />
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>{de.settings.profile}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            <span className="text-on-surface-variant">{de.settings.name}:</span>{' '}
            {user?.name}
          </p>
          <p>
            <span className="text-on-surface-variant">{de.settings.email}:</span>{' '}
            {user?.email}
          </p>
          <p>
            <span className="text-on-surface-variant">
              {de.settings.workspaceRole}:
            </span>{' '}
            {workspaceId && abilities?.workspace_role
              ? workspaceRoleLabel(abilities.workspace_role)
              : de.settings.noWorkspaceRole}
          </p>
          {isPlatformAdmin && (
            <p>
              <span className="text-on-surface-variant">
                {de.settings.platformRoles}:
              </span>{' '}
              {abilities?.platform_roles.length
                ? abilities.platform_roles.map(platformRoleLabel).join(', ')
                : '—'}
              {mode === 'customer' && (
                <span className="ml-2 text-xs text-on-surface-variant">
                  ({de.admin.modeAdmin} über Sidebar)
                </span>
              )}
            </p>
          )}
        </CardContent>
      </Card>

      {session?.subscription_limits && (
        <Card className="mt-6 max-w-lg">
          <CardHeader>
            <CardTitle>{de.settings.subscriptionLimits}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {Object.entries(session.subscription_limits).map(([key, val]) => (
              <p key={key}>
                <span className="text-on-surface-variant">{key}:</span>{' '}
                {String(val)}
              </p>
            ))}
          </CardContent>
        </Card>
      )}

      <p className="mt-6 text-sm text-on-surface-variant">
        {de.settings.apiLabel}:{' '}
        {process.env.NEXT_PUBLIC_API_URL ?? de.settings.apiDefault}
      </p>
    </div>
  );
}
