'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Send, Paperclip, Sparkles, RotateCcw, Pencil, ArrowRight, Loader2 } from 'lucide-react'
import { createExperiment } from '@/lib/experiments/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SideNav } from './SideNav'
import { BlueprintPanel } from './BlueprintPanel'
import { CARTER_STEPS, EMPTY_BLUEPRINT, type BlueprintState, type CarterStepId } from '@/lib/ai/coach'
import { gradeHypothesisSource, scoreToQuality, validateIdea, validateStepInput, type GateVerdict } from '@/lib/ai/coach-client'

// Steps where the relevance gate gets the user's idea as context.
const HYPOTHESIS_CONTEXT_STEPS: ReadonlySet<CarterStepId> = new Set<CarterStepId>([
  'evidence',
  'variant',
  'audience',
  'primary-metric',
])

type Phase = 'hero' | 'chat'

interface ChatMessage {
  id: string
  role: 'carter' | 'user'
  content: string
  stepId?: CarterStepId
  variant?: 'prompt' | 'followUp' | 'weak'
  editable?: boolean
}

function mkId() {
  return Math.random().toString(36).slice(2)
}

function mkDraftId() {
  const year = new Date().getFullYear()
  const seq = String(Math.floor(Math.random() * 900) + 100)
  return `EXP-${year}-${seq}`
}

