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
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared';
import { Plus, Edit2, Trash2, CheckCircle } from 'lucide-react';

interface Exam {
  id: string;
  name: string;
  class_id: string;
  subject_id: string;
  exam_date: string;
  total_marks: number;
  created_at: string;
}

interface Mark {
  id: string;
  exam_id: string;
  student_id: string;
  student_name: string;
  marks_obtained: number;
  grade: string;
  remarks: string;
  created_at: string;
}

interface Student {
  id: string;
  full_name: string;
  admission_number: string;
  class_id: string;
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

const MOCK_EXAMS: Exam[] = [
  {
    id: 'exam1',
    name: 'Mid Term Exam',
    class_id: 'cls1',
    subject_id: 'sub1',
    exam_date: '2024-06-20',
    total_marks: 100,
    created_at: '2024-06-16',
  },
  {
    id: 'exam2',
    name: 'Final Exam',
    class_id: 'cls1',
    subject_id: 'sub2',
    exam_date: '2024-07-15',
    total_marks: 50,
    created_at: '2024-06-16',
  },
];

const MOCK_MARKS: Mark[] = [
  {
    id: 'm1',
    exam_id: 'exam1',
    student_id: 's1',
    student_name: 'Aarav Sharma',
    marks_obtained: 85,
    grade: 'A',
    remarks: 'Good performance',
    created_at: '2024-06-20',
  },
];

const MOCK_SUBJECTS: Subject[] = [
  { id: 'sub1', name: 'Mathematics', code: 'MATH' },
  { id: 'sub2', name: 'English', code: 'ENG' },
];

const MOCK_CLASSES: Class[] = [
  { id: 'cls1', name: 'Nursery', section: 'A' },
  { id: 'cls2', name: 'Nursery', section: 'B' },
];

const MOCK_STUDENTS: Student[] = [
  { id: 's1', full_name: 'Aarav Sharma', admission_number: 'ADM001', class_id: 'cls1' },
  { id: 's2', full_name: 'Priya Verma', admission_number: 'ADM002', class_id: 'cls1' },
];

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'exams' | 'marks'>('exams');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [marksDialogOpen, setMarksDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedExamForMarks, setSelectedExamForMarks] = useState<string | null>(null);
  const [markInputs, setMarkInputs] = useState<Map<string, { marks: string; grade: string; remarks: string }>>(new Map());
  const [formData, setFormData] = useState({
    name: '',
    class_id: '',
    subject_id: '',
    exam_date: '',
    total_marks: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedExamForMarks) {
      fetchStudentMarks(selectedExamForMarks);
    }
  }, [selectedExamForMarks]);

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

      // Fetch exams
      const { data: examsData } = await supabase
        .from('exams')
        .select('*')
        .limit(50);
      if (examsData && examsData.length > 0) {
        setExams(examsData);
      } else {
        setExams(MOCK_EXAMS);
      }

      // Fetch marks
      const { data: marksData } = await supabase
        .from('marks')
        .select('*')
        .limit(200);
      if (marksData && marksData.length > 0) {
        setMarks(marksData as Mark[]);
      } else {
        setMarks(MOCK_MARKS);
      }

      // Fetch students
      setStudents(MOCK_STUDENTS);
    } catch (error) {
      console.error('Error fetching data:', error);
      setSubjects(MOCK_SUBJECTS);
      setClasses(MOCK_CLASSES);
      setExams(MOCK_EXAMS);
      setMarks(MOCK_MARKS);
      setStudents(MOCK_STUDENTS);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentMarks = async (examId: string) => {
    const exam = exams.find(e => e.id === examId);
    if (!exam) return;

    // Get students in this class
    const classStudents = students.filter(s => s.class_id === exam.class_id);

    // Get existing marks
    const examMarks = marks.filter(m => m.exam_id === examId);
    const markMap = new Map<string, Mark>();
    examMarks.forEach(m => markMap.set(m.student_id, m));

    // Initialize mark inputs
    const inputs = new Map<string, { marks: string; grade: string; remarks: string }>();
    classStudents.forEach(s => {
      const existingMark = markMap.get(s.id);
      inputs.set(s.id, {
        marks: existingMark?.marks_obtained?.toString() || '',
        grade: existingMark?.grade || '',
        remarks: existingMark?.remarks || '',
      });
    });
    setMarkInputs(inputs);
  };

  const handleAddExam = async () => {
    if (!formData.name || !formData.class_id || !formData.subject_id || !formData.exam_date || !formData.total_marks) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const supabase = createClient();
      const data = {
        name: formData.name,
        class_id: formData.class_id,
        subject_id: formData.subject_id,
        exam_date: formData.exam_date,
        total_marks: parseInt(formData.total_marks),
      };

      if (editingId) {
        const { error } = await supabase
          .from('exams')
          .update(data)
          .eq('id', editingId);
        if (!error) {
          setExams(exams.map(e => e.id === editingId ? { ...e, ...data } : e));
        }
      } else {
        const { data: result, error } = await supabase
          .from('exams')
          .insert([data])
          .select();
        if (!error && result) {
          setExams([...exams, result[0]]);
        }
      }
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving exam:', error);
    }
  };

  const handleSaveMarks = async () => {
    if (!selectedExamForMarks) return;

    try {
      const supabase = createClient();
      const exam = exams.find(e => e.id === selectedExamForMarks);
      if (!exam) return;

      const marksToInsert = Array.from(markInputs.entries())
        .filter(([_, data]) => data.marks)
        .map(([studentId, data]) => ({
          exam_id: selectedExamForMarks,
          student_id: studentId,
          marks_obtained: parseInt(data.marks),
          grade: data.grade,
          remarks: data.remarks,
        }));

      if (marksToInsert.length > 0) {
        // Delete existing marks for this exam
        await supabase
          .from('marks')
          .delete()
          .eq('exam_id', selectedExamForMarks);

        // Insert new marks
        const { error } = await supabase
          .from('marks')
          .insert(marksToInsert);

        if (!error) {
          alert('Marks saved successfully!');
          setMarksDialogOpen(false);
          setSelectedExamForMarks(null);
          fetchData();
        }
      }
    } catch (error) {
      console.error('Error saving marks:', error);
      alert('Error saving marks');
    }
  };

  const handleEdit = (exam: Exam) => {
    setFormData({
      name: exam.name,
      class_id: exam.class_id,
      subject_id: exam.subject_id,
      exam_date: exam.exam_date,
      total_marks: exam.total_marks.toString(),
    });
    setEditingId(exam.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure? This will also delete all marks for this exam.')) {
      try {
        const supabase = createClient();
        await supabase.from('exams').delete().eq('id', id);
        setExams(exams.filter(e => e.id !== id));
      } catch (error) {
        console.error('Error deleting exam:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      class_id: '',
      subject_id: '',
      exam_date: '',
      total_marks: '',
    });
    setEditingId(null);
  };

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
          <p className="mt-4 text-gray-600">Loading exams...</p>
        </div>
      </div>
    );
  }

  const examsForMarking = selectedExamForMarks
    ? exams.filter(e => e.id === selectedExamForMarks)
    : [];

  const currentExam = examsForMarking[0];
  const studentsForExam = currentExam
    ? students.filter(s => s.class_id === currentExam.class_id)
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Exam Management</h1>
          <p className="text-gray-600 mt-1">Create exams and manage marks</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === 'exams' ? 'default' : 'outline'}
            onClick={() => setView('exams')}
            className={view === 'exams' ? 'bg-amber-600 hover:bg-amber-700' : 'border-amber-200'}
          >
            Exams
          </Button>
          <Button
            variant={view === 'marks' ? 'default' : 'outline'}
            onClick={() => setView('marks')}
            className={view === 'marks' ? 'bg-amber-600 hover:bg-amber-700' : 'border-amber-200'}
          >
            Marks
          </Button>
        </div>
      </div>

      {view === 'exams' ? (
        <>
          {/* Exams List */}
          <div className="flex justify-end">
            <Button
              onClick={() => {
                resetForm();
                setDialogOpen(true);
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white gap-2"
            >
              <Plus size={20} />
              Create Exam
            </Button>
          </div>

          {exams.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {exams.map(exam => (
                <Card key={exam.id} className="p-6 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
                  <h3 className="text-xl font-bold text-amber-900 mb-2">{exam.name}</h3>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Class</span>
                      <span className="font-semibold text-gray-900">{getClassName(exam.class_id)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subject</span>
                      <span className="font-semibold text-gray-900">{getSubjectName(exam.subject_id)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Date</span>
                      <span className="font-semibold text-gray-900">
                        {new Date(exam.exam_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Marks</span>
                      <span className="font-semibold text-amber-600 text-lg">{exam.total_marks}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setSelectedExamForMarks(exam.id);
                        setMarksDialogOpen(true);
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-1"
                      size="sm"
                    >
                      <CheckCircle size={16} />
                      Enter Marks
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(exam)}
                      className="flex-1 border-amber-200 text-amber-600 hover:bg-amber-100"
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(exam.id)}
                      className="flex-1 border-red-200 text-red-600 hover:bg-red-100"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No exams found"
              description="Create your first exam"
              action={{
                label: 'Create Exam',
                onClick: () => {
                  resetForm();
                  setDialogOpen(true);
                },
              }}
            />
          )}
        </>
      ) : (
        <>
          {/* Marks View */}
          {marks.length > 0 ? (
            <Card className="border-amber-200">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-amber-50">
                    <TableRow className="border-b-2 border-amber-200">
                      <TableHead className="text-amber-900 font-semibold">Student</TableHead>
                      <TableHead className="text-amber-900 font-semibold">Exam</TableHead>
                      <TableHead className="text-amber-900 font-semibold">Marks</TableHead>
                      <TableHead className="text-amber-900 font-semibold">Grade</TableHead>
                      <TableHead className="text-amber-900 font-semibold">Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {marks.map(mark => {
                      const exam = exams.find(e => e.id === mark.exam_id);
                      return (
                        <TableRow key={mark.id} className="border-b border-amber-100 hover:bg-amber-50">
                          <TableCell className="font-semibold text-gray-900">
                            {mark.student_name}
                          </TableCell>
                          <TableCell className="text-gray-700">{exam?.name || 'N/A'}</TableCell>
                          <TableCell className="font-semibold text-amber-600">
                            {mark.marks_obtained} / {exam?.total_marks}
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-blue-100 text-blue-800">{mark.grade}</Badge>
                          </TableCell>
                          <TableCell className="text-gray-600 text-sm">{mark.remarks}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </Card>
          ) : (
            <EmptyState
              title="No marks found"
              description="Enter marks for exams"
            />
          )}
        </>
      )}

      {/* Create Exam Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl border-amber-200">
          <DialogHeader>
            <DialogTitle className="text-amber-900">
              {editingId ? 'Edit Exam' : 'Create New Exam'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-amber-900">Exam Name</Label>
              <Input
                placeholder="Mid Term Exam"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-2 border-amber-200"
              />
            </div>

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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-amber-900">Exam Date</Label>
                <Input
                  type="date"
                  value={formData.exam_date}
                  onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })}
                  className="mt-2 border-amber-200"
                />
              </div>
              <div>
                <Label className="text-amber-900">Total Marks</Label>
                <Input
                  type="number"
                  placeholder="100"
                  value={formData.total_marks}
                  onChange={(e) => setFormData({ ...formData, total_marks: e.target.value })}
                  className="mt-2 border-amber-200"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleAddExam}
                className="bg-amber-600 hover:bg-amber-700 text-white flex-1"
              >
                {editingId ? 'Update Exam' : 'Create Exam'}
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

      {/* Enter Marks Dialog */}
      <Dialog open={marksDialogOpen} onOpenChange={setMarksDialogOpen}>
        <DialogContent className="max-w-4xl border-amber-200 max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-amber-900">
              Enter Marks - {currentExam?.name}
            </DialogTitle>
          </DialogHeader>
          {studentsForExam.length > 0 ? (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-amber-50 sticky top-0">
                    <TableRow className="border-b-2 border-amber-200">
                      <TableHead className="text-amber-900 font-semibold">Student</TableHead>
                      <TableHead className="text-amber-900 font-semibold">Marks</TableHead>
                      <TableHead className="text-amber-900 font-semibold">Grade</TableHead>
                      <TableHead className="text-amber-900 font-semibold">Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentsForExam.map(student => {
                      const inputs = markInputs.get(student.id) || { marks: '', grade: '', remarks: '' };
                      return (
                        <TableRow key={student.id} className="border-b border-amber-100">
                          <TableCell className="font-semibold text-gray-900">
                            {student.full_name}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              placeholder="0"
                              value={inputs.marks}
                              onChange={(e) => {
                                const newInputs = new Map(markInputs);
                                newInputs.set(student.id, { ...inputs, marks: e.target.value });
                                setMarkInputs(newInputs);
                              }}
                              className="w-20 border-amber-200"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              placeholder="A"
                              value={inputs.grade}
                              onChange={(e) => {
                                const newInputs = new Map(markInputs);
                                newInputs.set(student.id, { ...inputs, grade: e.target.value });
                                setMarkInputs(newInputs);
                              }}
                              className="w-16 border-amber-200"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              placeholder="Remarks"
                              value={inputs.remarks}
                              onChange={(e) => {
                                const newInputs = new Map(markInputs);
                                newInputs.set(student.id, { ...inputs, remarks: e.target.value });
                                setMarkInputs(newInputs);
                              }}
                              className="border-amber-200"
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="flex gap-3 pt-4 sticky bottom-0 bg-white">
                <Button
                  onClick={handleSaveMarks}
                  className="bg-green-600 hover:bg-green-700 text-white flex-1"
                >
                  Save Marks
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setMarksDialogOpen(false);
                    setSelectedExamForMarks(null);
                  }}
                  className="flex-1 border-amber-200"
                >
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">No students found for this exam's class</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
