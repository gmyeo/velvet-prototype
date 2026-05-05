import { Board } from '../entities/Board'
import { Cell } from '../entities/Cell'
import type { OrderDef, OrderRequirementDef } from '../data/quests'
import { COLS, ROWS } from '../utils/grid'

export interface RequirementState extends OrderRequirementDef {
  boardCount: number   // actual items on board (raw, uncapped)
  isMet: boolean
}

export interface DeliveryGroup {
  req: RequirementState
  cells: Cell[]
}

export class QuestSystem {
  private order: OrderDef
  private _requirementStates: RequirementState[] = []
  private _earnedPoints = 0
  private _metFlags: boolean[] = []  // track newly-met for Ren comment trigger

  constructor(order: OrderDef) {
    this.order = order
    this._requirementStates = order.requirements.map(r => ({
      ...r,
      boardCount: 0,
      isMet: false,
    }))
    this._metFlags = order.requirements.map(() => false)
  }

  get order_(): OrderDef { return this.order }
  get requirementStates(): RequirementState[] { return this._requirementStates }
  get earnedPoints(): number { return this._earnedPoints }
  get goalPoints(): number { return this.order.goalPoints }

  /**
   * Scan all cells and update requirementStates.
   * Returns list of newly-met requirement indices (for Ren comment trigger).
   */
  rescan(board: Board): number[] {
    const counts = new Map<string, number>()
    board.allCells().forEach(cell => {
      if (cell.item) {
        const key = `${cell.item.chainId}:${cell.item.level}`
        counts.set(key, (counts.get(key) ?? 0) + 1)
      }
    })

    const newlyMet: number[] = []
    this._requirementStates = this.order.requirements.map((req, i) => {
      const boardCount = counts.get(`${req.itemChainId}:${req.itemLevel}`) ?? 0
      const isMet = boardCount >= req.requiredCount
      if (isMet && !this._metFlags[i]) {
        this._metFlags[i] = true
        newlyMet.push(i)
      }
      if (!isMet) this._metFlags[i] = false
      return { ...req, boardCount, isMet }
    })
    return newlyMet
  }

  isDeliverable(): boolean {
    return this._requirementStates.every(r => r.isMet)
  }

  isComplete(): boolean {
    return this._earnedPoints >= this.order.goalPoints
  }

  /**
   * Collect cells to consume per requirement (§5.2.4 auto-match).
   * Priority: same-chain requirements sorted by level ascending (§5.2.3).
   * Within each requirement: left→right, top→bottom.
   * Returns null if not deliverable.
   */
  collectDeliveryGroups(board: Board): DeliveryGroup[] | null {
    if (!this.isDeliverable()) return null

    // Sort requirements: same-chain → lowest level first (§5.2.3)
    const indexed = this._requirementStates.map((r, i) => ({ r, i }))
    indexed.sort((a, b) => {
      if (a.r.itemChainId === b.r.itemChainId) return a.r.itemLevel - b.r.itemLevel
      return a.i - b.i  // preserve original order across chains
    })

    const usedCells = new Set<Cell>()
    const groups: DeliveryGroup[] = []

    for (const { r } of indexed) {
      const cells: Cell[] = []
      let needed = r.requiredCount

      outer: for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          const cell = board.getCell(col, row)!
          if (
            !usedCells.has(cell) &&
            cell.item?.chainId === r.itemChainId &&
            cell.item?.level === r.itemLevel
          ) {
            cells.push(cell)
            usedCells.add(cell)
            needed--
            if (needed === 0) break outer
          }
        }
      }

      if (cells.length < r.requiredCount) return null  // safety check
      groups.push({ req: r, cells })
    }

    return groups
  }

  /** Called after delivery animation completes for a group */
  addPoints(points: number): void {
    this._earnedPoints = Math.min(this._earnedPoints + points, this.order.goalPoints)
  }
}
