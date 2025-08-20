'use client'

import { useState } from 'react'
// Client type is imported but not currently used in this component
import { getClientsWithFullName } from '@/data/clients'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { Search, Mail, Users, MessageSquare } from 'lucide-react'
import { isDevelopment } from '@/lib/env-client'

interface InvitePanelProps {
  sessionId: string
  onInvite: (sessionId: string, clientIds: string[], message: string) => void
}

export default function InvitePanel({ sessionId, onInvite }: InvitePanelProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set())
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  const clients = getClientsWithFullName()
  
  const filteredClients = searchQuery.trim() === '' ? clients : clients.filter((c) => 
    c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleClientToggle = (clientId: string) => {
    const newSelected = new Set(selectedClients)
    if (newSelected.has(clientId)) {
      newSelected.delete(clientId)
    } else {
      newSelected.add(clientId)
    }
    setSelectedClients(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedClients.size === filteredClients.length) {
      setSelectedClients(new Set())
    } else {
      setSelectedClients(new Set(filteredClients.map(c => c.id)))
    }
  }

  const handleSendInvites = async () => {
    if (selectedClients.size === 0) return
    
    setSending(true)
    try {
      await onInvite(sessionId, Array.from(selectedClients), message)
      setOpen(false)
      setSelectedClients(new Set())
      setMessage('')
    } catch (error) {
      if (isDevelopment()) {
        console.error('Failed to send invites:', error)
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Users className="w-4 h-4" />
          Invite Clients
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Invite Clients to Session
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search clients by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Client List */}
          <div className="border rounded-lg">
            <div className="p-3 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {filteredClients.length} clients
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                  className="text-xs"
                >
                  {selectedClients.size === filteredClients.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
            </div>
            
            <ScrollArea className="h-64">
              <div className="p-2 space-y-2">
                {filteredClients.map((client) => (
                  <div key={client.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                    <Checkbox
                      id={client.id}
                      checked={selectedClients.has(client.id)}
                      onCheckedChange={() => handleClientToggle(client.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <Label htmlFor={client.id} className="text-sm font-medium text-gray-900 cursor-pointer">
                        {client.fullName}
                      </Label>
                      <p className="text-xs text-gray-500 truncate">{client.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Personal Message (Optional)
            </Label>
            <Textarea
              id="message"
              placeholder="Add a personal message to your invitation..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendInvites}
              disabled={selectedClients.size === 0 || sending}
              className="gap-2"
            >
              {sending ? 'Sending...' : `Send ${selectedClients.size} Invite${selectedClients.size !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
