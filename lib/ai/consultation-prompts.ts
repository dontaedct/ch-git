/**
 * AI Prompts for Consultation Generation
 *
 * Specialized prompts optimized for business consultation generation,
 * service recommendations, and personalized content creation.
 */

import type { ServicePackage, ConsultationData } from './consultation-generator';

export interface PromptTemplate {
  name: string;
  description: string;
  template: string;
  variables: string[];
  temperature?: number;
  maxTokens?: number;
}

/**
 * Consultation prompt templates for different scenarios
 */
export class ConsultationPrompts {
  /**
   * Comprehensive consultation report generation
   */
  static readonly FULL_CONSULTATION: PromptTemplate = {
    name: 'full_consultation',
    description: 'Generate comprehensive business consultation with service recommendations',
    variables: ['client_info', 'responses', 'services', 'industry_context'],
    temperature: 0.7,
    maxTokens: 2500,
    template: `
# Business Consultation Report Generation

You are an expert business consultant generating a personalized consultation report. Create a comprehensive, actionable report based on the client's questionnaire responses and available service packages.

## Client Profile
**Name:** {{client_name}}
**Company:** {{company_name}}
**Industry:** {{industry}}
**Company Size:** {{company_size}}

## Questionnaire Analysis
{{questionnaire_responses}}

## Available Service Packages
{{service_packages}}

## Instructions
Generate a professional consultation report with the following structure:

### 1. Executive Summary (150-200 words)
- Synthesize the client's current situation, challenges, and opportunities
- Highlight key insights from their responses
- Preview the recommended approach

### 2. Business Analysis
- Current state assessment based on their responses
- Key challenges identified
- Opportunities for improvement
- Risk factors to consider

### 3. Service Recommendations
**Primary Recommendation:**
- Service name and description
- Why this service fits their specific needs
- Expected outcomes and benefits
- Timeline and implementation approach

**Alternative Options:**
- 2-3 additional services that could work
- Brief explanation of when each would be appropriate
- Comparison points vs. primary recommendation

### 4. Implementation Roadmap
- Phase 1: Immediate actions (0-30 days)
- Phase 2: Short-term initiatives (1-3 months)
- Phase 3: Long-term strategy (3-12 months)

### 5. Next Steps
- Specific action items for the client
- What they should prepare or consider
- How to move forward with recommendations

## Tone and Style
- Professional but approachable
- Specific and actionable (avoid generic advice)
- Data-driven based on their actual responses
- Confident in recommendations while acknowledging their situation is unique
- Use "you" and "your" to make it personal

Generate the consultation report now:
`
  };

  /**
   * Quick service recommendations
   */
  static readonly QUICK_RECOMMENDATIONS: PromptTemplate = {
    name: 'quick_recommendations',
    description: 'Generate fast service recommendations based on key criteria',
    variables: ['responses', 'services'],
    temperature: 0.6,
    maxTokens: 1000,
    template: `
# Quick Service Recommendation Engine

Analyze the client's questionnaire responses and recommend the top 3 most suitable services from the available options.

## Client Responses
{{questionnaire_responses}}

## Available Services
{{service_list}}

## Task
1. Analyze the client's business type, size, goals, and timeline
2. Match their needs with the most appropriate services
3. Rank the top 3 services in order of relevance
4. Provide a brief explanation for each recommendation

## Output Format
For each recommended service, provide:
- Service name
- Match score (1-10)
- Key reasons why it fits
- Best use case scenario

Focus on practical alignment between client needs and service capabilities.

Generate recommendations:
`
  };

