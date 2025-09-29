"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ConditionalRule {
  id: string
  fieldId: string
  operator: 'equals' | 'notEquals' | 'contains' | 'notContains' | 'greaterThan' | 'lessThan' | 'isEmpty' | 'isNotEmpty'
  value: string
  action: 'show' | 'hide' | 'enable' | 'disable' | 'require' | 'optional'
}

export interface ConditionalLogic {
  rules: ConditionalRule[]
  logic: 'AND' | 'OR'
}

interface ConditionalLogicEditorProps {
  conditionalLogic?: ConditionalLogic
  onChange: (logic: ConditionalLogic) => void
  availableFields: Array<{
    id: string
    label: string
    type: string
  }>
  className?: string
}

export function ConditionalLogicEditor({
  conditionalLogic = { rules: [], logic: 'AND' },
  onChange,
  availableFields,
  className
}: ConditionalLogicEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const addRule = () => {
    const newRule: ConditionalRule = {
      id: `rule_${Date.now()}`,
      fieldId: availableFields[0]?.id || '',
      operator: 'equals',
      value: '',
      action: 'show'
    }
    
    onChange({
      ...conditionalLogic,
      rules: [...conditionalLogic.rules, newRule]
    })
  }

  const updateRule = (ruleId: string, updates: Partial<ConditionalRule>) => {
    const updatedRules = conditionalLogic.rules.map(rule =>
      rule.id === ruleId ? { ...rule, ...updates } : rule
    )
    
    onChange({
      ...conditionalLogic,
      rules: updatedRules
    })
  }

  const removeRule = (ruleId: string) => {
    const updatedRules = conditionalLogic.rules.filter(rule => rule.id !== ruleId)
    
    onChange({
      ...conditionalLogic,
      rules: updatedRules
    })
  }

  const getOperatorOptions = (fieldType: string) => {
    const baseOperators = [
      { value: 'equals', label: 'Equals' },
      { value: 'notEquals', label: 'Does not equal' },
      { value: 'isEmpty', label: 'Is empty' },
      { value: 'isNotEmpty', label: 'Is not empty' }
    ]

    const textOperators = [
      { value: 'contains', label: 'Contains' },
      { value: 'notContains', label: 'Does not contain' }
    ]

    const numberOperators = [
      { value: 'greaterThan', label: 'Greater than' },
      { value: 'lessThan', label: 'Less than' }
    ]

    switch (fieldType) {
      case 'text':
      case 'email':
      case 'textarea':
      case 'url':
        return [...baseOperators, ...textOperators]
      case 'number':
      case 'range':
      case 'rating':
        return [...baseOperators, ...numberOperators]
      case 'select':
      case 'radio':
      case 'checkbox':
        return baseOperators
      default:
        return baseOperators
    }
  }

  const getActionOptions = () => [
    { value: 'show', label: 'Show field' },
    { value: 'hide', label: 'Hide field' },
    { value: 'enable', label: 'Enable field' },
    { value: 'disable', label: 'Disable field' },
    { value: 'require', label: 'Make required' },
    { value: 'optional', label: 'Make optional' }
  ]

  const getFieldType = (fieldId: string) => {
    const field = availableFields.find(f => f.id === fieldId)
    return field?.type || 'text'
  }

  const shouldShowValueInput = (operator: string) => {
    return !['isEmpty', 'isNotEmpty'].includes(operator)
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Conditional Logic</CardTitle>
          <div className="flex items-center space-x-2">
            {conditionalLogic.rules.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {conditionalLogic.rules.length} rule{conditionalLogic.rules.length !== 1 ? 's' : ''}
              </Badge>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          {conditionalLogic.rules.length > 0 && (
            <div className="space-y-3">
              {conditionalLogic.rules.map((rule, index) => (
                <div key={rule.id} className="p-3 border border-gray-200 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Rule {index + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRule(rule.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <Label className="text-xs text-gray-600">Field</Label>
                      <Select
                        value={rule.fieldId}
                        onValueChange={(value) => updateRule(rule.id, { fieldId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select field" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableFields.map((field) => (
                            <SelectItem key={field.id} value={field.id}>
                              {field.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-gray-600">Condition</Label>
                      <Select
                        value={rule.operator}
                        onValueChange={(value) => updateRule(rule.id, { operator: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {getOperatorOptions(getFieldType(rule.fieldId)).map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {shouldShowValueInput(rule.operator) && (
                      <div>
                        <Label className="text-xs text-gray-600">Value</Label>
                        <Input
                          value={rule.value}
                          onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                          placeholder="Enter value"
                          className="text-sm"
                        />
                      </div>
                    )}
                    
                    <div>
                      <Label className="text-xs text-gray-600">Action</Label>
                      <Select
                        value={rule.action}
                        onValueChange={(value) => updateRule(rule.id, { action: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {getActionOptions().map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
              
              {conditionalLogic.rules.length > 1 && (
                <div className="flex items-center space-x-2">
                  <Label className="text-sm text-gray-600">Logic:</Label>
                  <Select
                    value={conditionalLogic.logic}
                    onValueChange={(value) => onChange({ ...conditionalLogic, logic: value as 'AND' | 'OR' })}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AND">AND</SelectItem>
                      <SelectItem value="OR">OR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addRule}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Rule
          </Button>
        </CardContent>
      )}
    </Card>
  )
}

export default ConditionalLogicEditor
