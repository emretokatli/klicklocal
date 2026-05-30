'use client';

import { useQuery } from '@tanstack/react-query';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import {
  getStoredWorkspaceId,
  setStoredWorkspaceId,
} from '@/lib/token';
import { useAuth } from '@/store/auth-context';
import { workspacesService } from '@/services/workspaces.service';
import type { Workspace } from '@/types/api';

type WorkspaceContextValue = {
  workspaces: Workspace[];
  workspaceId: number | null;
  workspace: Workspace | null;
  setWorkspaceId: (id: number) => void;
  isLoading: boolean;
  refetch: () => void;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { setWorkspaceScopeId } = useAuth();
  const [workspaceId, setWorkspaceIdState] = useState<number | null>(null);

  const query = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => workspacesService.list(),
  });

  useEffect(() => {
    if (!query.data?.length) return;

    const stored = getStoredWorkspaceId();
    const valid = stored && query.data.some((w) => w.id === stored);

    if (valid) {
      setWorkspaceIdState(stored);
    } else {
      const first = query.data[0].id;
      setWorkspaceIdState(first);
      setStoredWorkspaceId(first);
    }
  }, [query.data]);

  useEffect(() => {
    setWorkspaceScopeId(workspaceId);
  }, [workspaceId, setWorkspaceScopeId]);

  const setWorkspaceId = useCallback((id: number) => {
    setWorkspaceIdState(id);
    setStoredWorkspaceId(id);
  }, []);

  const workspace =
    query.data?.find((w) => w.id === workspaceId) ?? null;

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces: query.data ?? [],
        workspaceId,
        workspace,
        setWorkspaceId,
        isLoading: query.isLoading,
        refetch: () => void query.refetch(),
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error('useWorkspace must be used within WorkspaceProvider');
  }
  return ctx;
}
