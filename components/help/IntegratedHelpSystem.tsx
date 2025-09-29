import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  HelpCircle,
  Book,
  Video,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  Star,
  Clock,
  User,
  Tag,
  X,
  ArrowLeft
} from 'lucide-react';

interface HelpArticle {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  rating: number;
  views: number;
  lastUpdated: string;
  author: string;
  type: 'guide' | 'tutorial' | 'troubleshooting' | 'video' | 'faq';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime?: string;
}

interface ContextualHelp {
  module: string;
  page: string;
  relevantArticles: string[];
  quickTips: string[];
  commonActions: Array<{
    label: string;
    action: () => void;
  }>;
}

interface IntegratedHelpSystemProps {
  isOpen: boolean;
  onClose: () => void;
  context?: {
    module: string;
    page: string;
    section?: string;
  };
  initialQuery?: string;
}

const HELP_ARTICLES: HelpArticle[] = [
  {
    id: 'getting-started',
    title: 'Getting Started with Agency Toolkit',
    description: 'Complete guide to setting up and using your integrated agency management system',
    content: 'This comprehensive guide will walk you through the initial setup and configuration of your Agency Toolkit...',
    category: 'Getting Started',
    tags: ['setup', 'basics', 'onboarding'],
    rating: 4.8,
    views: 1250,
    lastUpdated: '2025-09-20',
    author: 'Agency Toolkit Team',
    type: 'guide',
    difficulty: 'beginner',
    estimatedTime: '10 min read'
  },
  {
    id: 'orchestration-basics',
    title: 'Workflow Orchestration Fundamentals',
    description: 'Learn how to create, manage, and optimize your agency workflows',
    content: 'Workflow orchestration is the backbone of efficient agency operations...',
    category: 'Orchestration',
    tags: ['workflows', 'automation', 'processes'],
    rating: 4.9,
    views: 890,
    lastUpdated: '2025-09-18',
    author: 'Sarah Johnson',
    type: 'tutorial',
    difficulty: 'intermediate',
    estimatedTime: '15 min read'
  },
  {
    id: 'module-management',
    title: 'Managing Hot-Pluggable Modules',
    description: 'Install, configure, and manage system modules without downtime',
    content: 'The module system allows you to extend your agency toolkit dynamically...',
    category: 'Modules',
    tags: ['modules', 'plugins', 'configuration'],
    rating: 4.7,
    views: 650,
    lastUpdated: '2025-09-15',
    author: 'Mike Chen',
    type: 'guide',
    difficulty: 'advanced',
    estimatedTime: '12 min read'
  },
  {
    id: 'marketplace-guide',
    title: 'Template Marketplace Guide',
    description: 'Discover, install, and customize templates from the marketplace',
    content: 'The template marketplace offers a wide range of pre-built solutions...',
    category: 'Marketplace',
    tags: ['templates', 'marketplace', 'customization'],
    rating: 4.6,
    views: 720,
    lastUpdated: '2025-09-12',
    author: 'Emily Rodriguez',
    type: 'tutorial',
    difficulty: 'beginner',
    estimatedTime: '8 min read'
  },
  {
    id: 'client-handover',
    title: 'Automated Client Handover Process',
    description: 'Streamline project delivery with automated handover workflows',
    content: 'Client handover is a critical phase in project delivery...',
    category: 'Handover',
    tags: ['handover', 'delivery', 'clients'],
    rating: 4.9,
    views: 980,
    lastUpdated: '2025-09-10',
    author: 'David Kim',
    type: 'guide',
    difficulty: 'intermediate',
    estimatedTime: '18 min read'
  },
  {
    id: 'troubleshooting-common',
    title: 'Common Issues and Solutions',
    description: 'Troubleshoot the most common problems and their solutions',
    content: 'This article covers the most frequently encountered issues...',
    category: 'Troubleshooting',
    tags: ['troubleshooting', 'errors', 'solutions'],
    rating: 4.5,
    views: 1100,
    lastUpdated: '2025-09-08',
    author: 'Support Team',
    type: 'troubleshooting',
    difficulty: 'beginner',
    estimatedTime: '5 min read'
  }
];

