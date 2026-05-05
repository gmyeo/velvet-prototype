import { Container, Graphics, Text, TextStyle } from 'pixi.js'
import { CELL_SIZE } from '../utils/grid'
import type { GeneratorDef } from '../data/generators'

export class Generator extends Container {
  readonly def: GeneratorDef
  readonly col: number
  readonly row: number

  private lastDoubleTapTime = 0
  private readonly DOUBLE_TAP_MS = 300

  charge: number
  private chargeLbl: Text

  constructor(def: GeneratorDef, col: number, row: number) {
    super()
    this.def = def
    this.col = col
    this.row = row
    this.charge = def.initialCharge
    this.chargeLbl = this.buildSelf()
    this.eventMode = 'static'
    this.cursor = 'pointer'
  }

  private buildSelf(): Text {
    const s = CELL_SIZE - 4
    const r = 8

    const bg = new Graphics()
    bg.roundRect(-s / 2, -s / 2, s, s, r)
      .fill({ color: this.def.color, alpha: 0.9 })
      .stroke({ color: 0xffffff, width: 2, alpha: 0.7 })
    this.addChild(bg)

    // Icon
    const icon = new Graphics()
    icon.circle(0, -10, 11).fill(0xffffff)
    icon.alpha = 0.25
    this.addChild(icon)

    // Short name label
    const shortName = this.def.id.replace('gen_', '')
    const label = new Text({
      text: `⚙ ${shortName}`,
      style: new TextStyle({ fontSize: 10, fill: 0x1f2a44, fontWeight: 'bold', align: 'center' }),
    })
    label.anchor.set(0.5)
    label.position.set(0, -4)
    this.addChild(label)

    // Charge display bar background
    const barBg = new Graphics()
    barBg.roundRect(-s / 2 + 4, s / 2 - 16, s - 8, 10, 3).fill({ color: 0x000000, alpha: 0.4 })
    this.addChild(barBg)

    // Charge fill (redrawn in updateCharge)
    const barFill = new Graphics()
    barFill.name = 'chargeBar'
    this.addChild(barFill)

    // Charge count text
    const chargeLbl = new Text({
      text: `${this.charge}`,
      style: new TextStyle({ fontSize: 9, fill: 0xffffff, fontWeight: 'bold' }),
    })
    chargeLbl.anchor.set(0.5)
    chargeLbl.position.set(0, s / 2 - 10)
    chargeLbl.name = 'chargeLbl'
    this.addChild(chargeLbl)

    this.drawChargeBar(s)
    return chargeLbl
  }

  private drawChargeBar(s: number): void {
    const barFill = this.getChildByName('chargeBar') as Graphics
    if (!barFill) return
    barFill.clear()

    const maxCharge = this.def.initialCharge
    const ratio = Math.min(1, this.charge / maxCharge)
    const barW = (s - 12) * ratio
    if (barW > 0) {
      const fillColor = ratio > 0.3 ? 0xffffff : 0xf4a460
      barFill.roundRect(-s / 2 + 6, s / 2 - 15, barW, 8, 3).fill({ color: fillColor, alpha: 0.85 })
    }
  }

  updateChargeDisplay(): void {
    const s = CELL_SIZE - 4
    this.chargeLbl.text = `${this.charge}`
    this.drawChargeBar(s)
    // Pulse on refill
    if (this.charge >= this.def.initialCharge) {
      this.scale.set(1.05)
      setTimeout(() => this.scale.set(1), 150)
    }
  }

  /** Consume 1 manual charge. Returns false if empty. */
  consumeCharge(): boolean {
    if (this.charge <= 0) return false
    this.charge--
    this.updateChargeDisplay()
    return true
  }

  /** Add charge up to initialCharge cap. */
  addCharge(amount = 1): void {
    this.charge = Math.min(this.def.initialCharge, this.charge + amount)
    this.updateChargeDisplay()
  }

  /** Returns true if this tap counts as a double-tap */
  checkDoubleTap(): boolean {
    const now = performance.now()
    const delta = now - this.lastDoubleTapTime
    this.lastDoubleTapTime = now
    return delta < this.DOUBLE_TAP_MS && delta > 0
  }
}
