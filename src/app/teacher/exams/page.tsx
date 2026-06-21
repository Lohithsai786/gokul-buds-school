'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/shared';
import { BookOpen, Plus, Calendar, Award } from 'lucide-react';

interface Exam {
  id: string;
  name: string;
  class_id: string;
  subject_id: string;
  exam_date: string;
  total_marks: number;
  created_at: string;
  class?: { id: string; name: string; section: string };
  subject?: { id: string; name: string };
  marks?: Array<{
    id: string;
    student_id: string;
    marks_obtained: number;
    grade: string;
  }>;
}

interface Class {
  id: string;
  name: string;
  section: string;
}

interface Subject {
  id: string;
  name: string;
}

interface Student {
  id: string;
  full_name: string;
  admission_number: string;
}

export default function ExamsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<Exam[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    classId: '',
    subjectId: '',
    examDate: '',
    totalMarks: '100',
  });

  // Marks entry state
  const [marksData, setMarksData] = useState<Record<string, any>>({});

  // Load classes and subjects
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [classesData, subjectsData] = await Promise.all([
          supabase.from('classes').select('id, name, section').order('name'),
          supabase.from('subjects').select('id, name').order('name'),
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

  // Load exams
  useEffect(() => {
    const loadExams = async () => {
      try {
        const { data, error } = await supabase
          .from('exams')
          .select(
            `
            id,
            name,
            class_id,
            subject_id,
            exam_date,
            total_marks,
            created_at,
            classes:class_id(id, name, section),
            subjects:subject_id(id, name),
            marks(id, student_id, marks_obtained, grade)
          `
          )
          .order('exam_date', { ascending: false });

        if (error) throw error;
        setExams(data || []);
      } catch (error) {
        console.error('Error loading exams:', error);
      }
    };

    loadExams();
  }, [supabase]);

  const handleCreateExam = async () => {
    if (!formData.name || !formData.classId || !formData.subjectId || !formData.examDate) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);

      // First, get all students in the class
      const { data: studentsInClass } = await supabase
        .from('students')
        .select('id, full_name, admission_number')
        .eq('class_id', formData.classId)
        .eq('status', 'active');

      const { data: examData, error: examError } = await supabase
        .from('exams')
        .insert({
          name: formData.name,
          class_id: formData.classId,
          subject_id: formData.subjectId,
          exam_date: formData.examDate,
          total_marks: parseInt(formData.totalMarks),
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (examError) throw examError;

      // Create marks records for all students (with null marks initially)
      if (studentsInClass && studentsInClass.length > 0) {
        const marksRecords = studentsInClass.map((student) => ({
          exam_id: examData.id,
          student_id: student.id,
          marks_obtained: null,
          grade: null,
          created_at: new Date().toISOString(),
        }));

        await supabase.from('marks').insert(marksRecords);
      }

      // Reload exams
      const { data } = await supabase
        .from('exams')
        .select(
          `
          id,
          name,
          class_id,
          subject_id,
          exam_date,
          total_marks,
          created_at,
          classes:class_id(id, name, section),
          subjects:subject_id(id, name),
          marks(id, student_id, marks_obtained, grade)
        `
        )
        .order('exam_date', { ascending: false });

      setExams(data || []);
      setFormData({
        name: '',
        classId: '',
        subjectId: '',
        examDate: '',
        totalMarks: '100',
      });
      setDialogOpen(false);
      alert('Exam created successfully!');
    } catch (error) {
      console.error('Error creating exam:', error);
      alert('Failed to create exam');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewExamMarks = async (exam: Exam) => {
    setSelectedExam(exam);
    setMarksData({});

    // Load students for this class
    try {
      const { data } = await supabase
        .from('students')
        .select('id, full_name, admission_number')
        .eq('class_id', exam.class_id)
        .eq('status', 'active')
        .order('full_name');

      setStudents(data || []);

      // Load marks for this exam
      if (exam.marks) {
        const marksMap = exam.marks.reduce((acc, mark) => {
          acc[mark.student_id] = {
            marks_obtained: mark.marks_obtained,
            grade: mark.grade,
          };
          return acc;
        }, {} as any);
        setMarksData(marksMap);
      }
    } catch (error) {
      console.error('Error loading exam marks:', error);
    }
  };

  const calculateGrade = (marks: number, totalMarks: number) => {
    const percentage = (marks / totalMarks) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  };

  const handleMarksChange = (studentId: string, marks: string) => {
    const markValue = marks ? parseInt(marks) : 0;
    const grade = selectedExam
      ? calculateGrade(markValue, selectedExam.total_marks)
      : '';

    setMarksData({
      ...marksData,
      [studentId]: {
        marks_obtained: markValue,
        grade,
      },
    });
  };

  const handleSaveMarks = async () => {
    if (!selectedExam) return;

    try {
      setSubmitting(true);

      const updates = Object.entries(marksData)
        .filter(([_, data]: any) => data.marks_obtained !== undefined)
        .map(([studentId, data]: any) => ({
          exam_id: selectedExam.id,
          student_id: studentId,
          marks_obtained: data.marks_obtained,
          grade: data.grade,
          created_at: new Date().toISOString(),
        }));

      if (updates.length > 0) {
        // Delete existing marks and insert new ones
        await supabase
          .from('marks')
          .delete()
          .eq('exam_id', selectedExam.id);

        await supabase.from('marks').insert(updates);
      }

      alert('Marks saved successfully!');
      setSelectedExam(null);

      // Reload exams
      const { data } = await supabase
        .from('exams')
        .select(
          `
          id,
          name,
          class_id,
          subject_id,
          exam_date,
          total_marks,
          created_at,
          classes:class_id(id, name, section),
          subjects:subject_id(id, name),
          marks(id, student_id, marks_obtained, grade)
        `
        )
        .order('exam_date', { ascending: false });

      setExams(data || []);
    } catch (error) {
      console.error('Error saving marks:', error);
      alert('Failed to save marks');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block mb-4">
            <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600">Loading exams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Exam Management</h1>
          <p className="text-gray-600">Create exams and manage student marks</p>
        </div>

        {/* Create Exam Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
              <Plus className="w-5 h-5" />
              Create Exam
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Exam</DialogTitle>
              <DialogDescription>
                Set up a new exam for your class
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Exam Name */}
              <div>
                <Label htmlFor="exam-name" className="text-sm font-semibold">
                  Exam Name *
                </Label>
                <Input
                  id="exam-name"
                  placeholder="e.g., Mid Term Exam"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-2 border-amber-300"
                />
              </div>

              {/* Class */}
              <div>
                <Label htmlFor="exam-class" className="text-sm font-semibold">
                  Class *
                </Label>
                <Select
                  value={formData.classId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, classId: value })
                  }
                >
                  <SelectTrigger id="exam-class" className="mt-2 border-amber-300">
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
                <Label htmlFor="exam-subject" className="text-sm font-semibold">
                  Subject *
                </Label>
                <Select
                  value={formData.subjectId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, subjectId: value })
                  }
                >
                  <SelectTrigger id="exam-subject" className="mt-2 border-amber-300">
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

              {/* Exam Date */}
              <div>
                <Label htmlFor="exam-date" className="text-sm font-semibold">
                  Exam Date *
                </Label>
                <Input
                  id="exam-date"
                  type="date"
                  value={formData.examDate}
                  onChange={(e) =>
                    setFormData({ ...formData, examDate: e.target.value })
                  }
                  className="mt-2 border-amber-300"
                />
              </div>

              {/* Total Marks */}
              <div>
                <Label htmlFor="total-marks" className="text-sm font-semibold">
                  Total Marks
                </Label>
                <Input
                  id="total-marks"
                  type="number"
                  value={formData.totalMarks}
                  onChange={(e) =>
                    setFormData({ ...formData, totalMarks: e.target.value })
                  }
                  className="mt-2 border-amber-300"
                />
              </div>

              {/* Create Button */}
              <Button
                onClick={handleCreateExam}
                disabled={submitting}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
              >
                {submitting ? 'Creating...' : 'Create Exam'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Exams List */}
      {selectedExam ? (
        // Marks Entry View
        <Card className="p-6 border-amber-200">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {selectedExam.name}
              </h2>
              <p className="text-gray-600">
                {Array.isArray(selectedExam.class)
                  ? selectedExam.class[0]?.name
                  : selectedExam.class?.name}{' '}
                • Total Marks: {selectedExam.total_marks}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setSelectedExam(null)}
              className="border-amber-300"
            >
              Back
            </Button>
          </div>

          {students.length > 0 ? (
            <>
              <div className="overflow-x-auto mb-6">
                <Table>
                  <TableHeader className="bg-gradient-to-r from-amber-100 to-orange-100">
                    <TableRow className="border-amber-200">
                      <TableHead className="text-gray-700 font-bold">
                        Admission #
                      </TableHead>
                      <TableHead className="text-gray-700 font-bold">
                        Student Name
                      </TableHead>
                      <TableHead className="text-gray-700 font-bold">
                        Marks
                      </TableHead>
                      <TableHead className="text-gray-700 font-bold">
                        Grade
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow
                        key={student.id}
                        className="border-amber-100 hover:bg-amber-50"
                      >
                        <TableCell className="text-sm font-semibold text-amber-700">
                          {student.admission_number}
                        </TableCell>
                        <TableCell className="text-gray-900 font-medium">
                          {student.full_name}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max={selectedExam.total_marks}
                            placeholder="0"
                            value={marksData[student.id]?.marks_obtained || ''}
                            onChange={(e) =>
                              handleMarksChange(student.id, e.target.value)
                            }
                            className="w-20 border-amber-300"
                          />
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                            {marksData[student.id]?.grade || '-'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex gap-4 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setSelectedExam(null)}
                  className="border-amber-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveMarks}
                  disabled={submitting}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                >
                  {submitting ? 'Saving...' : 'Publish Marks'}
                </Button>
              </div>
            </>
          ) : (
            <EmptyState
              icon={<Award className="w-8 h-8" />}
              title="No Students"
              description="No students found in this class"
            />
          )}
        </Card>
      ) : exams.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {exams.map((exam) => {
            const cls = Array.isArray(exam.class) ? exam.class[0] : exam.class;
            const subj = Array.isArray(exam.subject) ? exam.subject[0] : exam.subject;
            const marksCount = exam.marks ? exam.marks.length : 0;
            const publishedMarks = exam.marks
              ? exam.marks.filter((m) => m.marks_obtained !== null).length
              : 0;

            return (
              <Card
                key={exam.id}
                className="p-6 border-amber-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">
                      {exam.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {subj?.name} • {cls?.name} {cls?.section && `- ${cls.section}`}
                    </p>
                  </div>
                  <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                    {exam.total_marks} Marks
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div>
                    <p className="text-sm text-gray-600">Exam Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(exam.exam_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Marks Status</p>
                    <p className="font-semibold text-gray-900">
                      {publishedMarks}/{marksCount} entered
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => handleViewExamMarks(exam)}
                  className="w-full gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                >
                  <Award className="w-4 h-4" />
                  {publishedMarks === marksCount ? 'Edit Marks' : 'Enter Marks'}
                </Button>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<BookOpen className="w-8 h-8" />}
          title="No Exams Created"
          description="Start by creating your first exam"
          action={{
            label: 'Create Exam',
            onClick: () => setDialogOpen(true),
          }}
        />
      )}
    </div>
  );
}
