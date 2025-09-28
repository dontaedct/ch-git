import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Terminal, 
  Play, 
  Settings, 
  Code, 
  Zap, 
  Shield, 
  Database, 
  Wrench,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info,
  FileText,
  Cog,
  Activity,
  BarChart3,
  Clock,
  Cpu,
  HardDrive,
  Network,
  Rocket,
  Target
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Development Scripts & Automation - Agency Toolkit',
  description: 'Comprehensive development scripts with automated workflows, intelligent tooling, and productivity enhancements.',
};

export default function DevelopmentScriptsPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Wrench className="h-8 w-8 text-purple-600" />
          <div>
            <h1 className="text-3xl font-bold">Development Scripts & Automation</h1>
            <p className="text-muted-foreground">
              Comprehensive development scripts with automated workflows and intelligent tooling
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary">Version 1.0.0</Badge>
          <Badge variant="outline">Production Ready</Badge>
          <Badge variant="outline">Intelligent Automation</Badge>
        </div>
      </div>

      <Tabs defaultValue="scripts" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="scripts">Script Manager</TabsTrigger>
          <TabsTrigger value="workflows">Workflow Builder</TabsTrigger>
          <TabsTrigger value="monitoring">System Monitor</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Script Manager Tab */}
        <TabsContent value="scripts" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Essential Development Scripts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  Essential Development
                </CardTitle>
                <CardDescription>
                  Core development scripts for daily workflow
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">Development Server</div>
                      <div className="text-sm text-muted-foreground">Start dev server with full tooling</div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Play className="h-4 w-4 mr-2" />
                      Run
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">Production Build</div>
                      <div className="text-sm text-muted-foreground">Build optimized production bundle</div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Play className="h-4 w-4 mr-2" />
                      Run
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">Type Check</div>
                      <div className="text-sm text-muted-foreground">Run TypeScript type checking</div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Play className="h-4 w-4 mr-2" />
                      Run
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">Lint & Fix</div>
                      <div className="text-sm text-muted-foreground">Run linting with auto-fix</div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Play className="h-4 w-4 mr-2" />
                      Run
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quality Assurance Scripts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Quality Assurance
                </CardTitle>
                <CardDescription>
                  Testing, security, and quality validation scripts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">Test Suite</div>
                      <div className="text-sm text-muted-foreground">Run comprehensive test suite</div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Play className="h-4 w-4 mr-2" />
                      Run
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">Security Audit</div>
                      <div className="text-sm text-muted-foreground">Security vulnerability scan</div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Play className="h-4 w-4 mr-2" />
                      Run
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">Performance Audit</div>
                      <div className="text-sm text-muted-foreground">Performance and optimization analysis</div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Play className="h-4 w-4 mr-2" />
                      Run
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">Accessibility Check</div>
                      <div className="text-sm text-muted-foreground">WCAG compliance validation</div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Play className="h-4 w-4 mr-2" />
                      Run
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Maintenance & Utilities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Maintenance & Utilities
                </CardTitle>
                <CardDescription>
                  System maintenance and utility scripts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">System Doctor</div>
                      <div className="text-sm text-muted-foreground">Diagnose and fix system issues</div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Play className="h-4 w-4 mr-2" />
                      Run
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">Clean Build</div>
                      <div className="text-sm text-muted-foreground">Clean cache and rebuild</div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Play className="h-4 w-4 mr-2" />
                      Run
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">Database Migration</div>
                      <div className="text-sm text-muted-foreground">Run database migrations</div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Play className="h-4 w-4 mr-2" />
                      Run
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">Bundle Analysis</div>
                      <div className="text-sm text-muted-foreground">Analyze bundle size and dependencies</div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Play className="h-4 w-4 mr-2" />
                      Run
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Custom Script Builder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Custom Script Builder
                </CardTitle>
                <CardDescription>
                  Create and manage custom development scripts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="script-name">Script Name</Label>
                    <Input id="script-name" placeholder="my-custom-script" />
                  </div>
                  <div>
                    <Label htmlFor="script-description">Description</Label>
                    <Input id="script-description" placeholder="Brief description of the script" />
                  </div>
                  <div>
                    <Label htmlFor="script-command">Command</Label>
                    <Textarea 
                      id="script-command" 
                      placeholder="Enter the script command or code"
                      className="min-h-[100px]"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Save Script
                    </Button>
                    <Button size="sm" variant="outline">
                      <Play className="h-4 w-4 mr-2" />
                      Test Run
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Script Execution History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Script Executions
              </CardTitle>
              <CardDescription>
                History of recently executed scripts with status and duration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <div className="font-medium">npm run dev</div>
                      <div className="text-sm text-muted-foreground">2 minutes ago • 45s duration</div>
                    </div>
                  </div>
                  <Badge variant="secondary">Success</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <div className="font-medium">npm run build</div>
                      <div className="text-sm text-muted-foreground">5 minutes ago • 2m 15s duration</div>
                    </div>
                  </div>
                  <Badge variant="secondary">Success</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <div>
                      <div className="font-medium">npm run test</div>
                      <div className="text-sm text-muted-foreground">10 minutes ago • 30s duration</div>
                    </div>
                  </div>
                  <Badge variant="destructive">Failed</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workflow Builder Tab */}
        <TabsContent value="workflows" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Workflow Templates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Workflow Templates
                </CardTitle>
                <CardDescription>
                  Pre-built automation workflows for common tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">CI/CD Pipeline</div>
                      <div className="text-sm text-muted-foreground">Complete CI/CD workflow</div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Play className="h-4 w-4 mr-2" />
                      Deploy
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">Code Quality Gate</div>
                      <div className="text-sm text-muted-foreground">Lint, test, and security checks</div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Play className="h-4 w-4 mr-2" />
                      Deploy
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">Release Preparation</div>
                      <div className="text-sm text-muted-foreground">Version bump, changelog, and tagging</div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Play className="h-4 w-4 mr-2" />
                      Deploy
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Custom Workflow Builder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Custom Workflow Builder
                </CardTitle>
                <CardDescription>
                  Build custom automation workflows
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="workflow-name">Workflow Name</Label>
                    <Input id="workflow-name" placeholder="my-custom-workflow" />
                  </div>
                  <div>
                    <Label htmlFor="workflow-trigger">Trigger Event</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select trigger" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="git-push">Git Push</SelectItem>
                        <SelectItem value="schedule">Scheduled</SelectItem>
                        <SelectItem value="webhook">Webhook</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="workflow-steps">Workflow Steps</Label>
                    <Textarea 
                      id="workflow-steps" 
                      placeholder="Define workflow steps (YAML format)"
                      className="min-h-[120px]"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Save Workflow
                    </Button>
                    <Button size="sm" variant="outline">
                      <Play className="h-4 w-4 mr-2" />
                      Test Run
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Workflows */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Active Workflows
                </CardTitle>
                <CardDescription>
                  Currently running and scheduled workflows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                      <div>
                        <div className="font-medium">CI/CD Pipeline</div>
                        <div className="text-sm text-muted-foreground">Running • Step 3/5: Testing</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary">Running</Badge>
                      <Button size="sm" variant="outline">Stop</Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                      <div>
                        <div className="font-medium">Nightly Backup</div>
                        <div className="text-sm text-muted-foreground">Scheduled • Next run: 2:00 AM</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">Scheduled</Badge>
                      <Button size="sm" variant="outline">Edit</Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                      <div>
                        <div className="font-medium">Performance Monitor</div>
                        <div className="text-sm text-muted-foreground">Paused • Last run: 1 hour ago</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary">Paused</Badge>
                      <Button size="sm" variant="outline">Resume</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* System Monitor Tab */}
        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">CPU Usage</span>
                    <span className="text-sm font-medium">45%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{width: '45%'}}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Memory Usage</span>
                    <span className="text-sm font-medium">62%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '62%'}}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Disk Usage</span>
                    <span className="text-sm font-medium">78%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{width: '78%'}}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Network Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  Network Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">API Response Time</span>
                    <span className="text-sm font-medium">125ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Database Latency</span>
                    <span className="text-sm font-medium">45ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">CDN Performance</span>
                    <Badge variant="secondary">Optimal</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Uptime</span>
                    <span className="text-sm font-medium">99.9%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Process Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Active Processes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Dev Server</span>
                    <Badge variant="secondary">Running</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Database</span>
                    <Badge variant="secondary">Connected</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Background Jobs</span>
                    <Badge variant="outline">3 Active</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Cache Server</span>
                    <Badge variant="secondary">Healthy</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Real-time Logs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Real-time System Logs
              </CardTitle>
              <CardDescription>
                Live system logs and error monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-64 overflow-y-auto">
                <div>[2025-09-19 23:25:01] INFO: Development server started on port 3000</div>
                <div>[2025-09-19 23:25:02] INFO: Database connection established</div>
                <div>[2025-09-19 23:25:03] INFO: Webpack compilation completed successfully</div>
                <div>[2025-09-19 23:25:05] WARN: Large bundle detected in chunk main.js (2.1MB)</div>
                <div>[2025-09-19 23:25:07] INFO: API endpoint /api/scripts registered</div>
                <div>[2025-09-19 23:25:10] INFO: Background job scheduler started</div>
                <div>[2025-09-19 23:25:12] DEBUG: Cache warming completed</div>
                <div>[2025-09-19 23:25:15] INFO: System health check passed</div>
                <div className="animate-pulse">[2025-09-19 23:25:18] INFO: Monitoring active scripts...</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Script Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Script Performance
                </CardTitle>
                <CardDescription>
                  Execution time and success rates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">npm run build</span>
                    <div className="text-right">
                      <div className="text-sm font-medium">2m 15s avg</div>
                      <div className="text-xs text-muted-foreground">98% success</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">npm run test</span>
                    <div className="text-right">
                      <div className="text-sm font-medium">45s avg</div>
                      <div className="text-xs text-muted-foreground">95% success</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">npm run lint</span>
                    <div className="text-right">
                      <div className="text-sm font-medium">12s avg</div>
                      <div className="text-xs text-muted-foreground">99% success</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Productivity Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Productivity Metrics
                </CardTitle>
                <CardDescription>
                  Development productivity insights
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Scripts Run Today</span>
                    <span className="text-sm font-medium">47</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Time Saved</span>
                    <span className="text-sm font-medium">2h 15m</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Automation Rate</span>
                    <span className="text-sm font-medium">85%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Error Rate</span>
                    <span className="text-sm font-medium">2.1%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Usage Trends */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Usage Trends
                </CardTitle>
                <CardDescription>
                  Script usage patterns over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between gap-2 p-4 bg-muted/50 rounded-lg">
                  <div className="bg-blue-500 rounded-t" style={{height: '60%', width: '12%'}}></div>
                  <div className="bg-blue-500 rounded-t" style={{height: '80%', width: '12%'}}></div>
                  <div className="bg-blue-500 rounded-t" style={{height: '45%', width: '12%'}}></div>
                  <div className="bg-blue-500 rounded-t" style={{height: '90%', width: '12%'}}></div>
                  <div className="bg-blue-500 rounded-t" style={{height: '70%', width: '12%'}}></div>
                  <div className="bg-blue-500 rounded-t" style={{height: '55%', width: '12%'}}></div>
                  <div className="bg-blue-500 rounded-t" style={{height: '85%', width: '12%'}}></div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
