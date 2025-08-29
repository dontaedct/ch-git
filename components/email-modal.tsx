'use client'

/* eslint-disable react/no-unescaped-entities */
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Mail, Loader2 } from 'lucide-react'
import { requestEmailCopy, getEmailProviderStatus } from '@/lib/email/service'
import { toast } from 'sonner'

interface EmailModalProps {
  isOpen: boolean
  onClose: () => void
  clientName: string
  planTitle: string
  pdfBlob?: Blob
  filename?: string
  initialEmail?: string
}

export function EmailModal({
  isOpen,
  onClose,
  clientName,
  planTitle,
  pdfBlob,
  filename,
  initialEmail = ''
}: EmailModalProps) {
  const [email, setEmail] = useState(initialEmail)
  const [isLoading, setIsLoading] = useState(false)
  
  const providerStatus = getEmailProviderStatus()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      toast.error('Please enter an email address')
      return
    }

    if (!email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }

    setIsLoading(true)

    try {
      const result = await requestEmailCopy({
        to: email,
        subject: '', // Will be processed by the service
        clientName,
        planTitle,
        date: new Date().toLocaleDateString(),
        pdfBlob,
        filename
      })

      if (result.success) {
        toast.success('Email sent successfully!', {
          description: result.message
        })
        onClose()
      } else {
        toast.error('Failed to send email', {
          description: result.message
        })
      }
    } catch (error) {
      console.error('Email request failed:', error)
      toast.error('Failed to send email', {
        description: 'Please try again or contact support'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Consultation Results
          </DialogTitle>
          <DialogDescription>
            Send your consultation results and recommendations to your email address.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="rounded-lg bg-gray-50 p-3 space-y-1">
            <p className="text-sm font-medium text-gray-900">What you'll receive:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Consultation results for {clientName}</li>
              <li>• Recommended plan: {planTitle}</li>
              {pdfBlob && <li>• PDF attachment ({filename ?? 'consultation-report.pdf'})</li>}
            </ul>
          </div>

          {!providerStatus.configured && (
            <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3">
              <p className="text-sm text-yellow-800">
                <strong>Demo Mode:</strong> Email provider not configured. 
                This will simulate sending an email for testing purposes.
              </p>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isLoading ? 'Sending...' : 'Send Email'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}