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
import { EmptyState } from '@/components/shared';
import { BookOpen, Plus, Calendar, Download, Trash2 } from 'lucide-react';

interface Homework {
  id: string;
  title: string;
  description: string;
  subject_id: string;
  class_id: string;
  due_date: string;
  created_at: string;
  subject?: { id: string; name: string };
  class?: { id: string; name: string; section: string };
  files?: Array<{ id: string; file_name: string; file_url: string }>;
}

interface Class {
  id: string;
  name: string;
  section: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

export default function HomeworkPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    classId: '',
    subjectId: '',
    dueDate: '',
  });

  // Load classes and subjects
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [classesData, subjectsData] = await Promise.all([
          supabase.from('classes').select('id, name, section').order('name'),
          supabase.from('subjects').select('id, name, code').order('name'),
        ]);

        if (classesData.data) setClasses(classesData.data);
        if (subjectsData.data) setSubjects(subjectsData.data);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [supabase]);

  // Load homework
  useEffect(() => {
    const loadHomework = async () => {
      try {
        const { data, error } = await supabase
          .from('homework')
          .select(
            `
            id,
            title,
            description,
            subject_id,
            class_id,
            due_date,
            created_at,
            subjects:subject_id(id, name),
            classes:class_id(id, name, section),
            homework_files(id, file_name, file_url)
          `
          )
          .order('due_date', { ascending: true });

        if (error) throw error;
        setHomeworkList(data || []);
      } catch (error) {
        console.error('Error loading homework:', error);
      }
    };

    loadHomework();
  }, [supabase]);

  const handleSubmitHomework = async () => {
    if (!formData.title || !formData.classId || !formData.subjectId || !formData.dueDate) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const { error } = await supabase.from('homework').insert({
        title: formData.title,
        description: formData.description,
        class_id: formData.classId,
        subject_id: formData.subjectId,
        due_date: formData.dueDate,
        teacher_id: 'teacher_id', // Should be actual teacher ID from auth
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      // Reload homework
      const { data } = await supabase
        .from('homework')
        .select(
          `
          id,
          title,
          description,
          subject_id,
          class_id,
          due_date,
          created_at,
          subjects:subject_id(id, name),
          classes:class_id(id, name, section),
          homework_files(id, file_name, file_url)
        `
        )
        .order('due_date', { ascending: true });

      setHomeworkList(data || []);
      setFormData({
        title: '',
        description: '',
        classId: '',
        subjectId: '',
        dueDate: '',
      });
      setDialogOpen(false);
      alert('Homework posted successfully!');
    } catch (error) {
      console.error('Error posting homework:', error);
      alert('Failed to post homework');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteHomework = async (homeworkId: string) => {
    if (!confirm('Are you sure you want to delete this homework?')) return;

    try {
      const { error } = await supabase
        .from('homework')
        .delete()
        .eq('id', homeworkId);

      if (error) throw error;

      setHomeworkList(homeworkList.filter((h) => h.id !== homeworkId));
      alert('Homework deleted successfully!');
    } catch (error) {
      console.error('Error deleting homework:', error);
      alert('Failed to delete homework');
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const isToday = (dueDate: string) => {
    const today = new Date().toDateString();
    return new Date(dueDate).toDateString() === today;
  };

  const daysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block mb-4">
            <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600">Loading homework...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Homework Management</h1>
          <p className="text-gray-600">Create and manage homework assignments</p>
        </div>

        {/* Add Homework Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
              <Plus className="w-5 h-5" />
              Post Homework
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Homework</DialogTitle>
              <DialogDescription>
                Assign homework to your class students
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <Label htmlFor="hw-title" className="text-sm font-semibold">
                  Homework Title *
                </Label>
                <Input
                  id="hw-title"
                  placeholder="e.g., Chapter 5 Exercises"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="mt-2 border-amber-300"
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="hw-description" className="text-sm font-semibold">
                  Description
                </Label>
                <Textarea
                  id="hw-description"
                  placeholder="Provide details about the homework..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="mt-2 border-amber-300"
                  rows={3}
                />
              </div>

              {/* Class */}
              <div>
                <Label htmlFor="hw-class" className="text-sm font-semibold">
                  Class *
                </Label>
                <Select
                  value={formData.classId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, classId: value })
                  }
                >
                  <SelectTrigger id="hw-class" className="mt-2 border-amber-300">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name} {cls.section && `- ${cls.section}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subject */}
              <div>
                <Label htmlFor="hw-subject" className="text-sm font-semibold">
                  Subject *
                </Label>
                <Select
                  value={formData.subjectId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, subjectId: value })
                  }
                >
                  <SelectTrigger id="hw-subject" className="mt-2 border-amber-300">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Due Date */}
              <div>
                <Label htmlFor="hw-duedate" className="text-sm font-semibold">
                  Due Date *
                </Label>
                <Input
                  id="hw-duedate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                  className="mt-2 border-amber-300"
                />
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmitHomework}
                disabled={submitting}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
              >
                {submitting ? 'Posting...' : 'Post Homework'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Homework List */}
      {homeworkList.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {homeworkList.map((homework) => {
            const subject = Array.isArray(homework.subjects)
              ? homework.subjects[0]
              : homework.subjects;
            const cls = Array.isArray(homework.classes)
              ? homework.classes[0]
              : homework.classes;
            const daysLeft = daysUntilDue(homework.due_date);

            return (
              <Card
                key={homework.id}
                className="p-6 border-amber-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {homework.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {subject?.name} • {cls?.name} {cls?.section && `- ${cls.section}`}
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteHomework(homework.id)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {homework.description && (
                  <p className="text-gray-700 mb-4">{homework.description}</p>
                )}

                {/* Due Date Badge */}
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Due: {new Date(homework.due_date).toLocaleDateString()}
                  </span>
                  {isOverdue(homework.due_date) ? (
                    <Badge className="bg-red-100 text-red-700 border-red-200">
                      Overdue
                    </Badge>
                  ) : isToday(homework.due_date) ? (
                    <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                      Due Today
                    </Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      {daysLeft} days left
                    </Badge>
                  )}
                </div>

                {/* Files */}
                {homework.files && homework.files.length > 0 && (
                  <div className="bg-amber-50 p-3 rounded-lg">
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      Attached Files:
                    </p>
                    <div className="space-y-1">
                      {homework.files.map((file) => (
                        <a
                          key={file.id}
                          href={file.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-amber-600 hover:text-amber-700 text-sm"
                        >
                          <Download className="w-4 h-4" />
                          {file.file_name}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<BookOpen className="w-8 h-8" />}
          title="No Homework Yet"
          description="Start by creating your first homework assignment for your class"
          action={{
            label: 'Create Homework',
            onClick: () => setDialogOpen(true),
          }}
        />
      )}
    </div>
  );
}
