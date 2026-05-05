import { Application, Container } from 'pixi.js'
import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from './utils/grid'
import { PlayerState } from './core/PlayerState'
import { SaveManager } from './core/SaveManager'
import { BootScene } from './scenes/BootScene'
import { OfficeScene } from './scenes/OfficeScene'
import { BoardScene } from './scenes/BoardScene'
import { ClosingCutScene } from './scenes/ClosingCutScene'
import { ResultScene } from './scenes/ResultScene'
import { EndingCard } from './scenes/EndingCard'
import { getOrder } from './data/quests'

export class Game {
  private app: Application
  private playerState = new PlayerState()
  private current: Container | null = null

  constructor(app: Application) {
    this.app = app
    this.app.stage.eventMode = 'static'
    this.app.stage.hitArea = this.app.screen

    // Load saved state if present
    const saved = SaveManager.load()
    if (saved) this.playerState.loadSaveData(saved)
  }

  start(): void {
    const boot = new BootScene(() => this.goToOffice())
    this.show(boot)
  }

  // ── Scene transitions ────────────────────────────────────────────────────

  private goToOffice(): void {
    this.show(new OfficeScene(this.playerState, () => this.goToBoard()))
  }

  private goToBoard(): void {
    this.show(new BoardScene(this.app.stage, this.playerState, () => this.goToClosingCut()))
  }

  private goToClosingCut(): void {
    const order = getOrder(this.playerState.activeQuestId)
    this.show(new ClosingCutScene(order, () => this.goToResult()))
  }

  private goToResult(): void {
    const order = getOrder(this.playerState.activeQuestId)
    this.playerState.applyRewards(order)  // sets playerState.tierChanged, allQuestsComplete
    SaveManager.save(this.playerState)

    this.show(
      new ResultScene(order, this.playerState.tierChanged, () => {
        if (this.playerState.allQuestsComplete) {
          this.goToEndingCard()
        } else {
          this.goToOffice()
        }
      }),
    )
  }

  private goToEndingCard(): void {
    this.show(new EndingCard(() => {
      // Reset to Q1 for replay
      SaveManager.clear()
      this.playerState = new PlayerState()
      this.goToOffice()
    }))
  }

  // ── Internal ─────────────────────────────────────────────────────────────

  private show(scene: Container): void {
    if (this.current) {
      this.app.stage.removeChild(this.current)
      if (this.current instanceof BoardScene) this.current.destroy()
    }
    this.current = scene
    this.app.stage.addChild(scene)
  }
}

// ── App factory ─────────────────────────────────────────────────────────────

export async function createApp(): Promise<Application> {
  const app = new Application()
  await app.init({
    width: VIRTUAL_WIDTH,
    height: VIRTUAL_HEIGHT,
    backgroundColor: 0x1a1a2e,
    antialias: true,
    resolution: Math.min(window.devicePixelRatio, 2),
    autoDensity: true,
  })

  const resize = () => {
    const scale = Math.min(window.innerWidth / VIRTUAL_WIDTH, window.innerHeight / VIRTUAL_HEIGHT)
    const w = VIRTUAL_WIDTH * scale
    const h = VIRTUAL_HEIGHT * scale
    app.canvas.style.width = `${w}px`
    app.canvas.style.height = `${h}px`
    app.canvas.style.position = 'absolute'
    app.canvas.style.left = `${(window.innerWidth - w) / 2}px`
    app.canvas.style.top = `${(window.innerHeight - h) / 2}px`
  }
  window.addEventListener('resize', resize)
  resize()

  return app
}
