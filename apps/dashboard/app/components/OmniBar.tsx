'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Mic, Sparkles } from 'lucide-react'
import { useRimeStore } from '../lib/store'

interface OmniBarProps {
  isOpen: boolean
  onClose: () => void
}

export function OmniBar({ isOpen, onClose }: OmniBarProps) {
  const [query, setQuery] = useState('')
  const [isListening, setIsListening] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { submitIntent } = useRimeStore()

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      submitIntent(query)
      setQuery('')
      onClose()
    }
  }

  const suggestions = [
    { icon: '🔧', text: 'Fix this error' },
    { icon: '💡', text: 'Explain this code' },
    { icon: '🔍', text: 'Search documentation' },
    { icon: '✉️', text: 'Draft message to...' },
    { icon: '📅', text: 'Schedule meeting' },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* OmniBar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-1/4 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 px-4"
          >
            <div className="glass rounded-2xl shadow-2xl overflow-hidden">
              {/* Search Input */}
              <form onSubmit={handleSubmit} className="flex items-center gap-3 p-4">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="What would you like RIME to do?"
                  className="flex-1 bg-transparent outline-none text-lg placeholder:text-gray-500"
                />
                <button
                  type="button"
                  onClick={() => setIsListening(!isListening)}
                  className={`p-2 rounded-lg transition-colors ${
                    isListening ? 'bg-primary text-white' : 'hover:bg-white/5'
                  }`}
                >
                  <Mic className="w-5 h-5" />
                </button>
              </form>

              {/* Suggestions */}
              <div className="border-t border-border p-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setQuery(suggestion.text)
                      inputRef.current?.focus()
                    }}
                    className="w-full text-left px-4 py-2 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-3"
                  >
                    <span className="text-xl">{suggestion.icon}</span>
                    <span className="text-sm">{suggestion.text}</span>
                  </button>
                ))}
              </div>

              {/* Footer Hint */}
              <div className="border-t border-border px-4 py-2 flex items-center justify-between text-xs text-gray-500">
                <span>Press Enter to submit</span>
                <span>ESC to close</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
