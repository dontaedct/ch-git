import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

// Mock OpenAI
const mockOpenAI = {
  chat: {
    completions: {
      create: jest.fn(),
    },
  },
};

jest.mock('openai', () => ({
  OpenAI: jest.fn(() => mockOpenAI),
}));

// Mock environment variables
process.env.OPENAI_API_KEY = 'test-api-key';

describe('AI Consultation Generation Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('AI Consultation Generator', () => {
    it('should generate consultation based on questionnaire responses', async () => {
      // Mock successful OpenAI response
      mockOpenAI.chat.completions.create.mockResolvedValueOnce({
        choices: [{
          message: {
            content: JSON.stringify({
              analysis: 'Based on your SaaS business with 10-50 team members and a budget of $10k-50k, you need scalable solutions.',
              recommendations: [
                {
                  title: 'Enterprise Growth Package',
                  description: 'Comprehensive solution for scaling SaaS businesses',
                  price: '$25,000',
                  timeline: '3-4 months',
                  features: ['Custom Development', 'Team Training', '24/7 Support']
                }
              ],
              next_steps: [
                'Schedule a discovery call',
                'Review technical requirements',
                'Create project timeline'
              ],
              priority_score: 85
            })
          }
        }],
        usage: {
          prompt_tokens: 150,
          completion_tokens: 300,
          total_tokens: 450
        }
      });

      const { generateConsultation } = await import('../../lib/ai/consultation-generator');

      const questionnaireData = {
        business_type: 'SaaS',
        team_size: '10-50',
        budget: '$10k-50k',
        challenges: ['scaling', 'automation'],
        timeline: '3-6 months',
        current_tools: ['React', 'Node.js', 'PostgreSQL'],
        goals: ['Improve scalability', 'Reduce manual processes']
      };

      const result = await generateConsultation(questionnaireData);

      expect(result).toBeDefined();
      expect(result.analysis).toContain('SaaS business');
      expect(result.recommendations).toHaveLength(1);
      expect(result.recommendations[0].title).toBe('Enterprise Growth Package');
      expect(result.next_steps).toHaveLength(3);
      expect(result.priority_score).toBe(85);
    });

    it('should handle different business types appropriately', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValueOnce({
        choices: [{
          message: {
            content: JSON.stringify({
              analysis: 'E-commerce businesses require different optimization strategies focused on conversion and inventory management.',
              recommendations: [
                {
                  title: 'E-commerce Optimization Package',
                  description: 'Specialized solution for online retail businesses',
                  price: '$15,000',
                  timeline: '2-3 months',
                  features: ['Inventory Management', 'Payment Integration', 'Analytics Dashboard']
                }
              ],
              next_steps: [
                'Analyze current conversion rates',
                'Review payment processing',
                'Optimize checkout flow'
              ],
              priority_score: 78
            })
          }
        }]
      });

      const { generateConsultation } = await import('../../lib/ai/consultation-generator');

      const ecommerceData = {
        business_type: 'E-commerce',
        team_size: '5-10',
        budget: '$5k-25k',
        challenges: ['conversion_optimization', 'inventory_management'],
        timeline: '1-3 months'
      };

      const result = await generateConsultation(ecommerceData);

      expect(result.analysis).toContain('E-commerce');
      expect(result.recommendations[0].title).toBe('E-commerce Optimization Package');
      expect(result.recommendations[0].features).toContain('Inventory Management');
    });

    it('should generate appropriate recommendations for different budget ranges', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValueOnce({
        choices: [{
          message: {
            content: JSON.stringify({
              analysis: 'With a startup budget, we recommend focusing on core functionality and MVP development.',
              recommendations: [
                {
                  title: 'Startup MVP Package',
                  description: 'Essential features for launching your product',
                  price: '$5,000',
                  timeline: '4-6 weeks',
                  features: ['Core Development', 'Basic Testing', 'Launch Support']
                }
              ],
              next_steps: [
                'Define MVP requirements',
                'Create development roadmap',
                'Set up basic infrastructure'
              ],
              priority_score: 92
            })
          }
        }]
      });

      const { generateConsultation } = await import('../../lib/ai/consultation-generator');

      const startupData = {
        business_type: 'Startup',
        team_size: '1-5',
        budget: '<$10k',
        challenges: ['mvp_development', 'market_validation'],
        timeline: '1-2 months'
      };

      const result = await generateConsultation(startupData);

      expect(result.recommendations[0].title).toBe('Startup MVP Package');
      expect(result.recommendations[0].price).toBe('$5,000');
      expect(result.priority_score).toBe(92);
    });

    it('should handle complex questionnaire responses with multiple challenges', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValueOnce({
        choices: [{
          message: {
            content: JSON.stringify({
              analysis: 'Your enterprise needs address both technical debt and scaling challenges, requiring a comprehensive approach.',
              recommendations: [
                {
                  title: 'Enterprise Transformation Package',
                  description: 'Complete modernization and scaling solution',
                  price: '$75,000',
                  timeline: '6-9 months',
                  features: ['Legacy System Migration', 'Architecture Redesign', 'Team Training', 'Performance Optimization']
                },
                {
                  title: 'Technical Debt Reduction',
                  description: 'Focused effort on code quality and maintainability',
                  price: '$35,000',
                  timeline: '3-4 months',
                  features: ['Code Refactoring', 'Test Coverage', 'Documentation']
                }
              ],
              next_steps: [
                'Conduct technical audit',
                'Prioritize modernization efforts',
                'Create phased implementation plan',
                'Establish success metrics'
              ],
              priority_score: 95
            })
          }
        }]
      });

      const { generateConsultation } = await import('../../lib/ai/consultation-generator');

      const enterpriseData = {
        business_type: 'Enterprise',
        team_size: '100+',
        budget: '$50k+',
        challenges: ['technical_debt', 'scaling', 'performance', 'security'],
        timeline: '6-12 months',
        current_pain_points: ['Slow deployment', 'System downtime', 'Security vulnerabilities'],
        integration_requirements: ['CRM', 'ERP', 'Analytics']
      };

      const result = await generateConsultation(enterpriseData);

      expect(result.recommendations).toHaveLength(2);
      expect(result.recommendations[0].title).toBe('Enterprise Transformation Package');
      expect(result.next_steps).toHaveLength(4);
      expect(result.priority_score).toBe(95);
    });
  });

  describe('Service Package Matching', () => {
    it('should match questionnaire responses to appropriate service packages', async () => {
      const { matchServicePackages } = await import('../../lib/consultation/service-matcher');

      const questionnaireData = {
        business_type: 'SaaS',
        team_size: '10-50',
        budget: '$10k-50k',
        challenges: ['scaling', 'automation'],
        timeline: '3-6 months'
      };

      const matches = await matchServicePackages(questionnaireData);

      expect(matches).toBeInstanceOf(Array);
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0]).toHaveProperty('package_id');
      expect(matches[0]).toHaveProperty('match_score');
      expect(matches[0]).toHaveProperty('reasoning');
    });

    it('should rank service packages by relevance score', async () => {
      const { matchServicePackages } = await import('../../lib/consultation/service-matcher');

      const questionnaireData = {
        business_type: 'Startup',
        team_size: '1-5',
        budget: '<$10k',
        challenges: ['mvp_development'],
        timeline: '1-2 months'
      };

      const matches = await matchServicePackages(questionnaireData);

      // Verify matches are sorted by score (descending)
      for (let i = 0; i < matches.length - 1; i++) {
        expect(matches[i].match_score).toBeGreaterThanOrEqual(matches[i + 1].match_score);
      }
    });
  });

  describe('AI Prompt Optimization', () => {
    it('should use optimized prompts for consultation generation', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValueOnce({
        choices: [{
          message: {
            content: JSON.stringify({
              analysis: 'Test analysis',
              recommendations: [],
              next_steps: [],
              priority_score: 80
            })
          }
        }]
      });

      const { generateConsultation } = await import('../../lib/ai/consultation-generator');

      await generateConsultation({
        business_type: 'SaaS',
        team_size: '10-50',
        budget: '$10k-50k'
      });

      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: expect.any(String),
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'system',
              content: expect.stringContaining('consultation expert')
            }),
            expect.objectContaining({
              role: 'user',
              content: expect.stringContaining('business_type')
            })
          ]),
          temperature: expect.any(Number),
          max_tokens: expect.any(Number)
        })
      );
    });

    it('should include context about service packages in prompts', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValueOnce({
        choices: [{
          message: {
            content: JSON.stringify({
              analysis: 'Test analysis',
              recommendations: [],
              next_steps: [],
              priority_score: 80
            })
          }
        }]
      });

      const { generateConsultationWithPackages } = await import('../../lib/ai/consultation-generator');

      const servicePackages = [
        { id: 1, name: 'Starter Package', price: '$5,000' },
        { id: 2, name: 'Growth Package', price: '$15,000' }
      ];

      await generateConsultationWithPackages({
        business_type: 'SaaS',
        team_size: '10-50',
        budget: '$10k-50k'
      }, servicePackages);

      const lastCall = mockOpenAI.chat.completions.create.mock.calls[mockOpenAI.chat.completions.create.mock.calls.length - 1];
      const messages = lastCall[0].messages;
      const systemMessage = messages.find((m: any) => m.role === 'system');

      expect(systemMessage.content).toContain('Starter Package');
      expect(systemMessage.content).toContain('Growth Package');
    });
  });

  describe('Error Handling', () => {
    it('should handle OpenAI API errors gracefully', async () => {
      mockOpenAI.chat.completions.create.mockRejectedValueOnce(
        new Error('OpenAI API rate limit exceeded')
      );

      const { generateConsultation } = await import('../../lib/ai/consultation-generator');

      const questionnaireData = {
        business_type: 'SaaS',
        team_size: '10-50',
        budget: '$10k-50k'
      };

      await expect(generateConsultation(questionnaireData)).rejects.toThrow('OpenAI API rate limit exceeded');
    });

    it('should handle malformed AI responses', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValueOnce({
        choices: [{
          message: {
            content: 'Invalid JSON response'
          }
        }]
      });

      const { generateConsultation } = await import('../../lib/ai/consultation-generator');

      const questionnaireData = {
        business_type: 'SaaS',
        team_size: '10-50',
        budget: '$10k-50k'
      };

      await expect(generateConsultation(questionnaireData)).rejects.toThrow();
    });

    it('should provide fallback recommendations when AI fails', async () => {
      mockOpenAI.chat.completions.create.mockRejectedValueOnce(
        new Error('API Error')
      );

      const { generateConsultationWithFallback } = await import('../../lib/ai/consultation-generator');

      const questionnaireData = {
        business_type: 'SaaS',
        team_size: '10-50',
        budget: '$10k-50k'
      };

      const result = await generateConsultationWithFallback(questionnaireData);

      expect(result).toBeDefined();
      expect(result.analysis).toContain('standard consultation');
      expect(result.recommendations).toHaveLength(1);
      expect(result.recommendations[0].title).toContain('Standard Package');
    });
  });

  describe('Performance', () => {
    it('should generate consultations within time limits', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValueOnce({
        choices: [{
          message: {
            content: JSON.stringify({
              analysis: 'Test analysis',
              recommendations: [],
              next_steps: [],
              priority_score: 80
            })
          }
        }]
      });

      const { generateConsultation } = await import('../../lib/ai/consultation-generator');

      const startTime = Date.now();

      await generateConsultation({
        business_type: 'SaaS',
        team_size: '10-50',
        budget: '$10k-50k'
      });

      const endTime = Date.now();
      const generationTime = endTime - startTime;

      expect(generationTime).toBeLessThan(30000); // <30 seconds target
    });

    it('should handle concurrent generation requests', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              analysis: 'Test analysis',
              recommendations: [],
              next_steps: [],
              priority_score: 80
            })
          }
        }]
      });

      const { generateConsultation } = await import('../../lib/ai/consultation-generator');

      const requests = Array.from({ length: 5 }, (_, i) =>
        generateConsultation({
          business_type: 'SaaS',
          team_size: '10-50',
          budget: '$10k-50k',
          request_id: i.toString()
        })
      );

      const results = await Promise.all(requests);

      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.analysis).toBeTruthy();
      });
    });
  });

  describe('Consultation Quality', () => {
    it('should generate relevant and coherent analysis', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValueOnce({
        choices: [{
          message: {
            content: JSON.stringify({
              analysis: 'Based on your SaaS business with a team of 10-50 people and a budget of $10k-50k, you are in a growth phase where scalability and automation are critical. Your challenges with scaling and automation suggest you need solutions that can handle increased load while reducing manual processes.',
              recommendations: [
                {
                  title: 'Enterprise Growth Package',
                  description: 'Comprehensive solution designed for scaling SaaS businesses',
                  price: '$25,000',
                  timeline: '3-4 months',
                  features: ['Microservices Architecture', 'CI/CD Pipeline', 'Monitoring & Alerting']
                }
              ],
              next_steps: [
                'Technical architecture review',
                'Scalability assessment',
                'Implementation roadmap creation'
              ],
              priority_score: 88
            })
          }
        }]
      });

      const { generateConsultation } = await import('../../lib/ai/consultation-generator');

      const result = await generateConsultation({
        business_type: 'SaaS',
        team_size: '10-50',
        budget: '$10k-50k',
        challenges: ['scaling', 'automation']
      });

      expect(result.analysis).toContain('SaaS business');
      expect(result.analysis).toContain('10-50 people');
      expect(result.analysis).toContain('scaling');
      expect(result.recommendations[0].features).toContain('Microservices Architecture');
      expect(result.priority_score).toBeGreaterThanOrEqual(80);
    });
  });
});