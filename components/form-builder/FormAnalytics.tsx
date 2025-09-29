"use client"

import React, { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart3, 
  Users, 
  MousePointer, 
  Clock, 
  TrendingUp, 
  Download,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface FormAnalyticsData {
  formId: string
  totalViews: number
  totalStarts: number
  totalCompletions: number
  totalAbandons: number
  averageCompletionTime: number
  conversionRate: number
  fieldAnalytics: FieldAnalytics[]
  timeAnalytics: TimeAnalytics[]
  deviceAnalytics: DeviceAnalytics[]
  locationAnalytics: LocationAnalytics[]
  lastUpdated: string
}

export interface FieldAnalytics {
  fieldId: string
  fieldLabel: string
  fieldType: string
  views: number
  interactions: number
  completions: number
  abandonmentRate: number
  averageTimeSpent: number
  errorRate: number
}

export interface TimeAnalytics {
  date: string
  views: number
  completions: number
  conversionRate: number
}

export interface DeviceAnalytics {
  device: string
  views: number
  completions: number
  conversionRate: number
}

export interface LocationAnalytics {
  country: string
  views: number
  completions: number
  conversionRate: number
}

interface FormAnalyticsProps {
  analyticsData?: FormAnalyticsData
  onExport?: (format: 'csv' | 'json') => void
  className?: string
}

export function FormAnalytics({
  analyticsData,
  onExport,
  className
}: FormAnalyticsProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [timeRange, setTimeRange] = useState("7d")

  // Mock data for demonstration
  const mockData: FormAnalyticsData = analyticsData || {
    formId: "form_123",
    totalViews: 1250,
    totalStarts: 890,
    totalCompletions: 456,
    totalAbandons: 434,
    averageCompletionTime: 180, // seconds
    conversionRate: 51.2,
    fieldAnalytics: [
      {
        fieldId: "name",
        fieldLabel: "Full Name",
        fieldType: "text",
        views: 890,
        interactions: 890,
        completions: 456,
        abandonmentRate: 48.8,
        averageTimeSpent: 12,
        errorRate: 2.1
      },
      {
        fieldId: "email",
        fieldLabel: "Email Address",
        fieldType: "email",
        views: 890,
        interactions: 890,
        completions: 456,
        abandonmentRate: 48.8,
        averageTimeSpent: 8,
        errorRate: 5.3
      },
      {
        fieldId: "phone",
        fieldLabel: "Phone Number",
        fieldType: "tel",
        views: 890,
        interactions: 780,
        completions: 456,
        abandonmentRate: 48.8,
        averageTimeSpent: 15,
        errorRate: 8.7
      }
    ],
    timeAnalytics: [
      { date: "2024-01-01", views: 120, completions: 65, conversionRate: 54.2 },
      { date: "2024-01-02", views: 145, completions: 78, conversionRate: 53.8 },
      { date: "2024-01-03", views: 98, completions: 52, conversionRate: 53.1 },
      { date: "2024-01-04", views: 167, completions: 89, conversionRate: 53.3 },
      { date: "2024-01-05", views: 134, completions: 71, conversionRate: 53.0 },
      { date: "2024-01-06", views: 156, completions: 83, conversionRate: 53.2 },
      { date: "2024-01-07", views: 142, completions: 76, conversionRate: 53.5 }
    ],
    deviceAnalytics: [
      { device: "Desktop", views: 650, completions: 340, conversionRate: 52.3 },
      { device: "Mobile", views: 450, completions: 89, conversionRate: 19.8 },
      { device: "Tablet", views: 150, completions: 27, conversionRate: 18.0 }
    ],
    locationAnalytics: [
      { country: "United States", views: 450, completions: 230, conversionRate: 51.1 },
      { country: "Canada", views: 180, completions: 95, conversionRate: 52.8 },
      { country: "United Kingdom", views: 120, completions: 62, conversionRate: 51.7 },
      { country: "Australia", views: 95, completions: 48, conversionRate: 50.5 }
    ],
    lastUpdated: new Date().toISOString()
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const getConversionRateColor = (rate: number) => {
    if (rate >= 60) return "text-green-600"
    if (rate >= 40) return "text-yellow-600"
    return "text-red-600"
  }

  const getAbandonmentRateColor = (rate: number) => {
    if (rate <= 30) return "text-green-600"
    if (rate <= 50) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">Form Analytics</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                Last updated: {new Date(mockData.lastUpdated).toLocaleString()}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport?.('csv')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="fields">Fields</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="demographics">Demographics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Eye className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total Views</p>
                        <p className="text-2xl font-bold">{mockData.totalViews.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <MousePointer className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Form Starts</p>
                        <p className="text-2xl font-bold">{mockData.totalStarts.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Completions</p>
                        <p className="text-2xl font-bold">{mockData.totalCompletions.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Conversion Rate</p>
                        <p className={cn("text-2xl font-bold", getConversionRateColor(mockData.conversionRate))}>
                          {mockData.conversionRate.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Completion Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-2xl font-bold">{formatTime(mockData.averageCompletionTime)}</p>
                        <p className="text-sm text-muted-foreground">Average completion time</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Abandonment Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <div>
                        <p className={cn("text-2xl font-bold", getAbandonmentRateColor(100 - mockData.conversionRate))}>
                          {(100 - mockData.conversionRate).toFixed(1)}%
                        </p>
                        <p className="text-sm text-muted-foreground">Users who abandon form</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="fields" className="space-y-4 mt-6">
              <div className="space-y-4">
                {mockData.fieldAnalytics.map((field) => (
                  <Card key={field.fieldId}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium">{field.fieldLabel}</h3>
                          <p className="text-sm text-muted-foreground">{field.fieldType}</p>
                        </div>
                        <Badge variant="outline">{field.views} views</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Interactions</p>
                          <p className="font-medium">{field.interactions}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Completions</p>
                          <p className="font-medium">{field.completions}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Abandonment</p>
                          <p className={cn("font-medium", getAbandonmentRateColor(field.abandonmentRate))}>
                            {field.abandonmentRate.toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Avg. Time</p>
                          <p className="font-medium">{field.averageTimeSpent}s</p>
                        </div>
                      </div>
                      
                      {field.errorRate > 0 && (
                        <div className="mt-3 p-2 bg-red-50 rounded-md">
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <span className="text-sm text-red-600">
                              Error rate: {field.errorRate.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="performance" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Conversion Rate Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockData.timeAnalytics.map((day) => (
                      <div key={day.date} className="flex items-center justify-between">
                        <span className="text-sm">{new Date(day.date).toLocaleDateString()}</span>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-muted-foreground">{day.views} views</span>
                          <span className="text-sm text-muted-foreground">{day.completions} completions</span>
                          <Badge variant="outline" className={getConversionRateColor(day.conversionRate)}>
                            {day.conversionRate.toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="demographics" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Device Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockData.deviceAnalytics.map((device) => (
                        <div key={device.device} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{device.device}</span>
                            <Badge variant="outline" className={getConversionRateColor(device.conversionRate)}>
                              {device.conversionRate.toFixed(1)}%
                            </Badge>
                          </div>
                          <Progress 
                            value={device.conversionRate} 
                            className="h-2"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{device.views} views</span>
                            <span>{device.completions} completions</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Geographic Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockData.locationAnalytics.map((location) => (
                        <div key={location.country} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{location.country}</span>
                            <Badge variant="outline" className={getConversionRateColor(location.conversionRate)}>
                              {location.conversionRate.toFixed(1)}%
                            </Badge>
                          </div>
                          <Progress 
                            value={location.conversionRate} 
                            className="h-2"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{location.views} views</span>
                            <span>{location.completions} completions</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default FormAnalytics
