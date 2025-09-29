'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Key, Users, Clock, AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface AdminAccess {
  id: string;
  clientId: string;
  accessLevel: 'full' | 'limited' | 'readonly';
  permissions: string[];
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface SecurityEvent {
  id: string;
  eventType: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  description: string;
  timestamp: Date;
}

export default function AdminAccessManagementPage() {
  const [adminAccesses, setAdminAccesses] = useState<AdminAccess[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Mock data
  useEffect(() => {
    setAdminAccesses([
      {
        id: 'admin_001',
        clientId: 'client_001',
        accessLevel: 'full',
        permissions: ['admin.dashboard.view', 'admin.settings.edit', 'admin.users.manage'],
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: 'admin_002',
        clientId: 'client_002',
        accessLevel: 'limited',
        permissions: ['admin.dashboard.view', 'admin.content.edit'],
        expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        isActive: true,
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10')
      }
    ]);

    setSecurityEvents([
      {
        id: 'event_001',
        eventType: 'admin_access_created',
        severity: 'info',
        description: 'Admin access created for client_001',
        timestamp: new Date('2024-01-15T10:30:00Z')
      },
      {
        id: 'event_002',
        eventType: 'admin_access_used',
        severity: 'info',
        description: 'Admin accessed client dashboard',
        timestamp: new Date('2024-01-16T14:20:00Z')
      }
    ]);
  }, []);

  const handleCreateAccess = async (formData: any) => {
    setIsLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newAccess: AdminAccess = {
        id: `admin_${Date.now()}`,
        clientId: formData.clientId,
        accessLevel: formData.accessLevel,
        permissions: getDefaultPermissions(formData.accessLevel),
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : undefined,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setAdminAccesses(prev => [newAccess, ...prev]);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating admin access:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeAccess = async (accessId: string) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      setAdminAccesses(prev =>
        prev.map(access =>
          access.id === accessId
            ? { ...access, isActive: false, updatedAt: new Date() }
            : access
        )
      );
    } catch (error) {
      console.error('Error revoking access:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshAccess = async (accessId: string) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      setAdminAccesses(prev =>
        prev.map(access =>
          access.id === accessId
            ? {
                ...access,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                updatedAt: new Date()
              }
            : access
        )
      );
    } catch (error) {
      console.error('Error refreshing access:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultPermissions = (accessLevel: string): string[] => {
    const permissions = {
      full: ['admin.dashboard.view', 'admin.settings.edit', 'admin.users.manage', 'admin.content.edit', 'admin.analytics.view'],
      limited: ['admin.dashboard.view', 'admin.content.edit', 'admin.analytics.view'],
      readonly: ['admin.dashboard.view', 'admin.analytics.view']
    };
    return permissions[accessLevel as keyof typeof permissions] || [];
  };

  const getAccessLevelColor = (level: string) => {
    const colors = {
      full: 'bg-red-100 text-red-800',
      limited: 'bg-yellow-100 text-yellow-800',
      readonly: 'bg-green-100 text-green-800'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      info: 'bg-blue-100 text-blue-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      critical: 'bg-purple-100 text-purple-800'
    };
    return colors[severity as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Access Management</h1>
          <p className="text-muted-foreground">
            Manage client admin access, credentials, and security controls
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Key className="w-4 h-4 mr-2" />
          Create Admin Access
        </Button>
      </div>

      <Tabs defaultValue="access-list" className="space-y-6">
        <TabsList>
          <TabsTrigger value="access-list" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Access List
          </TabsTrigger>
          <TabsTrigger value="security-events" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Security Events
          </TabsTrigger>
          <TabsTrigger value="role-management" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Role Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="access-list" className="space-y-6">
          {showCreateForm && (
            <Card>
              <CardHeader>
                <CardTitle>Create Admin Access</CardTitle>
                <CardDescription>
                  Generate secure admin access for client application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CreateAccessForm
                  onSubmit={handleCreateAccess}
                  onCancel={() => setShowCreateForm(false)}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {adminAccesses.map((access) => (
              <Card key={access.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className={getAccessLevelColor(access.accessLevel)}>
                          {access.accessLevel.toUpperCase()}
                        </Badge>
                        <span className="font-medium">{access.clientId}</span>
                        {!access.isActive && (
                          <Badge variant="destructive">Revoked</Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>ID: {access.id}</span>
                        {access.expiresAt && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Expires: {access.expiresAt.toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {access.permissions.map((permission) => (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {access.isActive && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRefreshAccess(access.id)}
                            disabled={isLoading}
                          >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Refresh
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRevokeAccess(access.id)}
                            disabled={isLoading}
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Revoke
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="security-events" className="space-y-4">
          {securityEvents.map((event) => (
            <Card key={event.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className={getSeverityColor(event.severity)}>
                        {event.severity.toUpperCase()}
                      </Badge>
                      <span className="font-medium">{event.eventType}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {event.timestamp.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="role-management" className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Role management interface for defining custom access levels and permissions.
              This feature allows you to create granular access controls for different client admin roles.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>System Roles</CardTitle>
              <CardDescription>
                Predefined roles with specific permission sets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['Super Admin', 'Admin', 'Editor', 'Viewer'].map((role) => (
                  <div key={role} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{role}</h4>
                      <p className="text-sm text-muted-foreground">
                        {role === 'Super Admin' && 'Full system access with all permissions'}
                        {role === 'Admin' && 'Administrative access excluding critical system settings'}
                        {role === 'Editor' && 'Content editing and basic administrative functions'}
                        {role === 'Viewer' && 'Read-only access to dashboard and analytics'}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CreateAccessForm({
  onSubmit,
  onCancel,
  isLoading
}: {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    clientId: '',
    accessLevel: 'limited',
    expiresAt: '',
    generateApiKey: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="clientId">Client ID</Label>
          <Input
            id="clientId"
            value={formData.clientId}
            onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
            placeholder="Enter client ID"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="accessLevel">Access Level</Label>
          <Select
            value={formData.accessLevel}
            onValueChange={(value) => setFormData({ ...formData, accessLevel: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="readonly">Read Only</SelectItem>
              <SelectItem value="limited">Limited</SelectItem>
              <SelectItem value="full">Full Access</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="expiresAt">Expiration Date (Optional)</Label>
          <Input
            id="expiresAt"
            type="date"
            value={formData.expiresAt}
            onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="generateApiKey"
            checked={formData.generateApiKey}
            onCheckedChange={(checked) => setFormData({ ...formData, generateApiKey: checked })}
          />
          <Label htmlFor="generateApiKey">Generate API Key</Label>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Access'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}