import { Container } from 'pixi.js'
import { Cell } from './Cell'
import { Generator } from './Generator'
import { Item } from './Item'
import { COLS, ROWS, CELL_SIZE, BOARD_OFFSET_X, BOARD_OFFSET_Y, cellToPixel, manhattan } from '../utils/grid'
import type { GeneratorDef } from '../data/generators'

export class Board extends Container {
  private cells: Cell[][] = []
  private generators: Generator[] = []

  constructor() {
    super()
    this.position.set(BOARD_OFFSET_X, BOARD_OFFSET_Y)
    this.buildGrid()
  }

  private buildGrid(): void {
    for (let row = 0; row < ROWS; row++) {
      this.cells[row] = []
      for (let col = 0; col < COLS; col++) {
        const cell = new Cell(col, row)
        cell.position.set(col * CELL_SIZE + CELL_SIZE / 2, row * CELL_SIZE + CELL_SIZE / 2)
        this.cells[row][col] = cell
        this.addChild(cell)
      }
    }
  }

  getCell(col: number, row: number): Cell | null {
    if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return null
    return this.cells[row][col]
  }

  allCells(): Cell[] {
    return this.cells.flat()
  }

  /** GDD §5.1.3: 4-directional adjacent first, then full board Manhattan nearest */
  findSpawnCell(fromCol: number, fromRow: number): Cell | null {
    const dirs: [number, number][] = [[0, -1], [1, 0], [0, 1], [-1, 0]]
    for (const [dc, dr] of dirs) {
      const c = this.getCell(fromCol + dc, fromRow + dr)
      if (c && c.isEmpty()) return c
    }
    // Full board scan — nearest Manhattan, left-to-right top-to-bottom on tie
    let best: Cell | null = null
    let bestDist = Infinity
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const c = this.cells[row][col]
        if (!c.isEmpty()) continue
        const d = manhattan(col, row, fromCol, fromRow)
        if (d < bestDist) {
          bestDist = d
          best = c
        }
      }
    }
    return best
  }

  addGenerator(def: GeneratorDef, col: number, row: number): Generator {
    const gen = new Generator(def, col, row)
    const cell = this.getCell(col, row)!
    cell.state = 'generator'
    gen.position.set(col * CELL_SIZE + CELL_SIZE / 2, row * CELL_SIZE + CELL_SIZE / 2)
    this.generators.push(gen)
    this.addChild(gen)
    return gen
  }

  getGenerators(): Generator[] {
    return this.generators
  }

  placeItem(item: Item, col: number, row: number): void {
    const cell = this.getCell(col, row)!
    cell.placeItem(item)
  }

  /** Convert board-local position to (col, row) */
  localPosToCellCoords(lx: number, ly: number): { col: number; row: number } | null {
    const col = Math.floor(lx / CELL_SIZE)
    const row = Math.floor(ly / CELL_SIZE)
    if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return null
    return { col, row }
  }

  /** Pixel position relative to this container's parent */
  cellCenter(col: number, row: number): { x: number; y: number } {
    const px = cellToPixel(col, row)
    return { x: px.x, y: px.y }
  }
}
