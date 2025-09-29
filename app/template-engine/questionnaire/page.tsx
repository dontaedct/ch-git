/**
 * @fileoverview Questionnaire Builder Integration Interface
 * Advanced questionnaire builder with template system integration
 * HT-029.3.2 Implementation
 */
"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  Play,
  Settings,
  Copy,
  Download,
  Upload,
  ArrowUp,
  ArrowDown,
  Eye,
  Code,
  Zap,
  Target,
  Users,
  BarChart3,
  FileText,
  Palette,
  Layout,
  Database,
  Workflow,
  CheckCircle2,
  AlertCircle,
  Info
} from "lucide-react";

interface QuestionOption {
  id: string;
  text: string;
  value: string;
  isCorrect?: boolean;
  followUpQuestions?: string[];
  score?: number;
}

interface ConditionalLogic {
  id: string;
  condition: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: string;
  action: 'show_question' | 'hide_question' | 'jump_to_question' | 'end_survey';
  target?: string;
}

interface ValidationRule {
  type: 'required' | 'min_length' | 'max_length' | 'pattern' | 'min_value' | 'max_value';
  value?: string | number;
  message: string;
}

interface QuestionnaireQuestion {
  id: string;
  type: 'multiple_choice' | 'single_choice' | 'text' | 'textarea' | 'number' | 'email' | 'phone' | 'date' | 'rating' | 'matrix' | 'file_upload';
  category: string;
  title: string;
  description?: string;
  required: boolean;
  options?: QuestionOption[];
  validation?: ValidationRule[];
  conditionalLogic?: ConditionalLogic[];
  placeholder?: string;
  helpText?: string;
  order: number;
  scoring?: {
    enabled: boolean;
    maxScore: number;
    scoringType: 'points' | 'weighted' | 'percentage';
  };
  branching?: {
    enabled: boolean;
    rules: Array<{
      condition: string;
      nextQuestion: string;
    }>;
  };
}

interface QuestionnaireTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  questions: QuestionnaireQuestion[];
  settings: {
    allowBack: boolean;
    showProgress: boolean;
    randomizeQuestions: boolean;
    timeLimit?: number;
    passScore?: number;
    branding: {
      primaryColor: string;
      secondaryColor: string;
      logo?: string;
      customCSS?: string;
    };
    notifications: {
      emailOnComplete: boolean;
      webhook?: string;
    };
  };
  analytics: {
    completionRate: number;
    averageTime: number;
    dropOffPoints: string[];
    responses: number;
  };
}

