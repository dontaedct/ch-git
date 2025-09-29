import {
  AI_PROCESSING_CONFIG,
  CONSULTATION_ROUTING_RULES,
  ConsultationQuestionConfig
} from './questionnaire-config'

export interface QuestionRoutingResult {
  recommendation: 'continue' | 'fast-track' | 'qualify-further' | 'redirect-to-resources'
  score: number
  reasoning: string[]
  nextSteps: string[]
  planRecommendations: string[]
}

export interface AIReadinessResult {
  score: number // 0-100
  quality: 'excellent' | 'good' | 'fair' | 'poor'
  completeness: number // 0-100
  depth: number // 0-100
  consistency: number // 0-100
  recommendations: string[]
}

export interface QuestionAnalytics {
  answeredCount: number
  totalCount: number
  completionRate: number
  categoryCompleteness: Record<string, number>
  highValueAnswers: number
  qualificationScore: number
}

/**
 * Apply dynamic question routing based on responses
 */
export function applyQuestionRouting(answers: Record<string, unknown>): QuestionRoutingResult {
  const analytics = analyzeAnswers(answers)
  const qualification = calculateQualificationScore(answers)
  const routing = determineRouting(answers, analytics, qualification)

  return routing
}

/**
 * Calculate AI readiness score for consultation generation
 */
export function calculateAIReadiness(answers: Record<string, unknown>): AIReadinessResult {
  const completeness = calculateCompleteness(answers)
  const depth = calculateAnswerDepth(answers)
  const consistency = calculateConsistency(answers)

  // Overall score is weighted average
  const score = Math.round(
    (completeness * 0.4) +
    (depth * 0.4) +
    (consistency * 0.2)
  )

  const quality = getQualityRating(score)
  const recommendations = generateRecommendations(score, completeness, depth, consistency)

  return {
    score,
    quality,
    completeness,
    depth,
    consistency,
    recommendations
  }
}

/**
 * Analyze answer patterns and quality
 */
export function analyzeAnswers(answers: Record<string, unknown>): QuestionAnalytics {
  const totalQuestions = Object.keys(answers).length
  const answeredQuestions = Object.values(answers).filter(isAnswered).length

  const completionRate = totalQuestions > 0
    ? (answeredQuestions / totalQuestions) * 100
    : 0

  // Analyze by category (would need question metadata in real implementation)
  const categoryCompleteness = analyzeCategoryCompleteness(answers)

  // Count high-value answers (detailed responses)
  const highValueAnswers = countHighValueAnswers(answers)

  // Calculate qualification score
  const qualificationScore = calculateQualificationScore(answers)

  return {
    answeredCount: answeredQuestions,
    totalCount: totalQuestions,
    completionRate,
    categoryCompleteness,
    highValueAnswers,
    qualificationScore
  }
}

/**
 * Determine optimal routing based on analysis
 */
