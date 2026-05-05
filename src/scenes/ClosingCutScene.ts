// §5.3.8 사건 종결 컷 — Phase 6: enhanced placeholder with illustration frame
// Sequence: 200ms fade-in → 1600ms display → 200ms fade-out (total 2000ms)
import { Container, Graphics, Text, TextStyle } from 'pixi.js'
import { tweenAlpha } from '../utils/tween'
import { Sound } from '../utils/sound'
import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from '../utils/grid'
import type { OrderDef } from '../data/quests'

export class ClosingCutScene extends Container {
  constructor(order: OrderDef, onComplete: () => void) {
    super()
    this.eventMode = 'static'
    this.hitArea = { contains: () => true } as never

    this.build(order, onComplete)
  }

  private build(order: OrderDef, onComplete: () => void): void {
    // Black overlay
    const blackBg = new Graphics()
    blackBg.rect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT).fill(0x000000)
    blackBg.alpha = 0
    this.addChild(blackBg)

    // Colored closing cut panel
    const panel = new Container()
    panel.alpha = 0

    // Background fill
    const panelBg = new Graphics()
    panelBg.rect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT).fill(order.closingBgColor)
    panel.addChild(panelBg)

    // Vignette overlay
    const vignette = new Graphics()
    for (let i = 0; i < 8; i++) {
      const alpha = 0.05 * (i + 1)
      const inset = i * 40
      vignette.rect(inset, inset, VIRTUAL_WIDTH - inset * 2, VIRTUAL_HEIGHT - inset * 2)
        .stroke({ color: 0x000000, width: 80, alpha })
    }
    panel.addChild(vignette)

    // Illustration frame (§5.3.8: 에셋 슬롯 — placeholder)
    const frameX = 40; const frameY = 200
    const frameW = VIRTUAL_WIDTH - 80; const frameH = 580

    const frameOuter = new Graphics()
    frameOuter.roundRect(frameX - 6, frameY - 6, frameW + 12, frameH + 12, 14)
      .fill({ color: 0x000000, alpha: 0.4 })
      .stroke({ color: 0xffffff, width: 3, alpha: 0.6 })
    panel.addChild(frameOuter)

    const frameFill = new Graphics()
    frameFill.roundRect(frameX, frameY, frameW, frameH, 10)
      .fill({ color: 0x000000, alpha: 0.35 })
    panel.addChild(frameFill)

    // Illustration placeholder label (centred)
    const illustLbl = new Text({
      text: '[ 일러스트 ]',
      style: new TextStyle({ fontSize: 14, fill: 0xffffff, fontStyle: 'italic' }),
    })
    illustLbl.alpha = 0.3
    illustLbl.anchor.set(0.5)
    illustLbl.position.set(VIRTUAL_WIDTH / 2, frameY + frameH / 2)
    panel.addChild(illustLbl)

    // Caption at bottom of frame
    const caption = new Text({
      text: order.closingCaption,
      style: new TextStyle({
        fontSize: 24,
        fill: 0xffffff,
        fontWeight: 'bold',
        fontFamily: 'serif',
        align: 'center',
        wordWrap: true,
        wordWrapWidth: frameW - 40,
        dropShadow: true,
      }),
    })
    caption.anchor.set(0.5, 1)
    caption.position.set(VIRTUAL_WIDTH / 2, frameY + frameH - 20)
    panel.addChild(caption)

    this.addChild(panel)

    // "사건 종결" header
    const header = new Text({
      text: '사  건  종  결',
      style: new TextStyle({
        fontSize: 32,
        fill: 0xffffff,
        fontWeight: 'bold',
        fontFamily: 'serif',
        letterSpacing: 4,
        dropShadow: true,
      }),
    })
    header.anchor.set(0.5)
    header.position.set(VIRTUAL_WIDTH / 2, 130)
    header.alpha = 0
    this.addChild(header)

    // Decorative horizontal rule
    const rule = new Graphics()
    rule.rect(80, 158, VIRTUAL_WIDTH - 160, 1).fill({ color: 0xffffff, alpha: 0.5 })
    rule.alpha = 0
    this.addChild(rule)

    // ── Sequence ─────────────────────────────────────────────────────────
    tweenAlpha(blackBg, 0, 1, 200, () => {
      Sound.questComplete()
      tweenAlpha(panel, 0, 1, 150)
      tweenAlpha(header, 0, 1, 250)
      tweenAlpha(rule, 0, 1, 300)

      setTimeout(() => {
        tweenAlpha(blackBg, 1, 0, 200, () => onComplete())
      }, 1600)
    })
  }
}
