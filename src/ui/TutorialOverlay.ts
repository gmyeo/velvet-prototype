// §8 Tutorial overlay — message panel + [건너뛰기] button
import { Container, FederatedPointerEvent, Graphics, Text, TextStyle } from 'pixi.js'
import { VIRTUAL_WIDTH } from '../utils/grid'
import { tweenAlpha } from '../utils/tween'
import type { TutorialStepDef } from '../systems/TutorialSystem'

const PANEL_Y = 960

export class TutorialOverlay extends Container {
  private panel: Container
  private msgText: Text
  onSkip: (() => void) | null = null

  constructor() {
    super()
    this.alpha = 0
    // 'passive' — 컨테이너 자신은 이벤트 미수신, 자식은 정상 수신
    this.eventMode = 'passive'

    const panelBg = new Graphics()
    panelBg.roundRect(20, 0, VIRTUAL_WIDTH - 40, 130, 14)
      .fill({ color: 0x1f2a44, alpha: 0.97 })
      .stroke({ color: 0xd9b382, width: 1.5 })

    this.msgText = new Text({
      text: '',
      style: new TextStyle({
        fontSize: 15,
        fill: 0xf4ecdd,
        wordWrap: true,
        wordWrapWidth: VIRTUAL_WIDTH - 130,
        lineHeight: 24,
        align: 'left',
      }),
    })
    this.msgText.position.set(36, 14)

    // [건너뛰기] 버튼 — eventMode: 'static' 필수
    const skipBg = new Graphics()
    skipBg.roundRect(0, 0, 90, 32, 8)
      .fill(0x8b3a5c)
      .stroke({ color: 0xd9b382, width: 1 })
    skipBg.eventMode = 'static'
    skipBg.cursor = 'pointer'
    skipBg.position.set(VIRTUAL_WIDTH - 126, 88)
    skipBg.on('pointerdown', (e: FederatedPointerEvent) => {
      e.stopPropagation()
      this.onSkip?.()
    })

    const skipLabel = new Text({
      text: '건너뛰기',
      style: new TextStyle({ fontSize: 13, fill: 0xffffff, fontWeight: 'bold' }),
    })
    skipLabel.anchor.set(0.5)
    skipLabel.position.set(45, 16)
    skipBg.addChild(skipLabel)

    this.panel = new Container()
    this.panel.position.set(0, PANEL_Y)
    this.panel.addChild(panelBg, this.msgText, skipBg)
    this.addChild(this.panel)
  }

  showStep(step: TutorialStepDef): void {
    this.msgText.text = `렌: "${step.message}"`
    tweenAlpha(this, this.alpha, 1, 200)
  }

  hideStep(): void {
    tweenAlpha(this, this.alpha, 0, 200)
  }
}