function determineRouting(
  answers: Record<string, unknown>,
  analytics: QuestionAnalytics,
  qualification: number
): QuestionRoutingResult {
  const reasoning: string[] = []
  const nextSteps: string[] = []
  const planRecommendations: string[] = []

  // High qualification and completion - fast track
  if (qualification >= 80 && analytics.completionRate >= 70) {
    reasoning.push('High qualification score and comprehensive responses')
    reasoning.push('Ready for immediate consultation generation')

    nextSteps.push('Generate personalized consultation immediately')
    nextSteps.push('Focus on premium service recommendations')

    planRecommendations.push('enterprise-transformation', 'growth-accelerator')

    return {
      recommendation: 'fast-track',
      score: 95,
      reasoning,
      nextSteps,
      planRecommendations
    }
  }

  // Good qualification but need more information
  if (qualification >= 60 && analytics.completionRate >= 50) {
    reasoning.push('Good qualification potential identified')
    reasoning.push('Moderate response completeness - could benefit from more detail')

    nextSteps.push('Generate consultation with standard recommendations')
    nextSteps.push('Include follow-up questions in consultation')

    planRecommendations.push('growth-accelerator', 'foundation-plan', 'strategic-consulting')

    return {
      recommendation: 'continue',
      score: 75,
      reasoning,
      nextSteps,
      planRecommendations
    }
  }

  // Low qualification or very limited responses
  if (qualification < 40 || analytics.completionRate < 30) {
    reasoning.push('Limited qualification indicators')
    reasoning.push('Insufficient response detail for personalized consultation')

    nextSteps.push('Redirect to self-service resources')
    nextSteps.push('Offer basic business assessment tools')

    planRecommendations.push('foundation-plan')

    return {
      recommendation: 'redirect-to-resources',
      score: 30,
      reasoning,
      nextSteps,
      planRecommendations
    }
  }

  // Medium qualification - qualify further
  reasoning.push('Moderate qualification score - needs additional qualification')
  reasoning.push('Good response rate but unclear fit for premium services')

  nextSteps.push('Generate consultation with qualifying questions')
  nextSteps.push('Focus on understanding budget and timeline better')

  planRecommendations.push('foundation-plan', 'strategic-consulting')

  return {
    recommendation: 'qualify-further',
    score: 55,
    reasoning,
    nextSteps,
    planRecommendations
  }
}

/**
 * Calculate qualification score based on key indicators
 */
function calculateQualificationScore(answers: Record<string, unknown>): number {
  let score = 0
  let maxScore = 0

  // Budget qualification (30% weight)
  const budget = answers['budget-range'] as string
  maxScore += 30
  if (budget) {
    const budgetScores: Record<string, number> = {
      'enterprise': 30,
      'established': 25,
      'growth-stage': 20,
      'small-business': 15,
      'startup': 10,
      'bootstrap': 5
    }
    score += budgetScores[budget] || 0
  }

  // Revenue qualification (25% weight)
  const revenue = answers['annual-revenue'] as string
  maxScore += 25
  if (revenue) {
    const revenueScores: Record<string, number> = {
      'over-10m': 25,
      '5m-10m': 22,
      '1m-5m': 18,
      '500k-1m': 14,
      '250k-500k': 10,
      '100k-250k': 8,
      '50k-100k': 6,
      'under-50k': 4,
      'pre-revenue': 2
    }
    score += revenueScores[revenue] || 0
  }

  // Timeline qualification (20% weight)
  const timeline = answers['decision-timeline'] as string
  maxScore += 20
  if (timeline) {
    const timelineScores: Record<string, number> = {
      'immediately': 20,
      'within-month': 16,
      'within-quarter': 12,
      'researching': 8,
      'future-consideration': 4
    }
    score += timelineScores[timeline] || 0
  }

  // Company size qualification (15% weight)
  const companySize = answers['company-size'] as string
  maxScore += 15
  if (companySize) {
    const sizeScores: Record<string, number> = {
      'enterprise': 15,
      'large': 13,
      'medium': 10,
      'small': 8,
      'micro': 6,
      'solo': 4
    }
    score += sizeScores[companySize] || 0
  }

  // Goals alignment (10% weight)
  const goals = answers['primary-goals'] as string[]
  maxScore += 10
  if (Array.isArray(goals)) {
    const highValueGoals = [
      'increase-revenue',
      'expand-market',
      'digital-transformation',
      'team-growth',
      'process-automation'
    ]
    const alignedGoals = goals.filter(goal => highValueGoals.includes(goal))
    score += Math.min(10, alignedGoals.length * 2)
  }

  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
}

/**
 * Calculate answer completeness
 */
function calculateCompleteness(answers: Record<string, unknown>): number {
  const totalQuestions = Object.keys(answers).length
  const answeredQuestions = Object.values(answers).filter(isAnswered).length

  if (totalQuestions === 0) return 0
  return Math.round((answeredQuestions / totalQuestions) * 100)
}

/**
 * Calculate answer depth and quality
 */
