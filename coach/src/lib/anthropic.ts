import Anthropic from '@anthropic-ai/sdk'

let _client: Anthropic | null = null

/**
 * Lazy Anthropic client. Throws on first use if ANTHROPIC_API_KEY is missing —
 * lets the server boot and `/v1/health` respond even without the key
 * (useful for smoke-testing the scaffold).
 */
export function anthropic(): Anthropic {
  if (!_client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is required for LLM calls')
    }
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return _client
}
