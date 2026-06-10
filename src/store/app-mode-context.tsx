'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';

import type { AppMode } from '@/types/api';
import { useAuth } from '@/store/auth-context';

const MODE_KEY = 'klicklocal_app_mode';

type AppModeContextValue = {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  canAccessAdmin: boolean;
};

const AppModeContext = createContext<AppModeContextValue | null>(null);

function readStoredMode(): AppMode | null {
  if (typeof window === 'undefined') return null;
  const v = sessionStorage.getItem(MODE_KEY);
  return v === 'admin' || v === 'customer' ? v : null;
}

export function AppModeProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isPlatformAdmin } = useAuth();
  const mode = useMemo<AppMode>(() => {
    if (!isPlatformAdmin) return 'customer';
    if (pathname.startsWith('/admin')) return 'admin';
    if (pathname === '/login' || pathname === '/register') return 'customer';
    if (typeof window !== 'undefined' && readStoredMode() === 'admin') return 'admin';
    return 'customer';
  }, [isPlatformAdmin, pathname]);

  useEffect(() => {
    if (typeof window !== 'undefined') sessionStorage.setItem(MODE_KEY, mode);
  }, [mode]);

  const setMode = useCallback(
    (next: AppMode) => {
      if (next === 'admin' && !isPlatformAdmin) return;
      sessionStorage.setItem(MODE_KEY, next);
      router.push(next === 'admin' ? '/admin/dashboard' : '/dashboard');
    },
    [isPlatformAdmin, router],
  );

  const value = useMemo(
    () => ({
      mode,
      setMode,
      canAccessAdmin: isPlatformAdmin,
    }),
    [mode, setMode, isPlatformAdmin],
  );

  return (
    <AppModeContext.Provider value={value}>{children}</AppModeContext.Provider>
  );
}

export function useAppMode() {
  const ctx = useContext(AppModeContext);
  if (!ctx) throw new Error('useAppMode must be used within AppModeProvider');
  return ctx;
}
