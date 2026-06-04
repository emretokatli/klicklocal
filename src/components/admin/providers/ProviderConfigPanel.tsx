import { SocialProviderIcon } from '@/components/admin/providers/SocialProviderIcon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { SocialProviderSettings } from '@/types/api';

import {
  providerAppIdHint,
  providerAppIdLabel,
  providerVersionLabel,
  scopesToText,
  textToScopes,
} from './provider-utils';

type ProviderConfigPanelProps = {
  provider: SocialProviderSettings;
  form: SocialProviderSettings;
  onChange: (next: SocialProviderSettings) => void;
  onSave: () => void;
  isSaving: boolean;
  labels: {
    apiConfiguration: string;
    configureHint: string;
    enabled: string;
    disabled: string;
    callbackUrl: string;
    permissions: string;
    permissionsHint: string;
    providerStatus: string;
    configured: string;
    notConfigured: string;
    secretHint: string;
    defaultCallback: string;
    setupDoc: string;
    beforeSave: string;
    usedByChannels: string;
    pageNote: string;
    saveConfiguration: string;
    appIdHint: string;
    facebookAppIdHint: string;
    tiktokClientKeyHint: string;
  };
};

export function ProviderConfigPanel({
  provider,
  form,
  onChange,
  onSave,
  isSaving,
  labels,
}: ProviderConfigPanelProps) {
  const appIdHint = providerAppIdHint(provider.provider, {
    instagram: labels.appIdHint,
    facebook: labels.facebookAppIdHint,
    tiktok: labels.tiktokClientKeyHint,
  });

  return (
    <Card className="border-white/10">
      <CardHeader className="space-y-4 border-b border-white/5 pb-6">
        <div className="flex flex-wrap items-start gap-4">
          <SocialProviderIcon provider={provider.provider} size="lg" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <CardTitle className="text-2xl">{provider.name}</CardTitle>
              <Badge variant="draft" className="uppercase tracking-widest">
                {labels.apiConfiguration}
              </Badge>
            </div>
            <p className="text-sm text-on-surface-variant">{labels.configureHint}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        <div className="rounded-2xl border border-white/10 bg-surface-container-high/60 p-5">
          <h3 className="mb-2 text-sm font-semibold text-on-surface">
            {provider.setup_title}
          </h3>
          <p className="text-sm text-on-surface-variant">
            {provider.setup_description}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <p className="text-sm text-on-surface-variant">
              {labels.providerStatus}:{' '}
              <span className="font-medium text-on-surface">
                {form.configured ? labels.configured : labels.notConfigured}
              </span>
            </p>

            <fieldset className="space-y-3">
              <legend className="text-sm font-medium text-on-surface">
                Status
              </legend>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name={`${provider.provider}-enabled`}
                  checked={form.enabled}
                  onChange={() => onChange({ ...form, enabled: true })}
                  className="h-4 w-4"
                />
                {labels.enabled}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name={`${provider.provider}-enabled`}
                  checked={!form.enabled}
                  onChange={() => onChange({ ...form, enabled: false })}
                  className="h-4 w-4"
                />
                {labels.disabled}
              </label>
            </fieldset>

            <div className="space-y-2">
              <Label>{providerAppIdLabel(provider.provider)}</Label>
              <Input
                value={form.app_id ?? ''}
                onChange={(e) =>
                  onChange({
                    ...form,
                    app_id: e.target.value || null,
                  })
                }
              />
              <p className="text-xs text-on-surface-variant">{appIdHint}</p>
            </div>

            <p className="text-xs text-on-surface-variant">
              {labels.secretHint.replace('{envKey}', provider.secret_env_key)}
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{providerVersionLabel(provider.provider)}</Label>
              <Input
                value={form.api_version}
                onChange={(e) =>
                  onChange({ ...form, api_version: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>{labels.callbackUrl}</Label>
              <Input
                value={form.callback_url}
                onChange={(e) =>
                  onChange({ ...form, callback_url: e.target.value })
                }
              />
              {form.default_callback_url && (
                <p className="text-xs text-on-surface-variant">
                  {labels.defaultCallback}: {form.default_callback_url}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>{labels.permissions}</Label>
              <Textarea
                value={scopesToText(form.scopes)}
                onChange={(e) =>
                  onChange({
                    ...form,
                    scopes: textToScopes(e.target.value),
                  })
                }
                className="min-h-[120px] font-mono text-xs"
              />
              <p className="text-xs text-on-surface-variant">
                {labels.permissionsHint}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-surface-container-high/40 p-5">
            <h3 className="mb-3 text-sm font-semibold text-on-surface">
              {labels.beforeSave}
            </h3>
            <ul className="space-y-2 text-sm text-on-surface-variant">
              {provider.before_save.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-surface-container-high/40 p-5">
            <h3 className="mb-3 text-sm font-semibold text-on-surface">
              {labels.usedByChannels}
            </h3>
            <p className="text-sm text-on-surface-variant">
              {provider.usage_note}
            </p>
            {provider.setup_doc && (
              <p className="mt-3 text-xs text-on-surface-variant">
                {labels.setupDoc.replace('{doc}', provider.setup_doc)}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-6">
          <p className="max-w-xl text-xs text-on-surface-variant">
            {labels.pageNote}
          </p>
          <Button disabled={isSaving} onClick={onSave}>
            {labels.saveConfiguration}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
