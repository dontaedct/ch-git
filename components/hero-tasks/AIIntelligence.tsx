/**
 * AI Task Intelligence Components
 * HT-004.4.1: React components for smart suggestions, dependency detection, and priority scoring
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
  Brain, 
  Lightbulb, 
  Link, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Sparkles,
  Target,
  Zap
} from 'lucide-react';
import { TaskPriority, TaskType } from '@/types/hero-tasks';

// ============================================================================
// INTERFACES
// ============================================================================

interface TaskSuggestion {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  type: TaskType;
  estimated_duration_hours: number;
  suggested_tags: string[];
  confidence_score: number;
  reasoning: string;
  similar_tasks: string[];
}

interface DependencySuggestion {
  task_id: string;
  depends_on_task_id: string;
  dependency_type: 'blocks' | 'relates_to' | 'conflicts_with';
  confidence_score: number;
  reasoning: string;
  evidence: string[];
}

interface PrioritySuggestion {
  task_id: string;
  suggested_priority: TaskPriority;
  confidence_score: number;
  reasoning: string;
  factors: PriorityFactor[];
}

interface PriorityFactor {
  factor: string;
  weight: number;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

// ============================================================================
// AI SUGGESTIONS COMPONENT
// ============================================================================

export function AITaskSuggestions() {
  const [context, setContext] = useState('');
  const [suggestions, setSuggestions] = useState<TaskSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSuggestions = async () => {
    if (!context.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/hero-tasks/ai-intelligence/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context })
      });

      const data = await response.json();

      if (data.ok) {
        setSuggestions(data.data.suggestions);
      } else {
        setError(data.error || 'Failed to generate suggestions');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const applySuggestion = (suggestion: TaskSuggestion) => {
    // This would integrate with the task creation form
    console.log('Applying suggestion:', suggestion);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-500" />
          AI Task Suggestions
        </CardTitle>
        <CardDescription>
          Get intelligent task suggestions based on your context and existing patterns
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Describe what you want to work on:</label>
          <Textarea
            placeholder="e.g., Fix login issues on mobile app, implement user authentication, create API documentation..."
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={3}
          />
        </div>

        <Button 
          onClick={generateSuggestions} 
          disabled={loading || !context.trim()}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Suggestions...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate AI Suggestions
            </>
          )}
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {suggestions.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">
              {suggestions.length} suggestions found
            </h4>
            {suggestions.map((suggestion) => (
              <TaskSuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                onApply={() => applySuggestion(suggestion)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// TASK SUGGESTION CARD
// ============================================================================

function TaskSuggestionCard({ 
  suggestion, 
  onApply 
}: { 
  suggestion: TaskSuggestion; 
  onApply: () => void;
}) {
  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.CRITICAL: return 'bg-red-100 text-red-800';
      case TaskPriority.HIGH: return 'bg-orange-100 text-orange-800';
      case TaskPriority.MEDIUM: return 'bg-yellow-100 text-yellow-800';
      case TaskPriority.LOW: return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{suggestion.title}</h4>
              <Badge className={getPriorityColor(suggestion.priority)}>
                {suggestion.priority}
              </Badge>
              <Badge variant="outline">{suggestion.type}</Badge>
            </div>
            
            <p className="text-sm text-muted-foreground">{suggestion.description}</p>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {suggestion.estimated_duration_hours}h
              </div>
              <div className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                {Math.round(suggestion.confidence_score * 100)}% confidence
              </div>
            </div>

            {suggestion.suggested_tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {suggestion.suggested_tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <p className="text-xs text-muted-foreground italic">
              {suggestion.reasoning}
            </p>
          </div>

          <Button size="sm" onClick={onApply} className="ml-4">
            <CheckCircle className="h-4 w-4 mr-1" />
            Apply
          </Button>
        </div>

        <div className="mt-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Confidence:</span>
            <Progress 
              value={suggestion.confidence_score * 100} 
              className="flex-1 h-2"
            />
            <span>{Math.round(suggestion.confidence_score * 100)}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// DEPENDENCY DETECTION COMPONENT
// ============================================================================

export function AIDependencyDetection({ taskId }: { taskId: string }) {
  const [dependencies, setDependencies] = useState<DependencySuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detectDependencies = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/hero-tasks/ai-intelligence/dependencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: taskId })
      });

      const data = await response.json();

      if (data.ok) {
        setDependencies(data.data.dependencies);
      } else {
        setError(data.error || 'Failed to detect dependencies');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getDependencyTypeColor = (type: string) => {
    switch (type) {
      case 'blocks': return 'bg-red-100 text-red-800';
      case 'relates_to': return 'bg-blue-100 text-blue-800';
      case 'conflicts_with': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="h-5 w-5 text-green-500" />
          AI Dependency Detection
        </CardTitle>
        <CardDescription>
          Automatically detect relationships between tasks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={detectDependencies} 
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing Dependencies...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              Detect Dependencies
            </>
          )}
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {dependencies.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">
              {dependencies.length} dependencies detected
            </h4>
            {dependencies.map((dep, index) => (
              <Card key={index} className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className={getDependencyTypeColor(dep.dependency_type)}>
                          {dep.dependency_type.replace('_', ' ')}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Task {dep.depends_on_task_id.slice(0, 8)}...
                        </span>
                      </div>
                      
                      <p className="text-sm">{dep.reasoning}</p>
                      
                      {dep.evidence.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          <span className="font-medium">Evidence:</span> {dep.evidence.join(', ')}
                        </div>
                      )}
                    </div>

                    <div className="ml-4 text-right">
                      <div className="text-sm font-medium">
                        {Math.round(dep.confidence_score * 100)}%
                      </div>
                      <div className="text-xs text-muted-foreground">confidence</div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <Progress 
                      value={dep.confidence_score * 100} 
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// PRIORITY SUGGESTION COMPONENT
// ============================================================================

export function AIPrioritySuggestion({ taskId }: { taskId: string }) {
  const [suggestion, setSuggestion] = useState<PrioritySuggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suggestPriority = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/hero-tasks/ai-intelligence/priority', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: taskId })
      });

      const data = await response.json();

      if (data.ok) {
        setSuggestion(data.data.priority_suggestion);
      } else {
        setError(data.error || 'Failed to suggest priority');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.CRITICAL: return 'bg-red-100 text-red-800';
      case TaskPriority.HIGH: return 'bg-orange-100 text-orange-800';
      case TaskPriority.MEDIUM: return 'bg-yellow-100 text-yellow-800';
      case TaskPriority.LOW: return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'positive': return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'negative': return <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />;
      default: return <div className="h-3 w-3 rounded-full bg-gray-300" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-purple-500" />
          AI Priority Suggestion
        </CardTitle>
        <CardDescription>
          Get intelligent priority recommendations based on task analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={suggestPriority} 
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing Priority...
            </>
          ) : (
            <>
              <Lightbulb className="mr-2 h-4 w-4" />
              Suggest Priority
            </>
          )}
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {suggestion && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <div className="text-sm font-medium">Suggested Priority</div>
                <Badge className={`${getPriorityColor(suggestion.suggested_priority)} mt-1`}>
                  {suggestion.suggested_priority}
                </Badge>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  {Math.round(suggestion.confidence_score * 100)}%
                </div>
                <div className="text-xs text-muted-foreground">confidence</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Reasoning</h4>
              <p className="text-sm text-muted-foreground">{suggestion.reasoning}</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Priority Factors</h4>
              <div className="space-y-2">
                {suggestion.factors.map((factor, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div className="flex items-center gap-2">
                      {getImpactIcon(factor.impact)}
                      <span className="text-sm">{factor.description}</span>
                    </div>
                    <div className="text-sm font-medium">
                      {Math.round(factor.weight * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Overall Confidence</span>
                <span>{Math.round(suggestion.confidence_score * 100)}%</span>
              </div>
              <Progress 
                value={suggestion.confidence_score * 100} 
                className="h-2"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// AI INTELLIGENCE DASHBOARD
// ============================================================================

export function AIIntelligenceDashboard({ taskId }: { taskId?: string }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AITaskSuggestions />
        {taskId && (
          <>
            <AIDependencyDetection taskId={taskId} />
            <AIPrioritySuggestion taskId={taskId} />
          </>
        )}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-500" />
            AI Intelligence Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center space-y-2">
              <Lightbulb className="h-8 w-8 mx-auto text-yellow-500" />
              <h3 className="font-medium">Smart Suggestions</h3>
              <p className="text-sm text-muted-foreground">
                AI-powered task recommendations based on patterns and context
              </p>
            </div>
            <div className="text-center space-y-2">
              <Link className="h-8 w-8 mx-auto text-green-500" />
              <h3 className="font-medium">Dependency Detection</h3>
              <p className="text-sm text-muted-foreground">
                Automatically identify relationships between tasks
              </p>
            </div>
            <div className="text-center space-y-2">
              <TrendingUp className="h-8 w-8 mx-auto text-purple-500" />
              <h3 className="font-medium">Priority Scoring</h3>
              <p className="text-sm text-muted-foreground">
                Intelligent priority recommendations based on multiple factors
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
