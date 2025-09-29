'use client';

/**
 * Questionnaire Builder Component
 *
 * Advanced questionnaire customization interface with drag-and-drop question ordering,
 * conditional logic builder, and real-time validation.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  templateCustomizations,
  type TemplateCustomization,
  type QuestionnaireCustomizations
} from '@/lib/templates/customization-engine';
import type { QuestionnaireConfig } from '@/components/questionnaire-engine';
import {
  Plus,
  Trash2,
  Edit,
  Eye,
  Move,
  Copy,
  Settings,
  AlertTriangle,
  CheckCircle,
  Info,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Type,
  List,
  CheckSquare,
  Radio,
  Calendar,
  Hash,
  Mail,
  Phone,
  Link,
  FileText,
  ToggleLeft,
  Star,
  Sliders
} from 'lucide-react';

interface QuestionnaireBuilderProps {
  customization: TemplateCustomization;
  baseQuestionnaire: QuestionnaireConfig;
  onCustomizationUpdate: (updates: Partial<TemplateCustomization>) => void;
  allowEditing?: boolean;
  className?: string;
}

interface QuestionType {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  hasOptions: boolean;
  validation?: string[];
}

interface ConditionalRule {
  id: string;
  trigger_question: string;
  trigger_value: any;
  action: 'show' | 'hide' | 'require' | 'skip_to';
  target: string;
}

interface ValidationRule {
  id: string;
  question_id: string;
  rule_type: 'required' | 'min_length' | 'max_length' | 'pattern' | 'custom';
  rule_value: any;
  error_message: string;
}

const QUESTION_TYPES: QuestionType[] = [
  {
    id: 'text',
    name: 'Short Text',
    icon: Type,
    description: 'Single line text input',
    hasOptions: false,
    validation: ['required', 'min_length', 'max_length', 'pattern']
  },
  {
    id: 'long-text',
    name: 'Long Text',
    icon: FileText,
    description: 'Multi-line text area',
    hasOptions: false,
    validation: ['required', 'min_length', 'max_length']
  },
  {
    id: 'email',
    name: 'Email',
    icon: Mail,
    description: 'Email address input',
    hasOptions: false,
    validation: ['required', 'pattern']
  },
  {
    id: 'phone',
    name: 'Phone',
    icon: Phone,
    description: 'Phone number input',
    hasOptions: false,
    validation: ['required', 'pattern']
  },
  {
    id: 'number',
    name: 'Number',
    icon: Hash,
    description: 'Numeric input',
    hasOptions: false,
    validation: ['required', 'min_value', 'max_value']
  },
  {
    id: 'select',
    name: 'Dropdown',
    icon: List,
    description: 'Single selection dropdown',
    hasOptions: true,
    validation: ['required']
  },
  {
    id: 'radio',
    name: 'Radio Buttons',
    icon: Radio,
    description: 'Single selection radio buttons',
    hasOptions: true,
    validation: ['required']
  },
  {
    id: 'checkbox',
    name: 'Checkboxes',
    icon: CheckSquare,
    description: 'Multiple selection checkboxes',
    hasOptions: true,
    validation: ['required', 'min_selections', 'max_selections']
  },
  {
    id: 'chips',
    name: 'Choice Chips',
    icon: CheckSquare,
    description: 'Single selection chips',
    hasOptions: true,
    validation: ['required']
  },
  {
    id: 'chips-multi',
    name: 'Multi-Choice Chips',
    icon: CheckSquare,
    description: 'Multiple selection chips',
    hasOptions: true,
    validation: ['required', 'min_selections', 'max_selections']
  },
  {
    id: 'rating',
    name: 'Rating Scale',
    icon: Star,
    description: 'Star or numeric rating',
    hasOptions: true,
    validation: ['required']
  },
  {
    id: 'slider',
    name: 'Slider',
    icon: Sliders,
    description: 'Range slider input',
    hasOptions: false,
    validation: ['required', 'min_value', 'max_value']
  },
  {
    id: 'date',
    name: 'Date',
    icon: Calendar,
    description: 'Date picker',
    hasOptions: false,
    validation: ['required', 'min_date', 'max_date']
  },
  {
    id: 'url',
    name: 'URL',
    icon: Link,
    description: 'Website URL input',
    hasOptions: false,
    validation: ['required', 'pattern']
  },
  {
    id: 'toggle',
    name: 'Toggle/Switch',
    icon: ToggleLeft,
    description: 'Boolean toggle switch',
    hasOptions: false,
    validation: ['required']
  }
];

export function QuestionnaireBuilder({
  customization,
  baseQuestionnaire,
  onCustomizationUpdate,
  allowEditing = true,
  className = ''
}: QuestionnaireBuilderProps) {
  const [activeTab, setActiveTab] = useState<'structure' | 'questions' | 'logic' | 'validation'>('structure');
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<{ type: 'question' | 'step'; id: string } | null>(null);

  const questionnaireCustomizations = customization.questionnaire_customizations;

  // Computed values
  const modifiedQuestionnaire = useMemo(() => {
    return templateCustomizations.applyToTemplate(customization.id, {
      questionnaire: baseQuestionnaire
    } as any).questionnaire;
  }, [customization, baseQuestionnaire]);

  const updateQuestionnaireField = useCallback((field: string, value: any) => {
    if (!allowEditing) return;

    const updates: Partial<TemplateCustomization> = {
      questionnaire_customizations: {
        ...questionnaireCustomizations
      }
    };

    // Handle nested field updates
    const parts = field.split('.');
    let current: any = updates.questionnaire_customizations;

    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) current[parts[i]] = [];
      current = current[parts[i]];
    }

    if (Array.isArray(current)) {
      current.push(value);
    } else {
      current[parts[parts.length - 1]] = value;
    }

    onCustomizationUpdate(updates);
  }, [questionnaireCustomizations, onCustomizationUpdate, allowEditing]);

  const addNewQuestion = (stepId: string, questionType: string) => {
    const newQuestion = {
      id: `question-${Date.now()}`,
      step_id: stepId,
      position: getQuestionsForStep(stepId).length,
      text: 'New Question',
      type: questionType,
      required: false,
      options: QUESTION_TYPES.find(qt => qt.id === questionType)?.hasOptions ? [
        { value: 'option1', label: 'Option 1' }
      ] : undefined
    };

    updateQuestionnaireField('added_questions', newQuestion);
  };

  const addNewStep = () => {
    const newStep = {
      id: `step-${Date.now()}`,
      title: 'New Step',
      description: '',
      position: baseQuestionnaire.steps.length + questionnaireCustomizations.added_steps.length,
      questions: []
    };

    updateQuestionnaireField('added_steps', newStep);
  };

  const getQuestionsForStep = (stepId: string) => {
    const baseStep = baseQuestionnaire.steps.find(s => s.id === stepId);
    const baseQuestions = baseStep?.questions || [];
    const addedQuestions = questionnaireCustomizations.added_questions.filter(q => q.step_id === stepId);
    const removedQuestionIds = new Set(questionnaireCustomizations.removed_questions);

    return [
      ...baseQuestions.filter(q => !removedQuestionIds.has(q.id)),
      ...addedQuestions
    ];
  };

  const updateQuestion = (questionId: string, changes: any) => {
    const existingIndex = questionnaireCustomizations.modified_questions.findIndex(mq => mq.question_id === questionId);

    if (existingIndex >= 0) {
      const updated = [...questionnaireCustomizations.modified_questions];
      updated[existingIndex] = {
        ...updated[existingIndex],
        changes: { ...updated[existingIndex].changes, ...changes }
      };

      onCustomizationUpdate({
        questionnaire_customizations: {
          ...questionnaireCustomizations,
          modified_questions: updated
        }
      });
    } else {
      updateQuestionnaireField('modified_questions', {
        question_id: questionId,
        changes
      });
    }
  };

  const removeQuestion = (questionId: string) => {
    const isBaseQuestion = baseQuestionnaire.steps.some(step =>
      step.questions.some(q => q.id === questionId)
    );

    if (isBaseQuestion) {
      updateQuestionnaireField('removed_questions', questionId);
    } else {
      // Remove from added questions
      const updatedAdded = questionnaireCustomizations.added_questions.filter(q => q.id !== questionId);
      onCustomizationUpdate({
        questionnaire_customizations: {
          ...questionnaireCustomizations,
          added_questions: updatedAdded
        }
      });
    }
  };

  const addConditionalRule = () => {
    const newRule: ConditionalRule = {
      id: `rule-${Date.now()}`,
      trigger_question: '',
      trigger_value: '',
      action: 'show',
      target: ''
    };

    updateQuestionnaireField('conditional_logic', newRule);
  };

  const addValidationRule = () => {
    const newRule: ValidationRule = {
      id: `validation-${Date.now()}`,
      question_id: '',
      rule_type: 'required',
      rule_value: true,
      error_message: 'This field is required'
    };

    updateQuestionnaireField('custom_validation', newRule);
  };

  const renderStructureTab = () => (
    <div className="space-y-6">
      {/* Steps Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Questionnaire Structure</CardTitle>
              <CardDescription>
                Manage steps and overall questionnaire flow
              </CardDescription>
            </div>
            {allowEditing && (
              <Button onClick={addNewStep} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Step
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {baseQuestionnaire.steps.map((step, index) => (
              <Card
                key={step.id}
                className={`transition-all cursor-pointer ${
                  selectedStep === step.id ? 'ring-2 ring-blue-500' : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedStep(step.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium">{step.title}</h4>
                        <p className="text-sm text-gray-600">
                          {getQuestionsForStep(step.id).length} questions
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {step.questions.length} base
                      </Badge>
                      {questionnaireCustomizations.added_questions.filter(q => q.step_id === step.id).length > 0 && (
                        <Badge variant="secondary">
                          +{questionnaireCustomizations.added_questions.filter(q => q.step_id === step.id).length} added
                        </Badge>
                      )}
                      {allowEditing && (
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Added Steps */}
            {questionnaireCustomizations.added_steps.map((step, index) => (
              <Card
                key={step.id}
                className="border-dashed border-2 border-green-300 bg-green-50"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-600 rounded-full text-sm font-medium">
                        {baseQuestionnaire.steps.length + index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium">{step.title}</h4>
                        <Badge variant="secondary" className="mt-1">New Step</Badge>
                      </div>
                    </div>
                    {allowEditing && (
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Questionnaire Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Questionnaire Settings</CardTitle>
          <CardDescription>
            Configure overall questionnaire behavior
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Progress Style</Label>
              <select
                value={baseQuestionnaire.progress?.style || 'bar'}
                onChange={(e) => {/* Update progress style */}}
                disabled={!allowEditing}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-50"
              >
                <option value="bar">Progress Bar</option>
                <option value="steps">Step Indicators</option>
                <option value="percentage">Percentage</option>
              </select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={baseQuestionnaire.progress?.showNumbers || false}
                  disabled={!allowEditing}
                />
                <Label>Show Step Numbers</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={baseQuestionnaire.progress?.showTitles || false}
                  disabled={!allowEditing}
                />
                <Label>Show Step Titles</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderQuestionsTab = () => (
    <div className="space-y-6">
      {/* Question Palette */}
      {allowEditing && (
        <Card>
          <CardHeader>
            <CardTitle>Question Types</CardTitle>
            <CardDescription>
              Drag or click to add new questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {QUESTION_TYPES.map((questionType) => (
                <Button
                  key={questionType.id}
                  variant="outline"
                  size="sm"
                  className="h-auto p-3 flex flex-col items-center space-y-2"
                  onClick={() => selectedStep && addNewQuestion(selectedStep, questionType.id)}
                  disabled={!selectedStep}
                  title={questionType.description}
                >
                  <questionType.icon className="h-5 w-5" />
                  <span className="text-xs text-center">{questionType.name}</span>
                </Button>
              ))}
            </div>
            {!selectedStep && (
              <p className="text-sm text-gray-500 mt-3">
                Select a step first to add questions
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Questions List */}
      {selectedStep && (
        <Card>
          <CardHeader>
            <CardTitle>
              Questions for {baseQuestionnaire.steps.find(s => s.id === selectedStep)?.title}
            </CardTitle>
            <CardDescription>
              Manage questions in this step
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getQuestionsForStep(selectedStep).map((question, index) => (
                <QuestionEditor
                  key={question.id}
                  question={question}
                  index={index}
                  onUpdate={(changes) => updateQuestion(question.id, changes)}
                  onRemove={() => removeQuestion(question.id)}
                  allowEditing={allowEditing}
                  isSelected={selectedQuestion === question.id}
                  onSelect={() => setSelectedQuestion(question.id)}
                />
              ))}

              {getQuestionsForStep(selectedStep).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Info className="h-8 w-8 mx-auto mb-2" />
                  <p>No questions in this step yet.</p>
                  {allowEditing && (
                    <p className="text-sm">Use the question types above to add questions.</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderLogicTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Conditional Logic</CardTitle>
              <CardDescription>
                Show, hide, or require questions based on user responses
              </CardDescription>
            </div>
            {allowEditing && (
              <Button onClick={addConditionalRule} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Rule
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {questionnaireCustomizations.conditional_logic.map((rule, index) => (
              <ConditionalRuleEditor
                key={rule.id}
                rule={rule}
                questions={modifiedQuestionnaire.steps.flatMap(s => s.questions)}
                onUpdate={(updatedRule) => {
                  const updated = [...questionnaireCustomizations.conditional_logic];
                  updated[index] = updatedRule;
                  onCustomizationUpdate({
                    questionnaire_customizations: {
                      ...questionnaireCustomizations,
                      conditional_logic: updated
                    }
                  });
                }}
                onRemove={() => {
                  const updated = questionnaireCustomizations.conditional_logic.filter(r => r.id !== rule.id);
                  onCustomizationUpdate({
                    questionnaire_customizations: {
                      ...questionnaireCustomizations,
                      conditional_logic: updated
                    }
                  });
                }}
                allowEditing={allowEditing}
              />
            ))}

            {questionnaireCustomizations.conditional_logic.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Settings className="h-8 w-8 mx-auto mb-2" />
                <p>No conditional logic rules defined.</p>
                {allowEditing && (
                  <p className="text-sm">Add rules to create dynamic questionnaires.</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderValidationTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Validation Rules</CardTitle>
              <CardDescription>
                Set custom validation rules for questions
              </CardDescription>
            </div>
            {allowEditing && (
              <Button onClick={addValidationRule} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Rule
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {questionnaireCustomizations.custom_validation.map((rule, index) => (
              <ValidationRuleEditor
                key={rule.id}
                rule={rule}
                questions={modifiedQuestionnaire.steps.flatMap(s => s.questions)}
                onUpdate={(updatedRule) => {
                  const updated = [...questionnaireCustomizations.custom_validation];
                  updated[index] = updatedRule;
                  onCustomizationUpdate({
                    questionnaire_customizations: {
                      ...questionnaireCustomizations,
                      custom_validation: updated
                    }
                  });
                }}
                onRemove={() => {
                  const updated = questionnaireCustomizations.custom_validation.filter(r => r.id !== rule.id);
                  onCustomizationUpdate({
                    questionnaire_customizations: {
                      ...questionnaireCustomizations,
                      custom_validation: updated
                    }
                  });
                }}
                allowEditing={allowEditing}
              />
            ))}

            {questionnaireCustomizations.custom_validation.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                <p>No custom validation rules defined.</p>
                {allowEditing && (
                  <p className="text-sm">Add rules to enhance data quality.</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className={`questionnaire-builder ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Questionnaire Builder</h2>
          <p className="text-gray-600 mt-1">
            Customize questions, steps, and flow logic for your consultation questionnaire
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="structure">Structure</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="logic">Logic</TabsTrigger>
            <TabsTrigger value="validation">Validation</TabsTrigger>
          </TabsList>

          <TabsContent value="structure">
            {renderStructureTab()}
          </TabsContent>

          <TabsContent value="questions">
            {renderQuestionsTab()}
          </TabsContent>

          <TabsContent value="logic">
            {renderLogicTab()}
          </TabsContent>

          <TabsContent value="validation">
            {renderValidationTab()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Question Editor Component
function QuestionEditor({
  question,
  index,
  onUpdate,
  onRemove,
  allowEditing,
  isSelected,
  onSelect
}: {
  question: any;
  index: number;
  onUpdate: (changes: any) => void;
  onRemove: () => void;
  allowEditing: boolean;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const questionType = QUESTION_TYPES.find(qt => qt.id === question.type);

  return (
    <Card
      className={`transition-all cursor-pointer ${
        isSelected ? 'ring-2 ring-blue-500' : 'hover:bg-gray-50'
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <GripVertical className="h-4 w-4 text-gray-400" />
                <Badge variant="outline" className="text-xs">
                  {index + 1}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                {questionType && <questionType.icon className="h-4 w-4 text-gray-600" />}
                <span className="text-sm text-gray-600">{questionType?.name || question.type}</span>
              </div>
              {question.required && (
                <Badge variant="destructive" className="text-xs">Required</Badge>
              )}
            </div>
            {allowEditing && (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onRemove(); }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div>
            <Label>Question Text</Label>
            <Textarea
              value={question.text}
              onChange={(e) => onUpdate({ text: e.target.value })}
              disabled={!allowEditing}
              placeholder="Enter your question..."
              rows={2}
              className="mt-1"
            />
          </div>

          {questionType?.hasOptions && (
            <div>
              <Label>Answer Options</Label>
              <div className="space-y-2 mt-1">
                {(question.options || []).map((option: any, optionIndex: number) => (
                  <div key={optionIndex} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={option.label}
                      onChange={(e) => {
                        const updatedOptions = [...(question.options || [])];
                        updatedOptions[optionIndex] = { ...option, label: e.target.value };
                        onUpdate({ options: updatedOptions });
                      }}
                      disabled={!allowEditing}
                      placeholder={`Option ${optionIndex + 1}`}
                      className="flex-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                    />
                    {allowEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const updatedOptions = (question.options || []).filter((_: any, i: number) => i !== optionIndex);
                          onUpdate({ options: updatedOptions });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {allowEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newOption = { value: `option${(question.options || []).length + 1}`, label: '' };
                      onUpdate({ options: [...(question.options || []), newOption] });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Option
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={question.required || false}
                onCheckedChange={(checked) => onUpdate({ required: checked })}
                disabled={!allowEditing}
              />
              <Label>Required</Label>
            </div>
            {allowEditing && (
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Advanced
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Conditional Rule Editor Component
function ConditionalRuleEditor({
  rule,
  questions,
  onUpdate,
  onRemove,
  allowEditing
}: {
  rule: ConditionalRule;
  questions: any[];
  onUpdate: (rule: ConditionalRule) => void;
  onRemove: () => void;
  allowEditing: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Conditional Rule</h4>
            {allowEditing && (
              <Button variant="ghost" size="sm" onClick={onRemove}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>When Question</Label>
              <select
                value={rule.trigger_question}
                onChange={(e) => onUpdate({ ...rule, trigger_question: e.target.value })}
                disabled={!allowEditing}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-50"
              >
                <option value="">Select question...</option>
                {questions.map(q => (
                  <option key={q.id} value={q.id}>{q.text}</option>
                ))}
              </select>
            </div>

            <div>
              <Label>Has Value</Label>
              <input
                type="text"
                value={rule.trigger_value}
                onChange={(e) => onUpdate({ ...rule, trigger_value: e.target.value })}
                disabled={!allowEditing}
                placeholder="Enter value..."
                className="w-full mt-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Action</Label>
              <select
                value={rule.action}
                onChange={(e) => onUpdate({ ...rule, action: e.target.value as any })}
                disabled={!allowEditing}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-50"
              >
                <option value="show">Show</option>
                <option value="hide">Hide</option>
                <option value="require">Require</option>
                <option value="skip_to">Skip To</option>
              </select>
            </div>

            <div>
              <Label>Target</Label>
              <select
                value={rule.target}
                onChange={(e) => onUpdate({ ...rule, target: e.target.value })}
                disabled={!allowEditing}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-50"
              >
                <option value="">Select target...</option>
                {questions.map(q => (
                  <option key={q.id} value={q.id}>{q.text}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Validation Rule Editor Component
function ValidationRuleEditor({
  rule,
  questions,
  onUpdate,
  onRemove,
  allowEditing
}: {
  rule: ValidationRule;
  questions: any[];
  onUpdate: (rule: ValidationRule) => void;
  onRemove: () => void;
  allowEditing: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Validation Rule</h4>
            {allowEditing && (
              <Button variant="ghost" size="sm" onClick={onRemove}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Question</Label>
              <select
                value={rule.question_id}
                onChange={(e) => onUpdate({ ...rule, question_id: e.target.value })}
                disabled={!allowEditing}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-50"
              >
                <option value="">Select question...</option>
                {questions.map(q => (
                  <option key={q.id} value={q.id}>{q.text}</option>
                ))}
              </select>
            </div>

            <div>
              <Label>Rule Type</Label>
              <select
                value={rule.rule_type}
                onChange={(e) => onUpdate({ ...rule, rule_type: e.target.value as any })}
                disabled={!allowEditing}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-50"
              >
                <option value="required">Required</option>
                <option value="min_length">Minimum Length</option>
                <option value="max_length">Maximum Length</option>
                <option value="pattern">Pattern</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <Label>Value</Label>
              <input
                type="text"
                value={rule.rule_value}
                onChange={(e) => onUpdate({ ...rule, rule_value: e.target.value })}
                disabled={!allowEditing}
                placeholder="Rule value..."
                className="w-full mt-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-50"
              />
            </div>
          </div>

          <div>
            <Label>Error Message</Label>
            <input
              type="text"
              value={rule.error_message}
              onChange={(e) => onUpdate({ ...rule, error_message: e.target.value })}
              disabled={!allowEditing}
              placeholder="Error message to show..."
              className="w-full mt-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-50"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}