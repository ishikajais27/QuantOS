type MessageHandler = (data: string) => void
type ConnectCallback = () => void

class TradingWebSocket {
  private client: any = null
  private handlers: Map<string, MessageHandler[]> = new Map()
  private subscriptions: Map<string, any> = new Map()
  private pendingSubscriptions: Array<{
    instrument: string
    handler: MessageHandler
  }> = []
  private connected = false
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private onConnectCallback: ConnectCallback | null = null

  connect(onConnect?: ConnectCallback) {
    if (onConnect) this.onConnectCallback = onConnect
    if (this.connected) return

    // Dynamic import to avoid SSR issues
    if (typeof window === 'undefined') return

    import('@stomp/stompjs').then(({ Client }) => {
      import('sockjs-client').then(({ default: SockJS }) => {
        this.client = new Client({
          webSocketFactory: () => new SockJS('/ws'),
          reconnectDelay: 5000,

          onConnect: () => {
            this.connected = true
            this.onConnectCallback?.()

            // Re-subscribe to all pending
            this.pendingSubscriptions.forEach(({ instrument, handler }) => {
              this._subscribe(instrument, handler)
            })
            this.pendingSubscriptions = []
          },

          onDisconnect: () => {
            this.connected = false
            this.subscriptions.clear()
          },

          onStompError: (frame: any) => {
            console.error('STOMP error:', frame)
          },
        })
        this.client.activate()
      })
    })
  }

  private _subscribe(instrument: string, handler: MessageHandler) {
    if (!this.client || !this.connected) return

    const topic = `/topic/${instrument}`
    if (this.subscriptions.has(instrument)) {
      this.subscriptions.get(instrument).unsubscribe()
    }

    const sub = this.client.subscribe(topic, (msg: any) => {
      const handlers = this.handlers.get(instrument) || []
      handlers.forEach((h) => h(msg.body))
    })
    this.subscriptions.set(instrument, sub)
  }

  subscribe(instrument: string, handler: MessageHandler) {
    if (!this.handlers.has(instrument)) this.handlers.set(instrument, [])
    const existing = this.handlers.get(instrument)!
    if (!existing.includes(handler)) existing.push(handler)

    if (this.connected) {
      this._subscribe(instrument, handler)
    } else {
      const already = this.pendingSubscriptions.some(
        (p) => p.instrument === instrument,
      )
      if (!already) this.pendingSubscriptions.push({ instrument, handler })
    }
  }

  unsubscribe(instrument: string) {
    this.handlers.delete(instrument)
    this.pendingSubscriptions = this.pendingSubscriptions.filter(
      (p) => p.instrument !== instrument,
    )
    const sub = this.subscriptions.get(instrument)
    if (sub) {
      sub.unsubscribe()
      this.subscriptions.delete(instrument)
    }
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    this.client?.deactivate()
    this.connected = false
  }
}

export const tradingWS = new TradingWebSocket()
