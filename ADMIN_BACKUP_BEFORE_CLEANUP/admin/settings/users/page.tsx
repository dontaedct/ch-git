/**
 * @fileoverview User Management Settings Interface - HT-032.1.3
 * @module app/admin/settings/users/page
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * User management settings interface for configuring user invitations,
 * permissions, authentication, and security policies. Part of the
 * foundation settings system.
 */

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { 
  Users,
  UserPlus,
  Shield,
  Lock,
  Key,
  Clock,
  AlertTriangle,
  Save,
  RefreshCw,
  ArrowLeft,
  Check,
  Info,
  HelpCircle,
  Eye,
  EyeOff,
  Ban,
  UserCheck,
  UserX,
  Mail,
  Smartphone,
  Download,
  Upload,
  Settings,
  Zap,
  Timer,
  Activity
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { 
  getFoundationSettingsManager,
  UserManagementSettings,
  type SettingsValidationResult 
} from '@/lib/admin/foundation-settings';

interface PermissionOption {
  id: string;
  name: string;
  description: string;
  category: 'content' | 'users' | 'system' | 'analytics';
}

const PERMISSION_OPTIONS: PermissionOption[] = [
  // Content permissions
  { id: 'read', name: 'Read Content', description: 'View content and data', category: 'content' },
  { id: 'create', name: 'Create Content', description: 'Create new content', category: 'content' },
  { id: 'edit', name: 'Edit Content', description: 'Modify existing content', category: 'content' },
  { id: 'delete', name: 'Delete Content', description: 'Remove content', category: 'content' },
  { id: 'publish', name: 'Publish Content', description: 'Publish and unpublish content', category: 'content' },
  
  // User permissions
  { id: 'view_users', name: 'View Users', description: 'View user profiles and information', category: 'users' },
  { id: 'invite_users', name: 'Invite Users', description: 'Send user invitations', category: 'users' },
  { id: 'manage_users', name: 'Manage Users', description: 'Edit user profiles and roles', category: 'users' },
  { id: 'delete_users', name: 'Delete Users', description: 'Remove user accounts', category: 'users' },
  
  // System permissions
  { id: 'view_settings', name: 'View Settings', description: 'Access system settings', category: 'system' },
  { id: 'manage_settings', name: 'Manage Settings', description: 'Modify system configuration', category: 'system' },
  { id: 'view_logs', name: 'View Logs', description: 'Access system logs and audit trails', category: 'system' },
  { id: 'manage_backups', name: 'Manage Backups', description: 'Create and restore backups', category: 'system' },
  
  // Analytics permissions
  { id: 'view_analytics', name: 'View Analytics', description: 'Access analytics and reports', category: 'analytics' },
  { id: 'export_data', name: 'Export Data', description: 'Export data and reports', category: 'analytics' }
];

const PERMISSION_CATEGORIES = [
  { id: 'content', name: 'Content Management', icon: '📝', color: 'blue' },
  { id: 'users', name: 'User Management', icon: '👥', color: 'green' },
  { id: 'system', name: 'System Administration', icon: '⚙️', color: 'purple' },
  { id: 'analytics', name: 'Analytics & Reports', icon: '📊', color: 'orange' }
];

export default function UserManagementSettingsPage() {
  const router = useRouter();
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const settingsManager = getFoundationSettingsManager();
  
  const [settings, setSettings] = useState<UserManagementSettings>(
    settingsManager.getSection('userManagement')
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [validationResult, setValidationResult] = useState<SettingsValidationResult | null>(null);
  const [activeTab, setActiveTab] = useState('invitations');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const unsubscribe = settingsManager.subscribe((event) => {
      if (event.section === 'userManagement') {
        setSettings(settingsManager.getSection('userManagement'));
        setUnsavedChanges(false);
      }
    });

    return unsubscribe;
  }, [settingsManager]);

  const updateSetting = <K extends keyof UserManagementSettings>(
    key: K,
    value: UserManagementSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    setUnsavedChanges(true);

    // Clear previous messages
    setError(null);
    setSuccess(null);
  };

  const updatePermission = (permissionId: string, enabled: boolean) => {
    const currentPermissions = [...settings.defaultUserPermissions];
    if (enabled) {
      if (!currentPermissions.includes(permissionId)) {
        currentPermissions.push(permissionId);
      }
    } else {
      const index = currentPermissions.indexOf(permissionId);
      if (index > -1) {
        currentPermissions.splice(index, 1);
      }
    }
    updateSetting('defaultUserPermissions', currentPermissions);
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const validation = await settingsManager.updateSection('userManagement', settings);
      setValidationResult(validation);
      
      if (validation.isValid) {
        setSuccess('User management settings saved successfully!');
        setUnsavedChanges(false);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('Please fix validation errors before saving');
      }
      
    } catch (error) {
      setError('Failed to save user management settings');
      console.error('Save settings error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetToDefaults = async () => {
    if (confirm('Are you sure you want to reset all user management settings to defaults?')) {
      try {
        setLoading(true);
        
        await settingsManager.updateSection('userManagement', {
          enableUserInvitations: true,
          requireInvitationApproval: false,
          defaultUserPermissions: ['read'],
          enableUserProfiles: true,
          allowUserDeletion: false,
          userSessionTimeout: 60,
          maxLoginAttempts: 5,
          lockoutDuration: 15,
          passwordResetExpiry: 60,
          enableTwoFactorAuth: false,
          requireTwoFactorAuth: false
        });
        
        setSuccess('User management settings reset to defaults');
        setTimeout(() => setSuccess(null), 3000);
        
      } catch (error) {
        setError('Failed to reset settings');
      } finally {
        setLoading(false);
      }
    }
  };

  const exportUserSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'user-management-settings.json';
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const importUserSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string);
          const validation = await settingsManager.updateSection('userManagement', importedSettings);
          
          if (validation.isValid) {
            setSuccess('User management settings imported successfully');
            setTimeout(() => setSuccess(null), 3000);
          } else {
            setError('Invalid user management settings file');
          }
        } catch (error) {
          setError('Failed to import settings - invalid file format');
        }
      };
      reader.readAsText(file);
    }
  };

  if (!mounted) return null;

  const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <AdminLayout
      title="User Management Settings"
      description="Configure user invitations, permissions, authentication, and security policies"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header Actions */}
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => router.push('/admin/settings')}
                className="transition-all duration-300 hover:scale-105"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Settings
              </Button>
              
              {unsavedChanges && (
                <Badge variant="outline" className="text-sm">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Unsaved Changes
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={exportUserSettings}
                disabled={loading}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              
              <label className="cursor-pointer">
                <Button variant="outline" disabled={loading} asChild>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    Import
                  </span>
                </Button>
                <input
                  type="file"
                  accept=".json"
                  onChange={importUserSettings}
                  className="hidden"
                />
              </label>
              
              <Button
                variant="outline"
                onClick={resetToDefaults}
                disabled={loading}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset to Defaults
              </Button>
              
              <Button
                onClick={saveSettings}
                disabled={loading || !unsavedChanges}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          </motion.div>

          {/* Status Messages */}
          {error && (
            <motion.div variants={itemVariants}>
              <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <span className="text-red-700 dark:text-red-300">{error}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setError(null)}
                      className="ml-auto"
                    >
                      ×
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {success && (
            <motion.div variants={itemVariants}>
              <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-green-700 dark:text-green-300">{success}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Validation Warnings */}
          {validationResult?.warnings && Object.keys(validationResult.warnings).length > 0 && (
            <motion.div variants={itemVariants}>
              <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Warnings</h4>
                      {Object.entries(validationResult.warnings).map(([section, warnings]) => (
                        <div key={section}>
                          <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300 capitalize">{section}:</p>
                          <ul className="list-disc list-inside text-sm text-yellow-600 dark:text-yellow-400 ml-4">
                            {warnings.map((warning, index) => (
                              <li key={index}>{warning}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Main Content */}
          <motion.div variants={itemVariants}>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="invitations" className="flex items-center space-x-2">
                  <UserPlus className="w-4 h-4" />
                  <span>Invitations</span>
                </TabsTrigger>
                <TabsTrigger value="permissions" className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Permissions</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center space-x-2">
                  <Lock className="w-4 h-4" />
                  <span>Security</span>
                </TabsTrigger>
                <TabsTrigger value="profiles" className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>User Profiles</span>
                </TabsTrigger>
              </TabsList>

              {/* Invitations Tab */}
              <TabsContent value="invitations" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <UserPlus className="w-5 h-5 mr-2" />
                      User Invitation Settings
                    </CardTitle>
                    <CardDescription>
                      Configure how users can be invited to join your platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <UserPlus className="w-5 h-5" />
                        <div>
                          <Label htmlFor="enableUserInvitations">Enable User Invitations</Label>
                          <p className="text-sm text-gray-500">
                            Allow administrators to invite new users
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="enableUserInvitations"
                        checked={settings.enableUserInvitations}
                        onCheckedChange={(checked) => updateSetting('enableUserInvitations', checked)}
                      />
                    </div>

                    {settings.enableUserInvitations && (
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <UserCheck className="w-5 h-5" />
                          <div>
                            <Label htmlFor="requireInvitationApproval">Require Invitation Approval</Label>
                            <p className="text-sm text-gray-500">
                              Invitations must be approved by a super admin before being sent
                            </p>
                          </div>
                        </div>
                        <Switch
                          id="requireInvitationApproval"
                          checked={settings.requireInvitationApproval}
                          onCheckedChange={(checked) => updateSetting('requireInvitationApproval', checked)}
                        />
                      </div>
                    )}

                    {/* Invitation Flow Preview */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Invitation Flow</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        {settings.enableUserInvitations ? (
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                              <span className="text-sm">Administrator creates invitation</span>
                            </div>
                            {settings.requireInvitationApproval && (
                              <div className="flex items-center space-x-3">
                                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                                <span className="text-sm">Super admin approves invitation</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-3">
                              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                {settings.requireInvitationApproval ? '3' : '2'}
                              </div>
                              <span className="text-sm">Invitation email sent to user</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                {settings.requireInvitationApproval ? '4' : '3'}
                              </div>
                              <span className="text-sm">User accepts invitation and creates account</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">✓</div>
                              <span className="text-sm">User gains access with assigned permissions</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-3 text-gray-500">
                            <UserX className="w-5 h-5" />
                            <div>
                              <p className="font-medium">User invitations are disabled</p>
                              <p className="text-sm">New users can only be created manually by administrators</p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Permissions Tab */}
              <TabsContent value="permissions" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="w-5 h-5 mr-2" />
                      Default User Permissions
                    </CardTitle>
                    <CardDescription>
                      Set the default permissions assigned to new users
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {PERMISSION_CATEGORIES.map((category) => {
                      const categoryPermissions = PERMISSION_OPTIONS.filter(p => p.category === category.id);
                      const enabledCount = categoryPermissions.filter(p => settings.defaultUserPermissions.includes(p.id)).length;
                      
                      return (
                        <Card key={category.id}>
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base flex items-center">
                                <span className="mr-2">{category.icon}</span>
                                {category.name}
                              </CardTitle>
                              <Badge variant="outline" className="text-xs">
                                {enabledCount}/{categoryPermissions.length}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {categoryPermissions.map((permission) => (
                                <div
                                  key={permission.id}
                                  className="flex items-center justify-between p-3 border rounded-lg"
                                >
                                  <div className="flex-1">
                                    <Label htmlFor={permission.id} className="font-medium">
                                      {permission.name}
                                    </Label>
                                    <p className="text-sm text-gray-500 mt-1">
                                      {permission.description}
                                    </p>
                                  </div>
                                  <Switch
                                    id={permission.id}
                                    checked={settings.defaultUserPermissions.includes(permission.id)}
                                    onCheckedChange={(checked) => updatePermission(permission.id, checked)}
                                  />
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}

                    {/* Permissions Summary */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Permissions Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="text-sm">
                          <p className="font-medium mb-2">
                            New users will be granted {settings.defaultUserPermissions.length} permissions:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {settings.defaultUserPermissions.map((permissionId) => {
                              const permission = PERMISSION_OPTIONS.find(p => p.id === permissionId);
                              return permission ? (
                                <Badge key={permissionId} variant="secondary" className="text-xs">
                                  {permission.name}
                                </Badge>
                              ) : null;
                            })}
                          </div>
                          {settings.defaultUserPermissions.length === 0 && (
                            <p className="text-gray-500 italic">No default permissions selected</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Lock className="w-5 h-5 mr-2" />
                      Authentication & Security
                    </CardTitle>
                    <CardDescription>
                      Configure authentication settings and security policies
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Session Management */}
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        Session Management
                      </h4>
                      
                      <div>
                        <Label htmlFor="userSessionTimeout">Session Timeout (minutes)</Label>
                        <div className="mt-2">
                          <Slider
                            value={[settings.userSessionTimeout]}
                            onValueChange={(value) => updateSetting('userSessionTimeout', value[0])}
                            max={480}
                            min={5}
                            step={5}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>5 min</span>
                            <span className="font-medium">{settings.userSessionTimeout} minutes</span>
                            <span>8 hours</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          Users will be automatically logged out after this period of inactivity
                        </p>
                      </div>
                    </div>

                    <Separator />

                    {/* Login Security */}
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center">
                        <Ban className="w-4 h-4 mr-2" />
                        Login Security
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                          <Input
                            id="maxLoginAttempts"
                            type="number"
                            value={settings.maxLoginAttempts}
                            onChange={(e) => updateSetting('maxLoginAttempts', parseInt(e.target.value) || 1)}
                            min="1"
                            max="10"
                          />
                          <p className="text-sm text-gray-500 mt-1">
                            Number of failed attempts before account lockout
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="lockoutDuration">Lockout Duration (minutes)</Label>
                          <Input
                            id="lockoutDuration"
                            type="number"
                            value={settings.lockoutDuration}
                            onChange={(e) => updateSetting('lockoutDuration', parseInt(e.target.value) || 1)}
                            min="1"
                            max="1440"
                          />
                          <p className="text-sm text-gray-500 mt-1">
                            How long accounts remain locked after max attempts
                          </p>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="passwordResetExpiry">Password Reset Link Expiry (minutes)</Label>
                        <Input
                          id="passwordResetExpiry"
                          type="number"
                          value={settings.passwordResetExpiry}
                          onChange={(e) => updateSetting('passwordResetExpiry', parseInt(e.target.value) || 5)}
                          min="5"
                          max="1440"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          How long password reset links remain valid
                        </p>
                      </div>
                    </div>

                    <Separator />

                    {/* Two-Factor Authentication */}
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center">
                        <Smartphone className="w-4 h-4 mr-2" />
                        Two-Factor Authentication
                      </h4>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Key className="w-5 h-5" />
                          <div>
                            <Label htmlFor="enableTwoFactorAuth">Enable 2FA Support</Label>
                            <p className="text-sm text-gray-500">
                              Allow users to enable two-factor authentication
                            </p>
                          </div>
                        </div>
                        <Switch
                          id="enableTwoFactorAuth"
                          checked={settings.enableTwoFactorAuth}
                          onCheckedChange={(checked) => updateSetting('enableTwoFactorAuth', checked)}
                        />
                      </div>

                      {settings.enableTwoFactorAuth && (
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Shield className="w-5 h-5" />
                            <div>
                              <Label htmlFor="requireTwoFactorAuth">Require 2FA for All Users</Label>
                              <p className="text-sm text-gray-500">
                                Force all users to enable two-factor authentication
                              </p>
                            </div>
                          </div>
                          <Switch
                            id="requireTwoFactorAuth"
                            checked={settings.requireTwoFactorAuth}
                            onCheckedChange={(checked) => updateSetting('requireTwoFactorAuth', checked)}
                          />
                        </div>
                      )}
                    </div>

                    {/* Security Summary */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Security Configuration Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Session Timeout:</span>
                              <span className="font-medium">{settings.userSessionTimeout} minutes</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Max Login Attempts:</span>
                              <span className="font-medium">{settings.maxLoginAttempts}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Lockout Duration:</span>
                              <span className="font-medium">{settings.lockoutDuration} minutes</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Password Reset Expiry:</span>
                              <span className="font-medium">{settings.passwordResetExpiry} minutes</span>
                            </div>
                            <div className="flex justify-between">
                              <span>2FA Support:</span>
                              <span className={cn("font-medium", settings.enableTwoFactorAuth ? "text-green-600" : "text-red-600")}>
                                {settings.enableTwoFactorAuth ? 'Enabled' : 'Disabled'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>2FA Required:</span>
                              <span className={cn("font-medium", settings.requireTwoFactorAuth ? "text-green-600" : "text-gray-600")}>
                                {settings.requireTwoFactorAuth ? 'Yes' : 'No'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* User Profiles Tab */}
              <TabsContent value="profiles" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      User Profile Settings
                    </CardTitle>
                    <CardDescription>
                      Configure user profile features and account management
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Users className="w-5 h-5" />
                        <div>
                          <Label htmlFor="enableUserProfiles">Enable User Profiles</Label>
                          <p className="text-sm text-gray-500">
                            Allow users to create and manage their profiles
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="enableUserProfiles"
                        checked={settings.enableUserProfiles}
                        onCheckedChange={(checked) => updateSetting('enableUserProfiles', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <UserX className="w-5 h-5" />
                        <div>
                          <Label htmlFor="allowUserDeletion">Allow User Account Deletion</Label>
                          <p className="text-sm text-gray-500">
                            Allow users to delete their own accounts
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="allowUserDeletion"
                        checked={settings.allowUserDeletion}
                        onCheckedChange={(checked) => updateSetting('allowUserDeletion', checked)}
                      />
                    </div>

                    {/* Profile Features Preview */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Available Profile Features</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { feature: 'Profile Information', enabled: settings.enableUserProfiles, description: 'Name, email, avatar' },
                            { feature: 'Account Settings', enabled: settings.enableUserProfiles, description: 'Password, preferences' },
                            { feature: 'Activity History', enabled: settings.enableUserProfiles, description: 'Login history, actions' },
                            { feature: 'Account Deletion', enabled: settings.allowUserDeletion, description: 'Self-service deletion' },
                            { feature: '2FA Management', enabled: settings.enableTwoFactorAuth, description: 'Enable/disable 2FA' },
                            { feature: 'Session Management', enabled: true, description: 'View active sessions' }
                          ].map((item, index) => (
                            <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                              <div className={cn(
                                "w-3 h-3 rounded-full",
                                item.enabled ? "bg-green-500" : "bg-gray-300"
                              )} />
                              <div className="flex-1">
                                <p className="font-medium text-sm">{item.feature}</p>
                                <p className="text-xs text-gray-500">{item.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Account Deletion Warning */}
                    {settings.allowUserDeletion && (
                      <Card className="border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20">
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                            <div className="space-y-2">
                              <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                                Account Deletion Enabled
                              </h4>
                              <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                                <p>• Users can permanently delete their accounts</p>
                                <p>• All user data will be removed (consider data retention policies)</p>
                                <p>• This action cannot be undone</p>
                                <p>• Consider implementing a grace period for account recovery</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
