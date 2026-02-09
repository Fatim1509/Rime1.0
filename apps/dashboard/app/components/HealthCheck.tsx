'use client'

import { useEffect, useState } from 'react'
import { Activity, AlertCircle } from 'lucide-react'

export function HealthCheck() {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  const checkHealth = async () => {
    setIsChecking(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`)
      setIsHealthy(response.ok)
    } catch (error) {
      setIsHealthy(false)
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkHealth()
    const interval = setInterval(checkHealth, 30000) // Check every 30s
    return () => clearInterval(interval)
  }, [])

  if (isHealthy === null) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
        <span>Checking...</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      {isHealthy ? (
        <>
          <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
          <span className="text-success">System Healthy</span>
        </>
      ) : (
        <>
          <AlertCircle className="w-4 h-4 text-error" />
          <span className="text-error">System Error</span>
        </>
      )}
    </div>
  )
}
