/**
 * Natural Language Processing System for Hero Tasks
 * HT-004.4.2: Natural language task creation and smart content parsing
 * 
 * This module provides NLP capabilities for the Hero Tasks system including:
 * - Natural language task creation from text input
 * - Smart content parsing to extract entities and intent
 * - Context-aware task suggestions based on natural language
 * - Entity extraction (dates, assignees, priorities, tags)
 * - Intent recognition for task operations
 */

import { HeroTask, TaskPriority, TaskType, TaskStatus, WorkflowPhase } from '../../types/hero-tasks';

// ============================================================================
// NLP INTERFACES
// ============================================================================

export interface NLPParseResult {
  intent: TaskIntent;
  entities: ExtractedEntity[];
  confidence: number;
  suggestions: TaskSuggestion[];
  parsed_task: ParsedTaskData;
}

export interface TaskIntent {
  action: 'create' | 'update' | 'search' | 'delete' | 'assign' | 'schedule' | 'prioritize';
  confidence: number;
  reasoning: string;
}

export interface ExtractedEntity {
  type: EntityType;
  value: string;
  confidence: number;
  position: { start: number; end: number };
  metadata?: Record<string, any>;
}

export interface ParsedTaskData {
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

export interface TaskSuggestion {
  field: string;
  value: any;
  confidence: number;
  reasoning: string;
}

export enum EntityType {
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

export interface NLPConfig {
  enable_entity_extraction: boolean;
  enable_intent_recognition: boolean;
  enable_smart_suggestions: boolean;
  min_confidence_threshold: number;
  max_suggestions: number;
  language: string;
}

// ============================================================================
// NATURAL LANGUAGE PROCESSING ENGINE
// ============================================================================

export class NaturalLanguageProcessor {
  private config: NLPConfig;
  private patterns: NLPPatterns;

  constructor(config: Partial<NLPConfig> = {}) {
    this.config = {
      enable_entity_extraction: true,
      enable_intent_recognition: true,
      enable_smart_suggestions: true,
      min_confidence_threshold: 0.7,
      max_suggestions: 5,
      language: 'en',
      ...config
    };
    this.patterns = new NLPPatterns();
  }

  /**
   * Parse natural language input and extract task information
   */
  async parseTaskInput(input: string): Promise<NLPParseResult> {
    try {
      // Clean and normalize input
      const normalizedInput = this.normalizeInput(input);
      
      // Extract intent
      const intent = await this.extractIntent(normalizedInput);
      
      // Extract entities
      const entities = await this.extractEntities(normalizedInput);
      
      // Parse task data from entities
      const parsedTask = this.parseTaskFromEntities(entities, normalizedInput);
      
      // Generate suggestions
      const suggestions = await this.generateSuggestions(parsedTask, entities);
      
      // Calculate overall confidence
      const confidence = this.calculateOverallConfidence(intent, entities, suggestions);
      
      return {
        intent,
        entities,
        confidence,
        suggestions,
        parsed_task: parsedTask
      };
    } catch (error) {
      console.error('Error parsing natural language input:', error);
      return this.getDefaultParseResult(input);
    }
  }

  /**
   * Extract intent from natural language input
   */
  private async extractIntent(input: string): Promise<TaskIntent> {
    const lowerInput = input.toLowerCase();
    
    // Intent patterns
    const intentPatterns = {
      create: [
        'create', 'add', 'new', 'make', 'build', 'develop', 'implement',
        'i need to', 'i want to', 'can you', 'please create'
      ],
      update: [
        'update', 'modify', 'change', 'edit', 'revise', 'fix', 'correct'
      ],
      search: [
        'find', 'search', 'look for', 'show me', 'list', 'get', 'retrieve'
      ],
      delete: [
        'delete', 'remove', 'cancel', 'drop', 'eliminate'
      ],
      assign: [
        'assign', 'give to', 'hand over', 'delegate', 'pass to'
      ],
      schedule: [
        'schedule', 'plan', 'book', 'arrange', 'set up', 'due'
      ],
      prioritize: [
        'prioritize', 'urgent', 'important', 'critical', 'high priority'
      ]
    };

    let bestIntent = 'create';
    let bestConfidence = 0.5;
    let reasoning = 'Default intent: create task';

    for (const [intent, patterns] of Object.entries(intentPatterns)) {
      for (const pattern of patterns) {
        if (lowerInput.includes(pattern)) {
          const confidence = this.calculatePatternConfidence(input, pattern);
          if (confidence > bestConfidence) {
            bestIntent = intent;
            bestConfidence = confidence;
            reasoning = `Detected "${pattern}" pattern for ${intent} intent`;
          }
        }
      }
    }

    return {
      action: bestIntent as any,
      confidence: bestConfidence,
      reasoning
    };
  }

