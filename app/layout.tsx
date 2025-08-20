import { Suspense } from 'react';
import { PublicNav } from '@components/PublicNav';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = { title: "Coach Hub", description: "Personal training management platform" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <PublicNav />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
