// §5.3.3 인스턴트 충전 버튼 — 5💰 / +10 generator charges
import { Container, Graphics, Text, TextStyle } from 'pixi.js'
import { Sound } from '../utils/sound'
import { scalePulse } from '../utils/tween'

export class InstantRefillButton extends Container {
  private bg: Graphics
  private btnLabel: Text
  private enabled = true
  onRefill: (() => void) | null = null

  constructor() {
    super()
    this.bg = new Graphics()
    this.btnLabel = this.build()
    this.eventMode = 'static'
    this.cursor = 'pointer'
    this.on('pointertap', () => {
      if (!this.enabled) return
      Sound.click()
      scalePulse(this, 1.1, 100)
      this.onRefill?.()
    })
  }

  private build(): Text {
    this.bg.roundRect(0, 0, 76, 26, 6).fill(0x2c3e6b)
    this.bg.stroke({ color: 0xd9b382, width: 1 })
    this.addChild(this.bg)

    const lbl = new Text({
      text: '⚡+10  5💰',
      style: new TextStyle({ fontSize: 11, fill: 0xd9b382, fontWeight: 'bold' }),
    })
    lbl.anchor.set(0.5)
    lbl.position.set(38, 13)
    this.addChild(lbl)
    return lbl
  }

  setEnabled(canAfford: boolean): void {
    if (this.enabled === canAfford) return
    this.enabled = canAfford
    this.bg.clear()
    if (canAfford) {
      this.bg.roundRect(0, 0, 76, 26, 6).fill(0x2c3e6b)
      this.bg.stroke({ color: 0xd9b382, width: 1 })
      this.btnLabel.style.fill = 0xd9b382
    } else {
      this.bg.roundRect(0, 0, 76, 26, 6).fill(0x333333)
      this.btnLabel.style.fill = 0x666666
    }
  }
}
