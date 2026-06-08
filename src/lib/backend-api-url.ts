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

  // Deployed environments (Vercel / production / staging) must never fall back to
  // localhost. Set BACKEND_API_URL explicitly; this is only a last-resort default
  // that points at the production API.
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    return 'https://api.klicklocal.app/api/v1';
  }

  // Local development only.
  return 'http://localhost:1981/klicklocal/backend/public/api/v1';
}
