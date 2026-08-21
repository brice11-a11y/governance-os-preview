'use client'

import type { FeasibilityScore } from '@/types'
import { getScoreLabel } from '@/lib/ai/evaluator'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress, ProgressLabel, ProgressValue } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'

interface ScorePanelProps {
  score: FeasibilityScore
}

type DimValue = FeasibilityScore['dimensions'][keyof FeasibilityScore['dimensions']]

function scoreVariant(value: number): 'default' | 'secondary' | 'destructive' {
  if (value >= 70) return 'default'
  if (value >= 50) return 'secondary'
  return 'destructive'
}

function DimensionRow({ dimension }: { dimension: DimValue }) {
  const pct = Math.round((dimension.score / dimension.maxScore) * 100)
  return (
    <div className="space-y-1.5">
      <Progress value={dimension.evaluated ? pct : 0}>
        <ProgressLabel className={dimension.evaluated ? '' : 'text-muted-foreground'}>
          {dimension.label}
        </ProgressLabel>
        <ProgressValue>{() => `${dimension.score}/${dimension.maxScore}`}</ProgressValue>
      </Progress>
      {dimension.evaluated && (
        <p className="text-xs text-muted-foreground">{dimension.feedback}</p>
      )}
    </div>
  )
}

export function ScorePanel({ score }: ScorePanelProps) {
  const completionPct = Math.round((score.questionsAnswered / score.totalQuestions) * 100)

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Feasibility Score</CardTitle>
        <CardDescription>Updates as you answer</CardDescription>
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-4xl font-semibold tabular-nums">{score.total}</span>
          <span className="text-sm text-muted-foreground tabular-nums">/ 100</span>
        </div>
        <Progress value={score.total} />
        <div className="pt-1">
          <Badge variant={scoreVariant(score.total)}>{getScoreLabel(score.total)}</Badge>
        </div>
      </CardContent>

      <Separator />

      <CardContent className="space-y-4">
        {(Object.values(score.dimensions) as DimValue[]).map(dim => (
          <DimensionRow key={dim.label} dimension={dim} />
        ))}
      </CardContent>

      <CardFooter className="flex-col items-stretch gap-2">
        <Progress value={completionPct}>
          <ProgressLabel>Questions answered</ProgressLabel>
          <ProgressValue>{() => `${score.questionsAnswered}/${score.totalQuestions}`}</ProgressValue>
        </Progress>
        {score.questionsAnswered === score.totalQuestions && (
          <p className="text-xs text-center text-muted-foreground">Assessment complete</p>
        )}
      </CardFooter>
    </Card>
  )
}
