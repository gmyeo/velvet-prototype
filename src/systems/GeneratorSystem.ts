import { FederatedPointerEvent } from 'pixi.js'
import { Generator } from '../entities/Generator'
import { Board } from '../entities/Board'
import { Item } from '../entities/Item'
import { scalePulse } from '../utils/tween'
import { bus } from '../core/EventBus'
import { Sound } from '../utils/sound'
import { burst } from '../utils/particles'
import { GENERATORS } from '../data/generators'
import type { EnergySystem } from './EnergySystem'
import { BOARD_OFFSET_Y, CELL_SIZE } from '../utils/grid'

export class GeneratorSystem {
  private board: Board
  private generators: Generator[] = []
  private autoTimers: Map<Generator, number> = new Map()
  private rechargeTimers: Map<Generator, number> = new Map()
  private energySystem: EnergySystem | null = null
  private firstTap = true

  constructor(board: Board) {
    this.board = board
  }

  setEnergySystem(es: EnergySystem): void {
    this.energySystem = es
  }

  get generatorList(): Generator[] {
    return this.generators
  }

  /** Place generators for the given quest's generatorIds list */
  setupGenerators(generatorIds: string[]): void {
    const defs = GENERATORS.filter(g => generatorIds.includes(g.id))
    defs.forEach(def => {
      const gen = this.board.addGenerator(def, def.col, def.row)
      this.generators.push(gen)
      this.startAutoSpawn(gen)
      this.startRecharge(gen)
    })
    // One board-level listener routes taps to the correct generator by position.
    // This bypasses Pixi.js z-order hit-testing which can miss generator objects
    // when overlapping cells or UI elements steal pointer events.
    this.setupBoardListener()
  }

  /** Instantly add charge to all generators — used by instant-refill button */
  refillAll(amount = 10): void {
    this.generators.forEach(gen => gen.addCharge(amount))
  }

  private setupBoardListener(): void {
    this.board.eventMode = 'static'
    this.board.on('pointerdown', (e: FederatedPointerEvent) => {
      const local = e.getLocalPosition(this.board)
      const gen = this.findGeneratorAt(local.x, local.y)
      if (gen) this.onGeneratorTap(gen)
    })
  }

  /** Returns the generator whose cell contains (boardX, boardY), or null. */
  private findGeneratorAt(boardX: number, boardY: number): Generator | null {
    const half = CELL_SIZE / 2
    for (const gen of this.generators) {
      if (
        Math.abs(boardX - gen.position.x) <= half &&
        Math.abs(boardY - gen.position.y) <= half
      ) {
        return gen
      }
    }
    return null
  }

  private onGeneratorTap(gen: Generator): void {
    if (!gen.checkDoubleTap()) {
      gen.flashFirstTap()
      return
    }

    // §5.3.5 energy check
    if (this.energySystem && !this.energySystem.consume()) return

    // Generator charge check
    if (!gen.consumeCharge()) {
      bus.emit('ui:toast', { message: `렌: "${gen.def.id.replace('gen_', '')} 생성기 충전이 필요합니다."` })
      return
    }

    if (this.firstTap) {
      this.firstTap = false
      bus.emit('tutorial:firstSpawn', null)
    }
    this.spawnFromGenerator(gen)
  }

  private spawnFromGenerator(gen: Generator): void {
    const spawnCell = this.board.findSpawnCell(gen.col, gen.row)
    if (!spawnCell) {
      bus.emit('ui:toast', { message: '보드가 가득 찼습니다' })
      return
    }

    const item = new Item(gen.def.chainId, 1)
    spawnCell.placeItem(item)
    scalePulse(item, 1.15, 200)
    Sound.spawn()

    const px = spawnCell.col * CELL_SIZE + CELL_SIZE / 2
    const py = BOARD_OFFSET_Y + spawnCell.row * CELL_SIZE + CELL_SIZE / 2
    burst(px, py, gen.def.color, 5, 2)

    bus.emit('board:itemAdded', { cell: spawnCell })
    bus.emit('board:changed')
  }

  private startAutoSpawn(gen: Generator): void {
    if (!gen.def.autoSpawnIntervalSec) return
    const intervalMs = gen.def.autoSpawnIntervalSec * 1000
    const timerId = window.setInterval(() => {
      this.spawnFromGenerator(gen)
    }, intervalMs)
    this.autoTimers.set(gen, timerId)
  }

  private startRecharge(gen: Generator): void {
    const intervalMs = gen.def.rechargeIntervalSec * 1000
    const timerId = window.setInterval(() => {
      if (gen.charge < gen.def.initialCharge) {
        gen.addCharge(1)
      }
    }, intervalMs)
    this.rechargeTimers.set(gen, timerId)
  }

  destroy(): void {
    this.autoTimers.forEach(id => clearInterval(id))
    this.autoTimers.clear()
    this.rechargeTimers.forEach(id => clearInterval(id))
    this.rechargeTimers.clear()
  }
}
