'use client'

import { useState, useEffect } from 'react'
import { Monitor, Loader2 } from 'lucide-react'
import { useRimeStore } from '../lib/store'

export function ContextLens() {
  const { context } = useRimeStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (context) {
      setIsLoading(false)
    }
  }, [context])

  if (isLoading || !context) {
    return (
      <div className="glass rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Screen Context</h3>
        <div className="flex items-center justify-center py-12 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading context...</span>
        </div>
      </div>
    )
  }

  const { analysis } = context

  return (
    <div className="glass rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Screen Context</h3>
        <Monitor className="w-5 h-5 text-primary" />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-xs text-gray-400 mb-1">Application</div>
          <div className="font-medium capitalize">{analysis.application}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-1">Activity</div>
          <div className="font-medium capitalize">{analysis.userActivity}</div>
        </div>
      </div>

      {analysis.windowTitle && (
        <div className="mb-4">
          <div className="text-xs text-gray-400 mb-1">Window</div>
          <div className="text-sm font-mono bg-white/5 px-2 py-1 rounded">
            {analysis.windowTitle}
          </div>
        </div>
      )}

      {analysis.codeContext && (
        <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
          <div className="text-xs font-semibold text-purple-400 mb-2">Code Context</div>
          <div className="space-y-1">
            <div className="text-sm">
              <span className="text-gray-400">Language:</span>{' '}
              <span className="font-mono">{analysis.codeContext.language}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-400">File:</span>{' '}
              <span className="font-mono">{analysis.codeContext.fileName}</span>
            </div>
            {analysis.codeContext.errors.length > 0 && (
              <div className="mt-2 text-xs text-error">
                {analysis.codeContext.errors.length} error(s) detected
              </div>
            )}
          </div>
        </div>
      )}

      {analysis.browserContext && (
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="text-xs font-semibold text-blue-400 mb-2">Browser Context</div>
          <div className="text-sm truncate">
            <span className="text-gray-400">Page:</span>{' '}
            {analysis.browserContext.title}
          </div>
          <div className="text-xs text-gray-500 mt-1 truncate">
            {analysis.browserContext.url}
          </div>
        </div>
      )}
    </div>
  )
}
