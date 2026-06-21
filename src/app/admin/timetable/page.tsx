'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared';
import { Plus, Edit2, Trash2 } from 'lucide-react';

interface Timetable {
  id: string;
  class_id: string;
  day_of_week: string;
  period_number: number;
  subject_id: string;
  teacher_id: string;
  start_time: string;
  end_time: string;
  created_at: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface Teacher {
  id: string;
  employee_id: string;
  specialization: string;
}

interface Class {
  id: string;
  name: string;
  section: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIODS = [
  { num: 1, time: '09:00 - 10:00' },
  { num: 2, time: '10:00 - 11:00' },
  { num: 3, time: '11:00 - 12:00' },
  { num: 4, time: '12:00 - 01:00' },
  { num: 5, time: '01:00 - 02:00' },
];

const MOCK_TIMETABLES: Timetable[] = [
  {
    id: 't1',
    class_id: 'cls1',
    day_of_week: 'Monday',
    period_number: 1,
    subject_id: 'sub1',
    teacher_id: 'teacher1',
    start_time: '09:00',
    end_time: '10:00',
    created_at: '2024-06-01',
  },
  {
    id: 't2',
    class_id: 'cls1',
    day_of_week: 'Monday',
    period_number: 2,
    subject_id: 'sub2',
    teacher_id: 'teacher2',
    start_time: '10:00',
    end_time: '11:00',
    created_at: '2024-06-01',
  },
];

const MOCK_SUBJECTS: Subject[] = [
  { id: 'sub1', name: 'Mathematics', code: 'MATH' },
  { id: 'sub2', name: 'English', code: 'ENG' },
  { id: 'sub3', name: 'Science', code: 'SCI' },
];

const MOCK_TEACHERS: Teacher[] = [
  { id: 'teacher1', employee_id: 'EMP001', specialization: 'Mathematics' },
  { id: 'teacher2', employee_id: 'EMP002', specialization: 'English' },
];

const MOCK_CLASSES: Class[] = [
  { id: 'cls1', name: 'Nursery', section: 'A' },
  { id: 'cls2', name: 'Nursery', section: 'B' },
];

export default function TimetablePage() {
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    class_id: '',
    day_of_week: '',
    period_number: '',
    subject_id: '',
    teacher_id: '',
    start_time: '',
    end_time: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedClass && classes.length > 0) {
      setSelectedClass(classes[0].id);
    }
  }, [classes, selectedClass]);

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

      // Fetch teachers
      const { data: teachersData } = await supabase
        .from('teachers')
        .select('*')
        .limit(50);
      if (teachersData && teachersData.length > 0) {
        setTeachers(teachersData as Teacher[]);
      } else {
        setTeachers(MOCK_TEACHERS);
      }

      // Fetch classes
      const { data: classesData } = await supabase
        .from('classes')
        .select('*')
        .limit(10);
      if (classesData && classesData.length > 0) {
        setClasses(classesData);
        setSelectedClass(classesData[0].id);
      } else {
        setClasses(MOCK_CLASSES);
        setSelectedClass(MOCK_CLASSES[0].id);
      }

      // Fetch timetables
      const { data: timetablesData } = await supabase
        .from('timetables')
        .select('*')
        .limit(100);
      if (timetablesData && timetablesData.length > 0) {
        setTimetables(timetablesData);
      } else {
        setTimetables(MOCK_TIMETABLES);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setSubjects(MOCK_SUBJECTS);
      setTeachers(MOCK_TEACHERS);
      setClasses(MOCK_CLASSES);
      setTimetables(MOCK_TIMETABLES);
      setSelectedClass(MOCK_CLASSES[0].id);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPeriod = async () => {
    if (!formData.class_id || !formData.day_of_week || !formData.period_number || !formData.subject_id) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const supabase = createClient();
      const data = {
        class_id: formData.class_id,
        day_of_week: formData.day_of_week,
        period_number: parseInt(formData.period_number),
        subject_id: formData.subject_id,
        teacher_id: formData.teacher_id,
        start_time: formData.start_time,
        end_time: formData.end_time,
      };

      if (editingId) {
        const { error } = await supabase
          .from('timetables')
          .update(data)
          .eq('id', editingId);
        if (!error) {
          setTimetables(timetables.map(t => t.id === editingId ? { ...t, ...data } : t));
        }
      } else {
        const { data: result, error } = await supabase
          .from('timetables')
          .insert([data])
          .select();
        if (!error && result) {
          setTimetables([...timetables, result[0]]);
        }
      }
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving period:', error);
    }
  };

  const handleEdit = (period: Timetable) => {
    setFormData({
      class_id: period.class_id,
      day_of_week: period.day_of_week,
      period_number: period.period_number.toString(),
      subject_id: period.subject_id,
      teacher_id: period.teacher_id,
      start_time: period.start_time,
      end_time: period.end_time,
    });
    setEditingId(period.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this period?')) {
      try {
        const supabase = createClient();
        await supabase.from('timetables').delete().eq('id', id);
        setTimetables(timetables.filter(t => t.id !== id));
      } catch (error) {
        console.error('Error deleting period:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      class_id: selectedClass,
      day_of_week: '',
      period_number: '',
      subject_id: '',
      teacher_id: '',
      start_time: '',
      end_time: '',
    });
    setEditingId(null);
  };

  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'N/A';
  };

  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? teacher.employee_id : 'N/A';
  };

  const getClassTimetable = () => {
    return timetables.filter(t => t.class_id === selectedClass);
  };

  const getTimetableForPeriod = (day: string, period: number) => {
    return getClassTimetable().find(t => t.day_of_week === day && t.period_number === period);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
          <p className="mt-4 text-gray-600">Loading timetable...</p>
        </div>
      </div>
    );
  }

  const classTimetable = getClassTimetable();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Timetable Management</h1>
          <p className="text-gray-600 mt-1">Create and manage class timetables</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
          className="bg-amber-600 hover:bg-amber-700 text-white gap-2"
        >
          <Plus size={20} />
          Add Period
        </Button>
      </div>

      {/* Class Selector */}
      <Card className="p-4 border-amber-200 bg-white">
        <Label className="text-amber-900">Select Class</Label>
        <Select value={selectedClass} onValueChange={setSelectedClass}>
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
      </Card>

      {/* Timetable Grid */}
      {classTimetable.length > 0 ? (
        <div className="overflow-x-auto">
          <Card className="border-amber-200 p-4 bg-white">
            <div className="min-w-full overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-amber-50 border-b-2 border-amber-200">
                    <th className="p-3 text-left text-amber-900 font-semibold border-r border-amber-200">Time/Day</th>
                    {DAYS.map(day => (
                      <th key={day} className="p-3 text-center text-amber-900 font-semibold border-r border-amber-200">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PERIODS.map(period => (
                    <tr key={period.num} className="border-b border-amber-100 hover:bg-amber-50">
                      <td className="p-3 font-semibold text-gray-900 border-r border-amber-200 bg-amber-50">
                        <div>Period {period.num}</div>
                        <div className="text-xs text-gray-600">{period.time}</div>
                      </td>
                      {DAYS.map(day => {
                        const entry = getTimetableForPeriod(day, period.num);
                        return (
                          <td key={`${day}-${period.num}`} className="p-2 border-r border-amber-200 text-center">
                            {entry ? (
                              <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-2 rounded border border-green-200">
                                <p className="font-semibold text-green-900 text-sm">
                                  {getSubjectName(entry.subject_id)}
                                </p>
                                <p className="text-xs text-green-700">
                                  {getTeacherName(entry.teacher_id)}
                                </p>
                                <div className="flex gap-1 mt-1 justify-center">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEdit(entry)}
                                    className="h-6 px-2 text-green-600 hover:bg-green-200"
                                  >
                                    <Edit2 size={12} />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDelete(entry.id)}
                                    className="h-6 px-2 text-red-600 hover:bg-red-200"
                                  >
                                    <Trash2 size={12} />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="text-gray-400 text-sm">-</div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      ) : (
        <EmptyState
          title="No timetable created"
          description="Add periods to create the timetable for this class"
          action={{
            label: 'Add Period',
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
              {editingId ? 'Edit Period' : 'Add New Period'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-amber-900">Day of Week</Label>
                <Select value={formData.day_of_week} onValueChange={(value) => setFormData({ ...formData, day_of_week: value })}>
                  <SelectTrigger className="mt-2 border-amber-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map(day => (
                      <SelectItem key={day} value={day}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-amber-900">Period</Label>
                <Select value={formData.period_number} onValueChange={(value) => setFormData({ ...formData, period_number: value })}>
                  <SelectTrigger className="mt-2 border-amber-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PERIODS.map(period => (
                      <SelectItem key={period.num} value={period.num.toString()}>
                        Period {period.num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
              <div>
                <Label className="text-amber-900">Teacher</Label>
                <Select value={formData.teacher_id} onValueChange={(value) => setFormData({ ...formData, teacher_id: value })}>
                  <SelectTrigger className="mt-2 border-amber-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map(teacher => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.employee_id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-amber-900">Start Time</Label>
                <Input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  className="mt-2 border-amber-200"
                />
              </div>
              <div>
                <Label className="text-amber-900">End Time</Label>
                <Input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  className="mt-2 border-amber-200"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleAddPeriod}
                className="bg-amber-600 hover:bg-amber-700 text-white flex-1"
              >
                {editingId ? 'Update Period' : 'Add Period'}
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
