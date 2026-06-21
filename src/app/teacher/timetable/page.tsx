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
  class?: { id: string; name: string; section: string };
  start_time: string;
  end_time: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function TimetablePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);

  useEffect(() => {
    const loadTimetable = async () => {
      try {
        setLoading(true);
        // This would typically load the teacher's timetable from a view or filtered query
        const { data, error } = await supabase
          .from('timetables')
          .select(
            `
            id,
            day_of_week,
            period_number,
            start_time,
            end_time,
            subjects:subject_id(id, name),
            classes:class_id(id, name, section)
          `
          )
          .order('day_of_week')
          .order('period_number');

        if (error) throw error;
        setTimetable(data || []);
      } catch (error) {
        console.error('Error loading timetable:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTimetable();
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

  const getClassName = (entry: TimetableEntry) => {
    const cls = Array.isArray(entry.class) ? entry.class[0] : entry.class;
    return `${cls?.name} ${cls?.section ? `- ${cls.section}` : ''}`;
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Timetable</h1>
        <p className="text-gray-600">Your weekly class schedule</p>
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
                              <p className="font-bold text-gray-900">
                                {getSubjectName(entry)}
                              </p>
                              <p className="text-sm text-gray-700 font-medium">
                                {getClassName(entry)}
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
                <span>Assigned Class</span>
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
          description="Your timetable is empty. Contact administration to schedule classes."
        />
      )}

      {/* Info Card */}
      <Card className="p-6 border-blue-200 bg-blue-50">
        <h3 className="font-bold text-blue-900 mb-3">Timetable Information</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex gap-2">
            <span className="text-blue-600">•</span>
            <span>Your classes are displayed in the grid above</span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-600">•</span>
            <span>Each cell shows the subject, class name, and timing</span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-600">•</span>
            <span>Contact administration if you need to change your schedule</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
