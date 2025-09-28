/**
 * @fileoverview App Settings Interface
 * Detailed settings and configuration interface for individual apps
 */
"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, Settings, Database, Globe, Shield, Users, BarChart3, 
  Activity, Bell, RefreshCw, Download, Upload, Eye, Edit3, Trash2,
  CheckCircle2, AlertTriangle, Clock, Server, Zap, DollarSign,
  Palette, Code, Zap as Lightning, Mail, Webhook, Key
} from "lucide-react";

export default function AppSettingsPage() {
  const { resolvedTheme } = useTheme();
  const params = useParams();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'integrations' | 'notifications' | 'advanced'>('general');

  const appId = params.id as string;

  // Mock app data
  const [app] = useState({
    id: appId,
    name: `App ${appId} - Lead Capture`,
    url: `app-${appId}.example.com`,
    status: 'active',
    template: 'Lead Form + PDF Receipt',
    created: '2 days ago',
    submissions: 23,
    uptime: 100,
    lastActivity: '5 min ago',
    deploymentStatus: 'deployed',
    bandwidth: '2.3 GB',
    storage: '450 MB',
    revenue: 2500,
    integrations: ['Stripe', 'Mailchimp'],
    isFavorite: true
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={cn(
        "min-h-screen flex items-center justify-center transition-all duration-300",
        "bg-gradient-to-br from-white via-white to-gray-50"
      )}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-3 border-black/20 border-t-black rounded-full animate-spin" />
          </div>
          <div className="text-black/60 text-sm font-medium animate-pulse">
            Loading App Settings...
          </div>
        </div>
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <main className={cn(
      "min-h-screen transition-all duration-500 ease-out relative",
      isDark ? "bg-black text-white" : "bg-white text-black"
    )}>
      {/* Header */}
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300",
        isDark ? "bg-black border-white/10" : "bg-white border-black/10"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Back Button and Title */}
            <div className="flex items-center gap-4">
              <Link href="/agency-toolkit">
                <Button variant="ghost" size="sm" className="p-2">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-semibold">{app.name} Settings</h1>
                <p className={cn("text-sm", isDark ? "text-white/60" : "text-black/60")}>
                  Configure your app settings and preferences
                </p>
              </div>
            </div>

            {/* Status and Actions */}
            <div className="flex items-center gap-4">
              <Badge variant={app.status === 'active' ? 'default' : 'secondary'}>
                {app.status}
              </Badge>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tab Navigation */}
          <div className="flex space-x-4 mb-8">
            {[
              { id: 'general', label: 'General', icon: Settings },
              { id: 'appearance', label: 'Appearance', icon: Palette },
              { id: 'integrations', label: 'Integrations', icon: Webhook },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'advanced', label: 'Advanced', icon: Code }
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'outline'}
                onClick={() => setActiveTab(tab.id as any)}
                className="flex items-center gap-2"
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">App Name</label>
                      <Input defaultValue={app.name} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Domain</label>
                      <Input defaultValue={app.url} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Template</label>
                      <Input defaultValue={app.template} disabled />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Status</label>
                      <select className="w-full px-3 py-2 border rounded">
                        <option value="active">Active</option>
                        <option value="disabled">Disabled</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <textarea
                    className="w-full px-3 py-2 border rounded"
                    rows={4}
                    placeholder="Describe your app..."
                    defaultValue="Lead capture form with PDF receipt generation and email notifications."
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Theme & Styling</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Primary Color</label>
                      <div className="flex gap-2">
                        <input type="color" defaultValue="#3b82f6" className="w-12 h-10 border rounded" />
                        <Input defaultValue="#3b82f6" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Secondary Color</label>
                      <div className="flex gap-2">
                        <input type="color" defaultValue="#64748b" className="w-12 h-10 border rounded" />
                        <Input defaultValue="#64748b" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Font Family</label>
                      <select className="w-full px-3 py-2 border rounded">
                        <option value="Inter">Inter</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Poppins">Poppins</option>
                        <option value="Open Sans">Open Sans</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Border Radius</label>
                      <select className="w-full px-3 py-2 border rounded">
                        <option value="4">Small (4px)</option>
                        <option value="8" selected>Medium (8px)</option>
                        <option value="12">Large (12px)</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Logo & Branding</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Logo</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-400">PNG, JPG up to 2MB</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Favicon</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">Upload favicon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Gateways</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                          <span className="text-white font-bold text-sm">S</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Stripe</h4>
                          <p className="text-sm text-muted-foreground">Payment processing</p>
                        </div>
                      </div>
                      <Badge variant="default">Connected</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center">
                          <span className="text-white font-bold text-sm">P</span>
                        </div>
                        <div>
                          <h4 className="font-medium">PayPal</h4>
                          <p className="text-sm text-muted-foreground">Alternative payment</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Connect</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Email Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
                          <Mail className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium">Mailchimp</h4>
                          <p className="text-sm text-muted-foreground">Email marketing</p>
                        </div>
                      </div>
                      <Badge variant="default">Connected</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                          <Mail className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium">SendGrid</h4>
                          <p className="text-sm text-muted-foreground">Transactional emails</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Connect</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-muted-foreground">Receive email alerts for app events</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">SMS Notifications</h4>
                    <p className="text-sm text-muted-foreground">Receive SMS alerts for critical events</p>
                  </div>
                  <input type="checkbox" className="w-4 h-4" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Webhook Notifications</h4>
                    <p className="text-sm text-muted-foreground">Send notifications to external services</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>API Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">API Key</label>
                    <div className="flex gap-2">
                      <Input type="password" defaultValue="sk_live_..." className="font-mono" />
                      <Button variant="outline" size="sm">
                        <Key className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Webhook URL</label>
                    <Input defaultValue="https://api.example.com/webhook" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Cache Duration</label>
                      <select className="w-full px-3 py-2 border rounded">
                        <option value="300">5 minutes</option>
                        <option value="900" selected>15 minutes</option>
                        <option value="3600">1 hour</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Rate Limit</label>
                      <select className="w-full px-3 py-2 border rounded">
                        <option value="100">100 requests/hour</option>
                        <option value="1000" selected>1000 requests/hour</option>
                        <option value="10000">10,000 requests/hour</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end gap-3 pt-6">
            <Button variant="outline">Cancel</Button>
            <Button>Save Changes</Button>
          </div>
        </div>
      </div>
    </main>
  );
}



