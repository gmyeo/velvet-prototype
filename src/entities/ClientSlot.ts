import { Container, Graphics, Text, TextStyle } from 'pixi.js'
import type { RequirementState } from '../systems/QuestSystem'
import type { OrderDef } from '../data/quests'
import { VIRTUAL_WIDTH } from '../utils/grid'
import { scalePulse } from '../utils/tween'
import { getChain } from '../data/chains'

export const SLOT_HEIGHT = 160
const PORTRAIT_W = 80
const BTN_W = 110

// Compact mode when > 3 requirements
const CARD_H_NORMAL = 44
const CARD_H_COMPACT = 28
const CARD_GAP_NORMAL = 6
const CARD_GAP_COMPACT = 4

export class ClientSlot extends Container {
  private reqCards: Container[] = []
  private deliverBtn: Container
  private btnBg!: Graphics
  private btnLabel!: Text
  private _deliverable = false
  private pulseTimer: ReturnType<typeof setInterval> | null = null
  private compact: boolean
  private reqAreaW: number
  onDeliver: (() => void) | null = null

  constructor(order: OrderDef) {
    super()
    this.compact = order.requirements.length > 3
    this.reqAreaW = VIRTUAL_WIDTH - PORTRAIT_W - BTN_W - 20
    this.buildBackground()
    this.buildPortrait(order)
    this.buildRequirementCards(order)
    this.deliverBtn = this.buildDeliverButton()
  }

  private buildBackground(): void {
    const bg = new Graphics()
    bg.rect(0, 0, VIRTUAL_WIDTH, SLOT_HEIGHT).fill({ color: 0x2a1f35, alpha: 0.95 })
    bg.rect(0, SLOT_HEIGHT - 2, VIRTUAL_WIDTH, 2).fill(0xd9b382)
    this.addChild(bg)
  }

  private buildPortrait(order: OrderDef): void {
    const area = new Container()
    area.position.set(8, 8)

    const circle = new Graphics()
    circle.circle(32, 50, 32).fill(0x8b3a5c).stroke({ color: 0xd9b382, width: 2 })
    area.addChild(circle)

    const initial = new Text({
      text: order.clientName[0],
      style: new TextStyle({ fontSize: 28, fill: 0xffffff, fontWeight: 'bold' }),
    })
    initial.anchor.set(0.5)
    initial.position.set(32, 50)
    area.addChild(initial)

    const name = new Text({
      text: order.clientName,
      style: new TextStyle({ fontSize: 13, fill: 0xd9b382, fontWeight: 'bold' }),
    })
    name.anchor.set(0.5, 0)
    name.position.set(32, 90)
    area.addChild(name)

    this.addChild(area)
  }

  private buildRequirementCards(order: OrderDef): void {
    const reqArea = new Container()
    reqArea.position.set(PORTRAIT_W + 10, 6)

    const cardH = this.compact ? CARD_H_COMPACT : CARD_H_NORMAL
    const gap = this.compact ? CARD_GAP_COMPACT : CARD_GAP_NORMAL

    order.requirements.forEach((req, i) => {
      const card = this.makeReqCard(req, cardH)
      card.position.set(0, i * (cardH + gap))
      reqArea.addChild(card)
      this.reqCards.push(card)
    })

    this.addChild(reqArea)
  }

