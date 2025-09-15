"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, CheckCircle, Clock, Users, TrendingUp, TrendingDown } from "lucide-react"
import { UXMetricsData, UXRecommendation, calculateUXScore, generateUXReport } from "@/lib/form-builder/ux-metrics-tracker"

interface UXDashboardProps {
  metrics: UXMetricsData | null
  recommendations: UXRecommendation[]
  onExportReport?: () => void
  showDetailedMetrics?: boolean
}

export function UXDashboard({
  metrics,
  recommendations,
  onExportReport,
  showDetailedMetrics = false
}: UXDashboardProps) {
  const [selectedTab, setSelectedTab] = useState<"overview" | "fields" | "recommendations">("overview")

  if (!metrics) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            No UX metrics available. Enable UX tracking on a live form to see analytics.
          </div>
        </CardContent>
      </Card>
    )
  }

  const uxScore = calculateUXScore(metrics)
  const errorRate = (metrics.errorEncounters.length / Math.max(metrics.totalFields, 1)) * 100
  const completionRate = metrics.formProgress

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">UX Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Session: {metrics.sessionId.split('_').slice(-1)[0]} •
            Form: {metrics.formId} •
            {metrics.deviceType} device
          </p>
        </div>
        {onExportReport && (
          <Button onClick={onExportReport} variant="outline">
            Export Report
          </Button>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${uxScore >= 80 ? 'bg-green-500' : uxScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} />
              <span className="text-sm font-medium">UX Score</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold">{uxScore}/100</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Completion Rate</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold">{completionRate}%</span>
              <Progress value={completionRate} className="mt-1 h-1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium">Avg. Time</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold">
                {Math.round(metrics.averageFieldTime / 1000)}s
              </span>
              <div className="text-xs text-muted-foreground">per field</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium">Error Rate</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold">{errorRate.toFixed(1)}%</span>
              <div className="text-xs text-muted-foreground">
                {metrics.errorEncounters.length} errors
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1">
        {["overview", "fields", "recommendations"].map((tab) => (
          <Button
            key={tab}
            variant={selectedTab === tab ? "default" : "ghost"}
            size="sm"
            onClick={() => setSelectedTab(tab as any)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      {selectedTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Behavior */}
          <Card>
            <CardHeader>
              <CardTitle>User Behavior</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Focus Changes</span>
                <span className="font-medium">{metrics.focusChanges}</span>
              </div>
              <div className="flex justify-between">
                <span>Scroll Events</span>
                <span className="font-medium">{metrics.scrollEvents}</span>
              </div>
              <div className="flex justify-between">
                <span>Validation Attempts</span>
                <span className="font-medium">{metrics.validationAttempts}</span>
              </div>
              <div className="flex justify-between">
                <span>Session Duration</span>
                <span className="font-medium">
                  {Math.round(metrics.totalTime / 1000)}s
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span>Usability Score</span>
                  <span className="font-medium">{metrics.usabilityScore}/100</span>
                </div>
                <Progress value={metrics.usabilityScore} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span>Completion Efficiency</span>
                  <span className="font-medium">{metrics.completionEfficiency}/100</span>
                </div>
                <Progress value={metrics.completionEfficiency} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span>Error Recovery Rate</span>
                  <span className="font-medium">{Math.round(metrics.errorRecoveryRate)}%</span>
                </div>
                <Progress value={metrics.errorRecoveryRate} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedTab === "fields" && (
        <Card>
          <CardHeader>
            <CardTitle>Field Performance Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.values(metrics.fieldInteractions)
                .sort((a, b) => b.validationErrors - a.validationErrors)
                .map((field) => (
                  <div key={field.fieldId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{field.label}</span>
                      <div className="flex space-x-2">
                        <Badge variant="outline">{field.fieldType}</Badge>
                        {field.completed ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Completed
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Incomplete</Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Focus Time</span>
                        <div className="font-medium">
                          {Math.round(field.totalFocusTime / 1000)}s
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Hesitation</span>
                        <div className="font-medium">
                          {Math.round(field.hesitationTime / 1000)}s
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Errors</span>
                        <div className="font-medium text-red-600">
                          {field.validationErrors}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Confidence</span>
                        <div className="font-medium">
                          {Math.round(field.confidenceScore)}%
                        </div>
                      </div>
                    </div>

                    {field.validationErrors > 0 && (
                      <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                        High error rate - consider improving field validation or help text
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedTab === "recommendations" && (
        <Card>
          <CardHeader>
            <CardTitle>UX Recommendations</CardTitle>
            <p className="text-sm text-muted-foreground">
              AI-generated suggestions to improve user experience
            </p>
          </CardHeader>
          <CardContent>
            {recommendations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                <p>No major UX issues detected!</p>
                <p className="text-sm">Your form appears to be well-optimized for user experience.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={rec.priority === "high" ? "destructive" :
                                  rec.priority === "medium" ? "default" : "secondary"}
                        >
                          {rec.priority.toUpperCase()}
                        </Badge>
                        <span className="font-medium capitalize">
                          {rec.type.replace('_', ' ')}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {rec.implementationEffort} effort
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Issue: </span>
                        <span>{rec.issue}</span>
                      </div>
                      <div>
                        <span className="font-medium">Suggestion: </span>
                        <span>{rec.suggestion}</span>
                      </div>
                      <div className="text-green-700">
                        <span className="font-medium">Expected Impact: </span>
                        <span>{rec.expectedImprovement}</span>
                      </div>
                    </div>

                    {rec.fieldId && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Affects field: {rec.fieldId}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default UXDashboard