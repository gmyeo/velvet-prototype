// §9.1 Office Scene wireframe — Phase 6: Cold Case Wall + nameplate evolution
import { Container, Graphics, Text, TextStyle } from 'pixi.js'
import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from '../utils/grid'
import type { PlayerState } from '../core/PlayerState'
import { getOrder } from '../data/quests'
import { scalePulse, tweenAlpha } from '../utils/tween'
import { bus } from '../core/EventBus'
import { Toast } from '../ui/Toast'
import { Sound } from '../utils/sound'

// §5.3.2 Fame tier visual config
const TIER_STYLE: Record<number, { border: number; fill: number; borderW: number; label: string }> = {
  1: { border: 0x888888, fill: 0x1a1428, borderW: 1, label: '흑백 (★1)' },
  2: { border: 0x9e5a4a, fill: 0x2a1a14, borderW: 2, label: '로즈우드 (★2)' },
  3: { border: 0xd9b382, fill: 0x2a1f0a, borderW: 2, label: '금박 테두리 (★3)' },
  4: { border: 0x8b3a5c, fill: 0x1a0a14, borderW: 3, label: '벨벳 (★4)' },
}

// §5.3.4 Cold Case Wall headlines
const COLD_CASE: Record<string, string> = {
  q1_lost_cat:       '고양이 미오 무사 귀환 — 동네 신문',
  q2_crush_style:    '사랑은 단서로부터 — 가십 칼럼',
  q3_husband_secret: '한 여인의 결단 — 익명 기고',
  q4_stolen_diamond: '사라진 별빛, 조용히 돌아오다 — 사회면',
}

export class OfficeScene extends Container {
  private toast: Toast

  constructor(playerState: PlayerState, onAccept: () => void) {
    super()
    this.alpha = 0
    this.toast = new Toast()
    this.buildBg()
    this.buildHUD(playerState)
    this.buildRen()
    this.buildColdCaseWall(playerState)
    this.buildQuestCard(playerState, onAccept)
    this.buildNameplate(playerState)
    this.addChild(this.toast)

    tweenAlpha(this, 0, 1, 300)

    if (playerState.tierChanged !== null) {
      const tier = playerState.tierChanged
      setTimeout(() => {
        bus.emit('ui:toast', { message: `★${tier} 등급 달성! 새 의뢰가 도착했습니다.` })
      }, 600)
      playerState.tierChanged = null
    }
  }

  // ── Background ─────────────────────────────────────────────────────────

