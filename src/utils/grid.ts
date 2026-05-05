export const COLS = 7
export const ROWS = 9
export const VIRTUAL_WIDTH = 720
export const VIRTUAL_HEIGHT = 1280

// Board layout constants (pixels within virtual resolution)
export const BOARD_OFFSET_X = 0
export const BOARD_OFFSET_Y = 220   // below client slot area
export const CELL_SIZE = Math.floor(VIRTUAL_WIDTH / COLS) // 102px

export function cellToPixel(col: number, row: number): { x: number; y: number } {
  return {
    x: BOARD_OFFSET_X + col * CELL_SIZE + CELL_SIZE / 2,
    y: BOARD_OFFSET_Y + row * CELL_SIZE + CELL_SIZE / 2,
  }
}

export function pixelToCell(px: number, py: number): { col: number; row: number } | null {
  const col = Math.floor((px - BOARD_OFFSET_X) / CELL_SIZE)
  const row = Math.floor((py - BOARD_OFFSET_Y) / CELL_SIZE)
  if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return null
  return { col, row }
}

export function manhattan(ax: number, ay: number, bx: number, by: number): number {
  return Math.abs(ax - bx) + Math.abs(ay - by)
}
