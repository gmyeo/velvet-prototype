// §7.5 Prototype ending card — shown after Q4 complete
import { Container, Graphics, Text, TextStyle } from 'pixi.js'
import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from '../utils/grid'
import { tweenAlpha, scalePulse } from '../utils/tween'

export class EndingCard extends Container {
  constructor(onContinue: () => void) {
    super()
    this.alpha = 0
    this.build(onContinue)
    tweenAlpha(this, 0, 1, 600)
  }

  private build(onContinue: () => void): void {
    const bg = new Graphics()
    bg.rect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT).fill(0x0d0d1a)
    this.addChild(bg)

    // Star field hint (simple dots)
    const stars = new Graphics()
    for (let i = 0; i < 60; i++) {
      const x = Math.random() * VIRTUAL_WIDTH
      const y = Math.random() * (VIRTUAL_HEIGHT * 0.7)
      const r = Math.random() < 0.3 ? 2 : 1
      stars.circle(x, y, r).fill({ color: 0xffffff, alpha: Math.random() * 0.6 + 0.2 })
    }
    this.addChild(stars)

    const title = new Text({
      text: '벨벳 파일즈는\n점점 유명해지고 있다...',
      style: new TextStyle({
        fontSize: 28,
        fill: 0xd9b382,
        fontWeight: 'bold',
        fontFamily: 'serif',
        align: 'center',
        lineHeight: 42,
      }),
    })
    title.anchor.set(0.5, 0.5)
    title.position.set(VIRTUAL_WIDTH / 2, 420)
    this.addChild(title)

    const sub = new Text({
      text: '— To Be Continued —',
      style: new TextStyle({
        fontSize: 18,
        fill: 0x8b3a5c,
        fontStyle: 'italic',
        fontFamily: 'serif',
      }),
    })
    sub.anchor.set(0.5, 0)
    sub.position.set(VIRTUAL_WIDTH / 2, 540)
    this.addChild(sub)

    const credit = new Text({
      text: '프로토타입 v1\nVelvet Files',
      style: new TextStyle({
        fontSize: 13,
        fill: 0x444466,
        align: 'center',
        lineHeight: 20,
      }),
    })
    credit.anchor.set(0.5, 0)
    credit.position.set(VIRTUAL_WIDTH / 2, 620)
    this.addChild(credit)

    // Continue button
    const btnY = 1050
    const btnBg = new Graphics()
    btnBg.roundRect(120, btnY, VIRTUAL_WIDTH - 240, 60, 12).fill(0x2a1f35)
    btnBg.stroke({ color: 0xd9b382, width: 1 })
    this.addChild(btnBg)

    const btnLabel = new Text({
      text: '처음으로',
      style: new TextStyle({ fontSize: 20, fill: 0xd9b382, fontWeight: 'bold' }),
    })
    btnLabel.anchor.set(0.5)
    btnLabel.position.set(VIRTUAL_WIDTH / 2, btnY + 30)
    this.addChild(btnLabel)

    const btnHit = new Graphics()
    btnHit.roundRect(120, btnY, VIRTUAL_WIDTH - 240, 60, 12).fill({ color: 0xffffff, alpha: 0 })
    btnHit.eventMode = 'static'
    btnHit.cursor = 'pointer'
    btnHit.on('pointertap', () => {
      scalePulse(btnBg, 1.02, 100)
      setTimeout(() => onContinue(), 120)
    })
    this.addChild(btnHit)
  }
}
