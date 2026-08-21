import type { CompassStep } from '@/types'

export const COMPASS_STEPS: CompassStep[] = [
  {
    id: 'welcome',
    message: `Welcome to the **Idea Challenger** — your experiment quality coach.\n\nDescribe your test idea in a few sentences. What do you want to test, and what problem are you trying to solve?`,
  },
  {
    id: 'problem-evidence',
    message: `Good start. Now let's check the foundation.\n\nWhat **data or evidence** confirms this is a real problem worth testing? (e.g. analytics, heatmaps, user interviews, support tickets, drop-off data)`,
    followUp: (answer) => {
      const hasData = /analytics|data|heatmap|interview|drop.?off|funnel|session|\d+%|\d+ users/i.test(answer)
      const wordCount = answer.trim().split(/\s+/).length
      if (hasData && wordCount > 20) {
        return `Strong evidence base. That kind of grounding significantly reduces experiment risk.`
      }
      if (wordCount < 10) {
        return `That's quite brief. Weak evidence means your test could confirm a hypothesis that was never real to begin with.`
      }
      return `Noted. Make sure this evidence is quantified before submitting — a vague signal doesn't justify the development cost.`
    },
    dimension: 'hypothesis',
    scoreWeight: 30,
  },
  {
    id: 'solution-clarity',
    message: `What is the **exact variant** you want to test? Describe what users will see differently — be specific about the change.`,
    followUp: (answer) => {
      const wordCount = answer.trim().split(/\s+/).length
      if (wordCount > 25) return `Clear scope. A well-defined variant makes the A/B testing platform setup straightforward.`
      return `Try to be more precise — vague variants lead to implementation ambiguity and scope creep.`
    },
    dimension: 'strategic',
    scoreWeight: 40,
  },
  {
    id: 'hypothesis-format',
    message: `Now let's structure your hypothesis formally.\n\nUse this format:\n> *"By [changing X], we expect [target audience] to [behaviour], which will lead to [impact] on [primary metric] without negatively impacting [invariant metric]."*\n\nWrite your hypothesis:`,
    followUp: (answer) => {
      const hasAudience = /user|customer|visitor|traveller|passenger/i.test(answer)
      const hasMetric = /conversion|revenue|click|booking|ctr|rate|session/i.test(answer)
      const hasInvariant = /without|not impact|no negative|invariant|secondary/i.test(answer)
      const score = [hasAudience, hasMetric, hasInvariant].filter(Boolean).length
      if (score === 3) return `Well-formed hypothesis. All four elements present — this will score well in the governance review.`
      if (score === 2) return `Almost there. You're missing ${!hasInvariant ? 'an invariant metric (what you promise not to break)' : !hasMetric ? 'a specific measurable metric' : 'a defined target audience'}.`
      return `This hypothesis needs strengthening. A weak hypothesis is the #1 reason experiments get blocked at governance.`
    },
    dimension: 'hypothesis',
    scoreWeight: 70,
  },
  {
    id: 'metric-measurability',
    message: `What is your **primary metric**, and can it be tracked in the A/B testing platform?\n\nIdeal format: *"% of sessions that [action] out of total sessions that visited [page]"*`,
    followUp: (answer) => {
      const hasPercentage = /%|rate|ratio|conversion|per session/i.test(answer)
      const hasPlatformMention = /monetate|session|page|visit/i.test(answer)
      if (hasPercentage && hasthe A/B testing platform) return `Measurable and trackable. This metric setup will pass the Measurement Quality gate.`
      if (!hasPercentage) return `Try to express this as a rate or ratio — absolute numbers are hard to interpret across segments.`
      return `Ensure this metric exists in your the A/B testing platform setup before submitting. Ungated metrics are a common build blocker.`
    },
    dimension: 'measurement',
    scoreWeight: 60,
  },
  {
    id: 'traffic-estimate',
    message: `What is the **estimated daily traffic** on the targeted page/step? And what is the current **baseline conversion rate**?\n\nThis determines whether you can reach significance in a reasonable timeframe.`,
    followUp: (answer) => {
      const numbers = answer.match(/\d[\d,.]*/g)
      if (!numbers || numbers.length === 0) {
        return `No figures provided. Without a traffic estimate, you can't validate runtime — and tests that run too long introduce time-contamination risk.`
      }
      const hasLowTraffic = /low|small|few|limited|under 1k|<1,000/i.test(answer)
      if (hasLowTraffic) {
        return `⚠️ Low traffic warning. You may not reach significance in a reasonable timeframe — consider a Feedback AI Survey instead of an A/B test.`
      }
      return `Traffic level noted. The power calculator will confirm your required runtime.`
    },
    dimension: 'measurement',
    scoreWeight: 40,
  },
  {
    id: 'decision-rule',
    message: `Final question — your **decision rule**.\n\nFor each possible outcome, what will you do?\n- If significantly positive →\n- If significantly negative →\n- If not statistically significant →`,
    followUp: (answer) => {
      const wordCount = answer.trim().split(/\s+/).length
      if (wordCount > 30) return `Decision rule locked in. This prevents post-hoc rationalisation — one of the most common governance failures in experimentation programmes.`
      return `Pre-committing to decisions before results are known is critical. Expand this — a one-word answer won't hold up in a governance review.`
    },
    dimension: 'strategic',
    scoreWeight: 60,
  },
]

export const SUMMARY_STEP_ID = 'summary'
export const TOTAL_SCORED_QUESTIONS = COMPASS_STEPS.filter(s => s.dimension).length
