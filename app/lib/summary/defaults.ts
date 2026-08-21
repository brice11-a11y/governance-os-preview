import type { Experiment, ExperimentSummary, AllocationArm } from '@/lib/experiments/types'

export function seedSummary(exp: Experiment): ExperimentSummary {
  const variants = exp.power?.variants ?? 2
  const split = Math.floor(100 / variants)
  const arms: AllocationArm[] = Array.from({ length: variants }, (_, i) => ({
    id: i === 0 ? 'control' : `variant-${i}`,
    name: i === 0 ? 'Control' : `Variant ${String.fromCharCode(64 + i)}`,
    description: i === 0 ? 'Current experience.' : (exp.blueprint.hypothesis.specificElement ?? 'The change under test.'),
    trafficPct: i === variants - 1 ? 100 - split * (variants - 1) : split,
  }))
  return {
    owner: 'You',
    campaignName: '',
    allocation: arms,
    qa: { rendersAcrossDevices: false, trackingFires: false, exposureRulesConfirmed: false },
    decisionProtocolCaptured: false,
  }
}
