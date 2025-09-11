/**
 * @fileoverview HT-008.10.2: Enterprise-Grade Dashboard Component
 * @module components/ui/dashboard
 * @author OSS Hero System
 * @version 2.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.10.2 - Enterprise-Grade Component Library
 * Focus: Comprehensive dashboard with widgets, charts, and real-time updates
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (enterprise dashboard management)
 */

'use client';

import * as React from 'react';
import { TrendingUp, TrendingDown, Users, DollarSign, Activity, AlertCircle, CheckCircle, Clock, BarChart3, PieChart, LineChart } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTokens } from '@/lib/design-tokens';

export interface DashboardMetric {
  id: string;
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    data: number[];
    period: string;
  };
}

export interface DashboardWidget {
  id: string;
  title: string;
  description?: string;
  type: 'metric' | 'chart' | 'table' | 'list' | 'custom';
  size: 'small' | 'medium' | 'large' | 'full';
  data?: any;
  component?: React.ComponentType<any>;
  refreshInterval?: number;
}

export interface DashboardProps {
  title?: string;
  description?: string;
  metrics?: DashboardMetric[];
  widgets?: DashboardWidget[];
  className?: string;
  showTabs?: boolean;
  tabs?: Array<{
    id: string;
    label: string;
    content: React.ReactNode;
  }>;
  onRefresh?: () => void;
  refreshInterval?: number;
}

const MetricCard: React.FC<{ metric: DashboardMetric }> = ({ metric }) => {
  const { tokens } = useTokens();
  
  const getChangeIcon = () => {
    switch (metric.changeType) {
      case 'increase':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'decrease':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const getChangeColor = () => {
    switch (metric.changeType) {
      case 'increase':
        return 'text-green-500';
      case 'decrease':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
        {metric.icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{metric.value}</div>
        {metric.change !== undefined && (
          <div className="flex items-center space-x-1 text-xs">
            {getChangeIcon()}
            <span className={getChangeColor()}>
              {metric.change > 0 ? '+' : ''}{metric.change}%
            </span>
            <span className="text-muted-foreground">from last period</span>
          </div>
        )}
        {metric.description && (
          <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
        )}
      </CardContent>
    </Card>
  );
};

const ChartWidget: React.FC<{ widget: DashboardWidget }> = ({ widget }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{widget.title}</CardTitle>
        {widget.description && <CardDescription>{widget.description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Chart placeholder</p>
            <p className="text-xs text-gray-400">Chart data: {JSON.stringify(widget.data)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const TableWidget: React.FC<{ widget: DashboardWidget }> = ({ widget }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{widget.title}</CardTitle>
        {widget.description && <CardDescription>{widget.description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {widget.data?.map((item: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-sm">{item.name || `Item ${index + 1}`}</span>
              </div>
              <Badge variant="secondary">{item.value || 'N/A'}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const ListWidget: React.FC<{ widget: DashboardWidget }> = ({ widget }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{widget.title}</CardTitle>
        {widget.description && <CardDescription>{widget.description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {widget.data?.map((item: any, index: number) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {item.icon || <div className="w-8 h-8 bg-gray-200 rounded-full" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.title || `Item ${index + 1}`}</p>
                {item.description && (
                  <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                )}
              </div>
              {item.status && (
                <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                  {item.status}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const CustomWidget: React.FC<{ widget: DashboardWidget }> = ({ widget }) => {
  if (widget.component) {
    const Component = widget.component;
    return <Component {...widget.data} />;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{widget.title}</CardTitle>
        {widget.description && <CardDescription>{widget.description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-[200px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-gray-500">Custom widget</p>
            <p className="text-xs text-gray-400">Component: {widget.component?.name || 'None'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const renderWidget = (widget: DashboardWidget) => {
  switch (widget.type) {
    case 'chart':
      return <ChartWidget widget={widget} />;
    case 'table':
      return <TableWidget widget={widget} />;
    case 'list':
      return <ListWidget widget={widget} />;
    case 'custom':
      return <CustomWidget widget={widget} />;
    default:
      return null;
  }
};

const getWidgetSizeClass = (size: DashboardWidget['size']) => {
  switch (size) {
    case 'small':
      return 'col-span-1';
    case 'medium':
      return 'col-span-2';
    case 'large':
      return 'col-span-3';
    case 'full':
      return 'col-span-4';
    default:
      return 'col-span-2';
  }
};

export function Dashboard({
  title,
  description,
  metrics = [],
  widgets = [],
  className,
  showTabs = false,
  tabs = [],
  onRefresh,
  refreshInterval,
}: DashboardProps) {
  const { tokens } = useTokens();
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  
  // Auto-refresh functionality
  React.useEffect(() => {
    if (refreshInterval && onRefresh) {
      const interval = setInterval(() => {
        setIsRefreshing(true);
        onRefresh();
        setTimeout(() => setIsRefreshing(false), 1000);
      }, refreshInterval);
      
      return () => clearInterval(interval);
    }
  }, [refreshInterval, onRefresh]);
  
  const handleRefresh = () => {
    if (onRefresh) {
      setIsRefreshing(true);
      onRefresh();
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };
  
  const content = (
    <div className="space-y-6">
      {/* Metrics Grid */}
      {metrics.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </div>
      )}
      
      {/* Widgets Grid */}
      {widgets.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {widgets.map((widget) => (
            <div key={widget.id} className={getWidgetSizeClass(widget.size)}>
              {renderWidget(widget)}
            </div>
          ))}
        </div>
      )}
      
      {/* Empty State */}
      {metrics.length === 0 && widgets.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Dashboard Content</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Add metrics and widgets to build your dashboard. Configure your data sources and customize the layout.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
  
  return (
    <div className={className}>
      {/* Header */}
      {(title || description) && (
        <div className="flex items-center justify-between mb-6">
          <div>
            {title && <h1 className="text-3xl font-bold tracking-tight">{title}</h1>}
            {description && <p className="text-muted-foreground mt-1">{description}</p>}
          </div>
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <Clock className="h-4 w-4 animate-spin" />
              ) : (
                <Activity className="h-4 w-4" />
              )}
              Refresh
            </Button>
          )}
        </div>
      )}
      
      {/* Content */}
      {showTabs && tabs.length > 0 ? (
        <Tabs defaultValue={tabs[0]?.id} className="space-y-6">
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id}>
              {tab.content}
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        content
      )}
    </div>
  );
}
