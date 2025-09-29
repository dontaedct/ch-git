'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Shield,
  Key,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Lock,
  Unlock
} from 'lucide-react';

interface AccessControlProps {
  clientId: string;
  onAccessCreated?: (access: any) => void;
  onAccessRevoked?: (accessId: string) => void;
}

interface AccessCredentials {
  username: string;
  password: string;
  maskedPassword: string;
  apiKey?: string;
  maskedApiKey?: string;
  recoveryCode: string;
  maskedRecoveryCode: string;
}

interface AccessValidation {
  isValid: boolean;
  score: number;
  checks: {
    passwordStrength: boolean;
    uniqueCredentials: boolean;
    expirationSet: boolean;
    permissionsConfigured: boolean;
  };
}

export default function AccessControlInterface({ clientId, onAccessCreated, onAccessRevoked }: AccessControlProps) {
  const [isCreatingAccess, setIsCreatingAccess] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<AccessCredentials | null>(null);
  const [accessValidation, setAccessValidation] = useState<AccessValidation | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(['admin.dashboard.view']);
  const [expirationDays, setExpirationDays] = useState(30);
  const [accessLevel, setAccessLevel] = useState('limited');
  const [includeApiKey, setIncludeApiKey] = useState(false);

  const availablePermissions = [
    { id: 'admin.dashboard.view', name: 'View Dashboard', description: 'Access to admin dashboard' },
    { id: 'admin.content.edit', name: 'Edit Content', description: 'Modify website content' },
    { id: 'admin.users.manage', name: 'Manage Users', description: 'Add, edit, remove users' },
    { id: 'admin.settings.edit', name: 'Edit Settings', description: 'Modify system settings' },
    { id: 'admin.analytics.view', name: 'View Analytics', description: 'Access analytics data' },
    { id: 'admin.integrations.manage', name: 'Manage Integrations', description: 'Configure integrations' },
    { id: 'admin.security.manage', name: 'Security Management', description: 'Security settings and logs' }
  ];

  useEffect(() => {
    if (accessLevel === 'full') {
      setSelectedPermissions(availablePermissions.map(p => p.id));
    } else if (accessLevel === 'limited') {
      setSelectedPermissions(['admin.dashboard.view', 'admin.content.edit', 'admin.analytics.view']);
    } else if (accessLevel === 'readonly') {
      setSelectedPermissions(['admin.dashboard.view', 'admin.analytics.view']);
    }
  }, [accessLevel]);

  useEffect(() => {
    validateAccess();
  }, [selectedPermissions, expirationDays, accessLevel]);

  const validateAccess = () => {
    const checks = {
      passwordStrength: true, // Would validate generated password strength
      uniqueCredentials: true, // Would check against existing credentials
      expirationSet: expirationDays > 0 && expirationDays <= 365,
      permissionsConfigured: selectedPermissions.length > 0
    };

    const score = Object.values(checks).filter(Boolean).length / Object.keys(checks).length * 100;

    setAccessValidation({
      isValid: Object.values(checks).every(Boolean),
      score,
      checks
    });
  };

  const generateSecureCredentials = async (): Promise<AccessCredentials> => {
    // Mock credential generation
    const username = `admin_${clientId.substring(0, 6)}_${Date.now().toString().substring(-4)}`;
    const password = generatePassword();
    const apiKey = includeApiKey ? `ck_${clientId.substring(0, 8)}_${Date.now()}_${Math.random().toString(36).substring(2, 18)}` : undefined;
    const recoveryCode = generateRecoveryCode();

    return {
      username,
      password,
      maskedPassword: maskPassword(password),
      apiKey,
      maskedApiKey: apiKey ? maskApiKey(apiKey) : undefined,
      recoveryCode,
      maskedRecoveryCode: maskRecoveryCode(recoveryCode)
    };
  };

  const generatePassword = (): string => {
    const length = 16;
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let password = '';

    // Ensure at least one character from each category
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)];

    // Fill the rest
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }

    return password.split('').sort(() => Math.random() - 0.5).join('');
  };

  const generateRecoveryCode = (): string => {
    const codes = [];
    for (let i = 0; i < 8; i++) {
      codes.push(Math.random().toString(36).substring(2, 4).toUpperCase());
    }
    return codes.join('-');
  };

  const maskPassword = (password: string): string => {
    if (password.length <= 4) return '*'.repeat(password.length);
    return password.substring(0, 2) + '*'.repeat(password.length - 4) + password.substring(password.length - 2);
  };

  const maskApiKey = (apiKey: string): string => {
    const parts = apiKey.split('_');
    return `${parts[0]}_${parts[1]}_****_****`;
  };

  const maskRecoveryCode = (code: string): string => {
    const parts = code.split('-');
    return parts.map((part, index) => index % 2 === 0 ? part : '**').join('-');
  };

  const handleCreateAccess = async () => {
    if (!accessValidation?.isValid) return;

    setIsCreatingAccess(true);
    try {
      const credentials = await generateSecureCredentials();
      setGeneratedCredentials(credentials);

      const accessData = {
        id: `access_${Date.now()}`,
        clientId,
        credentials,
        accessLevel,
        permissions: selectedPermissions,
        expiresAt: new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000),
        createdAt: new Date()
      };

      onAccessCreated?.(accessData);
    } catch (error) {
      console.error('Error creating access:', error);
    } finally {
      setIsCreatingAccess(false);
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleRegenerateCredentials = async () => {
    const newCredentials = await generateSecureCredentials();
    setGeneratedCredentials(newCredentials);
  };

  return (
    <div className="space-y-6">
      {/* Access Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Access Configuration
          </CardTitle>
          <CardDescription>
            Configure admin access level and permissions for {clientId}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Access Level</Label>
              <Select value={accessLevel} onValueChange={setAccessLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="readonly">Read Only</SelectItem>
                  <SelectItem value="limited">Limited Access</SelectItem>
                  <SelectItem value="full">Full Access</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Expiration (Days)</Label>
              <Input
                type="number"
                value={expirationDays}
                onChange={(e) => setExpirationDays(parseInt(e.target.value) || 30)}
                min="1"
                max="365"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="includeApiKey"
              checked={includeApiKey}
              onCheckedChange={setIncludeApiKey}
            />
            <Label htmlFor="includeApiKey">Generate API Key</Label>
          </div>
        </CardContent>
      </Card>

      {/* Permissions Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Permissions
          </CardTitle>
          <CardDescription>
            Select specific permissions for this admin access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availablePermissions.map((permission) => (
              <div
                key={permission.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedPermissions.includes(permission.id)
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => togglePermission(permission.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-sm">{permission.name}</h4>
                    <p className="text-xs text-muted-foreground">{permission.description}</p>
                  </div>
                  {selectedPermissions.includes(permission.id) ? (
                    <CheckCircle className="w-4 h-4 text-primary" />
                  ) : (
                    <div className="w-4 h-4 border rounded-full" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Access Validation */}
      {accessValidation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Access Validation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Configuration Score</span>
                  <span className="text-sm text-muted-foreground">{Math.round(accessValidation.score)}%</span>
                </div>
                <Progress value={accessValidation.score} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {Object.entries(accessValidation.checks).map(([check, passed]) => (
                  <div key={check} className="flex items-center gap-2">
                    {passed ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    )}
                    <span className="text-sm capitalize">
                      {check.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Credentials */}
      {generatedCredentials && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Generated Credentials
            </CardTitle>
            <CardDescription>
              Secure credentials for client admin access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Lock className="h-4 w-4" />
              <AlertDescription>
                These credentials are shown only once. Make sure to save them securely.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Username</Label>
                  <p className="font-mono text-sm">{generatedCredentials.username}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopyToClipboard(generatedCredentials.username)}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex-1">
                  <Label className="text-sm font-medium">Password</Label>
                  <p className="font-mono text-sm">
                    {showCredentials ? generatedCredentials.password : generatedCredentials.maskedPassword}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowCredentials(!showCredentials)}
                  >
                    {showCredentials ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopyToClipboard(generatedCredentials.password)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {generatedCredentials.apiKey && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <Label className="text-sm font-medium">API Key</Label>
                    <p className="font-mono text-sm">
                      {showCredentials ? generatedCredentials.apiKey : generatedCredentials.maskedApiKey}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowCredentials(!showCredentials)}
                    >
                      {showCredentials ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopyToClipboard(generatedCredentials.apiKey!)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex-1">
                  <Label className="text-sm font-medium">Recovery Code</Label>
                  <p className="font-mono text-sm">
                    {showCredentials ? generatedCredentials.recoveryCode : generatedCredentials.maskedRecoveryCode}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowCredentials(!showCredentials)}
                  >
                    {showCredentials ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopyToClipboard(generatedCredentials.recoveryCode)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={handleRegenerateCredentials} variant="outline" size="sm">
                <RefreshCw className="w-3 h-3 mr-1" />
                Regenerate
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4">
        <Button
          onClick={handleCreateAccess}
          disabled={!accessValidation?.isValid || isCreatingAccess}
          className="flex items-center gap-2"
        >
          {isCreatingAccess ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Creating Access...
            </>
          ) : (
            <>
              <Unlock className="w-4 h-4" />
              Create Admin Access
            </>
          )}
        </Button>

        {!accessValidation?.isValid && (
          <Alert className="flex-1">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please fix validation issues before creating admin access.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}