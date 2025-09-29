/**
 * @fileoverview User Management Settings Components - HT-032.1.3
 * @module components/admin/user-management-settings
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * Reusable UI components for user management configuration including
 * permission selectors, security settings, and user flow previews.
 */

"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Users,
  UserPlus,
  Shield,
  Lock,
  Key,
  Clock,
  Ban,
  UserCheck,
  UserX,
  Smartphone,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { UserManagementSettings } from '@/lib/admin/foundation-settings';

interface PermissionOption {
  id: string;
  name: string;
  description: string;
  category: 'content' | 'users' | 'system' | 'analytics';
}

interface PermissionCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface PermissionSelectorProps {
  permissions: PermissionOption[];
  categories: PermissionCategory[];
  selectedPermissions: string[];
  onPermissionChange: (permissionId: string, enabled: boolean) => void;
  className?: string;
}

interface SecuritySettingsProps {
  settings: UserManagementSettings;
  onSettingChange: <K extends keyof UserManagementSettings>(key: K, value: UserManagementSettings[K]) => void;
  className?: string;
}

interface InvitationFlowProps {
  enableInvitations: boolean;
  requireApproval: boolean;
  className?: string;
}

interface SessionTimeoutSliderProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

interface TwoFactorSettingsProps {
  enableTwoFactor: boolean;
  requireTwoFactor: boolean;
  onEnableChange: (enabled: boolean) => void;
  onRequireChange: (required: boolean) => void;
  className?: string;
}

/**
 * Permission Selector Component
 */