  /**
   * Industry-specific consultation
   */
  static readonly INDUSTRY_FOCUSED: PromptTemplate = {
    name: 'industry_focused',
    description: 'Generate consultation focused on specific industry challenges',
    variables: ['industry', 'responses', 'services', 'industry_trends'],
    temperature: 0.7,
    maxTokens: 2000,
    template: `
# Industry-Specific Business Consultation

Generate a consultation report specifically tailored for the {{industry}} industry, incorporating current market trends and sector-specific challenges.

## Industry Context
**Sector:** {{industry}}
**Current Trends:** {{industry_trends}}
**Common Challenges:** {{industry_challenges}}

## Client Situation
{{questionnaire_responses}}

## Industry-Relevant Services
{{filtered_services}}

## Instructions
Create a consultation that:
1. Addresses industry-specific pain points mentioned in responses
2. References current {{industry}} market conditions
3. Recommends services most relevant to {{industry}} businesses
4. Includes industry benchmarks and best practices
5. Considers regulatory or compliance factors specific to {{industry}}

Structure the report with industry expertise and insider knowledge.

Generate industry-focused consultation:
`
  };

  /**
   * ROI-focused business case
   */
  static readonly ROI_BUSINESS_CASE: PromptTemplate = {
    name: 'roi_business_case',
    description: 'Generate consultation with strong focus on ROI and business impact',
    variables: ['responses', 'services', 'budget_info'],
    temperature: 0.6,
    maxTokens: 1800,
    template: `
# ROI-Focused Business Consultation

Create a data-driven consultation report that emphasizes return on investment, measurable outcomes, and business impact for each recommendation.

## Client Financial Context
**Budget Range:** {{budget_range}}
**Revenue Goals:** {{revenue_goals}}
**Timeline:** {{timeline}}

## Client Situation
{{questionnaire_responses}}

## Investment Options
{{service_packages_with_pricing}}

## Requirements
For each service recommendation, include:
1. **Investment Analysis**
   - Estimated costs and timeline
   - Expected ROI timeframe
   - Break-even analysis

2. **Measurable Outcomes**
   - Specific KPIs and metrics
   - Projected improvements
   - Risk mitigation value

3. **Business Impact**
   - Revenue generation potential
   - Cost savings opportunities
   - Efficiency gains

4. **Implementation ROI**
   - Quick wins (0-90 days)
   - Medium-term returns (3-12 months)
   - Long-term value (12+ months)

Focus on quantifiable benefits and realistic projections based on similar client scenarios.

Generate ROI-focused consultation:
`
  };

  /**
   * Executive summary for C-level stakeholders
   */
  static readonly EXECUTIVE_SUMMARY: PromptTemplate = {
    name: 'executive_summary',
    description: 'Concise summary for executive decision makers',
    variables: ['key_findings', 'recommendations', 'investment'],
    temperature: 0.5,
    maxTokens: 800,
    template: `
# Executive Summary - Strategic Consultation

Create a concise, high-level summary for C-level executives focusing on strategic impact and decision-making clarity.

## Key Assessment Findings
{{assessment_summary}}

## Strategic Recommendations
{{recommendations_summary}}

## Investment Overview
{{investment_summary}}

## Format Requirements
- Executive-level language (strategic, not tactical)
- Maximum 300 words total
- Clear action items and next steps
- Emphasize competitive advantage and growth potential
- Include timeline for decision making

Structure:
1. **Situation Assessment** (75 words)
2. **Strategic Recommendation** (100 words)
3. **Investment & Timeline** (75 words)
4. **Next Steps** (50 words)

Generate executive summary:
`
  };
}

/**
 * Prompt builder for dynamic prompt generation
 */
export class PromptBuilder {
  private template: PromptTemplate;
  private variables: Record<string, string> = {};

  constructor(template: PromptTemplate) {
    this.template = template;
  }

  /**
   * Set variable value for prompt
   */
  setVariable(name: string, value: string): this {
    if (!this.template.variables.includes(name)) {
      console.warn(`Variable '${name}' not defined in template '${this.template.name}'`);
    }
    this.variables[name] = value;
    return this;
  }

  /**
   * Set multiple variables at once
   */
  setVariables(vars: Record<string, string>): this {
    Object.entries(vars).forEach(([name, value]) => {
      this.setVariable(name, value);
    });
    return this;
  }

