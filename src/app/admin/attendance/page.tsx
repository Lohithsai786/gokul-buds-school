'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { EmptyState } from '@/components/shared';

interface Student {
  id: string;
  full_name: string;
  admission_number: string;
  class_id: string;
}

interface AttendanceRecord {
  student_id: string;
  status: 'present' | 'absent' | 'late';
}

interface Class {
  id: string;
  name: string;
  section: string;
}

interface MonthlyStats {
  class_id: string;
  class_name: string;
  present_percentage: number;
  total_days: number;
}

const MOCK_CLASSES: Class[] = [
  { id: 'cls1', name: 'Nursery', section: 'A' },
  { id: 'cls2', name: 'Nursery', section: 'B' },
  { id: 'cls3', name: 'LKG', section: 'A' },
];

const MOCK_STUDENTS: Student[] = [
  { id: 's1', full_name: 'Aarav Sharma', admission_number: 'ADM001', class_id: 'cls1' },
  { id: 's2', full_name: 'Priya Verma', admission_number: 'ADM002', class_id: 'cls1' },
  { id: 's3', full_name: 'Rohan Patel', admission_number: 'ADM003', class_id: 'cls1' },
];

export default function AttendancePage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('');
  const [attendance, setAttendance] = useState<Map<string, AttendanceRecord>>(new Map());
  const [view, setView] = useState<'daily' | 'monthly'>('daily');
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents(selectedClass);
      fetchAttendance(selectedClass, selectedDate);
    }
  }, [selectedClass, selectedDate]);

  useEffect(() => {
    if (view === 'monthly') {
      fetchMonthlyStats();
    }
  }, [view, selectedMonth]);

  const fetchClasses = async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase.from('classes').select('*').limit(10);
      if (data && data.length > 0) {
        setClasses(data);
        setSelectedClass(data[0].id);
      } else {
        setClasses(MOCK_CLASSES);
        setSelectedClass(MOCK_CLASSES[0].id);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      setClasses(MOCK_CLASSES);
      setSelectedClass(MOCK_CLASSES[0].id);
    }
  };

  const fetchStudents = async (classId: string) => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', classId)
        .limit(50);

      if (data && data.length > 0) {
        setStudents(data);
      } else {
        setStudents(MOCK_STUDENTS);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents(MOCK_STUDENTS);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async (classId: string, date: string) => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('attendance')
        .select('*')
        .eq('class_id', classId)
        .eq('date', date);

      const attendanceMap = new Map();
      if (data) {
        data.forEach(record => {
          attendanceMap.set(record.student_id, {
            student_id: record.student_id,
            status: record.status as 'present' | 'absent' | 'late',
          });
        });
      }
      setAttendance(attendanceMap);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const fetchMonthlyStats = async () => {
    try {
      const supabase = createClient();
      const startDate = `${selectedMonth}-01`;
      const endDate = `${selectedMonth}-31`;

      const { data: attendanceData } = await supabase
        .from('attendance')
        .select('student_id, class_id, status, date')
        .gte('date', startDate)
        .lte('date', endDate);

      const stats: Map<string, { present: number; total: number }> = new Map();

      if (attendanceData) {
        attendanceData.forEach(record => {
          if (!stats.has(record.class_id)) {
            stats.set(record.class_id, { present: 0, total: 0 });
          }
          const stat = stats.get(record.class_id)!;
          stat.total++;
          if (record.status === 'present') {
            stat.present++;
          }
        });
      }

      const monthlyData: MonthlyStats[] = classes.map(cls => {
        const stat = stats.get(cls.id);
        const percentage = stat ? Math.round((stat.present / stat.total) * 100) : 0;
        return {
          class_id: cls.id,
          class_name: `${cls.name} - ${cls.section}`,
          present_percentage: percentage,
          total_days: stat?.total || 0,
        };
      });

      setMonthlyStats(monthlyData);
    } catch (error) {
      console.error('Error fetching monthly stats:', error);
    }
  };

  const handleAttendanceChange = (studentId: string, status: 'present' | 'absent' | 'late' | null) => {
    const newAttendance = new Map(attendance);
    if (status === null) {
      newAttendance.delete(studentId);
    } else {
      newAttendance.set(studentId, { student_id: studentId, status });
    }
    setAttendance(newAttendance);
  };

  const handleSaveAttendance = async () => {
    try {
      const supabase = createClient();

      // Delete existing attendance for this date and class
      await supabase
        .from('attendance')
        .delete()
        .eq('class_id', selectedClass)
        .eq('date', selectedDate);

      // Insert new attendance records
      const records = Array.from(attendance.values()).map(record => ({
        student_id: record.student_id,
        class_id: selectedClass,
        date: selectedDate,
        status: record.status,
        marked_by: 'admin',
      }));

      if (records.length > 0) {
        await supabase.from('attendance').insert(records);
      }

      alert('Attendance saved successfully!');
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Error saving attendance');
    }
  };

  const getAttendanceStatus = (studentId: string): 'present' | 'absent' | 'late' | null => {
    return attendance.get(studentId)?.status || null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
          <p className="mt-4 text-gray-600">Loading attendance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-600 mt-1">Track daily and monthly attendance records</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === 'daily' ? 'default' : 'outline'}
            onClick={() => setView('daily')}
            className={view === 'daily' ? 'bg-amber-600 hover:bg-amber-700' : 'border-amber-200'}
          >
            Daily View
          </Button>
          <Button
            variant={view === 'monthly' ? 'default' : 'outline'}
            onClick={() => setView('monthly')}
            className={view === 'monthly' ? 'bg-amber-600 hover:bg-amber-700' : 'border-amber-200'}
          >
            Monthly Report
          </Button>
        </div>
      </div>

      {view === 'daily' ? (
        <>
          {/* Daily Attendance View */}
          <Card className="p-6 border-amber-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-amber-900">Select Date</Label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="mt-2 border-amber-200"
                />
              </div>
              <div>
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
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleSaveAttendance}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                >
                  Save Attendance
                </Button>
              </div>
            </div>
          </Card>

          {/* Attendance Table */}
          {students.length > 0 ? (
            <Card className="border-amber-200">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-amber-50">
                    <TableRow className="border-b-2 border-amber-200">
                      <TableHead className="text-amber-900 font-semibold">Admission #</TableHead>
                      <TableHead className="text-amber-900 font-semibold">Student Name</TableHead>
                      <TableHead className="text-amber-900 font-semibold">Present</TableHead>
                      <TableHead className="text-amber-900 font-semibold">Absent</TableHead>
                      <TableHead className="text-amber-900 font-semibold">Late</TableHead>
                      <TableHead className="text-amber-900 font-semibold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map(student => {
                      const status = getAttendanceStatus(student.id);
                      return (
                        <TableRow key={student.id} className="border-b border-amber-100 hover:bg-amber-50">
                          <TableCell className="font-mono font-semibold text-amber-700">
                            {student.admission_number}
                          </TableCell>
                          <TableCell className="font-semibold text-gray-900">
                            {student.full_name}
                          </TableCell>
                          <TableCell>
                            <Checkbox
                              checked={status === 'present'}
                              onCheckedChange={(checked) =>
                                handleAttendanceChange(student.id, checked ? 'present' : null)
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Checkbox
                              checked={status === 'absent'}
                              onCheckedChange={(checked) =>
                                handleAttendanceChange(student.id, checked ? 'absent' : null)
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Checkbox
                              checked={status === 'late'}
                              onCheckedChange={(checked) =>
                                handleAttendanceChange(student.id, checked ? 'late' : null)
                              }
                            />
                          </TableCell>
                          <TableCell>
                            {status && (
                              <Badge
                                className={`${
                                  status === 'present'
                                    ? 'bg-green-100 text-green-800'
                                    : status === 'absent'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </Card>
          ) : (
            <EmptyState
              title="No students found"
              description="Select a class to view and mark attendance"
            />
          )}
        </>
      ) : (
        <>
          {/* Monthly Report View */}
          <Card className="p-6 border-amber-200">
            <div className="flex items-end gap-4">
              <div>
                <Label className="text-amber-900">Select Month</Label>
                <Input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="mt-2 border-amber-200"
                />
              </div>
            </div>
          </Card>

          {/* Monthly Stats */}
          {monthlyStats.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {monthlyStats.map(stat => (
                <Card key={stat.class_id} className="p-6 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
                  <h3 className="text-xl font-bold text-amber-900 mb-4">{stat.class_name}</h3>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-white rounded-lg border border-amber-100">
                      <p className="text-sm text-gray-600 mb-1">Attendance Rate</p>
                      <p className="text-4xl font-bold text-amber-600">{stat.present_percentage}%</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="p-3 bg-white rounded border border-amber-100">
                        <p className="text-gray-600">Total Days</p>
                        <p className="text-lg font-semibold text-gray-900">{stat.total_days}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No attendance data"
              description="No attendance records found for the selected month"
            />
          )}
        </>
      )}
    </div>
  );
}
