'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared';
import { Clock } from 'lucide-react';

interface TimetableEntry {
  id: string;
  day_of_week: number;
  period_number: number;
  subject?: { id: string; name: string };
  teacher_id?: string;
  start_time: string;
  end_time: string;
}

interface Student {
  id: string;
  full_name: string;
  class_id: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function TimetablePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<Student | null>(null);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Get parent's student
        const { data: parentData } = await supabase
          .from('parents')
          .select('student_id')
          .limit(1)
          .single();

        if (parentData?.student_id) {
          // Get student info
          const { data: studentData } = await supabase
            .from('students')
            .select('id, full_name, class_id')
            .eq('id', parentData.student_id)
            .single();

          setStudent(studentData);

          if (studentData?.class_id) {
            // Get timetable for student's class
            const { data: timetableData } = await supabase
              .from('timetables')
              .select(
                `
                id,
                day_of_week,
                period_number,
                teacher_id,
                start_time,
                end_time,
                subjects:subject_id(id, name)
              `
              )
              .eq('class_id', studentData.class_id)
              .order('day_of_week')
              .order('period_number');

            setTimetable(timetableData || []);
          }
        }
      } catch (error) {
        console.error('Error loading timetable:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [supabase]);

  const getTimetableForPeriod = (day: number, period: number) => {
    return timetable.find(
      (t) => t.day_of_week === day && t.period_number === period
    );
  };

  const getSubjectName = (entry: TimetableEntry) => {
    return Array.isArray(entry.subject)
      ? entry.subject[0]?.name
      : entry.subject?.name;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block mb-4">
            <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600">Loading timetable...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <EmptyState
        icon={<Clock className="w-8 h-8" />}
        title="No Student Linked"
        description="No student linked to your account. Please contact administration."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Class Timetable</h1>
        <p className="text-gray-600">Weekly schedule for {student.full_name}</p>
      </div>

      {/* Timetable */}
      {timetable.length > 0 ? (
        <Card className="border-amber-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-amber-100 to-orange-100 border-b-2 border-amber-200">
                <tr>
                  <th className="p-3 text-left font-bold text-gray-700">Period</th>
                  {DAYS.map((day) => (
                    <th
                      key={day}
                      className="p-3 text-center font-bold text-gray-700 border-l border-amber-200"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERIODS.map((period) => (
                  <tr key={period} className="border-b border-amber-100 hover:bg-amber-50">
                    <td className="p-3 font-semibold text-amber-700 bg-amber-50">
                      Period {period}
                    </td>
                    {DAYS.map((_, dayIndex) => {
                      const entry = getTimetableForPeriod(dayIndex, period);
                      return (
                        <td
                          key={dayIndex}
                          className="p-3 border-l border-amber-200 align-top min-w-[180px]"
                        >
                          {entry ? (
                            <div className="bg-gradient-to-br from-amber-100 to-orange-100 p-3 rounded-lg border border-amber-300">
                              <p className="font-bold text-gray-900 text-sm">
                                {getSubjectName(entry)}
                              </p>
                              <div className="flex items-center gap-1 mt-2 text-xs text-gray-600">
                                <Clock className="w-3 h-3" />
                                <span>
                                  {entry.start_time} - {entry.end_time}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-gray-400 text-center py-4">-</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="p-4 bg-amber-50 border-t border-amber-200">
            <p className="text-sm font-semibold text-gray-700 mb-2">Legend:</p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-300 rounded"></div>
                <span>Scheduled Class</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 text-gray-400">-</div>
                <span>No Class</span>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <EmptyState
          icon={<Clock className="w-8 h-8" />}
          title="No Classes Scheduled"
          description="The class timetable is not yet available. Check back soon."
        />
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 border-blue-200 bg-blue-50">
          <h3 className="font-bold text-blue-900 mb-3">Timetable Information</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex gap-2">
              <span className="text-blue-600">•</span>
              <span>Each period is a scheduled class session</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600">•</span>
              <span>Times show the start and end of each class</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600">•</span>
              <span>Ensure your child attends all scheduled classes</span>
            </li>
          </ul>
        </Card>

        <Card className="p-6 border-green-200 bg-green-50">
          <h3 className="font-bold text-green-900 mb-3">School Timings</h3>
          <div className="space-y-2 text-sm text-green-800">
            <div className="flex items-center justify-between p-2 bg-white rounded border border-green-200">
              <span className="font-semibold">School Opens</span>
              <Badge className="bg-green-100 text-green-700 border-green-200">
                8:00 AM
              </Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-white rounded border border-green-200">
              <span className="font-semibold">Lunch Break</span>
              <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                12:00 PM - 1:00 PM
              </Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-white rounded border border-green-200">
              <span className="font-semibold">School Closes</span>
              <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                3:30 PM
              </Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
