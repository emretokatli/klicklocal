'use client';

import Link from 'next/link';
import {
  BarChart3,
  Bot,
  CreditCard,
  Package,
  Plug,
  Receipt,
  Tag,
  Users,
} from 'lucide-react';

import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { de } from '@/lib/i18n/de';
import { PLATFORM_PERMISSIONS, hasPlatformPermission } from '@/lib/permissions';
import { useAuth } from '@/store/auth-context';

const cards = [
  {
    href: '/admin/users',
    permission: PLATFORM_PERMISSIONS.manageUsers,
    title: de.admin.dashboard.cards.users,
    icon: Users,
  },
  {
    href: '/admin/plans',
    permission: PLATFORM_PERMISSIONS.managePlans,
    title: de.admin.dashboard.cards.plans,
    icon: Package,
  },
  {
    href: '/admin/subscriptions',
    permission: PLATFORM_PERMISSIONS.manageSubscriptions,
    title: de.admin.dashboard.cards.subscriptions,
    icon: CreditCard,
  },
  {
    href: '/admin/transactions',
    permission: PLATFORM_PERMISSIONS.manageSubscriptions,
    title: de.admin.dashboard.cards.transactions,
    icon: Receipt,
  },
  {
    href: '/admin/coupons',
    permission: PLATFORM_PERMISSIONS.manageSubscriptions,
    title: de.admin.dashboard.cards.coupons,
    icon: Tag,
  },
  {
    href: '/admin/ai-prompts',
    permission: PLATFORM_PERMISSIONS.manageAiPrompts,
    title: de.admin.dashboard.cards.prompts,
    icon: Bot,
  },
  {
    href: '/admin/usage',
    permission: PLATFORM_PERMISSIONS.viewUsage,
    title: de.admin.dashboard.cards.usage,
    icon: BarChart3,
  },
  {
    href: '/admin/providers',
    permission: PLATFORM_PERMISSIONS.manageSocialProviders,
    title: de.admin.dashboard.cards.providers,
    icon: Plug,
  },
];

export default function AdminDashboardPage() {
  const { abilities, user } = useAuth();

  return (
    <div>
      <PageHeader
        title={de.admin.dashboard.title}
        description={de.admin.dashboard.description}
      />
      <p className="mb-8 text-on-surface-variant">
        {de.admin.dashboard.welcome}{' '}
        <span className="font-medium text-on-surface">{user?.name}</span>
        {abilities?.platform_roles.length ? (
          <> — {abilities.platform_roles.join(', ')}</>
        ) : null}
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards
          .filter((c) => hasPlatformPermission(abilities ?? undefined, c.permission))
          .map(({ href, title, icon: Icon }) => (
            <Link key={href} href={href}>
              <Card className="transition-colors hover:border-primary/30">
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <Icon className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-primary">{de.common.next} →</p>
                </CardContent>
              </Card>
            </Link>
          ))}
      </div>
    </div>
  );
}
