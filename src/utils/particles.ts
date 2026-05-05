// Lightweight particle burst — no external library
import { Container, Graphics } from 'pixi.js'

interface Particle {
  g: Graphics
  vx: number
  vy: number
  life: number
  maxLife: number
}

let particleContainer: Container | null = null

export function initParticles(parent: Container): void {
  particleContainer = new Container()
  particleContainer.eventMode = 'none'
  parent.addChild(particleContainer)
}

/** Burst of colored dots at (x, y). `count` dots, spread in a circle. */
export function burst(x: number, y: number, color: number, count = 8, speed = 3): void {
  if (!particleContainer) return

  const particles: Particle[] = []

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2
    const g = new Graphics()
    const r = 3 + Math.random() * 4
    g.circle(0, 0, r).fill({ color, alpha: 0.9 })
    g.position.set(x, y)
    particleContainer.addChild(g)

    particles.push({
      g,
      vx: Math.cos(angle) * speed * (0.6 + Math.random() * 0.8),
      vy: Math.sin(angle) * speed * (0.6 + Math.random() * 0.8),
      life: 0,
      maxLife: 400 + Math.random() * 300,
    })
  }

  let last = performance.now()
  const tick = (now: number) => {
    const dt = now - last
    last = now
    let alive = false

    for (const p of particles) {
      p.life += dt
      if (p.life >= p.maxLife) {
        particleContainer?.removeChild(p.g)
        continue
      }
      alive = true
      const t = p.life / p.maxLife
      p.g.position.x += p.vx * dt * 0.06
      p.g.position.y += p.vy * dt * 0.06
      p.g.alpha = 1 - t
    }

    if (alive) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

/** Short screen shake on the given container */
export function shake(container: Container, intensity = 8, durationMs = 220): void {
  const orig = { x: container.position.x, y: container.position.y }
  const start = performance.now()

  const tick = (now: number) => {
    const t = (now - start) / durationMs
    if (t >= 1) {
      container.position.set(orig.x, orig.y)
      return
    }
    const decay = 1 - t
    container.position.set(
      orig.x + (Math.random() - 0.5) * intensity * 2 * decay,
      orig.y + (Math.random() - 0.5) * intensity * decay,
    )
    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}
