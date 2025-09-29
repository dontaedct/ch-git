/**
 * Conditional Logic Engine
 *
 * Evaluates conditional logic for components and form fields
 * based on manifest configuration.
 */

interface ConditionalLogic {
  field: string;
  operator: 'equals' | 'not-equals' | 'contains' | 'isEmpty' | 'isNotEmpty' | 'greaterThan' | 'lessThan';
  value: any;
  action: 'show' | 'hide' | 'require' | 'optional' | 'setValue';
}

export class ConditionalLogicEngine {
  evaluateCondition(condition: ConditionalLogic, data: any[]): boolean {
    // Simplified conditional logic evaluation
    const fieldValue = this.getFieldValue(condition.field, data);

    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'not-equals':
        return fieldValue !== condition.value;
      case 'contains':
        return String(fieldValue).includes(String(condition.value));
      case 'isEmpty':
        return !fieldValue || fieldValue === '';
      case 'isNotEmpty':
        return fieldValue && fieldValue !== '';
      case 'greaterThan':
        return Number(fieldValue) > Number(condition.value);
      case 'lessThan':
        return Number(fieldValue) < Number(condition.value);
      default:
        return true;
    }
  }

  evaluateFieldCondition(condition: ConditionalLogic, formData: Record<string, any>): boolean {
    const fieldValue = formData[condition.field];

    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'not-equals':
        return fieldValue !== condition.value;
      case 'contains':
        return String(fieldValue || '').includes(String(condition.value));
      case 'isEmpty':
        return !fieldValue || fieldValue === '';
      case 'isNotEmpty':
        return fieldValue && fieldValue !== '';
      case 'greaterThan':
        return Number(fieldValue) > Number(condition.value);
      case 'lessThan':
        return Number(fieldValue) < Number(condition.value);
      default:
        return true;
    }
  }

  private getFieldValue(fieldId: string, data: any[]): any {
    // Extract field value from data array
    const field = data.find(item => item.id === fieldId);
    return field?.props?.value || field?.value;
  }
}

export default ConditionalLogicEngine;