  private makeReqCard(
    req: { itemChainId: string; itemLevel: number; requiredCount: number; clientDialogue: string },
    cardH: number,
  ): Container {
    const card = new Container()
    const compact = this.compact

    const bg = new Graphics()
    bg.roundRect(0, 0, this.reqAreaW, cardH, 6).fill({ color: 0x1a1428, alpha: 0.7 })
    card.addChild(bg)

    const chain = getChain(req.itemChainId)
    const dotR = compact ? 7 : 10
    const dotY = cardH / 2

    const dot = new Graphics()
    dot.circle(dotR + 4, dotY, dotR)
      .fill(chain.levelColors[Math.min(req.itemLevel - 1, chain.levelColors.length - 1)])
    card.addChild(dot)

    const itemName = chain.itemNames[req.itemLevel - 1]

    if (compact) {
      const label = new Text({
        text: `L${req.itemLevel} ${itemName}`,
        style: new TextStyle({ fontSize: 11, fill: 0xd9b382, fontWeight: 'bold' }),
      })
      label.position.set(dotR * 2 + 10, (cardH - 12) / 2)
      card.addChild(label)
    } else {
      const nameText = new Text({
        text: `L${req.itemLevel} ${itemName}`,
        style: new TextStyle({ fontSize: 12, fill: 0xd9b382, fontWeight: 'bold' }),
      })
      nameText.position.set(30, 4)
      card.addChild(nameText)

      const dialogue = new Text({
        text: `"${req.clientDialogue}"`,
        style: new TextStyle({ fontSize: 10, fill: 0xc0b0a0, fontStyle: 'italic' }),
      })
      dialogue.position.set(30, 22)
      card.addChild(dialogue)
    }

    const badge = new Text({
      text: `0/${req.requiredCount}`,
      style: new TextStyle({
        fontSize: compact ? 11 : 13,
        fill: 0x888888,
        fontWeight: 'bold',
      }),
    })
    badge.anchor.set(1, 0.5)
    badge.position.set(this.reqAreaW - 8, cardH / 2)
    badge.name = 'badge'
    card.addChild(badge)

    return card
  }

  private buildDeliverButton(): Container {
    const btn = new Container()
    btn.position.set(VIRTUAL_WIDTH - BTN_W - 4, (SLOT_HEIGHT - 60) / 2)
    btn.eventMode = 'static'
    btn.cursor = 'pointer'

    this.btnBg = new Graphics()
    this.btnBg.roundRect(0, 0, BTN_W, 60, 10).fill(0x555555)
    btn.addChild(this.btnBg)

    this.btnLabel = new Text({
      text: '전달',
      style: new TextStyle({ fontSize: 18, fill: 0x888888, fontWeight: 'bold' }),
    })
    this.btnLabel.anchor.set(0.5)
    this.btnLabel.position.set(BTN_W / 2, 30)
    btn.addChild(this.btnLabel)

    btn.on('pointertap', () => {
      if (this._deliverable) this.onDeliver?.()
    })

    this.addChild(btn)
    return btn
  }

  /** Called after every board rescan */
  update(states: RequirementState[], deliverable: boolean): void {
    const cardH = this.compact ? CARD_H_COMPACT : CARD_H_NORMAL

    states.forEach((state, i) => {
      const card = this.reqCards[i]
      if (!card) return

      const badge = card.getChildByName('badge') as Text
      if (!badge) return

      const bg = card.getChildAt(0) as Graphics

      if (state.isMet) {
        badge.text = '✓'
        badge.style.fill = 0x6b8e5a
        bg.clear()
        bg.roundRect(0, 0, this.reqAreaW, cardH, 6).fill({ color: 0x1a3020, alpha: 0.85 })
      } else {
        const display = Math.min(state.boardCount, state.requiredCount)
        badge.text = `${display}/${state.requiredCount}`
        badge.style.fill = display > 0 ? 0xd9b382 : 0x888888
        bg.clear()
        bg.roundRect(0, 0, this.reqAreaW, cardH, 6).fill({ color: 0x1a1428, alpha: 0.7 })
      }
    })

    this.setDeliverable(deliverable)
  }

  private setDeliverable(can: boolean): void {
    if (this._deliverable === can) return
    this._deliverable = can

    if (can) {
      this.btnBg.clear()
      this.btnBg.roundRect(0, 0, BTN_W, 60, 10).fill(0x8b3a5c)
      this.btnLabel.style.fill = 0xffffff
      this.startButtonPulse()
    } else {
      this.btnBg.clear()
      this.btnBg.roundRect(0, 0, BTN_W, 60, 10).fill(0x555555)
      this.btnLabel.style.fill = 0x888888
      this.stopButtonPulse()
    }
  }

  private startButtonPulse(): void {
    if (this.pulseTimer) return
    this.pulseTimer = setInterval(() => {
      scalePulse(this.deliverBtn, 1.05, 300)
    }, 600)
  }

  private stopButtonPulse(): void {
    if (this.pulseTimer) {
      clearInterval(this.pulseTimer)
      this.pulseTimer = null
    }
    this.deliverBtn.scale.set(1)
  }

  destroy(): void {
    this.stopButtonPulse()
    super.destroy()
  }
}
