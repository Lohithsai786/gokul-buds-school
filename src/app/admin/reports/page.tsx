'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { StatsCard } from '@/components/shared';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, GraduationCap, BookOpen, CheckSquare, IndianRupee, TrendingUp } from 'lucide-react';

interface ClassEnrollment {
  class_id: string;
  class_name: string;
  section: string;
  student_count: number;
  teacher_name: string | null;
}

export default function AdminReportsPage() {
  const [totals, setTotals] = useState({
    students: 0,
    teachers: 0,
    parents: 0,
    classes: 0,
    attendanceRate: 0,
    feesCollected: 0,
  });
  const [enrollments, setEnrollments] = useState<ClassEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [studentsRes, teachersRes, parentsRes, classesRes] = await Promise.all([
        supabase.from('students').select('*', { count: 'exact', head: true }),
        supabase.from('teachers').select('*', { count: 'exact', head: true }),
        supabase.from('parents').select('*', { count: 'exact', head: true }),
        supabase.from('classes').select('*', { count: 'exact', head: true }),
      ]);

      // Attendance for today.
      const today = new Date().toISOString().slice(0, 10);
      const { count: presentToday } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .eq('date', today)
        .eq('status', 'present');
      const { count: totalToday } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .eq('date', today);

      // Fees collected.
      const { data: payments } = await supabase
        .from('payments')
        .select('amount_paid');

      const feesCollected = (payments ?? []).reduce(
        (sum: number, p: any) => sum + Number(p.amount_paid ?? 0),
        0
      );

      const rate = totalToday && totalToday > 0 ? Math.round(((presentToday ?? 0) / totalToday) * 100) : 0;

      setTotals({
        students: studentsRes.count ?? 0,
        teachers: teachersRes.count ?? 0,
        parents: parentsRes.count ?? 0,
        classes: classesRes.count ?? 0,
        attendanceRate: rate,
        feesCollected,
      });

      // Class enrollments with assigned teacher.
      const { data: studentsByClass } = await supabase
        .from('students')
        .select('class_id, classes(id, name, section)')
        .not('class_id', 'is', null);

      const { data: classTeachers } = await supabase
        .from('class_teachers')
        .select('class_id, teachers(user_id), teachers.users(full_name)')
        .eq('is_class_teacher', true);

      const teacherMap: Record<string, string> = {};
      for (const ct of (classTeachers ?? []) as any[]) {
        if (ct.class_id && ct.teachers?.users?.full_name) {
          teacherMap[ct.class_id] = ct.teachers.users.full_name;
        }
      }

      const counts: Record<string, { name: string; section: string; count: number }> = {};
      for (const s of (studentsByClass ?? []) as any[]) {
        const cls = s.classes;
        if (!cls) continue;
        counts[cls.id] = counts[cls.id] || { name: cls.name, section: cls.section, count: 0 };
        counts[cls.id].count += 1;
      }

      const enrollments: ClassEnrollment[] = Object.entries(counts).map(([classId, info]) => ({
        class_id: classId,
        class_name: info.name,
        section: info.section,
        student_count: info.count,
        teacher_name: teacherMap[classId] ?? null,
      }));

      enrollments.sort((a, b) => a.class_name.localeCompare(b.class_name));
      setEnrollments(enrollments);
      setLoading(false);
    };
    load();
  }, [supabase]);

  const stats = [
    { title: 'Total Students', value: String(totals.students), icon: <GraduationCap className="w-6 h-6" />, color: 'amber' as const, trend: { value: 0, isPositive: true } },
    { title: 'Total Teachers', value: String(totals.teachers), icon: <BookOpen className="w-6 h-6" />, color: 'teal' as const, trend: { value: 0, isPositive: true } },
    { title: 'Total Parents', value: String(totals.parents), icon: <Users className="w-6 h-6" />, color: 'green' as const, trend: { value: 0, isPositive: true } },
    { title: 'Active Classes', value: String(totals.classes), icon: <TrendingUp className="w-6 h-6" />, color: 'blue' as const, trend: { value: 0, isPositive: true } },
    { title: 'Attendance Today', value: `${totals.attendanceRate}%`, icon: <CheckSquare className="w-6 h-6" />, color: 'coral' as const, trend: { value: 0, isPositive: true } },
    { title: 'Fees Collected', value: `₹${totals.feesCollected.toLocaleString('en-IN')}`, icon: <IndianRupee className="w-6 h-6" />, color: 'purple' as const, trend: { value: 0, isPositive: true } },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600 mt-1">School-wide overview and class enrollment</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            trend={stat.trend}
          />
        ))}
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Class Enrollments</h2>
        <Card className="border-amber-200">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-amber-50">
                <TableRow className="border-b-2 border-amber-200">
                  <TableHead className="text-amber-900 font-semibold">Class</TableHead>
                  <TableHead className="text-amber-900 font-semibold">Section</TableHead>
                  <TableHead className="text-amber-900 font-semibold">Assigned Teacher</TableHead>
                  <TableHead className="text-amber-900 font-semibold">Students</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                      No enrollments yet.
                    </TableCell>
                  </TableRow>
                )}
                {enrollments.map((e) => (
                  <TableRow key={e.class_id} className="border-b border-amber-100 hover:bg-amber-50">
                    <TableCell className="font-semibold text-gray-900">{e.class_name}</TableCell>
                    <TableCell className="text-gray-700">{e.section}</TableCell>
                    <TableCell className="text-gray-700">
                      {e.teacher_name ?? <Badge className="bg-gray-100 text-gray-800">Unassigned</Badge>}
                    </TableCell>
                    <TableCell className="text-gray-700 font-semibold">{e.student_count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}
