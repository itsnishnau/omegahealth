import './floating-polish.css';
import './globals.css';
import { Bad_Script } from 'next/font/google';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

const badScript = Bad_Script({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-bad-script',
});

export const metadata: Metadata = {
  title: 'Omega Health',
  description: 'A teen-friendly cycle tracking and wellness app.',
  manifest: '/manifest.webmanifest',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={badScript.variable}>
      <body>{children}</body>
    </html>
  );
}
