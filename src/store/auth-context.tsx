'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

import { hasPlatformPermission, PLATFORM_PERMISSIONS } from '@/lib/permissions';
import { hasToken } from '@/lib/token';
import { authService } from '@/services/auth.service';
import type { AuthSession, User, UserAbilities } from '@/types/api';

type AuthContextValue = {
  user: User | null;
  session: AuthSession | null;
  abilities: UserAbilities | null;
  isPlatformAdmin: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  workspaceScopeId: number | null;
  setWorkspaceScopeId: (id: number | null) => void;
  hasPermission: (permission: string) => boolean;
  login: (email: string, password: string) => Promise<void>;
  registerEmail: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoggingOut: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const subscribeNoop = () => () => {};
const getTrue = () => true;
const getFalse = () => false;

function resolvePostAuthPath(session: AuthSession): string {
  if (session.is_platform_admin) return '/admin/dashboard';
  return '/dashboard';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const tokenReady = useSyncExternalStore(subscribeNoop, getTrue, getFalse);
  const [workspaceScopeId, setWorkspaceScopeId] = useState<number | null>(null);

  const meQuery = useQuery({
    queryKey: ['auth', 'me', workspaceScopeId],
    queryFn: () => authService.me(workspaceScopeId ?? undefined),
    enabled: tokenReady && hasToken(),
    retry: false,
  });

  const session = meQuery.data ?? null;

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.login(email, password),
    onSuccess: async () => {
      await queryClient.resetQueries();
      const me = await authService.me();
      router.replace(resolvePostAuthPath(me));
    },
  });

  const registerEmailMutation = useMutation({
    mutationFn: (email: string) => authService.registerEmail(email),
    onSuccess: async () => {
      await queryClient.resetQueries();
      router.replace('/onboarding');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: async () => {
      queryClient.clear();
      router.replace('/login');
    },
  });

  const login = useCallback(
    async (email: string, password: string) => {
      await loginMutation.mutateAsync({ email, password });
    },
    [loginMutation],
  );

  const registerEmail = useCallback(
    async (email: string) => {
      await registerEmailMutation.mutateAsync(email);
    },
    [registerEmailMutation],
  );

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  const hasPermission = useCallback(
    (permission: string) =>
      hasPlatformPermission(session?.abilities, permission),
    [session?.abilities],
  );

  const value: AuthContextValue = {
    user: session?.user ?? null,
    session,
    abilities: session?.abilities ?? null,
    isPlatformAdmin: session?.is_platform_admin ?? false,
    isLoading: tokenReady && hasToken() && meQuery.isLoading,
    isAuthenticated: hasToken() && !!session,
    workspaceScopeId,
    setWorkspaceScopeId,
    hasPermission,
    login,
    registerEmail,
    logout,
    isLoggingOut: logoutMutation.isPending,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { PLATFORM_PERMISSIONS };
