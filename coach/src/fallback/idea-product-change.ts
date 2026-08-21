export type IdeaFallbackResult = {
  is_product_change: boolean
  signals: string[]
}

/**
 * Deterministic fallback for the idea-product-change validator. Conservative:
 * grants is_product_change=true only when there's BOTH an action word and a
 * concrete UI/surface element. Compared against the LLM to detect low-confidence.
 */
const ACTION_WORDS: RegExp = /\b(add|move|replace|change|remove|reorder|swap|insert|show|hide|surface|highlight|simplify|split|merge|reword|reformat|redesign|relocate|introduce|enable|disable|update)\b/i

const SURFACE_ELEMENTS: RegExp =
  /\b(button|cta|hero|header|footer|nav(igation)?|menu|modal|dialog|drawer|tab|tile|card|banner|tooltip|widget|table|form|field|input|dropdown|step|page|screen|flow|funnel|checkout|search|results?|booking|rebooking|fare|seat|payment|confirmation|onboarding|tooltip|copy|label|text|icon|badge|stepper)\b/i

const OPINION_RED_FLAGS: RegExp = /\b(we (should|need|must)|could be (better|nicer)|i feel|i think|leadership (wants|asked)|increase loyalty|improve conversion|better experience|rethink|reimagine)\b/i

const TRIVIAL_INPUT: RegExp = /^.{0,4}$|^(go|hi|hello|test|start|ok|yes|no)\.?$/i

export function fallbackIdeaProductChange(text: string): IdeaFallbackResult {
  const trimmed = text.trim()
  const signals: string[] = []

  if (TRIVIAL_INPUT.test(trimmed)) {
    return { is_product_change: false, signals: ['trivial_input'] }
  }

  if (ACTION_WORDS.test(trimmed)) signals.push('action_word')
  if (SURFACE_ELEMENTS.test(trimmed)) signals.push('surface_element')
  if (OPINION_RED_FLAGS.test(trimmed)) signals.push('opinion_flag')

  const hasAction = signals.includes('action_word')
  const hasSurface = signals.includes('surface_element')
  const hasOpinion = signals.includes('opinion_flag')

  // Need BOTH an action AND a concrete surface, and the input must not be
  // dominated by opinion phrasing.
  const isProductChange = hasAction && hasSurface && !hasOpinion

  return { is_product_change: isProductChange, signals }
}
