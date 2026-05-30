const TOKEN_KEY = 'klicklocal_token';
const WORKSPACE_KEY = 'klicklocal_workspace_id';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token.trim());
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function hasToken(): boolean {
  return !!getToken();
}

export function getStoredWorkspaceId(): number | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(WORKSPACE_KEY);
  if (!raw) return null;
  const id = Number(raw);
  return Number.isFinite(id) ? id : null;
}

export function setStoredWorkspaceId(id: number): void {
  localStorage.setItem(WORKSPACE_KEY, String(id));
}
