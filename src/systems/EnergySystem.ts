// §5.3.5 Energy System — 1 regen per 120s, consumed on generator double-tap
import type { PlayerState } from '../core/PlayerState'
import { bus } from '../core/EventBus'

const REGEN_INTERVAL_MS = 120_000  // 2 minutes per 1 energy

export class EnergySystem {
  private ps: PlayerState
  private regenTimer: number | null = null
  onEnergyChange: ((energy: number) => void) | null = null

  constructor(ps: PlayerState) {
    this.ps = ps
  }

  start(): void {
    this.regenTimer = window.setInterval(() => {
      if (this.ps.energy < 100) {
        this.ps.recoverEnergy(1)
        this.onEnergyChange?.(this.ps.energy)
        bus.emit('energy:changed', { energy: this.ps.energy })
      }
    }, REGEN_INTERVAL_MS)
  }

  /** Called when generator is double-tapped. Returns false if no energy. */
  consume(): boolean {
    const ok = this.ps.consumeEnergy()
    if (ok) {
      this.onEnergyChange?.(this.ps.energy)
      bus.emit('energy:changed', { energy: this.ps.energy })
    } else {
      bus.emit('ui:toast', { message: '렌: "잠시 쉬어야겠습니다." (에너지 부족)' })
    }
    return ok
  }

  stop(): void {
    if (this.regenTimer !== null) {
      clearInterval(this.regenTimer)
      this.regenTimer = null
    }
  }
}