export default function QuestionnaireBuilderIntegration() {
  const [activeTemplate, setActiveTemplate] = useState<QuestionnaireTemplate | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionnaireQuestion | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [currentTab, setCurrentTab] = useState("builder");

  const [templates] = useState<QuestionnaireTemplate[]>([
    {
      id: 'consultation-mvp',
      name: 'Business Consultation MVP',
      description: 'Comprehensive business assessment questionnaire for consultation services',
      category: 'Business',
      questions: [
        {
          id: 'contact-info',
          type: 'text',
          category: 'Contact',
          title: 'What is your full name?',
          description: 'We need your name to personalize your consultation',
          required: true,
          placeholder: 'Enter your full name',
          order: 1,
          validation: [
            { type: 'required', message: 'Name is required' },
            { type: 'min_length', value: 2, message: 'Name must be at least 2 characters' }
          ]
        },
        {
          id: 'business-stage',
          type: 'single_choice',
          category: 'Business',
          title: 'What stage is your business in?',
          description: 'Help us understand your business maturity level',
          required: true,
          order: 2,
          options: [
            { id: 'startup', text: 'Startup (0-2 years)', value: 'startup', score: 1 },
            { id: 'growth', text: 'Growth stage (2-5 years)', value: 'growth', score: 2 },
            { id: 'established', text: 'Established (5+ years)', value: 'established', score: 3 },
            { id: 'enterprise', text: 'Enterprise (large corporation)', value: 'enterprise', score: 4 }
          ],
          conditionalLogic: [
            {
              id: 'startup-followup',
              condition: 'equals',
              value: 'startup',
              action: 'show_question',
              target: 'startup-challenges'
            }
          ]
        },
        {
          id: 'revenue-range',
          type: 'single_choice',
          category: 'Financial',
          title: 'What is your annual revenue range?',
          description: 'This helps us tailor our recommendations to your scale',
          required: true,
          order: 3,
          options: [
            { id: 'pre-revenue', text: 'Pre-revenue', value: '0', score: 0 },
            { id: 'under-100k', text: 'Under $100K', value: '<100k', score: 1 },
            { id: '100k-500k', text: '$100K - $500K', value: '100k-500k', score: 2 },
            { id: '500k-1m', text: '$500K - $1M', value: '500k-1m', score: 3 },
            { id: '1m-5m', text: '$1M - $5M', value: '1m-5m', score: 4 },
            { id: '5m-plus', text: '$5M+', value: '5m+', score: 5 }
          ]
        }
      ],
      settings: {
        allowBack: true,
        showProgress: true,
        randomizeQuestions: false,
        branding: {
          primaryColor: '#3B82F6',
          secondaryColor: '#1E40AF'
        },
        notifications: {
          emailOnComplete: true
        }
      },
      analytics: {
        completionRate: 87,
        averageTime: 340,
        dropOffPoints: ['revenue-range'],
        responses: 1247
      }
    }
  ]);

  const questionTypes = [
    { id: 'text', label: 'Text Input', icon: <Edit className="h-4 w-4" />, description: 'Single line text input' },
    { id: 'textarea', label: 'Long Text', icon: <FileText className="h-4 w-4" />, description: 'Multi-line text input' },
    { id: 'single_choice', label: 'Single Choice', icon: <Target className="h-4 w-4" />, description: 'Radio buttons' },
    { id: 'multiple_choice', label: 'Multiple Choice', icon: <CheckCircle2 className="h-4 w-4" />, description: 'Checkboxes' },
    { id: 'number', label: 'Number', icon: <BarChart3 className="h-4 w-4" />, description: 'Numeric input' },
    { id: 'email', label: 'Email', icon: <Users className="h-4 w-4" />, description: 'Email address' },
    { id: 'rating', label: 'Rating Scale', icon: <Zap className="h-4 w-4" />, description: 'Star or numeric rating' },
    { id: 'matrix', label: 'Matrix/Grid', icon: <Layout className="h-4 w-4" />, description: 'Grid of options' },
    { id: 'file_upload', label: 'File Upload', icon: <Upload className="h-4 w-4" />, description: 'Document upload' }
  ];

  useEffect(() => {
    if (templates.length > 0) {
      setActiveTemplate(templates[0]);
    }
  }, [templates]);

  const handleSaveTemplate = () => {
    // Implement template saving logic
    console.log('Saving template:', activeTemplate);
  };

  const handlePreviewTemplate = () => {
    setPreviewMode(true);
  };

  const handleExportTemplate = () => {
    if (activeTemplate) {
      const dataStr = JSON.stringify(activeTemplate, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${activeTemplate.name.toLowerCase().replace(/\s+/g, '-')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const addNewQuestion = () => {
    if (!activeTemplate) return;

    const newQuestion: QuestionnaireQuestion = {
      id: `question-${Date.now()}`,
      type: 'text',
      category: 'General',
      title: 'New Question',
      description: '',
      required: false,
      order: activeTemplate.questions.length + 1
    };

    setActiveTemplate({
      ...activeTemplate,
      questions: [...activeTemplate.questions, newQuestion]
    });
    setSelectedQuestion(newQuestion);
    setIsEditing(true);
  };

  const duplicateQuestion = (question: QuestionnaireQuestion) => {
    if (!activeTemplate) return;

    const duplicated = {
      ...question,
      id: `question-${Date.now()}`,
      title: `${question.title} (Copy)`,
      order: activeTemplate.questions.length + 1
    };

    setActiveTemplate({
      ...activeTemplate,
      questions: [...activeTemplate.questions, duplicated]
    });
  };

  const deleteQuestion = (questionId: string) => {
    if (!activeTemplate) return;

    setActiveTemplate({
      ...activeTemplate,
      questions: activeTemplate.questions.filter(q => q.id !== questionId)
    });

    if (selectedQuestion?.id === questionId) {
      setSelectedQuestion(null);
      setIsEditing(false);
    }
  };

  const moveQuestion = (questionId: string, direction: 'up' | 'down') => {
    if (!activeTemplate) return;

    const questions = [...activeTemplate.questions];
    const index = questions.findIndex(q => q.id === questionId);

    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= questions.length) return;

    [questions[index], questions[newIndex]] = [questions[newIndex], questions[index]];

    // Update order numbers
    questions.forEach((q, i) => q.order = i + 1);

    setActiveTemplate({
      ...activeTemplate,
      questions
    });
  };

  const renderQuestionEditor = () => {
    if (!selectedQuestion || !isEditing) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Edit Question</span>
            <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
              Done
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Question Title</label>
            <input
              type="text"
              value={selectedQuestion.title}
              onChange={(e) => setSelectedQuestion({
                ...selectedQuestion,
                title: e.target.value
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description (Optional)</label>
            <textarea
              value={selectedQuestion.description || ''}
              onChange={(e) => setSelectedQuestion({
                ...selectedQuestion,
                description: e.target.value
              })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Question Type</label>
            <select
              value={selectedQuestion.type}
              onChange={(e) => setSelectedQuestion({
                ...selectedQuestion,
                type: e.target.value as any
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {questionTypes.map(type => (
                <option key={type.id} value={type.id}>{type.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={selectedQuestion.required}
              onCheckedChange={(checked) => setSelectedQuestion({
                ...selectedQuestion,
                required: checked
              })}
            />
            <label className="text-sm font-medium">Required</label>
          </div>

          {(selectedQuestion.type === 'single_choice' || selectedQuestion.type === 'multiple_choice') && (
            <div>
              <label className="block text-sm font-medium mb-2">Options</label>
              <div className="space-y-2">
                {selectedQuestion.options?.map((option, index) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) => {
                        const newOptions = [...(selectedQuestion.options || [])];
                        newOptions[index].text = e.target.value;
                        setSelectedQuestion({
                          ...selectedQuestion,
                          options: newOptions
                        });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newOptions = selectedQuestion.options?.filter(o => o.id !== option.id) || [];
                        setSelectedQuestion({
                          ...selectedQuestion,
                          options: newOptions
                        });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newOption = {
                      id: `option-${Date.now()}`,
                      text: 'New Option',
                      value: `option-${Date.now()}`
                    };
                    setSelectedQuestion({
                      ...selectedQuestion,
                      options: [...(selectedQuestion.options || []), newOption]
                    });
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (previewMode) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Questionnaire Preview</h1>
            <div className="space-x-4">
              <Button variant="outline" onClick={() => setPreviewMode(false)}>
                Exit Preview
              </Button>
              <Link href="/template-engine/mvp/questionnaire">
                <Button>Test Live Version</Button>
              </Link>
            </div>
          </div>

          <Card>
            <CardContent className="p-8">
              <h2 className="text-xl font-bold mb-4">{activeTemplate?.name}</h2>
              <p className="text-gray-600 mb-8">{activeTemplate?.description}</p>

              <div className="space-y-6">
                {activeTemplate?.questions.map((question, index) => (
                  <div key={question.id} className="border-b pb-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-gray-500">Q{index + 1}</span>
                      {question.required && <span className="text-red-500">*</span>}
                    </div>
                    <h3 className="font-medium text-gray-900 mb-2">{question.title}</h3>
                    {question.description && (
                      <p className="text-sm text-gray-600 mb-4">{question.description}</p>
                    )}

                    {question.type === 'text' && (
                      <input
                        type="text"
                        placeholder={question.placeholder}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        disabled
                      />
                    )}

                    {question.type === 'textarea' && (
                      <textarea
                        placeholder={question.placeholder}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        disabled
                      />
                    )}

                    {(question.type === 'single_choice' || question.type === 'multiple_choice') && (
                      <div className="space-y-2">
                        {question.options?.map((option) => (
                          <div key={option.id} className="flex items-center space-x-2">
                            <input
                              type={question.type === 'single_choice' ? 'radio' : 'checkbox'}
                              name={question.id}
                              disabled
                            />
                            <span>{option.text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Questionnaire Builder Integration</h1>
              <p className="text-gray-600 mt-1">
                Build and customize questionnaires for your consultation templates
              </p>
            </div>
            <div className="flex space-x-4">
              <Button variant="outline" onClick={handlePreviewTemplate}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button variant="outline" onClick={handleExportTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={handleSaveTemplate}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Link href="/template-engine">
                <Button variant="outline">Back to Engine</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="builder">Builder</TabsTrigger>
            <TabsTrigger value="logic">Logic & Flow</TabsTrigger>
            <TabsTrigger value="styling">Styling</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="builder" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Question List */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Questions</h2>
                  <Button onClick={addNewQuestion}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </Button>
                </div>

                <div className="space-y-3">
                  {activeTemplate?.questions.map((question, index) => (
                    <motion.div
                      key={question.id}
                      layout
                      className={`p-4 bg-white rounded-lg border-2 cursor-pointer transition-all ${
                        selectedQuestion?.id === question.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => {
                        setSelectedQuestion(question);
                        setIsEditing(true);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-xs font-medium text-gray-500">Q{index + 1}</span>
                            <Badge variant="outline" className="text-xs">
                              {questionTypes.find(t => t.id === question.type)?.label}
                            </Badge>
                            {question.required && (
                              <Badge variant="secondary" className="text-xs">Required</Badge>
                            )}
                          </div>
                          <h3 className="font-medium text-gray-900 mb-1">{question.title}</h3>
                          {question.description && (
                            <p className="text-sm text-gray-600">{question.description}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveQuestion(question.id, 'up');
                            }}
                            disabled={index === 0}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveQuestion(question.id, 'down');
                            }}
                            disabled={index === activeTemplate.questions.length - 1}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              duplicateQuestion(question);
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteQuestion(question.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Question Editor */}
              <div className="space-y-4">
                {selectedQuestion && isEditing ? (
                  renderQuestionEditor()
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <div className="mb-4">
                        <Edit className="h-12 w-12 text-gray-400 mx-auto" />
                      </div>
                      <h3 className="font-medium text-gray-900 mb-2">Select a Question</h3>
                      <p className="text-sm text-gray-600">
                        Click on a question to edit its properties, or add a new question to get started.
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Question Types */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Question Types</CardTitle>
                    <CardDescription>
                      Available question types for your questionnaire
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {questionTypes.map((type) => (
                        <div
                          key={type.id}
                          className="p-2 border rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            if (selectedQuestion) {
                              setSelectedQuestion({
                                ...selectedQuestion,
                                type: type.id as any
                              });
                            }
                          }}
                        >
                          <div className="flex items-center space-x-2">
                            {type.icon}
                            <span className="text-sm font-medium">{type.label}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="logic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Conditional Logic & Branching</CardTitle>
                <CardDescription>
                  Set up question flow and conditional logic for dynamic questionnaires
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Workflow className="h-5 w-5 text-blue-600" />
                      <div>
                        <h3 className="font-medium text-blue-900">Smart Branching</h3>
                        <p className="text-sm text-blue-700">
                          Questions adapt based on previous answers
                        </p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-4">Logic Rules</h3>
                      <div className="space-y-3">
                        <div className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">If Business Stage = "Startup"</span>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-sm text-gray-600">→ Show startup-specific questions</p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">If Revenue &gt; $1M</span>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-sm text-gray-600">→ Jump to enterprise section</p>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full mt-4">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Logic Rule
                      </Button>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-4">Flow Visualization</h3>
                      <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                        <Workflow className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Visual flow chart coming soon</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="styling" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Theme Settings</CardTitle>
                  <CardDescription>
                    Customize the look and feel of your questionnaire
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Primary Color</label>
                    <input
                      type="color"
                      value={activeTemplate?.settings.branding.primaryColor}
                      className="w-full h-10 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Secondary Color</label>
                    <input
                      type="color"
                      value={activeTemplate?.settings.branding.secondaryColor}
                      className="w-full h-10 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch defaultChecked />
                    <label className="text-sm font-medium">Show Progress Bar</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch defaultChecked />
                    <label className="text-sm font-medium">Allow Going Back</label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>
                    See how your questionnaire will look
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="mb-4">
                      <div className="h-2 bg-blue-600 rounded-full" style={{ width: '30%' }}></div>
                      <p className="text-xs text-gray-600 mt-1">Question 1 of 3</p>
                    </div>
                    <h3 className="font-medium mb-2">Sample Question</h3>
                    <p className="text-sm text-gray-600 mb-4">This is how your question will appear</p>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input type="radio" />
                        <span className="text-sm">Option 1</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="radio" />
                        <span className="text-sm">Option 2</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Completion Rate</p>
                      <p className="text-2xl font-bold text-green-600">
                        {activeTemplate?.analytics.completionRate}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Responses</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {activeTemplate?.analytics.responses.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Avg. Time</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {Math.floor((activeTemplate?.analytics.averageTime || 0) / 60)}m
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
                <CardDescription>
                  Understand how users interact with your questionnaire
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="font-medium text-red-900">High Drop-off Point</p>
                        <p className="text-sm text-red-700">Revenue Range question has 23% drop-off</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Optimize
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900">Well Performing</p>
                        <p className="text-sm text-green-700">Contact info section has 96% completion</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Optimized</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Info className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-900">Integration Ready</p>
                        <p className="text-sm text-blue-700">Template is ready for PDF generation</p>
                      </div>
                    </div>
                    <Link href="/template-engine/pdf">
                      <Button variant="outline" size="sm">
                        Setup PDF
                      </Button>
                    </Link>
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