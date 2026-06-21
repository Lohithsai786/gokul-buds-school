'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared';
import { Plus, Edit2, Trash2, FileText } from 'lucide-react';

interface Homework {
  id: string;
  class_id: string;
  subject_id: string;
  title: string;
  description: string;
  due_date: string;
  created_by: string;
  created_at: string;
  status: 'active' | 'completed' | 'archived';
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface Class {
  id: string;
  name: string;
  section: string;
}

const MOCK_HOMEWORK: Homework[] = [
  {
    id: 'hw1',
    class_id: 'cls1',
    subject_id: 'sub1',
    title: 'Mathematics Practice',
    description: 'Complete exercises from Chapter 2 - Numbers 1 to 20',
    due_date: '2024-06-18',
    created_by: 'admin',
    created_at: '2024-06-16',
    status: 'active',
  },
  {
    id: 'hw2',
    class_id: 'cls1',
    subject_id: 'sub2',
    title: 'English Reading',
    description: 'Read the story "The Rabbit and the Turtle" and answer questions',
    due_date: '2024-06-19',
    created_by: 'admin',
    created_at: '2024-06-16',
    status: 'active',
  },
];

const MOCK_SUBJECTS: Subject[] = [
  { id: 'sub1', name: 'Mathematics', code: 'MATH' },
  { id: 'sub2', name: 'English', code: 'ENG' },
  { id: 'sub3', name: 'Science', code: 'SCI' },
];

const MOCK_CLASSES: Class[] = [
  { id: 'cls1', name: 'Nursery', section: 'A' },
  { id: 'cls2', name: 'Nursery', section: 'B' },
];

export default function HomeworkPage() {
  const [homework, setHomework] = useState<Homework[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterClass, setFilterClass] = useState('all');
  const [filterStatus, setFilterStatus] = useState('active');
  const [formData, setFormData] = useState({
    class_id: '',
    subject_id: '',
    title: '',
    description: '',
    due_date: '',
    status: 'active' as const,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const supabase = createClient();

      // Fetch subjects
      const { data: subjectsData } = await supabase
        .from('subjects')
        .select('*')
        .limit(20);

      if (subjectsData && subjectsData.length > 0) {
        setSubjects(subjectsData);
      } else {
        setSubjects(MOCK_SUBJECTS);
      }

      // Fetch classes
      const { data: classesData } = await supabase
        .from('classes')
        .select('*')
        .limit(10);

      if (classesData && classesData.length > 0) {
        setClasses(classesData);
      } else {
        setClasses(MOCK_CLASSES);
      }

      // Fetch homework - note: we're using mock data since there's no homework table
      setHomework(MOCK_HOMEWORK);
    } catch (error) {
      console.error('Error fetching data:', error);
      setSubjects(MOCK_SUBJECTS);
      setClasses(MOCK_CLASSES);
      setHomework(MOCK_HOMEWORK);
    } finally {
      setLoading(false);
    }
  };

  const handleAddHomework = async () => {
    if (!formData.class_id || !formData.subject_id || !formData.title) {
      alert('Please fill all required fields');
      return;
    }

    try {
      // Since homework table doesn't exist in the spec, we're using mock data
      const newHomework: Homework = {
        id: editingId || `hw-${Date.now()}`,
        ...formData,
        created_by: 'admin',
        created_at: new Date().toISOString(),
      };

      if (editingId) {
        setHomework(homework.map(h => h.id === editingId ? newHomework : h));
      } else {
        setHomework([...homework, newHomework]);
      }

      setDialogOpen(false);
      resetForm();
      alert('Homework saved successfully!');
    } catch (error) {
      console.error('Error saving homework:', error);
    }
  };

  const handleEdit = (hw: Homework) => {
    setFormData({
      class_id: hw.class_id,
      subject_id: hw.subject_id,
      title: hw.title,
      description: hw.description,
      due_date: hw.due_date,
      status: hw.status,
    });
    setEditingId(hw.id);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this homework?')) {
      setHomework(homework.filter(h => h.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      class_id: '',
      subject_id: '',
      title: '',
      description: '',
      due_date: '',
      status: 'active',
    });
    setEditingId(null);
  };

  const filteredHomework = homework.filter(hw => {
    const classMatch = filterClass === 'all' || hw.class_id === filterClass;
    const statusMatch = hw.status === filterStatus;
    return classMatch && statusMatch;
  });

  const getClassName = (classId: string) => {
    const cls = classes.find(c => c.id === classId);
    return cls ? `${cls.name} - ${cls.section}` : 'N/A';
  };

  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'N/A';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
          <p className="mt-4 text-gray-600">Loading homework...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Homework Management</h1>
          <p className="text-gray-600 mt-1">Assign and track homework for classes</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
          className="bg-amber-600 hover:bg-amber-700 text-white gap-2"
        >
          <Plus size={20} />
          Assign Homework
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 border-amber-200 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-amber-900">Filter by Class</Label>
            <Select value={filterClass} onValueChange={setFilterClass}>
              <SelectTrigger className="mt-2 border-amber-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map(cls => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name} - {cls.section}
                  </SelectItem>
                ))}
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              Showing {filteredHomework.length} of {homework.length} homework
            </div>
          </div>
        </div>
      </Card>

      {/* Homework List */}
      {filteredHomework.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredHomework.map(hw => (
            <Card key={hw.id} className="p-6 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <FileText className="text-amber-600 mt-1" size={24} />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-amber-900">{hw.title}</h3>
                    <p className="text-sm text-amber-700 font-semibold mt-1">
                      {getClassName(hw.class_id)} - {getSubjectName(hw.subject_id)}
                    </p>
                  </div>
                </div>
                <Badge className={`${
                  hw.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : hw.status === 'completed'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {hw.status.charAt(0).toUpperCase() + hw.status.slice(1)}
                </Badge>
              </div>

              <p className="text-gray-700 mb-4">{hw.description}</p>

              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-100 mb-4">
                <span className="text-sm text-gray-600">Due Date</span>
                <span className="font-semibold text-amber-900">
                  {new Date(hw.due_date).toLocaleDateString()}
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(hw)}
                  className="flex-1 border-amber-200 text-amber-600 hover:bg-amber-100"
                >
                  <Edit2 size={16} className="mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(hw.id)}
                  className="flex-1 border-red-200 text-red-600 hover:bg-red-100"
                >
                  <Trash2 size={16} className="mr-1" />
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No homework found"
          description="Assign homework to classes"
          action={{
            label: 'Assign Homework',
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
              {editingId ? 'Edit Homework' : 'Assign New Homework'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-amber-900">Class</Label>
                <Select value={formData.class_id} onValueChange={(value) => setFormData({ ...formData, class_id: value })}>
                  <SelectTrigger className="mt-2 border-amber-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map(cls => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name} - {cls.section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-amber-900">Subject</Label>
                <Select value={formData.subject_id} onValueChange={(value) => setFormData({ ...formData, subject_id: value })}>
                  <SelectTrigger className="mt-2 border-amber-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map(subject => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-amber-900">Title</Label>
              <Input
                placeholder="Homework title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-2 border-amber-200"
              />
            </div>

            <div>
              <Label className="text-amber-900">Description</Label>
              <Textarea
                placeholder="Describe the homework..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-2 border-amber-200"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-amber-900">Due Date</Label>
                <Input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="mt-2 border-amber-200"
                />
              </div>
              <div>
                <Label className="text-amber-900">Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger className="mt-2 border-amber-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleAddHomework}
                className="bg-amber-600 hover:bg-amber-700 text-white flex-1"
              >
                {editingId ? 'Update Homework' : 'Assign Homework'}
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
