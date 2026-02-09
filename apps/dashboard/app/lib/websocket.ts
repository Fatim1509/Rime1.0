import { io } from 'socket.io-client'
import { useRimeStore } from './store'

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000'

export function connectWebSocket() {
  const socket = io(WS_URL)
  const store = useRimeStore.getState()

  socket.on('connect', () => {
    console.log('✅ WebSocket connected')
    store.setConnected(true)
  })

  socket.on('disconnect', () => {
    console.log('❌ WebSocket disconnected')
    store.setConnected(false)
  })

  socket.on('agents:status', (agents) => {
    store.setAgents(agents)
  })

  socket.on('workflow:proposed', ({ result }) => {
    if (result.actions) {
      result.actions.forEach((action: any) => {
        store.addAction(action)
      })
    }
    if (result.metadata?.agentsUsed) {
      // Update agent states if needed
    }
  })

  socket.on('action:updated', (action) => {
    store.updateAction(action.id, action)
  })

  socket.on('context:update', (context) => {
    store.setContext(context)
  })

  return () => {
    socket.disconnect()
  }
}
