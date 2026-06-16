import { Heart } from 'lucide-react';

import { de } from '@/lib/i18n/de';

/** Footer shown at the bottom of dashboard/admin pages. */
export function AppFooter() {
  return (
    <footer className="border-t border-outline-soft px-4 py-3 lg:px-8">
      <div className="flex flex-col items-center justify-between gap-1 text-xs text-on-surface-variant sm:flex-row">
        <span>{de.footer.copyright(2026)}</span>
        <span className="inline-flex items-center gap-1">
          {de.footer.madeWithPrefix}
          <Heart className="h-3.5 w-3.5 fill-current text-error" aria-hidden />
          {de.footer.madeWithSuffix}
        </span>
      </div>
    </footer>
  );
}
