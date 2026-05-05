import { Item } from '../entities/Item'
import { getChain } from '../data/chains'
import { scalePulse } from '../utils/tween'
import { bus } from '../core/EventBus'
import { Sound } from '../utils/sound'

export interface MergeResult {
  success: boolean
  merged?: Item
}

export class MergeSystem {
  tryMerge(a: Item, b: Item): MergeResult {
    if (a.chainId !== b.chainId) return { success: false }
    if (a.level !== b.level) return { success: false }
    const chain = getChain(a.chainId)
    if (a.level >= chain.maxLevel) return { success: false }

    const merged = new Item(a.chainId, a.level + 1)
    scalePulse(merged, 1.2, 250)
    Sound.merge(merged.level)
    bus.emit('merge:success', { chainId: a.chainId, level: merged.level })
    return { success: true, merged }
  }

  canMerge(a: Item, b: Item): boolean {
    if (a.chainId !== b.chainId) return false
    if (a.level !== b.level) return false
    const chain = getChain(a.chainId)
    return a.level < chain.maxLevel
  }
}
