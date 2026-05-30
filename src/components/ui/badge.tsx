import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'chip-primary',
        secondary: 'bg-secondary/15 text-secondary border-secondary/25',
        draft: 'chip-muted',
        scheduled: 'bg-secondary/15 text-secondary border-secondary/25',
        processing: 'bg-tertiary/15 text-tertiary border-tertiary/25',
        published: 'chip-primary',
        failed: 'bg-error/15 text-error border-error/30',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
