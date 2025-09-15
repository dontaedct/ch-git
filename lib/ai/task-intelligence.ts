/**
 * AI Task Intelligence System
 * HT-004.4.1: Smart task suggestions, auto-dependency detection, and intelligent prioritization
 * 
 * This module provides AI-powered intelligence for the Hero Tasks system including:
 * - Smart task creation suggestions based on patterns
 * - Automatic dependency detection from task descriptions
 * - Intelligent priority scoring using historical data
 * - Task similarity analysis and recommendations
 */

import { HeroTask, TaskPriority, TaskType, TaskStatus, WorkflowPhase } from '../../types/hero-tasks';
import { createRealSupabaseClient } from '../supabase/server';

// ============================================================================
// AI TASK INTELLIGENCE INTERFACES
// ============================================================================

export interface TaskSuggestion {
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

export interface DependencySuggestion {
  task_id: string;
  depends_on_task_id: string;
  dependency_type: 'blocks' | 'relates_to' | 'conflicts_with';
  confidence_score: number;
  reasoning: string;
  evidence: string[];
}

export interface PrioritySuggestion {
  task_id: string;
  suggested_priority: TaskPriority;
  confidence_score: number;
  reasoning: string;
  factors: PriorityFactor[];
}

export interface PriorityFactor {
  factor: string;
  weight: number;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

export interface TaskPattern {
  pattern_type: 'title' | 'description' | 'tags' | 'workflow';
  pattern: string;
  frequency: number;
  success_rate: number;
  avg_duration_hours: number;
  common_outcomes: string[];
}

export interface TaskIntelligenceConfig {
  enable_suggestions: boolean;
  enable_dependency_detection: boolean;
  enable_priority_scoring: boolean;
  min_confidence_threshold: number;
  max_suggestions_per_task: number;
  learning_enabled: boolean;
}

// ============================================================================
// AI TASK INTELLIGENCE ENGINE
// ============================================================================

export class TaskIntelligenceEngine {
  private supabase: any;
  private config: TaskIntelligenceConfig;

  constructor(config: Partial<TaskIntelligenceConfig> = {}) {
    this.config = {
      enable_suggestions: true,
      enable_dependency_detection: true,
      enable_priority_scoring: true,
      min_confidence_threshold: 0.7,
      max_suggestions_per_task: 5,
      learning_enabled: true,
      ...config
    };
    this.supabase = createRealSupabaseClient();
  }

  /**
   * Generate smart task suggestions based on existing patterns
   */
  async generateTaskSuggestions(
    context: string,
    userPreferences?: {
      preferred_types?: TaskType[];
      preferred_priorities?: TaskPriority[];
      recent_tags?: string[];
    }
  ): Promise<TaskSuggestion[]> {
    try {
      // Get similar tasks from database
      const similarTasks = await this.findSimilarTasks(context);
      
      // Analyze patterns in existing tasks
      const patterns = await this.analyzeTaskPatterns();
      
      // Generate suggestions based on patterns and context
      const suggestions = await this.createSuggestionsFromPatterns(
        context,
        similarTasks,
        patterns,
        userPreferences
      );

      return suggestions
        .filter(s => s.confidence_score >= this.config.min_confidence_threshold)
        .slice(0, this.config.max_suggestions_per_task);
    } catch (error) {
      console.error('Error generating task suggestions:', error);
      return [];
    }
  }

  /**
   * Detect dependencies between tasks automatically
   */
  async detectDependencies(taskId: string): Promise<DependencySuggestion[]> {
    try {
      const task = await this.getTaskById(taskId);
      if (!task) return [];

      // Get all other tasks for comparison
      const allTasks = await this.getAllTasks();
      
      // Analyze task content for dependency indicators
      const dependencies: DependencySuggestion[] = [];

      for (const otherTask of allTasks) {
        if (otherTask.id === taskId) continue;

        const dependency = await this.analyzeTaskDependency(task, otherTask);
        if (dependency && dependency.confidence_score >= this.config.min_confidence_threshold) {
          dependencies.push(dependency);
        }
      }

      return dependencies.sort((a, b) => b.confidence_score - a.confidence_score);
    } catch (error) {
      console.error('Error detecting dependencies:', error);
      return [];
    }
  }

