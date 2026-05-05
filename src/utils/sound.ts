// §11.1 Audio — Web Audio API synthesised sounds (no external files needed for prototype)
let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  return ctx
}

function playTone(
  freq: number,
  gainPeak: number,
  durationSec: number,
  type: OscillatorType = 'sine',
  freqEnd?: number,
): void {
  const ac = getCtx()
  const osc = ac.createOscillator()
  const gain = ac.createGain()

  osc.connect(gain)
  gain.connect(ac.destination)

  osc.type = type
  osc.frequency.setValueAtTime(freq, ac.currentTime)
  if (freqEnd !== undefined) {
    osc.frequency.linearRampToValueAtTime(freqEnd, ac.currentTime + durationSec)
  }

  gain.gain.setValueAtTime(0, ac.currentTime)
  gain.gain.linearRampToValueAtTime(gainPeak, ac.currentTime + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + durationSec)

  osc.start(ac.currentTime)
  osc.stop(ac.currentTime + durationSec)
}

export const Sound = {
  /** Soft click on item spawn */
  spawn(): void {
    try { playTone(880, 0.12, 0.08, 'sine', 660) } catch { /* ignore */ }
  },

  /** Pleasant chime on merge success */
  merge(level: number): void {
    const base = 440 + level * 55
    try {
      playTone(base, 0.18, 0.25, 'sine', base * 1.5)
      setTimeout(() => playTone(base * 1.5, 0.12, 0.2, 'sine'), 80)
    } catch { /* ignore */ }
  },

  /** Rising notes on delivery */
  deliver(): void {
    try {
      playTone(440, 0.14, 0.15, 'sine')
      setTimeout(() => playTone(550, 0.14, 0.15, 'sine'), 120)
      setTimeout(() => playTone(660, 0.16, 0.25, 'sine'), 240)
    } catch { /* ignore */ }
  },

  /** Triumphant fanfare on quest complete */
  questComplete(): void {
    try {
      playTone(523, 0.2, 0.2, 'sine')
      setTimeout(() => playTone(659, 0.2, 0.2, 'sine'), 180)
      setTimeout(() => playTone(784, 0.22, 0.4, 'sine'), 360)
    } catch { /* ignore */ }
  },

  /** Short click for UI button */
  click(): void {
    try { playTone(660, 0.08, 0.06, 'square') } catch { /* ignore */ }
  },
}
