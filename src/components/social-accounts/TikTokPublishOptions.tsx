'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';

import { NativeSelect } from '@/components/ui/native-select';
import { de } from '@/lib/i18n/de';
import { socialAccountsService } from '@/services/social-accounts.service';
import type { TikTokPrivacyLevel, TikTokPublishOptions } from '@/types/api';

const t = de.socialAccounts.tiktokPublish;

export const DEFAULT_TIKTOK_OPTIONS: TikTokPublishOptions = {
  privacy_level: 'SELF_ONLY',
  disable_comment: false,
  disable_duet: false,
  disable_stitch: false,
  brand_content_toggle: false,
  brand_organic_toggle: false,
};

type Props = {
  workspaceId: number;
  value: TikTokPublishOptions;
  onChange: (value: TikTokPublishOptions) => void;
  /** Surface a validation message to the parent so it can block submit. */
  onValidityChange?: (error: string | null) => void;
};

export function TikTokPublishOptions({
  workspaceId,
  value,
  onChange,
  onValidityChange,
}: Props) {
  const infoQuery = useQuery({
    queryKey: ['tiktok', 'creator-info', workspaceId],
    queryFn: () => socialAccountsService.tiktokCreatorInfo(workspaceId),
    enabled: workspaceId !== null,
  });

  const audited = infoQuery.data?.audited ?? false;
  const options: TikTokPrivacyLevel[] = useMemo(
    () => infoQuery.data?.creator_info.privacy_level_options ?? ['SELF_ONLY'],
    [infoQuery.data],
  );

  const disclosureOn = value.brand_content_toggle || value.brand_organic_toggle;

  // Keep the selected privacy level valid against what TikTok returned.
  useEffect(() => {
    if (options.length > 0 && !options.includes(value.privacy_level)) {
      onChange({ ...value, privacy_level: options[0] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  // Validation: branded content cannot be private; disclosure requires a choice.
  const validationError = useMemo<string | null>(() => {
    if (
      value.brand_content_toggle &&
      value.privacy_level === 'SELF_ONLY'
    ) {
      return t.brandedNotPrivate;
    }
    return null;
  }, [value.brand_content_toggle, value.privacy_level]);

  useEffect(() => {
    onValidityChange?.(validationError);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validationError]);

  if (infoQuery.isLoading) {
    return <p className="text-sm text-on-surface-variant">{t.loading}</p>;
  }

  if (infoQuery.isError) {
    return <p className="text-sm text-error">{t.loadError}</p>;
  }

  const set = (patch: Partial<TikTokPublishOptions>) =>
    onChange({ ...value, ...patch });

  return (
    <div className="space-y-4 rounded-xl border border-outline-soft p-4">
      <p className="text-sm font-medium text-on-surface">{t.title}</p>

      {!audited && (
        <p className="rounded-lg bg-warning/10 px-3 py-2 text-xs text-warning">
          {t.auditNotice}
        </p>
      )}

      <div className="space-y-1">
        <label className="text-sm text-on-surface-variant" htmlFor="tt-privacy">
          {t.privacyLabel}
        </label>
        <NativeSelect
          id="tt-privacy"
          value={value.privacy_level}
          disabled={!audited}
          onChange={(e) =>
            set({ privacy_level: e.target.value as TikTokPrivacyLevel })
          }
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {t.privacy[opt]}
            </option>
          ))}
        </NativeSelect>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm text-on-surface-variant">{t.interaction}</legend>
        <Toggle
          label={t.allowComment}
          checked={!value.disable_comment}
          onChange={(on) => set({ disable_comment: !on })}
        />
        <Toggle
          label={t.allowDuet}
          checked={!value.disable_duet}
          onChange={(on) => set({ disable_duet: !on })}
        />
        <Toggle
          label={t.allowStitch}
          checked={!value.disable_stitch}
          onChange={(on) => set({ disable_stitch: !on })}
        />
      </fieldset>

      <div className="space-y-2 border-t border-outline-soft pt-3">
        <Toggle
          label={t.disclosureTitle}
          checked={disclosureOn}
          onChange={(on) =>
            set(
              on
                ? value // keep current sub-toggles
                : { brand_content_toggle: false, brand_organic_toggle: false },
            )
          }
        />
        <p className="text-xs text-on-surface-variant">{t.disclosureHint}</p>

        {disclosureOn && (
          <div className="ml-1 space-y-2 border-l border-outline-soft pl-3">
            <Toggle
              label={t.yourBrand}
              checked={value.brand_organic_toggle}
              onChange={(on) => set({ brand_organic_toggle: on })}
            />
            <p className="text-xs text-on-surface-variant">{t.yourBrandHint}</p>
            <Toggle
              label={t.brandedContent}
              checked={value.brand_content_toggle}
              onChange={(on) => set({ brand_content_toggle: on })}
            />
            <p className="text-xs text-on-surface-variant">
              {t.brandedContentHint}
            </p>
            {!value.brand_content_toggle && !value.brand_organic_toggle && (
              <p className="text-xs text-error">{t.disclosureRequired}</p>
            )}
          </div>
        )}
      </div>

      {validationError && (
        <p className="text-xs text-error">{validationError}</p>
      )}

      <p className="text-xs text-on-surface-variant">{t.complianceNote}</p>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-on-surface">
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-outline-soft text-primary focus:ring-primary/40"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}
