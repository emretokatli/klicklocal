import type { NextConfig } from 'next';

const allowedDevOrigins = (
  process.env.ALLOWED_DEV_ORIGINS ??
  'localhost,127.0.0.1,172.20.160.1'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  // Required when opening the app via LAN IP (e.g. http://172.20.x.x:3000)
  allowedDevOrigins,
  // API proxy: src/app/api/v1/[...path]/route.ts (forwards Authorization header)
};

export default nextConfig;
