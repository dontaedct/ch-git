import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getPublicEnv } from '@/lib/env';

export default function DebugSnapshotPage() {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '32px', margin: '0 0 8px 0', color: '#1a1a1a' }}>
          🧪 Debug Snapshot
        </h1>
        <p style={{ fontSize: '16px', color: '#666', margin: 0 }}>
          Stable UI components with zero data dependencies
        </p>
      </div>

      <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <Card>
          <CardHeader>
            <CardTitle>Typography Test</CardTitle>
            <CardDescription>Basic text rendering</CardDescription>
          </CardHeader>
          <CardContent>
            <h3 style={{ margin: '0 0 12px 0' }}>Heading 3</h3>
            <p style={{ margin: '0 0 8px 0' }}>
              This is a paragraph with regular text. It should render without issues.
            </p>
            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
              Smaller text with different styling.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Button Components</CardTitle>
            <CardDescription>Interactive elements</CardDescription>
          </CardHeader>
          <CardContent style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button variant="default">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Badge Display</CardTitle>
            <CardDescription>Status indicators</CardDescription>
          </CardHeader>
          <CardContent style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Environment Info</CardTitle>
            <CardDescription>Current build context</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ fontSize: '14px', fontFamily: 'monospace' }}>
              <div>NODE_ENV: {getPublicEnv().NODE_ENV ?? 'not set'}</div>
              <div>VERCEL_ENV: {getPublicEnv().VERCEL_ENV ?? 'not set'}</div>
              <div>DEBUG: {getPublicEnv().NEXT_PUBLIC_DEBUG ?? 'not set'}</div>
              <div>SAFE_MODE: {getPublicEnv().NEXT_PUBLIC_SAFE_MODE ?? 'not set'}</div>
              <div>Timestamp: {new Date().toISOString()}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Grid Layout</CardTitle>
            <CardDescription>CSS Grid demonstration</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '8px',
              marginBottom: '12px'
            }}>
              {Array.from({ length: 9 }, (_, i) => (
                <div key={i} style={{
                  background: '#f0f0f0',
                  padding: '12px',
                  textAlign: 'center',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                  Box {i + 1}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Check</CardTitle>
            <CardDescription>Component health</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ color: '#28a745', fontSize: '14px' }}>
              ✅ All components rendered successfully
            </div>
            <div style={{ color: '#28a745', fontSize: '14px', marginTop: '8px' }}>
              ✅ No data dependencies
            </div>
            <div style={{ color: '#28a745', fontSize: '14px', marginTop: '8px' }}>
              ✅ Pure UI components
            </div>
          </CardContent>
        </Card>
      </div>

      <div style={{ 
        marginTop: '32px', 
        padding: '16px', 
        background: '#f8f9fa', 
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#666' }}>
          If you can see this page, basic rendering is working. White screen issues are likely caused by:
        </p>
        <ul style={{ 
          margin: '0 0 16px 0', 
          padding: 0, 
          listStyle: 'none',
          fontSize: '14px',
          color: '#666'
        }}>
          <li>• Data fetching errors in other components</li>
          <li>• Auth guard failures</li>
          <li>• Suspense boundaries with null fallbacks</li>
          <li>• Client-side crashes after hydration</li>
        </ul>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
          style={{ marginRight: '8px' }}
        >
          Reload Page
        </Button>
        <Button 
          variant="outline" 
          onClick={() => window.history.back()}
        >
          Go Back
        </Button>
      </div>
    </div>
  );
}
