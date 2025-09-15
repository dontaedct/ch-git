/**
 * Natural Language Processing Components
 * HT-004.4.2: React components for natural language task creation and content parsing
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MessageSquare, 
  Brain, 
  Zap, 
  Calendar,
  User,
  Tag,
  Clock,
  Target,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  FileText,
  Users,
  Link,
  Mail
} from 'lucide-react';
import { TaskPriority, TaskType } from '@/types/hero-tasks';

// ============================================================================
// INTERFACES
// ============================================================================

interface NLPParseResult {
  intent: TaskIntent;
  entities: ExtractedEntity[];
  confidence: number;
  suggestions: TaskSuggestion[];
  parsed_task: ParsedTaskData;
}

interface TaskIntent {
  action: 'create' | 'update' | 'search' | 'delete' | 'assign' | 'schedule' | 'prioritize';
  confidence: number;
  reasoning: string;
}

interface ExtractedEntity {
  type: EntityType;
  value: string;
  confidence: number;
  position: { start: number; end: number };
  metadata?: Record<string, any>;
}

interface ParsedTaskData {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  type?: TaskType;
  due_date?: string;
  assignee?: string;
  tags?: string[];
  estimated_hours?: number;
  metadata?: Record<string, any>;
}

interface TaskSuggestion {
  field: string;
  value: any;
  confidence: number;
  reasoning: string;
}

enum EntityType {
  DATE = 'date',
  TIME = 'time',
  PERSON = 'person',
  PRIORITY = 'priority',
  TASK_TYPE = 'task_type',
  TAG = 'tag',
  DURATION = 'duration',
  PROJECT = 'project',
  LOCATION = 'location',
  URL = 'url',
  EMAIL = 'email',
  PHONE = 'phone'
}

// ============================================================================
// NATURAL LANGUAGE TASK CREATOR COMPONENT
// ============================================================================

export function NaturalLanguageTaskCreator() {
  const [input, setInput] = useState('');
  const [parseResult, setParseResult] = useState<NLPParseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdTask, setCreatedTask] = useState<any>(null);

  const parseInput = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/hero-tasks/nlp/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input })
      });

      const data = await response.json();

      if (data.ok) {
        setParseResult(data.data.parse_result);
      } else {
        setError(data.error || 'Failed to parse input');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/hero-tasks/nlp/create-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input })
      });

      const data = await response.json();

      if (data.ok) {
        setCreatedTask(data.data.task);
        setParseResult(data.data.parse_result);
        setInput(''); // Clear input after successful creation
      } else {
        setError(data.error || 'Failed to create task');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getEntityIcon = (type: EntityType) => {
    switch (type) {
      case EntityType.DATE:
        return <Calendar className="h-3 w-3" />;
      case EntityType.PERSON:
        return <User className="h-3 w-3" />;
      case EntityType.PRIORITY:
        return <Target className="h-3 w-3" />;
      case EntityType.TASK_TYPE:
        return <FileText className="h-3 w-3" />;
      case EntityType.TAG:
        return <Tag className="h-3 w-3" />;
      case EntityType.DURATION:
        return <Clock className="h-3 w-3" />;
      case EntityType.URL:
        return <Link className="h-3 w-3" />;
      case EntityType.EMAIL:
        return <Mail className="h-3 w-3" />;
      default:
        return <Zap className="h-3 w-3" />;
    }
  };

  const getEntityColor = (type: EntityType) => {
    switch (type) {
      case EntityType.DATE:
        return 'bg-blue-100 text-blue-800';
      case EntityType.PERSON:
        return 'bg-green-100 text-green-800';
      case EntityType.PRIORITY:
        return 'bg-red-100 text-red-800';
      case EntityType.TASK_TYPE:
        return 'bg-purple-100 text-purple-800';
      case EntityType.TAG:
        return 'bg-yellow-100 text-yellow-800';
      case EntityType.DURATION:
        return 'bg-orange-100 text-orange-800';
      case EntityType.URL:
        return 'bg-indigo-100 text-indigo-800';
      case EntityType.EMAIL:
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-500" />
            Natural Language Task Creator
          </CardTitle>
          <CardDescription>
            Describe your task in natural language and let AI parse it into structured data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Describe your task:</label>
            <Textarea
              placeholder="e.g., 'Create a high priority bug fix for the login issue due tomorrow and assign it to John Smith'"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={parseInput} 
              disabled={loading || !input.trim()}
              variant="outline"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Parsing...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Parse
                </>
              )}
            </Button>

            <Button 
              onClick={createTask} 
              disabled={loading || !input.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Create Task
                </>
              )}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {createdTask && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Task created successfully! Task ID: {createdTask.id}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {parseResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Parsed Task Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-500" />
                Parsed Task Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {parseResult.parsed_task.title && (
                <div>
                  <label className="text-sm font-medium">Title:</label>
                  <p className="text-sm text-muted-foreground">{parseResult.parsed_task.title}</p>
                </div>
              )}

              {parseResult.parsed_task.description && (
                <div>
                  <label className="text-sm font-medium">Description:</label>
                  <p className="text-sm text-muted-foreground">{parseResult.parsed_task.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {parseResult.parsed_task.priority && (
                  <div>
                    <label className="text-sm font-medium">Priority:</label>
                    <Badge className="mt-1">{parseResult.parsed_task.priority}</Badge>
                  </div>
                )}

                {parseResult.parsed_task.type && (
                  <div>
                    <label className="text-sm font-medium">Type:</label>
                    <Badge variant="outline" className="mt-1">{parseResult.parsed_task.type}</Badge>
                  </div>
                )}

                {parseResult.parsed_task.due_date && (
                  <div>
                    <label className="text-sm font-medium">Due Date:</label>
                    <p className="text-sm text-muted-foreground">{parseResult.parsed_task.due_date}</p>
                  </div>
                )}

                {parseResult.parsed_task.assignee && (
                  <div>
                    <label className="text-sm font-medium">Assignee:</label>
                    <p className="text-sm text-muted-foreground">{parseResult.parsed_task.assignee}</p>
                  </div>
                )}

                {parseResult.parsed_task.estimated_hours && (
                  <div>
                    <label className="text-sm font-medium">Estimated Hours:</label>
                    <p className="text-sm text-muted-foreground">{parseResult.parsed_task.estimated_hours}h</p>
                  </div>
                )}
              </div>

              {parseResult.parsed_task.tags && parseResult.parsed_task.tags.length > 0 && (
                <div>
                  <label className="text-sm font-medium">Tags:</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {parseResult.parsed_task.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Extracted Entities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-500" />
                Extracted Entities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {parseResult.entities.length > 0 ? (
                <div className="space-y-2">
                  {parseResult.entities.map((entity, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div className="flex items-center gap-2">
                        {getEntityIcon(entity.type)}
                        <span className="text-sm font-medium">{entity.value}</span>
                        <Badge className={`${getEntityColor(entity.type)} text-xs`}>
                          {entity.type}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {Math.round(entity.confidence * 100)}%
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No entities detected</p>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Overall Confidence</span>
                  <span>{Math.round(parseResult.confidence * 100)}%</span>
                </div>
                <Progress value={parseResult.confidence * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Intent Recognition */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-orange-500" />
                Intent Recognition
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Detected Intent</div>
                  <Badge className="mt-1">{parseResult.intent.action}</Badge>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {Math.round(parseResult.intent.confidence * 100)}%
                  </div>
                  <div className="text-xs text-muted-foreground">confidence</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Intent Confidence</span>
                  <span>{Math.round(parseResult.intent.confidence * 100)}%</span>
                </div>
                <Progress value={parseResult.intent.confidence * 100} className="h-2" />
              </div>

              <p className="text-sm text-muted-foreground italic">
                {parseResult.intent.reasoning}
              </p>
            </CardContent>
          </Card>

          {/* AI Suggestions */}
          {parseResult.suggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                  AI Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {parseResult.suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div className="flex-1">
                      <div className="text-sm font-medium">{suggestion.field}</div>
                      <div className="text-xs text-muted-foreground">{suggestion.reasoning}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {typeof suggestion.value === 'string' ? suggestion.value : JSON.stringify(suggestion.value)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {Math.round(suggestion.confidence * 100)}%
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// NLP DASHBOARD COMPONENT
// ============================================================================

export function NLPDashboard() {
  return (
    <div className="space-y-6">
      <NaturalLanguageTaskCreator />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-500" />
            Natural Language Processing Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center space-y-2">
              <MessageSquare className="h-8 w-8 mx-auto text-blue-500" />
              <h3 className="font-medium">Natural Language Input</h3>
              <p className="text-sm text-muted-foreground">
                Describe tasks in plain English and let AI parse them into structured data
              </p>
            </div>
            <div className="text-center space-y-2">
              <Zap className="h-8 w-8 mx-auto text-purple-500" />
              <h3 className="font-medium">Entity Extraction</h3>
              <p className="text-sm text-muted-foreground">
                Automatically extract dates, people, priorities, tags, and more from text
              </p>
            </div>
            <div className="text-center space-y-2">
              <Brain className="h-8 w-8 mx-auto text-orange-500" />
              <h3 className="font-medium">Intent Recognition</h3>
              <p className="text-sm text-muted-foreground">
                Understand user intent and suggest appropriate actions and task properties
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
