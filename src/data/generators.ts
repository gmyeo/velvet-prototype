export interface GeneratorDef {
  id: string
  chainId: string
  initialCharge: number
  rechargeIntervalSec: number
  autoSpawnIntervalSec: number
  unlockFameTier: 1 | 2 | 3 | 4
  color: number
  col: number
  row: number
}

export const GENERATORS: GeneratorDef[] = [
  {
    id: 'gen_clue',
    chainId: 'chain_clue',
    initialCharge: 30,
    rechargeIntervalSec: 60,
    autoSpawnIntervalSec: 5.0,
    unlockFameTier: 1,
    color: 0x5b8fc4,
    col: 2,
    row: 1,
  },
  {
    id: 'gen_tool',
    chainId: 'chain_tool',
    initialCharge: 30,
    rechargeIntervalSec: 60,
    autoSpawnIntervalSec: 5.0,
    unlockFameTier: 1,
    color: 0xc47a3a,
    col: 4,
    row: 7,
  },
  {
    id: 'gen_lifestyle',
    chainId: 'chain_lifestyle',
    initialCharge: 25,
    rechargeIntervalSec: 75,
    autoSpawnIntervalSec: 5.0,
    unlockFameTier: 2,
    color: 0xc4728a,
    col: 5,
    row: 3,
  },
  {
    id: 'gen_trace',
    chainId: 'chain_trace',
    initialCharge: 20,
    rechargeIntervalSec: 90,
    autoSpawnIntervalSec: 5.0,
    unlockFameTier: 4,
    color: 0x4a8c6a,
    col: 1,
    row: 6,
  },
]

export function getGenerator(id: string): GeneratorDef {
  const gen = GENERATORS.find(g => g.id === id)
  if (!gen) throw new Error(`Unknown generator: ${id}`)
  return gen
}
