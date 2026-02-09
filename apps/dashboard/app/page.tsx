'use client'

import { useEffect, useState } from 'react'
import { OmniBar } from './components/OmniBar'
import { AgentSwarm } from './components/AgentSwarm'
import { ActionStream } from './components/ActionStream'
import { ContextLens } from './components/ContextLens'
import { HealthCheck } from './components/HealthCheck'
import { useRimeStore } from './lib/store'
import { connectWebSocket } from './lib/websocket'

export default function Dashboard() {
  const [isOmniBarOpen, setIsOmniBarOpen] = useState(false)
  const { connected, actions, agents } = useRimeStore()

  useEffect(() => {
    // Connect to WebSocket
    const cleanup = connectWebSocket()

    // Global keyboard shortcut for OmniBar
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.code === 'Space') {
        e.preventDefault()
        setIsOmniBarOpen(true)
      }
      
      // ESC to close
      if (e.code === 'Escape') {
        setIsOmniBarOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      cleanup()
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              RIME
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Recursive Intelligence Multi-Agent Environment
            </p>
          </div>
          
          <HealthCheck />
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Agent Swarm */}
        <div className="col-span-3">
          <AgentSwarm agents={agents} />
        </div>

        {/* Center Column - Context Lens & Action Stream */}
        <div className="col-span-6 space-y-6">
          <ContextLens />
          <ActionStream actions={actions} />
        </div>

        {/* Right Column - Stats & Info */}
        <div className="col-span-3">
          <div className="glass rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-gray-400">Active Agents</div>
                <div className="text-2xl font-bold text-primary">
                  {agents.filter(a => a.status === 'working').length}/{agents.length}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Pending Actions</div>
                <div className="text-2xl font-bold text-warning">
                  {actions.filter(a => a.status === 'pending').length}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Completed</div>
                <div className="text-2xl font-bold text-success">
                  {actions.filter(a => a.status === 'completed').length}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <button
                onClick={() => setIsOmniBarOpen(true)}
                className="w-full py-2 px-4 bg-primary/10 hover:bg-primary/20 rounded-lg text-primary transition-colors"
              >
                Open Command Palette
                <kbd className="ml-2 text-xs opacity-50">⌘⇧Space</kbd>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* OmniBar Modal */}
      <OmniBar
        isOpen={isOmniBarOpen}
        onClose={() => setIsOmniBarOpen(false)}
      />

      {/* Connection Status */}
      {!connected && (
        <div className="fixed bottom-4 right-4 bg-error/20 border border-error px-4 py-2 rounded-lg">
          <span className="text-error text-sm">⚠️ Disconnected from server</span>
        </div>
      )}
    </div>
  )
}
