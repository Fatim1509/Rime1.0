import { create } from 'zustand'
import { submitIntent as apiSubmitIntent, approveAction as apiApproveAction, rejectAction as apiRejectAction } from './api'

interface Agent {
  id: string
  status: 'idle' | 'thinking' | 'working' | 'error'
  currentAction?: string
  progress: number
  message: string
}

interface Action {
  id: string
  agentId: string
  type: string
  title: string
  description: string
  confidence: number
  status: 'pending' | 'approved' | 'rejected' | 'executing' | 'completed' | 'failed'
  createdAt: number
}

interface ScreenContext {
  capture: any
  analysis: any
  state: string
}

interface RimeStore {
  connected: boolean
  agents: Agent[]
  actions: Action[]
  context: ScreenContext | null
  
  setConnected: (connected: boolean) => void
  setAgents: (agents: Agent[]) => void
  addAction: (action: Action) => void
  updateAction: (id: string, updates: Partial<Action>) => void
  setContext: (context: ScreenContext) => void
  
  submitIntent: (query: string) => Promise<void>
  approveAction: (id: string) => Promise<void>
  rejectAction: (id: string) => Promise<void>
}

export const useRimeStore = create<RimeStore>((set, get) => ({
  connected: false,
  agents: [],
  actions: [],
  context: null,
  
  setConnected: (connected) => set({ connected }),
  
  setAgents: (agents) => set({ agents }),
  
  addAction: (action) => set((state) => ({
    actions: [...state.actions, action],
  })),
  
  updateAction: (id, updates) => set((state) => ({
    actions: state.actions.map((action) =>
      action.id === id ? { ...action, ...updates } : action
    ),
  })),
  
  setContext: (context) => set({ context }),
  
  submitIntent: async (query) => {
    try {
      const result = await apiSubmitIntent(query)
      if (result.success && result.data) {
        // Actions will be added via WebSocket events
      }
    } catch (error) {
      console.error('Failed to submit intent:', error)
    }
  },
  
  approveAction: async (id) => {
    get().updateAction(id, { status: 'approved' })
    try {
      await apiApproveAction(id)
    } catch (error) {
      console.error('Failed to approve action:', error)
      get().updateAction(id, { status: 'pending' })
    }
  },
  
  rejectAction: async (id) => {
    get().updateAction(id, { status: 'rejected' })
    try {
      await apiRejectAction(id)
    } catch (error) {
      console.error('Failed to reject action:', error)
      get().updateAction(id, { status: 'pending' })
    }
  },
}))
