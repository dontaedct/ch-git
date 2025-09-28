/**
 * @fileoverview Handover Delivery Dashboard
 * @module app/agency-toolkit/handover/delivery
 * @author OSS Hero Development Team
 * @version 1.0.0
 * @since 2025-09-23
 * 
 * HT-035.4.4: Comprehensive handover delivery dashboard for package management,
 * delivery tracking, and client communication.
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Package, 
  Send, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Download,
  Mail,
  Globe,
  Server,
  Webhook,
  Eye,
  Refresh,
  Filter,
  Search,
  BarChart3
} from 'lucide-react';

// Types
interface DeliveryRequest {
  id: string;
  packageId: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  deliveryMethod: 'email' | 'portal' | 'sftp' | 'secure_download' | 'api_webhook';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'preparing' | 'sending' | 'delivered' | 'failed' | 'expired' | 'cancelled';
  scheduledAt?: string;
  requestedAt: string;
  completedAt?: string;
  packageSize: number;
  fileCount: number;
  trackingUrl?: string;
  qualityScore?: number;
  attempts: number;
  maxAttempts: number;
}

interface DeliveryStats {
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  averageDeliveryTime: number;
  deliveryByMethod: Record<string, number>;
  deliveryByPriority: Record<string, number>;
}

export default function HandoverDeliveryDashboard() {
  const [deliveries, setDeliveries] = useState<DeliveryRequest[]>([]);
  const [stats, setStats] = useState<DeliveryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryRequest | null>(null);
  const [filter, setFilter] = useState({
    status: 'all',
    method: 'all',
    priority: 'all',
    search: ''
  });

  // Load delivery data
  useEffect(() => {
    loadDeliveries();
    loadStats();
  }, [filter]);

  const loadDeliveries = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockDeliveries: DeliveryRequest[] = [
        {
          id: 'delivery-001',
          packageId: 'pkg-client-abc-123',
          clientId: 'client-abc',
          clientName: 'Acme Corporation',
          clientEmail: 'admin@acme.com',
          deliveryMethod: 'portal',
          priority: 'high',
          status: 'delivered',
          requestedAt: '2025-09-23T10:00:00Z',
          completedAt: '2025-09-23T10:15:00Z',
          packageSize: 25600000, // 25.6 MB
          fileCount: 23,
          trackingUrl: '/api/handover/track-delivery/delivery-001',
          qualityScore: 92,
          attempts: 1,
          maxAttempts: 3
        },
        {
          id: 'delivery-002',
          packageId: 'pkg-client-def-456',
          clientId: 'client-def',
          clientName: 'TechStart Inc',
          clientEmail: 'tech@techstart.com',
          deliveryMethod: 'email',
          priority: 'normal',
          status: 'sending',
          requestedAt: '2025-09-23T11:30:00Z',
          packageSize: 18900000, // 18.9 MB
          fileCount: 18,
          trackingUrl: '/api/handover/track-delivery/delivery-002',
          qualityScore: 88,
          attempts: 1,
          maxAttempts: 3
        },
        {
          id: 'delivery-003',
          packageId: 'pkg-client-ghi-789',
          clientId: 'client-ghi',
          clientName: 'Digital Dynamics',
          clientEmail: 'ops@digitaldynamics.com',
          deliveryMethod: 'secure_download',
          priority: 'urgent',
          status: 'failed',
          requestedAt: '2025-09-23T09:15:00Z',
          packageSize: 32100000, // 32.1 MB
          fileCount: 31,
          trackingUrl: '/api/handover/track-delivery/delivery-003',
          qualityScore: 85,
          attempts: 2,
          maxAttempts: 3
        }
      ];

      // Apply filters
      let filteredDeliveries = mockDeliveries;
      
      if (filter.status !== 'all') {
        filteredDeliveries = filteredDeliveries.filter(d => d.status === filter.status);
      }
      
      if (filter.method !== 'all') {
        filteredDeliveries = filteredDeliveries.filter(d => d.deliveryMethod === filter.method);
      }
      
      if (filter.priority !== 'all') {
        filteredDeliveries = filteredDeliveries.filter(d => d.priority === filter.priority);
      }
      
      if (filter.search) {
        filteredDeliveries = filteredDeliveries.filter(d => 
          d.clientName.toLowerCase().includes(filter.search.toLowerCase()) ||
          d.packageId.toLowerCase().includes(filter.search.toLowerCase()) ||
          d.clientEmail.toLowerCase().includes(filter.search.toLowerCase())
        );
      }

      setDeliveries(filteredDeliveries);
    } catch (error) {
      console.error('Failed to load deliveries:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Mock stats - replace with actual API call
      const mockStats: DeliveryStats = {
        totalDeliveries: 156,
        successfulDeliveries: 142,
        failedDeliveries: 14,
        averageDeliveryTime: 12, // minutes
        deliveryByMethod: {
          portal: 89,
          email: 45,
          secure_download: 18,
          sftp: 4,
          api_webhook: 0
        },
        deliveryByPriority: {
          low: 23,
          normal: 98,
          high: 31,
          urgent: 4
        }
      };

      setStats(mockStats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const retryDelivery = async (deliveryId: string) => {
    try {
      console.log(`Retrying delivery: ${deliveryId}`);
      // API call to retry delivery
      // await fetch(`/api/handover/retry-delivery/${deliveryId}`, { method: 'POST' });
      
      // Refresh deliveries
      await loadDeliveries();
    } catch (error) {
      console.error('Failed to retry delivery:', error);
    }
  };

  const cancelDelivery = async (deliveryId: string) => {
    try {
      console.log(`Cancelling delivery: ${deliveryId}`);
      // API call to cancel delivery
      // await fetch(`/api/handover/cancel-delivery/${deliveryId}`, { method: 'POST' });
      
      // Refresh deliveries
      await loadDeliveries();
    } catch (error) {
      console.error('Failed to cancel delivery:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'sending':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'expired':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'portal':
        return <Globe className="h-4 w-4" />;
      case 'sftp':
        return <Server className="h-4 w-4" />;
      case 'secure_download':
        return <Download className="h-4 w-4" />;
      case 'api_webhook':
        return <Webhook className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'default'; // Green
      case 'sending':
        return 'secondary'; // Blue
      case 'failed':
        return 'destructive'; // Red
      case 'pending':
        return 'outline'; // Yellow
      case 'expired':
      case 'cancelled':
        return 'secondary'; // Gray
      default:
        return 'outline';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'destructive'; // Red
      case 'high':
        return 'default'; // Default
      case 'normal':
        return 'secondary'; // Gray
      case 'low':
        return 'outline'; // Light
      default:
        return 'outline';
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  const calculateSuccessRate = (stats: DeliveryStats): number => {
    if (stats.totalDeliveries === 0) return 0;
    return Math.round((stats.successfulDeliveries / stats.totalDeliveries) * 100);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Handover Delivery Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage handover package deliveries
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={loadDeliveries} variant="outline" size="sm">
            <Refresh className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDeliveries}</div>
              <p className="text-xs text-muted-foreground">
                All time deliveries
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {calculateSuccessRate(stats)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.successfulDeliveries} successful
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Failed Deliveries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.failedDeliveries}</div>
              <p className="text-xs text-muted-foreground">
                Requiring attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg. Delivery Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageDeliveryTime}m</div>
              <p className="text-xs text-muted-foreground">
                Average completion time
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="deliveries" className="space-y-4">
        <TabsList>
          <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="deliveries" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Client name, package ID..."
                      value={filter.search}
                      onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={filter.status}
                    onValueChange={(value) => setFilter(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="sending">Sending</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="method">Method</Label>
                  <Select
                    value={filter.method}
                    onValueChange={(value) => setFilter(prev => ({ ...prev, method: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All methods" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Methods</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="portal">Portal</SelectItem>
                      <SelectItem value="sftp">SFTP</SelectItem>
                      <SelectItem value="secure_download">Secure Download</SelectItem>
                      <SelectItem value="api_webhook">API Webhook</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={filter.priority}
                    onValueChange={(value) => setFilter(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deliveries List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Deliveries</CardTitle>
              <CardDescription>
                {deliveries.length} deliveries found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-muted-foreground">Loading deliveries...</div>
                </div>
              ) : deliveries.length === 0 ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-muted-foreground">No deliveries found</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {deliveries.map((delivery) => (
                    <div
                      key={delivery.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer"
                      onClick={() => setSelectedDelivery(delivery)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(delivery.status)}
                            <Badge variant={getStatusBadgeVariant(delivery.status)}>
                              {delivery.status}
                            </Badge>
                          </div>
                          
                          <div>
                            <div className="font-medium">{delivery.clientName}</div>
                            <div className="text-sm text-muted-foreground">
                              {delivery.packageId}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            {getMethodIcon(delivery.deliveryMethod)}
                            <span className="text-sm">{delivery.deliveryMethod}</span>
                          </div>
                          
                          <Badge variant={getPriorityBadgeVariant(delivery.priority)}>
                            {delivery.priority}
                          </Badge>
                          
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {formatBytes(delivery.packageSize)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {delivery.fileCount} files
                            </div>
                          </div>

                          {delivery.status === 'failed' && (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                retryDelivery(delivery.id);
                              }}
                              size="sm"
                              variant="outline"
                            >
                              Retry
                            </Button>
                          )}

                          {(delivery.status === 'pending' || delivery.status === 'sending') && (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                cancelDelivery(delivery.id);
                              }}
                              size="sm"
                              variant="outline"
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Requested:</span> {formatDate(delivery.requestedAt)}
                        </div>
                        {delivery.completedAt && (
                          <div>
                            <span className="font-medium">Completed:</span> {formatDate(delivery.completedAt)}
                          </div>
                        )}
                        {delivery.qualityScore && (
                          <div>
                            <span className="font-medium">Quality:</span> {delivery.qualityScore}%
                          </div>
                        )}
                      </div>

                      {delivery.attempts > 1 && (
                        <div className="mt-2">
                          <Progress 
                            value={(delivery.attempts / delivery.maxAttempts) * 100}
                            className="h-2"
                          />
                          <div className="text-xs text-muted-foreground mt-1">
                            Attempt {delivery.attempts} of {delivery.maxAttempts}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {stats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Delivery Methods Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Delivery Methods</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.deliveryByMethod).map(([method, count]) => (
                      <div key={method} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getMethodIcon(method)}
                          <span className="capitalize">{method.replace('_', ' ')}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{
                                width: `${(count / stats.totalDeliveries) * 100}%`
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Priority Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Priority Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.deliveryByPriority).map(([priority, count]) => (
                      <div key={priority} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant={getPriorityBadgeVariant(priority)} className="w-16 justify-center">
                            {priority}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{
                                width: `${(count / stats.totalDeliveries) * 100}%`
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Delivery Settings</CardTitle>
              <CardDescription>
                Configure default delivery options and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Delivery settings will be available in a future update.
                    Current settings are managed through the API configuration.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delivery Detail Modal */}
      {selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Delivery Details</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDelivery(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Package ID</Label>
                  <div className="text-sm">{selectedDelivery.packageId}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Client</Label>
                  <div className="text-sm">{selectedDelivery.clientName}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedDelivery.status)}
                    <Badge variant={getStatusBadgeVariant(selectedDelivery.status)}>
                      {selectedDelivery.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Method</Label>
                  <div className="flex items-center space-x-2">
                    {getMethodIcon(selectedDelivery.deliveryMethod)}
                    <span className="text-sm">{selectedDelivery.deliveryMethod}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Priority</Label>
                  <Badge variant={getPriorityBadgeVariant(selectedDelivery.priority)}>
                    {selectedDelivery.priority}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Package Size</Label>
                  <div className="text-sm">{formatBytes(selectedDelivery.packageSize)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">File Count</Label>
                  <div className="text-sm">{selectedDelivery.fileCount} files</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Quality Score</Label>
                  <div className="text-sm">{selectedDelivery.qualityScore}%</div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Timeline</Label>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Requested:</span> {formatDate(selectedDelivery.requestedAt)}
                  </div>
                  {selectedDelivery.scheduledAt && (
                    <div>
                      <span className="font-medium">Scheduled:</span> {formatDate(selectedDelivery.scheduledAt)}
                    </div>
                  )}
                  {selectedDelivery.completedAt && (
                    <div>
                      <span className="font-medium">Completed:</span> {formatDate(selectedDelivery.completedAt)}
                    </div>
                  )}
                </div>
              </div>

              {selectedDelivery.trackingUrl && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Tracking</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(selectedDelivery.trackingUrl, '_blank')}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Tracking Details
                  </Button>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                {selectedDelivery.status === 'failed' && (
                  <Button
                    onClick={() => retryDelivery(selectedDelivery.id)}
                    size="sm"
                  >
                    <Refresh className="h-4 w-4 mr-2" />
                    Retry Delivery
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setSelectedDelivery(null)}
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
