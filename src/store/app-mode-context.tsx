'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
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
  const [mode, setModeState] = useState<AppMode>('customer');

  useEffect(() => {
    if (pathname.startsWith('/admin')) {
      setModeState('admin');
      sessionStorage.setItem(MODE_KEY, 'admin');
      return;
    }
    if (!pathname.startsWith('/admin') && pathname !== '/login' && pathname !== '/register') {
      const stored = readStoredMode();
      if (stored === 'admin' && isPlatformAdmin) {
        return;
      }
      setModeState('customer');
      sessionStorage.setItem(MODE_KEY, 'customer');
    }
  }, [pathname, isPlatformAdmin]);

  useEffect(() => {
    if (!isPlatformAdmin && mode === 'admin') {
      setModeState('customer');
      sessionStorage.setItem(MODE_KEY, 'customer');
    }
  }, [isPlatformAdmin, mode]);

  const setMode = useCallback(
    (next: AppMode) => {
      if (next === 'admin' && !isPlatformAdmin) return;
      setModeState(next);
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
