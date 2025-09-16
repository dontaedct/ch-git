"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertTriangle, Clock, Zap, Activity, Target } from "lucide-react"
import { PerformanceMetrics, PerformanceOptimization } from "@/lib/form-builder/performance-optimization"

interface PerformanceMonitorProps {
  metrics: PerformanceMetrics | null
  optimizations: PerformanceOptimization[]
  targetCompliance: Record<string, boolean>
  showDetails?: boolean
}

export function PerformanceMonitor({
  metrics,
  optimizations,
  targetCompliance,
  showDetails = false
}: PerformanceMonitorProps) {
  const [realTimeMetrics, setRealTimeMetrics] = useState<any>({})

  useEffect(() => {
    // Update real-time metrics
    const updateMetrics = () => {
      if (typeof window !== 'undefined' && (performance as any).memory) {
        const memory = (performance as any).memory
        setRealTimeMetrics({
          memoryUsed: Math.round(memory.usedJSHeapSize / 1024 / 1024),
          memoryLimit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
          timing: performance.timing
        })
      }
    }

    updateMetrics()
    const interval = setInterval(updateMetrics, 2000)

    return () => clearInterval(interval)
  }, [])

  if (!metrics) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Performance monitoring not available. Initialize a form to see metrics.
          </div>
        </CardContent>
      </Card>
    )
  }

  const getPerformanceStatus = (value: number, target: number): "good" | "warning" | "error" => {
    if (value <= target) return "good"
    if (value <= target * 1.5) return "warning"
    return "error"
  }

  const getStatusColor = (status: "good" | "warning" | "error") => {
    switch (status) {
      case "good": return "text-green-600"
      case "warning": return "text-yellow-600"
      case "error": return "text-red-600"
    }
  }

  const getStatusIcon = (status: "good" | "warning" | "error") => {
    switch (status) {
      case "good": return <CheckCircle className="w-4 h-4" />
      case "warning": return <AlertTriangle className="w-4 h-4" />
      case "error": return <AlertTriangle className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Performance Targets Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Performance Targets (HT-023.4.2)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Page Load Time */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Page Load</span>
                <div className={`flex items-center gap-1 ${getStatusColor(getPerformanceStatus(metrics.pageLoadTime, 2000))}`}>
                  {getStatusIcon(getPerformanceStatus(metrics.pageLoadTime, 2000))}
                  <span className="text-xs">Target: &lt;2s</span>
                </div>
              </div>
              <div className="text-2xl font-bold">
                {Math.round(metrics.pageLoadTime)}ms
              </div>
              <Progress
                value={Math.min(100, (2000 - metrics.pageLoadTime) / 2000 * 100)}
                className="h-2"
              />
            </div>

            {/* Template Render Time */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Template Render</span>
                <div className={`flex items-center gap-1 ${getStatusColor(getPerformanceStatus(metrics.templateRenderTime, 500))}`}>
                  {getStatusIcon(getPerformanceStatus(metrics.templateRenderTime, 500))}
                  <span className="text-xs">Target: &lt;500ms</span>
                </div>
              </div>
              <div className="text-2xl font-bold">
                {Math.round(metrics.templateRenderTime)}ms
              </div>
              <Progress
                value={Math.min(100, (500 - metrics.templateRenderTime) / 500 * 100)}
                className="h-2"
              />
            </div>

            {/* Form Submission Time */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Form Submission</span>
                <div className={`flex items-center gap-1 ${getStatusColor(getPerformanceStatus(metrics.formSubmissionTime, 1000))}`}>
                  {getStatusIcon(getPerformanceStatus(metrics.formSubmissionTime, 1000))}
                  <span className="text-xs">Target: &lt;1s</span>
                </div>
              </div>
              <div className="text-2xl font-bold">
                {Math.round(metrics.formSubmissionTime)}ms
              </div>
              <Progress
                value={Math.min(100, (1000 - metrics.formSubmissionTime) / 1000 * 100)}
                className="h-2"
              />
            </div>

            {/* Responsive Breakpoint */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Responsive Switch</span>
                <div className={`flex items-center gap-1 ${getStatusColor(getPerformanceStatus(metrics.responsiveBreakpointTime, 100))}`}>
                  {getStatusIcon(getPerformanceStatus(metrics.responsiveBreakpointTime, 100))}
                  <span className="text-xs">Target: &lt;100ms</span>
                </div>
              </div>
              <div className="text-2xl font-bold">
                {Math.round(metrics.responsiveBreakpointTime)}ms
              </div>
              <Progress
                value={Math.min(100, (100 - metrics.responsiveBreakpointTime) / 100 * 100)}
                className="h-2"
              />
            </div>
          </div>

          {/* Overall Compliance Status */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Performance Compliance</span>
              <Badge
                variant={Object.values(targetCompliance).every(Boolean) ? "default" : "destructive"}
                className="flex items-center gap-1"
              >
                {Object.values(targetCompliance).every(Boolean) ? (
                  <>
                    <CheckCircle className="w-3 h-3" />
                    All Targets Met
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3 h-3" />
                    {Object.values(targetCompliance).filter(Boolean).length}/{Object.keys(targetCompliance).length} Targets Met
                  </>
                )}
              </Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              {Object.entries(targetCompliance).map(([key, value]) => (
                <div key={key} className="flex items-center gap-1">
                  {value ? (
                    <CheckCircle className="w-3 h-3 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-3 h-3 text-red-600" />
                  )}
                  <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time System Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              System Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Memory Usage</span>
              <span className="font-medium">
                {realTimeMetrics.memoryUsed || 0} MB / {realTimeMetrics.memoryLimit || 0} MB
              </span>
            </div>
            <Progress
              value={(realTimeMetrics.memoryUsed / realTimeMetrics.memoryLimit) * 100 || 0}
              className="h-2"
            />

            <div className="flex justify-between">
              <span>Component Mount Time</span>
              <span className="font-medium">{Math.round(metrics.componentMountTime)}ms</span>
            </div>

            <div className="flex justify-between">
              <span>Total Render Time</span>
              <span className="font-medium">{Math.round(metrics.totalRenderTime)}ms</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Active Optimizations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {optimizations.map((opt, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {opt.implemented ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="text-sm font-medium capitalize">
                      {opt.type.replace('_', ' ')}
                    </span>
                  </div>
                  <Badge variant={opt.implemented ? "default" : "secondary"}>
                    {opt.implemented ? "Active" : "Pending"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      {showDetails && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Performance Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Field Render Times</h4>
                <div className="space-y-2">
                  {Object.entries(metrics.fieldRenderTimes).map(([fieldId, time]) => (
                    <div key={fieldId} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{fieldId}</span>
                      <span className="font-medium">{Math.round(time)}ms</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Optimization Impact</h4>
                <div className="space-y-2">
                  {optimizations.filter(opt => opt.implemented).map((opt, index) => (
                    <div key={index} className="p-3 bg-muted/50 rounded-lg">
                      <div className="font-medium text-sm">{opt.description}</div>
                      <div className="text-xs text-muted-foreground mt-1">{opt.impact}</div>
                      <div className="text-xs text-green-600 mt-1">{opt.targetImprovement}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default PerformanceMonitor