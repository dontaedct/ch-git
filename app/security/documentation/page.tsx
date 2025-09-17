'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BookOpen,
  CheckCircle,
  Clock,
  Download,
  Eye,
  FileText,
  GraduationCap,
  Play,
  Shield,
  Users,
  AlertCircle,
  Target,
  Award,
  Lock
} from 'lucide-react';

interface SecurityPolicy {
  id: string;
  title: string;
  category: string;
  status: 'current' | 'draft' | 'under_review' | 'archived';
  lastUpdated: string;
  version: string;
  approver: string;
  description: string;
}

interface TrainingModule {
  id: string;
  title: string;
  category: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  completionRate: number;
  status: 'available' | 'mandatory' | 'upcoming';
  description: string;
  participants: number;
}

interface Procedure {
  id: string;
  title: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'draft' | 'under_review';
  lastReviewed: string;
  nextReview: string;
  owner: string;
  description: string;
}

export default function SecurityDocumentationPage() {
  const [activeTab, setActiveTab] = useState('policies');

  const [securityPolicies, setSecurityPolicies] = useState<SecurityPolicy[]>([
    {
      id: 'pol-001',
      title: 'Information Security Policy',
      category: 'Security',
      status: 'current',
      lastUpdated: '2025-09-01',
      version: '2.1',
      approver: 'CISO',
      description: 'Comprehensive information security policy covering all security controls'
    },
    {
      id: 'pol-002',
      title: 'Data Protection & Privacy Policy',
      category: 'Privacy',
      status: 'current',
      lastUpdated: '2025-09-10',
      version: '1.8',
      approver: 'DPO',
      description: 'Data protection policy ensuring GDPR and CCPA compliance'
    },
    {
      id: 'pol-003',
      title: 'Access Control Policy',
      category: 'Access Management',
      status: 'current',
      lastUpdated: '2025-08-25',
      version: '1.5',
      approver: 'Security Team',
      description: 'Policy governing user access, authentication, and authorization'
    },
    {
      id: 'pol-004',
      title: 'Incident Response Policy',
      category: 'Incident Management',
      status: 'current',
      lastUpdated: '2025-08-30',
      version: '2.0',
      approver: 'CISO',
      description: 'Policy for handling security incidents and data breaches'
    },
    {
      id: 'pol-005',
      title: 'Acceptable Use Policy',
      category: 'User Conduct',
      status: 'current',
      lastUpdated: '2025-09-05',
      version: '1.3',
      approver: 'HR Director',
      description: 'Guidelines for acceptable use of company IT resources'
    },
    {
      id: 'pol-006',
      title: 'Third-Party Risk Management',
      category: 'Vendor Management',
      status: 'under_review',
      lastUpdated: '2025-08-20',
      version: '1.2',
      approver: 'Risk Committee',
      description: 'Policy for assessing and managing third-party security risks'
    }
  ]);

  const [trainingModules, setTrainingModules] = useState<TrainingModule[]>([
    {
      id: 'train-001',
      title: 'Security Awareness Fundamentals',
      category: 'General Security',
      duration: '45 min',
      difficulty: 'beginner',
      completionRate: 100,
      status: 'mandatory',
      description: 'Basic security awareness training for all employees',
      participants: 156
    },
    {
      id: 'train-002',
      title: 'Data Protection & Privacy',
      category: 'Privacy',
      duration: '30 min',
      difficulty: 'beginner',
      completionRate: 98,
      status: 'mandatory',
      description: 'GDPR and CCPA compliance training',
      participants: 152
    },
    {
      id: 'train-003',
      title: 'Phishing & Social Engineering',
      category: 'Threat Awareness',
      duration: '25 min',
      difficulty: 'intermediate',
      completionRate: 95,
      status: 'mandatory',
      description: 'How to identify and respond to phishing attacks',
      participants: 148
    },
    {
      id: 'train-004',
      title: 'Secure Coding Practices',
      category: 'Development',
      duration: '60 min',
      difficulty: 'intermediate',
      completionRate: 87,
      status: 'available',
      description: 'Security best practices for developers',
      participants: 32
    },
    {
      id: 'train-005',
      title: 'Incident Response Procedures',
      category: 'Incident Management',
      duration: '40 min',
      difficulty: 'intermediate',
      completionRate: 92,
      status: 'available',
      description: 'How to respond to security incidents',
      participants: 28
    },
    {
      id: 'train-006',
      title: 'Advanced Threat Detection',
      category: 'Security Operations',
      duration: '90 min',
      difficulty: 'advanced',
      completionRate: 75,
      status: 'available',
      description: 'Advanced techniques for threat detection and analysis',
      participants: 12
    }
  ]);

  const [procedures, setProcedures] = useState<Procedure[]>([
    {
      id: 'proc-001',
      title: 'User Access Provisioning',
      category: 'Access Management',
      priority: 'high',
      status: 'active',
      lastReviewed: '2025-09-01',
      nextReview: '2025-12-01',
      owner: 'IT Operations',
      description: 'Step-by-step process for granting user access to systems'
    },
    {
      id: 'proc-002',
      title: 'Security Incident Response',
      category: 'Incident Management',
      priority: 'high',
      status: 'active',
      lastReviewed: '2025-08-30',
      nextReview: '2025-11-30',
      owner: 'Security Team',
      description: 'Detailed procedures for responding to security incidents'
    },
    {
      id: 'proc-003',
      title: 'Data Breach Notification',
      category: 'Privacy',
      priority: 'high',
      status: 'active',
      lastReviewed: '2025-09-10',
      nextReview: '2025-12-10',
      owner: 'Legal Team',
      description: 'Process for notifying authorities and customers of data breaches'
    },
    {
      id: 'proc-004',
      title: 'Vulnerability Management',
      category: 'Vulnerability',
      priority: 'medium',
      status: 'active',
      lastReviewed: '2025-08-25',
      nextReview: '2025-11-25',
      owner: 'Security Team',
      description: 'Process for identifying, assessing, and remediating vulnerabilities'
    },
    {
      id: 'proc-005',
      title: 'Backup and Recovery',
      category: 'Business Continuity',
      priority: 'medium',
      status: 'active',
      lastReviewed: '2025-08-15',
      nextReview: '2025-11-15',
      owner: 'IT Operations',
      description: 'Procedures for data backup and disaster recovery'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'current':
      case 'active':
      case 'mandatory':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'under_review':
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'available':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'upcoming':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const currentPolicies = securityPolicies.filter(p => p.status === 'current').length;
  const mandatoryTraining = trainingModules.filter(t => t.status === 'mandatory').length;
  const activeProcedures = procedures.filter(p => p.status === 'active').length;
  const avgCompletionRate = Math.round(
    trainingModules.reduce((acc, t) => acc + t.completionRate, 0) / trainingModules.length
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-blue-600" />
              Security Documentation & Training
            </h1>
            <p className="text-gray-600 mt-2">
              Comprehensive security policies, procedures, and training programs
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export All Docs
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <FileText className="h-4 w-4 mr-2" />
              New Document
            </Button>
          </div>
        </div>

        {/* Documentation Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Policies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{currentPolicies}</div>
              <p className="text-xs text-gray-500 mt-1">Current and approved</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Training Modules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{trainingModules.length}</div>
              <p className="text-xs text-gray-500 mt-1">{mandatoryTraining} mandatory</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Procedures
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{activeProcedures}</div>
              <p className="text-xs text-gray-500 mt-1">Active procedures</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Training Completion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{avgCompletionRate}%</div>
              <p className="text-xs text-gray-500 mt-1">Average completion rate</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="policies" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="policies">Security Policies</TabsTrigger>
            <TabsTrigger value="training">Training Programs</TabsTrigger>
            <TabsTrigger value="procedures">Procedures</TabsTrigger>
            <TabsTrigger value="overview">Documentation Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="policies" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Policies
                </CardTitle>
                <CardDescription>
                  Organizational security policies and governance documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {securityPolicies.map((policy) => (
                    <div key={policy.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">{policy.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{policy.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getStatusColor(policy.status)}>
                            {policy.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Version:</span>
                          <span className="ml-1 font-medium">{policy.version}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Category:</span>
                          <span className="ml-1 font-medium">{policy.category}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Approver:</span>
                          <span className="ml-1 font-medium">{policy.approver}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Updated:</span>
                          <span className="ml-1 font-medium">
                            {new Date(policy.lastUpdated).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="training" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Security Training Programs
                </CardTitle>
                <CardDescription>
                  Security awareness and training modules for all staff levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trainingModules.map((module) => (
                    <div key={module.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">{module.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getStatusColor(module.status)}>
                            {module.status.toUpperCase()}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Play className="h-4 w-4 mr-1" />
                            Start
                          </Button>
                        </div>
                      </div>
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Completion Rate</span>
                          <span>{module.completionRate}%</span>
                        </div>
                        <Progress value={module.completionRate} className="w-full" />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Duration:</span>
                          <span className="ml-1 font-medium">{module.duration}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Difficulty:</span>
                          <Badge variant="outline" className={getDifficultyColor(module.difficulty)} size="sm">
                            {module.difficulty}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-gray-500">Category:</span>
                          <span className="ml-1 font-medium">{module.category}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Participants:</span>
                          <span className="ml-1 font-medium">{module.participants}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="procedures" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Security Procedures
                </CardTitle>
                <CardDescription>
                  Detailed step-by-step security procedures and workflows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {procedures.map((procedure) => (
                    <div key={procedure.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">{procedure.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{procedure.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getPriorityColor(procedure.priority)}>
                            {procedure.priority.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className={getStatusColor(procedure.status)}>
                            {procedure.status.toUpperCase()}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Category:</span>
                          <span className="ml-1 font-medium">{procedure.category}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Owner:</span>
                          <span className="ml-1 font-medium">{procedure.owner}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Last Review:</span>
                          <span className="ml-1 font-medium">
                            {new Date(procedure.lastReviewed).toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Next Review:</span>
                          <span className="ml-1 font-medium">
                            {new Date(procedure.nextReview).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Documentation Coverage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Security Policies</span>
                      <div className="flex items-center gap-2">
                        <Progress value={95} className="w-20" />
                        <span className="text-sm font-medium">95%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Procedures</span>
                      <div className="flex items-center gap-2">
                        <Progress value={90} className="w-20" />
                        <span className="text-sm font-medium">90%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Training Materials</span>
                      <div className="flex items-center gap-2">
                        <Progress value={100} className="w-20" />
                        <span className="text-sm font-medium">100%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Compliance Docs</span>
                      <div className="flex items-center gap-2">
                        <Progress value={98} className="w-20" />
                        <span className="text-sm font-medium">98%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Training Effectiveness
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">96%</div>
                      <p className="text-sm text-gray-600">Overall Training Completion</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-xl font-bold text-blue-600">156</div>
                        <p className="text-xs text-gray-600">Total Participants</p>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-purple-600">6</div>
                        <p className="text-xs text-gray-600">Active Modules</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Security Documentation Status
                </CardTitle>
                <CardDescription>
                  Comprehensive overview of security documentation and training implementation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">100%</div>
                      <p className="text-sm text-gray-600">Policy Coverage</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">98%</div>
                      <p className="text-sm text-gray-600">Training Completion</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">100%</div>
                      <p className="text-sm text-gray-600">Procedure Documentation</p>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <h4 className="font-medium text-green-800">Security Documentation Complete</h4>
                    </div>
                    <p className="text-sm text-green-700">
                      Basic security documentation and training materials have been successfully implemented.
                      All security policies, procedures, and training programs are documented and accessible to staff.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Documentation Highlights</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Security Policies</span>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Privacy Policies</span>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Incident Procedures</span>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Access Procedures</span>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Training Program Status</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Security Awareness</span>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Privacy Training</span>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Incident Response</span>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Secure Development</span>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}