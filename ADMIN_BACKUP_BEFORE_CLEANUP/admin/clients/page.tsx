'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ClientAnalytics } from '@/components/admin/client-analytics';
import { ClientTracker } from '@/lib/consultation/client-tracking';
import {
  Users,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Settings,
  TrendingUp,
  Activity,
  Calendar,
  Mail,
  Phone,
  Building,
  Globe,
  FileText,
  Download,
  Upload
} from 'lucide-react';
import { toast } from 'sonner';

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  industry: string;
  website?: string;
  status: 'active' | 'inactive' | 'trial' | 'suspended';
  plan: 'basic' | 'professional' | 'enterprise';
  createdAt: string;
  lastActivity: string;
  consultationCount: number;
  conversionRate: number;
  totalRevenue: number;
  customizations: number;
  templates: number;
  users: number;
  branding: {
    logo?: string;
    primaryColor: string;
    domain?: string;
  };
  metrics: {
    totalConsultations: number;
    completedConsultations: number;
    averageRating: number;
    responseTime: number;
    leadConversion: number;
  };
}

interface ClientsPageProps {
  searchParams?: {
    view?: string;
    status?: string;
    plan?: string;
  };
}

export default function ClientsPage({ searchParams }: ClientsPageProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams?.status || 'all');
  const [planFilter, setPlanFilter] = useState(searchParams?.plan || 'all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showClientModal, setShowClientModal] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams?.view || 'overview');

  const clientTracker = new ClientTracker();

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    filterClients();
  }, [clients, searchTerm, statusFilter, planFilter]);

  const loadClients = async () => {
    try {
      setLoading(true);

      // Mock client data - in real implementation, fetch from API
      const mockClients: Client[] = [
        {
          id: 'client-1',
          name: 'Tech Innovations Inc',
          email: 'admin@techinnovations.com',
          phone: '+1 (555) 123-4567',
          company: 'Tech Innovations Inc',
          industry: 'Technology',
          website: 'https://techinnovations.com',
          status: 'active',
          plan: 'enterprise',
          createdAt: '2025-08-15T10:00:00.000Z',
          lastActivity: '2025-09-19T14:30:00.000Z',
          consultationCount: 847,
          conversionRate: 78.5,
          totalRevenue: 125000,
          customizations: 12,
          templates: 5,
          users: 15,
          branding: {
            logo: 'https://example.com/logos/tech-innovations.png',
            primaryColor: '#1e40af',
            domain: 'consult.techinnovations.com'
          },
          metrics: {
            totalConsultations: 847,
            completedConsultations: 665,
            averageRating: 4.8,
            responseTime: 24,
            leadConversion: 78.5
          }
        },
        {
          id: 'client-2',
          name: 'Healthcare Solutions LLC',
          email: 'contact@healthcaresolutions.com',
          phone: '+1 (555) 987-6543',
          company: 'Healthcare Solutions LLC',
          industry: 'Healthcare',
          website: 'https://healthcaresolutions.com',
          status: 'active',
          plan: 'professional',
          createdAt: '2025-07-20T15:00:00.000Z',
          lastActivity: '2025-09-19T09:15:00.000Z',
          consultationCount: 523,
          conversionRate: 82.1,
          totalRevenue: 78000,
          customizations: 8,
          templates: 3,
          users: 8,
          branding: {
            logo: 'https://example.com/logos/healthcare-solutions.png',
            primaryColor: '#059669',
            domain: 'portal.healthcaresolutions.com'
          },
          metrics: {
            totalConsultations: 523,
            completedConsultations: 429,
            averageRating: 4.9,
            responseTime: 18,
            leadConversion: 82.1
          }
        },
        {
          id: 'client-3',
          name: 'Legal Advisory Group',
          email: 'info@legaladvisory.com',
          phone: '+1 (555) 456-7890',
          company: 'Legal Advisory Group',
          industry: 'Legal',
          website: 'https://legaladvisory.com',
          status: 'trial',
          plan: 'basic',
          createdAt: '2025-09-10T12:00:00.000Z',
          lastActivity: '2025-09-18T16:45:00.000Z',
          consultationCount: 89,
          conversionRate: 65.2,
          totalRevenue: 12000,
          customizations: 3,
          templates: 1,
          users: 3,
          branding: {
            primaryColor: '#dc2626'
          },
          metrics: {
            totalConsultations: 89,
            completedConsultations: 58,
            averageRating: 4.6,
            responseTime: 36,
            leadConversion: 65.2
          }
        },
        {
          id: 'client-4',
          name: 'Financial Planning Pro',
          email: 'team@financialplanningpro.com',
          phone: '+1 (555) 321-0987',
          company: 'Financial Planning Pro',
          industry: 'Finance',
          website: 'https://financialplanningpro.com',
          status: 'inactive',
          plan: 'professional',
          createdAt: '2025-06-05T08:00:00.000Z',
          lastActivity: '2025-08-30T11:20:00.000Z',
          consultationCount: 234,
          conversionRate: 71.8,
          totalRevenue: 45000,
          customizations: 5,
          templates: 2,
          users: 6,
          branding: {
            logo: 'https://example.com/logos/financial-planning.png',
            primaryColor: '#7c3aed',
            domain: 'consult.financialplanningpro.com'
          },
          metrics: {
            totalConsultations: 234,
            completedConsultations: 168,
            averageRating: 4.7,
            responseTime: 28,
            leadConversion: 71.8
          }
        }
      ];

      setClients(mockClients);
    } catch (error) {
      console.error('Error loading clients:', error);
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const filterClients = () => {
    let filtered = clients;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.industry.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(client => client.status === statusFilter);
    }

    // Plan filter
    if (planFilter !== 'all') {
      filtered = filtered.filter(client => client.plan === planFilter);
    }

    setFilteredClients(filtered);
  };

  const handleCreateClient = () => {
    setSelectedClient(null);
    setShowClientModal(true);
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setShowClientModal(true);
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      return;
    }

    try {
      // In real implementation, call API to delete client
      setClients(prev => prev.filter(c => c.id !== clientId));
      toast.success('Client deleted successfully');
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error('Failed to delete client');
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'trial': return 'secondary';
      case 'inactive': return 'outline';
      case 'suspended': return 'destructive';
      default: return 'outline';
    }
  };

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case 'enterprise': return 'default';
      case 'professional': return 'secondary';
      case 'basic': return 'outline';
      default: return 'outline';
    }
  };

  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.status === 'active').length;
  const totalRevenue = clients.reduce((sum, c) => sum + c.totalRevenue, 0);
  const averageConversion = clients.reduce((sum, c) => sum + c.conversionRate, 0) / clients.length || 0;

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Client Management</h1>
          <p className="text-gray-600 mt-1">
            Manage clients, track performance, and monitor consultation analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleCreateClient} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Client
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Import
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Clients</p>
                <p className="text-2xl font-bold">{totalClients}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Clients</p>
                <p className="text-2xl font-bold">{activeClients}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FileText className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Conversion</p>
                <p className="text-2xl font-bold">{averageConversion.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Client Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <Input
                      placeholder="Search clients..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={planFilter} onValueChange={setPlanFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Plans</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Clients List */}
          <div className="grid gap-4">
            {filteredClients.map((client) => (
              <Card key={client.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                        {client.name.charAt(0)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{client.name}</h3>
                          <Badge variant={getStatusBadgeVariant(client.status)}>
                            {client.status}
                          </Badge>
                          <Badge variant={getPlanBadgeVariant(client.plan)}>
                            {client.plan}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {client.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Building className="w-4 h-4" />
                            {client.industry}
                          </div>
                          {client.website && (
                            <div className="flex items-center gap-1">
                              <Globe className="w-4 h-4" />
                              {client.website}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                          <p className="text-sm text-gray-600">Consultations</p>
                          <p className="font-bold">{client.consultationCount}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Conversion</p>
                          <p className="font-bold">{client.conversionRate}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Revenue</p>
                          <p className="font-bold">${client.totalRevenue.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Users</p>
                          <p className="font-bold">{client.users}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditClient(client)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEditClient(client)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClient(client.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div className="mt-4 pt-4 border-t">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Created</p>
                        <p>{new Date(client.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Last Activity</p>
                        <p>{new Date(client.lastActivity).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Templates</p>
                        <p>{client.templates} active</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Customizations</p>
                        <p>{client.customizations} total</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredClients.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No clients found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || statusFilter !== 'all' || planFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Get started by adding your first client'}
                </p>
                {(!searchTerm && statusFilter === 'all' && planFilter === 'all') && (
                  <Button onClick={handleCreateClient}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Client
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics">
          <ClientAnalytics clients={clients} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Client Management Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Default Settings</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-onboarding">Automatic Client Onboarding</Label>
                      <Switch id="auto-onboarding" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="trial-period">Enable Trial Period</Label>
                      <Switch id="trial-period" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <Switch id="email-notifications" defaultChecked />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Multi-Tenant Configuration</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="data-isolation">Data Isolation</Label>
                      <Switch id="data-isolation" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="custom-domains">Custom Domains</Label>
                      <Switch id="custom-domains" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="white-labeling">White Labeling</Label>
                      <Switch id="white-labeling" defaultChecked />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Performance Monitoring</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="response-time-threshold">Response Time Threshold (hours)</Label>
                    <Input id="response-time-threshold" type="number" defaultValue="24" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="conversion-threshold">Conversion Rate Threshold (%)</Label>
                    <Input id="conversion-threshold" type="number" defaultValue="70" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="activity-threshold">Activity Threshold (days)</Label>
                    <Input id="activity-threshold" type="number" defaultValue="30" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button>Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}