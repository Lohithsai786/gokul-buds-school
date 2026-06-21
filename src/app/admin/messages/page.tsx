'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Search, Plus, Users, MessageSquare, Pin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import createClient from '@/lib/supabase'

const mockGroups = [
  { id: '1', name: 'Nursery A - Parents', type: 'class', className: 'Nursery', members: 28, lastMessage: 'Tomorrow is craft day!', lastTime: '2:30 PM', unread: 3 },
  { id: '2', name: 'LKG A - Parents', type: 'class', className: 'LKG', members: 30, lastMessage: 'Fee reminder for this quarter', lastTime: '1:15 PM', unread: 1 },
  { id: '3', name: 'UKG B - Parents', type: 'class', className: 'UKG', members: 25, lastMessage: 'Sports day preparations', lastTime: '11:00 AM', unread: 0 },
  { id: '4', name: 'School Announcements', type: 'announcement', className: '', members: 165, lastMessage: 'Holiday on Friday', lastTime: 'Yesterday', unread: 5 },
  { id: '5', name: 'Grade 1 - Parents', type: 'class', className: 'Grade 1', members: 32, lastMessage: 'PTM scheduled for next week', lastTime: 'Yesterday', unread: 0 },
  { id: '6', name: 'Teachers Group', type: 'teacher', className: '', members: 15, lastMessage: 'Staff meeting at 3 PM', lastTime: 'Mon', unread: 0 },
]

const mockMessages = [
  { id: '1', sender: 'Navya (Principal)', content: 'Dear parents, tomorrow is our annual craft day. Please send your child with an old t-shirt for painting.', time: '2:30 PM', isMe: false, type: 'announcement' },
  { id: '2', sender: 'Lakshmi (Parent)', content: 'Thank you for the reminder, Ma\'am! Should we send any specific colors?', time: '2:35 PM', isMe: false, type: 'text' },
  { id: '3', sender: 'Navya (Principal)', content: 'No specific colors needed. We have all the materials. Just the t-shirt is enough.', time: '2:40 PM', isMe: false, type: 'text' },
  { id: '4', sender: 'Raju (Parent)', content: 'My child is very excited about this! Thank you for organizing.', time: '3:00 PM', isMe: false, type: 'text' },
  { id: '5', sender: 'You', content: 'All arrangements are in place. Looking forward to seeing the children\'s creativity!', time: '3:15 PM', isMe: true, type: 'text' },
  { id: '6', sender: 'Priya (Teacher)', content: 'I have prepared the art stations. Everything is set for tomorrow.', time: '3:30 PM', isMe: false, type: 'text' },
]

export default function AdminMessagesPage() {
  const [selectedGroup, setSelectedGroup] = useState(mockGroups[0])
  const [messages, setMessages] = useState(mockMessages)
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupType, setNewGroupType] = useState('class')
  const messageEndRef = useRef<HTMLDivElement>(null)

  const filteredGroups = mockGroups.filter(g =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSend = () => {
    if (!newMessage.trim()) return
    const msg = {
      id: String(messages.length + 1),
      sender: 'You',
      content: newMessage,
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      isMe: true,
      type: 'text' as const
    }
    setMessages([...messages, msg])
    setNewMessage('')
  }

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-muted-foreground">Manage all communication groups</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-amber-600">
              <Plus className="h-4 w-4 mr-2" /> New Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Chat Group</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input placeholder="Group name" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} />
              <Select value={newGroupType} onValueChange={setNewGroupType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="class">Class Group</SelectItem>
                  <SelectItem value="announcement">Announcement Group</SelectItem>
                  <SelectItem value="teacher">Teacher Group</SelectItem>
                </SelectContent>
              </Select>
              <Button className="w-full bg-amber-500 hover:bg-amber-600" onClick={() => setShowCreateDialog(false)}>Create Group</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="overflow-hidden h-[calc(100vh-220px)]">
        <div className="flex h-full">
          {/* Group List */}
          <div className="w-80 border-r flex flex-col">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search groups..." className="pl-9" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
            </div>
            <ScrollArea className="flex-1">
              {filteredGroups.map(group => (
                <button
                  key={group.id}
                  onClick={() => setSelectedGroup(group)}
                  className={`w-full p-3 flex items-start gap-3 hover:bg-muted/50 transition-colors text-left ${
                    selectedGroup.id === group.id ? 'bg-amber-50 dark:bg-amber-950/20 border-r-2 border-amber-500' : ''
                  }`}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className={group.type === 'announcement' ? 'bg-rose-100 text-rose-600' : group.type === 'teacher' ? 'bg-teal-100 text-teal-600' : 'bg-amber-100 text-amber-600'}>
                      {group.type === 'announcement' ? <Pin className="h-4 w-4" /> : group.type === 'teacher' ? <Users className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm truncate">{group.name}</span>
                      <span className="text-xs text-muted-foreground">{group.lastTime}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{group.lastMessage}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{group.members} members</span>
                      {group.unread > 0 && (
                        <Badge className="bg-amber-500 text-white text-xs h-5 min-w-[20px] flex items-center justify-center">{group.unread}</Badge>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">{selectedGroup.name}</h2>
                  <p className="text-xs text-muted-foreground">{selectedGroup.members} members • {selectedGroup.type} group</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    <Users className="h-3 w-3 mr-1" /> {selectedGroup.members}
                  </Badge>
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] ${msg.isMe ? 'order-2' : ''}`}>
                      {!msg.isMe && (
                        <span className="text-xs font-medium text-amber-600 mb-1 block">{msg.sender}</span>
                      )}
                      <div className={`rounded-2xl px-4 py-2.5 ${
                        msg.isMe
                          ? 'bg-amber-500 text-white rounded-br-md'
                          : msg.type === 'announcement'
                            ? 'bg-rose-100 dark:bg-rose-950/30 rounded-bl-md border border-rose-200 dark:border-rose-800'
                            : 'bg-muted rounded-bl-md'
                      }`}>
                        {msg.type === 'announcement' && !msg.isMe && (
                          <div className="flex items-center gap-1 mb-1">
                            <Pin className="h-3 w-3 text-rose-500" />
                            <span className="text-xs font-medium text-rose-600">Announcement</span>
                          </div>
                        )}
                        <p className="text-sm">{msg.content}</p>
                      </div>
                      <span className="text-xs text-muted-foreground mt-1 block">{msg.time}</span>
                    </div>
                  </div>
                ))}
                <div ref={messageEndRef} />
              </div>
            </ScrollArea>

            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  className="flex-1"
                />
                <Button onClick={handleSend} className="bg-amber-500 hover:bg-amber-600" size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
