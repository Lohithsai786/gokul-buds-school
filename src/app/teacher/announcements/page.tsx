'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { EmptyState } from '@/components/shared';
import { Megaphone, Plus, Trash2, Edit2 } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  target_audience: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export default function AnnouncementsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'general',
    targetAudience: 'all',
    isActive: true,
  });

  // Load announcements
  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setAnnouncements(data || []);
      } catch (error) {
        console.error('Error loading announcements:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnnouncements();
  }, [supabase]);

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);

      if (editingId) {
        // Update existing announcement
        const { error } = await supabase
          .from('announcements')
          .update({
            title: formData.title,
            content: formData.content,
            type: formData.type,
            target_audience: formData.targetAudience,
            is_active: formData.isActive,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId);

        if (error) throw error;
        alert('Announcement updated successfully!');
      } else {
        // Create new announcement
        const { error } = await supabase.from('announcements').insert({
          title: formData.title,
          content: formData.content,
          type: formData.type,
          target_audience: formData.targetAudience,
          is_active: formData.isActive,
          created_by: 'teacher_id', // Should be actual teacher ID from auth
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (error) throw error;
        alert('Announcement created successfully!');
      }

      // Reload announcements
      const { data } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      setAnnouncements(data || []);
      resetForm();
      setDialogOpen(false);
    } catch (error) {
      console.error('Error saving announcement:', error);
      alert('Failed to save announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type || 'general',
      targetAudience: announcement.target_audience || 'all',
      isActive: announcement.is_active,
    });
    setEditingId(announcement.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAnnouncements(announcements.filter((a) => a.id !== id));
      alert('Announcement deleted successfully!');
    } catch (error) {
      console.error('Error deleting announcement:', error);
      alert('Failed to delete announcement');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      type: 'general',
      targetAudience: 'all',
      isActive: true,
    });
    setEditingId(null);
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'urgent':
        return <Badge className="bg-red-100 text-red-700 border-red-200">Urgent</Badge>;
      case 'event':
        return <Badge className="bg-purple-100 text-purple-700 border-purple-200">Event</Badge>;
      case 'holiday':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Holiday</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200">General</Badge>;
    }
  };

  const getAudienceBadge = (audience: string) => {
    switch (audience) {
      case 'teachers':
        return <Badge variant="outline">Teachers</Badge>;
      case 'parents':
        return <Badge variant="outline">Parents</Badge>;
      case 'students':
        return <Badge variant="outline">Students</Badge>;
      default:
        return <Badge variant="outline">Everyone</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block mb-4">
            <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600">Loading announcements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Announcements</h1>
          <p className="text-gray-600">View and create announcements for the school</p>
        </div>

        {/* Create Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                resetForm();
                setDialogOpen(true);
              }}
              className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            >
              <Plus className="w-5 h-5" />
              New Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Edit Announcement' : 'Create New Announcement'}
              </DialogTitle>
              <DialogDescription>
                {editingId
                  ? 'Update the announcement details'
                  : 'Create an announcement to share with the school community'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <Label htmlFor="ann-title" className="text-sm font-semibold">
                  Title *
                </Label>
                <Input
                  id="ann-title"
                  placeholder="e.g., Summer Holiday Announcement"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="mt-2 border-amber-300"
                />
              </div>

              {/* Content */}
              <div>
                <Label htmlFor="ann-content" className="text-sm font-semibold">
                  Content *
                </Label>
                <Textarea
                  id="ann-content"
                  placeholder="Write your announcement here..."
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  className="mt-2 border-amber-300"
                  rows={4}
                />
              </div>

              {/* Type */}
              <div>
                <Label htmlFor="ann-type" className="text-sm font-semibold">
                  Type
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger id="ann-type" className="mt-2 border-amber-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="holiday">Holiday</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Target Audience */}
              <div>
                <Label htmlFor="ann-audience" className="text-sm font-semibold">
                  Target Audience
                </Label>
                <Select
                  value={formData.targetAudience}
                  onValueChange={(value) =>
                    setFormData({ ...formData, targetAudience: value })
                  }
                >
                  <SelectTrigger id="ann-audience" className="mt-2 border-amber-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Everyone</SelectItem>
                    <SelectItem value="parents">Parents Only</SelectItem>
                    <SelectItem value="teachers">Teachers Only</SelectItem>
                    <SelectItem value="students">Students Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                <Label htmlFor="ann-active" className="font-semibold text-gray-700">
                  Publish Announcement
                </Label>
                <Switch
                  id="ann-active"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
              >
                {submitting
                  ? 'Saving...'
                  : editingId
                  ? 'Update Announcement'
                  : 'Create Announcement'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Announcements List */}
      {announcements.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {announcements.map((announcement) => (
            <Card
              key={announcement.id}
              className={`p-6 border-2 transition-all ${
                announcement.is_active
                  ? 'border-amber-200 bg-gradient-to-br from-white to-amber-50'
                  : 'border-gray-200 bg-gray-50 opacity-75'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">
                      {announcement.title}
                    </h3>
                    {announcement.is_active ? (
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-100">
                        Draft
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {getTypeBadge(announcement.type)}
                    {getAudienceBadge(announcement.target_audience)}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(announcement)}
                    className="text-amber-600 hover:bg-amber-50"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(announcement.id)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <p className="text-gray-700 mb-3 leading-relaxed">
                {announcement.content}
              </p>

              <p className="text-xs text-gray-600">
                {new Date(announcement.created_at).toLocaleString()}
              </p>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Megaphone className="w-8 h-8" />}
          title="No Announcements"
          description="Create your first announcement to share with the school community"
          action={{
            label: 'Create Announcement',
            onClick: () => {
              resetForm();
              setDialogOpen(true);
            },
          }}
        />
      )}
    </div>
  );
}
