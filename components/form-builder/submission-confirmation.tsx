"use client"

import React, { useState, useEffect } from "react"
import { FormTemplate } from "./form-builder-engine"
import { SubmissionResponse, SubmissionStatus } from "@/lib/form-builder/submission-handler"
import { IntegrationResult } from "@/lib/form-builder/integrations"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Download,
  Mail,
  ExternalLink,
  Copy,
  Share2,
  FileText,
  AlertTriangle
} from "lucide-react"

export interface SubmissionConfirmationProps {
  template: FormTemplate
  submissionResponse: SubmissionResponse
  submissionStatus?: SubmissionStatus
  integrationResults?: IntegrationResult[]
  onRetry?: () => void
  onDownloadReceipt?: () => void
  onNavigateNext?: () => void
  showDetails?: boolean
  customMessage?: string
}

export function SubmissionConfirmation({
  template,
  submissionResponse,
  submissionStatus,
  integrationResults = [],
  onRetry,
  onDownloadReceipt,
  onNavigateNext,
  showDetails = true,
  customMessage
}: SubmissionConfirmationProps) {
  const [showFullDetails, setShowFullDetails] = useState(false)
  const [copied, setCopied] = useState(false)

  const isSuccess = submissionResponse.success
  const hasIntegrations = integrationResults.length > 0
  const integrationSuccesses = integrationResults.filter(r => r.success).length
  const integrationFailures = integrationResults.filter(r => !r.success).length

  const handleCopySubmissionId = async () => {
    try {
      await navigator.clipboard.writeText(submissionResponse.submissionId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.warn("Failed to copy to clipboard")
    }
  }

  const getStatusIcon = (success: boolean) => {
    return success
      ? <CheckCircle2 className="w-5 h-5 text-green-600" />
      : <XCircle className="w-5 h-5 text-red-600" />
  }

  const getStatusColor = (success: boolean) => {
    return success ? "text-green-600" : "text-red-600"
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const calculateOverallProgress = () => {
    if (!isSuccess) return 0
    if (!hasIntegrations) return 100

    const integrationProgress = (integrationSuccesses / integrationResults.length) * 50
    return 50 + integrationProgress // 50% for submission + 50% for integrations
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Main Status Card */}
      <Card className={`border-2 ${isSuccess ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {isSuccess ? (
              <CheckCircle2 className="w-16 h-16 text-green-600" />
            ) : (
              <XCircle className="w-16 h-16 text-red-600" />
            )}
          </div>
          <CardTitle className={`text-2xl ${getStatusColor(isSuccess)}`}>
            {isSuccess ? "Form Submitted Successfully!" : "Submission Failed"}
          </CardTitle>
          <CardDescription className="text-lg">
            {customMessage || submissionResponse.message}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Progress Indicator */}
          {submissionStatus && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing Status</span>
                <span>{submissionStatus.progress}%</span>
              </div>
              <Progress value={calculateOverallProgress()} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                {submissionStatus.message}
              </p>
            </div>
          )}

          {/* Submission Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
              <div>
                <p className="font-medium">Submission ID</p>
                <p className="text-sm text-muted-foreground font-mono">
                  {submissionResponse.submissionId}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopySubmissionId}
                className="ml-4"
              >
                {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>

            {submissionResponse.data?.timestamp && (
              <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                <div>
                  <p className="font-medium">Submitted</p>
                  <p className="text-sm text-muted-foreground">
                    {formatTimestamp(submissionResponse.data.timestamp)}
                  </p>
                </div>
                <Clock className="w-5 h-5 text-muted-foreground" />
              </div>
            )}

            {template.name && (
              <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                <div>
                  <p className="font-medium">Form</p>
                  <p className="text-sm text-muted-foreground">{template.name}</p>
                </div>
                <FileText className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Integration Results */}
          {hasIntegrations && (
            <div className="space-y-4">
              <Separator />
              <div>
                <h3 className="font-medium mb-3">Integration Status</h3>
                <div className="grid gap-3">
                  {integrationResults.map((result, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-background rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(result.success)}
                        <div>
                          <p className="font-medium capitalize">{result.integrationId}</p>
                          <p className="text-sm text-muted-foreground">{result.message}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={result.success ? "default" : "destructive"}>
                          {result.success ? "Success" : "Failed"}
                        </Badge>
                        {result.executionTime > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {result.executionTime}ms
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Integration Summary */}
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span>Integrations: {integrationSuccesses}/{integrationResults.length} successful</span>
                    {integrationFailures > 0 && (
                      <span className="text-orange-600">
                        {integrationFailures} failed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Details */}
          {submissionResponse.errors && submissionResponse.errors.length > 0 && (
            <div className="space-y-3">
              <Separator />
              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  Issues Found
                </h3>
                <div className="space-y-2">
                  {submissionResponse.errors.map((error, index) => (
                    <Alert key={index} variant="destructive">
                      <AlertDescription>
                        <strong>{error.field && `${error.field}: `}</strong>
                        {error.message}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Next Steps */}
          {submissionResponse.nextSteps && submissionResponse.nextSteps.length > 0 && (
            <div className="space-y-3">
              <Separator />
              <div>
                <h3 className="font-medium mb-3">Next Steps</h3>
                <ul className="space-y-2">
                  {submissionResponse.nextSteps.map((step, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-sm font-medium text-muted-foreground mt-0.5">
                        {index + 1}.
                      </span>
                      <span className="text-sm">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4">
            {!isSuccess && onRetry && (
              <Button onClick={onRetry} className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
            )}

            {onDownloadReceipt && (
              <Button variant="outline" onClick={onDownloadReceipt} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download Receipt
              </Button>
            )}

            {submissionResponse.redirectUrl && (
              <Button variant="outline" asChild>
                <a
                  href={submissionResponse.redirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Continue
                </a>
              </Button>
            )}

            {onNavigateNext && (
              <Button variant="outline" onClick={onNavigateNext}>
                Continue
              </Button>
            )}
          </div>

          {/* Additional Actions */}
          <div className="flex justify-center gap-4 pt-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.print()}
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Print
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: `Form Submission: ${template.name}`,
                    text: `Submission ID: ${submissionResponse.submissionId}`,
                    url: window.location.href
                  })
                }
              }}
              className="flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>

            {showDetails && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFullDetails(!showFullDetails)}
              >
                {showFullDetails ? "Hide" : "Show"} Details
              </Button>
            )}
          </div>

          {/* Full Details Section */}
          {showFullDetails && (
            <div className="space-y-4 pt-4 border-t">
              <div>
                <h4 className="font-medium mb-2">Technical Details</h4>
                <div className="text-sm space-y-1 font-mono bg-muted p-3 rounded">
                  <div>Submission ID: {submissionResponse.submissionId}</div>
                  <div>Form ID: {template.id}</div>
                  <div>Timestamp: {new Date().toISOString()}</div>
                  {submissionStatus && (
                    <>
                      <div>Status: {submissionStatus.status}</div>
                      <div>Attempts: {submissionStatus.attempts}</div>
                    </>
                  )}
                </div>
              </div>

              {integrationResults.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Integration Details</h4>
                  <div className="space-y-2">
                    {integrationResults.map((result, index) => (
                      <div key={index} className="text-sm bg-muted p-3 rounded">
                        <div className="font-medium">{result.integrationId}</div>
                        <div>Status: {result.success ? "Success" : "Failed"}</div>
                        <div>Message: {result.message}</div>
                        <div>Execution Time: {result.executionTime}ms</div>
                        {result.error && <div>Error: {result.error}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Information */}
      {isSuccess && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Mail className="w-8 h-8 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">
                A confirmation email has been sent with your submission details.
              </p>
              <p className="text-xs text-muted-foreground">
                Please save your submission ID for future reference.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export interface SubmissionStatusTrackerProps {
  submissionId: string
  onStatusUpdate?: (status: SubmissionStatus) => void
  pollInterval?: number
}

export function SubmissionStatusTracker({
  submissionId,
  onStatusUpdate,
  pollInterval = 2000
}: SubmissionStatusTrackerProps) {
  const [status, setStatus] = useState<SubmissionStatus | null>(null)
  const [isPolling, setIsPolling] = useState(true)

  useEffect(() => {
    if (!isPolling) return

    const poll = async () => {
      try {
        // Mock status polling - replace with actual API call
        const mockStatus: SubmissionStatus = {
          id: submissionId,
          status: Math.random() > 0.8 ? "completed" : "processing",
          progress: Math.min(100, (Date.now() % 10000) / 100),
          message: "Processing submission...",
          submittedAt: Date.now() - 5000,
          updatedAt: Date.now(),
          attempts: 1,
          errors: []
        }

        setStatus(mockStatus)
        onStatusUpdate?.(mockStatus)

        if (mockStatus.status === "completed" || mockStatus.status === "failed") {
          setIsPolling(false)
        }
      } catch (error) {
        console.error("Failed to poll submission status:", error)
        setIsPolling(false)
      }
    }

    const interval = setInterval(poll, pollInterval)
    poll() // Initial poll

    return () => clearInterval(interval)
  }, [submissionId, pollInterval, onStatusUpdate, isPolling])

  if (!status) return null

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Status: {status.status}</span>
        <span>{status.progress}%</span>
      </div>
      <Progress value={status.progress} />
      <p className="text-xs text-muted-foreground">{status.message}</p>
    </div>
  )
}