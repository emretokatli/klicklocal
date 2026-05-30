const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:1981/klicklocal/backend/public/api/v1';

export function getStorageBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_STORAGE_URL) {
    return process.env.NEXT_PUBLIC_STORAGE_URL.replace(/\/$/, '');
  }
  return API_BASE_URL.replace(/\/api\/v1\/?$/, '') + '/storage';
}

export function resolveMediaUrl(
  filePath: string,
  apiUrl?: string | null,
): string {
  if (apiUrl?.startsWith('http')) return apiUrl;
  return `${getStorageBaseUrl()}/${filePath.replace(/^\//, '')}`;
}