const CONTEXTUAL_HELP: Record<string, ContextualHelp> = {
  'dashboard': {
    module: 'dashboard',
    page: 'main',
    relevantArticles: ['getting-started'],
    quickTips: [
      'Click on any module card to access its features',
      'Use the search bar to quickly find specific functions',
      'Check the status indicators for real-time system health'
    ],
    commonActions: [
      { label: 'Take System Tour', action: () => {} },
      { label: 'View Quick Start Guide', action: () => {} }
    ]
  },
  'orchestration': {
    module: 'orchestration',
    page: 'workflows',
    relevantArticles: ['orchestration-basics'],
    quickTips: [
      'Start with pre-built workflow templates',
      'Use drag-and-drop to create custom workflows',
      'Monitor workflow performance in real-time'
    ],
    commonActions: [
      { label: 'Create New Workflow', action: () => {} },
      { label: 'Browse Templates', action: () => {} }
    ]
  },
  'modules': {
    module: 'modules',
    page: 'management',
    relevantArticles: ['module-management'],
    quickTips: [
      'Install modules without system downtime',
      'Check compatibility before installing',
      'Monitor module performance and dependencies'
    ],
    commonActions: [
      { label: 'Browse Available Modules', action: () => {} },
      { label: 'Install Recommended Modules', action: () => {} }
    ]
  },
  'marketplace': {
    module: 'marketplace',
    page: 'browse',
    relevantArticles: ['marketplace-guide'],
    quickTips: [
      'Filter templates by category and rating',
      'Preview templates before installation',
      'Rate templates to help others'
    ],
    commonActions: [
      { label: 'Browse Popular Templates', action: () => {} },
      { label: 'View Installation History', action: () => {} }
    ]
  },
  'handover': {
    module: 'handover',
    page: 'automation',
    relevantArticles: ['client-handover'],
    quickTips: [
      'Set up automated documentation generation',
      'Create client-specific handover packages',
      'Track handover completion status'
    ],
    commonActions: [
      { label: 'Start New Handover', action: () => {} },
      { label: 'View Handover Templates', action: () => {} }
    ]
  }
};

