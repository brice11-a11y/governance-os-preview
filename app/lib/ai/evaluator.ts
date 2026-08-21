import type { FeasibilityScore, DimensionScore, Message, CompassStepId } from '@/types'
import { COMPASS_STEPS } from './compass-flow'

export const INITIAL_SCORE: FeasibilityScore = {
  total: 0,
  questionsAnswered: 0,
  totalQuestions: 6,
  dimensions: {
    hypothesis: {
      label: 'Hypothesis Quality',
      score: 0,
      maxScore: 25,
      evaluated: false,
      feedback: 'Not yet evaluated',
    },
    measurement: {
      label: 'Measurement Quality',
      score: 0,
      maxScore: 25,
      evaluated: false,
      feedback: 'Not yet evaluated',
    },
    strategic: {
      label: 'Strategic Alignment',
      score: 0,
      maxScore: 15,
      evaluated: false,
      feedback: 'Not yet evaluated',
    },
    collision: {
      label: 'Collision Risk',
      score: 15,
      maxScore: 20,
      evaluated: false,
      feedback: 'Assessed at Stage 4',
    },
    implementation: {
      label: 'Implementation Readiness',
      score: 10,
      maxScore: 15,
      evaluated: false,
      feedback: 'Assessed at Stage 5',
    },
  },
}

function scoreText(answer: string): number {
  const wordCount = answer.trim().split(/\s+/).length
  const hasNumbers = /\d[\d,.]*(%|k|M|users?|sessions?|visits?)?/i.test(answer)
  const hasQualityTerms = /analytics|data|heatmap|interview|drop.?off|conversion|revenue|session|monetate|baseline|rate|ratio|funnel|metric|kpi/i.test(answer)

  let score = 0
  if (wordCount >= 40) score += 50
  else if (wordCount >= 20) score += 35
  else if (wordCount >= 10) score += 20
  else score += 5

  if (hasNumbers) score += 30
  if (hasQualityTerms) score += 20

  return Math.min(100, score)
}

function scoreHypothesis(answer: string): number {
  const hasAudience = /user|customer|visitor|traveller|passenger|segment/i.test(answer)
  const hasAction = /will|expect|lead|increase|decrease|improve|reduce/i.test(answer)
  const hasMetric = /conversion|revenue|click|booking|ctr|rate|session|metric/i.test(answer)
  const hasInvariant = /without|not impact|no negative|invariant|secondary|while keeping/i.test(answer)
  const elementCount = [hasAudience, hasAction, hasMetric, hasInvariant].filter(Boolean).length

  const baseTextScore = scoreText(answer)
  const structureScore = (elementCount / 4) * 100

  return Math.round((baseTextScore * 0.4) + (structureScore * 0.6))
}

function scoreMetric(answer: string): number {
  const hasRateFormat = /%|rate|ratio|per session|out of/i.test(answer)
  const hasPlatformMention = /monetate|session|visit|page|event|click/i.test(answer)
  const base = scoreText(answer)

  let bonus = 0
  if (hasRateFormat) bonus += 25
  if (hasPlatformMention) bonus += 15

  return Math.min(100, Math.round(base * 0.6 + bonus))
}

function scoreTraffic(answer: string): number {
  const numbers = answer.match(/\d[\d,.]*/g) || []
  if (numbers.length === 0) return 20

  const hasHighTraffic = /[0-9]{4,}|10k|50k|100k|\d+,\d{3}/i.test(answer)
  const hasLowTraffic = /low|small|limited|<1k|under 1,000|few hundred/i.test(answer)

  if (hasLowTraffic) return 30
  if (hasHighTraffic) return 85
  return 60
}

export function evaluateAnswer(
  stepId: CompassStepId,
  answer: string,
  current: FeasibilityScore,
): FeasibilityScore {
  const next = JSON.parse(JSON.stringify(current)) as FeasibilityScore
  next.questionsAnswered = current.questionsAnswered + 1

  switch (stepId) {
    case 'problem-evidence': {
      const raw = scoreText(answer)
      const pts = Math.round((raw / 100) * 7)
      next.dimensions.hypothesis.score = Math.min(25, next.dimensions.hypothesis.score + pts)
      next.dimensions.hypothesis.evaluated = true
      next.dimensions.hypothesis.feedback = raw >= 60
        ? 'Evidence-backed problem'
        : 'Strengthen evidence base'
      break
    }
    case 'solution-clarity': {
      const raw = scoreText(answer)
      const pts = Math.round((raw / 100) * 8)
      next.dimensions.strategic.score = Math.min(15, next.dimensions.strategic.score + pts)
      next.dimensions.strategic.evaluated = true
      next.dimensions.strategic.feedback = raw >= 60
        ? 'Solution well-scoped'
        : 'Needs more specificity'
      break
    }
    case 'hypothesis-format': {
      const raw = scoreHypothesis(answer)
      const pts = Math.round((raw / 100) * 18)
      next.dimensions.hypothesis.score = Math.min(25, next.dimensions.hypothesis.score + pts)
      next.dimensions.hypothesis.evaluated = true
      next.dimensions.hypothesis.feedback = raw >= 70
        ? 'Well-formed hypothesis'
        : raw >= 40
        ? 'Partially structured'
        : 'Missing key elements'
      break
    }
    case 'metric-measurability': {
      const raw = scoreMetric(answer)
      const pts = Math.round((raw / 100) * 15)
      next.dimensions.measurement.score = Math.min(25, next.dimensions.measurement.score + pts)
      next.dimensions.measurement.evaluated = true
      next.dimensions.measurement.feedback = raw >= 60
        ? 'Trackable in the A/B testing platform'
        : 'Verify metric availability'
      break
    }
    case 'traffic-estimate': {
      const raw = scoreTraffic(answer)
      const pts = Math.round((raw / 100) * 10)
      next.dimensions.measurement.score = Math.min(25, next.dimensions.measurement.score + pts)
      next.dimensions.measurement.feedback = raw >= 60
        ? 'Sufficient traffic'
        : 'Low traffic — check runtime'
      break
    }
    case 'decision-rule': {
      const raw = scoreText(answer)
      const pts = Math.round((raw / 100) * 7)
      next.dimensions.strategic.score = Math.min(15, next.dimensions.strategic.score + pts)
      next.dimensions.strategic.evaluated = true
      next.dimensions.strategic.feedback = raw >= 60
        ? 'Decision rule defined'
        : 'Expand decision scenarios'
      break
    }
  }

  const { hypothesis, measurement, strategic, collision, implementation } = next.dimensions
  next.total = Math.round(
    hypothesis.score +
    measurement.score +
    strategic.score +
    collision.score +
    implementation.score,
  )

  return next
}

export function getScoreColor(score: number): string {
  if (score >= 70) return '#22c55e'
  if (score >= 50) return '#f59e0b'
  return '#ef4444'
}

export function getScoreLabel(score: number): string {
  if (score >= 70) return 'On Track'
  if (score >= 50) return 'Needs Work'
  return 'Not Ready'
}
