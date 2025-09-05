/**
 * Hero Tasks System - TypeScript Types and Interfaces
 * Created: 2025-09-05T02:16:09.652Z
 * Version: 1.0.0
 */

// ============================================================================
// ENUMS
// ============================================================================

export enum TaskStatus {
  DRAFT = 'draft',
  READY = 'ready',
  IN_PROGRESS = 'in_progress',
  BLOCKED = 'blocked',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum TaskPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export enum TaskType {
  FEATURE = 'feature',
  BUG_FIX = 'bug_fix',
  REFACTOR = 'refactor',
  DOCUMENTATION = 'documentation',
  TEST = 'test',
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  INTEGRATION = 'integration',
  MIGRATION = 'migration',
  MAINTENANCE = 'maintenance',
  RESEARCH = 'research',
  PLANNING = 'planning',
  REVIEW = 'review',
  DEPLOYMENT = 'deployment',
  MONITORING = 'monitoring'
}

export enum WorkflowPhase {
  AUDIT = 'audit',
  DECIDE = 'decide',
  APPLY = 'apply',
  VERIFY = 'verify'
}

export enum DependencyType {
  BLOCKS = 'blocks',
  RELATES_TO = 'relates_to',
  CONFLICTS_WITH = 'conflicts_with'
}

export enum AttachmentType {
  FILE = 'file',
  LINK = 'link',
  SCREENSHOT = 'screenshot',
  DOCUMENT = 'document'
}

export enum CommentType {
  COMMENT = 'comment',
  DECISION = 'decision',
  NOTE = 'note',
  QUESTION = 'question'
}

// ============================================================================
// BASE INTERFACES
// ============================================================================

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface BaseTask extends BaseEntity {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  started_at?: string;
  completed_at?: string;
  due_date?: string;
  current_phase: WorkflowPhase;
  estimated_duration_hours?: number;
  actual_duration_hours?: number;
  assignee_id?: string;
  created_by?: string;
  tags: string[];
  metadata: Record<string, any>;
  audit_trail: AuditTrailEntry[];
}

// ============================================================================
// MAIN TASK INTERFACES
// ============================================================================

export interface HeroTask extends BaseTask {
  task_number: string; // HT-001, HT-002, etc.
  parent_task_id?: string;
  subtasks?: HeroSubtask[];
  dependencies?: TaskDependency[];
  attachments?: TaskAttachment[];
  comments?: TaskComment[];
  workflow_history?: WorkflowHistoryEntry[];
}

export interface CreateHeroTaskRequest {
  title: string;
  description?: string;
  priority?: TaskPriority;
  type: TaskType;
  parent_task_id?: string;
  assignee_id?: string;
  due_date?: string;
  estimated_duration_hours?: number;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateHeroTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  type?: TaskType;
  assignee_id?: string;
  due_date?: string;
  estimated_duration_hours?: number;
  actual_duration_hours?: number;
  current_phase?: WorkflowPhase;
  tags?: string[];
  metadata?: Record<string, any>;
}

// ============================================================================
// SUBTASK INTERFACES
// ============================================================================

export interface HeroSubtask extends BaseTask {
  task_id: string;
  subtask_number: string; // HT-001.1, HT-001.2, etc.
  actions?: HeroAction[];
  dependencies?: SubtaskDependency[];
  attachments?: TaskAttachment[];
  comments?: TaskComment[];
  workflow_history?: WorkflowHistoryEntry[];
}

export interface CreateHeroSubtaskRequest {
  task_id: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  type: TaskType;
  assignee_id?: string;
  due_date?: string;
  estimated_duration_hours?: number;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateHeroSubtaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  type?: TaskType;
  assignee_id?: string;
  due_date?: string;
  estimated_duration_hours?: number;
  actual_duration_hours?: number;
  current_phase?: WorkflowPhase;
  tags?: string[];
  metadata?: Record<string, any>;
}

// ============================================================================
// ACTION INTERFACES
// ============================================================================

export interface HeroAction extends BaseTask {
  subtask_id: string;
  action_number: string; // HT-001.1.1, HT-001.1.2, etc.
  dependencies?: ActionDependency[];
  attachments?: TaskAttachment[];
  comments?: TaskComment[];
  workflow_history?: WorkflowHistoryEntry[];
}

export interface CreateHeroActionRequest {
  subtask_id: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  type: TaskType;
  assignee_id?: string;
  due_date?: string;
  estimated_duration_hours?: number;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateHeroActionRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  type?: TaskType;
  assignee_id?: string;
  due_date?: string;
  estimated_duration_hours?: number;
  actual_duration_hours?: number;
  current_phase?: WorkflowPhase;
  tags?: string[];
  metadata?: Record<string, any>;
}

// ============================================================================
// DEPENDENCY INTERFACES
// ============================================================================

export interface TaskDependency extends BaseEntity {
  dependent_task_id: string;
  depends_on_task_id: string;
  dependency_type: DependencyType;
  created_by?: string;
}

export interface SubtaskDependency extends BaseEntity {
  dependent_subtask_id: string;
  depends_on_subtask_id: string;
  dependency_type: DependencyType;
  created_by?: string;
}

export interface ActionDependency extends BaseEntity {
  dependent_action_id: string;
  depends_on_action_id: string;
  dependency_type: DependencyType;
  created_by?: string;
}

export interface CreateDependencyRequest {
  dependent_id: string;
  depends_on_id: string;
  dependency_type: DependencyType;
}

// ============================================================================
// ATTACHMENT INTERFACES
// ============================================================================

export interface TaskAttachment extends BaseEntity {
  task_id?: string;
  subtask_id?: string;
  action_id?: string;
  attachment_type: AttachmentType;
  title: string;
  description?: string;
  file_path?: string;
  file_size?: number;
  file_type?: string;
  external_url?: string;
  created_by?: string;
}

export interface CreateAttachmentRequest {
  task_id?: string;
  subtask_id?: string;
  action_id?: string;
  attachment_type: AttachmentType;
  title: string;
  description?: string;
  file_path?: string;
  file_size?: number;
  file_type?: string;
  external_url?: string;
}

// ============================================================================
// COMMENT INTERFACES
// ============================================================================

export interface TaskComment extends BaseEntity {
  task_id?: string;
  subtask_id?: string;
  action_id?: string;
  content: string;
  comment_type: CommentType;
  created_by?: string;
}

export interface CreateCommentRequest {
  task_id?: string;
  subtask_id?: string;
  action_id?: string;
  content: string;
  comment_type?: CommentType;
}

// ============================================================================
// WORKFLOW INTERFACES
// ============================================================================

export interface WorkflowHistoryEntry extends BaseEntity {
  task_id?: string;
  subtask_id?: string;
  action_id?: string;
  from_status?: TaskStatus;
  to_status: TaskStatus;
  from_phase?: WorkflowPhase;
  to_phase?: WorkflowPhase;
  reason?: string;
  created_by?: string;
}

export interface AuditTrailEntry {
  timestamp: string;
  action: string;
  user_id?: string;
  details: Record<string, any>;
  phase?: WorkflowPhase;
}

// ============================================================================
// WORKFLOW PROCESS INTERFACES
// ============================================================================

export interface WorkflowProcess {
  current_phase: WorkflowPhase;
  phases: WorkflowPhaseData[];
  is_complete: boolean;
  can_proceed: boolean;
  blockers: string[];
}

export interface WorkflowPhaseData {
  phase: WorkflowPhase;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  started_at?: string;
  completed_at?: string;
  assignee_id?: string;
  notes?: string;
  deliverables?: string[];
  checklist?: WorkflowChecklistItem[];
}

export interface WorkflowChecklistItem {
  id: string;
  description: string;
  completed: boolean;
  completed_at?: string;
  completed_by?: string;
  required: boolean;
}

// ============================================================================
// SEARCH AND FILTER INTERFACES
// ============================================================================

export interface TaskSearchFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  type?: TaskType[];
  assignee_id?: string[];
  created_by?: string[];
  tags?: string[];
  current_phase?: WorkflowPhase[];
  created_after?: string;
  created_before?: string;
  due_after?: string;
  due_before?: string;
  search_text?: string;
}