  /**
   * Build the final prompt with variable substitution
   */
  build(): string {
    let prompt = this.template.template;

    // Replace template variables
    Object.entries(this.variables).forEach(([name, value]) => {
      const placeholder = `{{${name}}}`;
      prompt = prompt.replace(new RegExp(placeholder, 'g'), value);
    });

    // Check for missing variables
    const missingVars = this.template.variables.filter(
      varName => !Object.keys(this.variables).includes(varName)
    );

    if (missingVars.length > 0) {
      console.warn(`Missing variables in prompt '${this.template.name}': ${missingVars.join(', ')}`);
    }

    return prompt;
  }

  /**
   * Get AI options for this prompt
   */
  getAIOptions() {
    return {
      temperature: this.template.temperature,
      maxTokens: this.template.maxTokens
    };
  }
}

/**
 * Utility functions for prompt generation
 */
export class PromptUtils {
  /**
   * Format service packages for prompt inclusion
   */
  static formatServicesForPrompt(services: ServicePackage[]): string {
    return services.map((service, index) => `
${index + 1}. **${service.title}** (${service.tier.toUpperCase()})
   - Description: ${service.description}
   - Category: ${service.category}
   - Industries: ${service.industry_tags.join(', ')}
   - Timeline: ${service.timeline || 'Varies'}
   - Price Band: ${service.price_band || 'Contact for pricing'}
   - Includes: ${service.includes.slice(0, 3).join(', ')}${service.includes.length > 3 ? '...' : ''}
`).join('\n');
  }

  /**
   * Format client responses for prompt inclusion
   */
  static formatResponsesForPrompt(responses: Record<string, unknown>): string {
    return Object.entries(responses)
      .map(([key, value]) => {
        const formattedKey = key.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const formattedValue = Array.isArray(value) ? value.join(', ') : String(value);
        return `**${formattedKey}:** ${formattedValue}`;
      })
      .join('\n');
  }

  /**
   * Create consultation prompt with data
   */
  static createConsultationPrompt(
    template: PromptTemplate,
    data: ConsultationData,
    services: ServicePackage[]
  ): PromptBuilder {
    const builder = new PromptBuilder(template);

    return builder.setVariables({
      client_name: data.client_info.name || 'Valued Client',
      company_name: data.client_info.company || 'Client Company',
      industry: data.client_info.industry || 'Not specified',
      company_size: String(data.questionnaire_responses['company-size'] || 'Not specified'),
      questionnaire_responses: this.formatResponsesForPrompt(data.questionnaire_responses),
      service_packages: this.formatServicesForPrompt(services),
      service_list: services.map(s => `${s.id}: ${s.title}`).join('\n')
    });
  }
}

/**
 * Pre-configured prompt builders for common scenarios
 */
export const consultationPrompts = {
  /**
   * Full consultation report
   */
  fullConsultation: (data: ConsultationData, services: ServicePackage[]) =>
    PromptUtils.createConsultationPrompt(ConsultationPrompts.FULL_CONSULTATION, data, services),

  /**
   * Quick recommendations
   */
  quickRecommendations: (responses: Record<string, unknown>, services: ServicePackage[]) =>
    new PromptBuilder(ConsultationPrompts.QUICK_RECOMMENDATIONS).setVariables({
      questionnaire_responses: PromptUtils.formatResponsesForPrompt(responses),
      service_list: services.map(s => `${s.id}: ${s.title} - ${s.description}`).join('\n')
    }),

  /**
   * Industry-focused consultation
   */
  industryFocused: (data: ConsultationData, services: ServicePackage[], industryTrends: string) =>
    PromptUtils.createConsultationPrompt(ConsultationPrompts.INDUSTRY_FOCUSED, data, services)
      .setVariable('industry_trends', industryTrends),

  /**
   * ROI business case
   */
  roiBusinessCase: (data: ConsultationData, services: ServicePackage[]) =>
    PromptUtils.createConsultationPrompt(ConsultationPrompts.ROI_BUSINESS_CASE, data, services)
      .setVariables({
        budget_range: String(data.questionnaire_responses['budget'] || 'Not specified'),
        revenue_goals: String(data.questionnaire_responses['revenue-goals'] || 'Not specified'),
        timeline: String(data.questionnaire_responses['timeline'] || 'Not specified'),
        service_packages_with_pricing: PromptUtils.formatServicesForPrompt(services)
      })
};