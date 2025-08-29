'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Save, ExternalLink, Mail } from 'lucide-react'
import { toast } from 'sonner'

interface SettingsData {
  bookingUrl: string
  emailSubjectTemplate: string
}

export function SettingsForm() {
  const [settings, setSettings] = useState<SettingsData>({
    bookingUrl: '',
    emailSubjectTemplate: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    // Load existing settings on mount
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setIsLoading(true)
    try {
      // For now, load from localStorage as a simple storage mechanism
      // In a real app, this would load from the database via API
      const saved = localStorage.getItem('client-settings')
      if (saved) {
        const parsed = JSON.parse(saved)
        setSettings({
          bookingUrl: parsed.bookingUrl ?? '',
          emailSubjectTemplate: parsed.emailSubjectTemplate ?? 'Your Consultation Results from {{clientName}}'
        })
      } else {
        // Set default email template
        setSettings(prev => ({
          ...prev,
          emailSubjectTemplate: 'Your Consultation Results from {{clientName}}'
        }))
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setIsLoading(false)
    }
  }

  const saveSettings = async () => {
    setIsSaving(true)
    try {
      // Validate booking URL format
      if (settings.bookingUrl && !isValidUrl(settings.bookingUrl)) {
        toast.error('Please enter a valid booking URL')
        return
      }

      // For now, save to localStorage
      // In a real app, this would save to database via API
      localStorage.setItem('client-settings', JSON.stringify(settings))
      
      // Also emit an event for immediate UI updates
      window.dispatchEvent(new CustomEvent('settings-updated', { detail: settings }))
      
      toast.success('Settings saved successfully')
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const testBookingUrl = () => {
    if (settings.bookingUrl && isValidUrl(settings.bookingUrl)) {
      window.open(settings.bookingUrl, '_blank')
    } else {
      toast.error('Please enter a valid booking URL first')
    }
  }

  const handleInputChange = (field: keyof SettingsData, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Booking Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="w-5 h-5" />
            Booking Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="booking-url">Booking URL</Label>
            <div className="flex gap-2">
              <Input
                id="booking-url"
                type="url"
                placeholder="https://calendly.com/your-username/consultation"
                value={settings.bookingUrl}
                onChange={(e) => handleInputChange('bookingUrl', e.target.value)}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={testBookingUrl}
                disabled={!settings.bookingUrl}
              >
                Test
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Enter your external booking URL (e.g., Calendly, Acuity, etc.). 
              This will be used for the &quot;Book a meeting&quot; button in consultations.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email-subject">Email Subject Template</Label>
            <Textarea
              id="email-subject"
              placeholder="Your Consultation Results from {{clientName}}"
              value={settings.emailSubjectTemplate}
              onChange={(e) => handleInputChange('emailSubjectTemplate', e.target.value)}
              className="min-h-[80px]"
            />
            <p className="text-sm text-muted-foreground">
              Customize the email subject line for consultation results. 
              You can use placeholders like <code className="text-xs bg-gray-100 px-1 rounded">{'{{clientName}}'}</code>, 
              <code className="text-xs bg-gray-100 px-1 rounded">{'{{planTitle}}'}</code>, 
              <code className="text-xs bg-gray-100 px-1 rounded">{'{{date}}'}</code>.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={saveSettings}
          disabled={isSaving}
          className="min-w-[120px]"
        >
          {isSaving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  )
}