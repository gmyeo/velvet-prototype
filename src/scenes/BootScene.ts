import { Container, Text, TextStyle } from 'pixi.js'
import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from '../utils/grid'

export class BootScene extends Container {
  private onReady: () => void

  constructor(onReady: () => void) {
    super()
    this.onReady = onReady
    this.build()
  }

  private build(): void {
    const style = new TextStyle({
      fontSize: 28,
      fill: 0xd9b382,
      fontFamily: 'serif',
      fontWeight: 'bold',
    })
    const title = new Text({ text: 'Velvet Files', style })
    title.anchor.set(0.5)
    title.position.set(VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT / 2 - 30)
    this.addChild(title)

    const sub = new Text({
      text: '로딩 중...',
      style: new TextStyle({ fontSize: 14, fill: 0xf4ecdd }),
    })
    sub.anchor.set(0.5)
    sub.position.set(VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT / 2 + 20)
    this.addChild(sub)

    // Simulate async asset load — immediately ready in Phase 0
    setTimeout(() => this.onReady(), 300)
  }
}
