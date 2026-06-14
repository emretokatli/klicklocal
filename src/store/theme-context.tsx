'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

const THEME_KEY = 'klicklocal_theme';

export type Theme = 'dark' | 'light';

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

/* The <html> class is the source of truth: the inline script in layout.tsx
   applies the saved/OS theme there before first paint. */
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): Theme {
  return document.documentElement.classList.contains('light')
    ? 'light'
    : 'dark';
}

function getServerSnapshot(): Theme {
  return 'dark';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setTheme = useCallback((next: Theme) => {
    const root = document.documentElement;
    root.classList.add('theme-transition');
    root.classList.remove('dark', 'light');
    root.classList.add(next);
    window.setTimeout(() => root.classList.remove('theme-transition'), 250);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // storage unavailable (private mode) — theme still applies for the session
    }
    listeners.forEach((listener) => listener());
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(getSnapshot() === 'dark' ? 'light' : 'dark');
  }, [setTheme]);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
