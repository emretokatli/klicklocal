export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden
      className="shrink-0"
    >
      <defs>
        <linearGradient id="logoGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4fe3c8" />
          <stop offset="55%" stopColor="#36e0a6" />
          <stop offset="100%" stopColor="#9b8cf0" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#logoGradient)" />
      <path
        d="M32 12 L36.2 27.8 L52 32 L36.2 36.2 L32 52 L27.8 36.2 L12 32 L27.8 27.8 Z"
        fill="#070b0a"
      />
    </svg>
  );
}
