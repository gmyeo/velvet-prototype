import type { Container } from 'pixi.js'

export interface TweenHandle {
  cancel(): void
}

export function tweenScale(
  target: Container,
  from: number,
  to: number,
  durationMs: number,
  onDone?: () => void,
): TweenHandle {
  const start = performance.now()
  let raf = 0
  let cancelled = false

  const tick = (now: number) => {
    if (cancelled) return
    const t = Math.min((now - start) / durationMs, 1)
    const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
    const val = from + (to - from) * ease
    target.scale.set(val)
    if (t < 1) {
      raf = requestAnimationFrame(tick)
    } else {
      onDone?.()
    }
  }
  raf = requestAnimationFrame(tick)
  return { cancel: () => { cancelled = true; cancelAnimationFrame(raf) } }
}

export function scalePulse(target: Container, peak = 1.15, durationMs = 200): void {
  tweenScale(target, 1.0, peak, durationMs / 2, () => {
    tweenScale(target, peak, 1.0, durationMs / 2)
  })
}

export function tweenAlpha(
  target: Container,
  from: number,
  to: number,
  durationMs: number,
  onDone?: () => void,
): TweenHandle {
  const start = performance.now()
  let raf = 0
  let cancelled = false

  const tick = (now: number) => {
    if (cancelled) return
    const t = Math.min((now - start) / durationMs, 1)
    target.alpha = from + (to - from) * t
    if (t < 1) {
      raf = requestAnimationFrame(tick)
    } else {
      onDone?.()
    }
  }
  raf = requestAnimationFrame(tick)
  return { cancel: () => { cancelled = true; cancelAnimationFrame(raf) } }
}

export function tweenPosition(
  target: Container,
  fromX: number, fromY: number,
  toX: number, toY: number,
  durationMs: number,
  easing: 'linear' | 'inQuad' = 'linear',
  onDone?: () => void,
): TweenHandle {
  const start = performance.now()
  let raf = 0
  let cancelled = false

  const applyEase = (t: number) => easing === 'inQuad' ? t * t : t

  const tick = (now: number) => {
    if (cancelled) return
    const raw = Math.min((now - start) / durationMs, 1)
    const t = applyEase(raw)
    target.position.set(fromX + (toX - fromX) * t, fromY + (toY - fromY) * t)
    if (raw < 1) {
      raf = requestAnimationFrame(tick)
    } else {
      onDone?.()
    }
  }
  raf = requestAnimationFrame(tick)
  return { cancel: () => { cancelled = true; cancelAnimationFrame(raf) } }
}
