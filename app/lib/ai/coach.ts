import { parseDeadlineFromText } from '@/lib/experiments/power'

export type BlueprintField =
  | 'hypothesis'
  | 'targetSurface'
  | 'primaryMetric'
  | 'guardrailMetrics'
  | 'methodology'

export interface BlueprintState {
  hypothesis: { specificElement?: string; goalMetric?: string; specificPercentage?: string; invariantMetric?: string }
  targetSurface?: string
  primaryMetric?: string
  guardrailMetrics?: string
  methodology?: string
  source?: string
  sourceQuality?: 'strong' | 'weak' | 'missing'
  targetTimeline?: string // raw Coach answer, e.g. "3 weeks"
  targetDeadlineDays?: number // parsed day count (1-60), if extractable
}

export const EMPTY_BLUEPRINT: BlueprintState = {
  hypothesis: {},
}

export type CarterStepId =
  | 'idea'
  | 'evidence'
  | 'variant'
  | 'audience'
  | 'primary-metric'
  | 'expected-lift'
  | 'guardrail'
  | 'methodology'
  | 'timeline'
  | 'complete'

export interface CarterStep {
  id: CarterStepId
  prompt: string
  hint?: string
  extract: (answer: string, draft: BlueprintState) => Partial<BlueprintState>
  followUp: (answer: string, draft: BlueprintState) => string
}

const looksLikePercentage = (s: string) => /\b\d+(\.\d+)?\s*%/.test(s)
const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length

