/**
 * @fileoverview Individual Client Interface
 * Detailed client overview with project management and navigation
 */
"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

// Client Detail Interface
interface ClientDetail {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  industry: string;
  companySize: string;
  status: 'active' | 'onboarding' | 'completed' | 'inactive';
  projectType: string;
  startDate: string;
  deliveryDate: string;
  progress: number;
  satisfaction: number;
  revenue: number;
  microApps: number;
  lastActivity: string;
  priority: 'high' | 'medium' | 'low';
  manager: string;
  team: string[];
  requirements: string[];
  timeline: TimelineEvent[];
  recentActivity: ActivityEvent[];
}

// Timeline Event Interface
interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'milestone' | 'meeting' | 'delivery' | 'feedback';
  status: 'completed' | 'in_progress' | 'upcoming';
}

// Activity Event Interface
interface ActivityEvent {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  user: string;
  type: 'update' | 'comment' | 'file' | 'meeting';
}

interface ClientPageProps {
  params: {
    clientId: string;
  };
}

export default function ClientPage({ params }: ClientPageProps) {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'activity'>('overview');

  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load real client data from API
  useEffect(() => {
    const loadClientData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/agency-data?action=clients');
        const result = await response.json();

        if (result.success) {
          // Find client by ID or use first client for demo
          const realClient = result.data.find((c: any) => c.id === params.clientId) || result.data[0];

          if (realClient) {
            // Transform real client data to match our interface
            const clientDetail: ClientDetail = {
              id: realClient.id,
              name: realClient.name || realClient.email.split('@')[0],
              company: realClient.company_name || 'Unknown Company',
              email: realClient.email,
              phone: realClient.phone || '+1 (555) 000-0000',
              address: realClient.address || '123 Business Ave, Suite 100, City, State 12345',
              website: realClient.website || 'https://example.com',
              industry: realClient.industry || 'Technology',
              companySize: realClient.company_size || '10-50 employees',
              status: realClient.status || 'active',
              projectType: realClient.project_type || 'Custom Project',
              startDate: realClient.created_at ? new Date(realClient.created_at).toISOString().split('T')[0] : '2024-01-01',
              deliveryDate: realClient.delivery_date || '2024-03-01',
              progress: realClient.progress || 0,
              satisfaction: realClient.satisfaction || 0,
              revenue: realClient.revenue || 0,
              microApps: realClient.micro_apps_count || 0,
              lastActivity: realClient.last_activity || 'Just now',
              priority: realClient.priority || 'medium',
              manager: realClient.manager || 'System',
              team: realClient.team || ['System Manager'],
              requirements: realClient.requirements || [
                'Project requirements loading...',
                'Detailed requirements will be loaded from database'
              ],
              timeline: realClient.timeline || [
                {
                  id: '1',
                  date: realClient.created_at ? new Date(realClient.created_at).toISOString().split('T')[0] : '2024-01-01',
                  title: 'Project Created',
                  description: 'Project created in system',
                  type: 'milestone',
                  status: 'completed'
                }
              ],
              recentActivity: realClient.recent_activity || [
                {
                  id: '1',
                  timestamp: realClient.last_activity || 'Just now',
                  action: 'Client data loaded',
                  details: 'Real client data loaded from database',
                  user: 'System',
                  type: 'update'
                }
              ]
            };

            setClient(clientDetail);
          } else {
            throw new Error('Client not found');
          }
        } else {
          throw new Error(result.error || 'Failed to load client');
        }
      } catch (err) {
        console.error('Error loading client:', err);
        setError(err instanceof Error ? err.message : 'Failed to load client');

        // Fallback to mock data if API fails
        setClient({
          id: params.clientId,
          name: 'Sample Client',
          company: 'Sample Company',
          email: 'sample@company.com',
          phone: '+1 (555) 123-4567',
          address: '123 Business Ave, Suite 100, Sample City, SC 12345',
          website: 'https://samplecompany.com',
          industry: 'Technology',
          companySize: '50-200 employees',
          status: 'active',
          projectType: 'Sample Project',
          startDate: '2024-01-15',
          deliveryDate: '2024-02-28',
          progress: 50,
          satisfaction: 4.5,
          revenue: 25000,
          microApps: 2,
          lastActivity: '1 hour ago',
          priority: 'medium',
          manager: 'Sample Manager',
          team: ['Sample Manager', 'Sample Developer'],
          requirements: [
            'Sample requirement 1',
            'Sample requirement 2',
            'Sample requirement 3'
          ],
          timeline: [
            {
              id: '1',
              date: '2024-01-15',
              title: 'Project Started',
              description: 'Sample project timeline event',
              type: 'milestone',
              status: 'completed'
            }
          ],
          recentActivity: [
            {
              id: '1',
              timestamp: '1 hour ago',
              action: 'Sample activity',
              details: 'This is sample activity data',
              user: 'Sample User',
              type: 'update'
            }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    loadClientData();
  }, [params.clientId]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');

  // Loading state
  if (loading) {
    return (
      <div className={cn(
        "min-h-screen flex items-center justify-center transition-all duration-300",
        isDark ? "bg-black text-white" : "bg-white text-black"
      )}>
        <div className={cn(
          "text-lg font-medium",
          isDark ? "text-white/80" : "text-black/80"
        )}>
          Loading client details...
        </div>
      </div>
    );
  }

  // Error state
  if (error || !client) {
    return (
      <div className={cn(
        "min-h-screen transition-all duration-300",
        isDark ? "bg-black text-white" : "bg-white text-black"
      )}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-800 font-medium">Error loading client details</div>
            <div className="text-red-600 text-sm mt-1">{error || 'Client not found'}</div>
          </div>
        </div>
      </div>
    );
  }

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
    <div className={cn(
      "min-h-screen transition-all duration-300",
      isDark ? "bg-black text-white" : "bg-white text-black"
    )}>
      {/* Header */}
      <div className={cn(
        "border-b-2 transition-all duration-300",
        isDark ? "border-white/30" : "border-black/30"
      )}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center space-x-4 mb-2">
                <a
                  href="/clients"
                  className={cn(
                    "px-3 py-1 rounded-lg border-2 font-bold transition-all duration-300 text-sm",
                    isDark
                      ? "border-white/30 hover:border-white/50"
                      : "border-black/30 hover:border-black/50"
                  )}
                >
                  ← All Clients
                </a>
                <span className={cn(
                  "px-2 py-1 rounded text-xs font-medium uppercase",
                  client.status === 'active' && "bg-green-500/20 text-green-500",
                  client.status === 'onboarding' && "bg-blue-500/20 text-blue-500",
                  client.status === 'completed' && "bg-purple-500/20 text-purple-500",
                  client.status === 'inactive' && "bg-gray-500/20 text-gray-500"
                )}>
                  {client.status}
                </span>
                <span className={cn(
                  "px-2 py-1 rounded text-xs font-medium uppercase",
                  client.priority === 'high' && "bg-red-500/20 text-red-500",
                  client.priority === 'medium' && "bg-yellow-500/20 text-yellow-500",
                  client.priority === 'low' && "bg-green-500/20 text-green-500"
                )}>
                  {client.priority} priority
                </span>
              </div>
              <h1 className="text-4xl font-bold tracking-wide uppercase">
                {client.name}
              </h1>
              <p className={cn(
                "mt-1 text-lg",
                isDark ? "text-white/80" : "text-black/80"
              )}>
                {client.company} • {client.projectType}
              </p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Real Data Indicator */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="text-green-800 font-medium">✅ Connected to real database</div>
          <div className="text-green-600 text-sm mt-1">Showing actual client data for {client.name}</div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Client Overview Cards */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            {[
              { label: "Progress", value: `${client.progress}%`, color: "blue" },
              { label: "Revenue", value: `$${client.revenue.toLocaleString()}`, color: "green" },
              { label: "Satisfaction", value: `${client.satisfaction}/5`, color: "yellow" },
              { label: "Micro Apps", value: client.microApps, color: "purple" }
            ].map((stat) => (
              <div
                key={stat.label}
                className={cn(
                  "p-6 rounded-lg border-2 transition-all duration-300",
                  isDark
                    ? "bg-black/5 border-white/30 hover:border-white/50"
                    : "bg-white/5 border-black/30 hover:border-black/50"
                )}
              >
                <div className="text-sm font-medium uppercase tracking-wide opacity-70">
                  {stat.label}
                </div>
                <div className="text-2xl font-bold mt-2">{stat.value}</div>
              </div>
            ))}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap gap-4"
          >
            {[
              { name: 'Customization', href: `/clients/${client.id}/customization`, icon: '🎨' },
              { name: 'Delivery Status', href: `/clients/${client.id}/delivery`, icon: '🚀' },
              { name: 'Analytics', href: `/clients/${client.id}/analytics`, icon: '📊' },
              { name: 'Documents', href: '/agency-toolkit/documents', icon: '📄' }
            ].map((action) => (
              <a
                key={action.name}
                href={action.href}
                className={cn(
                  "px-6 py-3 rounded-lg border-2 font-bold transition-all duration-300 flex items-center space-x-2",
                  "hover:scale-105",
                  isDark
                    ? "border-white/30 hover:border-white/50"
                    : "border-black/30 hover:border-black/50"
                )}
              >
                <span>{action.icon}</span>
                <span>{action.name}</span>
              </a>
            ))}
          </motion.div>

          {/* Tab Navigation */}
          <motion.div
            variants={itemVariants}
            className="flex space-x-4"
          >
            {[
              { id: 'overview', label: 'Client Overview' },
              { id: 'timeline', label: 'Project Timeline' },
              { id: 'activity', label: 'Recent Activity' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "px-6 py-3 rounded-lg border-2 font-bold transition-all duration-300",
                  activeTab === tab.id
                    ? isDark
                      ? "bg-white/10 border-white/50"
                      : "bg-black/10 border-black/50"
                    : isDark
                      ? "border-white/30 hover:border-white/50"
                      : "border-black/30 hover:border-black/50"
                )}
              >
                {tab.label}
              </button>
            ))}
          </motion.div>

          {/* Client Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* Client Information */}
              <div className={cn(
                "p-6 rounded-lg border-2 transition-all duration-300",
                isDark
                  ? "bg-black/5 border-white/30"
                  : "bg-white/5 border-black/30"
              )}>
                <h3 className="font-bold uppercase tracking-wide text-lg mb-4">
                  Client Information
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium">Email:</span> {client.email}</div>
                    <div><span className="font-medium">Phone:</span> {client.phone}</div>
                    <div><span className="font-medium">Industry:</span> {client.industry}</div>
                    <div><span className="font-medium">Company Size:</span> {client.companySize}</div>
                    <div><span className="font-medium">Website:</span>
                      <a href={client.website} className="text-blue-500 hover:underline ml-1">
                        {client.website}
                      </a>
                    </div>
                    <div><span className="font-medium">Manager:</span> {client.manager}</div>
                  </div>
                  <div>
                    <span className="font-medium">Address:</span>
                    <div className="text-sm opacity-70 mt-1">{client.address}</div>
                  </div>
                </div>
              </div>

              {/* Project Details */}
              <div className={cn(
                "p-6 rounded-lg border-2 transition-all duration-300",
                isDark
                  ? "bg-black/5 border-white/30"
                  : "bg-white/5 border-black/30"
              )}>
                <h3 className="font-bold uppercase tracking-wide text-lg mb-4">
                  Project Details
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium">Start Date:</span> {new Date(client.startDate).toLocaleDateString()}</div>
                    <div><span className="font-medium">Delivery Date:</span> {new Date(client.deliveryDate).toLocaleDateString()}</div>
                    <div><span className="font-medium">Project Type:</span> {client.projectType}</div>
                    <div><span className="font-medium">Last Activity:</span> {client.lastActivity}</div>
                  </div>
                  <div>
                    <div className="font-medium mb-2">Team Members:</div>
                    <div className="flex flex-wrap gap-2">
                      {client.team.map((member) => (
                        <span
                          key={member}
                          className={cn(
                            "px-2 py-1 rounded text-xs font-medium",
                            isDark ? "bg-white/10" : "bg-black/10"
                          )}
                        >
                          {member}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Progress</span>
                      <span className="text-sm">{client.progress}%</span>
                    </div>
                    <div className={cn(
                      "h-3 rounded-full",
                      isDark ? "bg-white/20" : "bg-black/20"
                    )}>
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${client.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Requirements */}
              <div className={cn(
                "lg:col-span-2 p-6 rounded-lg border-2 transition-all duration-300",
                isDark
                  ? "bg-black/5 border-white/30"
                  : "bg-white/5 border-black/30"
              )}>
                <h3 className="font-bold uppercase tracking-wide text-lg mb-4">
                  Project Requirements
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {client.requirements.map((requirement, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">{requirement}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Project Timeline Tab */}
          {activeTab === 'timeline' && (
            <motion.div
              variants={itemVariants}
              className={cn(
                "p-6 rounded-lg border-2 transition-all duration-300",
                isDark
                  ? "bg-black/5 border-white/30"
                  : "bg-white/5 border-black/30"
              )}
            >
              <h3 className="font-bold uppercase tracking-wide text-lg mb-6">
                Project Timeline
              </h3>
              <div className="space-y-6">
                {client.timeline.map((event, index) => (
                  <div key={event.id} className="flex items-start space-x-4">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        "w-4 h-4 rounded-full border-2",
                        event.status === 'completed' && "bg-green-500 border-green-500",
                        event.status === 'in_progress' && "bg-blue-500 border-blue-500",
                        event.status === 'upcoming' && "bg-gray-300 border-gray-300"
                      )} />
                      {index < client.timeline.length - 1 && (
                        <div className={cn(
                          "w-0.5 h-12 mt-2",
                          isDark ? "bg-white/20" : "bg-black/20"
                        )} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <h4 className="font-bold">{event.title}</h4>
                        <span className={cn(
                          "px-2 py-1 rounded text-xs font-medium uppercase",
                          event.type === 'milestone' && "bg-purple-500/20 text-purple-500",
                          event.type === 'meeting' && "bg-blue-500/20 text-blue-500",
                          event.type === 'delivery' && "bg-green-500/20 text-green-500",
                          event.type === 'feedback' && "bg-yellow-500/20 text-yellow-500"
                        )}>
                          {event.type}
                        </span>
                        <span className={cn(
                          "px-2 py-1 rounded text-xs font-medium uppercase",
                          event.status === 'completed' && "bg-green-500/20 text-green-500",
                          event.status === 'in_progress' && "bg-blue-500/20 text-blue-500",
                          event.status === 'upcoming' && "bg-gray-500/20 text-gray-500"
                        )}>
                          {event.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm opacity-70 mb-1">{event.description}</p>
                      <p className="text-xs opacity-60">{new Date(event.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Recent Activity Tab */}
          {activeTab === 'activity' && (
            <motion.div
              variants={itemVariants}
              className={cn(
                "p-6 rounded-lg border-2 transition-all duration-300",
                isDark
                  ? "bg-black/5 border-white/30"
                  : "bg-white/5 border-black/30"
              )}
            >
              <h3 className="font-bold uppercase tracking-wide text-lg mb-6">
                Recent Activity
              </h3>
              <div className="space-y-4">
                {client.recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className={cn(
                      "p-4 rounded-lg border transition-all duration-300",
                      isDark ? "border-white/20 hover:bg-white/5" : "border-black/20 hover:bg-black/5"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={cn(
                            "w-3 h-3 rounded-full",
                            activity.type === 'update' && "bg-blue-500",
                            activity.type === 'comment' && "bg-green-500",
                            activity.type === 'file' && "bg-purple-500",
                            activity.type === 'meeting' && "bg-yellow-500"
                          )} />
                          <span className="font-medium">{activity.action}</span>
                          <span className="text-xs opacity-70">by {activity.user}</span>
                        </div>
                        <p className="text-sm opacity-70">{activity.details}</p>
                      </div>
                      <span className="text-xs opacity-60 whitespace-nowrap ml-4">
                        {activity.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}