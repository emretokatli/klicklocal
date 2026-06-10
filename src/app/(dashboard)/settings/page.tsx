'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { SubscriptionGate } from '@/components/billing/SubscriptionGate';
import { UsageMeters } from '@/components/billing/UsageMeters';
import { BusinessProfileForm } from '@/components/business/BusinessProfileForm';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  useBusinessProfile,
  useSaveBusinessProfile,
} from '@/hooks/use-business-profile';
import { de } from '@/lib/i18n/de';
import { platformRoleLabel, workspaceRoleLabel } from '@/lib/permissions';
import { resolveMediaUrl } from '@/lib/storage-url';
import { formatBytes, cn } from '@/lib/utils';
import { ApiClientError } from '@/services/api-client';
import { billingService } from '@/services/billing.service';
import { mediaService } from '@/services/media.service';
import { workspacesService } from '@/services/workspaces.service';
import { useAppMode } from '@/store/app-mode-context';
import { useAuth } from '@/store/auth-context';
import { useWorkspace } from '@/store/workspace-context';

type SettingsTab = 'profil' | 'workspace' | 'medien' | 'nutzung';

const TABS: { key: SettingsTab; label: string }[] = [
  { key: 'profil',    label: 'Profil'     },
  { key: 'workspace', label: 'Workspace'  },
  { key: 'medien',    label: 'Medien'     },
  { key: 'nutzung',   label: 'Nutzung'   },
];

