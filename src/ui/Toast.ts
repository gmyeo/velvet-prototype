import { Container, Graphics, Text, TextStyle } from 'pixi.js'
import { tweenAlpha } from '../utils/tween'
import { bus } from '../core/EventBus'
import { VIRTUAL_WIDTH } from '../utils/grid'

export class Toast extends Container {
  constructor() {
    super()
    bus.on<{ message: string }>('ui:toast', ({ message }) => this.show(message))
  }

  show(message: string): void {
    const style = new TextStyle({ fontSize: 14, fill: 0xffffff, fontWeight: 'bold' })
    const text = new Text({ text: message, style })
    text.anchor.set(0.5)

    const pad = 20
    const bg = new Graphics()
    bg.roundRect(
      -text.width / 2 - pad, -text.height / 2 - pad / 2,
      text.width + pad * 2, text.height + pad,
      12,
    ).fill({ color: 0x1f2a44, alpha: 0.9 })

    const toastContainer = new Container()
    toastContainer.addChild(bg)
    toastContainer.addChild(text)
    toastContainer.position.set(VIRTUAL_WIDTH / 2, 900)
    toastContainer.alpha = 0
    this.addChild(toastContainer)

    tweenAlpha(toastContainer, 0, 1, 200, () => {
      setTimeout(() => {
        tweenAlpha(toastContainer, 1, 0, 300, () => {
          this.removeChild(toastContainer)
        })
      }, 1800)
    })
  }
}
