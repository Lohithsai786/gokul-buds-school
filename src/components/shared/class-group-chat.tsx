'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Image as ImageIcon, FileText, Paperclip, Download } from 'lucide-react';
import { Database } from '@/lib/database.types';

type Message = Database['public']['Tables']['messages']['Row'] & {
  sender?: { full_name: string; role: string } | null;
};

interface ClassGroupChatProps {
  groupId: string;
  groupName: string;
  canPost: boolean;
  viewerRole: 'admin' | 'teacher' | 'parent';
}

const MESSAGE_TYPES = {
  text: 'text',
  image: 'image',
  pdf: 'pdf',
  document: 'document',
} as const;

function getFileKind(file: File): 'image' | 'pdf' | 'document' {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type === 'application/pdf') return 'pdf';
  return 'document';
}

export function ClassGroupChat({ groupId, groupName, canPost, viewerRole }: ClassGroupChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError('');
    const { data, error: fetchError } = await supabase
      .from('messages')
      .select(`
        id,
        sender_id,
        group_id,
        content,
        message_type,
        file_url,
        created_at,
        sender:users!messages_sender_id_fkey(full_name, role)
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: true })
      .limit(200);

    if (fetchError) {
      setError(fetchError.message);
      setMessages([]);
    } else {
      setMessages((data ?? []) as unknown as Message[]);
    }
    setLoading(false);
  }, [groupId, supabase]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    const channel = supabase
      .channel(`group:${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `group_id=eq.${groupId}`,
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId, supabase, fetchMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendText = async () => {
    if (!text.trim() || !user) return;
    setSending(true);
    setError('');
    const { error: insertError } = await supabase.from('messages').insert({
      sender_id: user.id,
      group_id: groupId,
      content: text.trim(),
      message_type: MESSAGE_TYPES.text,
    });
    if (insertError) {
      setError(insertError.message);
    } else {
      setText('');
      fetchMessages();
    }
    setSending(false);
  };

  const sendFile = async (file: File) => {
    if (!user) return;
    setUploading(true);
    setError('');
    try {
      const kind = getFileKind(file);
      const ext = file.name.split('.').pop() ?? 'bin';
      const filePath = `${groupId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('class-files')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        setError(uploadError.message);
        return;
      }

      const { data: pub } = supabase.storage.from('class-files').getPublicUrl(filePath);
      const fileUrl = pub.publicUrl;

      const { error: insertError } = await supabase.from('messages').insert({
        sender_id: user.id,
        group_id: groupId,
        content: file.name,
        message_type: kind,
        file_url: fileUrl,
      });

      if (insertError) {
        setError(insertError.message);
      } else {
        fetchMessages();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="flex flex-col h-[70vh] border-amber-200">
      <div className="flex items-center justify-between p-4 border-b border-amber-100 bg-amber-50">
        <div>
          <h3 className="font-bold text-amber-900">{groupName}</h3>
          <p className="text-xs text-amber-700">
            {viewerRole === 'parent' ? 'View-only — Teachers post here' : 'Class communication'}
          </p>
        </div>
        <Badge className="bg-amber-100 text-amber-800">{messages.length} messages</Badge>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            No messages yet. {canPost ? 'Start the conversation!' : 'Check back later.'}
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender_id === user?.id;
            const senderName = msg.sender?.full_name ?? 'Unknown';
            const senderRole = msg.sender?.role ?? '';
            return (
              <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                  isOwn ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-900'
                }`}>
                  {!isOwn && (
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="text-xs font-semibold opacity-80">{senderName}</span>
                      {senderRole === 'teacher' && (
                        <Badge variant="outline" className="text-[10px] py-0 px-1 h-4 border-amber-300 text-amber-700">
                          Teacher
                        </Badge>
                      )}
                      {senderRole === 'admin' && (
                        <Badge variant="outline" className="text-[10px] py-0 px-1 h-4 border-orange-300 text-orange-700">
                          Admin
                        </Badge>
                      )}
                    </div>
                  )}
                  {msg.message_type === 'text' || !msg.message_type ? (
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                  ) : msg.message_type === 'image' && msg.file_url ? (
                    <a href={msg.file_url} target="_blank" rel="noopener noreferrer">
                      <img src={msg.file_url} alt={msg.content} className="rounded-lg max-w-full max-h-60 object-cover" />
                      <p className="text-xs mt-1 opacity-70">{msg.content}</p>
                    </a>
                  ) : (
                    <a
                      href={msg.file_url ?? '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 py-1"
                    >
                      {msg.message_type === 'pdf' ? (
                        <FileText className="w-6 h-6" />
                      ) : (
                        <Paperclip className="w-6 h-6" />
                      )}
                      <span className="text-sm underline">{msg.content}</span>
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                  <p className={`text-[10px] mt-1 ${isOwn ? 'text-amber-100' : 'text-gray-400'}`}>
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {error && (
        <div className="p-2 bg-red-50 border-t border-red-100">
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      {canPost ? (
        <div className="p-3 border-t border-amber-100 bg-white space-y-2">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Type a message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendText();
                }
              }}
              disabled={sending || uploading}
              className="border-amber-200 focus:border-amber-500"
            />
            <label className="cursor-pointer p-2 rounded-lg hover:bg-amber-50 border border-amber-200">
              <ImageIcon size={18} className="text-amber-600" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) await sendFile(f);
                  e.currentTarget.value = '';
                }}
              />
            </label>
            <label className="cursor-pointer p-2 rounded-lg hover:bg-amber-50 border border-amber-200">
              <FileText size={18} className="text-amber-600" />
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                disabled={uploading}
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) await sendFile(f);
                  e.currentTarget.value = '';
                }}
              />
            </label>
            <label className="cursor-pointer p-2 rounded-lg hover:bg-amber-50 border border-amber-200">
              <Paperclip size={18} className="text-amber-600" />
              <input
                type="file"
                className="hidden"
                disabled={uploading}
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) await sendFile(f);
                  e.currentTarget.value = '';
                }}
              />
            </label>
            <Button
              onClick={sendText}
              disabled={sending || uploading || !text.trim()}
              className="bg-amber-600 hover:bg-amber-700 text-white"
              size="icon"
            >
              <Send size={18} />
            </Button>
          </div>
          {uploading && <p className="text-xs text-amber-600">Uploading file...</p>}
        </div>
      ) : (
        <div className="p-3 border-t border-amber-100 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            You can view messages. Only teachers and admins can post.
          </p>
        </div>
      )}
    </Card>
  );
}
