/**
 * HT-035.3.4: Module Marketplace Moderation Interface
 * 
 * Admin interface for module quality assurance and marketplace moderation.
 * 
 * Features:
 * - View pending module submissions
 * - Review validation results and quality scores
 * - Approve/reject modules with comments
 * - Monitor moderation statistics
 * - Manage module reviews and reputation
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Eye, 
  MessageSquare,
  Star,
  TrendingUp,
  Users,
  FileText,
  Shield
} from 'lucide-react';

interface Submission {
  id: string;
  moduleId: string;
  authorId: string;
  version: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'changes_requested';
  submittedAt: string;
  reviewedAt?: string;
  reviewerId?: string;
  validationResult?: {
    success: boolean;
    overallScore: number;
    checks: Array<{
      name: string;
      status: 'passed' | 'failed' | 'warning' | 'skipped';
      score?: number;
      message: string;
    }>;
    securityIssues: Array<{
      severity: 'low' | 'medium' | 'high' | 'critical';
      type: string;
      description: string;
    }>;
    qualityIssues: Array<{
      type: string;
      description: string;
      file?: string;
      line?: number;
    }>;
    recommendations: string[];
  };
  moderationActions: Array<{
    id: string;
    action: 'approve' | 'reject' | 'request_changes' | 'suspend' | 'unsuspend';
    moderatorId: string;
    reason: string;
    comments?: string;
    createdAt: string;
  }>;
}

interface ModerationStats {
  pendingSubmissions: number;
  approvedToday: number;
  rejectedToday: number;
  averageReviewTime: number;
  qualityScore: number;
}

interface Review {
  id: string;
  moduleId: string;
  userId: string;
  rating: number;
  title: string;
  review: string;
  helpful: number;
  notHelpful: number;
  verified: boolean;
  createdAt: string;
  moderated: boolean;
}

export default function MarketplaceModerationPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load submissions
      const submissionsResponse = await fetch('/api/marketplace/submit');
      const submissionsData = await submissionsResponse.json();
      setSubmissions(submissionsData.submissions || []);

      // Load moderation stats
      const statsResponse = await fetch('/api/marketplace/approve');
      const statsData = await statsResponse.json();
      setStats(statsData.stats);

    } catch (error) {
      console.error('Failed to load moderation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModerationAction = async (
    submissionId: string,
    action: 'approve' | 'reject' | 'request_changes',
    reason: string,
    comments?: string
  ) => {
    try {
      setActionLoading(submissionId);

      const response = await fetch('/api/marketplace/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionId,
          action,
          moderatorId: 'current-user', // In real app, this would be the actual user ID
          reason,
          comments,
        }),
      });

      const result = await response.json();

      if (result.success) {
        await loadData(); // Refresh data
        setSelectedSubmission(null);
      } else {
        console.error('Moderation action failed:', result.error);
      }

    } catch (error) {
      console.error('Failed to perform moderation action:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'changes_requested': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Marketplace Moderation</h1>
          <p className="text-gray-600 mt-2">
            Manage module submissions, quality assurance, and marketplace moderation
          </p>
        </div>
        <Button onClick={loadData} variant="outline">
          <Clock className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingSubmissions}</div>
              <p className="text-xs text-muted-foreground">
                Modules awaiting review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approvedToday}</div>
              <p className="text-xs text-muted-foreground">
                Modules approved today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected Today</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rejectedToday}</div>
              <p className="text-xs text-muted-foreground">
                Modules rejected today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Review Time</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageReviewTime}h</div>
              <p className="text-xs text-muted-foreground">
                Average review time
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="submissions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="submissions" className="space-y-6">
          {/* Submissions List */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Submissions</CardTitle>
              <CardDescription>
                Review and moderate module submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submissions.length === 0 ? (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    No pending submissions at this time.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {submissions.map((submission) => (
                    <div
                      key={submission.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedSubmission(submission)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">{submission.moduleId}</h3>
                            <Badge className={getStatusColor(submission.status)}>
                              {submission.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            Version {submission.version} • Submitted {new Date(submission.submittedAt).toLocaleDateString()}
                          </p>
                          {submission.validationResult && (
                            <div className="flex items-center space-x-4 mt-2">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm">Quality Score:</span>
                                <Badge variant={submission.validationResult.overallScore >= 80 ? 'default' : 'destructive'}>
                                  {submission.validationResult.overallScore}/100
                                </Badge>
                              </div>
                              {submission.validationResult.securityIssues.length > 0 && (
                                <div className="flex items-center space-x-2">
                                  <Shield className="h-4 w-4 text-red-500" />
                                  <span className="text-sm text-red-600">
                                    {submission.validationResult.securityIssues.length} security issues
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Review
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submission Detail Modal */}
          {selectedSubmission && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Review Submission: {selectedSubmission.moduleId}</CardTitle>
                    <CardDescription>
                      Version {selectedSubmission.version} • Submitted by {selectedSubmission.authorId}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedSubmission(null)}
                  >
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Validation Results */}
                {selectedSubmission.validationResult && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Validation Results</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Overall Score</span>
                          <Badge variant={selectedSubmission.validationResult.overallScore >= 80 ? 'default' : 'destructive'}>
                            {selectedSubmission.validationResult.overallScore}/100
                          </Badge>
                        </div>
                        <Progress value={selectedSubmission.validationResult.overallScore} className="mb-4" />
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Validation Checks</h4>
                        <div className="space-y-2">
                          {selectedSubmission.validationResult.checks.map((check, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-sm">{check.name}</span>
                              <Badge variant={
                                check.status === 'passed' ? 'default' :
                                check.status === 'warning' ? 'secondary' : 'destructive'
                              }>
                                {check.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Issues */}
                {selectedSubmission.validationResult?.securityIssues.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Security Issues</h3>
                    <div className="space-y-3">
                      {selectedSubmission.validationResult.securityIssues.map((issue, index) => (
                        <Alert key={index} variant={issue.severity === 'critical' || issue.severity === 'high' ? 'destructive' : 'default'}>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <div className="flex items-center space-x-2 mb-1">
                              <span className={`font-medium ${getSeverityColor(issue.severity)}`}>
                                {issue.severity.toUpperCase()}
                              </span>
                              <span className="text-sm">{issue.type}</span>
                            </div>
                            <p className="text-sm">{issue.description}</p>
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {selectedSubmission.validationResult?.recommendations.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
                    <ul className="space-y-2">
                      {selectedSubmission.validationResult.recommendations.map((recommendation, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span className="text-sm">{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Separator />

                {/* Moderation Actions */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Moderation Actions</h3>
                  <div className="flex space-x-4">
                    <Button
                      onClick={() => handleModerationAction(
                        selectedSubmission.id,
                        'approve',
                        'Passed all validation checks',
                        'Module meets quality standards and security requirements'
                      )}
                      disabled={actionLoading === selectedSubmission.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    
                    <Button
                      onClick={() => handleModerationAction(
                        selectedSubmission.id,
                        'request_changes',
                        'Quality issues need to be addressed',
                        'Please address the security and quality issues before resubmitting'
                      )}
                      disabled={actionLoading === selectedSubmission.id}
                      variant="outline"
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Request Changes
                    </Button>
                    
                    <Button
                      onClick={() => handleModerationAction(
                        selectedSubmission.id,
                        'reject',
                        'Does not meet quality standards',
                        'Module does not meet marketplace quality requirements'
                      )}
                      disabled={actionLoading === selectedSubmission.id}
                      variant="destructive"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Module Reviews</CardTitle>
              <CardDescription>
                Monitor and moderate user reviews
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <MessageSquare className="h-4 w-4" />
                <AlertDescription>
                  Review moderation features will be implemented in a future update.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Moderation Statistics</CardTitle>
              <CardDescription>
                Quality assurance and moderation metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-4">Review Performance</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Average Review Time</span>
                        <span className="font-medium">{stats.averageReviewTime} hours</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Overall Quality Score</span>
                        <span className="font-medium">{stats.qualityScore}/100</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-4">Daily Activity</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Approved Today</span>
                        <span className="font-medium text-green-600">{stats.approvedToday}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Rejected Today</span>
                        <span className="font-medium text-red-600">{stats.rejectedToday}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
