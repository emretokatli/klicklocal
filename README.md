# Klicklocal Dashboard

Next.js web client for the Scheduler SaaS API.

## Setup

```bash
cd frontend
cp .env.local.example .env.local
npm run dev
```

If you see **404 on every page** or hydration errors, a stale dev server is usually running:

```powershell
# Stop all Node processes (or close old terminal tabs running npm run dev)
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

cd frontend
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run dev
```

Open the URL printed in the terminal (usually `http://localhost:3000`).

Open [http://localhost:3000](http://localhost:3000).

The dev server proxies `/api/v1/*` to your Laravel backend on port **1981**, so the dashboard avoids browser CORS issues.

**Restart `npm run dev` after changing `next.config.ts` or `.env.local`.**

### Using a LAN IP (e.g. `http://172.20.160.1:3000`)

Next.js blocks dev WebSocket/HMR from unknown hosts. Add your machine's IP to `.env.local`:

```env
ALLOWED_DEV_ORIGINS=localhost,127.0.0.1,172.20.160.1
```

Then restart `npm run dev`. On the same PC, `http://localhost:3000` also works and avoids this.

Sign-in uses `/api/v1` proxied to XAMPP on port **1981** — keep Apache/MySQL running.

## Deploy to Vercel (UAT API)

Repo: [github.com/emretokatli/klicklocal](https://github.com/emretokatli/klicklocal)

Set in Vercel **Environment Variables** (Production):

```env
NEXT_PUBLIC_API_URL=/api/v1
BACKEND_API_URL=https://gastrocycle.com/public/api/v1
NEXT_PUBLIC_STORAGE_URL=https://gastrocycle.com/public/storage
```

Or direct API: `NEXT_PUBLIC_API_URL=https://gastrocycle.com/public/api/v1` (requires CORS on backend).

Full guide: [docs/VERCEL-DEPLOY.md](../docs/VERCEL-DEPLOY.md)

## Pages

- `/` — landing
- `/login` — register / sign in
- `/dashboard` — workspaces (requires auth)
