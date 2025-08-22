import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info, Shield, Eye, Accessibility, Zap, AlertTriangle, CheckCircle, XCircle, AlertTriangle as WarningIcon } from 'lucide-react'
import { readDesignSafetyData, getDesignSafetyStatus, formatTimestamp } from '@/lib/design-safety-reader'

interface DesignReportProps {
  _searchParams?: { [key: string]: string | string[] | undefined }
}

// Component to show when debug mode is disabled
function DebugDisabled() {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Design Safety Report
          </CardTitle>
          <CardDescription>
            Development-only page for viewing design safety metrics and violations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              This page is only available in development mode. Set{' '}
              <code className="bg-muted px-1 py-0.5 rounded text-sm">NEXT_PUBLIC_DEBUG=1</code>{' '}
              in your environment to enable it.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}

// Component to read and display design safety summaries
async function DesignSafetyReader() {
  try {
    const data = await readDesignSafetyData()
    const status = getDesignSafetyStatus(data)
    
    // Helper function to get status badge
    const getStatusBadge = (status: string) => {
      switch (status) {
        case 'PASSED':
          return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="h-3 w-3 mr-1" />Passed</Badge>
        case 'FAILED':
          return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>
        case 'WARNING':
          return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><WarningIcon className="h-3 w-3 mr-1" />Warning</Badge>
        default:
          return <Badge variant="secondary">Unknown</Badge>
      }
    }

    // Helper function to get metric display
    const getMetricDisplay = (value: number | undefined, _label: string) => {
      if (value === undefined) return <Badge variant="secondary">No data</Badge>
      if (value === 0) return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">0</Badge>
      return <Badge variant="destructive">{value}</Badge>
    }
    
    return (
      <div className="space-y-6">
        {/* Overall Status */}
        {status.hasData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Overall Status
              </CardTitle>
              <CardDescription>
                Last updated: {status.lastRun ? formatTimestamp(status.lastRun) : 'Unknown'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold">
                  {getStatusBadge(status.overall)}
                </div>
                {data.combined && (
                  <div className="text-sm text-muted-foreground">
                    Workflow: {data.combined.workflow} | Run ID: {data.combined.runId}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Design Guardian
            </CardTitle>
            <CardDescription>
              ESLint and component contract validation status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">ESLint</span>
                  {getStatusBadge(data.eslint?.status ?? 'UNKNOWN')}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Errors</span>
                  {getMetricDisplay(data.eslint?.metrics?.eslintErrors, 'errors')}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Warnings</span>
                  {getMetricDisplay(data.eslint?.metrics?.eslintWarnings, 'warnings')}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Contracts</span>
                  {getStatusBadge(data.contracts?.status ?? 'UNKNOWN')}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Violations</span>
                  {getMetricDisplay(data.contracts?.metrics?.contractViolations, 'violations')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Visual Watch
            </CardTitle>
            <CardDescription>
              Visual regression testing and design consistency
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                {getStatusBadge(data.visual?.status ?? 'UNKNOWN')}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Visual Diffs</span>
                {getMetricDisplay(data.visual?.metrics?.visualDiffs, 'diffs')}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Accessibility className="h-5 w-5" />
              A11y Ranger
            </CardTitle>
            <CardDescription>
              Accessibility compliance and WCAG validation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                {getStatusBadge(data.a11y?.status ?? 'UNKNOWN')}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Issues</span>
                {getMetricDisplay(data.a11y?.metrics?.a11yIssues, 'issues')}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              UX Budgeteer
            </CardTitle>
            <CardDescription>
              Performance budgets and Lighthouse CI metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                {getStatusBadge(data.lhci?.status ?? 'UNKNOWN')}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Score</span>
                {getMetricDisplay(data.lhci?.metrics?.lhciScore, 'score')}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Recent Violations
            </CardTitle>
            <CardDescription>
              Latest design safety violations and warnings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              const allViolations = [
                ...(data.eslint?.violations ?? []),
                ...(data.contracts?.violations ?? []),
                ...(data.a11y?.violations ?? []),
                ...(data.visual?.violations ?? []),
                ...(data.lhci?.violations ?? [])
              ].filter(v => v.severity === 'critical' || v.severity === 'warning')

              if (allViolations.length === 0) {
                return (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No recent violations to display</p>
                    <p className="text-sm">All design safety checks are passing</p>
                  </div>
                )
              }

              return (
                <div className="space-y-2">
                  {allViolations.slice(0, 5).map((violation, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded">
                      <Badge variant={violation.severity === 'critical' ? 'destructive' : 'secondary'}>
                        {violation.severity}
                      </Badge>
                      <span className="text-sm">{violation.message}</span>
                      {violation.file && (
                        <span className="text-xs text-muted-foreground ml-auto">
                          {violation.file}:{violation.line ?? '?'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )
            })()}
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Error reading design safety data: {error instanceof Error ? error.message : 'Unknown error'}
        </AlertDescription>
      </Alert>
    )
  }
}

// Main page component
export default function DesignReportPage({ _searchParams }: DesignReportProps) {
  // Check if debug mode is enabled
  if (process.env.NEXT_PUBLIC_DEBUG !== '1') {
    return <DebugDisabled />
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Design Safety Report</h1>
        <p className="text-muted-foreground">
          Comprehensive overview of design safety metrics, violations, and compliance status
        </p>
      </div>

      <Suspense fallback={
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p>Loading design safety data...</p>
            </div>
          </CardContent>
        </Card>
      }>
        <DesignSafetyReader />
      </Suspense>
    </div>
  )
}
