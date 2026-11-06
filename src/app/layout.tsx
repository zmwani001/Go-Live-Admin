import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '../index.css';
import { PortalStateProvider } from './portal-state';

const description =
  'Go Live Admin - Internal admin portal for Go Live AI builder users, generations, and AI cost analytics.';

export const metadata: Metadata = {
  title: 'Go Live Admin',
  description,
  openGraph: {
    title: 'Go Live Admin',
    description,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="text-[#0F172A] antialiased selection:bg-teal-100 selection:text-teal-900">
        <PortalStateProvider>{children}</PortalStateProvider>
      </body>
    </html>
  );
}
