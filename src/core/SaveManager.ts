import type { PlayerState, SaveData } from './PlayerState'

const SAVE_KEY = 'velvet_files_save'

export const SaveManager = {
  save(ps: PlayerState): void {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(ps.toSaveData()))
    } catch {
      // localStorage unavailable (private mode, etc.)
    }
  },

  load(): SaveData | null {
    try {
      const raw = localStorage.getItem(SAVE_KEY)
      if (!raw) return null
      return JSON.parse(raw) as SaveData
    } catch {
      return null
    }
  },

  clear(): void {
    try {
      localStorage.removeItem(SAVE_KEY)
    } catch {
      // ignore
    }
  },
}
