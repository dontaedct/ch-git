'use client'

import { useState } from 'react'
import { Session } from '@/lib/types'
import { sessions } from '@/data/sessions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, MapPin, Users, Edit, Trash2 } from 'lucide-react'
import SessionForm from './session-form'
import { isDevelopment } from '@/lib/env-client'
import InvitePanel from './invite-panel'
import RSVPPanel from './rsvp-panel'

interface SessionListProps {
  onEditSession?: (session: Session) => void
  onDeleteSession?: (sessionId: string) => void
  onInviteClients?: (sessionId: string, clientIds: string[], message: string) => void
  onUpdateRSVP?: (sessionId: string, clientId: string, status: string, notes?: string) => void
}

export default function SessionList({
  onEditSession,
  onDeleteSession,
  onInviteClients,
  onUpdateRSVP
}: SessionListProps) {
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null)

  const handleEdit = (session: Session) => {
    setEditingSession(session)
  }

  const handleDelete = async (sessionId: string) => {
    if (onDeleteSession) {
      await onDeleteSession(sessionId)
    }
    setDeletingSessionId(null)
  }

  const handleInvite = async (sessionId: string, clientIds: string[], message: string) => {
    if (onInviteClients) {
      await onInviteClients(sessionId, clientIds, message)
    }
  }

  const handleRSVPUpdate = async (sessionId: string, clientId: string, status: string, notes?: string) => {
    if (onUpdateRSVP) {
      await onUpdateRSVP(sessionId, clientId, status, notes)
    }
  }

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return 'TBD'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const getStatusColor = (session: Session) => {
    const now = new Date()
    if (!session.starts_at || !session.ends_at) return 'bg-gray-100 text-gray-800'
    
    const sessionStart = new Date(session.starts_at)
    const sessionEnd = new Date(session.ends_at)

    if (now < sessionStart) {
      return 'bg-blue-100 text-blue-800'
    } else if (now >= sessionStart && now <= sessionEnd) {
      return 'bg-green-100 text-green-800'
    } else {
      return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (session: Session) => {
    const now = new Date()
    if (!session.starts_at || !session.ends_at) return 'TBD'
    
    const sessionStart = new Date(session.starts_at)
    const sessionEnd = new Date(session.ends_at)

    if (now < sessionStart) {
      return 'Upcoming'
    } else if (now >= sessionStart && now <= sessionEnd) {
      return 'In Progress'
    } else {
      return 'Completed'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Sessions</h2>
          <p className="text-sm sm:text-base text-gray-600">Manage your training sessions and track attendance</p>
        </div>
        <SessionForm
          mode="create"
          onSubmit={async (formData) => {
                         if (isDevelopment()) {
               console.warn('Creating session:', formData)
             }
          }}
        />
      </div>

      {/* Sessions Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {sessions.map((session) => (
          <Card key={session.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1 min-w-0 flex-1">
                  <CardTitle className="text-base sm:text-lg truncate">{session.title}</CardTitle>
                  <CardDescription className="line-clamp-2 text-sm">
                    {session.description ?? 'No description provided'}
                  </CardDescription>
                </div>
                <Badge className={`${getStatusColor(session)} ml-2 flex-shrink-0`}>
                  {getStatusText(session)}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Session Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDateTime(session.starts_at)}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{formatDuration(session.duration_minutes || 60)}</span>
                </div>
                
                {session.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{session.location}</span>
                  </div>
                )}
                
                {session.max_participants && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>Max {session.max_participants} participants</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(session)}
                  className="flex-1 min-w-0"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Edit</span>
                </Button>
                
                <InvitePanel
                  sessionId={session.id}
                  onInvite={handleInvite}
                />
                
                <RSVPPanel
                  session={session}
                  onUpdateRSVP={handleRSVPUpdate}
                />
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeletingSessionId(session.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                  aria-label="Delete session"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Session Dialog */}
      {editingSession && (
        <SessionForm
          session={editingSession}
          mode="edit"
          onSubmit={async (formData) => {
                         if (onEditSession) {
               if (isDevelopment()) {
                 console.warn('Editing session:', formData)
               }
             }
            setEditingSession(null)
          }}
        />
      )}

      {/* Delete Confirmation */}
      {deletingSessionId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 sm:p-6 rounded-lg max-w-md w-full mx-auto">
            <h3 className="text-lg font-semibold mb-4">Delete Session</h3>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              Are you sure you want to delete this session? This action cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setDeletingSessionId(null)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(deletingSessionId)}
                className="w-full sm:w-auto"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
