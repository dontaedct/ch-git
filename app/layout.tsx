import { Suspense } from 'react';
import PageBoot from '@/components/ui/skeletons/PageBoot';
import { getPublicEnv } from '@/lib/env';
import { ThemeProvider } from '@/components/theme-provider';
import { TokensProvider } from '@/lib/design-tokens/provider';
import { AuthProvider } from '@/lib/auth/auth-context';

// Force fully dynamic rendering in staging to avoid build-time prerender failures.
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'default-no-store';

export const metadata = { title: "Micro App Template", description: "A modern micro web application template" };

const isSafeMode = getPublicEnv().NEXT_PUBLIC_SAFE_MODE === '1';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body style={{ 
        minHeight: '100vh', 
        margin: 0, 
        fontFamily: "system-ui, sans-serif",
        background: '#fff',
        color: '#111'
      }}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TokensProvider>
            <AuthProvider>
              {isSafeMode && (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  zIndex: 9998,
                  padding: '6px 10px',
                  fontSize: 12,
                  background: '#d4edda',
                  borderBottom: '1px solid #c3e6cb',
                  color: '#155724'
                }}>
                  🛡️ SAFE MODE • Bypassing auth guards and heavy data fetches
                </div>
              )}
              <div style={{ paddingTop: 0 }}>
                <Suspense fallback={<PageBoot />}>
                  {children}
                </Suspense>
              </div>
            </AuthProvider>
          </TokensProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