// ── Profil Tab ────────────────────────────────────────────────────────────────
function ProfilTab() {
  const { user, session, abilities, isPlatformAdmin } = useAuth();
  const { workspaceId } = useWorkspace();
  const { mode } = useAppMode();

  const profileQuery = useBusinessProfile(workspaceId);
  const saveProfile = useSaveBusinessProfile(workspaceId);
  const [profileError, setProfileError] = useState<string | null>(null);

  return (
    <div className="space-y-6">
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
            <span className="text-on-surface-variant">{de.settings.workspaceRole}:</span>{' '}
            {workspaceId && abilities?.workspace_role
              ? workspaceRoleLabel(abilities.workspace_role)
              : de.settings.noWorkspaceRole}
          </p>
          {isPlatformAdmin && (
            <p>
              <span className="text-on-surface-variant">{de.settings.platformRoles}:</span>{' '}
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
        <Card className="max-w-lg">
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

      {workspaceId && (
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>{de.business.title}</CardTitle>
          </CardHeader>
          <CardContent>
            {profileQuery.isLoading ? (
              <div className="flex justify-center py-6">
                <LoadingSpinner />
              </div>
            ) : (
              <BusinessProfileForm
                initial={profileQuery.data}
                onSubmit={(payload) => {
                  setProfileError(null);
                  saveProfile.mutate(payload, {
                    onError: (e) => {
                      setProfileError(
                        e instanceof ApiClientError ? e.message : de.common.genericError,
                      );
                    },
                  });
                }}
                pending={saveProfile.isPending}
                error={profileError}
                submitLabel={de.business.save}
              />
            )}
          </CardContent>
        </Card>
      )}

      <p className="text-sm text-on-surface-variant">
        {de.settings.apiLabel}:{' '}
        {process.env.NEXT_PUBLIC_API_URL ?? de.settings.apiDefault}
      </p>
    </div>
  );
}

// ── Workspace Tab ─────────────────────────────────────────────────────────────
function WorkspaceTab() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => workspacesService.list(),
  });

  const createMutation = useMutation({
    mutationFn: () => workspacesService.create(name),
    onSuccess: () => {
      setName('');
      void queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
    onError: (e: Error) => {
      setError(
        e instanceof ApiClientError ? e.message : de.workspaces.createFailed,
      );
    },
  });

  return (
    <div>
      <Card className="mb-6">
        <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row">
          <Input
            placeholder={de.workspaces.namePlaceholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1"
          />
          <Button
            disabled={!name.trim() || createMutation.isPending}
            onClick={() => createMutation.mutate()}
          >
            {de.workspaces.create}
          </Button>
        </CardContent>
      </Card>

      {error && <p className="mb-4 text-sm text-error">{error}</p>}

      {query.data?.length === 0 && (
        <EmptyState
          title={de.workspaces.emptyTitle}
          description={de.workspaces.emptyDesc}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {query.data?.map((ws) => (
          <Card key={ws.id}>
            <CardContent className="pt-6">
              <p className="font-medium">{ws.name}</p>
              <p className="text-sm text-on-surface-variant">{ws.slug}</p>
              <p className="mt-1 text-xs text-on-surface-variant/70">
                {ws.timezone}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Medien Tab ────────────────────────────────────────────────────────────────
function MedienTab() {
  const { workspaceId } = useWorkspace();
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaQuery = useQuery({
    queryKey: ['media', workspaceId],
    queryFn: () => mediaService.list(workspaceId!),
    enabled: workspaceId !== null,
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) =>
      mediaService.upload(workspaceId!, file, setProgress),
    onSuccess: () => {
      setProgress(0);
      void queryClient.invalidateQueries({ queryKey: ['media', workspaceId] });
    },
    onError: (e: Error) => {
      setProgress(0);
      setError(
        e instanceof ApiClientError ? e.message : de.media.uploadFailed,
      );
    },
  });

  if (!workspaceId) {
    return <EmptyState title={de.billing.noWorkspace} description="" />;
  }

  return (
    <SubscriptionGate>
      <div>
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-on-surface-variant">{de.media.description}</p>
          <Button
            disabled={uploadMutation.isPending}
            onClick={() => document.getElementById('media-upload-settings')?.click()}
          >
            {de.media.upload}
          </Button>
        </div>

        <input
          id="media-upload-settings"
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime"
          className="hidden"
          disabled={uploadMutation.isPending}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setError(null);
              uploadMutation.mutate(file);
            }
            e.target.value = '';
          }}
        />

        {uploadMutation.isPending && (
          <Card className="mb-6 p-4">
            <p className="mb-2 text-sm text-on-surface-variant">
              {de.media.uploading}
            </p>
            <Progress value={progress} />
          </Card>
        )}

        {error && <p className="mb-4 text-sm text-error">{error}</p>}

        {mediaQuery.isLoading && (
          <div className="flex justify-center py-16">
            <LoadingSpinner />
          </div>
        )}

        {mediaQuery.isSuccess && mediaQuery.data.length === 0 && (
          <EmptyState
            title={de.media.emptyTitle}
            description={de.media.emptyDesc}
          />
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {mediaQuery.data?.map(({ media, url }) => {
            const src = resolveMediaUrl(media.file_path, url);
            const isImage = media.mime_type.startsWith('image/');

            return (
              <Card key={media.id} className="overflow-hidden">
                <a
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block aspect-square bg-surface-container-high"
                >
                  {isImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={src}
                      alt={media.file_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-on-surface-variant">
                      {de.media.video}
                    </div>
                  )}
                </a>
                <div className="border-t border-white/10 p-3">
                  <p className="truncate text-sm font-medium">{media.file_name}</p>
                  <p className="text-xs text-on-surface-variant">
                    {formatBytes(media.file_size)}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </SubscriptionGate>
  );
}

// ── Nutzung Tab ───────────────────────────────────────────────────────────────
function NutzungTab() {
  const { workspaceId, workspace } = useWorkspace();

  const query = useQuery({
    queryKey: ['usage', workspaceId],
    queryFn: () => billingService.usage(workspaceId!),
    enabled: workspaceId !== null,
  });

  if (!workspaceId) {
    return (
      <EmptyState
        title={de.billing.noWorkspace}
        description={de.dashboard.selectWorkspace}
      />
    );
  }

  return (
    <div>
      {workspace?.name && (
        <p className="mb-4 text-sm text-on-surface-variant">{workspace.name}</p>
      )}
      {query.data && <UsageMeters usage={query.data} title={de.billing.usageTitle} />}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profil');

  return (
    <div>
      <PageHeader
        title={de.settings.title}
        description={de.settings.description}
      />

      {/* Tab Bar */}
      <div className="mb-6 flex gap-1 border-b border-white/10">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'px-4 py-2 text-sm font-medium transition border-b-2 -mb-px',
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profil'    && <ProfilTab />}
      {activeTab === 'workspace' && <WorkspaceTab />}
      {activeTab === 'medien'    && <MedienTab />}
      {activeTab === 'nutzung'   && <NutzungTab />}
    </div>
  );
}