  /**
   * Extract entities from natural language input
   */
  private async extractEntities(input: string): Promise<ExtractedEntity[]> {
    const entities: ExtractedEntity[] = [];
    
    // Extract dates
    entities.push(...this.extractDates(input));
    
    // Extract priorities
    entities.push(...this.extractPriorities(input));
    
    // Extract task types
    entities.push(...this.extractTaskTypes(input));
    
    // Extract people/assignees
    entities.push(...this.extractPeople(input));
    
    // Extract tags
    entities.push(...this.extractTags(input));
    
    // Extract durations
    entities.push(...this.extractDurations(input));
    
    // Extract URLs
    entities.push(...this.extractUrls(input));
    
    // Extract emails
    entities.push(...this.extractEmails(input));

    return entities.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Parse task data from extracted entities
   */
  private parseTaskFromEntities(entities: ExtractedEntity[], input: string): ParsedTaskData {
    const parsedTask: ParsedTaskData = {};
    
    // Extract title (usually the main part of the input)
    parsedTask.title = this.extractTitle(input, entities);
    
    // Extract description (remaining text after entities)
    parsedTask.description = this.extractDescription(input, entities);
    
    // Map entities to task fields
    entities.forEach(entity => {
      switch (entity.type) {
        case EntityType.DATE:
          parsedTask.due_date = entity.value;
          break;
        case EntityType.PRIORITY:
          parsedTask.priority = this.mapPriority(entity.value);
          break;
        case EntityType.TASK_TYPE:
          parsedTask.type = this.mapTaskType(entity.value);
          break;
        case EntityType.PERSON:
          parsedTask.assignee = entity.value;
          break;
        case EntityType.DURATION:
          parsedTask.estimated_hours = this.parseDuration(entity.value);
          break;
        case EntityType.TAG:
          if (!parsedTask.tags) parsedTask.tags = [];
          parsedTask.tags.push(entity.value);
          break;
      }
    });

    return parsedTask;
  }

  /**
   * Generate smart suggestions based on parsed data
   */
  private async generateSuggestions(
    parsedTask: ParsedTaskData, 
    entities: ExtractedEntity[]
  ): Promise<TaskSuggestion[]> {
    const suggestions: TaskSuggestion[] = [];
    
    // Suggest missing priority
    if (!parsedTask.priority) {
      const suggestedPriority = this.suggestPriority(parsedTask.title || '', entities);
      if (suggestedPriority) {
        suggestions.push({
          field: 'priority',
          value: suggestedPriority,
          confidence: 0.7,
          reasoning: 'Priority suggested based on task content analysis'
        });
      }
    }
    
    // Suggest missing task type
    if (!parsedTask.type) {
      const suggestedType = this.suggestTaskType(parsedTask.title || '', entities);
      if (suggestedType) {
        suggestions.push({
          field: 'type',
          value: suggestedType,
          confidence: 0.8,
          reasoning: 'Task type suggested based on keywords and context'
        });
      }
    }
    
    // Suggest tags
    const suggestedTags = this.suggestTags(parsedTask.title || '', parsedTask.description || '');
    if (suggestedTags.length > 0) {
      suggestions.push({
        field: 'tags',
        value: suggestedTags,
        confidence: 0.6,
        reasoning: 'Tags suggested based on content analysis'
      });
    }
    
    // Suggest estimated duration
    if (!parsedTask.estimated_hours) {
      const suggestedDuration = this.suggestDuration(parsedTask.title || '', parsedTask.type);
      if (suggestedDuration) {
        suggestions.push({
          field: 'estimated_hours',
          value: suggestedDuration,
          confidence: 0.5,
          reasoning: 'Duration estimated based on task complexity'
        });
      }
    }

    return suggestions.slice(0, this.config.max_suggestions);
  }

  // ============================================================================
  // ENTITY EXTRACTION METHODS
  // ============================================================================

  private extractDates(input: string): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];
    const datePatterns = [
      // Relative dates
      { pattern: /\b(today|tomorrow|yesterday)\b/gi, type: 'relative' },
      { pattern: /\b(next|this)\s+(week|month|year)\b/gi, type: 'relative' },
      { pattern: /\b(in|after)\s+(\d+)\s+(days?|weeks?|months?|years?)\b/gi, type: 'relative' },
      
      // Specific dates
      { pattern: /\b(\d{1,2})\/(\d{1,2})\/(\d{2,4})\b/g, type: 'date' },
      { pattern: /\b(\d{1,2})-(\d{1,2})-(\d{2,4})\b/g, type: 'date' },
      { pattern: /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?\b/gi, type: 'date' },
      
      // Days of week
      { pattern: /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi, type: 'day' }
    ];

