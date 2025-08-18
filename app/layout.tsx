// Force fully dynamic rendering in staging to avoid build-time prerender failures.
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'default-no-store';

export const metadata = { title: "Coach Hub (dev)", description: "Dev shell" };

const isPreview = process.env.VERCEL_ENV === 'preview';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ 
        minHeight: '100vh', 
        margin: 0, 
        fontFamily: "system-ui, sans-serif",
        background: '#fff',
        color: '#111'
      }}>
        {isPreview && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            padding: '6px 10px',
            fontSize: 12,
            background: '#fffae6',
            borderBottom: '1px solid #f5d36a'
          }}>
            Preview build • {new Date().toISOString()}
          </div>
        )}
        <div style={{ paddingTop: isPreview ? 28 : 0 }}>
          {children}
        </div>
      </body>
    </html>
  );
}
