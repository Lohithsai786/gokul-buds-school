'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared';
import { Calendar, AlertCircle } from 'lucide-react';

interface AttendanceRecord {
  id: string;
  student_id: string;
  class_id: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  remarks?: string;
  created_at: string;
}

interface Student {
  id: string;
  full_name: string;
  admission_number: string;
  class_id: string;
  avatar_url?: string;
}

export default function AttendancePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<Student | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Get parent's student (assuming one parent-student relationship)
        // In a real app, this would get the parent's user ID from auth
        const { data: parentData } = await supabase
          .from('parents')
          .select('student_id')
          .limit(1)
          .single();

        if (parentData?.student_id) {
          // Get student info
          const { data: studentData } = await supabase
            .from('students')
            .select('id, full_name, admission_number, class_id, avatar_url')
            .eq('id', parentData.student_id)
            .single();

          setStudent(studentData);

          // Get attendance records
          const { data: attendanceData } = await supabase
            .from('attendance')
            .select('*')
            .eq('student_id', parentData.student_id)
            .order('date', { ascending: false });

          setAttendanceRecords(attendanceData || []);
        }
      } catch (error) {
        console.error('Error loading attendance:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [supabase]);

  const currentMonth = selectedMonth.getMonth();
  const currentYear = selectedMonth.getFullYear();

  const getMonthlyAttendance = () => {
    return attendanceRecords.filter((record) => {
      const recordDate = new Date(record.date);
      return (
        recordDate.getMonth() === currentMonth &&
        recordDate.getFullYear() === currentYear
      );
    });
  };

  const monthlyAttendance = getMonthlyAttendance();
  const presentDays = monthlyAttendance.filter(
    (r) => r.status === 'present'
  ).length;
  const absentDays = monthlyAttendance.filter(
    (r) => r.status === 'absent'
  ).length;
  const lateDays = monthlyAttendance.filter((r) => r.status === 'late').length;
  const totalAttendanceMarked = monthlyAttendance.length;

  const attendancePercentage =
    totalAttendanceMarked > 0
      ? Math.round((presentDays / totalAttendanceMarked) * 100)
      : 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Present</Badge>;
      case 'absent':
        return <Badge className="bg-red-100 text-red-700 border-red-200">Absent</Badge>;
      case 'late':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Late</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getDateColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'absent':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'late':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Get calendar days for the month
  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const calendarDays: Array<{ date: number; record?: AttendanceRecord }> = [];

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push({ date: 0 });
  }

  // Add days of the month
  const maxDays = daysInMonth(selectedMonth);
  for (let day = 1; day <= maxDays; day++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const record = monthlyAttendance.find((r) => r.date === dateStr);
    calendarDays.push({ date: day, record });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block mb-4">
            <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600">Loading attendance...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <EmptyState
        icon={<Calendar className="w-8 h-8" />}
        title="No Student Linked"
        description="No student linked to your account. Please contact administration."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Attendance</h1>
        <p className="text-gray-600">
          {student.full_name} - {student.admission_number}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
          <div className="text-sm font-semibold text-gray-700 mb-2">Attendance %</div>
          <div className="text-4xl font-bold text-amber-600">{attendancePercentage}%</div>
          <p className="text-xs text-gray-600 mt-2">This month</p>
        </Card>

        <Card className="p-6 border-green-200 bg-gradient-to-br from-green-50 to-teal-50">
          <div className="text-sm font-semibold text-gray-700 mb-2">Present</div>
          <div className="text-4xl font-bold text-green-600">{presentDays}</div>
          <p className="text-xs text-gray-600 mt-2">Days</p>
        </Card>

        <Card className="p-6 border-red-200 bg-gradient-to-br from-red-50 to-pink-50">
          <div className="text-sm font-semibold text-gray-700 mb-2">Absent</div>
          <div className="text-4xl font-bold text-red-600">{absentDays}</div>
          <p className="text-xs text-gray-600 mt-2">Days</p>
        </Card>

        <Card className="p-6 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
          <div className="text-sm font-semibold text-gray-700 mb-2">Late</div>
          <div className="text-4xl font-bold text-yellow-600">{lateDays}</div>
          <p className="text-xs text-gray-600 mt-2">Days</p>
        </Card>
      </div>

      {/* Month Selector */}
      <Card className="p-4 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">
            {selectedMonth.toLocaleString('default', {
              month: 'long',
              year: 'numeric',
            })}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const newDate = new Date(selectedMonth);
                newDate.setMonth(newDate.getMonth() - 1);
                setSelectedMonth(newDate);
              }}
              className="px-3 py-1 rounded bg-white border border-amber-300 hover:bg-amber-100 text-sm font-medium text-gray-700"
            >
              Prev
            </button>
            <button
              onClick={() => setSelectedMonth(new Date())}
              className="px-3 py-1 rounded bg-white border border-amber-300 hover:bg-amber-100 text-sm font-medium text-amber-600"
            >
              Today
            </button>
            <button
              onClick={() => {
                const newDate = new Date(selectedMonth);
                newDate.setMonth(newDate.getMonth() + 1);
                setSelectedMonth(newDate);
              }}
              className="px-3 py-1 rounded bg-white border border-amber-300 hover:bg-amber-100 text-sm font-medium text-gray-700"
            >
              Next
            </button>
          </div>
        </div>
      </Card>

      {/* Calendar */}
      <Card className="p-6 border-amber-200">
        <div className="mb-4">
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="text-center font-bold text-gray-700 text-sm p-2"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((dayObj, idx) => (
              <div key={idx} className="aspect-square">
                {dayObj.date === 0 ? (
                  <div className="w-full h-full bg-gray-50 rounded"></div>
                ) : dayObj.record ? (
                  <div
                    className={`w-full h-full rounded flex flex-col items-center justify-center border-2 font-bold text-sm cursor-pointer transition-all hover:shadow-md ${getDateColor(
                      dayObj.record.status
                    )}`}
                    title={dayObj.record.remarks || dayObj.record.status}
                  >
                    <span>{dayObj.date}</span>
                    <span className="text-xs mt-0.5">
                      {dayObj.record.status === 'present'
                        ? 'P'
                        : dayObj.record.status === 'absent'
                        ? 'A'
                        : 'L'}
                    </span>
                  </div>
                ) : (
                  <div className="w-full h-full rounded border-2 border-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                    {dayObj.date}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 p-4 bg-amber-50 rounded border border-amber-200">
          <p className="text-sm font-semibold text-gray-700 mb-3">Legend:</p>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-100 border-2 border-green-300 rounded flex items-center justify-center text-xs font-bold text-green-700">
                P
              </div>
              <span className="text-gray-700">Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-red-100 border-2 border-red-300 rounded flex items-center justify-center text-xs font-bold text-red-700">
                A
              </div>
              <span className="text-gray-700">Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-yellow-100 border-2 border-yellow-300 rounded flex items-center justify-center text-xs font-bold text-yellow-700">
                L
              </div>
              <span className="text-gray-700">Late</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Recent Absences Warning */}
      {absentDays > 5 && (
        <Card className="p-4 border-red-300 bg-red-50 border-l-4 border-l-red-600">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900 mb-1">Attendance Alert</p>
              <p className="text-sm text-red-800">
                Your child has {absentDays} absences this month. Please contact the school if there are any concerns.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
