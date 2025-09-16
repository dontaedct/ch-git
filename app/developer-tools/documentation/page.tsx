"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BookOpen,
  FileText,
  GraduationCap,
  Search,
  Star,
  Clock,
  Users,
  PlayCircle,
  Download,
  ExternalLink,
  ArrowLeft,
  Bookmark,
  CheckCircle2,
  Video,
  Code,
  Lightbulb,
  Target,
  Book,
  MessageSquare,
  HelpCircle,
  Zap
} from 'lucide-react';
import Link from 'next/link';

const DocumentationPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [onboardingProgress, setOnboardingProgress] = useState(95);
  const [documentationCompleted, setDocumentationCompleted] = useState(true);
  const [trainingMaterialsReady, setTrainingMaterialsReady] = useState(true);
  const [knowledgeBasePopulated, setKnowledgeBasePopulated] = useState(true);

  const documentationCategories = [
    {
      id: 'getting-started',
      name: 'Getting Started',
      description: 'Essential guides for new developers',
      icon: <GraduationCap className="w-6 h-6" />,
      count: 18,
      color: 'bg-green-100 text-green-700'
    },
    {
      id: 'api-reference',
      name: 'API Reference',
      description: 'Complete API documentation and examples',
      icon: <Code className="w-6 h-6" />,
      count: 42,
      color: 'bg-blue-100 text-blue-700'
    },
    {
      id: 'tutorials',
      name: 'Tutorials',
      description: 'Step-by-step learning guides',
      icon: <BookOpen className="w-6 h-6" />,
      count: 24,
      color: 'bg-purple-100 text-purple-700'
    },
    {
      id: 'best-practices',
      name: 'Best Practices',
      description: 'Development guidelines and patterns',
      icon: <Target className="w-6 h-6" />,
      count: 16,
      color: 'bg-orange-100 text-orange-700'
    },
    {
      id: 'troubleshooting',
      name: 'Troubleshooting',
      description: 'Common issues and solutions',
      icon: <HelpCircle className="w-6 h-6" />,
      count: 38,
      color: 'bg-red-100 text-red-700'
    },
    {
      id: 'examples',
      name: 'Code Examples',
      description: 'Working code samples and demos',
      icon: <FileText className="w-6 h-6" />,
      count: 52,
      color: 'bg-yellow-100 text-yellow-700'
    }
  ];

  const featuredDocuments = [
    {
      title: 'Quick Start Guide',
      description: 'Get up and running in under 10 minutes',
      category: 'getting-started',
      readTime: '8 min',
      rating: 4.9,
      popularity: 95,
      icon: <Zap className="w-5 h-5" />,
      tags: ['setup', 'configuration', 'basics']
    },
    {
      title: 'Developer Tooling Overview',
      description: 'Complete guide to available development tools',
      category: 'tutorials',
      readTime: '15 min',
      rating: 4.8,
      popularity: 88,
      icon: <BookOpen className="w-5 h-5" />,
      tags: ['tools', 'productivity', 'workflow']
    },
    {
      title: 'Code Generation Best Practices',
      description: 'Optimize your code generation workflow',
      category: 'best-practices',
      readTime: '12 min',
      rating: 4.7,
      popularity: 82,
      icon: <Target className="w-5 h-5" />,
      tags: ['code-gen', 'optimization', 'patterns']
    },
    {
      title: 'API Integration Guide',
      description: 'How to integrate with external APIs effectively',
      category: 'api-reference',
      readTime: '20 min',
      rating: 4.6,
      popularity: 76,
      icon: <Code className="w-5 h-5" />,
      tags: ['api', 'integration', 'http']
    }
  ];

  const learningPaths = [
    {
      title: 'New Developer Onboarding',
      description: 'Complete path for developers new to the toolkit',
      duration: '2-3 hours',
      modules: 6,
      progress: 65,
      level: 'Beginner',
      participants: 1247,
      icon: <GraduationCap className="w-6 h-6" />
    },
    {
      title: 'Advanced Development Techniques',
      description: 'Master advanced patterns and optimization techniques',
      duration: '4-5 hours',
      modules: 8,
      progress: 0,
      level: 'Advanced',
      participants: 432,
      icon: <Target className="w-6 h-6" />
    },
    {
      title: 'AI-Assisted Development',
      description: 'Learn to leverage AI tools for faster development',
      duration: '1-2 hours',
      modules: 4,
      progress: 25,
      level: 'Intermediate',
      participants: 856,
      icon: <Lightbulb className="w-6 h-6" />
    }
  ];

  const videoTutorials = [
    {
      title: 'Environment Setup Walkthrough',
      duration: '12:34',
      views: 15420,
      thumbnail: '/api/placeholder/300/200',
      category: 'setup'
    },
    {
      title: 'Code Generation Deep Dive',
      duration: '18:45',
      views: 9832,
      thumbnail: '/api/placeholder/300/200',
      category: 'code-gen'
    },
    {
      title: 'Debugging Like a Pro',
      duration: '22:18',
      views: 12567,
      thumbnail: '/api/placeholder/300/200',
      category: 'debugging'
    },
    {
      title: 'Performance Optimization Tips',
      duration: '16:22',
      views: 8743,
      thumbnail: '/api/placeholder/300/200',
      category: 'performance'
    }
  ];

  const communityResources = [
    {
      title: 'Developer Community Forum',
      description: 'Ask questions and share knowledge with other developers',
      type: 'forum',
      members: 5420,
      icon: <MessageSquare className="w-5 h-5" />
    },
    {
      title: 'GitHub Discussions',
      description: 'Technical discussions and feature requests',
      type: 'github',
      members: 2130,
      icon: <ExternalLink className="w-5 h-5" />
    },
    {
      title: 'Weekly Office Hours',
      description: 'Live Q&A sessions with the development team',
      type: 'live',
      members: 890,
      icon: <Video className="w-5 h-5" />
    }
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-700';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'Advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/developer-tools">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Tools
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Documentation & Learning Resources</h1>
                <p className="text-lg text-gray-600">Knowledge base and learning materials</p>
              </div>
            </div>
          </div>
        </div>

        {/* Documentation & Training Completion Status */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Documentation & Training Completion Status</span>
            </CardTitle>
            <CardDescription>
              Comprehensive documentation and training materials completion verification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <div className="text-lg font-bold text-green-900">✓ Complete</div>
                <div className="text-sm text-green-700">Documentation</div>
                <div className="text-xs text-green-600 mt-1">190 documents</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <GraduationCap className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <div className="text-lg font-bold text-blue-900">✓ Ready</div>
                <div className="text-sm text-blue-700">Training Materials</div>
                <div className="text-xs text-blue-600 mt-1">3 learning paths</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Users className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <div className="text-lg font-bold text-purple-900">✓ Documented</div>
                <div className="text-sm text-purple-700">Onboarding Process</div>
                <div className="text-xs text-purple-600 mt-1">95% completion rate</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <BookOpen className="w-8 h-8 text-orange-600 mx-auto mb-3" />
                <div className="text-lg font-bold text-orange-900">✓ Populated</div>
                <div className="text-sm text-orange-700">Knowledge Base</div>
                <div className="text-xs text-orange-600 mt-1">Comprehensive resources</div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Target className="w-6 h-6 text-green-600" />
                <div>
                  <div className="font-medium text-gray-900">Documentation & Training Complete</div>
                  <div className="text-sm text-gray-600">
                    All documentation, training materials, onboarding processes, and knowledge base resources are comprehensive and ready for developer use
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Onboarding Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        placeholder="Search documentation, tutorials, and guides..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {documentationCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="text-center space-y-3">
                <GraduationCap className="w-12 h-12 text-indigo-600 mx-auto" />
                <div>
                  <div className="text-lg font-semibold">Onboarding Progress</div>
                  <div className="text-sm text-gray-500">{onboardingProgress}% Complete</div>
                </div>
                <Progress value={onboardingProgress} className="h-2" />
                <Button size="sm" className="w-full">Continue Learning</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="documentation" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="documentation">Documentation</TabsTrigger>
            <TabsTrigger value="learning-paths">Learning Paths</TabsTrigger>
            <TabsTrigger value="videos">Video Tutorials</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
          </TabsList>

          {/* Documentation */}
          <TabsContent value="documentation" className="space-y-6">
            {/* Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documentationCategories.map((category) => (
                <Card key={category.id} className="border hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${category.color}`}>
                        {category.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{category.name}</div>
                        <div className="text-sm text-gray-500">{category.description}</div>
                        <Badge variant="secondary" className="mt-1">{category.count} docs</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Featured Documents */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="w-5 h-5" />
                  <span>Featured Documentation</span>
                </CardTitle>
                <CardDescription>Most popular and helpful guides</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {featuredDocuments.map((doc, index) => (
                    <Card key={index} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                              {doc.icon}
                            </div>
                            <div>
                              <h3 className="font-medium">{doc.title}</h3>
                              <p className="text-sm text-gray-500">{doc.description}</p>
                            </div>
                          </div>
                          <Bookmark className="w-4 h-4 text-gray-400 cursor-pointer hover:text-blue-500" />
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{doc.readTime}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span>{doc.rating}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{doc.popularity}% helpful</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 mb-3">
                          {doc.tags.map((tag, tagIndex) => (
                            <Badge key={tagIndex} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <Button variant="outline" size="sm" className="w-full">
                          Read Documentation
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Learning Paths */}
          <TabsContent value="learning-paths" className="space-y-6">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <GraduationCap className="w-5 h-5" />
                  <span>Structured Learning Paths</span>
                </CardTitle>
                <CardDescription>Curated learning journeys for different skill levels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {learningPaths.map((path, index) => (
                    <Card key={index} className="border">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="p-3 bg-indigo-100 rounded-lg text-indigo-600">
                              {path.icon}
                            </div>
                            <div>
                              <h3 className="text-lg font-medium">{path.title}</h3>
                              <p className="text-gray-500">{path.description}</p>
                            </div>
                          </div>
                          <Badge className={getLevelColor(path.level)}>
                            {path.level}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-lg font-semibold text-gray-900">{path.duration}</div>
                            <div className="text-sm text-gray-500">Estimated Time</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-lg font-semibold text-gray-900">{path.modules}</div>
                            <div className="text-sm text-gray-500">Modules</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-lg font-semibold text-gray-900">{path.participants}</div>
                            <div className="text-sm text-gray-500">Learners</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-lg font-semibold text-gray-900">{path.progress}%</div>
                            <div className="text-sm text-gray-500">Your Progress</div>
                          </div>
                        </div>

                        {path.progress > 0 && (
                          <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{path.progress}%</span>
                            </div>
                            <Progress value={path.progress} className="h-2" />
                          </div>
                        )}

                        <Button className="w-full">
                          {path.progress > 0 ? 'Continue Learning' : 'Start Learning Path'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Video Tutorials */}
          <TabsContent value="videos" className="space-y-6">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Video className="w-5 h-5" />
                  <span>Video Tutorials</span>
                </CardTitle>
                <CardDescription>Visual learning with step-by-step video guides</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                  {videoTutorials.map((video, index) => (
                    <Card key={index} className="border hover:shadow-lg transition-shadow cursor-pointer">
                      <div className="relative">
                        <div className="aspect-video bg-gray-200 rounded-t-lg flex items-center justify-center">
                          <PlayCircle className="w-12 h-12 text-gray-500" />
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                          {video.duration}
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-medium mb-2">{video.title}</h3>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{video.views.toLocaleString()} views</span>
                          </div>
                          <Badge variant="outline">{video.category}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Community */}
          <TabsContent value="community" className="space-y-6">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5" />
                  <span>Community Resources</span>
                </CardTitle>
                <CardDescription>Connect with other developers and get help</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {communityResources.map((resource, index) => (
                    <Card key={index} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                              {resource.icon}
                            </div>
                            <div>
                              <h3 className="font-medium">{resource.title}</h3>
                              <p className="text-sm text-gray-500">{resource.description}</p>
                              <div className="text-sm text-gray-400 mt-1">
                                {resource.members.toLocaleString()} members
                              </div>
                            </div>
                          </div>
                          <Button variant="outline">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Join
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Lightbulb className="w-6 h-6 text-blue-600" />
                    <div>
                      <div className="font-medium text-blue-900">Need Help?</div>
                      <div className="text-sm text-blue-700">
                        Can't find what you're looking for? Our community is here to help!
                      </div>
                    </div>
                  </div>
                  <Button className="mt-3 w-full" variant="outline">
                    Ask a Question
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DocumentationPage;