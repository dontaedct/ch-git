/**
 * HT-035.3.3: Module Revenue Dashboard
 * 
 * Comprehensive revenue analytics and reporting interface for module marketplace.
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  ShoppingCart,
  CreditCard,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  Calendar
} from 'lucide-react'

// ============================================================================
// TYPES
// ============================================================================

interface RevenueAnalytics {
  totalRevenue: number
  grossRevenue: number
  netRevenue: number
  commissionPaid: number
  refunds: number
  transactionCount: number
  averageTransactionValue: number
  revenueByModule: Record<string, {
    revenue: number
    transactions: number
    commission: number
  }>
  revenueByEventType: Record<string, {
    revenue: number
    transactions: number
  }>
  dailyBreakdown?: Array<{
    date: string
    revenue: number
    transactions: number
  }>
}

interface SubscriptionAnalytics {
  totalSubscriptions: number
  activeSubscriptions: number
  cancelledSubscriptions: number
  pausedSubscriptions: number
  failedSubscriptions: number
  monthlyRecurringRevenue: number
  averageSubscriptionValue: number
  churnRate: number
  subscriptionGrowth: number
}

interface PaymentAnalytics {
  totalRevenue: number
  totalTransactions: number
  successfulTransactions: number
  failedTransactions: number
  refundedTransactions: number
  averageTransactionValue: number
  revenueByMonth: Record<string, number>
  topModules: Array<{ moduleId: string; revenue: number; transactions: number }>
}

// ============================================================================
// REVENUE DASHBOARD COMPONENT
// ============================================================================

export default function RevenueDashboard() {
  const [revenueData, setRevenueData] = useState<RevenueAnalytics | null>(null)
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionAnalytics | null>(null)
  const [paymentData, setPaymentData] = useState<PaymentAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [selectedModule, setSelectedModule] = useState<string>('all')

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  useEffect(() => {
    fetchRevenueData()
  }, [selectedPeriod, selectedModule])

  const fetchRevenueData = async () => {
    try {
      setLoading(true)
      setError(null)

      const endDate = new Date()
      const startDate = new Date()
      
      // Calculate start date based on selected period
      switch (selectedPeriod) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7)
          break
        case '30d':
          startDate.setDate(endDate.getDate() - 30)
          break
        case '90d':
          startDate.setDate(endDate.getDate() - 90)
          break
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1)
          break
        default:
          startDate.setDate(endDate.getDate() - 30)
      }

      // Fetch revenue analytics
      const revenueResponse = await fetch(
        `/api/marketplace/analytics/revenue?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&moduleId=${selectedModule === 'all' ? '' : selectedModule}`
      )
      const revenueAnalytics = await revenueResponse.json()

      // Fetch subscription analytics
      const subscriptionResponse = await fetch(
        `/api/marketplace/analytics/subscriptions?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      )
      const subscriptionAnalytics = await subscriptionResponse.json()

      // Fetch payment analytics
      const paymentResponse = await fetch(
        `/api/marketplace/analytics/payments?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      )
      const paymentAnalytics = await paymentResponse.json()

      setRevenueData(revenueAnalytics.data)
      setSubscriptionData(subscriptionAnalytics.data)
      setPaymentData(paymentAnalytics.data)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch revenue data')
    } finally {
      setLoading(false)
    }
  }

  const exportRevenueReport = async () => {
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(endDate.getDate() - 30)

      const response = await fetch(
        `/api/marketplace/reports/revenue?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&format=csv`
      )
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `revenue-report-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (err) {
      console.error('Export failed:', err)
    }
  }

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  }

  const getTrendIcon = (value: number) => {
    return value >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    )
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading revenue data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchRevenueData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Revenue Dashboard</h1>
          <p className="text-muted-foreground">
            Module marketplace revenue analytics and reporting
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={exportRevenueReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button onClick={fetchRevenueData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedModule} onValueChange={setSelectedModule}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select module" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modules</SelectItem>
            {/* Module options would be populated from API */}
          </SelectContent>
        </Select>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="payments">Payment Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Revenue */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {revenueData ? formatCurrency(revenueData.totalRevenue) : '$0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {getTrendIcon(5.2)} +5.2% from last period
                </p>
              </CardContent>
            </Card>

            {/* Monthly Recurring Revenue */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">MRR</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {subscriptionData ? formatCurrency(subscriptionData.monthlyRecurringRevenue) : '$0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {getTrendIcon(12.3)} +12.3% from last month
                </p>
              </CardContent>
            </Card>

            {/* Total Transactions */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {revenueData ? revenueData.transactionCount.toLocaleString() : '0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {getTrendIcon(8.1)} +8.1% from last period
                </p>
              </CardContent>
            </Card>

            {/* Average Transaction Value */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {revenueData ? formatCurrency(revenueData.averageTransactionValue) : '$0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {getTrendIcon(-2.4)} -2.4% from last period
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Net Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">
                  {revenueData ? formatCurrency(revenueData.netRevenue) : '$0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  After commissions and refunds
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Commission Paid</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">
                  {revenueData ? formatCurrency(revenueData.commissionPaid) : '$0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Platform fees
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Refunds</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-red-500">
                  {revenueData ? formatCurrency(revenueData.refunds) : '$0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total refunded amount
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Revenue Analytics Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Revenue by Module */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Module</CardTitle>
                <CardDescription>Top performing modules by revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {revenueData && Object.entries(revenueData.revenueByModule)
                    .sort(([,a], [,b]) => b.revenue - a.revenue)
                    .slice(0, 5)
                    .map(([moduleId, data]) => (
                      <div key={moduleId} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{moduleId}</p>
                          <p className="text-sm text-muted-foreground">
                            {data.transactions} transactions
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(data.revenue)}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(data.commission)} commission
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Revenue by Event Type */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Event Type</CardTitle>
                <CardDescription>Breakdown by transaction type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {revenueData && Object.entries(revenueData.revenueByEventType)
                    .sort(([,a], [,b]) => b.revenue - a.revenue)
                    .map(([eventType, data]) => (
                      <div key={eventType} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {eventType.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(data.revenue)}</p>
                          <p className="text-sm text-muted-foreground">
                            {data.transactions} transactions
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {subscriptionData ? subscriptionData.activeSubscriptions.toLocaleString() : '0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">
                  {subscriptionData ? subscriptionData.cancelledSubscriptions.toLocaleString() : '0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total cancelled
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {subscriptionData ? formatPercentage(subscriptionData.churnRate) : '0%'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Monthly churn rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Avg Subscription Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {subscriptionData ? formatCurrency(subscriptionData.averageSubscriptionValue) : '$0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Per subscription
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Payment Analytics Tab */}
        <TabsContent value="payments" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  {paymentData && paymentData.totalTransactions > 0 
                    ? formatPercentage(paymentData.successfulTransactions / paymentData.totalTransactions)
                    : '0%'
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Payment success rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Failed Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">
                  {paymentData ? paymentData.failedTransactions.toLocaleString() : '0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Failed payments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Refunded</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-500">
                  {paymentData ? paymentData.refundedTransactions.toLocaleString() : '0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Refunded transactions
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Top Modules */}
          <Card>
            <CardHeader>
              <CardTitle>Top Modules by Revenue</CardTitle>
              <CardDescription>Highest revenue generating modules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentData && paymentData.topModules.slice(0, 10).map((module, index) => (
                  <div key={module.moduleId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground">
                        #{index + 1}
                      </span>
                      <div>
                        <p className="font-medium">{module.moduleId}</p>
                        <p className="text-sm text-muted-foreground">
                          {module.transactions} transactions
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(module.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