export function IntegratedHelpSystem({ isOpen, onClose, context, initialQuery = '' }: IntegratedHelpSystemProps) {
  const [activeTab, setActiveTab] = useState('search');
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);
  const [filteredArticles, setFilteredArticles] = useState(HELP_ARTICLES);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const contextualHelp = context ? CONTEXTUAL_HELP[`${context.module}`] : null;

  useEffect(() => {
    if (context && contextualHelp) {
      setActiveTab('contextual');
    }
  }, [context, contextualHelp]);

  useEffect(() => {
    let filtered = HELP_ARTICLES;

    if (searchQuery) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    setFilteredArticles(filtered);
  }, [searchQuery, selectedCategory]);

  const categories = Array.from(new Set(HELP_ARTICLES.map(article => article.category)));

  const handleArticleClick = (article: HelpArticle) => {
    setSelectedArticle(article);
  };

  const handleBackToList = () => {
    setSelectedArticle(null);
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800'
    };
    return colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      guide: <Book className="w-4 h-4" />,
      tutorial: <Video className="w-4 h-4" />,
      troubleshooting: <HelpCircle className="w-4 h-4" />,
      video: <Video className="w-4 h-4" />,
      faq: <MessageCircle className="w-4 h-4" />
    };
    return icons[type as keyof typeof icons] || <Book className="w-4 h-4" />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center space-x-2">
                <HelpCircle className="w-5 h-5 text-blue-600" />
                <span>Help Center</span>
                {context && (
                  <Badge variant="outline" className="ml-2">
                    {context.module} - {context.page}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Find answers, tutorials, and guides for your Agency Toolkit
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {selectedArticle ? (
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Button variant="ghost" size="sm" onClick={handleBackToList}>
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to Help
                </Button>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{selectedArticle.category}</span>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    {getTypeIcon(selectedArticle.type)}
                    <h1 className="text-2xl font-bold">{selectedArticle.title}</h1>
                  </div>
                  <p className="text-gray-600 mb-4">{selectedArticle.description}</p>

                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    <Badge className={getDifficultyColor(selectedArticle.difficulty)}>
                      {selectedArticle.difficulty}
                    </Badge>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-1" />
                      {selectedArticle.estimatedTime}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="w-4 h-4 mr-1" />
                      {selectedArticle.author}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="w-4 h-4 mr-1 text-yellow-500" />
                      {selectedArticle.rating} ({selectedArticle.views} views)
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {selectedArticle.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="prose max-w-none">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <p className="text-gray-700 leading-relaxed">
                      {selectedArticle.content}
                    </p>
                    <div className="mt-4 p-4 bg-blue-50 rounded border-l-4 border-blue-400">
                      <p className="text-sm text-blue-800">
                        This is a preview of the help article. The full content would include detailed
                        instructions, screenshots, code examples, and interactive elements to guide
                        users through the specific topic.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t">
                  <div className="text-sm text-gray-600">
                    Last updated: {selectedArticle.lastUpdated}
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Feedback
                    </Button>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 p-1 m-4">
                <TabsTrigger value="search" className="flex items-center space-x-1">
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </TabsTrigger>
                {contextualHelp && (
                  <TabsTrigger value="contextual" className="flex items-center space-x-1">
                    <HelpCircle className="w-4 h-4" />
                    <span>For This Page</span>
                  </TabsTrigger>
                )}
                <TabsTrigger value="browse" className="flex items-center space-x-1">
                  <Book className="w-4 h-4" />
                  <span>Browse</span>
                </TabsTrigger>
                <TabsTrigger value="contact" className="flex items-center space-x-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>Contact</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="search" className="p-6 pt-0">
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search help articles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={selectedCategory === null ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(null)}
                    >
                      All Categories
                    </Button>
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>

                  <div className="space-y-3">
                    {filteredArticles.map((article) => (
                      <Card
                        key={article.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleArticleClick(article)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                {getTypeIcon(article.type)}
                                <h3 className="font-semibold text-sm">{article.title}</h3>
                                <Badge className={getDifficultyColor(article.difficulty)} variant="secondary">
                                  {article.difficulty}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{article.description}</p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span className="flex items-center">
                                  <Star className="w-3 h-3 mr-1 text-yellow-500" />
                                  {article.rating}
                                </span>
                                <span>{article.views} views</span>
                                {article.estimatedTime && <span>{article.estimatedTime}</span>}
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400 ml-2" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {contextualHelp && (
                <TabsContent value="contextual" className="p-6 pt-0">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-3">Quick Tips for {contextualHelp.module}</h3>
                      <div className="space-y-2">
                        {contextualHelp.quickTips.map((tip, index) => (
                          <div key={index} className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-sm text-blue-800">{tip}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Common Actions</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {contextualHelp.commonActions.map((action, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            className="justify-start"
                            onClick={action.action}
                          >
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Related Articles</h3>
                      <div className="space-y-2">
                        {contextualHelp.relevantArticles.map((articleId) => {
                          const article = HELP_ARTICLES.find(a => a.id === articleId);
                          return article ? (
                            <Card
                              key={article.id}
                              className="cursor-pointer hover:shadow-md transition-shadow"
                              onClick={() => handleArticleClick(article)}
                            >
                              <CardContent className="p-3">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="font-medium text-sm">{article.title}</h4>
                                    <p className="text-xs text-gray-600">{article.description}</p>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-gray-400" />
                                </div>
                              </CardContent>
                            </Card>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              )}

              <TabsContent value="browse" className="p-6 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((category) => {
                    const categoryArticles = HELP_ARTICLES.filter(a => a.category === category);
                    return (
                      <Card key={category} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <h3 className="font-semibold mb-2">{category}</h3>
                          <p className="text-sm text-gray-600 mb-3">
                            {categoryArticles.length} article{categoryArticles.length !== 1 ? 's' : ''}
                          </p>
                          <div className="space-y-1">
                            {categoryArticles.slice(0, 3).map((article) => (
                              <div
                                key={article.id}
                                className="text-xs text-blue-600 hover:underline cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleArticleClick(article);
                                }}
                              >
                                {article.title}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="contact" className="p-6 pt-0">
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Need More Help?</h3>
                    <p className="text-gray-600">
                      Can't find what you're looking for? Get in touch with our support team.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <MessageCircle className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                        <h4 className="font-semibold mb-2">Live Chat</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          Chat with our support team in real-time
                        </p>
                        <Button size="sm" className="w-full">Start Chat</Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4 text-center">
                        <HelpCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
                        <h4 className="font-semibold mb-2">Submit Ticket</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          Send us a detailed message about your issue
                        </p>
                        <Button size="sm" variant="outline" className="w-full">Submit Ticket</Button>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Support Hours</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Monday - Friday: 9:00 AM - 6:00 PM EST</p>
                      <p>Saturday: 10:00 AM - 2:00 PM EST</p>
                      <p>Sunday: Closed</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}