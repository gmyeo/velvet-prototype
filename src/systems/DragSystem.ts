import { Container, FederatedPointerEvent } from 'pixi.js'
import { Item } from '../entities/Item'
import { Cell } from '../entities/Cell'
import { Board } from '../entities/Board'
import { MergeSystem } from './MergeSystem'
import { bus } from '../core/EventBus'
import { CELL_SIZE } from '../utils/grid'

const DRAG_START_PX = 5    // px before drag is recognized
const DEBOUNCE_MS = 50     // input debounce
const SNAP_RATIO = 0.5     // snap if within 50% of cell size

export class DragSystem {
  private dragItem: Item | null = null
  private originCell: Cell | null = null
  private dragProxy: Item | null = null
  private mergeSystem: MergeSystem
  private board: Board
  private stage: Container
  private lastInputTime = 0
  private pointerDown = false
  private downX = 0
  private downY = 0
  private dragging = false
  private registeredCells = new WeakSet<Cell>()

  constructor(board: Board, stage: Container, mergeSystem: MergeSystem) {
    this.board = board
    this.stage = stage
    this.mergeSystem = mergeSystem
  }

  /** Wire up pointer events on a cell — idempotent */
  registerCell(cell: Cell): void {
    if (this.registeredCells.has(cell)) return
    this.registeredCells.add(cell)
    cell.on('pointerdown', (e: FederatedPointerEvent) => this.onCellDown(e, cell))
  }

  private onCellDown(e: FederatedPointerEvent, cell: Cell): void {
    if (e.button !== 0 && e.pointerType !== 'touch') return
    if (!cell.item) return
    if (Date.now() - this.lastInputTime < DEBOUNCE_MS) return
    this.lastInputTime = Date.now()

    this.pointerDown = true
    this.dragging = false
    this.downX = e.global.x
    this.downY = e.global.y
    this.dragItem = cell.item
    this.originCell = cell

    // Stage-level move/up to capture outside cell
    this.stage.on('pointermove', this.onMove, this)
    this.stage.on('pointerup', this.onUp, this)
    this.stage.on('pointerupoutside', this.onUp, this)
    e.stopPropagation()
  }

  private onMove = (e: FederatedPointerEvent): void => {
    if (!this.pointerDown || !this.dragItem || !this.originCell) return
    const dx = e.global.x - this.downX
    const dy = e.global.y - this.downY

    if (!this.dragging && Math.sqrt(dx * dx + dy * dy) > DRAG_START_PX) {
      this.startDrag()
    }
    if (!this.dragging) return

    if (this.dragProxy) {
      this.dragProxy.position.set(e.global.x, e.global.y)
    }
    this.updateDropHighlights(e.global.x, e.global.y)
  }

  private onUp = (e: FederatedPointerEvent): void => {
    this.stage.off('pointermove', this.onMove, this)
    this.stage.off('pointerup', this.onUp, this)
    this.stage.off('pointerupoutside', this.onUp, this)

    if (!this.dragging) {
      this.reset()
      return
    }
    this.endDrag(e.global.x, e.global.y)
  }

  private startDrag(): void {
    if (!this.dragItem || !this.originCell) return
    this.dragging = true

    // Lift item from cell — keep original in cell for now, proxy floats
    this.dragProxy = new Item(this.dragItem.chainId, this.dragItem.level)
    this.dragProxy.alpha = 0.8
    this.dragProxy.scale.set(1.1)
    this.dragProxy.position.set(this.downX, this.downY)
    this.dragProxy.eventMode = 'none'
    this.stage.addChild(this.dragProxy)

    // Dim original
    this.dragItem.alpha = 0.4
    this.clearHighlights()
  }

  private endDrag(gx: number, gy: number): void {
    const local = this.board.toLocal({ x: gx, y: gy })
    const coords = this.board.localPosToCellCoords(local.x, local.y)
    const origin = this.originCell!

    if (!coords) {
      this.returnToOrigin()
      return
    }

    const target = this.board.getCell(coords.col, coords.row)
    if (!target || target === origin) {
      this.returnToOrigin()
      return
    }

    this.applyDrop(origin, target)
  }

