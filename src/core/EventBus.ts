type Handler<T = unknown> = (data: T) => void

class EventBus {
  private listeners = new Map<string, Handler[]>()

  on<T>(event: string, handler: Handler<T>): void {
    const list = this.listeners.get(event) ?? []
    list.push(handler as Handler)
    this.listeners.set(event, list)
  }

  off<T>(event: string, handler: Handler<T>): void {
    const list = this.listeners.get(event) ?? []
    this.listeners.set(event, list.filter(h => h !== handler))
  }

  emit<T>(event: string, data?: T): void {
    const list = this.listeners.get(event) ?? []
    list.forEach(h => h(data as unknown))
  }
}

export const bus = new EventBus()
