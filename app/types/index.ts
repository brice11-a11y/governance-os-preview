export type Role = 'user' | 'assistant'

export interface Message {
  id: string
  role: Role
  content: string
  timestamp: Date
  stepId?: string
}

export type ScoreDimension =
  | 'hypothesis'
  | 'measurement'
  | 'strategic'
  | 'collision'
  | 'implementation'

export interface DimensionScore {
  label: string
  score: number
  maxScore: number
  evaluated: boolean
  feedback: string
}

export interface FeasibilityScore {
  total: number
  dimensions: Record<ScoreDimension, DimensionScore>
  questionsAnswered: number
  totalQuestions: number
}

export type CompassStepId =
  | 'welcome'
  | 'problem-evidence'
  | 'solution-clarity'
  | 'hypothesis-format'
  | 'metric-measurability'
  | 'traffic-estimate'
  | 'decision-rule'
  | 'summary'

export interface CompassStep {
  id: CompassStepId
  message: string
  followUp?: (answer: string) => string
  dimension?: ScoreDimension
  scoreWeight?: number
}
