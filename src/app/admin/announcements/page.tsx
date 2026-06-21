'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared';
import { Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'emergency' | 'event' | 'holiday';
  target_audience: 'all' | 'teachers' | 'parents' | 'students';
  created_by: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann1',
    title: 'Summer Break Announcement',
    content: 'Summer break will start from June 15th. School will reopen on July 1st.',
    type: 'holiday',
    target_audience: 'all',
    created_by: 'admin',
    is_active: true,
    created_at: '2024-06-10',
    updated_at: '2024-06-10',
  },
  {
    id: 'ann2',
    title: 'Sports Day',
    content: 'Annual Sports Day will be held on June 25th. All students are requested to participate.',
    type: 'event',
    target_audience: 'all',
    created_by: 'admin',
    is_active: true,
    created_at: '2024-06-12',
    updated_at: '2024-06-12',
  },
  {
    id: 'ann3',
    title: 'School Maintenance',
    content: 'School will be closed on June 20th due to maintenance activities.',
    type: 'general',
    target_audience: 'all',
    created_by: 'admin',
    is_active: false,
    created_at: '2024-06-08',
    updated_at: '2024-06-08',
  },
];

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'general' as const,
    target_audience: 'all' as const,
    is_active: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const supabase = createClient();

      const { data } = await supabase
        .from('announcements')
        .select('*')
        .limit(50);

      if (data && data.length > 0) {
        setAnnouncements(data);
      } else {
        setAnnouncements(MOCK_ANNOUNCEMENTS);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setAnnouncements(MOCK_ANNOUNCEMENTS);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAnnouncement = async () => {
    if (!formData.title || !formData.content) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const supabase = createClient();

      const data = {
        title: formData.title,
        content: formData.content,
        type: formData.type,
        target_audience: formData.target_audience,
        is_active: formData.is_active,
        created_by: 'admin',
      };

      if (editingId) {
        const { error } = await supabase
          .from('announcements')
          .update(data)
          .eq('id', editingId);
        if (!error) {
          setAnnouncements(announcements.map(a => a.id === editingId ? { ...a, ...data, updated_at: new Date().toISOString() } : a));
        }
      } else {
        const { data: result, error } = await supabase
          .from('announcements')
          .insert([data])
          .select();
        if (!error && result) {
          setAnnouncements([...announcements, result[0]]);
        }
      }
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving announcement:', error);
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      target_audience: announcement.target_audience,
      is_active: announcement.is_active,
    });
    setEditingId(announcement.id);
    setDialogOpen(true);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('announcements')
        .update({ is_active: !currentStatus })
        .eq('id', id);
      if (!error) {
        setAnnouncements(announcements.map(a => a.id === id ? { ...a, is_active: !currentStatus } : a));
      }
    } catch (error) {
      console.error('Error toggling announcement:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      try {
        const supabase = createClient();
        await supabase.from('announcements').delete().eq('id', id);
        setAnnouncements(announcements.filter(a => a.id !== id));
      } catch (error) {
        console.error('Error deleting announcement:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      type: 'general',
      target_audience: 'all',
      is_active: true,
    });
    setEditingId(null);
  };

  const filteredAnnouncements = announcements.filter(ann => {
    const typeMatch = filterType === 'all' || ann.type === filterType;
    const statusMatch = filterStatus === 'all' || (filterStatus === 'active' ? ann.is_active : !ann.is_active);
    return typeMatch && statusMatch;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'emergency':
        return 'bg-red-100 text-red-800';
      case 'event':
        return 'bg-blue-100 text-blue-800';
      case 'holiday':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAudienceLabel = (audience: string) => {
    const labels: Record<string, string> = {
      all: 'All Users',
      teachers: 'Teachers Only',
      parents: 'Parents Only',
      students: 'Students Only',
    };
    return labels[audience] || audience;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
          <p className="mt-4 text-gray-600">Loading announcements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-600 mt-1">Create and manage school announcements</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
          className="bg-amber-600 hover:bg-amber-700 text-white gap-2"
        >
          <Plus size={20} />
          Create Announcement
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 border-amber-200 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-amber-900">Filter by Type</Label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="mt-2 border-amber-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
                <SelectItem value="event">Event</SelectItem>
                <SelectItem value="holiday">Holiday</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-amber-900">Filter by Status</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="mt-2 border-amber-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              Showing {filteredAnnouncements.length} of {announcements.length} announcements
            </div>
          </div>
        </div>
      </Card>

      {/* Announcements List */}
      {filteredAnnouncements.length > 0 ? (
        <div className="space-y-4">
          {filteredAnnouncements.map(announcement => (
            <Card
              key={announcement.id}
              className={`p-6 border-2 transition-all ${
                announcement.is_active
                  ? 'border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50'
                  : 'border-gray-200 bg-gray-50 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className={`text-xl font-bold ${announcement.is_active ? 'text-amber-900' : 'text-gray-600'}`}>
                    {announcement.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {getAudienceLabel(announcement.target_audience)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge className={getTypeColor(announcement.type)}>
                    {announcement.type.charAt(0).toUpperCase() + announcement.type.slice(1)}
                  </Badge>
                  <Badge
                    className={`${
                      announcement.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {announcement.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              <p className="text-gray-700 mb-4 leading-relaxed">{announcement.content}</p>

              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  {new Date(announcement.created_at).toLocaleDateString()} at{' '}
                  {new Date(announcement.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleActive(announcement.id, announcement.is_active)}
                    className="text-amber-600 hover:bg-amber-100"
                  >
                    {announcement.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(announcement)}
                    className="text-amber-600 hover:bg-amber-100"
                  >
                    <Edit2 size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(announcement.id)}
                    className="text-red-600 hover:bg-red-100"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No announcements found"
          description="Create your first announcement"
          action={{
            label: 'Create Announcement',
            onClick: () => {
              resetForm();
              setDialogOpen(true);
            },
          }}
        />
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl border-amber-200">
          <DialogHeader>
            <DialogTitle className="text-amber-900">
              {editingId ? 'Edit Announcement' : 'Create New Announcement'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-amber-900">Title</Label>
              <Input
                placeholder="Announcement title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-2 border-amber-200"
              />
            </div>

            <div>
              <Label className="text-amber-900">Content</Label>
              <Textarea
                placeholder="Announcement content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="mt-2 border-amber-200"
                rows={6}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-amber-900">Type</Label>
                <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger className="mt-2 border-amber-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="holiday">Holiday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-amber-900">Target Audience</Label>
                <Select value={formData.target_audience} onValueChange={(value: any) => setFormData({ ...formData, target_audience: value })}>
                  <SelectTrigger className="mt-2 border-amber-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="teachers">Teachers</SelectItem>
                    <SelectItem value="parents">Parents</SelectItem>
                    <SelectItem value="students">Students</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-amber-900">Status</Label>
              <Select
                value={formData.is_active ? 'active' : 'inactive'}
                onValueChange={(value) => setFormData({ ...formData, is_active: value === 'active' })}
              >
                <SelectTrigger className="mt-2 border-amber-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleAddAnnouncement}
                className="bg-amber-600 hover:bg-amber-700 text-white flex-1"
              >
                {editingId ? 'Update Announcement' : 'Create Announcement'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  resetForm();
                }}
                className="flex-1 border-amber-200"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
