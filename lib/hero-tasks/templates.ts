/**
 * Hero Tasks - Default Task Templates
 * Created: 2025-01-27T12:00:00.000Z
 * Version: 1.0.0
 */

import { TaskTemplate, TaskTemplateCategory, TaskPriority, TaskType, WorkflowPhase } from '@/types/hero-tasks';

export const DEFAULT_TASK_TEMPLATES: Omit<TaskTemplate, 'id' | 'created_at' | 'updated_at'>[] = [
  // Development Templates
  {
    name: 'New Feature Development',
    description: 'Template for developing new features with proper planning and testing',
    category: TaskTemplateCategory.FEATURE,
    icon: 'Plus',
    color: '#3B82F6',
    is_default: true,
    is_public: true,
    usage_count: 0,
    template_data: {
      title_template: 'Implement {{feature_name}} feature',
      description_template: 'Develop and implement the {{feature_name}} feature according to specifications.\n\n## Requirements\n- {{requirement_1}}\n- {{requirement_2}}\n\n## Acceptance Criteria\n- [ ] Feature works as specified\n- [ ] Unit tests written\n- [ ] Integration tests pass\n- [ ] Documentation updated',
      priority: TaskPriority.HIGH,
      type: TaskType.FEATURE,
      estimated_duration_hours: 8,
      default_tags: ['feature', 'development', 'frontend'],
      workflow_phase: WorkflowPhase.AUDIT,
      subtasks: [
        {
          title: 'Analyze requirements',
          description: 'Review and understand the feature requirements',
          priority: TaskPriority.HIGH,
          type: TaskType.PLANNING,
          estimated_duration_hours: 2,
          order: 1
        },
        {
          title: 'Design implementation',
          description: 'Create technical design and architecture',
          priority: TaskPriority.HIGH,
          type: TaskType.PLANNING,
          estimated_duration_hours: 2,
          order: 2
        },
        {
          title: 'Implement feature',
          description: 'Write the actual feature code',
          priority: TaskPriority.HIGH,
          type: TaskType.FEATURE,
          estimated_duration_hours: 4,
          order: 3
        },
        {
          title: 'Write tests',
          description: 'Create unit and integration tests',
          priority: TaskPriority.MEDIUM,
          type: TaskType.TEST,
          estimated_duration_hours: 2,
          order: 4
        },
        {
          title: 'Update documentation',
          description: 'Update relevant documentation',
          priority: TaskPriority.LOW,
          type: TaskType.DOCUMENTATION,
          estimated_duration_hours: 1,
          order: 5
        }
      ],
      checklist: [
        {
          description: 'Code review completed',
          required: true,
          order: 1
        },
        {
          description: 'All tests passing',
          required: true,
          order: 2
        },
        {
          description: 'Documentation updated',
          required: true,
          order: 3
        },
        {
          description: 'Deployed to staging',
          required: false,
          order: 4
        }
      ]
    },
    tags: ['feature', 'development', 'template'],
    metadata: {}
  },

  {
    name: 'Bug Fix',
    description: 'Template for fixing bugs with proper investigation and testing',
    category: TaskTemplateCategory.BUG_FIX,
    icon: 'Bug',
    color: '#EF4444',
    is_default: true,
    is_public: true,
    usage_count: 0,
    template_data: {
      title_template: 'Fix {{bug_description}}',
      description_template: 'Investigate and fix the bug: {{bug_description}}\n\n## Bug Details\n- **Severity**: {{severity}}\n- **Environment**: {{environment}}\n- **Steps to Reproduce**:\n  1. {{step_1}}\n  2. {{step_2}}\n  3. {{step_3}}\n\n## Investigation\n- [ ] Root cause identified\n- [ ] Impact assessment completed\n- [ ] Fix implemented\n- [ ] Tests added\n- [ ] Regression testing completed',
      priority: TaskPriority.HIGH,
      type: TaskType.BUG_FIX,
      estimated_duration_hours: 4,
      default_tags: ['bug', 'fix', 'investigation'],
      workflow_phase: WorkflowPhase.AUDIT,
      subtasks: [
        {
          title: 'Investigate bug',
          description: 'Analyze the bug and identify root cause',
          priority: TaskPriority.HIGH,
          type: TaskType.RESEARCH,
          estimated_duration_hours: 2,
          order: 1
        },
        {
          title: 'Implement fix',
          description: 'Write and implement the bug fix',
          priority: TaskPriority.HIGH,
          type: TaskType.BUG_FIX,
          estimated_duration_hours: 2,
          order: 2
        },
        {
          title: 'Add regression tests',
          description: 'Add tests to prevent regression',
          priority: TaskPriority.MEDIUM,
          type: TaskType.TEST,
          estimated_duration_hours: 1,
          order: 3
        }
      ],
      checklist: [
        {
          description: 'Root cause identified',
          required: true,
          order: 1
        },
        {
          description: 'Fix implemented and tested',
          required: true,
          order: 2
        },
        {
          description: 'Regression tests added',
          required: true,
          order: 3
        },
        {
          description: 'Code review completed',
          required: true,
          order: 4
        }
      ]
    },
    tags: ['bug', 'fix', 'template'],
    metadata: {}
  },

  {
    name: 'Code Refactoring',
    description: 'Template for refactoring existing code to improve quality',
    category: TaskTemplateCategory.REFACTOR,
    icon: 'Code',
    color: '#F59E0B',
    is_default: true,
    is_public: true,
    usage_count: 0,
    template_data: {
      title_template: 'Refactor {{component_name}}',
      description_template: 'Refactor {{component_name}} to improve code quality, maintainability, and performance.\n\n## Refactoring Goals\n- {{goal_1}}\n- {{goal_2}}\n- {{goal_3}}\n\n## Current Issues\n- {{issue_1}}\n- {{issue_2}}\n\n## Refactoring Plan\n- [ ] Analyze current code\n- [ ] Design new structure\n- [ ] Implement changes\n- [ ] Update tests\n- [ ] Verify functionality',
      priority: TaskPriority.MEDIUM,
      type: TaskType.REFACTOR,
      estimated_duration_hours: 6,
      default_tags: ['refactor', 'code-quality', 'maintenance'],
      workflow_phase: WorkflowPhase.AUDIT,
      subtasks: [
        {
          title: 'Analyze current code',
          description: 'Review existing code and identify improvement areas',
          priority: TaskPriority.MEDIUM,
          type: TaskType.RESEARCH,
          estimated_duration_hours: 2,
          order: 1
        },
        {
          title: 'Design refactoring approach',
          description: 'Plan the refactoring strategy',
          priority: TaskPriority.MEDIUM,
          type: TaskType.PLANNING,
          estimated_duration_hours: 1,
          order: 2
        },
        {
          title: 'Implement refactoring',
          description: 'Execute the refactoring changes',
          priority: TaskPriority.MEDIUM,
          type: TaskType.REFACTOR,
          estimated_duration_hours: 3,
          order: 3
        }
      ],
      checklist: [
        {
          description: 'Code analysis completed',
          required: true,
          order: 1
        },
        {
          description: 'Refactoring plan approved',
          required: true,
          order: 2
        },
        {
          description: 'All tests passing',
          required: true,
          order: 3
        },
        {
          description: 'Performance maintained or improved',
          required: true,
          order: 4
        }
      ]
    },
    tags: ['refactor', 'template'],
    metadata: {}
  },

  {
    name: 'Security Audit',
    description: 'Template for conducting security audits and vulnerability assessments',
    category: TaskTemplateCategory.SECURITY,
    icon: 'Shield',
    color: '#DC2626',
    is_default: true,
    is_public: true,
    usage_count: 0,
    template_data: {
      title_template: 'Security audit for {{component_name}}',
      description_template: 'Conduct comprehensive security audit for {{component_name}}.\n\n## Audit Scope\n- {{scope_1}}\n- {{scope_2}}\n- {{scope_3}}\n\n## Security Checks\n- [ ] Authentication mechanisms\n- [ ] Authorization controls\n- [ ] Input validation\n- [ ] Data encryption\n- [ ] API security\n- [ ] Dependency vulnerabilities\n\n## Findings\n- {{finding_1}}\n- {{finding_2}}',
      priority: TaskPriority.HIGH,
      type: TaskType.SECURITY,
      estimated_duration_hours: 8,
      default_tags: ['security', 'audit', 'vulnerability'],
      workflow_phase: WorkflowPhase.AUDIT,
      subtasks: [
        {
          title: 'Security assessment',
          description: 'Evaluate current security posture',
          priority: TaskPriority.HIGH,
          type: TaskType.SECURITY,
          estimated_duration_hours: 4,
          order: 1
        },
        {
          title: 'Vulnerability scan',
          description: 'Run automated security scans',
          priority: TaskPriority.HIGH,
          type: TaskType.SECURITY,
          estimated_duration_hours: 2,
          order: 2
        },
        {
          title: 'Report findings',
          description: 'Document security findings and recommendations',
          priority: TaskPriority.MEDIUM,
          type: TaskType.DOCUMENTATION,
          estimated_duration_hours: 2,
          order: 3
        }
      ],
      checklist: [
        {
          description: 'Security assessment completed',
          required: true,
          order: 1
        },
        {
          description: 'Vulnerabilities identified and documented',
          required: true,
          order: 2
        },
        {
          description: 'Remediation plan created',
          required: true,
          order: 3
        },
        {
          description: 'Stakeholders notified',
          required: true,
          order: 4
        }
      ]
    },
    tags: ['security', 'template'],
    metadata: {}
  },

  {
    name: 'Performance Optimization',
    description: 'Template for optimizing application performance',
    category: TaskTemplateCategory.PERFORMANCE,
    icon: 'Zap',
    color: '#10B981',
    is_default: true,
    is_public: true,
    usage_count: 0,
    template_data: {
      title_template: 'Optimize {{component_name}} performance',
      description_template: 'Optimize {{component_name}} for better performance.\n\n## Performance Goals\n- {{goal_1}}\n- {{goal_2}}\n\n## Current Metrics\n- **Load Time**: {{current_load_time}}\n- **Response Time**: {{current_response_time}}\n- **Memory Usage**: {{current_memory}}\n\n## Optimization Plan\n- [ ] Profile current performance\n- [ ] Identify bottlenecks\n- [ ] Implement optimizations\n- [ ] Measure improvements\n- [ ] Document changes',
      priority: TaskPriority.MEDIUM,
      type: TaskType.PERFORMANCE,
      estimated_duration_hours: 6,
      default_tags: ['performance', 'optimization', 'monitoring'],
      workflow_phase: WorkflowPhase.AUDIT,
      subtasks: [
        {
          title: 'Performance profiling',
          description: 'Analyze current performance metrics',
          priority: TaskPriority.MEDIUM,
          type: TaskType.RESEARCH,
          estimated_duration_hours: 2,
          order: 1
        },
        {
          title: 'Implement optimizations',
          description: 'Apply performance improvements',
          priority: TaskPriority.MEDIUM,
          type: TaskType.PERFORMANCE,
          estimated_duration_hours: 3,
          order: 2
        },
        {
          title: 'Performance testing',
          description: 'Validate performance improvements',
          priority: TaskPriority.MEDIUM,
          type: TaskType.TEST,
          estimated_duration_hours: 1,
          order: 3
        }
      ],
      checklist: [
        {
          description: 'Baseline metrics established',
          required: true,
          order: 1
        },
        {
          description: 'Bottlenecks identified',
          required: true,
          order: 2
        },
        {
          description: 'Optimizations implemented',
          required: true,
          order: 3
        },
        {
          description: 'Performance improvements verified',
          required: true,
          order: 4
        }
      ]
    },
    tags: ['performance', 'template'],
    metadata: {}
  },

  {
    name: 'Documentation Update',
    description: 'Template for updating project documentation',
    category: TaskTemplateCategory.DOCUMENTATION,
    icon: 'BookOpen',
    color: '#8B5CF6',
    is_default: true,
    is_public: true,
    usage_count: 0,
    template_data: {
      title_template: 'Update {{documentation_type}} documentation',
      description_template: 'Update {{documentation_type}} documentation to reflect current state.\n\n## Documentation Scope\n- {{scope_1}}\n- {{scope_2}}\n\n## Updates Needed\n- [ ] Review existing documentation\n- [ ] Identify outdated information\n- [ ] Update content\n- [ ] Add new sections\n- [ ] Review and proofread\n- [ ] Publish updates',
      priority: TaskPriority.LOW,
      type: TaskType.DOCUMENTATION,
      estimated_duration_hours: 4,
      default_tags: ['documentation', 'maintenance', 'content'],
      workflow_phase: WorkflowPhase.AUDIT,
      subtasks: [
        {
          title: 'Review existing docs',
          description: 'Audit current documentation for accuracy',
          priority: TaskPriority.LOW,
          type: TaskType.DOCUMENTATION,
          estimated_duration_hours: 1,
          order: 1
        },
        {
          title: 'Update content',
          description: 'Write and update documentation content',
          priority: TaskPriority.LOW,
          type: TaskType.DOCUMENTATION,
          estimated_duration_hours: 2,
          order: 2
        },
        {
          title: 'Review and publish',
          description: 'Review changes and publish updates',
          priority: TaskPriority.LOW,
          type: TaskType.DOCUMENTATION,
          estimated_duration_hours: 1,
          order: 3
        }
      ],
      checklist: [
        {
          description: 'Content reviewed for accuracy',
          required: true,
          order: 1
        },
        {
          description: 'Updates implemented',
          required: true,
          order: 2
        },
        {
          description: 'Content proofread',
          required: true,
          order: 3
        },
        {
          description: 'Documentation published',
          required: true,
          order: 4
        }
      ]
    },
    tags: ['documentation', 'template'],
    metadata: {}
  },

  {
    name: 'Testing Implementation',
    description: 'Template for implementing comprehensive testing',
    category: TaskTemplateCategory.TESTING,
    icon: 'TestTube',
    color: '#06B6D4',
    is_default: true,
    is_public: true,
    usage_count: 0,
    template_data: {
      title_template: 'Implement testing for {{component_name}}',
      description_template: 'Implement comprehensive testing for {{component_name}}.\n\n## Testing Scope\n- {{scope_1}}\n- {{scope_2}}\n\n## Test Types\n- [ ] Unit tests\n- [ ] Integration tests\n- [ ] End-to-end tests\n- [ ] Performance tests\n- [ ] Security tests\n\n## Test Coverage Goals\n- **Unit Tests**: {{unit_coverage}}%\n- **Integration Tests**: {{integration_coverage}}%',
      priority: TaskPriority.MEDIUM,
      type: TaskType.TEST,
      estimated_duration_hours: 6,
      default_tags: ['testing', 'quality-assurance', 'automation'],
      workflow_phase: WorkflowPhase.AUDIT,
      subtasks: [
        {
          title: 'Test planning',
          description: 'Plan testing strategy and coverage',
          priority: TaskPriority.MEDIUM,
          type: TaskType.PLANNING,
          estimated_duration_hours: 1,
          order: 1
        },
        {
          title: 'Write unit tests',
          description: 'Implement unit test suite',
          priority: TaskPriority.MEDIUM,
          type: TaskType.TEST,
          estimated_duration_hours: 3,
          order: 2
        },
        {
          title: 'Write integration tests',
          description: 'Implement integration test suite',
          priority: TaskPriority.MEDIUM,
          type: TaskType.TEST,
          estimated_duration_hours: 2,
          order: 3
        }
      ],
      checklist: [
        {
          description: 'Test plan created',
          required: true,
          order: 1
        },
        {
          description: 'Unit tests implemented',
          required: true,
          order: 2
        },
        {
          description: 'Integration tests implemented',
          required: true,
          order: 3
        },
        {
          description: 'Test coverage goals met',
          required: true,
          order: 4
        }
      ]
    },
    tags: ['testing', 'template'],
    metadata: {}
  }
];

export default DEFAULT_TASK_TEMPLATES;