    datePatterns.forEach(({ pattern, type }) => {
      let match;
      while ((match = pattern.exec(input)) !== null) {
        entities.push({
          type: EntityType.DATE,
          value: this.parseDate(match[0], type),
          confidence: 0.9,
          position: { start: match.index, end: match.index + match[0].length },
          metadata: { original: match[0], type }
        });
      }
    });

    return entities;
  }

  private extractPriorities(input: string): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];
    const priorityPatterns = [
      { pattern: /\b(critical|urgent|asap|immediately)\b/gi, priority: TaskPriority.CRITICAL },
      { pattern: /\b(high|important|priority)\b/gi, priority: TaskPriority.HIGH },
      { pattern: /\b(medium|normal|standard)\b/gi, priority: TaskPriority.MEDIUM },
      { pattern: /\b(low|minor|optional)\b/gi, priority: TaskPriority.LOW }
    ];

    priorityPatterns.forEach(({ pattern, priority }) => {
      let match;
      while ((match = pattern.exec(input)) !== null) {
        entities.push({
          type: EntityType.PRIORITY,
          value: priority,
          confidence: 0.8,
          position: { start: match.index, end: match.index + match[0].length }
        });
      }
    });

    return entities;
  }

  private extractTaskTypes(input: string): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];
    const typePatterns = [
      { pattern: /\b(bug|fix|error|issue|problem)\b/gi, type: TaskType.BUG_FIX },
      { pattern: /\b(feature|enhancement|improvement|new)\b/gi, type: TaskType.FEATURE },
      { pattern: /\b(refactor|cleanup|optimize|improve)\b/gi, type: TaskType.REFACTOR },
      { pattern: /\b(documentation|docs|readme|guide)\b/gi, type: TaskType.DOCUMENTATION },
      { pattern: /\b(test|testing|qa|quality)\b/gi, type: TaskType.TEST },
      { pattern: /\b(security|secure|vulnerability)\b/gi, type: TaskType.SECURITY },
      { pattern: /\b(performance|speed|optimization)\b/gi, type: TaskType.PERFORMANCE },
      { pattern: /\b(integration|connect|api|webhook)\b/gi, type: TaskType.INTEGRATION },
      { pattern: /\b(migration|migrate|upgrade)\b/gi, type: TaskType.MIGRATION },
      { pattern: /\b(maintenance|maintain|support)\b/gi, type: TaskType.MAINTENANCE }
    ];

    typePatterns.forEach(({ pattern, type }) => {
      let match;
      while ((match = pattern.exec(input)) !== null) {
        entities.push({
          type: EntityType.TASK_TYPE,
          value: type,
          confidence: 0.7,
          position: { start: match.index, end: match.index + match[0].length }
        });
      }
    });

    return entities;
  }

  private extractPeople(input: string): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];
    
    // Common name patterns
    const namePatterns = [
      /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g, // First Last
      /\b@(\w+)\b/g, // @username
      /\b(assign to|give to|hand over to)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/gi
    ];

    namePatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(input)) !== null) {
        entities.push({
          type: EntityType.PERSON,
          value: match[0].replace(/^(assign to|give to|hand over to)\s+/i, ''),
          confidence: 0.6,
          position: { start: match.index, end: match.index + match[0].length }
        });
      }
    });

    return entities;
  }

  private extractTags(input: string): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];
    
    // Hashtag pattern
    const hashtagPattern = /#(\w+)/g;
    let match;
    while ((match = hashtagPattern.exec(input)) !== null) {
      entities.push({
        type: EntityType.TAG,
        value: match[1],
        confidence: 0.9,
        position: { start: match.index, end: match.index + match[0].length }
      });
    }

    return entities;
  }

  private extractDurations(input: string): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];
    const durationPatterns = [
      /\b(\d+)\s*(hours?|hrs?)\b/gi,
      /\b(\d+)\s*(days?)\b/gi,
      /\b(\d+)\s*(weeks?)\b/gi,
      /\b(\d+)\s*(months?)\b/gi
    ];

    durationPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(input)) !== null) {
        entities.push({
          type: EntityType.DURATION,
          value: match[0],
          confidence: 0.8,
          position: { start: match.index, end: match.index + match[0].length }
        });
      }
    });

    return entities;
  }

  private extractUrls(input: string): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];
    const urlPattern = /https?:\/\/[^\s]+/g;
    let match;
    while ((match = urlPattern.exec(input)) !== null) {
      entities.push({
        type: EntityType.URL,
        value: match[0],
        confidence: 0.95,
        position: { start: match.index, end: match.index + match[0].length }
      });
    }
    return entities;
  }

  private extractEmails(input: string): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    let match;
    while ((match = emailPattern.exec(input)) !== null) {
      entities.push({
        type: EntityType.EMAIL,
        value: match[0],
        confidence: 0.95,
        position: { start: match.index, end: match.index + match[0].length }
      });
    }
    return entities;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private normalizeInput(input: string): string {
    return input.trim().replace(/\s+/g, ' ');
  }

  private calculatePatternConfidence(input: string, pattern: string): number {
    const inputWords = input.toLowerCase().split(/\s+/);
    const patternWords = pattern.toLowerCase().split(/\s+/);
    
    let matches = 0;
    patternWords.forEach(word => {
      if (inputWords.includes(word)) matches++;
    });
    
    return matches / patternWords.length;
  }

  private calculateOverallConfidence(
    intent: TaskIntent, 
    entities: ExtractedEntity[], 
    suggestions: TaskSuggestion[]
  ): number {
    const intentWeight = 0.3;
    const entityWeight = 0.5;
    const suggestionWeight = 0.2;
    
    const avgEntityConfidence = entities.length > 0 
      ? entities.reduce((sum, e) => sum + e.confidence, 0) / entities.length 
      : 0.5;
    
    const avgSuggestionConfidence = suggestions.length > 0
      ? suggestions.reduce((sum, s) => sum + s.confidence, 0) / suggestions.length
      : 0.5;
    
    return (intent.confidence * intentWeight) + 
           (avgEntityConfidence * entityWeight) + 
           (avgSuggestionConfidence * suggestionWeight);
  }

  private extractTitle(input: string, entities: ExtractedEntity[]): string {
    // Remove entity text and clean up
    let title = input;
    entities.forEach(entity => {
      title = title.replace(
        title.substring(entity.position.start, entity.position.end), 
        ''
      );
    });
    
    // Clean up extra spaces and common prefixes
    title = title.replace(/\s+/g, ' ').trim();
    title = title.replace(/^(create|add|new|make|build|develop|implement)\s+/i, '');
    
    return title || input;
  }

  private extractDescription(input: string, entities: ExtractedEntity[]): string {
    // Use the full input as description, but clean up entity markers
    let description = input;
    entities.forEach(entity => {
      if (entity.type === EntityType.TAG) {
        description = description.replace(`#${entity.value}`, entity.value);
      }
    });
    
    return description;
  }

  private mapPriority(value: string): TaskPriority {
    const priorityMap: Record<string, TaskPriority> = {
      'critical': TaskPriority.CRITICAL,
      'urgent': TaskPriority.CRITICAL,
      'asap': TaskPriority.CRITICAL,
      'immediately': TaskPriority.CRITICAL,
      'high': TaskPriority.HIGH,
      'important': TaskPriority.HIGH,
      'priority': TaskPriority.HIGH,
      'medium': TaskPriority.MEDIUM,
      'normal': TaskPriority.MEDIUM,
      'standard': TaskPriority.MEDIUM,
      'low': TaskPriority.LOW,
      'minor': TaskPriority.LOW,
      'optional': TaskPriority.LOW
    };
    
    return priorityMap[value.toLowerCase()] || TaskPriority.MEDIUM;
  }

  private mapTaskType(value: string): TaskType {
    const typeMap: Record<string, TaskType> = {
      'bug': TaskType.BUG_FIX,
      'fix': TaskType.BUG_FIX,
      'error': TaskType.BUG_FIX,
      'issue': TaskType.BUG_FIX,
      'problem': TaskType.BUG_FIX,
      'feature': TaskType.FEATURE,
      'enhancement': TaskType.FEATURE,
      'improvement': TaskType.FEATURE,
      'new': TaskType.FEATURE,
      'refactor': TaskType.REFACTOR,
      'cleanup': TaskType.REFACTOR,
      'optimize': TaskType.REFACTOR,
      'improve': TaskType.REFACTOR,
      'documentation': TaskType.DOCUMENTATION,
      'docs': TaskType.DOCUMENTATION,
      'readme': TaskType.DOCUMENTATION,
      'guide': TaskType.DOCUMENTATION,
      'test': TaskType.TEST,
      'testing': TaskType.TEST,
      'qa': TaskType.TEST,
      'quality': TaskType.TEST,
      'security': TaskType.SECURITY,
      'secure': TaskType.SECURITY,
      'vulnerability': TaskType.SECURITY,
      'performance': TaskType.PERFORMANCE,
      'speed': TaskType.PERFORMANCE,
      'optimization': TaskType.PERFORMANCE,
      'integration': TaskType.INTEGRATION,
      'connect': TaskType.INTEGRATION,
      'api': TaskType.INTEGRATION,
      'webhook': TaskType.INTEGRATION,
      'migration': TaskType.MIGRATION,
      'migrate': TaskType.MIGRATION,
      'upgrade': TaskType.MIGRATION,
      'maintenance': TaskType.MAINTENANCE,
      'maintain': TaskType.MAINTENANCE,
      'support': TaskType.MAINTENANCE
    };
    
    return typeMap[value.toLowerCase()] || TaskType.FEATURE;
  }

  private parseDuration(value: string): number {
    const durationPattern = /(\d+)\s*(hours?|hrs?|days?|weeks?|months?)/i;
    const match = value.match(durationPattern);
    
    if (!match) return 4; // Default 4 hours
    
    const amount = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    
    switch (unit) {
      case 'hour':
      case 'hours':
      case 'hr':
      case 'hrs':
        return amount;
      case 'day':
      case 'days':
        return amount * 8; // 8 hours per day
      case 'week':
      case 'weeks':
        return amount * 40; // 40 hours per week
      case 'month':
      case 'months':
        return amount * 160; // 160 hours per month
      default:
        return 4;
    }
  }

  private parseDate(value: string, type: string): string {
    const now = new Date();
    
    switch (type) {
      case 'relative':
        if (value.toLowerCase().includes('today')) {
          return now.toISOString().split('T')[0];
        } else if (value.toLowerCase().includes('tomorrow')) {
          const tomorrow = new Date(now);
          tomorrow.setDate(tomorrow.getDate() + 1);
          return tomorrow.toISOString().split('T')[0];
        } else if (value.toLowerCase().includes('yesterday')) {
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          return yesterday.toISOString().split('T')[0];
        }
        break;
      case 'date':
        // Handle MM/DD/YYYY or DD/MM/YYYY formats
        const dateMatch = value.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
        if (dateMatch) {
          const [, month, day, year] = dateMatch;
          const fullYear = year.length === 2 ? `20${year}` : year;
          return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
        break;
    }
    
    return value; // Return original if can't parse
  }

  private suggestPriority(title: string, entities: ExtractedEntity[]): TaskPriority | null {
    const urgentKeywords = ['urgent', 'critical', 'asap', 'immediately', 'emergency', 'fix', 'bug'];
    const highKeywords = ['important', 'priority', 'deadline', 'due'];
    const lowKeywords = ['optional', 'nice to have', 'minor', 'low priority'];
    
    const text = title.toLowerCase();
    
    if (urgentKeywords.some(keyword => text.includes(keyword))) {
      return TaskPriority.CRITICAL;
    } else if (highKeywords.some(keyword => text.includes(keyword))) {
      return TaskPriority.HIGH;
    } else if (lowKeywords.some(keyword => text.includes(keyword))) {
      return TaskPriority.LOW;
    }
    
    return null;
  }

  private suggestTaskType(title: string, entities: ExtractedEntity[]): TaskType | null {
    const bugKeywords = ['bug', 'fix', 'error', 'issue', 'problem', 'broken'];
    const featureKeywords = ['feature', 'new', 'add', 'implement', 'create'];
    const refactorKeywords = ['refactor', 'cleanup', 'optimize', 'improve'];
    const docKeywords = ['documentation', 'docs', 'readme', 'guide'];
    const testKeywords = ['test', 'testing', 'qa', 'quality'];
    
    const text = title.toLowerCase();
    
    if (bugKeywords.some(keyword => text.includes(keyword))) {
      return TaskType.BUG_FIX;
    } else if (featureKeywords.some(keyword => text.includes(keyword))) {
      return TaskType.FEATURE;
    } else if (refactorKeywords.some(keyword => text.includes(keyword))) {
      return TaskType.REFACTOR;
    } else if (docKeywords.some(keyword => text.includes(keyword))) {
      return TaskType.DOCUMENTATION;
    } else if (testKeywords.some(keyword => text.includes(keyword))) {
      return TaskType.TEST;
    }
    
    return null;
  }

  private suggestTags(title: string, description: string): string[] {
    const tags: string[] = [];
    const text = `${title} ${description}`.toLowerCase();
    
    // Technology tags
    if (text.includes('react') || text.includes('jsx')) tags.push('react');
    if (text.includes('typescript') || text.includes('ts')) tags.push('typescript');
    if (text.includes('node') || text.includes('nodejs')) tags.push('nodejs');
    if (text.includes('api') || text.includes('rest')) tags.push('api');
    if (text.includes('database') || text.includes('db') || text.includes('sql')) tags.push('database');
    if (text.includes('ui') || text.includes('ux') || text.includes('design')) tags.push('ui');
    if (text.includes('mobile') || text.includes('ios') || text.includes('android')) tags.push('mobile');
    if (text.includes('web') || text.includes('frontend')) tags.push('frontend');
    if (text.includes('backend') || text.includes('server')) tags.push('backend');
    
    // Priority tags
    if (text.includes('urgent') || text.includes('critical')) tags.push('urgent');
    if (text.includes('important') || text.includes('priority')) tags.push('important');
    
    // Status tags
    if (text.includes('todo') || text.includes('pending')) tags.push('todo');
    if (text.includes('in progress') || text.includes('working')) tags.push('in-progress');
    if (text.includes('done') || text.includes('completed')) tags.push('completed');
    
    return tags.slice(0, 5); // Limit to 5 tags
  }

  private suggestDuration(title: string, type?: TaskType): number | null {
    const text = title.toLowerCase();
    
    // Quick tasks
    if (text.includes('quick') || text.includes('small') || text.includes('minor')) {
      return 1;
    }
    
    // Medium tasks
    if (text.includes('medium') || text.includes('moderate')) {
      return 4;
    }
    
    // Large tasks
    if (text.includes('large') || text.includes('major') || text.includes('complex')) {
      return 8;
    }
    
    // Type-based suggestions
    if (type) {
      switch (type) {
        case TaskType.BUG_FIX:
          return 2;
        case TaskType.FEATURE:
          return 6;
        case TaskType.REFACTOR:
          return 8;
        case TaskType.DOCUMENTATION:
          return 2;
        case TaskType.TEST:
          return 4;
        case TaskType.SECURITY:
          return 6;
        case TaskType.PERFORMANCE:
          return 4;
        case TaskType.INTEGRATION:
          return 8;
        case TaskType.MIGRATION:
          return 12;
        case TaskType.MAINTENANCE:
          return 3;
        default:
          return 4;
      }
    }
    
    return null;
  }

  private getDefaultParseResult(input: string): NLPParseResult {
    return {
      intent: {
        action: 'create',
        confidence: 0.5,
        reasoning: 'Default intent due to parsing error'
      },
      entities: [],
      confidence: 0.3,
      suggestions: [],
      parsed_task: {
        title: input,
        description: input
      }
    };
  }
}

