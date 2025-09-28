/**
 * @fileoverview App Admin Interface
 * Administrative interface for managing individual app settings and configurations
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
  CheckCircle2, AlertTriangle, Clock, Server, Zap, DollarSign
} from "lucide-react";

export default function AppAdminPage() {
  const { resolvedTheme } = useTheme();
  const params = useParams();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'analytics' | 'users' | 'security'>('overview');

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
            Loading App Admin...
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
                <h1 className="text-lg font-semibold">{app.name}</h1>
                <p className={cn("text-sm", isDark ? "text-white/60" : "text-black/60")}>
                  Administrative Dashboard
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
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'settings', label: 'Settings', icon: Settings },
              { id: 'analytics', label: 'Analytics', icon: Activity },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'security', label: 'Security', icon: Shield }
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
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{app.submissions}</div>
                    <p className="text-xs text-muted-foreground">+12% from last month</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                    <Server className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{app.uptime}%</div>
                    <p className="text-xs text-muted-foreground">Last 30 days</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${app.revenue}</div>
                    <p className="text-xs text-muted-foreground">+8% from last month</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                    <Zap className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">120ms</div>
                    <p className="text-xs text-muted-foreground">Average response time</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { action: 'New submission received', time: '2 min ago', type: 'success' },
                      { action: 'App deployed successfully', time: '15 min ago', type: 'success' },
                      { action: 'High traffic detected', time: '1 hour ago', type: 'warning' },
                      { action: 'Backup completed', time: '2 hours ago', type: 'info' }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          activity.type === 'success' ? "bg-green-500" :
                          activity.type === 'warning' ? "bg-yellow-500" : "bg-blue-500"
                        )} />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'settings' && (
            <Card>
              <CardHeader>
                <CardTitle>App Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
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
                <div className="flex gap-3">
                  <Button>Save Changes</Button>
                  <Button variant="outline">Reset</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'analytics' && (
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Analytics Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Detailed analytics and reporting features will be available soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'users' && (
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">User Management Coming Soon</h3>
                  <p className="text-muted-foreground">
                    User roles, permissions, and management features will be available soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Security Settings Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Security configurations, access controls, and monitoring will be available soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}



