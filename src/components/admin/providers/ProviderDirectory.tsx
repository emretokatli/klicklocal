import { SocialProviderIcon } from '@/components/admin/providers/SocialProviderIcon';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { SocialProviderSettings } from '@/types/api';

import { statusBadgeVariant, statusLabel } from './provider-utils';

type ProviderDirectoryProps = {
  providers: SocialProviderSettings[];
  selectedProvider: SocialProviderSettings['provider'];
  onSelect: (provider: SocialProviderSettings['provider']) => void;
  labels: {
    chooseProvider: string;
    providerCount: string;
    statusReady: string;
    statusSetup: string;
    statusDisabled: string;
  };
};

export function ProviderDirectory({
  providers,
  selectedProvider,
  onSelect,
  labels,
}: ProviderDirectoryProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-semibold text-on-surface">
          {labels.chooseProvider}
        </h2>
        <Badge variant="draft" className="uppercase tracking-widest">
          {providers.length} {labels.providerCount}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {providers.map((provider) => {
          const selected = provider.provider === selectedProvider;

          return (
            <button
              key={provider.provider}
              type="button"
              onClick={() => onSelect(provider.provider)}
              className={cn(
                'glass-card flex h-full flex-col rounded-2xl border p-5 text-left transition-all',
                selected
                  ? 'border-primary/50 ring-2 ring-primary/20'
                  : 'border-outline-soft hover:border-outline-strong',
              )}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <SocialProviderIcon provider={provider.provider} size="lg" />
                <Badge variant={statusBadgeVariant(provider.status)}>
                  {statusLabel(provider.status, {
                    ready: labels.statusReady,
                    setup: labels.statusSetup,
                    disabled: labels.statusDisabled,
                  })}
                </Badge>
              </div>

              <h3 className="mb-2 text-base font-semibold text-on-surface">
                {provider.name}
              </h3>
              <p className="text-sm leading-relaxed text-on-surface-variant">
                {provider.description}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
