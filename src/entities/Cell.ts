import { Container, Graphics } from 'pixi.js'
import { CELL_SIZE } from '../utils/grid'
import type { Item } from './Item'

export type CellState = 'empty' | 'item' | 'generator'

export class Cell extends Container {
  readonly col: number
  readonly row: number
  state: CellState = 'empty'
  item: Item | null = null

  private bg: Graphics
  private _borderMode: 'none' | 'move' | 'merge' | 'reject' = 'none'

  constructor(col: number, row: number) {
    super()
    this.col = col
    this.row = row

    this.bg = new Graphics()
    this.drawBg()
    this.addChild(this.bg)
    this.eventMode = 'static'
  }

  private drawBg(): void {
    this.bg.clear()
    const s = CELL_SIZE - 2
    const r = 6
    // base fill
    this.bg.roundRect(-s / 2, -s / 2, s, s, r).fill({ color: 0x2a3548, alpha: 0.6 })

    switch (this._borderMode) {
      case 'move':
        this.bg.roundRect(-s / 2, -s / 2, s, s, r).stroke({ color: 0x6b8e5a, width: 2 })
        break
      case 'merge':
        this.bg.roundRect(-s / 2, -s / 2, s, s, r).stroke({ color: 0xd9b382, width: 3 })
        break
      case 'reject':
        this.bg.roundRect(-s / 2, -s / 2, s, s, r).stroke({ color: 0xb33a3a, width: 2 })
        break
    }
  }

  setBorderMode(mode: 'none' | 'move' | 'merge' | 'reject'): void {
    if (this._borderMode === mode) return
    this._borderMode = mode
    this.drawBg()
  }

  isEmpty(): boolean {
    return this.state === 'empty'
  }

  placeItem(item: Item): void {
    if (this.item) this.removeChild(this.item)
    this.item = item
    this.state = 'item'
    item.position.set(0, 0)
    this.addChild(item)
  }

  removeItem(): Item | null {
    const it = this.item
    if (it) {
      this.removeChild(it)
      this.item = null
      this.state = 'empty'
    }
    return it
  }
}
