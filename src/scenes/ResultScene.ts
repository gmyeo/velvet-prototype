// §9.3 결과 화면 (Result Screen)
import { Container, Graphics, Text, TextStyle } from 'pixi.js'
import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from '../utils/grid'
import { tweenAlpha, scalePulse } from '../utils/tween'
import type { OrderDef } from '../data/quests'

export class ResultScene extends Container {
  constructor(order: OrderDef, tierChanged: (1|2|3|4) | null, onReturnToOffice: () => void) {
    super()
    this.alpha = 0
    this.buildScene(order, tierChanged, onReturnToOffice)
    tweenAlpha(this, 0, 1, 400)
  }

  private buildScene(order: OrderDef, tierChanged: (1|2|3|4) | null, onReturn: () => void): void {
    const bg = new Graphics()
    bg.rect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT).fill(0x1a1428)
    this.addChild(bg)

    const header = new Text({
      text: '사  건  종  결',
      style: new TextStyle({
        fontSize: 30,
        fill: 0xd9b382,
        fontWeight: 'bold',
        fontFamily: 'serif',
        letterSpacing: 4,
      }),
    })
    header.anchor.set(0.5, 0)
    header.position.set(VIRTUAL_WIDTH / 2, 60)
    this.addChild(header)

    // §9.3 Illustration placeholder
    const illus = new Container()
    illus.position.set(40, 130)

    const illusBg = new Graphics()
    illusBg.roundRect(0, 0, VIRTUAL_WIDTH - 80, 340, 12).fill(order.closingBgColor)
    illus.addChild(illusBg)

    const illustText = new Text({
      text: order.closingCaption,
      style: new TextStyle({
        fontSize: 18,
        fill: 0x2a1f0a,
        fontWeight: 'bold',
        align: 'center',
        wordWrap: true,
        wordWrapWidth: VIRTUAL_WIDTH - 120,
      }),
    })
    illustText.anchor.set(0.5)
    illustText.position.set((VIRTUAL_WIDTH - 80) / 2, 170)
    illus.addChild(illustText)

    this.addChild(illus)

    const quote = new Text({
      text: order.clientOutro,
      style: new TextStyle({
        fontSize: 16,
        fill: 0xf4ecdd,
        fontStyle: 'italic',
        align: 'center',
        wordWrap: true,
        wordWrapWidth: VIRTUAL_WIDTH - 80,
        lineHeight: 26,
      }),
    })
    quote.anchor.set(0.5, 0)
    quote.position.set(VIRTUAL_WIDTH / 2, 494)
    this.addChild(quote)

    const clientSig = new Text({
      text: `— ${order.clientName}`,
      style: new TextStyle({ fontSize: 14, fill: 0xd9b382, fontStyle: 'italic' }),
    })
    clientSig.anchor.set(0.5, 0)
    clientSig.position.set(VIRTUAL_WIDTH / 2, 570)
    this.addChild(clientSig)

    const div = new Graphics()
    div.rect(60, 606, VIRTUAL_WIDTH - 120, 1).fill({ color: 0xd9b382, alpha: 0.3 })
    this.addChild(div)

    // Reward display (§9.3, C7)
    const rewardRow = new Container()
    rewardRow.position.set(0, 620)

    const rewards: Array<{ icon: string; value: string; color: number }> = [
      { icon: '✦ XP', value: `+${order.rewardXP}`, color: 0x7ba7d4 },
      { icon: '💰', value: `+${order.rewardCoins}`, color: 0xd9b382 },
      { icon: '★ Fame', value: `+${order.rewardFame}`, color: 0x8b3a5c },
    ]
    const blockW = VIRTUAL_WIDTH / 3
    rewards.forEach(({ icon, value, color }, i) => {
      const block = new Container()
      block.position.set(i * blockW, 0)

      const lbl = new Text({ text: icon, style: new TextStyle({ fontSize: 13, fill: 0x888888 }) })
      lbl.anchor.set(0.5, 0)
      lbl.position.set(blockW / 2, 0)
      block.addChild(lbl)

      const val = new Text({
        text: value,
        style: new TextStyle({ fontSize: 28, fill: color, fontWeight: 'bold' }),
      })
      val.anchor.set(0.5, 0)
      val.position.set(blockW / 2, 22)
      block.addChild(val)

      rewardRow.addChild(block)
    })
    this.addChild(rewardRow)

    // Fame tier-up notification
    if (tierChanged !== null) {
      const tierBg = new Graphics()
      tierBg.roundRect(60, 718, VIRTUAL_WIDTH - 120, 36, 8).fill({ color: 0x8b3a5c, alpha: 0.3 })
      this.addChild(tierBg)

      const tierText = new Text({
        text: `★${tierChanged} 등급 달성 — 더 많은 의뢰가 찾아옵니다!`,
        style: new TextStyle({ fontSize: 14, fill: 0xd9b382, fontWeight: 'bold' }),
      })
      tierText.anchor.set(0.5)
      tierText.position.set(VIRTUAL_WIDTH / 2, 736)
      this.addChild(tierText)
    } else {
      const fameText = new Text({
        text: '당신은 더 유명해졌습니다.',
        style: new TextStyle({ fontSize: 15, fill: 0xd9b382, fontStyle: 'italic' }),
      })
      fameText.anchor.set(0.5, 0)
      fameText.position.set(VIRTUAL_WIDTH / 2, 720)
      this.addChild(fameText)
    }

    // [사무소로 돌아가기] button
    const btnY = 820
    const btnBg = new Graphics()
    btnBg.roundRect(80, btnY, VIRTUAL_WIDTH - 160, 70, 14).fill(0x8b3a5c)
    this.addChild(btnBg)

    const btnLabel = new Text({
      text: '사무소로 돌아가기',
      style: new TextStyle({ fontSize: 22, fill: 0xffffff, fontWeight: 'bold' }),
    })
    btnLabel.anchor.set(0.5)
    btnLabel.position.set(VIRTUAL_WIDTH / 2, btnY + 35)
    this.addChild(btnLabel)

    const btnHit = new Graphics()
    btnHit.roundRect(80, btnY, VIRTUAL_WIDTH - 160, 70, 14).fill({ color: 0xffffff, alpha: 0 })
    btnHit.eventMode = 'static'
    btnHit.cursor = 'pointer'
    btnHit.on('pointertap', () => {
      scalePulse(btnBg, 1.02, 100)
      setTimeout(() => onReturn(), 120)
    })
    this.addChild(btnHit)

    const renText = new Text({
      text: order.renOutro,
      style: new TextStyle({
        fontSize: 13,
        fill: 0x888888,
        fontStyle: 'italic',
        align: 'center',
        wordWrap: true,
        wordWrapWidth: VIRTUAL_WIDTH - 80,
        lineHeight: 20,
      }),
    })
    renText.anchor.set(0.5, 0)
    renText.position.set(VIRTUAL_WIDTH / 2, 910)
    this.addChild(renText)
  }
}