function calculateAnswerDepth(answers: Record<string, unknown>): number {
  let depthScore = 0
  let maxDepthScore = 0

  Object.entries(answers).forEach(([questionId, value]) => {
    maxDepthScore += 10

    if (!isAnswered(value)) {
      return // No depth for unanswered questions
    }

    // Multi-select questions get higher depth scores
    if (Array.isArray(value)) {
      const length = value.length
      if (length >= 3) depthScore += 10
      else if (length >= 2) depthScore += 7
      else if (length >= 1) depthScore += 5
      return
    }

    // Text questions get scored by length and quality
    if (typeof value === 'string') {
      const length = value.length
      if (length >= 200) depthScore += 10
      else if (length >= 100) depthScore += 8
      else if (length >= 50) depthScore += 6
      else if (length >= 20) depthScore += 4
      else depthScore += 2
      return
    }

    // Single-select questions get moderate score
    depthScore += 5
  })

  return maxDepthScore > 0 ? Math.round((depthScore / maxDepthScore) * 100) : 0
}

/**
 * Calculate answer consistency
 */
function calculateConsistency(answers: Record<string, unknown>): number {
  let consistencyScore = 80 // Start with high consistency, deduct for inconsistencies

  // Check budget vs revenue consistency
  const budget = answers['budget-range'] as string
  const revenue = answers['annual-revenue'] as string

  if (budget && revenue) {
    const budgetTiers = {
      'bootstrap': 1, 'startup': 2, 'small-business': 3,
      'growth-stage': 4, 'established': 5, 'enterprise': 6
    }
    const revenueTiers = {
      'pre-revenue': 1, 'under-50k': 1, '50k-100k': 2, '100k-250k': 2,
      '250k-500k': 3, '500k-1m': 3, '1m-5m': 4, '5m-10m': 5, 'over-10m': 6
    }

    const budgetTier = budgetTiers[budget] || 3
    const revenueTier = revenueTiers[revenue] || 3

    // Deduct points for significant misalignment
    const difference = Math.abs(budgetTier - revenueTier)
    if (difference >= 3) consistencyScore -= 20
    else if (difference >= 2) consistencyScore -= 10
  }

  // Check company size vs revenue consistency
  const companySize = answers['company-size'] as string
  if (companySize && revenue) {
    const sizeTiers = {
      'solo': 1, 'micro': 2, 'small': 3,
      'medium': 4, 'large': 5, 'enterprise': 6
    }
    const revenueTiers = {
      'pre-revenue': 1, 'under-50k': 1, '50k-100k': 2, '100k-250k': 2,
      '250k-500k': 3, '500k-1m': 3, '1m-5m': 4, '5m-10m': 5, 'over-10m': 6
    }

    const sizeTier = sizeTiers[companySize] || 3
    const revenueTier = revenueTiers[revenue] || 3

    const difference = Math.abs(sizeTier - revenueTier)
    if (difference >= 3) consistencyScore -= 15
    else if (difference >= 2) consistencyScore -= 8
  }

  // Check timeline vs budget consistency
  const timeline = answers['decision-timeline'] as string
  if (timeline && budget) {
    if (timeline === 'immediately' && budget === 'bootstrap') {
      consistencyScore -= 10 // Immediate need but no budget
    }
    if (timeline === 'future-consideration' && ['established', 'enterprise'].includes(budget)) {
      consistencyScore -= 5 // High budget but no urgency
    }
  }

  return Math.max(0, Math.min(100, consistencyScore))
}

/**
 * Analyze category completeness
 */
function analyzeCategoryCompleteness(answers: Record<string, unknown>): Record<string, number> {
  // This would ideally use question metadata to categorize
  // For now, using question ID patterns

  const categories = {
    demographic: ['business-type', 'company-age', 'company-size', 'annual-revenue'],
    goals: ['primary-goals', 'success-metrics', 'timeline', 'revenue-target'],
    challenges: ['biggest-challenges', 'biggest-opportunity', 'resource-constraints'],
    business: ['current-marketing', 'technology-stack', 'budget-range'],
    preferences: ['consultation-focus', 'decision-timeline', 'previous-consulting']
  }

  const completeness: Record<string, number> = {}

  Object.entries(categories).forEach(([category, questionIds]) => {
    const categoryAnswers = questionIds.filter(id => isAnswered(answers[id]))
    completeness[category] = questionIds.length > 0
      ? (categoryAnswers.length / questionIds.length) * 100
      : 0
  })

  return completeness
}

