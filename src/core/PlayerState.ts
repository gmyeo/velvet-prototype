import { getNextOrderId } from '../data/quests'
import type { OrderDef } from '../data/quests'

export interface SaveData {
  xp: number
  fame: number
  coins: number
  activeQuestId: string
  completedQuestIds: string[]
  energy: number
  tutorialDone: { q1: boolean; q2: boolean }
}

export class PlayerState {
  xp = 0
  fame = 0
  fameTier: 1 | 2 | 3 | 4 = 1
  coins = 0
  activeQuestId = 'q1_lost_cat'
  completedQuestIds: string[] = []
  energy = 100
  tutorialDone = { q1: false, q2: false }

  /** Apply quest rewards and advance to next quest */
  applyRewards(order: OrderDef): void {
    const prevTier = this.fameTier
    this.xp += order.rewardXP
    this.coins += order.rewardCoins
    this.fame += order.rewardFame
    this.fameTier = this.computeTier()
    this.tierChanged = this.fameTier !== prevTier ? this.fameTier : null

    if (!this.completedQuestIds.includes(order.id)) {
      this.completedQuestIds.push(order.id)
    }

    const nextId = getNextOrderId(order.id)
    this.activeQuestId = nextId ?? order.id
    this.allQuestsComplete = nextId === null
  }

  /** Set after applyRewards if the tier changed (null = no change) */
  tierChanged: (1 | 2 | 3 | 4) | null = null
  allQuestsComplete = false

  consumeEnergy(): boolean {
    if (this.energy <= 0) return false
    this.energy--
    return true
  }

  recoverEnergy(amount = 1): void {
    this.energy = Math.min(100, this.energy + amount)
  }

  private computeTier(): 1 | 2 | 3 | 4 {
    if (this.fame >= 700) return 4
    if (this.fame >= 300) return 3
    if (this.fame >= 100) return 2
    return 1
  }

  get tierLabel(): string {
    const labels: Record<number, string> = {
      1: '신참 (Rookie)',
      2: '동네 탐정',
      3: '소문난 탐정',
      4: '도시의 탐정',
    }
    return labels[this.fameTier]
  }

  toSaveData(): SaveData {
    return {
      xp: this.xp,
      fame: this.fame,
      coins: this.coins,
      activeQuestId: this.activeQuestId,
      completedQuestIds: [...this.completedQuestIds],
      energy: this.energy,
      tutorialDone: { ...this.tutorialDone },
    }
  }

  loadSaveData(data: SaveData): void {
    this.xp = data.xp
    this.fame = data.fame
    this.coins = data.coins
    this.fameTier = this.computeTier()
    this.activeQuestId = data.activeQuestId
    this.completedQuestIds = data.completedQuestIds ?? []
    this.energy = data.energy ?? 100
    this.tutorialDone = data.tutorialDone ?? { q1: false, q2: false }
  }
}
