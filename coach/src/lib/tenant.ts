import type { Tenant } from '../audit/types.js'

const VALID_TENANTS: ReadonlyArray<Tenant> = ['LX', 'LH', 'OS', 'SN']

export function parseTenant(header: string | undefined): Tenant | null {
  if (!header) return null
  const upper = header.toUpperCase() as Tenant
  return VALID_TENANTS.includes(upper) ? upper : null
}
