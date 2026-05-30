'use client';

import { LogOut, Menu } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { de } from '@/lib/i18n/de';
import { workspaceRoleLabel } from '@/lib/permissions';
import { useAppMode } from '@/store/app-mode-context';
import { useAuth } from '@/store/auth-context';
import { useWorkspace } from '@/store/workspace-context';

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, logout, isLoggingOut, abilities } = useAuth();
  const { mode } = useAppMode();
  const { workspaces, workspaceId, setWorkspaceId, isLoading } = useWorkspace();

  const showWorkspacePicker = mode === 'customer';
  const workspaceRole = abilities?.workspace_role;

  return (
    <header className="relative z-10 flex h-14 items-center justify-between gap-4 border-b border-white/10 bg-surface-container/80 px-4 backdrop-blur-md lg:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
          aria-label={de.header.openMenu}
        >
          <Menu className="h-5 w-5" />
        </Button>
        {showWorkspacePicker ? (
          <Select
            value={workspaceId ? String(workspaceId) : undefined}
            onValueChange={(v) => setWorkspaceId(Number(v))}
            disabled={isLoading || workspaces.length === 0}
          >
            <SelectTrigger className="w-[200px] border-white/10 sm:w-[240px]">
              <SelectValue placeholder={de.header.selectWorkspace} />
            </SelectTrigger>
            <SelectContent>
              {workspaces.map((ws) => (
                <SelectItem key={ws.id} value={String(ws.id)}>
                  {ws.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <span className="text-sm font-medium text-on-surface">
            {de.admin.headerTitle}
          </span>
        )}
        {showWorkspacePicker && workspaceRole && (
          <span className="hidden rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-primary md:inline">
            {workspaceRoleLabel(workspaceRole)}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        {user && (
          <span className="hidden text-sm text-on-surface-variant sm:inline">
            {user.name}
          </span>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => logout()}
          disabled={isLoggingOut}
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">{de.header.signOut}</span>
        </Button>
      </div>
    </header>
  );
}
