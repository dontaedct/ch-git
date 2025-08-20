'use client'

import { useState } from 'react'
import { Session } from '@/lib/types'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Calendar, Clock, MapPin, Users, FileText, Plus, Edit } from 'lucide-react'
import { isDevelopment } from '@/lib/env-client'

interface SessionFormProps {
  session?: Session
  onSubmit: (formData: FormData) => Promise<void>
  mode: 'create' | 'edit'
}

export default function SessionForm({ session, onSubmit, mode }: SessionFormProps) {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setSubmitting(true)
    try {
      await onSubmit(formData)
      setOpen(false)
    } catch (error) {
      if (isDevelopment()) {
        console.error('Error submitting session:', error)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const getDefaultDateTime = () => {
    if (session?.starts_at) {
      return new Date(session.starts_at).toISOString().slice(0, 16)
    }
    // Default to tomorrow at 9 AM
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(9, 0, 0, 0)
    return tomorrow.toISOString().slice(0, 16)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          {mode === 'create' ? (
            <>
              <Plus className="w-4 h-4" />
              New Session
            </>
          ) : (
            <>
              <Edit className="w-4 h-4" />
              Edit Session
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'create' ? 'Create New Session' : 'Edit Session'}
          </DialogTitle>
        </DialogHeader>
        
        <form action={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Session Details</h3>
            
            <div className="space-y-2">
              <Label htmlFor="title">Session Title *</Label>
              <Input
                id="title"
                name="title"
                defaultValue={session?.title ?? ''}
                placeholder="e.g., Morning Strength Training"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={session?.description ?? ''}
                placeholder="Describe what this session will cover..."
                rows={3}
              />
            </div>
          </div>

          {/* Scheduling */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Schedule</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startsAt" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date & Time *
                </Label>
                <Input
                  id="startsAt"
                  name="startsAt"
                  type="datetime-local"
                  defaultValue={getDefaultDateTime()}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="durationMinutes" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Duration (minutes) *
                </Label>
                <Input
                  id="durationMinutes"
                  name="durationMinutes"
                  type="number"
                  min="15"
                  max="180"
                  step="15"
                  defaultValue={session?.duration_minutes ?? 60}
                  required
                />
              </div>
            </div>
          </div>

          {/* Location & Capacity */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Location & Capacity</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </Label>
                <Input
                  id="location"
                  name="location"
                  defaultValue={session?.location ?? ''}
                  placeholder="e.g., Gym Studio A, Outdoor Track"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxParticipants" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Max Participants
                </Label>
                <Input
                  id="maxParticipants"
                  name="maxParticipants"
                  type="number"
                  min="1"
                  max="50"
                  defaultValue={session?.max_participants ?? ''}
                  placeholder="Unlimited if empty"
                />
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Additional Notes
            </Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={session?.notes ?? ''}
              placeholder="Any special instructions, equipment needed, etc."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : (mode === 'create' ? 'Create Session' : 'Update Session')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
