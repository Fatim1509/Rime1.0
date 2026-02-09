'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Clock, AlertCircle } from 'lucide-react'
import { useRimeStore } from '../lib/store'

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

interface ActionStreamProps {
  actions: Action[]
}

export function ActionStream({ actions }: ActionStreamProps) {
  const { approveAction, rejectAction } = useRimeStore()

  const getStatusColor = (status: Action['status']) => {
    switch (status) {
      case 'pending': return 'border-warning'
      case 'approved': return 'border-primary'
      case 'executing': return 'border-primary animate-pulse'
      case 'completed': return 'border-success'
      case 'rejected': return 'border-gray-600'
      case 'failed': return 'border-error'
    }
  }

  const getStatusIcon = (status: Action['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-warning" />
      case 'executing': return <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      case 'completed': return <Check className="w-4 h-4 text-success" />
      case 'rejected': return <X className="w-4 h-4 text-gray-400" />
      case 'failed': return <AlertCircle className="w-4 h-4 text-error" />
      default: return null
    }
  }

  const sortedActions = [...actions].sort((a, b) => b.createdAt - a.createdAt)

  return (
    <div className="glass rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Action Timeline</h3>
      
      {actions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No actions yet</p>
          <p className="text-sm mt-2">Use the OmniBar to get started</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {sortedActions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border-l-4 ${getStatusColor(action.status)} bg-white/5`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(action.status)}
                      <h4 className="font-medium text-sm">{action.title}</h4>
                      <span className="text-xs px-2 py-0.5 rounded bg-white/10">
                        {Math.round(action.confidence * 100)}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{action.description}</p>
                  </div>

                  {action.status === 'pending' && (
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => approveAction(action.id)}
                        className="p-1 rounded hover:bg-success/20 text-success transition-colors"
                        title="Approve"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => rejectAction(action.id)}
                        className="p-1 rounded hover:bg-error/20 text-error transition-colors"
                        title="Reject"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="text-xs text-gray-500">
                  {new Date(action.createdAt).toLocaleTimeString()}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
