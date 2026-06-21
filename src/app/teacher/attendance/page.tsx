'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { EmptyState } from '@/components/shared';
import { Calendar, Users, Check, X, Clock } from 'lucide-react';

interface Student {
  id: string;
  full_name: string;
  admission_number: string;
  status?: 'present' | 'absent' | 'late';
  remarks?: string;
}

interface ClassData {
  id: string;
  name: string;
  section: string;
}

export default function AttendancePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, any>>({});
  const [existingAttendance, setExistingAttendance] = useState<any>(null);

  // Load classes
  useEffect(() => {
    const loadClasses = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('classes')
          .select('id, name, section')
          .order('name');

        if (error) throw error;
        setClasses(data || []);
        if (data && data.length > 0) {
          setSelectedClass(data[0].id);
        }
      } catch (error) {
        console.error('Error loading classes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadClasses();
  }, [supabase]);

  // Load students and attendance for selected class
  useEffect(() => {
    const loadStudentsAndAttendance = async () => {
      if (!selectedClass) return;

      try {
        setLoading(true);

        // Load students
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('id, full_name, admission_number')
          .eq('class_id', selectedClass)
          .eq('status', 'active')
          .order('full_name');

        if (studentsError) throw studentsError;

        setStudents(studentsData || []);

        // Load existing attendance
        const { data: attendanceData } = await supabase
          .from('attendance')
          .select('*')
          .eq('class_id', selectedClass)
          .eq('date', selectedDate);

        if (attendanceData && attendanceData.length > 0) {
          const attendanceMap = attendanceData.reduce((acc, att) => {
            acc[att.student_id] = att;
            return acc;
          }, {} as any);
          setExistingAttendance(attendanceMap);
        } else {
          setExistingAttendance(null);
        }

        setAttendance({});
      } catch (error) {
        console.error('Error loading students:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStudentsAndAttendance();
  }, [selectedClass, selectedDate, supabase]);

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendance({
      ...attendance,
      [studentId]: {
        ...attendance[studentId],
        status,
      },
    });
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setAttendance({
      ...attendance,
      [studentId]: {
        ...attendance[studentId],
        remarks,
      },
    });
  };

  const handleSaveAttendance = async () => {
    if (!selectedClass || !selectedDate) return;

    try {
      setSaving(true);

      // Delete existing attendance for this date if any
      await supabase
        .from('attendance')
        .delete()
        .eq('class_id', selectedClass)
        .eq('date', selectedDate);

      // Insert new attendance records
      const records = Object.entries(attendance)
        .filter(([_, data]: any) => data.status)
        .map(([studentId, data]: any) => ({
          student_id: studentId,
          class_id: selectedClass,
          date: selectedDate,
          status: data.status,
          remarks: data.remarks || null,
          marked_by: 'teacher_id', // This should be the actual teacher ID from auth
          created_at: new Date().toISOString(),
        }));

      if (records.length > 0) {
        const { error } = await supabase
          .from('attendance')
          .insert(records);

        if (error) throw error;
      }

      // Reload attendance
      const { data: attendanceData } = await supabase
        .from('attendance')
        .select('*')
        .eq('class_id', selectedClass)
        .eq('date', selectedDate);

      if (attendanceData && attendanceData.length > 0) {
        const attendanceMap = attendanceData.reduce((acc, att) => {
          acc[att.student_id] = att;
          return acc;
        }, {} as any);
        setExistingAttendance(attendanceMap);
      }

      setAttendance({});
      alert('Attendance saved successfully!');
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return <Badge variant="outline">Not Marked</Badge>;
    switch (status) {
      case 'present':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Present</Badge>;
      case 'absent':
        return <Badge className="bg-red-100 text-red-700 border-red-200">Absent</Badge>;
      case 'late':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Late</Badge>;
      default:
        return <Badge variant="outline">Not Marked</Badge>;
    }
  };

  const currentStatus = (studentId: string) => {
    if (attendance[studentId]?.status) {
      return attendance[studentId].status;
    }
    return existingAttendance?.[studentId]?.status || '';
  };

  const currentRemarks = (studentId: string) => {
    if (attendance[studentId]?.remarks !== undefined) {
      return attendance[studentId].remarks;
    }
    return existingAttendance?.[studentId]?.remarks || '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block mb-4">
            <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mark Attendance</h1>
        <p className="text-gray-600">Record student attendance for your class</p>
      </div>

      {/* Filters */}
      <Card className="p-6 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Class Selector */}
          <div>
            <Label htmlFor="class-select" className="text-sm font-semibold text-gray-700 mb-2 block">
              Select Class
            </Label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger id="class-select" className="border-amber-300 bg-white">
                <SelectValue />
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

          {/* Date Picker */}
          <div>
            <Label htmlFor="date-input" className="text-sm font-semibold text-gray-700 mb-2 block">
              Date
            </Label>
            <Input
              id="date-input"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border-amber-300 bg-white"
            />
          </div>

          {/* Info */}
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              <p className="font-semibold text-gray-700">
                {students.length} students in class
              </p>
              {existingAttendance && (
                <p className="text-amber-600 font-medium">
                  Already marked for this date
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Students Table */}
      {students.length > 0 ? (
        <Card className="border-amber-200 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gradient-to-r from-amber-100 to-orange-100">
                <TableRow className="border-amber-200 hover:bg-transparent">
                  <TableHead className="text-gray-700 font-bold">Admission #</TableHead>
                  <TableHead className="text-gray-700 font-bold">Student Name</TableHead>
                  <TableHead className="text-gray-700 font-bold">Status</TableHead>
                  <TableHead className="text-gray-700 font-bold">Remarks</TableHead>
                  <TableHead className="text-gray-700 font-bold text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id} className="border-amber-100 hover:bg-amber-50">
                    <TableCell className="text-sm font-semibold text-amber-700">
                      {student.admission_number}
                    </TableCell>
                    <TableCell className="text-gray-900 font-medium">
                      {student.full_name}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(currentStatus(student.id))}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="text"
                        placeholder="e.g., Sick, Late arrival..."
                        value={currentRemarks(student.id)}
                        onChange={(e) =>
                          handleRemarksChange(student.id, e.target.value)
                        }
                        className="text-sm border-gray-300 bg-white"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 justify-center">
                        <Button
                          size="sm"
                          onClick={() =>
                            handleStatusChange(student.id, 'present')
                          }
                          className={`transition-all ${
                            currentStatus(student.id) === 'present'
                              ? 'bg-green-500 hover:bg-green-600 text-white'
                              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                          }`}
                          title="Mark Present"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() =>
                            handleStatusChange(student.id, 'absent')
                          }
                          className={`transition-all ${
                            currentStatus(student.id) === 'absent'
                              ? 'bg-red-500 hover:bg-red-600 text-white'
                              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                          }`}
                          title="Mark Absent"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() =>
                            handleStatusChange(student.id, 'late')
                          }
                          className={`transition-all ${
                            currentStatus(student.id) === 'late'
                              ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                          }`}
                          title="Mark Late"
                        >
                          <Clock className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Save Button */}
          <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 flex justify-end">
            <Button
              onClick={handleSaveAttendance}
              disabled={saving || Object.keys(attendance).length === 0}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold"
            >
              {saving ? 'Saving...' : 'Save Attendance'}
            </Button>
          </div>
        </Card>
      ) : (
        <EmptyState
          icon={<Users className="w-8 h-8" />}
          title="No Students Found"
          description="No active students in the selected class. Please select a different class or check student records."
        />
      )}
    </div>
  );
}