export function PermissionSelector({ 
  permissions, 
  categories, 
  selectedPermissions, 
  onPermissionChange, 
  className 
}: PermissionSelectorProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {categories.map((category) => {
        const categoryPermissions = permissions.filter(p => p.category === category.id);
        const enabledCount = categoryPermissions.filter(p => selectedPermissions.includes(p.id)).length;
        
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
                  <motion.div
                    key={permission.id}
                    className="flex items-center justify-between p-3 border rounded-lg transition-all hover:shadow-sm"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex-1">
                      <Label htmlFor={permission.id} className="font-medium cursor-pointer">
                        {permission.name}
                      </Label>
                      <p className="text-sm text-gray-500 mt-1">
                        {permission.description}
                      </p>
                    </div>
                    <Switch
                      id={permission.id}
                      checked={selectedPermissions.includes(permission.id)}
                      onCheckedChange={(checked) => onPermissionChange(permission.id, checked)}
                    />
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

/**
 * Security Settings Component
 */
export function SecuritySettings({ settings, onSettingChange, className }: SecuritySettingsProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Session Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Session Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SessionTimeoutSlider
            value={settings.userSessionTimeout}
            onChange={(value) => onSettingChange('userSessionTimeout', value)}
          />
        </CardContent>
      </Card>

      {/* Login Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Ban className="w-5 h-5 mr-2" />
            Login Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
              <Input
                id="maxLoginAttempts"
                type="number"
                value={settings.maxLoginAttempts}
                onChange={(e) => onSettingChange('maxLoginAttempts', parseInt(e.target.value) || 1)}
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
                onChange={(e) => onSettingChange('lockoutDuration', parseInt(e.target.value) || 1)}
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
              onChange={(e) => onSettingChange('passwordResetExpiry', parseInt(e.target.value) || 5)}
              min="5"
              max="1440"
            />
            <p className="text-sm text-gray-500 mt-1">
              How long password reset links remain valid
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <TwoFactorSettings
        enableTwoFactor={settings.enableTwoFactorAuth}
        requireTwoFactor={settings.requireTwoFactorAuth}
        onEnableChange={(enabled) => onSettingChange('enableTwoFactorAuth', enabled)}
        onRequireChange={(required) => onSettingChange('requireTwoFactorAuth', required)}
      />
    </div>
  );
}

/**
 * Invitation Flow Preview Component
 */
export function InvitationFlowPreview({ enableInvitations, requireApproval, className }: InvitationFlowProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-sm">Invitation Flow</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {enableInvitations ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
              <span className="text-sm">Administrator creates invitation</span>
            </div>
            {requireApproval && (
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                <span className="text-sm">Super admin approves invitation</span>
              </div>
            )}
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                {requireApproval ? '3' : '2'}
              </div>
              <span className="text-sm">Invitation email sent to user</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                {requireApproval ? '4' : '3'}
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
  );
}

/**
 * Session Timeout Slider Component
 */
export function SessionTimeoutSlider({ value, onChange, className }: SessionTimeoutSliderProps) {
  return (
    <div className={className}>
      <Label htmlFor="userSessionTimeout">Session Timeout (minutes)</Label>
      <div className="mt-2">
        <Slider
          value={[value]}
          onValueChange={(newValue) => onChange(newValue[0])}
          max={480}
          min={5}
          step={5}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>5 min</span>
          <span className="font-medium">{value} minutes</span>
          <span>8 hours</span>
        </div>
      </div>
      <p className="text-sm text-gray-500 mt-2">
        Users will be automatically logged out after this period of inactivity
      </p>
    </div>
  );
}

/**
 * Two-Factor Authentication Settings Component
 */
export function TwoFactorSettings({ 
  enableTwoFactor, 
  requireTwoFactor, 
  onEnableChange, 
  onRequireChange, 
  className 
}: TwoFactorSettingsProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Smartphone className="w-5 h-5 mr-2" />
          Two-Factor Authentication
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
            checked={enableTwoFactor}
            onCheckedChange={onEnableChange}
          />
        </div>

        {enableTwoFactor && (
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
              checked={requireTwoFactor}
              onCheckedChange={onRequireChange}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Security Configuration Summary Component
 */
interface SecuritySummaryProps {
  settings: UserManagementSettings;
  className?: string;
}

export function SecurityConfigurationSummary({ settings, className }: SecuritySummaryProps) {
  return (
    <Card className={className}>
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
  );
}

/**
 * User Profile Settings Component
 */
interface UserProfileSettingsProps {
  enableProfiles: boolean;
  allowDeletion: boolean;
  onProfilesChange: (enabled: boolean) => void;
  onDeletionChange: (allowed: boolean) => void;
  className?: string;
}

export function UserProfileSettings({ 
  enableProfiles, 
  allowDeletion, 
  onProfilesChange, 
  onDeletionChange, 
  className 
}: UserProfileSettingsProps) {
  return (
    <Card className={className}>
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
            checked={enableProfiles}
            onCheckedChange={onProfilesChange}
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
            checked={allowDeletion}
            onCheckedChange={onDeletionChange}
          />
        </div>

        {/* Profile Features Preview */}
        <ProfileFeaturesPreview
          enableProfiles={enableProfiles}
          allowDeletion={allowDeletion}
        />

        {/* Account Deletion Warning */}
        {allowDeletion && (
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
  );
}

/**
 * Profile Features Preview Component
 */
interface ProfileFeaturesPreviewProps {
  enableProfiles: boolean;
  allowDeletion: boolean;
  enableTwoFactor?: boolean;
  className?: string;
}

export function ProfileFeaturesPreview({ 
  enableProfiles, 
  allowDeletion, 
  enableTwoFactor = false, 
  className 
}: ProfileFeaturesPreviewProps) {
  const features = [
    { feature: 'Profile Information', enabled: enableProfiles, description: 'Name, email, avatar' },
    { feature: 'Account Settings', enabled: enableProfiles, description: 'Password, preferences' },
    { feature: 'Activity History', enabled: enableProfiles, description: 'Login history, actions' },
    { feature: 'Account Deletion', enabled: allowDeletion, description: 'Self-service deletion' },
    { feature: '2FA Management', enabled: enableTwoFactor, description: 'Enable/disable 2FA' },
    { feature: 'Session Management', enabled: true, description: 'View active sessions' }
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-sm">Available Profile Features</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((item, index) => (
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
  );
}

/**
 * Permissions Summary Component
 */
interface PermissionsSummaryProps {
  selectedPermissions: string[];
  allPermissions: PermissionOption[];
  className?: string;
}

export function PermissionsSummary({ selectedPermissions, allPermissions, className }: PermissionsSummaryProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-sm">Permissions Summary</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="text-sm">
          <p className="font-medium mb-2">
            New users will be granted {selectedPermissions.length} permissions:
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedPermissions.map((permissionId) => {
              const permission = allPermissions.find(p => p.id === permissionId);
              return permission ? (
                <Badge key={permissionId} variant="secondary" className="text-xs">
                  {permission.name}
                </Badge>
              ) : null;
            })}
          </div>
          {selectedPermissions.length === 0 && (
            <p className="text-gray-500 italic">No default permissions selected</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default {
  PermissionSelector,
  SecuritySettings,
  InvitationFlowPreview,
  SessionTimeoutSlider,
  TwoFactorSettings,
  SecurityConfigurationSummary,
  UserProfileSettings,
  ProfileFeaturesPreview,
  PermissionsSummary
};
