'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { revertToBaseConfig } from '@/lib/config/service'
import { useRouter } from 'next/navigation'

interface ConfigRevertButtonProps {
  className?: string
}

export function ConfigRevertButton({ className }: ConfigRevertButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleRevert = async () => {
    if (!confirm('Are you sure you want to revert to base configuration? This will remove all active overrides.')) {
      return
    }

    setIsLoading(true)
    try {
      const result = await revertToBaseConfig()
      if (result.success) {
        // In a real implementation, this would trigger a page reload
        // or update the configuration state
        router.refresh()
      } else {
        alert('Failed to revert configuration')
      }
    } catch (error) {
      console.error('Error reverting configuration:', error)
      alert('An error occurred while reverting configuration')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className={className}
      onClick={handleRevert}
      disabled={isLoading}
    >
      {isLoading ? 'Reverting...' : 'Revert to Base Config'}
    </Button>
  )
}