export const CARTER_STEPS: CarterStep[] = [
  {
    id: 'idea',
    prompt: `Let's start at the top. **Describe your boldest experiment idea** in one or two sentences — what's the change, and what do you hope to move? *More context = better. I'll sharpen this into a formal hypothesis as we go.*`,
    hint: 'Plain language. Carter will sharpen this into a formal hypothesis as we go.',
    extract: (answer) => ({
      hypothesis: {
        specificElement: answer.length > 200 ? answer.slice(0, 200) + '…' : answer,
      },
    }),
    followUp: (answer) => {
      const wc = wordCount(answer)
      if (wc < 8) return `Noted. That's a tight pitch — I'll need a bit more to extract a sharp hypothesis, but we can build it up across the next questions.`
      return `Good. I've captured the core idea. Now let's anchor it in evidence.`
    },
  },
  {
    id: 'evidence',
    prompt: `**What data or research** convinces you this matters? Cite specifics — analytics, user interviews, support tickets, drop-off rates. *Weakly-sourced hypotheses get blocked at governance ~3x more often. The more numbers and source types you cite, the higher this scores.*`,
    extract: (answer) => {
      const hasNumber = /\d+(\.\d+)?%?/.test(answer)
      const hasSource = /analytics|interview|survey|nps|csat|support|ticket|competitor|benchmark|funnel|heatmap|drop.?off/i.test(answer)
      const quality: 'strong' | 'weak' | 'missing' =
        hasNumber && hasSource ? 'strong' : hasSource || hasNumber ? 'weak' : 'missing'
      return { source: answer, sourceQuality: quality }
    },
    followUp: (answer) => {
      const hasNumber = /\d+(\.\d+)?%?/.test(answer)
      const hasSource = /analytics|interview|survey|nps|csat|support|ticket|competitor|benchmark|funnel|heatmap|drop.?off/i.test(answer)
      if (hasNumber && hasSource) return `Strong source. Quantified and traceable — that scores well on the Thomke *Source* dimension.`
      if (hasSource) return `Decent grounding, but add specific numbers before submission. "Users struggle" is weaker than "23% drop-off between step 2 and 3."`
      return `This reads like opinion rather than evidence. Hypotheses without a quantified source rarely survive governance review — try adding a number, a date, or a second source type (e.g., analytics + interviews).`
    },
  },
  {
    id: 'variant',
    prompt: `**What exactly will users see differently?** Describe the variant — the specific element being changed. *Be precise: "Change the CTA" isn't enough. Specify which CTA, what aspect (color, label, position), and how.*`,
    extract: (answer, draft) => ({
      hypothesis: { ...draft.hypothesis, specificElement: answer },
    }),
    followUp: (answer) => {
      const wc = wordCount(answer)
      if (wc < 6) return `Too vague. "Change the CTA" leaves implementation ambiguous. Specify which CTA, what aspect (color, label, position), and how.`
      return `Clear variant. Variables dimension is in good shape.`
    },
  },
  {
    id: 'audience',
    prompt: `**Who and where?** Define the audience and surface — e.g., "homepage visitors on airgroup.com, all markets" or "logged-in PAY users on the booking flow, Switzerland only." *The AirGroup has five brand tenants (brand codes). The more precise you are here, the cleaner the the A/B testing platform setup.*`,
    extract: (answer) => ({ targetSurface: answer }),
    followUp: (answer) => {
      const hasMarket = /market|country|region|all|switzerland|germany|austria|belgium|italy|lh|lx|os|sn|ita/i.test(answer)
      if (!hasMarket) return `Note: you haven't specified a market. AirGroup has five brand tenants (brand codes) — pin this down before launch.`
      return `Surface and audience locked in.`
    },
  },
  {
    id: 'primary-metric',
    prompt: `**One** primary metric. Just one. *Multiple primaries inflate false positives — at p=0.05 across 10 metrics, your false-positive risk is ~40%. This is a hard gate at scoring time.*`,
    extract: (answer, draft) => ({
      primaryMetric: answer,
      hypothesis: { ...draft.hypothesis, goalMetric: answer },
    }),
    followUp: (answer) => {
      const hasMultiple = /\band\b|,|\+|also|plus/i.test(answer) && wordCount(answer) > 5
      if (hasMultiple) return `⚠ I'm seeing multiple candidates. Pick **one**. Others become secondary metrics. Tracking 10 metrics at p=0.05 gives ~40% false-positive risk.`
      return `One primary metric locked. Tracking it as the singular success criterion.`
    },
  },
  {
    id: 'expected-lift',
    prompt: `**How much better** will the variant perform? Be specific — e.g., "+3% CTR" or "+2pp conversion." *A falsifiable prediction needs a number. The power calculator will use this MDE to derive your sample size.*`,
    extract: (answer, draft) => {
      const match = answer.match(/[+-]?\s*\d+(?:\.\d+)?\s*(?:%|pp|p\.p\.|percentage point|basis point|bps)/i)
      return {
        hypothesis: {
          ...draft.hypothesis,
          specificPercentage: match ? match[0].trim() : undefined,
        },
      }
    },
    followUp: (answer) => {
      if (!looksLikePercentage(answer) && !/\bpp\b|percentage point|basis point/i.test(answer)) {
        return `I don't see a percentage. Predictions without numbers aren't falsifiable. Best guess from your evidence?`
      }
      return `Falsifiable prediction recorded. Power calc will derive sample size from this MDE.`
    },
  },
  {
    id: 'guardrail',
    prompt: `**Guardrail metric** — what must *not* degrade? (e.g., booking conversion rate, page load time, support tickets.) *Threshold matters: bold tests tolerate 5% breach, safe 2%, extra-safe 1%. Pre-commit to one now so the scoring service can block mid-flight breaches.*`,
    extract: (answer, draft) => ({
      guardrailMetrics: answer,
      hypothesis: { ...draft.hypothesis, invariantMetric: answer },
    }),
    followUp: (answer) => {
      const hasThreshold = /\d+\s*%|bold|safe|extra/i.test(answer)
      if (!hasThreshold) return `Guardrail captured, but you didn't set a breach threshold. I'll default to "safe = 2%" for now — confirm before launch.`
      return `Guardrail with threshold locked in. The Scoring Service will block if breach is observed mid-flight.`
    },
  },
  {
    id: 'methodology',
    prompt: `**Test methodology.** A/B, multivariate (MVT), holdout, or sequential? Tell me which fits and why. *In Stage 2 I'll be able to recommend the best fit based on your traffic and risk profile (COMPASS framework). For now, your call.*`,
    extract: (answer) => ({ methodology: answer }),
    followUp: (answer) => {
      if (/what.*think|recommend|suggest|which.*best/i.test(answer)) {
        return `I can't give a methodology recommendation in this version — that capability lands in Stage 2 when I'm wired to the COMPASS framework. For now, A/B is the default for most product-change hypotheses with stable populations; MVT only if you have ≥3 variants and ≥4-5x baseline traffic.`
      }
      return `Methodology recorded. One last thing before I build your blueprint.`
    },
  },
  {
    id: 'timeline',
    prompt: `**When do you need a result by?** Give me a rough timeline — e.g. "3 weeks", "30 days", "2 months". *I'll use this on the next screen to check whether a rigorous test can realistically finish in time.*`,
    hint: 'A rough deadline is fine — you can adjust it in the Power Calculator.',
    extract: (answer) => {
      const days = parseDeadlineFromText(answer)
      return { targetTimeline: answer, targetDeadlineDays: days ?? undefined }
    },
    followUp: (answer) => {
      const days = parseDeadlineFromText(answer)
      if (days) return `Got it — about ${days} days. I'll check feasibility against that in the Power Calculator.`
      return `Noted. I couldn't pin that to an exact number of days, so the calculator will start at a 6-week default you can adjust.`
    },
  },
  {
    id: 'complete',
    prompt: ``,
    extract: () => ({}),
    followUp: () => '',
  },
]

export function formatHypothesis(b: BlueprintState): string {
  const h = b.hypothesis
  const element = h.specificElement || '[specific element]'
  const scope = b.targetSurface || '[specific scope]'
  const goal = h.goalMetric || '[goal metric]'
  const pct = h.specificPercentage || '[specific percentage]'
  const invariant = h.invariantMetric || '[invariant metric]'
  return `We believe that by changing **${element}** for **${scope}**, we will increase **${goal}** by **${pct}** without negatively impacting **${invariant}**.`
}
