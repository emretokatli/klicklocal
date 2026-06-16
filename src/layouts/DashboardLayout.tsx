'use client';

import { useEffect, useState, type ReactNode } from 'react';

import { AppFooter } from '@/components/layout/AppFooter';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { cn } from '@/lib/utils';

const SIDEBAR_COLLAPSED_KEY = 'klicklocal.sidebarCollapsed';

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Restore the persisted preference after mount to avoid SSR hydration drift.
  useEffect(() => {
    const timer = setTimeout(() => {
      setCollapsed(
        window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1',
      );
    }, 0);
    return () => { clearTimeout(timer); };
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? '1' : '0');
      }
      return next;
    });
  }

  return (
    <div className="relative flex h-screen overflow-hidden bg-surface">
      <div className="liquid-bg" aria-hidden />
      <div className="relative z-10 hidden lg:flex lg:shrink-0">
        <Sidebar collapsed={collapsed} onToggleCollapse={toggleCollapsed} />
      </div>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="Menü schließen"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-50 h-full w-60">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <Header onMenuClick={() => setMobileOpen(true)} />
        <main className={cn('flex flex-1 flex-col overflow-y-auto')}>
          <div className="flex-1 p-4 lg:p-8">{children}</div>
          <AppFooter />
        </main>
      </div>
    </div>
  );
}
