import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card'
import { Button } from '@ui/button'
import { Badge } from '@ui/badge'
import { Separator } from '@ui/separator'

export default function BulletproofPage() {
  // Guard: Only render when DEBUG mode is enabled
  if (process.env.NEXT_PUBLIC_DEBUG !== '1') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900">Debug Tool Not Available</h1>
          <p className="text-gray-600">This development tool requires NEXT_PUBLIC_DEBUG=&apos;1&apos;</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">🛡️ Bulletproof Testing Suite</h1>
          <p className="text-xl text-gray-600">Comprehensive development and testing utilities</p>
          <Badge variant="secondary" className="text-sm">
            DEBUG MODE: {process.env.NODE_ENV} | {process.env.NEXT_PUBLIC_DEBUG === '1' ? 'ENABLED' : 'DISABLED'}
          </Badge>
        </div>

        {/* System Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>🔧</span>
                <span>Environment</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">NODE_ENV:</span>
                <Badge variant={process.env.NODE_ENV === 'production' ? 'destructive' : 'default'}>
                  {process.env.NODE_ENV || 'undefined'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">DEBUG:</span>
                <Badge variant={process.env.NEXT_PUBLIC_DEBUG === '1' ? 'default' : 'secondary'}>
                  {process.env.NEXT_PUBLIC_DEBUG || 'undefined'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>📊</span>
                <span>Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Memory:</span>
                <span className="text-sm font-mono">--</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">CPU:</span>
                <span className="text-sm font-mono">--</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>🔍</span>
                <span>Diagnostics</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Build:</span>
                <Badge variant="outline">--</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Health:</span>
                <Badge variant="default">OK</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Testing Tools */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Testing Tools</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Component Testing</CardTitle>
                <CardDescription>Test individual UI components</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline">
                  Test Button Variants
                </Button>
                <Button className="w-full" variant="outline">
                  Test Form Components
                </Button>
                <Button className="w-full" variant="outline">
                  Test Layout Components
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Testing</CardTitle>
                <CardDescription>Test backend endpoints</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline">
                  Test Auth Endpoints
                </Button>
                <Button className="w-full" variant="outline">
                  Test Data Endpoints
                </Button>
                <Button className="w-full" variant="outline">
                  Test Health Checks
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator />

        {/* Development Utilities */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Development Utilities</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>State Management</CardTitle>
                <CardDescription>Debug application state</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline">
                  View Redux Store
                </Button>
                <Button className="w-full" variant="outline">
                  View Context State
                </Button>
                <Button className="w-full" variant="outline">
                  View Local Storage
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Network</CardTitle>
                <CardDescription>Monitor network requests</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline">
                  View Request Logs
                </Button>
                <Button className="w-full" variant="outline">
                  Test CORS
                </Button>
                <Button className="w-full" variant="outline">
                  Check API Status
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 pt-8">
          <p>Bulletproof Testing Suite - Development Only</p>
          <p>This tool is not available in production environments</p>
        </div>
      </div>
    </div>
  )
}