  private buildBg(): void {
    const bg = new Graphics()
    bg.rect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT).fill(0xf4ecdd)
    this.addChild(bg)
    const tex = new Graphics()
    for (let y = 0; y < VIRTUAL_HEIGHT; y += 40) {
      tex.rect(0, y, VIRTUAL_WIDTH, 1).fill({ color: 0xd9b382, alpha: 0.15 })
    }
    this.addChild(tex)
  }

  // ── HUD ─────────────────────────────────────────────────────────────────

  private buildHUD(ps: PlayerState): void {
    const bar = new Graphics()
    bar.rect(0, 0, VIRTUAL_WIDTH, 80).fill(0x1f2a44)
    bar.rect(0, 78, VIRTUAL_WIDTH, 2).fill(0xd9b382)
    this.addChild(bar)
    const menu = this.makeText('☰', 16, 0xd9b382)
    menu.position.set(20, 28)
    this.addChild(menu)
    const title = this.makeText(`Velvet Files  ★${ps.fameTier}`, 20, 0xffffff, true)
    title.anchor.set(0.5, 0.5)
    title.position.set(VIRTUAL_WIDTH / 2, 40)
    this.addChild(title)
    const coins = this.makeText(`💰 ${ps.coins}`, 16, 0xd9b382)
    coins.anchor.set(1, 0.5)
    coins.position.set(VIRTUAL_WIDTH - 16, 40)
    this.addChild(coins)
  }

  // ── Ren silhouette ──────────────────────────────────────────────────────

  private buildRen(): void {
    const area = new Container()
    area.position.set(20, 120)
    const w = 280; const h = 700
    const silhouette = new Graphics()
    silhouette.roundRect(0, 0, w, h, 12)
      .fill({ color: 0x2c3e6b, alpha: 0.9 })
      .stroke({ color: 0x8b3a5c, width: 2, alpha: 0.6 })
    area.addChild(silhouette)
    const initial = this.makeText('R', 160, 0x8b3a5c, true)
    initial.alpha = 0.12
    initial.anchor.set(0.5)
    initial.position.set(w / 2, h / 2 - 40)
    area.addChild(initial)
    const name = this.makeText('렌 (Ren)', 16, 0xd9b382)
    name.anchor.set(0.5, 1)
    name.position.set(w / 2, h - 16)
    area.addChild(name)
    this.addChild(area)
  }

  // ── §5.3.4 Signal 2: Cold Case Wall ─────────────────────────────────────

  private buildColdCaseWall(ps: PlayerState): void {
    if (ps.completedQuestIds.length === 0) return

    const wallX = 330
    const wallY = 100
    const wallW = 370
    const wallH = 160

    const wallBg = new Graphics()
    wallBg.roundRect(wallX, wallY, wallW, wallH, 10)
      .fill({ color: 0x1a1010, alpha: 0.7 })
      .stroke({ color: 0x6b4a2a, width: 1.5 })
    this.addChild(wallBg)

    const wallTitle = this.makeText('사건 보드', 11, 0x888888, true)
    wallTitle.position.set(wallX + 10, wallY + 8)
    this.addChild(wallTitle)

    ps.completedQuestIds.forEach((id, i) => {
      const headline = COLD_CASE[id]
      if (!headline) return

      const scrapX = wallX + 10 + (i % 2) * 178
      const scrapY = wallY + 28 + Math.floor(i / 2) * 62

      const scrapBg = new Graphics()
      scrapBg.roundRect(0, 0, 168, 54, 4)
        .fill({ color: 0xf4ead0, alpha: 0.92 })
        .stroke({ color: 0xb0905a, width: 1 })
      scrapBg.position.set(scrapX, scrapY)

      // Pin dot
      const pin = new Graphics()
      pin.circle(84, 4, 4).fill(0x8b3a5c)
      scrapBg.addChild(pin)

      this.addChild(scrapBg)

      const scrapText = new Text({
        text: headline,
        style: new TextStyle({
          fontSize: 10,
          fill: 0x2a1a0a,
          wordWrap: true,
          wordWrapWidth: 154,
          lineHeight: 14,
          fontFamily: 'serif',
        }),
      })
      scrapText.position.set(scrapX + 7, scrapY + 12)
      this.addChild(scrapText)

      // Small ✓ stamp
      const stamp = this.makeText('✓ 해결', 9, 0x6b8e5a, true)
      stamp.position.set(scrapX + 118, scrapY + 38)
      this.addChild(stamp)
    })
  }

  // ── Quest card ──────────────────────────────────────────────────────────

  private buildQuestCard(ps: PlayerState, onAccept: () => void): void {
    const order = getOrder(ps.activeQuestId)
    const card = new Container()

    // Shift card down if cold case wall is shown
    const cardY = ps.completedQuestIds.length > 0 ? 280 : 150
    card.position.set(330, cardY)

    const w = 370
    const h = 560

    const cardBg = new Graphics()
    cardBg.roundRect(0, 0, w, h, 16)
      .fill({ color: 0x2a1f35, alpha: 0.95 })
      .stroke({ color: 0xd9b382, width: 2 })
    card.addChild(cardBg)

    // Difficulty badge
    const diffBg = new Graphics()
    diffBg.roundRect(w - 60, 12, 48, 24, 6).fill(0x8b3a5c)
    card.addChild(diffBg)
    const diff = this.makeText(order.difficulty, 14, 0xffffff, true)
    diff.anchor.set(0.5)
    diff.position.set(w - 36, 24)
    card.addChild(diff)

    // Client portrait
    const portrait = new Graphics()
    portrait.circle(w / 2, 80, 50).fill(0x8b3a5c).stroke({ color: 0xd9b382, width: 3 })
    card.addChild(portrait)
    const initial = this.makeText(order.clientName[0], 40, 0xffffff, true)
    initial.anchor.set(0.5)
    initial.position.set(w / 2, 80)
    card.addChild(initial)

    // Client info
    const name = this.makeText(order.clientName, 20, 0xd9b382, true)
    name.anchor.set(0.5, 0)
    name.position.set(w / 2, 144)
    card.addChild(name)
    const age = this.makeText(order.clientAge, 12, 0xb0a090)
    age.anchor.set(0.5, 0)
    age.position.set(w / 2, 168)
    card.addChild(age)

    const div = new Graphics()
    div.rect(24, 196, w - 48, 1).fill({ color: 0xd9b382, alpha: 0.3 })
    card.addChild(div)

    const intro = new Text({
      text: `"${order.clientIntro}"`,
      style: new TextStyle({
        fontSize: 14, fill: 0xf4ecdd, fontStyle: 'italic',
        wordWrap: true, wordWrapWidth: w - 48, align: 'center', lineHeight: 22,
      }),
    })
    intro.anchor.set(0.5, 0)
    intro.position.set(w / 2, 208)
    card.addChild(intro)

    // Reward preview
    const rewardBg = new Graphics()
    rewardBg.roundRect(24, 310, w - 48, 52, 8).fill({ color: 0x1a1428, alpha: 0.6 })
    card.addChild(rewardBg)
    const reward = this.makeText(
      `보상: XP +${order.rewardXP}  💰 +${order.rewardCoins}  ★ +${order.rewardFame}`,
      13, 0xd9b382,
    )
    reward.anchor.set(0.5)
    reward.position.set(w / 2, 336)
    card.addChild(reward)

    // [수락] button
    const btnBg = new Graphics()
    btnBg.roundRect(40, 380, w - 80, 60, 12).fill(0x8b3a5c)
    card.addChild(btnBg)
    const btnLabel = this.makeText('수 락', 22, 0xffffff, true)
    btnLabel.anchor.set(0.5)
    btnLabel.position.set(w / 2, 410)
    card.addChild(btnLabel)

    const btnArea = new Graphics()
    btnArea.roundRect(40, 380, w - 80, 60, 12).fill({ color: 0xffffff, alpha: 0 })
    btnArea.eventMode = 'static'
    btnArea.cursor = 'pointer'
    btnArea.on('pointertap', () => {
      Sound.click()
      scalePulse(card, 1.03, 120)
      setTimeout(() => onAccept(), 120)
    })
    card.addChild(btnArea)

    const hint = this.makeText('"사건을 맡는다"', 12, 0x888888, false, true)
    hint.anchor.set(0.5, 0)
    hint.position.set(w / 2, 452)
    card.addChild(hint)

    this.addChild(card)
  }

  // ── §5.3.2 Signal 3: Nameplate evolution ────────────────────────────────

  private buildNameplate(ps: PlayerState): void {
    const plate = new Container()
    plate.position.set(VIRTUAL_WIDTH / 2 - 150, 1090)

    const style = TIER_STYLE[ps.fameTier]
    const w = 300; const h = 70

    // Velvet fill for ★4
    if (ps.fameTier === 4) {
      const velvet = new Graphics()
      velvet.roundRect(0, 0, w, h, 10).fill({ color: 0x1a0a14, alpha: 1 })
      plate.addChild(velvet)
      // Embossing diagonal lines
      const emb = new Graphics()
      for (let i = 0; i < w + h; i += 10) {
        emb.moveTo(Math.max(0, i - h), Math.min(h, i))
        emb.lineTo(Math.min(w, i), Math.max(0, i - w))
        emb.stroke({ color: 0x8b3a5c, width: 0.5, alpha: 0.3 })
      }
      plate.addChild(emb)
    }

    const bg = new Graphics()
    bg.roundRect(0, 0, w, h, 10)
      .fill(style.fill)
      .stroke({ color: style.border, width: style.borderW })
    plate.addChild(bg)

    // ★3 gold inner frame
    if (ps.fameTier === 3) {
      const inner = new Graphics()
      inner.roundRect(4, 4, w - 8, h - 8, 7).stroke({ color: 0xd9b382, width: 1, alpha: 0.5 })
      plate.addChild(inner)
    }

    const stars = '★'.repeat(ps.fameTier) + '☆'.repeat(4 - ps.fameTier)
    const text = this.makeText(`${stars}  ${ps.tierLabel}`, 15, style.border, true)
    text.anchor.set(0.5)
    text.position.set(w / 2, h / 2 - 8)
    plate.addChild(text)

    const sub = this.makeText('Velvet Files Detective Agency', 10, style.border)
    sub.alpha = 0.6
    sub.anchor.set(0.5)
    sub.position.set(w / 2, h / 2 + 14)
    plate.addChild(sub)

    this.addChild(plate)
  }

  // ── Helpers ───────────────────────────────────────────────────────────

  private makeText(content: string, size: number, color: number, bold = false, italic = false): Text {
    return new Text({
      text: content,
      style: new TextStyle({
        fontSize: size, fill: color,
        fontWeight: bold ? 'bold' : 'normal',
        fontStyle: italic ? 'italic' : 'normal',
      }),
    })
  }
}
