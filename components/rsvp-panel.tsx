'use client'

import { useState, useEffect } from 'react'
import { Session, RSVPRecord } from '@/lib/types'
import { getClientsWithFullName } from '@/data/clients'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, CheckCircle, XCircle, Clock } from 'lucide-react'

interface RSVPPanelProps {
  session: Session
  onUpdateRSVP: (sessionId: string, clientId: string, status: RSVPRecord['status'], notes?: string) => void
}

export default function RSVPPanel({ session, onUpdateRSVP }: RSVPPanelProps) {
  const [open, setOpen] = useState(false)
  const [localRSVPs, setLocalRSVPs] = useState<Record<string, RSVPRecord>>({})
  const [selectedClient, setSelectedClient] = useState<string | null>(null)
  // editingNotes state is not currently used but kept for future functionality
  const [saving, setSaving] = useState(false)

  const clients = getClientsWithFullName()

  useEffect(() => {
    // Initialize with empty RSVPs for all clients
    const initialRSVPs: Record<string, RSVPRecord> = {}
    clients.forEach(client => {
      initialRSVPs[client.id] = {
        status: 'pending',
        client_id: client.id,
        notes: ''
      }
    })
    setLocalRSVPs(initialRSVPs)
  }, [clients])

  const handleStatusChange = (clientId: string, status: RSVPRecord['status']) => {
    setLocalRSVPs(prev => ({
      ...prev,
      [clientId]: {
        ...prev[clientId],
        status,
        client_id: clientId
      }
    }))
  }

  const handleNotesChange = (clientId: string, notes: string) => {
    setLocalRSVPs(prev => ({
      ...prev,
      [clientId]: {
        ...prev[clientId],
        notes,
        client_id: clientId,
        status: prev[clientId]?.status ?? 'pending'
      }
    }))
  }

  const handleSaveAll = async () => {
    setSaving(true)
    try {
      await Promise.all(
        Object.entries(localRSVPs).map(([clientId, rsvp]) =>
          onUpdateRSVP(session.id, clientId, rsvp.status, rsvp.notes)
        )
      )
      setOpen(false)
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error('Failed to save RSVPs:', error)
      }
    } finally {
      setSaving(false)
    }
  }

  const getStatusIcon = (status: RSVPRecord['status']) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'declined':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />
    }
  }

  const getStatusColor = (status: RSVPRecord['status']) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-700 bg-green-50 border-green-200'
      case 'declined':
        return 'text-red-700 bg-red-50 border-red-200'
      default:
        return 'text-yellow-700 bg-yellow-50 border-yellow-200'
    }
  }

  const confirmedCount = Object.values(localRSVPs).filter(r => r.status === 'confirmed').length
  const totalCount = clients.length

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Users className="w-4 h-4" />
          RSVPs ({confirmedCount}/{totalCount})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            RSVP Management
          </DialogTitle>
          <p className="text-sm text-gray-600">
            {session.title} — {session.starts_at ? new Date(session.starts_at).toLocaleString() : 'TBD'}
          </p>
        </DialogHeader>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="individual">Individual</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">{confirmedCount}</div>
                <div className="text-sm text-gray-600">Confirmed</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {Object.values(localRSVPs).filter(r => r.status === 'declined').length}
                </div>
                <div className="text-sm text-gray-600">Declined</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {Object.values(localRSVPs).filter(r => r.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Quick Actions</h4>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newRSVPs = { ...localRSVPs }
                    clients.forEach(client => {
                      newRSVPs[client.id] = { 
                        ...newRSVPs[client.id], 
                        status: 'confirmed',
                        client_id: client.id
                      }
                    })
                    setLocalRSVPs(newRSVPs)
                  }}
                >
                  Confirm All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newRSVPs = { ...localRSVPs }
                    clients.forEach(client => {
                      newRSVPs[client.id] = { 
                        ...newRSVPs[client.id], 
                        status: 'pending',
                        client_id: client.id
                      }
                    })
                    setLocalRSVPs(newRSVPs)
                  }}
                >
                  Reset All
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="individual" className="space-y-4">
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {clients.map((client) => (
                  <div key={client.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{client.fullName}</div>
                      <div className="text-sm text-gray-500">{client.email}</div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Select
                        value={localRSVPs[client.id]?.status ?? 'pending'}
                        onValueChange={(value: RSVPRecord['status']) => handleStatusChange(client.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="declined">Declined</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <div className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(localRSVPs[client.id]?.status ?? 'pending')}`}>
                        {getStatusIcon(localRSVPs[client.id]?.status ?? 'pending')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="client-select">Select Client</Label>
                <Select value={selectedClient ?? ''} onValueChange={setSelectedClient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a client to edit notes" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedClient && (
                <div className="space-y-2">
                  <Label htmlFor="notes">
                    Notes for {clients.find(c => c.id === selectedClient)?.fullName}
                  </Label>
                  <Textarea
                    id="notes"
                    value={localRSVPs[selectedClient]?.notes ?? ''}
                    onChange={(e) => handleNotesChange(selectedClient, e.target.value)}
                    placeholder="Add notes about this client's RSVP..."
                    rows={4}
                  />
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveAll}
            disabled={saving}
            className="gap-2"
          >
            {saving ? 'Saving...' : 'Save All RSVPs'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
