// type MessageHandler = (data: string) => void

// class TradingWebSocket {
//   private ws: WebSocket | null = null
//   private handlers: Map<string, MessageHandler[]> = new Map()
//   private reconnectDelay = 2000

//   connect(url = 'ws://localhost:8084/ws/market') {
//     this.ws = new WebSocket(url)

//     this.ws.onopen = () => console.log('WS connected')

//     this.ws.onmessage = (event) => {
//       try {
//         const data = JSON.parse(event.data)
//         const instrument = data.symbol || data.instrument
//         if (instrument) {
//           this.handlers.get(instrument)?.forEach((h) => h(event.data))
//         }
//       } catch {
//         /* non-JSON message */
//       }
//     }

//     this.ws.onclose = () => {
//       console.log('WS disconnected, reconnecting...')
//       setTimeout(() => this.connect(url), this.reconnectDelay)
//     }

//     this.ws.onerror = (e) => console.error('WS error', e)
//   }

//   subscribe(instrument: string, handler: MessageHandler) {
//     if (!this.handlers.has(instrument)) this.handlers.set(instrument, [])
//     this.handlers.get(instrument)!.push(handler)

//     this.ws?.send(JSON.stringify({ action: 'subscribe', instrument }))
//   }

//   unsubscribe(instrument: string) {
//     this.handlers.delete(instrument)
//   }

//   disconnect() {
//     this.ws?.close()
//   }
// }

// export const tradingWS = new TradingWebSocket()
type MessageHandler = (data: string) => void

class TradingWebSocket {
  private ws: WebSocket | null = null
  private handlers: Map<string, MessageHandler[]> = new Map()
  private pendingSubscriptions: string[] = []
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null

  connect() {
    if (
      this.ws?.readyState === WebSocket.OPEN ||
      this.ws?.readyState === WebSocket.CONNECTING
    )
      return

    this.ws = new WebSocket('ws://localhost:8084/ws/market')

    this.ws.onopen = () => {
      // Flush all subscriptions that were queued before connection opened
      this.pendingSubscriptions.forEach((instrument) => {
        this.ws!.send(JSON.stringify({ action: 'subscribe', instrument }))
      })
      this.pendingSubscriptions = []
    }

    this.ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data)
        const instrument = parsed.instrument
        if (instrument && this.handlers.has(instrument)) {
          this.handlers.get(instrument)!.forEach((h) => h(event.data))
        }
      } catch (e) {
        console.error('WS parse error', e)
      }
    }

    this.ws.onerror = (e) => console.error('WS error', e)

    this.ws.onclose = () => {
      console.log('WS disconnected, reconnecting...')
      this.reconnectTimer = setTimeout(() => this.connect(), 3000)
    }
  }

  subscribe(instrument: string, handler: MessageHandler) {
    if (!this.handlers.has(instrument)) {
      this.handlers.set(instrument, [])
    }
    this.handlers.get(instrument)!.push(handler)

    if (this.ws?.readyState === WebSocket.OPEN) {
      // Already connected — send immediately
      this.ws.send(JSON.stringify({ action: 'subscribe', instrument }))
    } else {
      // Not ready yet — queue it, onopen will flush
      if (!this.pendingSubscriptions.includes(instrument)) {
        this.pendingSubscriptions.push(instrument)
      }
    }
  }

  unsubscribe(instrument: string) {
    this.handlers.delete(instrument)
    this.pendingSubscriptions = this.pendingSubscriptions.filter(
      (i) => i !== instrument,
    )
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ action: 'unsubscribe', instrument }))
    }
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    this.ws?.close()
    this.ws = null
  }
}

export const tradingWS = new TradingWebSocket()
