import { Container, Graphics, Text, TextStyle } from 'pixi.js'
import { Board } from '../entities/Board'
import { Item } from '../entities/Item'
import { Cell } from '../entities/Cell'
import { ClientSlot } from '../entities/ClientSlot'
import { MergeSystem } from '../systems/MergeSystem'
import { DragSystem } from '../systems/DragSystem'
import { GeneratorSystem } from '../systems/GeneratorSystem'
import { QuestSystem } from '../systems/QuestSystem'
import { EnergySystem } from '../systems/EnergySystem'
import { TutorialSystem } from '../systems/TutorialSystem'
import { PointGauge } from '../ui/PointGauge'
import { Toast } from '../ui/Toast'
import { TutorialOverlay } from '../ui/TutorialOverlay'
import { InstantRefillButton } from '../ui/InstantRefillButton'
import { bus } from '../core/EventBus'
import { SaveManager } from '../core/SaveManager'
import { Sound } from '../utils/sound'
import { initParticles, burst, shake } from '../utils/particles'
import { tweenPosition } from '../utils/tween'
import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT, BOARD_OFFSET_Y, CELL_SIZE } from '../utils/grid'
import { getOrder } from '../data/quests'
import { getChain } from '../data/chains'
import type { PlayerState } from '../core/PlayerState'
import type { TutorialStepDef } from '../systems/TutorialSystem'

const CLIENT_SLOT_Y = 60

export class BoardScene extends Container {
  private board: Board
  private mergeSystem: MergeSystem
  private dragSystem: DragSystem
  private generatorSystem: GeneratorSystem
  private questSystem: QuestSystem
  private energySystem: EnergySystem
  private tutorialSystem: TutorialSystem
  private clientSlot: ClientSlot
  private pointGauge: PointGauge
  private toast: Toast
  private tutorialOverlay: TutorialOverlay
  private refillBtn: InstantRefillButton
  private energyLabel!: Text
  private coinLabel!: Text
  private isDelivering = false
  private isComplete = false
  private playerState: PlayerState
  private onQuestComplete: () => void

  constructor(stage: Container, playerState: PlayerState, onQuestComplete: () => void) {
    super()
    this.eventMode = 'static'
    this.playerState = playerState
    this.onQuestComplete = onQuestComplete

    const bg = new Graphics()
    bg.rect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT).fill(0xf4ecdd)
    this.addChild(bg)

    // Particle layer (above board, below HUD)
    initParticles(this)

    const order = getOrder(playerState.activeQuestId)
    this.questSystem = new QuestSystem(order)

    const { gauge, refillBtn } = this.buildTopBar(order.clientName, playerState)
    this.pointGauge = gauge
    this.refillBtn = refillBtn

    this.clientSlot = new ClientSlot(order)
    this.clientSlot.position.set(0, CLIENT_SLOT_Y)
    this.clientSlot.onDeliver = () => this.runDelivery()
    this.addChild(this.clientSlot)

    this.board = new Board()
    this.addChild(this.board)

    this.mergeSystem = new MergeSystem()
    this.dragSystem = new DragSystem(this.board, stage, this.mergeSystem)
    this.generatorSystem = new GeneratorSystem(this.board)

    this.energySystem = new EnergySystem(playerState)
    this.energySystem.onEnergyChange = (e) => {
      this.energyLabel.text = `⚡${e}`
    }
    this.energySystem.start()
    this.generatorSystem.setEnergySystem(this.energySystem)

    this.tutorialSystem = new TutorialSystem()
    this.tutorialOverlay = new TutorialOverlay()

    this.toast = new Toast()
    this.addChild(this.toast)
    this.addChild(this.tutorialOverlay)

    this.board.allCells().forEach(cell => this.dragSystem.registerCell(cell))

    bus.on('board:changed', () => this.updateQuestState())
    bus.on<{ cell: Cell }>('board:itemAdded', ({ cell }) => {
      this.dragSystem.registerItemOnCell(cell)
      this.updateQuestState()
    })
    bus.on('tutorial:firstSpawn', () => this.tutorialSystem.notifyFirstSpawn())
    bus.on<{ chainId: string; level: number }>('merge:success', ({ chainId, level }) => {
      this.onMergeVisuals(chainId, level)
    })

    this.generatorSystem.setupGenerators(order.generatorIds)

    window.addEventListener('keydown', this.onKeyDown)
    this.updateQuestState()
    this.updateRefillBtn()

    if (order.type === 'Q1' && !playerState.tutorialDone.q1) {
      setTimeout(() => this.tutorialSystem.startQ1(), 500)
    } else if (order.type === 'Q2' && !playerState.tutorialDone.q2) {
      setTimeout(() => this.tutorialSystem.startQ2(), 300)
    }