/**
 * Count high-value answers (detailed responses)
 */
function countHighValueAnswers(answers: Record<string, unknown>): number {
  return Object.values(answers).filter(value => {
    if (Array.isArray(value) && value.length >= 2) return true
    if (typeof value === 'string' && value.length >= 50) return true
    return false
  }).length
}

/**
 * Check if an answer is considered "answered"
 */
function isAnswered(value: unknown): boolean {
  if (value === null || value === undefined || value === '') return false
  if (Array.isArray(value) && value.length === 0) return false
  return true
}

/**
 * Get quality rating from score
 */
function getQualityRating(score: number): 'excellent' | 'good' | 'fair' | 'poor' {
  if (score >= 85) return 'excellent'
  if (score >= 70) return 'good'
  if (score >= 50) return 'fair'
  return 'poor'
}

/**
 * Generate recommendations for improving AI readiness
 */
function generateRecommendations(
  score: number,
  completeness: number,
  depth: number,
  consistency: number
): string[] {
  const recommendations: string[] = []

  if (completeness < 70) {
    recommendations.push('Complete more questions to improve recommendation accuracy')
  }

  if (depth < 60) {
    recommendations.push('Provide more detailed answers, especially for text questions')
    recommendations.push('Select multiple options where applicable to show full scope')
  }

  if (consistency < 70) {
    recommendations.push('Review your answers for consistency between related questions')
  }

  if (score >= 85) {
    recommendations.push('Excellent! Your responses will generate highly personalized recommendations')
  } else if (score >= 70) {
    recommendations.push('Good quality responses - ready for AI analysis')
  } else if (score >= 50) {
    recommendations.push('Consider adding more detail to get better recommendations')
  } else {
    recommendations.push('More comprehensive answers will significantly improve your consultation quality')
  }

  return recommendations
}

/**
 * Format routing result for display
 */
export function formatRoutingResult(result: QuestionRoutingResult): string {
  const { recommendation, score, reasoning } = result

  const messages = {
    'fast-track': `Excellent profile (${score}/100). Ready for premium consultation.`,
    'continue': `Good profile (${score}/100). Proceeding with standard consultation.`,
    'qualify-further': `Moderate profile (${score}/100). Additional qualification recommended.`,
    'redirect-to-resources': `Basic profile (${score}/100). Self-service resources recommended.`
  }

  return messages[recommendation]
}

/**
 * Get next recommended questions based on routing
 */
export function getRecommendedQuestions(
  answers: Record<string, unknown>,
  result: QuestionRoutingResult
): string[] {
  const answered = Object.keys(answers)
  const allQuestions = [
    'business-type', 'company-age', 'company-size', 'annual-revenue',
    'primary-goals', 'success-metrics', 'timeline', 'revenue-target',
    'biggest-challenges', 'biggest-opportunity', 'resource-constraints',
    'current-marketing', 'technology-stack', 'budget-range',
    'consultation-focus', 'decision-timeline', 'previous-consulting'
  ]

  const unanswered = allQuestions.filter(q => !answered.includes(q))

  // Prioritize based on routing recommendation
  if (result.recommendation === 'qualify-further') {
    return unanswered.filter(q =>
      ['budget-range', 'decision-timeline', 'revenue-target'].includes(q)
    )
  }

  if (result.recommendation === 'fast-track') {
    return unanswered.filter(q =>
      ['consultation-focus', 'biggest-opportunity'].includes(q)
    )
  }

  return unanswered.slice(0, 3) // Return first 3 unanswered
}