import * as React from 'react';

import { cn } from '@/lib/utils';

export const NativeSelect = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      'native-select flex h-10 w-full rounded-xl border border-outline-soft bg-surface-container-high px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    {...props}
  >
    {children}
  </select>
));
NativeSelect.displayName = 'NativeSelect';
