'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import type { Message, FeasibilityScore, CompassStepId } from '@/types'
import { COMPASS_STEPS } from '@/lib/ai/compass-flow'
import { INITIAL_SCORE, evaluateAnswer } from '@/lib/ai/evaluator'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'
import { ScorePanel } from './ScorePanel'
import { SendHorizonal, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select'

const TENANTS = ['LX', 'LH', 'OS', 'SN'] as const
type Tenant = (typeof TENANTS)[number]
const TENANT_LABELS: Record<Tenant, string> = {
  LX: 'Brand A', LH: 'Brand B', OS: 'Brand C', SN: 'Brand D',
}

function mkId() { return Math.random().toString(36).slice(2) }

export function ChatPage() {
  const [, setTenant] = useState<Tenant>('LX')
  const [messages, setMessages] = useState<Message[]>([{
    id: mkId(), role: 'assistant',
    content: COMPASS_STEPS[0].message,
    timestamp: new Date(), stepId: 'welcome',
  }])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [score, setScore] = useState<FeasibilityScore>(INITIAL_SCORE)
  const [isDone, setIsDone] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSubmit = useCallback(async () => {
    const trimmed = input.trim()
    if (!trimmed || isTyping || isDone) return

    const currentStep = COMPASS_STEPS[stepIndex]
    const nextStepIndex = stepIndex + 1

    setMessages(prev => [...prev, {
      id: mkId(), role: 'user', content: trimmed,
      timestamp: new Date(), stepId: currentStep.id,
    }])
    setInput('')
    setIsTyping(true)

    if (currentStep.dimension) {
      setScore(evaluateAnswer(currentStep.id as CompassStepId, trimmed, score))
    }

    await new Promise(r => setTimeout(r, 700 + Math.random() * 400))

    const replies: Message[] = []

    if (currentStep.followUp) {
      replies.push({
        id: mkId(), role: 'assistant',
        content: currentStep.followUp(trimmed),
        timestamp: new Date(),
      })
    }

    if (nextStepIndex < COMPASS_STEPS.length) {
      if (currentStep.followUp) await new Promise(r => setTimeout(r, 350))
      replies.push({
        id: mkId(), role: 'assistant',
        content: COMPASS_STEPS[nextStepIndex].message,
        timestamp: new Date(), stepId: COMPASS_STEPS[nextStepIndex].id,
      })
      setStepIndex(nextStepIndex)
    } else {
      replies.push({
        id: mkId(), role: 'assistant',
        content: getSummaryMessage(score),
        timestamp: new Date(), stepId: 'summary',
      })
      setIsDone(true)
    }

    setMessages(prev => [...prev, ...replies])
    setIsTyping(false)
  }, [input, isTyping, isDone, stepIndex, score])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() }
  }

  const handleReset = () => {
    setMessages([{ id: mkId(), role: 'assistant', content: COMPASS_STEPS[0].message, timestamp: new Date(), stepId: 'welcome' }])
    setInput(''); setIsTyping(false); setStepIndex(0)
    setScore(INITIAL_SCORE); setIsDone(false)
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">

      <header className="flex items-center justify-between px-5 py-3 flex-shrink-0 border-b">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">EXP/OS</span>
          <Separator orientation="vertical" className="h-4" />
          <span className="text-xs text-muted-foreground">Idea Challenger</span>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {isDone ? 'Complete' : `Step ${stepIndex + 1} / ${COMPASS_STEPS.length}`}
          </Badge>

          <Select defaultValue="LX" onValueChange={(v) => setTenant(v as Tenant)}>
            <SelectTrigger size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TENANTS.map(t => (
                <SelectItem key={t} value={t}>
                  <span className="font-mono font-semibold">{t}</span>
                  <span className="text-muted-foreground">{TENANT_LABELS[t]}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="ghost" size="icon-sm" onClick={handleReset} aria-label="Start over">
            <RotateCcw />
          </Button>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 gap-4 p-4">
        <Card className="flex-1 min-w-0 p-0 gap-0">
          <ScrollArea className="flex-1 min-h-0">
            <div className="flex flex-col gap-3 px-5 py-5">
              {messages.map(m => <MessageBubble key={m.id} message={m} />)}
              {isTyping && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>

          <Separator />

          <div className="p-3">
            {isDone ? (
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  Assessment complete — review your score
                </p>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <RotateCcw />
                  New idea
                </Button>
              </div>
            ) : (
              <div className="flex gap-2 items-end">
                <Textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isTyping}
                  placeholder={isTyping ? 'Wait for response…' : 'Type your answer — ↵ to send, Shift+↵ for new line'}
                  rows={2}
                  className="resize-none min-h-16 max-h-36"
                />
                <Button
                  size="icon"
                  onClick={handleSubmit}
                  disabled={!input.trim() || isTyping}
                  aria-label="Send"
                >
                  <SendHorizonal />
                </Button>
              </div>
            )}
          </div>
        </Card>

        <aside className="w-72 flex-shrink-0">
          <ScorePanel score={score} />
        </aside>
      </div>
    </div>
  )
}

function getSummaryMessage(score: FeasibilityScore): string {
  const total = score.total
  const label = total >= 70 ? 'looks strong' : total >= 50 ? 'has potential but needs work' : 'needs significant strengthening'
  return `**Assessment complete.**\n\nYour idea ${label} with a feasibility score of **${total}/100**.\n\n${total >= 70
    ? '✓ Ready to enter the governance pipeline. Ensure your the A/B testing platform campaign is set up and your Docspace documentation is prepared.'
    : total >= 50
    ? '⚠ A few dimensions need attention before this reaches the governance gate. Focus on the areas scoring below 60% on the right.'
    : '✕ This experiment needs more groundwork. Revisit your evidence base and hypothesis structure first.'
  }\n\nClick **New idea** to challenge another concept.`
}
