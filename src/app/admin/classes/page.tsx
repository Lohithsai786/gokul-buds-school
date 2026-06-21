'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared';
import { Trash2, Edit2, Plus } from 'lucide-react';

interface Class {
  id: string;
  name: string;
  section: string;
  capacity: number;
  academic_year: string;
  created_at: string;
  updated_at: string;
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    section: '',
    capacity: '',
    academic_year: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('name')
        .limit(50);

      if (error) {
        console.error('Error fetching classes:', error);
        setClasses([]);
      } else {
        setClasses(data ?? []);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClass = async () => {
    if (!formData.name || !formData.section || !formData.capacity || !formData.academic_year) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const supabase = createClient();

      const data = {
        name: formData.name,
        section: formData.section,
        capacity: parseInt(formData.capacity),
        academic_year: formData.academic_year,
      };

      if (editingId) {
        const { error } = await supabase
          .from('classes')
          .update(data)
          .eq('id', editingId);
        if (!error) {
          setClasses(classes.map(c => c.id === editingId ? { ...c, ...data } : c));
        }
      } else {
        const { data: result, error } = await supabase
          .from('classes')
          .insert([data])
          .select();
        if (!error && result) {
          setClasses([...classes, result[0]]);
        }
      }
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving class:', error);
    }
  };

  const handleEdit = (cls: Class) => {
    setFormData({
      name: cls.name,
      section: cls.section,
      capacity: cls.capacity.toString(),
      academic_year: cls.academic_year,
    });
    setEditingId(cls.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this class? This may affect student assignments.')) {
      try {
        const supabase = createClient();
        await supabase.from('classes').delete().eq('id', id);
        setClasses(classes.filter(c => c.id !== id));
      } catch (error) {
        console.error('Error deleting class:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      section: '',
      capacity: '',
      academic_year: '',
    });
    setEditingId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
          <p className="mt-4 text-gray-600">Loading classes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Class Management</h1>
          <p className="text-gray-600 mt-1">Create and manage school classes</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
          className="bg-amber-600 hover:bg-amber-700 text-white gap-2"
        >
          <Plus size={20} />
          Add Class
        </Button>
      </div>

      {/* Class Grid */}
      {classes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <Card key={cls.id} className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-amber-900">{cls.name}</h3>
                    <p className="text-amber-700 font-semibold">Section {cls.section}</p>
                  </div>
                  <Badge className="bg-amber-600 text-white">
                    {cls.academic_year}
                  </Badge>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-amber-100">
                    <span className="text-gray-600 font-medium">Capacity</span>
                    <span className="text-2xl font-bold text-amber-600">{cls.capacity}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(cls)}
                    className="flex-1 border-amber-200 text-amber-600 hover:bg-amber-100"
                  >
                    <Edit2 size={16} className="mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(cls.id)}
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-100"
                  >
                    <Trash2 size={16} className="mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No classes found"
          description="Create your first class to get started"
          action={{
            label: 'Add Class',
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
              {editingId ? 'Edit Class' : 'Add New Class'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-amber-900">Class Name</Label>
                <Input
                  placeholder="e.g., Nursery, LKG, UKG"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-2 border-amber-200"
                />
              </div>
              <div>
                <Label className="text-amber-900">Section</Label>
                <Select value={formData.section} onValueChange={(value) => setFormData({ ...formData, section: value })}>
                  <SelectTrigger className="mt-2 border-amber-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="D">D</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-amber-900">Capacity</Label>
                <Input
                  type="number"
                  placeholder="30"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className="mt-2 border-amber-200"
                />
              </div>
              <div>
                <Label className="text-amber-900">Academic Year</Label>
                <Input
                  placeholder="2024-2025"
                  value={formData.academic_year}
                  onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                  className="mt-2 border-amber-200"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleAddClass}
                className="bg-amber-600 hover:bg-amber-700 text-white flex-1"
              >
                {editingId ? 'Update Class' : 'Add Class'}
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
