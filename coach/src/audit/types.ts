export type Tenant = 'LX' | 'LH' | 'OS' | 'SN'

export type FallbackPath = 'llm' | 'fallback'

/**
 * Shape conforms to the future Supabase `audit_events.coach_invocation` row.
 * Owned jointly by AI/ML (`09`) and Platform/Security (`06`) per D12.
 */
export type CoachInvocationAuditEvent = {
  audit_id: string
  event_type: 'coach_invocation'
  criterion_id: string
  prompt_version: string
  model: string
  tenant: Tenant
  input_tokens: number
  output_tokens: number
  cache_read_input_tokens: number
  cache_creation_input_tokens: number
  latency_ms: number
  llm_score: number
  fallback_score: number
  final_score: number
  low_confidence: boolean
  fallback_path: FallbackPath
  llm_reasoning: string
  llm_source_evidence: string
  fallback_signals: string[]
  created_at: string
}
