'use client';

import { Button } from '@ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card';
import { Badge } from '@ui/badge';
import { Separator } from '@ui/separator';
import { Progress } from '@ui/progress';
import { Switch } from '@ui/switch';
import { Label } from '@ui/label';
import { Input } from '@ui/input';
import { Textarea } from '@ui/textarea';
import { Checkbox } from '@ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ui/tabs';
import { Alert, AlertDescription } from '@ui/alert';
import { AlertTriangle, CheckCircle, Info, Zap } from 'lucide-react';

export default function DebugSnapshotPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          🧪 Debug Snapshot
        </h1>
        <p className="text-lg text-gray-600">
          Stable UI components for debugging - zero data dependencies
        </p>
        <Badge variant="outline" className="mt-2">
          {new Date().toLocaleString()}
        </Badge>
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Page Loaded
            </CardTitle>
            <CardDescription>Component rendering successfully</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={100} className="mb-2" />
            <p className="text-sm text-gray-600">All systems operational</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              UI Components
            </CardTitle>
            <CardDescription>Primitive components working</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch id="test-switch" defaultChecked />
                <Label htmlFor="test-switch">Test Switch</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="test-checkbox" defaultChecked />
                <Label htmlFor="test-checkbox">Test Checkbox</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-purple-600" />
              Environment
            </CardTitle>
            <CardDescription>Current app state</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              <div>Time: {new Date().toLocaleTimeString()}</div>
              <div>Date: {new Date().toLocaleDateString()}</div>
              <div>Client: {typeof window !== 'undefined' ? 'Browser' : 'Server'}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />

      {/* Interactive Components */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Form Elements</CardTitle>
            <CardDescription>Test form components</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="test-input">Test Input</Label>
              <Input id="test-input" placeholder="Type something..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="test-textarea">Test Textarea</Label>
              <Textarea id="test-textarea" placeholder="Multi-line text..." />
            </div>
            <div className="space-y-2">
              <Label>Test Radio Group</Label>
              <RadioGroup defaultValue="option-1">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="option-1" id="option-1" />
                  <Label htmlFor="option-1">Option 1</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="option-2" id="option-2" />
                  <Label htmlFor="option-2">Option 2</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Button Variants</CardTitle>
            <CardDescription>All button styles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Demo */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Tabs Component</CardTitle>
          <CardDescription>Tab switching functionality</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tab1" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tab1">Tab 1</TabsTrigger>
              <TabsTrigger value="tab2">Tab 2</TabsTrigger>
              <TabsTrigger value="tab3">Tab 3</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1" className="mt-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  This is the first tab content. All components are rendering correctly.
                </AlertDescription>
              </Alert>
            </TabsContent>
            <TabsContent value="tab2" className="mt-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Second tab is working. UI primitives are stable.
                </AlertDescription>
              </Alert>
            </TabsContent>
            <TabsContent value="tab3" className="mt-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Third tab content. No data dependencies detected.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Footer Status */}
      <div className="text-center">
        <Separator className="mb-4" />
        <p className="text-sm text-gray-500">
          Debug snapshot generated at {new Date().toISOString()}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          If this page shows while others go white, problem is elsewhere (guards/suspense)
        </p>
      </div>
    </div>
  );
}