export function CoachPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('hero')
  const [creating, setCreating] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [blueprint, setBlueprint] = useState<BlueprintState>(EMPTY_BLUEPRINT)
  const [stepIndex, setStepIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const [draftId] = useState(mkDraftId)
  const [completedStepIds, setCompletedStepIds] = useState<Set<CarterStepId>>(new Set())
  const [needsReview, setNeedsReview] = useState<Set<CarterStepId>>(new Set())
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  useEffect(() => {
    if (phase === 'chat') inputRef.current?.focus()
  }, [phase, isTyping])

  const runIdeaValidation = useCallback(async (text: string, isFirstSubmit: boolean) => {
    const firstStep = CARTER_STEPS[0]

    if (isFirstSubmit) {
      setMessages([{ id: mkId(), role: 'user', content: text, stepId: firstStep.id }])
      setPhase('chat')
    } else {
      setMessages(prev => [...prev, { id: mkId(), role: 'user', content: text, stepId: firstStep.id }])
    }
    setInput('')
    setIsTyping(true)

    try {
      const validation = await validateIdea(text)

      if (validation.is_product_change) {
        const extraction = firstStep.extract(text, EMPTY_BLUEPRINT)
        const next = mergeBlueprint(EMPTY_BLUEPRINT, extraction)
        setBlueprint(next)
        setCompletedStepIds(prev => new Set(prev).add(firstStep.id))

        const nextStep = CARTER_STEPS[1]
        setMessages(prev => [
          ...prev,
          { id: mkId(), role: 'carter', content: validation.feedback, variant: 'followUp' },
          { id: mkId(), role: 'carter', content: nextStep.prompt, stepId: nextStep.id, variant: 'prompt' },
        ])
        setStepIndex(1)
      } else {
        // Stay on idea step. Coach Carter glares (weak variant) until user reframes.
        setMessages(prev => [
          ...prev,
          { id: mkId(), role: 'carter', content: validation.feedback, variant: 'weak' },
        ])
      }
    } catch (err) {
      console.warn('[coach] idea validation failed, falling back to regex advance:', err)
      const extraction = firstStep.extract(text, EMPTY_BLUEPRINT)
      const next = mergeBlueprint(EMPTY_BLUEPRINT, extraction)
      setBlueprint(next)
      setCompletedStepIds(prev => new Set(prev).add(firstStep.id))
      const followUp = firstStep.followUp(text, next)
      const nextStep = CARTER_STEPS[1]
      setMessages(prev => [
        ...prev,
        { id: mkId(), role: 'carter', content: followUp, variant: 'followUp' },
        { id: mkId(), role: 'carter', content: nextStep.prompt, stepId: nextStep.id, variant: 'prompt' },
      ])
      setStepIndex(1)
    } finally {
      setIsTyping(false)
    }
  }, [])

  const startCoaching = useCallback(() => {
    const seed = input.trim()
    if (!seed) return
    runIdeaValidation(seed, true)
  }, [input, runIdeaValidation])

  const handleSubmit = useCallback(async () => {
    const text = input.trim()
    if (!text || isTyping) return

    const currentStep = CARTER_STEPS[stepIndex]
    if (currentStep.id === 'complete') return

    // Layer-1 relevance gate runs FIRST on every step, before any per-step
    // branch. Permissive: only blocks obviously meaningless inputs. On
    // infra error, default to pass — never block the user on infra failure.
    let verdict: GateVerdict
    try {
      const idea = HYPOTHESIS_CONTEXT_STEPS.has(currentStep.id)
        ? blueprint.hypothesis.specificElement
        : undefined
      verdict = await validateStepInput(currentStep.id, text, idea)
    } catch (err) {
      console.warn('[coach] step-input gate failed, defaulting to pass:', err)
      verdict = {
        passes: true,
        confidence: 'high',
        fallback_used: false,
        audit_id: 'gate-error',
      }
    }

    if (!verdict.passes) {
      const pushback =
        verdict.reason ?? verdict.suggestion ?? 'I need a more concrete answer for that step.'
      setMessages(prev => [
        ...prev,
        { id: mkId(), role: 'user', content: text, stepId: currentStep.id },
        { id: mkId(), role: 'carter', content: pushback, variant: 'weak' },
      ])
      setInput('')
      return
    }

    // Idea step has its own validate-or-stay flow (LLM-graded by validate-idea).
    if (currentStep.id === 'idea') {
      await runIdeaValidation(text, false)
      return
    }

    setMessages(prev => [...prev, { id: mkId(), role: 'user', content: text, stepId: currentStep.id }])
    setInput('')
    setIsTyping(true)

    let extraction = currentStep.extract(text, blueprint)
    let followUpText: string

    if (currentStep.id === 'evidence') {
      try {
        const grade = await gradeHypothesisSource(text)
        followUpText = grade.reasoning
        extraction = { ...extraction, sourceQuality: scoreToQuality(grade.llm_score) }
      } catch (err) {
        console.warn('[coach] LLM grade failed, falling back to regex:', err)
        await new Promise(r => setTimeout(r, 600))
        const tmp = mergeBlueprint(blueprint, extraction)
        followUpText = currentStep.followUp(text, tmp)
      }
    } else {
      await new Promise(r => setTimeout(r, 750 + Math.random() * 400))
      const tmp = mergeBlueprint(blueprint, extraction)
      followUpText = currentStep.followUp(text, tmp)
    }

    const updated = mergeBlueprint(blueprint, extraction)
    setBlueprint(updated)
    setCompletedStepIds(prev => new Set(prev).add(currentStep.id))

    const followUpVariant: 'followUp' | 'weak' =
      currentStep.id === 'evidence' && updated.sourceQuality === 'missing' ? 'weak' : 'followUp'

    const replies: ChatMessage[] = [{ id: mkId(), role: 'carter', content: followUpText, variant: followUpVariant }]

    const nextIndex = stepIndex + 1
    const nextStep = CARTER_STEPS[nextIndex]
    if (nextStep && nextStep.id !== 'complete') {
      replies.push({ id: mkId(), role: 'carter', content: nextStep.prompt, stepId: nextStep.id, variant: 'prompt' })
    }
    setStepIndex(nextIndex)
    setMessages(prev => [...prev, ...replies])
    setIsTyping(false)
  }, [input, isTyping, stepIndex, blueprint, runIdeaValidation])
  // ↑ blueprint dep covers the hypothesisIdea read above; runIdeaValidation
  //   is stable (useCallback with [] deps).

  const editMessage = useCallback(async (messageId: string, newText: string) => {
    const target = messages.find(m => m.id === messageId)
    if (!target || target.role !== 'user' || !target.stepId) return
    const step = CARTER_STEPS.find(s => s.id === target.stepId)
    if (!step) return

    // Layer-1 relevance gate runs FIRST on edits too. On infra error → pass.
    let editVerdict: GateVerdict
    try {
      const idea = HYPOTHESIS_CONTEXT_STEPS.has(step.id)
        ? blueprint.hypothesis.specificElement
        : undefined
      editVerdict = await validateStepInput(step.id, newText, idea)
    } catch (err) {
      console.warn('[coach] step-input gate failed during edit, defaulting to pass:', err)
      editVerdict = {
        passes: true,
        confidence: 'high',
        fallback_used: false,
        audit_id: 'gate-error',
      }
    }

    if (!editVerdict.passes) {
      const pushback =
        editVerdict.reason ?? editVerdict.suggestion ?? 'I need a more concrete answer for that step.'
      // Don't mutate blueprint or message content; surface pushback as a new
      // weak Carter message so the user sees why their edit was rejected.
      setMessages(prev => [
        ...prev,
        { id: mkId(), role: 'carter', content: pushback, variant: 'weak' },
      ])
      return
    }

    let extraction = step.extract(newText, blueprint)
    let newFollowUp: string
    let newFollowUpVariant: 'followUp' | 'weak' = 'followUp'

    if (step.id === 'idea') {
      try {
        const validation = await validateIdea(newText)
        newFollowUp = validation.feedback
        newFollowUpVariant = validation.is_product_change ? 'followUp' : 'weak'
      } catch (err) {
        console.warn('[coach] LLM idea validation failed during edit, falling back to regex:', err)
        const tmp = mergeBlueprint(blueprint, extraction)
        newFollowUp = step.followUp(newText, tmp)
      }
    } else if (step.id === 'evidence') {
      try {
        const grade = await gradeHypothesisSource(newText)
        newFollowUp = grade.reasoning
        extraction = { ...extraction, sourceQuality: scoreToQuality(grade.llm_score) }
        newFollowUpVariant = scoreToQuality(grade.llm_score) === 'missing' ? 'weak' : 'followUp'
      } catch (err) {
        console.warn('[coach] LLM grade failed during edit, falling back to regex:', err)
        const tmp = mergeBlueprint(blueprint, extraction)
        newFollowUp = step.followUp(newText, tmp)
      }
    } else {
      const tmp = mergeBlueprint(blueprint, extraction)
      newFollowUp = step.followUp(newText, tmp)
    }

    const updated = mergeBlueprint(blueprint, extraction)
    setBlueprint(updated)

    setMessages(prev => {
      const idx = prev.findIndex(m => m.id === messageId)
      if (idx === -1) return prev
      const next = [...prev]
      next[idx] = { ...prev[idx], content: newText }
      const followUpIdx = next.findIndex(
        (m, i) => i > idx && m.role === 'carter' && (m.variant === 'followUp' || m.variant === 'weak'),
      )
      if (followUpIdx !== -1) {
        next[followUpIdx] = { ...next[followUpIdx], content: newFollowUp, variant: newFollowUpVariant }
      }
      return next
    })

    setNeedsReview(prev => {
      const flagged = new Set(prev)
      const editedOrder = CARTER_STEPS.findIndex(s => s.id === target.stepId)
      if (editedOrder === -1) return flagged
      for (let i = editedOrder + 1; i < CARTER_STEPS.length - 1; i++) {
        const id = CARTER_STEPS[i].id
        if (completedStepIds.has(id)) flagged.add(id)
      }
      return flagged
    })
  }, [blueprint, messages, completedStepIds])

  const requestEditByStep = useCallback((stepId: CarterStepId) => {
    const target = [...messages].reverse().find(m => m.role === 'user' && m.stepId === stepId)
    if (!target) return
    setEditingMessageId(target.id)
    requestAnimationFrame(() => {
      document.getElementById(`msg-${target.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }, [messages])

  const handleBeginEdit = useCallback((id: string) => setEditingMessageId(id), [])
  const handleCancelEdit = useCallback(() => setEditingMessageId(null), [])
  const handleSaveEdit = useCallback((id: string, newText: string) => {
    editMessage(id, newText)
    setEditingMessageId(null)
  }, [editMessage])

  const handleReset = () => {
    setPhase('hero')
    setInput('')
    setMessages([])
    setBlueprint(EMPTY_BLUEPRINT)
    setStepIndex(0)
    setCompletedStepIds(new Set())
    setNeedsReview(new Set())
    setEditingMessageId(null)
    setIsTyping(false)
  }

  const handleContinue = useCallback(async () => {
    if (creating) return
    setCreating(true)
    try {
      const raw = blueprint.hypothesis.specificElement?.trim()
      const name = raw ? (raw.length > 80 ? raw.slice(0, 80) + '…' : raw) : 'Untitled experiment'
      const experiment = await createExperiment({ draftId, name, blueprint })
      router.push(`/align/${experiment.id}`)
    } catch (err) {
      console.error('[coach] failed to create experiment draft:', err)
      setCreating(false)
    }
  }, [creating, blueprint, draftId, router])

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (phase === 'hero') startCoaching()
      else handleSubmit()
    }
  }

  const isComplete = stepIndex >= CARTER_STEPS.length - 1 && phase === 'chat' && messages.length > 0
  const currentStepId: CarterStepId | undefined =
    phase === 'chat' && !isComplete ? CARTER_STEPS[stepIndex]?.id : undefined

  return (
    <div className="h-screen flex bg-surface">
      <SideNav />

      <main className="flex-1 flex flex-col min-w-0">
        <Header onReset={handleReset} canReset={phase === 'chat'} />

        <div className="flex-1 flex min-h-0">
          <div className="flex-1 flex flex-col min-w-0">
            {phase === 'hero' ? (
              <HeroState
                input={input}
                setInput={setInput}
                onSubmit={startCoaching}
                onKeyDown={onKeyDown}
              />
            ) : (
              <ChatState
                messages={messages}
                isTyping={isTyping}
                isComplete={isComplete}
                input={input}
                setInput={setInput}
                onSubmit={handleSubmit}
                onKeyDown={onKeyDown}
                editingMessageId={editingMessageId}
                onBeginEdit={handleBeginEdit}
                onCancelEdit={handleCancelEdit}
                onSaveEdit={handleSaveEdit}
                onContinue={handleContinue}
                continuing={creating}
                bottomRef={bottomRef}
                inputRef={inputRef}
              />
            )}
          </div>

          {phase === 'chat' && (
            <BlueprintPanel
              blueprint={blueprint}
              draftId={draftId}
              isComplete={isComplete}
              currentStepId={currentStepId}
              completedStepIds={completedStepIds}
              needsReviewStepIds={needsReview}
              onRequestEditStep={requestEditByStep}
            />
          )}
        </div>
      </main>
    </div>
  )
}

function Header({ onReset, canReset }: { onReset: () => void; canReset: boolean }) {
  return (
    <header className="h-14 flex items-center justify-between px-6 bg-surface flex-shrink-0">
      <div className="flex items-center gap-2 text-on-surface-variant">
        <ChevronLeft className="w-4 h-4" strokeWidth={1.75} />
        <span className="font-display text-sm font-medium text-on-surface">Hypothesis Coach</span>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="text-on-surface-variant hover:text-on-surface">
          Save Progress
        </Button>
        {canReset && (
          <Button variant="ghost" size="sm" onClick={onReset} className="text-on-surface-variant hover:text-on-surface gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" />
            Restart
          </Button>
        )}
        <Button size="sm" className="bg-primary text-white hover:bg-primary/90 rounded">
          Review Methodology
        </Button>
      </div>
    </header>
  )
}

function HeroState({
  input,
  setInput,
  onSubmit,
  onKeyDown,
}: {
  input: string
  setInput: (s: string) => void
  onSubmit: () => void
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 relative">
      <div className="flex items-center justify-center mb-7">
        <span className="text-6xl leading-none" role="img" aria-label="Carter">🏀</span>
      </div>
      <h1 className="font-display text-5xl font-semibold text-on-surface text-center max-w-2xl tracking-tight">
        Let&apos;s craft your next big win.
      </h1>

      <div className="w-full max-w-2xl mt-10 bg-surface-container-lowest p-4 rounded flex flex-col gap-3">
        <Textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Enter your boldest experiment idea..."
          rows={2}
          autoFocus
          className="resize-none border-0 shadow-none bg-transparent text-base p-2 focus-visible:ring-0 rounded"
        />
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="text-on-surface-variant hover:text-on-surface gap-1.5 rounded"
          >
            <Paperclip className="w-3.5 h-3.5" />
            Add context
          </Button>
          <Button
            size="sm"
            onClick={onSubmit}
            disabled={!input.trim()}
            className="bg-primary text-white hover:bg-primary/90 rounded gap-1.5 px-4"
          >
            Start Coaching
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <p className="text-xs text-on-surface-variant mt-5">
        ⇉ Carter will guide you to a rigorous, governance-ready hypothesis.
      </p>
    </div>
  )
}

function ChatState({
  messages,
  isTyping,
  isComplete,
  input,
  setInput,
  onSubmit,
  onKeyDown,
  editingMessageId,
  onBeginEdit,
  onCancelEdit,
  onSaveEdit,
  onContinue,
  continuing,
  bottomRef,
  inputRef,
}: {
  messages: ChatMessage[]
  isTyping: boolean
  isComplete: boolean
  input: string
  setInput: (s: string) => void
  onSubmit: () => void
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  editingMessageId: string | null
  onBeginEdit: (id: string) => void
  onCancelEdit: () => void
  onSaveEdit: (id: string, newText: string) => void
  onContinue: () => void
  continuing: boolean
  bottomRef: React.RefObject<HTMLDivElement | null>
  inputRef: React.RefObject<HTMLTextAreaElement | null>
}) {
  return (
    <>
      <ScrollArea className="flex-1 min-h-0">
        <div className="max-w-3xl mx-auto px-8 py-10 flex flex-col gap-6">
          {messages.map(m => (
            <Bubble
              key={m.id}
              message={m}
              isEditing={editingMessageId === m.id}
              onBeginEdit={onBeginEdit}
              onCancelEdit={onCancelEdit}
              onSaveEdit={onSaveEdit}
            />
          ))}
          {isTyping && <TypingIndicator />}
          {isComplete && <BlueprintReady onContinue={onContinue} continuing={continuing} />}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <div className="px-8 pb-6">
        <div className="max-w-3xl mx-auto bg-surface-container-lowest p-3 flex items-end gap-2">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={isComplete ? 'Blueprint ready — restart to begin a new one.' : 'Your answer…'}
            disabled={isTyping || isComplete}
            rows={1}
            className="resize-none border-0 shadow-none bg-transparent min-h-9 max-h-32 focus-visible:ring-0"
          />
          <Button
            size="sm"
            onClick={onSubmit}
            disabled={!input.trim() || isTyping || isComplete}
            className="bg-primary text-white hover:bg-primary/90 rounded"
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </>
  )
}

function Bubble({
  message,
  isEditing,
  onBeginEdit,
  onCancelEdit,
  onSaveEdit,
}: {
  message: ChatMessage
  isEditing: boolean
  onBeginEdit?: (id: string) => void
  onCancelEdit?: () => void
  onSaveEdit?: (id: string, newText: string) => void
}) {
  const isUser = message.role === 'user'
  const editable = isUser && !!message.stepId && !!onBeginEdit

  if (isEditing && editable) {
    return (
      <EditingBubble
        id={message.id}
        initialContent={message.content}
        onCancel={() => onCancelEdit?.()}
        onSave={next => onSaveEdit?.(message.id, next)}
      />
    )
  }

  const carterSurfaceByVariant: Record<NonNullable<ChatMessage['variant']>, string> = {
    prompt: 'bg-surface-container-lowest text-on-surface',
    followUp: 'bg-surface-container text-on-surface',
    weak: 'bg-driftwood/15 text-on-surface',
  }

  const carterSurface = message.variant
    ? carterSurfaceByVariant[message.variant]
    : carterSurfaceByVariant.prompt

  return (
    <div id={`msg-${message.id}`} className={`group flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isUser && (
        <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center mt-0.5">
          {message.variant === 'weak' ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/coach-carter.png"
              alt="Coach Carter"
              className="w-full h-full object-contain"
            />
          ) : (
            <span className="text-2xl leading-none" role="img" aria-label="Carter">🏀</span>
          )}
        </div>
      )}
      <div
        className={[
          'relative max-w-[78%] px-4 py-3 leading-relaxed text-[15px] rounded',
          isUser ? 'bg-primary text-white' : carterSurface,
        ].join(' ')}
      >
        <div dangerouslySetInnerHTML={{ __html: renderInline(message.content) }} />
        {editable && (
          <button
            type="button"
            onClick={() => onBeginEdit?.(message.id)}
            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/15 rounded"
            aria-label="Edit answer"
          >
            <Pencil className="w-3 h-3 text-white/80" strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  )
}

function EditingBubble({
  id,
  initialContent,
  onCancel,
  onSave,
}: {
  id: string
  initialContent: string
  onCancel: () => void
  onSave: (next: string) => void
}) {
  const [draft, setDraft] = useState(initialContent)
  return (
    <div id={`msg-${id}`} className="flex gap-3 flex-row-reverse">
      <div className="max-w-[78%] w-full bg-primary text-white px-4 py-3 rounded flex flex-col gap-2">
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          rows={3}
          className="w-full bg-transparent text-white resize-none outline-none text-[15px] leading-relaxed placeholder-white/50"
          autoFocus
        />
        <div className="flex gap-2 justify-end">
          <Button
            size="sm"
            variant="ghost"
            onClick={onCancel}
            className="text-white/80 hover:text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => {
              const next = draft.trim()
              if (next && next !== initialContent) onSave(next)
              else onCancel()
            }}
            className="bg-white text-primary hover:bg-white/90 rounded"
          >
            Save &amp; re-grade
          </Button>
        </div>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center mt-0.5">
        <span className="text-2xl leading-none" role="img" aria-label="Carter">🏀</span>
      </div>
      <div className="bg-surface-container-lowest px-4 py-3.5 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 bg-on-surface-variant/60 animate-pulse [animation-delay:-0.3s]" />
        <span className="w-1.5 h-1.5 bg-on-surface-variant/60 animate-pulse [animation-delay:-0.15s]" />
        <span className="w-1.5 h-1.5 bg-on-surface-variant/60 animate-pulse" />
      </div>
    </div>
  )
}

function BlueprintReady({ onContinue, continuing }: { onContinue: () => void; continuing: boolean }) {
  return (
    <div className="bg-surface-container-lowest p-6 mt-4 border border-outline-variant/40 rounded">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-tertiary" strokeWidth={2} />
        <span className="font-display text-base font-semibold text-on-surface">Blueprint complete</span>
      </div>
      <p className="text-sm text-on-surface-variant leading-relaxed">
        All dimensions captured — the hypothesis preview is on the right. Next, size the test: the Power Calculator will use your expected lift as the MDE to derive the sample size and runtime, then you&apos;ll finalize and save the experiment to the registry.
      </p>
      <div className="flex gap-2 mt-4">
        <Button
          size="sm"
          onClick={onContinue}
          disabled={continuing}
          className="bg-primary text-white hover:bg-primary/90 rounded gap-1.5"
        >
          {continuing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Saving draft…
            </>
          ) : (
            <>
              Continue to Strategic Alignment
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

function renderInline(s: string) {
  return s
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="opacity-90">$1</em>')
    .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-surface-container text-on-surface text-[13px]">$1</code>')
    .replace(/\n/g, '<br/>')
}

function mergeBlueprint(prev: BlueprintState, patch: Partial<BlueprintState>): BlueprintState {
  return {
    ...prev,
    ...patch,
    hypothesis: { ...prev.hypothesis, ...(patch.hypothesis ?? {}) },
  }
}
