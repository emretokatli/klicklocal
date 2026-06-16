'use client';

import {
  BarChart3,
  Bot,
  CreditCard,
  Globe,
  LayoutDashboard,
  MessageCircle,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Plug,
  Receipt,
  Settings,
  Shield,
  Share2,
  Sparkles,
  SquarePen,
  Tag,
  User,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Logo } from '@/components/brand/Logo';
import { Button } from '@/components/ui/button';
import { de } from '@/lib/i18n/de';
import { PLATFORM_PERMISSIONS, hasPlatformPermission } from '@/lib/permissions';
import { cn } from '@/lib/utils';
import { useAppMode } from '@/store/app-mode-context';
import { useAuth } from '@/store/auth-context';
import type { UserAbilities } from '@/types/api';

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? '0.0.0';

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const customerNav: NavItem[] = [
  { href: '/dashboard',       label: de.nav.dashboard,      icon: LayoutDashboard },
  { href: '/ai',              label: de.nav.aiStudio,       icon: Sparkles },
  { href: '/posts',           label: de.nav.posts,          icon: SquarePen },
  { href: '/social-accounts', label: de.nav.socialAccounts, icon: Share2 },
  { href: '/comments',        label: de.nav.comments,       icon: MessageCircle },
  { href: '/billing',         label: de.nav.billing,        icon: CreditCard },
  { href: '/settings',        label: de.nav.settings,       icon: Settings },
];

function buildAdminNav(abilities: UserAbilities | null): NavItem[] {
  const items: NavItem[] = [
    { href: '/admin/dashboard', label: de.admin.nav.overview, icon: Shield },
  ];

  if (hasPlatformPermission(abilities ?? undefined, PLATFORM_PERMISSIONS.manageUsers)) {
    items.push({ href: '/admin/users', label: de.admin.nav.users, icon: Users });
  }
  if (hasPlatformPermission(abilities ?? undefined, PLATFORM_PERMISSIONS.managePlans)) {
    items.push({ href: '/admin/plans', label: de.admin.nav.plans, icon: Package });
  }
  if (
    hasPlatformPermission(abilities ?? undefined, PLATFORM_PERMISSIONS.manageSubscriptions)
  ) {
    items.push({
      href: '/admin/subscriptions',
      label: de.admin.nav.subscriptions,
      icon: CreditCard,
    });
    items.push({
      href: '/admin/transactions',
      label: de.admin.nav.transactions,
      icon: Receipt,
    });
    items.push({
      href: '/admin/coupons',
      label: de.admin.nav.coupons,
      icon: Tag,
    });
  }
  if (hasPlatformPermission(abilities ?? undefined, PLATFORM_PERMISSIONS.manageAiPrompts)) {
    items.push({ href: '/admin/ai-prompts', label: de.admin.nav.aiPrompts, icon: Bot });
    items.push({
      href: '/admin/website-analyze',
      label: de.admin.nav.websiteAnalyze,
      icon: Globe,
    });
  }
  if (hasPlatformPermission(abilities ?? undefined, PLATFORM_PERMISSIONS.viewUsage)) {
    items.push({ href: '/admin/usage', label: de.admin.nav.usage, icon: BarChart3 });
  }
  if (hasPlatformPermission(abilities ?? undefined, PLATFORM_PERMISSIONS.manageSettings)) {
    items.push({ href: '/admin/settings', label: de.admin.nav.settings, icon: Settings });
  }
  if (
    hasPlatformPermission(abilities ?? undefined, PLATFORM_PERMISSIONS.manageSocialProviders)
  ) {
    items.push({
      href: '/admin/providers',
      label: de.admin.nav.providers,
      icon: Plug,
    });
  }

  return items;
}

export function Sidebar({
  onNavigate,
  collapsed = false,
  onToggleCollapse,
}: {
  onNavigate?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const pathname = usePathname();
  const { abilities, isPlatformAdmin } = useAuth();
  const { mode, setMode, canAccessAdmin } = useAppMode();

  const nav = mode === 'admin' ? buildAdminNav(abilities) : customerNav;

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-outline-soft bg-surface-container-low transition-[width] duration-200',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      <div
        className={cn(
          'flex h-14 items-center gap-2.5 border-b border-outline-soft',
          collapsed ? 'justify-center px-2' : 'px-5',
        )}
      >
        {!collapsed && (
          <>
            <Logo size={32} />
            <span className="font-semibold tracking-tight text-on-surface">
              Klicklocal
            </span>
          </>
        )}
        {onToggleCollapse && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn('text-on-surface-variant', !collapsed && 'ml-auto')}
            onClick={onToggleCollapse}
            title={collapsed ? de.nav.expandSidebar : de.nav.collapseSidebar}
            aria-label={collapsed ? de.nav.expandSidebar : de.nav.collapseSidebar}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {canAccessAdmin && (
        <div className="border-b border-outline-soft p-3">
          {!collapsed && (
            <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wide text-on-surface-variant">
              {de.admin.modeLabel}
            </p>
          )}
          <div
            className={cn(
              'gap-1 rounded-xl bg-fill-soft p-1',
              collapsed ? 'flex flex-col' : 'grid grid-cols-2',
            )}
          >
            <Button
              type="button"
              variant={mode === 'customer' ? 'default' : 'ghost'}
              size="sm"
              className={cn('h-8 text-xs', collapsed && 'w-full px-0')}
              onClick={() => setMode('customer')}
              title={collapsed ? de.admin.modeCustomer : undefined}
              aria-label={collapsed ? de.admin.modeCustomer : undefined}
            >
              {collapsed ? <User className="h-4 w-4" /> : de.admin.modeCustomer}
            </Button>
            <Button
              type="button"
              variant={mode === 'admin' ? 'default' : 'ghost'}
              size="sm"
              className={cn('h-8 text-xs', collapsed && 'w-full px-0')}
              onClick={() => setMode('admin')}
              title={collapsed ? de.admin.modeAdmin : undefined}
              aria-label={collapsed ? de.admin.modeAdmin : undefined}
            >
              {collapsed ? <Shield className="h-4 w-4" /> : de.admin.modeAdmin}
            </Button>
          </div>
          {!collapsed &&
          isPlatformAdmin &&
          mode === 'admin' &&
          abilities?.platform_roles.length ? (
            <p className="mt-2 px-1 text-xs text-on-surface-variant">
              {abilities.platform_roles.join(', ')}
            </p>
          ) : null}
        </div>
      )}

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {nav.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              title={collapsed ? label : undefined}
              aria-label={collapsed ? label : undefined}
              className={cn(
                'flex items-center gap-3 rounded-xl py-2 text-sm font-medium transition-colors',
                collapsed ? 'justify-center px-0' : 'px-3',
                active
                  ? 'bg-primary/15 text-primary'
                  : 'text-on-surface-variant hover:bg-fill-soft hover:text-on-surface',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && label}
            </Link>
          );
        })}
      </nav>

      <div
        className={cn(
          'border-t border-outline-soft px-3 py-3 text-xs text-on-surface-variant',
          collapsed ? 'text-center' : 'px-4',
        )}
      >
        {collapsed ? (
          <span title={de.footer.version(APP_VERSION)}>v{APP_VERSION}</span>
        ) : (
          de.footer.version(APP_VERSION)
        )}
      </div>
    </aside>
  );
}
