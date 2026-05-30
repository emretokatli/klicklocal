/** Server-side Laravel API base (Vercel proxy + local dev). No trailing slash. */
export function getBackendApiUrl(): string {
  const explicit = process.env.BACKEND_API_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, '');
  }

  const publicUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (publicUrl?.startsWith('http')) {
    return publicUrl.replace(/\/$/, '');
  }

  // Vercel: NEXT_PUBLIC_API_URL=/api/v1 → proxy must not use localhost
  if (process.env.VERCEL) {
    return 'https://gastrocycle.com/public/api/v1';
  }

  return 'http://localhost:1981/klicklocal/backend/public/api/v1';
}