// ============================================================================
// NLP PATTERNS CLASS
// ============================================================================

class NLPPatterns {
  private patterns: Record<string, RegExp[]>;

  constructor() {
    this.patterns = {
      dates: [
        /\b(today|tomorrow|yesterday)\b/gi,
        /\b(next|this)\s+(week|month|year)\b/gi,
        /\b(in|after)\s+(\d+)\s+(days?|weeks?|months?|years?)\b/gi,
        /\b(\d{1,2})\/(\d{1,2})\/(\d{2,4})\b/g,
        /\b(\d{1,2})-(\d{1,2})-(\d{2,4})\b/g
      ],
      priorities: [
        /\b(critical|urgent|asap|immediately)\b/gi,
        /\b(high|important|priority)\b/gi,
        /\b(medium|normal|standard)\b/gi,
        /\b(low|minor|optional)\b/gi
      ],
      taskTypes: [
        /\b(bug|fix|error|issue|problem)\b/gi,
        /\b(feature|enhancement|improvement|new)\b/gi,
        /\b(refactor|cleanup|optimize|improve)\b/gi,
        /\b(documentation|docs|readme|guide)\b/gi,
        /\b(test|testing|qa|quality)\b/gi
      ],
      people: [
        /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g,
        /\b@(\w+)\b/g,
        /\b(assign to|give to|hand over to)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/gi
      ],
      durations: [
        /\b(\d+)\s*(hours?|hrs?)\b/gi,
        /\b(\d+)\s*(days?)\b/gi,
        /\b(\d+)\s*(weeks?)\b/gi,
        /\b(\d+)\s*(months?)\b/gi
      ]
    };
  }

  getPatterns(type: string): RegExp[] {
    return this.patterns[type] || [];
  }
}

// ============================================================================
// EXPORTED UTILITY FUNCTIONS
// ============================================================================

export async function parseNaturalLanguageTask(
  input: string,
  config?: Partial<NLPConfig>
): Promise<NLPParseResult> {
  const processor = new NaturalLanguageProcessor(config);
  return processor.parseTaskInput(input);
}

export async function extractTaskEntities(
  input: string,
  config?: Partial<NLPConfig>
): Promise<ExtractedEntity[]> {
  const processor = new NaturalLanguageProcessor(config);
  const result = await processor.parseTaskInput(input);
  return result.entities;
}

export async function recognizeTaskIntent(
  input: string,
  config?: Partial<NLPConfig>
): Promise<TaskIntent> {
  const processor = new NaturalLanguageProcessor(config);
  const result = await processor.parseTaskInput(input);
  return result.intent;
}