  /**
   * Suggest intelligent priority scoring
   */
  async suggestPriority(taskId: string): Promise<PrioritySuggestion | null> {
    try {
      const task = await this.getTaskById(taskId);
      if (!task) return null;

      // Analyze factors that influence priority
      const factors = await this.analyzePriorityFactors(task);
      
      // Calculate priority score based on factors
      const priorityScore = this.calculatePriorityScore(factors);
      
      // Determine suggested priority
      const suggestedPriority = this.mapScoreToPriority(priorityScore);
      
      return {
        task_id: taskId,
        suggested_priority: suggestedPriority,
        confidence_score: this.calculateConfidenceScore(factors),
        reasoning: this.generatePriorityReasoning(factors),
        factors
      };
    } catch (error) {
      console.error('Error suggesting priority:', error);
      return null;
    }
  }

  /**
   * Learn from task completion patterns
   */
  async learnFromTaskCompletion(taskId: string): Promise<void> {
    if (!this.config.learning_enabled) return;

    try {
      const task = await this.getTaskById(taskId);
      if (!task || task.status !== TaskStatus.COMPLETED) return;

      // Update pattern learning based on successful completion
      await this.updatePatternLearning(task);
      
      // Update priority factor weights based on actual vs predicted
      await this.updatePriorityWeights(task);
    } catch (error) {
      console.error('Error learning from task completion:', error);
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private async findSimilarTasks(context: string): Promise<HeroTask[]> {
    const supabase = await this.supabase;
    const { data, error } = await supabase
      .from('hero_tasks')
      .select('*')
      .or(`title.ilike.%${context}%,description.ilike.%${context}%`)
      .limit(10);

    if (error) throw error;
    return data || [];
  }

  private async analyzeTaskPatterns(): Promise<TaskPattern[]> {
    const supabase = await this.supabase;
    const { data, error } = await supabase
      .from('hero_tasks')
      .select('title, description, tags, type, priority, estimated_duration_hours, actual_duration_hours, status');

    if (error) throw error;

    // Analyze patterns in task data
    const patterns: TaskPattern[] = [];
    
    // Title patterns
    const titleWords = data?.flatMap((task: HeroTask) =>
      task.title.toLowerCase().split(/\s+/).filter((word: string) => word.length > 3)
    ) || [];

    const titleWordCounts = titleWords.reduce((acc: Record<string, number>, word: string) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Extract common patterns
    Object.entries(titleWordCounts).forEach(([word, count]) => {
      if (typeof count === 'number' && count >= 3) {
        patterns.push({
          pattern_type: 'title',
          pattern: word,
          frequency: count,
          success_rate: 0.8, // Placeholder - would calculate from actual data
          avg_duration_hours: 4, // Placeholder
          common_outcomes: ['completed', 'in_progress']
        });
      }
    });

    return patterns;
  }

  private async createSuggestionsFromPatterns(
    context: string,
    similarTasks: HeroTask[],
    patterns: TaskPattern[],
    userPreferences?: any
  ): Promise<TaskSuggestion[]> {
    const suggestions: TaskSuggestion[] = [];

    // Create suggestions based on similar tasks
    similarTasks.forEach(task => {
      suggestions.push({
        id: `suggestion-${Date.now()}-${Math.random()}`,
        title: this.generateSuggestionTitle(context, task.title),
        description: this.generateSuggestionDescription(task.description || ''),
        priority: task.priority,
        type: task.type,
        estimated_duration_hours: task.estimated_duration_hours || 4,
        suggested_tags: task.tags.slice(0, 3),
        confidence_score: this.calculateSuggestionConfidence(task, context),
        reasoning: `Based on similar task: ${task.title}`,
        similar_tasks: [task.id]
      });
    });

    return suggestions;
  }

  private async analyzeTaskDependency(
    task: HeroTask,
    otherTask: HeroTask
  ): Promise<DependencySuggestion | null> {
    // Analyze text similarity and keyword matching
    const similarity = this.calculateTextSimilarity(task.description || '', otherTask.description || '');
    
    // Look for dependency keywords
    const dependencyKeywords = this.extractDependencyKeywords(task.description || '');
    
    // Check if other task is mentioned
    const mentionsOtherTask = this.checkTaskMention(task.description || '', otherTask.title);
    
    if (similarity > 0.6 || dependencyKeywords.length > 0 || mentionsOtherTask) {
      return {
        task_id: task.id,
        depends_on_task_id: otherTask.id,
        dependency_type: this.determineDependencyType(dependencyKeywords),
        confidence_score: Math.min(similarity + (dependencyKeywords.length * 0.1), 1.0),
        reasoning: this.generateDependencyReasoning(task, otherTask, dependencyKeywords),
        evidence: dependencyKeywords
      };
    }

    return null;
  }

  private async analyzePriorityFactors(task: HeroTask): Promise<PriorityFactor[]> {
    const factors: PriorityFactor[] = [];

    // Due date urgency
    if (task.due_date) {
      const daysUntilDue = Math.ceil(
        (new Date(task.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      
      factors.push({
        factor: 'due_date_urgency',
        weight: daysUntilDue <= 1 ? 0.9 : daysUntilDue <= 7 ? 0.7 : 0.3,
        impact: daysUntilDue <= 7 ? 'positive' : 'neutral',
        description: `Due in ${daysUntilDue} days`
      });
    }

    // Task type importance
    const typeWeights: Record<TaskType, number> = {
      [TaskType.SECURITY]: 0.9,
      [TaskType.BUG_FIX]: 0.8,
      [TaskType.FEATURE]: 0.6,
      [TaskType.DOCUMENTATION]: 0.3,
      [TaskType.MAINTENANCE]: 0.4,
      [TaskType.TEST]: 0.5,
      [TaskType.REFACTOR]: 0.5,
      [TaskType.PERFORMANCE]: 0.7,
      [TaskType.INTEGRATION]: 0.6,
      [TaskType.MIGRATION]: 0.7,
      [TaskType.RESEARCH]: 0.3,
      [TaskType.PLANNING]: 0.4,
      [TaskType.REVIEW]: 0.5,
      [TaskType.DEPLOYMENT]: 0.8,
      [TaskType.MONITORING]: 0.6,
      [TaskType.ARCHITECTURE]: 0.7
    };

    factors.push({
      factor: 'task_type',
      weight: typeWeights[task.type] || 0.5,
      impact: 'positive',
      description: `${task.type} tasks typically have ${typeWeights[task.type] > 0.7 ? 'high' : 'medium'} priority`
    });

    // Historical completion rate for similar tasks
    const completionRate = await this.getTaskTypeCompletionRate(task.type);
    factors.push({
      factor: 'historical_success',
      weight: completionRate,
      impact: 'positive',
      description: `${task.type} tasks have ${Math.round(completionRate * 100)}% completion rate`
    });

    return factors;
  }

  private calculatePriorityScore(factors: PriorityFactor[]): number {
    const totalWeight = factors.reduce((sum, factor) => sum + factor.weight, 0);
    const weightedScore = factors.reduce((sum, factor) => {
      const impactMultiplier = factor.impact === 'positive' ? 1 : factor.impact === 'negative' ? -1 : 0;
      return sum + (factor.weight * impactMultiplier);
    }, 0);

    return Math.max(0, Math.min(1, weightedScore / totalWeight));
  }

  private mapScoreToPriority(score: number): TaskPriority {
    if (score >= 0.8) return TaskPriority.CRITICAL;
    if (score >= 0.6) return TaskPriority.HIGH;
    if (score >= 0.4) return TaskPriority.MEDIUM;
    return TaskPriority.LOW;
  }

  private calculateConfidenceScore(factors: PriorityFactor[]): number {
    // Higher confidence when we have more factors and they agree
    const factorCount = factors.length;
    const avgWeight = factors.reduce((sum, f) => sum + f.weight, 0) / factorCount;
    
    return Math.min(0.9, (factorCount / 5) * avgWeight);
  }

  private generatePriorityReasoning(factors: PriorityFactor[]): string {
    const topFactors = factors
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3);

    return `Priority influenced by: ${topFactors.map(f => f.description).join(', ')}`;
  }

  private async getTaskById(taskId: string): Promise<HeroTask | null> {
    const supabase = await this.supabase;
    const { data, error } = await supabase
      .from('hero_tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (error) return null;
    return data;
  }

  private async getAllTasks(): Promise<HeroTask[]> {
    const supabase = await this.supabase;
    const { data, error } = await supabase
      .from('hero_tasks')
      .select('*')
      .limit(100);

    if (error) return [];
    return data || [];
  }

  private async getTaskTypeCompletionRate(taskType: TaskType): Promise<number> {
    const supabase = await this.supabase;
    const { data, error } = await supabase
      .from('hero_tasks')
      .select('status')
      .eq('type', taskType);

    if (error || !data) return 0.5;

    const completed = data.filter((task: HeroTask) => task.status === TaskStatus.COMPLETED).length;
    return completed / data.length;
  }

  private calculateTextSimilarity(text1: string, text2: string): number {
    // Simple Jaccard similarity
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    
    const intersection = new Set(Array.from(words1).filter(x => words2.has(x)));
    const union = new Set([...Array.from(words1), ...Array.from(words2)]);
    
    return intersection.size / union.size;
  }

  private extractDependencyKeywords(text: string): string[] {
    const keywords = [
      'depends on', 'requires', 'needs', 'after', 'following',
      'blocks', 'prevents', 'conflicts with', 'related to'
    ];
    
    return keywords.filter(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  private checkTaskMention(text: string, taskTitle: string): boolean {
    const titleWords = taskTitle.toLowerCase().split(/\s+/);
    return titleWords.some(word => 
      word.length > 3 && text.toLowerCase().includes(word)
    );
  }

  private determineDependencyType(keywords: string[]): 'blocks' | 'relates_to' | 'conflicts_with' {
    if (keywords.some(k => ['blocks', 'prevents'].includes(k))) return 'blocks';
    if (keywords.some(k => ['conflicts with'].includes(k))) return 'conflicts_with';
    return 'relates_to';
  }

  private generateDependencyReasoning(
    task: HeroTask,
    otherTask: HeroTask,
    keywords: string[]
  ): string {
    if (keywords.length > 0) {
      return `Dependency detected based on keywords: ${keywords.join(', ')}`;
    }
    return `Similar content suggests relationship between "${task.title}" and "${otherTask.title}"`;
  }

  private generateSuggestionTitle(context: string, similarTitle: string): string {
    // Simple title generation - in production, would use more sophisticated NLP
    const contextWords = context.split(/\s+/).slice(0, 3);
    return `${contextWords.join(' ')} - ${similarTitle}`;
  }

  private generateSuggestionDescription(originalDescription: string): string {
    return originalDescription || 'Task description based on similar completed tasks';
  }

  private calculateSuggestionConfidence(task: HeroTask, context: string): number {
    // Calculate confidence based on task completion status and similarity
    let confidence = 0.5;
    
    if (task.status === TaskStatus.COMPLETED) confidence += 0.3;
    if (task.actual_duration_hours) confidence += 0.1;
    if (task.tags.length > 0) confidence += 0.1;
    
    return Math.min(0.9, confidence);
  }

  private async updatePatternLearning(task: HeroTask): Promise<void> {
    // Update pattern learning based on successful task completion
    // This would update ML models or pattern databases
    console.log(`Learning from completed task: ${task.title}`);
  }

  private async updatePriorityWeights(task: HeroTask): Promise<void> {
    // Update priority factor weights based on actual vs predicted outcomes
    // This would improve future priority suggestions
    console.log(`Updating priority weights for task: ${task.title}`);
  }
}

// ============================================================================
// EXPORTED UTILITY FUNCTIONS
// ============================================================================

export async function generateTaskSuggestions(
  context: string,
  config?: Partial<TaskIntelligenceConfig>
): Promise<TaskSuggestion[]> {
  const engine = new TaskIntelligenceEngine(config);
  return engine.generateTaskSuggestions(context);
}

export async function detectTaskDependencies(
  taskId: string,
  config?: Partial<TaskIntelligenceConfig>
): Promise<DependencySuggestion[]> {
  const engine = new TaskIntelligenceEngine(config);
  return engine.detectDependencies(taskId);
}

export async function suggestTaskPriority(
  taskId: string,
  config?: Partial<TaskIntelligenceConfig>
): Promise<PrioritySuggestion | null> {
  const engine = new TaskIntelligenceEngine(config);
  return engine.suggestPriority(taskId);
}

export async function learnFromTaskCompletion(
  taskId: string,
  config?: Partial<TaskIntelligenceConfig>
): Promise<void> {
  const engine = new TaskIntelligenceEngine(config);
  return engine.learnFromTaskCompletion(taskId);
}
