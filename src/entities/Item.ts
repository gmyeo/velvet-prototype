import { Container, Graphics, Text, TextStyle } from 'pixi.js'
import { getChain } from '../data/chains'
import { CELL_SIZE } from '../utils/grid'

export class Item extends Container {
  readonly chainId: string
  level: number
  private bg: Graphics
  private labelText: Text

  constructor(chainId: string, level: number) {
    super()
    this.chainId = chainId
    this.level = level

    const chain = getChain(chainId)
    const radius = CELL_SIZE * 0.38
    const color = chain.levelColors[Math.min(level - 1, chain.levelColors.length - 1)]

    this.bg = new Graphics()
    this.bg.circle(0, 0, radius).fill(color).stroke({ color: 0xffffff, width: 2, alpha: 0.5 })
    this.addChild(this.bg)

    const style = new TextStyle({
      fontSize: 10,
      fill: 0xffffff,
      fontWeight: 'bold',
      align: 'center',
      wordWrap: true,
      wordWrapWidth: radius * 1.8,
    })
    this.labelText = new Text({ text: `L${level}\n${chain.itemNames[level - 1]}`, style })
    this.labelText.anchor.set(0.5)
    this.addChild(this.labelText)

    this.eventMode = 'static'
    this.cursor = 'grab'
  }

  setHighlight(mode: 'none' | 'move' | 'merge' | 'reject'): void {
    const chain = getChain(this.chainId)
    const radius = CELL_SIZE * 0.38
    const color = chain.levelColors[Math.min(this.level - 1, chain.levelColors.length - 1)]
    this.bg.clear()

    switch (mode) {
      case 'merge':
        this.bg.circle(0, 0, radius).fill(color).stroke({ color: 0xd9b382, width: 3, alpha: 1 })
        break
      case 'move':
        this.bg.circle(0, 0, radius).fill(color).stroke({ color: 0x6b8e5a, width: 2, alpha: 1 })
        break
      case 'reject':
        this.bg.circle(0, 0, radius).fill(color).stroke({ color: 0xb33a3a, width: 2, alpha: 1 })
        break
      default:
        this.bg.circle(0, 0, radius).fill(color).stroke({ color: 0xffffff, width: 2, alpha: 0.5 })
    }
  }
}
