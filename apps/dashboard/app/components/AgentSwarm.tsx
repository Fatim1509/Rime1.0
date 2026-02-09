'use client'

import { motion } from 'framer-motion'
import { Activity, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

interface Agent {
  id: string
  status: 'idle' | 'thinking' | 'working' | 'error'
  currentAction?: string
  progress: number
  message: string
}

interface AgentSwarmProps {
  agents: Agent[]
}

const agentConfig: Record<string, { name: string; icon: string; color: string }> = {
  research: { name: 'Research Agent', icon: '🔍', color: 'from-blue-500 to-cyan-500' },
  code: { name: 'Code Agent', icon: '💻', color: 'from-purple-500 to-pink-500' },
  communication: { name: 'Comm Agent', icon: '✉️', color: 'from-green-500 to-emerald-500' },
  meta: { name: 'Meta Agent', icon: '🧠', color: 'from-orange-500 to-red-500' },
}

export function AgentSwarm({ agents }: AgentSwarmProps) {
  const getStatusIcon = (status: Agent['status']) => {
    switch (status) {
      case 'idle':
        return <CheckCircle2 className="w-4 h-4 text-gray-400" />
      case 'thinking':
        return <Activity className="w-4 h-4 text-primary animate-pulse" />
      case 'working':
        return <Loader2 className="w-4 h-4 text-primary animate-spin" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-error" />
    }
  }

  return (
    <div className="glass rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Agent Swarm</h3>
      <div className="space-y-3">
        {agents.map((agent) => {
          const config = agentConfig[agent.id] || { name: agent.id, icon: '🤖', color: 'from-gray-500 to-gray-600' }
          
          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg bg-white/5 border border-border"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{config.icon}</span>
                  <span className="text-sm font-medium">{config.name}</span>
                </div>
                {getStatusIcon(agent.status)}
              </div>

              {agent.status !== 'idle' && (
                <>
                  {/* Progress Bar */}
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden mb-2">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${config.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${agent.progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>

                  {/* Status Message */}
                  <p className="text-xs text-gray-400">{agent.message}</p>
                </>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