    this.tutorialSystem.onStepChange(step => this.onTutorialStep(step))
    this.tutorialOverlay.onSkip = () => {
      this.tutorialSystem.skipQ1()
      playerState.tutorialDone.q1 = true
      SaveManager.save(playerState)
    }
  }

  // ── Top bar ──────────────────────────────────────────────────────────────

  private buildTopBar(
    clientName: string,
    ps: PlayerState,
  ): { gauge: PointGauge; refillBtn: InstantRefillButton } {
    const bar = new Graphics()
    bar.rect(0, 0, VIRTUAL_WIDTH, CLIENT_SLOT_Y).fill(0x1f2a44)
    this.addChild(bar)

    // Back button
    const back = new Text({ text: '← 사무소', style: new TextStyle({ fontSize: 13, fill: 0xd9b382 }) })
    back.position.set(10, 6)
    back.eventMode = 'static'
    back.cursor = 'pointer'
    back.on('pointertap', () => {
      Sound.click()
      SaveManager.save(this.playerState)
      bus.emit('ui:toast', { message: '진행이 저장되었습니다.' })
    })
    this.addChild(back)

    // Title
    const title = new Text({
      text: `${clientName}의 의뢰`,
      style: new TextStyle({ fontSize: 14, fill: 0xffffff, fontWeight: 'bold' }),
    })
    title.anchor.set(0.5, 0)
    title.position.set(VIRTUAL_WIDTH / 2, 4)
    this.addChild(title)

    // Energy label
    this.energyLabel = new Text({
      text: `⚡${ps.energy}`,
      style: new TextStyle({ fontSize: 12, fill: 0x8fd4b0 }),
    })
    this.energyLabel.position.set(VIRTUAL_WIDTH - 140, 4)
    this.addChild(this.energyLabel)

    // Coin label
    this.coinLabel = new Text({
      text: `💰${ps.coins}`,
      style: new TextStyle({ fontSize: 12, fill: 0xd9b382 }),
    })
    this.coinLabel.position.set(VIRTUAL_WIDTH - 140, 22)
    this.addChild(this.coinLabel)

    // §5.3.3 Instant refill button
    const refillBtn = new InstantRefillButton()
    refillBtn.position.set(VIRTUAL_WIDTH - 84, 4)
    refillBtn.onRefill = () => this.onInstantRefill()
    this.addChild(refillBtn)

    // Point gauge (narrower to fit coin display)
    const order = getOrder(ps.activeQuestId)
    const gauge = new PointGauge(220, order.goalPoints)
    gauge.position.set(VIRTUAL_WIDTH - 360, 38)
    this.addChild(gauge)

    return { gauge, refillBtn }
  }

  // ── §5.3.3 Instant refill ────────────────────────────────────────────────

  private onInstantRefill(): void {
    if (this.playerState.coins < 5) {
      bus.emit('ui:toast', { message: '코인이 부족합니다. (5💰 필요)' })
      return
    }
    this.playerState.coins -= 5
    this.coinLabel.text = `💰${this.playerState.coins}`
    this.generatorSystem.refillAll(10)
    bus.emit('ui:toast', { message: '생성기 충전 +10! (−5💰)' })
    this.updateRefillBtn()
  }

  private updateRefillBtn(): void {
    this.refillBtn.setEnabled(this.playerState.coins >= 5)
  }

  // ── Tutorial ─────────────────────────────────────────────────────────────

  private onTutorialStep(step: TutorialStepDef | null): void {
    if (!step) {
      this.tutorialOverlay.hideStep()
      if (!this.playerState.tutorialDone.q1) {
        this.playerState.tutorialDone.q1 = true
        SaveManager.save(this.playerState)
      }
      return
    }
    this.tutorialOverlay.showStep(step)
  }

  // ── Quest state ─────────────────────────────────────────────────────────

  private updateQuestState(): void {
    if (this.isComplete) return
    const newlyMet = this.questSystem.rescan(this.board)
    const states = this.questSystem.requirementStates
    const deliverable = this.questSystem.isDeliverable() && !this.isDelivering

    this.clientSlot.update(states, deliverable)

    newlyMet.forEach(idx => {
      const req = states[idx]
      if (req) bus.emit('ui:toast', { message: `렌: "${req.renComment}"` })
    })

    if (!this.tutorialSystem.isQ1Done()) {
      const l1 = this.board.allCells().filter(c =>
        c.item?.chainId === 'chain_clue' && c.item?.level === 1
      ).length
      const l2 = this.board.allCells().filter(c =>
        c.item?.chainId === 'chain_clue' && c.item?.level === 2
      ).length
      // T6는 isDeliverable 상태(모든 Requirements 충족)일 때만 트리거
      this.tutorialSystem.checkBoardState(l1, l2, this.questSystem.isDeliverable())
    }
  }

  // ── Merge visuals (§8 particles + shake) ────────────────────────────────

  private onMergeVisuals(chainId: string, level: number): void {
    const chain = getChain(chainId)
    const color = chain.levelColors[Math.min(level - 1, chain.levelColors.length - 1)]
    burst(VIRTUAL_WIDTH / 2, BOARD_OFFSET_Y + 300, color, 10, 4)
    shake(this.board, 6, 180)
  }

  // ── Delivery §5.2.4 + §5.3.7 enhanced ──────────────────────────────────

  private runDelivery(): void {
    if (this.isDelivering || this.isComplete) return

    const groups = this.questSystem.collectDeliveryGroups(this.board)
    if (!groups) return

    this.isDelivering = true
    this.clientSlot.update(this.questSystem.requirementStates, false)

    const flySequence: Array<{
      item: Item; fromX: number; fromY: number; reqIdx: number; points: number
    }> = []

    groups.forEach((group, gIdx) => {
      group.cells.forEach(cell => {
        const item = cell.removeItem()!
        flySequence.push({
          item,
          fromX: cell.col * CELL_SIZE + CELL_SIZE / 2,
          fromY: BOARD_OFFSET_Y + cell.row * CELL_SIZE + CELL_SIZE / 2,
          reqIdx: gIdx,
          points: group.req.points,
        })
      })
    })

    this.questSystem.rescan(this.board)

    const targetX = VIRTUAL_WIDTH / 2
    const targetY = CLIENT_SLOT_Y + 80

    const groupPending = new Map<number, { total: number; recv: number; points: number }>()
    groups.forEach((g, i) => groupPending.set(i, { total: g.cells.length, recv: 0, points: g.req.points }))

    let allDone = 0
    const total = flySequence.length

    flySequence.forEach(({ item, fromX, fromY, reqIdx }, i) => {
      setTimeout(() => {
        const proxy = new Item(item.chainId, item.level)
        proxy.position.set(fromX, fromY)
        proxy.eventMode = 'none'
        this.addChild(proxy)

        tweenPosition(proxy, fromX, fromY, targetX, targetY, 400, 'inQuad', () => {
          this.removeChild(proxy)

          // Phase 2: Absorb — particle burst at target
          const chain = getChain(item.chainId)
          const color = chain.levelColors[Math.min(item.level - 1, chain.levelColors.length - 1)]
          burst(targetX, targetY, color, 6, 3)

          const g = groupPending.get(reqIdx)!
          g.recv++
          if (g.recv === g.total) {
            // Phase 3: "+N pts" flyer flies to gauge
            this.showFlyerText(`+${g.points} pts`, targetX, targetY)
            this.questSystem.addPoints(g.points)
            // Phase 4: Animate gauge counter (600ms)
            this.animateGauge(this.questSystem.earnedPoints)
          }

          allDone++
          if (allDone === total) {
            Sound.deliver()
            this.tutorialSystem.notifyDelivered()
            setTimeout(() => this.onAllDelivered(), 600)
          }
        })
      }, i * 50)
    })
  }

  private onAllDelivered(): void {
    this.isDelivering = false
    if (this.questSystem.isComplete()) {
      this.isComplete = true
      Sound.questComplete()
      this.onQuestComplete()
    } else {
      this.updateQuestState()
    }
  }

  /** Phase 3: flyer rises then travels to gauge position */
  private showFlyerText(text: string, x: number, y: number): void {
    const label = new Text({
      text,
      style: new TextStyle({ fontSize: 22, fill: 0xd9b382, fontWeight: 'bold' }),
    })
    label.anchor.set(0.5)
    label.position.set(x, y)
    this.addChild(label)

    // Rise for 200ms then fly to gauge (Phase 4 HUD fly, 600ms)
    const gaugeX = VIRTUAL_WIDTH - 270
    const gaugeY = 38

    const startY = y
    let elapsed = 0
    const totalMs = 800

    const tick = () => {
      elapsed += 16
      const t = elapsed / totalMs
      if (t >= 1) {
        this.removeChild(label)
        return
      }
      // First 25%: rise; last 75%: fly toward gauge
      if (t < 0.25) {
        label.position.y = startY - t * 80
        label.alpha = 1
      } else {
        const ft = (t - 0.25) / 0.75
        label.position.x = x + (gaugeX - x) * ft
        label.position.y = (startY - 20) + (gaugeY - (startY - 20)) * ft
        label.alpha = 1 - ft * 0.8
        label.scale.set(1 - ft * 0.5)
      }
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }

  /** Phase 4: animate gauge from current to new value over 600ms */
  private animateGauge(targetPts: number): void {
    const startPts = this.pointGauge.currentPoints
    const startTime = performance.now()
    const durationMs = 600

    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / durationMs)
      const pts = Math.round(startPts + (targetPts - startPts) * t)
      this.pointGauge.setPoints(pts)
      if (t < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }

  // ── Debug ────────────────────────────────────────────────────────────────

  private onKeyDown = (e: KeyboardEvent): void => {
    const chainMap: Record<string, string> = {
      '1': 'chain_clue',
      '2': 'chain_tool',
      '3': 'chain_lifestyle',
      '4': 'chain_trace',
    }
    const chainId = chainMap[e.key]
    if (!chainId) return

    const emptyCell = this.board.findSpawnCell(3, 4)
    if (!emptyCell) {
      bus.emit('ui:toast', { message: '보드가 가득 찼습니다' })
      return
    }
    const item = new Item(chainId, 1)
    emptyCell.placeItem(item)
    this.dragSystem.registerItemOnCell(emptyCell)
    bus.emit('board:changed')
  }

  destroy(): void {
    window.removeEventListener('keydown', this.onKeyDown)
    this.generatorSystem.destroy()
    this.energySystem.stop()
    this.tutorialSystem.destroy()
    super.destroy()
  }
}
