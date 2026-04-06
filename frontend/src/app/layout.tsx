import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

export const metadata: Metadata = {
  title: 'Portfolio',
  description: 'Django + Next.js portfolio showcase',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full bg-white text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-100">
        <Navbar />
        <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
