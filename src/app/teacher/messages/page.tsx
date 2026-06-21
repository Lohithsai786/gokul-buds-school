'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared';
import { Send, MessageCircle, Users } from 'lucide-react';

interface ChatGroup {
  id: string;
  name: string;
  type: string;
  class_id?: string;
  class?: { id: string; name: string; section: string };
  created_by: string;
  created_at: string;
  chat_group_members?: Array<{
    id: string;
    user_id: string;
    role: string;
    joined_at: string;
  }>;
}

interface Message {
  id: string;
  sender_id: string;
  group_id: string;
  content: string;
  message_type: string;
  file_url?: string;
  created_at: string;
  sender?: { id: string; full_name: string };
}

export default function MessagesPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<ChatGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<ChatGroup | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Load chat groups
  useEffect(() => {
    const loadGroups = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('chat_groups')
          .select(
            `
            id,
            name,
            type,
            class_id,
            created_by,
            created_at,
            classes:class_id(id, name, section),
            chat_group_members(id, user_id, role, joined_at)
          `
          )
          .order('created_at', { ascending: false });

        if (error) throw error;
        setGroups(data || []);
        if (data && data.length > 0) {
          setSelectedGroup(data[0]);
        }
      } catch (error) {
        console.error('Error loading chat groups:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGroups();
  }, [supabase]);

  // Load messages when group is selected
  useEffect(() => {
    if (!selectedGroup) return;

    const loadMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select(
            `
            id,
            sender_id,
            group_id,
            content,
            message_type,
            file_url,
            created_at,
            sender:sender_id(id, full_name)
          `
          )
          .eq('group_id', selectedGroup.id)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setMessages(data || []);

        // Scroll to bottom
        setTimeout(() => {
          if (scrollAreaRef.current) {
            const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollElement) {
              scrollElement.scrollTop = scrollElement.scrollHeight;
            }
          }
        }, 100);
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    loadMessages();
  }, [selectedGroup, supabase]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedGroup) return;

    try {
      setSending(true);

      const { error } = await supabase.from('messages').insert({
        sender_id: 'teacher_id', // Should be actual user ID from auth
        group_id: selectedGroup.id,
        content: messageText,
        message_type: 'text',
        file_url: null,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      // Reload messages
      const { data } = await supabase
        .from('messages')
        .select(
          `
          id,
          sender_id,
          group_id,
          content,
          message_type,
          file_url,
          created_at,
          sender:sender_id(id, full_name)
        `
        )
        .eq('group_id', selectedGroup.id)
        .order('created_at', { ascending: true });

      setMessages(data || []);
      setMessageText('');

      // Scroll to bottom
      setTimeout(() => {
        if (scrollAreaRef.current) {
          const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
          if (scrollElement) {
            scrollElement.scrollTop = scrollElement.scrollHeight;
          }
        }
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const getMemberCount = (group: ChatGroup) => {
    return group.chat_group_members?.length || 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block mb-4">
            <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Class Communication</h1>
        <p className="text-gray-600">Send messages and updates to your class groups</p>
      </div>

      {/* Chat Interface */}
      {groups.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[600px]">
          {/* Groups Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-amber-200 h-full overflow-hidden flex flex-col">
              <div className="p-4 bg-gradient-to-r from-amber-100 to-orange-100 border-b border-amber-200">
                <h2 className="font-bold text-gray-900">Classes</h2>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-2">
                  {groups.map((group) => (
                    <div
                      key={group.id}
                      onClick={() => setSelectedGroup(group)}
                      className={`p-3 rounded-lg cursor-pointer transition-all border-2 ${
                        selectedGroup?.id === group.id
                          ? 'bg-amber-100 border-amber-500'
                          : 'bg-white border-gray-200 hover:bg-amber-50 hover:border-amber-300'
                      }`}
                    >
                      <p className="font-semibold text-gray-900 text-sm">
                        {group.name}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Users className="w-3 h-3 text-gray-600" />
                        <p className="text-xs text-gray-600">
                          {getMemberCount(group)} members
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </div>

          {/* Chat Area */}
          {selectedGroup ? (
            <div className="lg:col-span-3 flex flex-col">
              {/* Header */}
              <Card className="border-amber-200 p-4 rounded-b-none border-b-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {selectedGroup.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {getMemberCount(selectedGroup)} members
                    </p>
                  </div>
                  <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                    {selectedGroup.type === 'class'
                      ? 'Class Group'
                      : selectedGroup.type}
                  </Badge>
                </div>
              </Card>

              {/* Messages */}
              <Card className="border-amber-200 border-t-0 rounded-t-none flex-1 overflow-hidden flex flex-col">
                <ScrollArea
                  ref={scrollAreaRef}
                  className="flex-1 p-4"
                >
                  <div className="space-y-4">
                    {messages.length > 0 ? (
                      messages.map((message) => {
                        const sender = Array.isArray(message.sender)
                          ? message.sender[0]
                          : message.sender;
                        const isOwn = message.sender_id === 'teacher_id'; // Compare with actual user ID

                        return (
                          <div
                            key={message.id}
                            className={`flex ${
                              isOwn ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-xs px-4 py-2 rounded-lg ${
                                isOwn
                                  ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-br-none'
                                  : 'bg-gray-100 text-gray-900 rounded-bl-none'
                              }`}
                            >
                              {!isOwn && (
                                <p className="text-xs font-semibold mb-1 opacity-75">
                                  {sender?.full_name || 'User'}
                                </p>
                              )}
                              <p className="text-sm break-words">
                                {message.content}
                              </p>
                              <p
                                className={`text-xs mt-1 ${
                                  isOwn
                                    ? 'text-amber-100'
                                    : 'text-gray-600'
                                }`}
                              >
                                {new Date(
                                  message.created_at
                                ).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">No messages yet</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSendMessage();
                        }
                      }}
                      className="border-amber-300"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={sending || !messageText.trim()}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span className="hidden sm:inline">Send</span>
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          ) : null}
        </div>
      ) : (
        <EmptyState
          icon={<MessageCircle className="w-8 h-8" />}
          title="No Chat Groups"
          description="You're not part of any chat groups yet. Contact administration to join."
        />
      )}
    </div>
  );
}