export interface TaskSearchResult {
  tasks: HeroTask[];
  total_count: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

export interface TaskSearchRequest {
  filters?: TaskSearchFilters;
  page?: number;
  page_size?: number;
  sort_by?: 'created_at' | 'updated_at' | 'due_date' | 'priority' | 'status';
  sort_order?: 'asc' | 'desc';
}

// ============================================================================
// ANALYTICS INTERFACES
// ============================================================================

export interface TaskAnalytics {
  total_tasks: number;
  tasks_by_status: Record<TaskStatus, number>;
  tasks_by_priority: Record<TaskPriority, number>;
  tasks_by_type: Record<TaskType, number>;
  tasks_by_phase: Record<WorkflowPhase, number>;
  completion_rate: number;
  average_duration_hours: number;
  overdue_tasks: number;
  blocked_tasks: number;
}

export interface TeamAnalytics {
  user_id: string;
  tasks_assigned: number;
  tasks_completed: number;
  average_completion_time_hours: number;
  current_workload: number;
  productivity_score: number;
}

// ============================================================================
// API RESPONSE INTERFACES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    page_size: number;
    total_count: number;
    has_more: boolean;
  };
  timestamp: string;
}

// ============================================================================
// VALIDATION INTERFACES
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  is_valid: boolean;
  errors: ValidationError[];
}

