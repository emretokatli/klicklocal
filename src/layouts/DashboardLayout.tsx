'use client';

import { useState, type ReactNode } from 'react';

import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { cn } from '@/lib/utils';

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="relative flex h-screen overflow-hidden bg-surface">
      <div className="liquid-bg" aria-hidden />
      <div className="relative z-10 hidden lg:flex lg:shrink-0">
        <Sidebar />
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
        <main
          className={cn('flex-1 overflow-y-auto p-4 lg:p-8')}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
