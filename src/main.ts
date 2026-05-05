import { createApp, Game } from './Game'

async function main() {
  const app = await createApp()
  document.body.appendChild(app.canvas)
  const game = new Game(app)
  game.start()
}

main().catch(console.error)