  private applyDrop(origin: Cell, target: Cell): void {
    const dragItem = this.dragItem!

    // Determine STRICT vs LENIENT (§5.1.4.1): currently no chain tracking, default LENIENT for board items
    // (Full chain tracking is in GeneratorSystem; DragSystem handles single-item drops)

    if (target.state === 'generator') {
      // Cannot drop on generator
      this.reject(target)
      this.returnToOrigin()
      return
    }

    if (target.isEmpty()) {
      // Move
      origin.removeItem()
      target.placeItem(dragItem)
      this.cleanupProxy()
      this.clearHighlights()
      dragItem.alpha = 1
      dragItem.setHighlight('none')
      bus.emit('board:changed')
    } else if (target.item && this.mergeSystem.canMerge(dragItem, target.item)) {
      // Merge ⭐
      const result = this.mergeSystem.tryMerge(dragItem, target.item)
      if (result.success && result.merged) {
        origin.removeItem()
        target.removeItem()
        target.placeItem(result.merged)
        this.cleanupProxy()
        this.clearHighlights()
        bus.emit('board:itemAdded', { cell: target, item: result.merged })
      } else {
        this.returnToOrigin()
      }
    } else if (target.item) {
      // Swap (same chain different level, or different chain)
      const otherItem = target.removeItem()!
      const myItem = origin.removeItem()!
      target.placeItem(myItem)
      origin.placeItem(otherItem)
      myItem.alpha = 1
      this.cleanupProxy()
      this.clearHighlights()
      bus.emit('board:changed')
    } else {
      this.returnToOrigin()
    }
  }

  private returnToOrigin(): void {
    if (this.dragItem) {
      this.dragItem.alpha = 1
      this.dragItem.setHighlight('none')
    }
    this.cleanupProxy()
    this.clearHighlights()
    this.reset()
  }

  private cleanupProxy(): void {
    if (this.dragProxy) {
      this.stage.removeChild(this.dragProxy)
      this.dragProxy = null
    }
    this.reset()
  }

  private reset(): void {
    this.pointerDown = false
    this.dragging = false
    this.dragItem = null
    this.originCell = null
  }

  private updateDropHighlights(gx: number, gy: number): void {
    this.clearHighlights()
    const local = this.board.toLocal({ x: gx, y: gy })
    const coords = this.board.localPosToCellCoords(local.x, local.y)
    if (!coords) return
    const target = this.board.getCell(coords.col, coords.row)
    if (!target || !this.dragItem) return

    // Check snap distance
    const cx = coords.col * CELL_SIZE + CELL_SIZE / 2
    const cy = coords.row * CELL_SIZE + CELL_SIZE / 2
    const snapThreshold = CELL_SIZE * SNAP_RATIO
    if (Math.abs(local.x - cx) > snapThreshold || Math.abs(local.y - cy) > snapThreshold) return

    if (target === this.originCell) return

    if (target.state === 'generator') {
      target.setBorderMode('reject')
    } else if (target.isEmpty()) {
      target.setBorderMode('move')
    } else if (target.item && this.mergeSystem.canMerge(this.dragItem, target.item)) {
      target.setBorderMode('merge')
      this.dragItem.setHighlight('merge')
    } else {
      target.setBorderMode('move')  // swap
    }
  }

  private reject(cell: Cell): void {
    cell.setBorderMode('reject')
    // shake
    const origX = cell.position.x
    let count = 0
    const id = setInterval(() => {
      cell.position.x = origX + (count % 2 === 0 ? 4 : -4)
      count++
      if (count >= 6) {
        cell.position.x = origX
        cell.setBorderMode('none')
        clearInterval(id)
      }
    }, 50)
  }

  private clearHighlights(): void {
    this.board.allCells().forEach(c => c.setBorderMode('none'))
    this.dragItem?.setHighlight('none')
  }

  /** Called from outside when a new item is placed on a cell (re-register pointer) */
  registerItemOnCell(cell: Cell): void {
    this.registerCell(cell)
  }
}
