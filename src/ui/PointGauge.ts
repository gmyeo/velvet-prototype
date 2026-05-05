import { Container, Graphics, Text, TextStyle } from 'pixi.js'

export class PointGauge extends Container {
  private barFill: Graphics
  private ptLabel: Text
  private goalPoints: number
  private _currentPoints = 0
  get currentPoints(): number { return this._currentPoints }
  private barW: number

  constructor(width: number, goalPoints: number) {
    super()
    this.goalPoints = goalPoints
    this.barW = width - 140

    // Label: "수사 포인트"
    const title = new Text({
      text: '수사 포인트',
      style: new TextStyle({ fontSize: 11, fill: 0xd9b382 }),
    })
    title.position.set(0, 0)
    this.addChild(title)

    // Bar background
    const barBg = new Graphics()
    barBg.roundRect(80, 1, this.barW, 16, 4).fill({ color: 0x1a1428, alpha: 0.8 })
    this.addChild(barBg)

    // Bar fill
    this.barFill = new Graphics()
    this.drawFill()
    this.addChild(this.barFill)

    // Points label
    this.ptLabel = new Text({
      text: `0 / ${goalPoints}`,
      style: new TextStyle({ fontSize: 11, fill: 0xffffff, fontWeight: 'bold' }),
    })
    this.ptLabel.position.set(80 + this.barW + 8, 0)
    this.addChild(this.ptLabel)
  }

  private drawFill(): void {
    this.barFill.clear()
    const ratio = Math.min(this._currentPoints / this.goalPoints, 1)
    const fillW = Math.max(this.barW * ratio, 0)
    if (fillW > 0) {
      this.barFill.roundRect(80, 1, fillW, 16, 4).fill(0x8b3a5c)
    }
  }

  setPoints(pts: number): void {
    this._currentPoints = Math.min(pts, this.goalPoints)
    this.drawFill()
    this.ptLabel.text = `${this._currentPoints} / ${this.goalPoints}`
  }
}
