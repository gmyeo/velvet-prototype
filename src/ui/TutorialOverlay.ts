// §8 Tutorial overlay — message panel + [건너뛰기] button
import { Container, Graphics, Text, TextStyle } from 'pixi.js'
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
    this.eventMode = 'none'

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
        wordWrapWidth: VIRTUAL_WIDTH - 80,
        lineHeight: 24,
        align: 'center',
      }),
    })
    this.msgText.anchor.set(0.5, 0)
    this.msgText.position.set(VIRTUAL_WIDTH / 2, 14)

    // Skip button
    const skipBg = new Graphics()
    skipBg.roundRect(VIRTUAL_WIDTH - 120, 90, 90, 30, 6).fill(0x8b3a5c)
    skipBg.eventMode = 'static'
    skipBg.cursor = 'pointer'
    skipBg.on('pointertap', () => this.onSkip?.())

    const skipLabel = new Text({
      text: '건너뛰기',
      style: new TextStyle({ fontSize: 12, fill: 0xffffff }),
    })
    skipLabel.anchor.set(0.5)
    skipLabel.position.set(VIRTUAL_WIDTH - 75, 105)

    this.panel = new Container()
    this.panel.position.set(0, PANEL_Y)
    this.panel.addChild(panelBg, this.msgText, skipBg, skipLabel)
    this.addChild(this.panel)
  }

  showStep(step: TutorialStepDef): void {
    this.msgText.text = `렌: "${step.message}"`
    this.eventMode = 'none'
    tweenAlpha(this, this.alpha, 1, 200)
  }

  hideStep(): void {
    tweenAlpha(this, this.alpha, 0, 200)
  }
}