// ============================================================================
// NOTIFICATION INTERFACES
// ============================================================================

export interface TaskNotification {
  id: string;
  task_id: string;
  subtask_id?: string;
  action_id?: string;
  type: 'status_change' | 'assignment' | 'due_date' | 'comment' | 'attachment';
  title: string;
  message: string;
  user_id: string;
  read: boolean;
  created_at: string;
}

export interface NotificationPreferences {
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  slack_notifications: boolean;
  notification_types: string[];
}

// ============================================================================
// EXPORT INTERFACES
// ============================================================================

export interface TaskExport {
  tasks: HeroTask[];
  export_date: string;
  export_format: 'json' | 'csv' | 'pdf';
  filters_applied?: TaskSearchFilters;
}

export interface TaskImport {
  tasks: CreateHeroTaskRequest[];
  import_date: string;
  import_source: string;
  validation_results: ValidationResult[];
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type TaskLevel = 'task' | 'subtask' | 'action';
export type TaskEntity = HeroTask | HeroSubtask | HeroAction;

export interface TaskNumberParts {
  main: number;
  sub?: number;
  action?: number;
}

export interface TaskHierarchy {
  task: HeroTask;
  subtasks: HeroSubtask[];
  actions: HeroAction[];
  dependencies: (TaskDependency | SubtaskDependency | ActionDependency)[];
  attachments: TaskAttachment[];
  comments: TaskComment[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const TASK_NUMBER_PATTERN = /^HT-(\d{3})(?:\.(\d+))?(?:\.(\d+))?$/;
export const MAX_TASK_TITLE_LENGTH = 500;
export const MAX_TASK_DESCRIPTION_LENGTH = 10000;
export const MAX_TAGS_COUNT = 20;
export const MAX_TAG_LENGTH = 50;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const WORKFLOW_PHASE_ORDER: WorkflowPhase[] = [
  WorkflowPhase.AUDIT,
  WorkflowPhase.DECIDE,
  WorkflowPhase.APPLY,
  WorkflowPhase.VERIFY
];

export const STATUS_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  [TaskStatus.DRAFT]: [TaskStatus.READY, TaskStatus.CANCELLED],
  [TaskStatus.READY]: [TaskStatus.IN_PROGRESS, TaskStatus.CANCELLED],
  [TaskStatus.IN_PROGRESS]: [TaskStatus.BLOCKED, TaskStatus.COMPLETED, TaskStatus.CANCELLED],
  [TaskStatus.BLOCKED]: [TaskStatus.IN_PROGRESS, TaskStatus.CANCELLED],
  [TaskStatus.COMPLETED]: [],
  [TaskStatus.CANCELLED]: []
};

export const PRIORITY_WEIGHTS: Record<TaskPriority, number> = {
  [TaskPriority.CRITICAL]: 4,
  [TaskPriority.HIGH]: 3,
  [TaskPriority.MEDIUM]: 2,
  [TaskPriority.LOW]: 1
};

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isHeroTask(entity: TaskEntity): entity is HeroTask {
  return 'task_number' in entity && !('subtask_number' in entity);
}

export function isHeroSubtask(entity: TaskEntity): entity is HeroSubtask {
  return 'subtask_number' in entity && !('action_number' in entity);
}

export function isHeroAction(entity: TaskEntity): entity is HeroAction {
  return 'action_number' in entity;
}

export function isValidTaskNumber(taskNumber: string): boolean {
  return TASK_NUMBER_PATTERN.test(taskNumber);
}

export function parseTaskNumber(taskNumber: string): TaskNumberParts | null {
  const match = taskNumber.match(TASK_NUMBER_PATTERN);
  if (!match) return null;
  
  return {
    main: parseInt(match[1], 10),
    sub: match[2] ? parseInt(match[2], 10) : undefined,
    action: match[3] ? parseInt(match[3], 10) : undefined
  };
}

export function generateTaskNumber(main: number): string {
  return `HT-${main.toString().padStart(3, '0')}`;
}

export function generateSubtaskNumber(main: number, sub: number): string {
  return `HT-${main.toString().padStart(3, '0')}.${sub}`;
}

export function generateActionNumber(main: number, sub: number, action: number): string {
  return `HT-${main.toString().padStart(3, '0')}.${sub}.${action}`;
}
