import type { Metadata } from 'next';
import { Sora } from 'next/font/google';

import { AppProviders } from '@/providers/app-providers';
import './globals.css';

const sora = Sora({
  variable: '--font-sora',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Klicklocal | KI-Copilot für Social Media',
  description:
    'Klicklocal ist dein KI-Copilot für Content, Planung und Antworten über Instagram, TikTok und Facebook – für kleine und mittlere Unternehmen.',
};

/* Applies the saved theme (or OS preference on first visit) before first
   paint to avoid a flash of the wrong theme. Dark remains the default. */
const themeInitScript = `(function(){try{var t=localStorage.getItem('klicklocal_theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}var c=document.documentElement.classList;c.remove('dark','light');c.add(t)}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="de"
      className={`dark ${sora.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full bg-surface font-sans text-on-surface antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
