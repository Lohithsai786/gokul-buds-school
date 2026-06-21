'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/shared';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth-context';
import { TrendingUp, DollarSign, Calendar, BookOpen } from 'lucide-react';

interface ChildInfo {
  student_id: string;
  name: string;
  class_name: string;
  admission_no: string;
  teacher_name: string;
  attendance_rate: number;
  recent_grade: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  created_at: string;
}

export default function ParentDashboard() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [child, setChild] = useState<ChildInfo | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [pendingFees, setPendingFees] = useState<number>(0);
  const [pendingHomework, setPendingHomework] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (authLoading || !user) return;
    const loadData = async () => {
      setLoading(true);
      try {
        // Find the parent record + their child.
        const { data: parent } = await supabase
          .from('parents')
          .select('id, student_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!parent || !parent.student_id) {
          setChild(null);
          setLoading(false);
          return;
        }

        // Fetch the student + class + class teacher.
        const { data: studentData } = await supabase
          .from('students')
          .select('id, full_name, admission_number, class_id, classes(id, name, section)')
          .eq('id', parent.student_id)
          .maybeSingle();

        if (!studentData) {
          setChild(null);
          setLoading(false);
          return;
        }

        // Find the class teacher for this class.
        let teacherName = 'Not assigned';
        if (studentData.class_id) {
          const { data: ct } = await supabase
            .from('class_teachers')
            .select('teachers(user_id)')
            .eq('class_id', studentData.class_id)
            .eq('is_class_teacher', true)
            .maybeSingle();
          if (ct?.teachers?.user_id) {
            const { data: teacherUser } = await supabase
              .from('users')
              .select('full_name')
              .eq('id', ct.teachers.user_id)
              .maybeSingle();
            if (teacherUser?.full_name) teacherName = teacherUser.full_name;
          }
        }

        // Attendance rate for this student.
        const { count: totalDays } = await supabase
          .from('attendance')
          .select('*', { count: 'exact', head: true })
          .eq('student_id', studentData.id);
        const { count: presentDays } = await supabase
          .from('attendance')
          .select('*', { count: 'exact', head: true })
          .eq('student_id', studentData.id)
          .eq('status', 'present');
        const attendanceRate =
          totalDays && totalDays > 0 ? Math.round(((presentDays ?? 0) / totalDays) * 100) : 0;

        const cls = (studentData as any).classes;
        setChild({
          student_id: studentData.id,
          name: studentData.full_name,
          class_name: cls ? `${cls.name} - ${cls.section}` : 'N/A',
          admission_no: studentData.admission_number,
          teacher_name: teacherName,
          attendance_rate: attendanceRate,
          recent_grade: '—',
        });

        // Pending homework count for this class.
        if (studentData.class_id) {
          const { count: hwCount } = await supabase
            .from('homework')
            .select('*', { count: 'exact', head: true })
            .eq('class_id', studentData.class_id);
          setPendingHomework(hwCount ?? 0);
        }

        // Announcements for this parent.
        const { data: ann } = await supabase
          .from('announcements')
          .select('id, title, content, type, created_at')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(5);
        setAnnouncements((ann ?? []) as unknown as Announcement[]);
      } catch (err) {
        console.error('Parent dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user, supabase, authLoading]);

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500" />
      </div>
    );
  }

  const stats = [
    {
      title: 'Attendance Rate',
      value: child ? `${child.attendance_rate}%` : '—',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'green' as const,
      trend: { value: 0, isPositive: true },
    },
    {
      title: 'Pending Fees',
      value: `₹${pendingFees}`,
      icon: <DollarSign className="w-6 h-6" />,
      color: 'coral' as const,
      trend: { value: 0, isPositive: false },
    },
    {
      title: 'Announcements',
      value: String(announcements.length),
      icon: <Calendar className="w-6 h-6" />,
      color: 'purple' as const,
    },
    {
      title: 'Pending Homework',
      value: String(pendingHomework),
      icon: <BookOpen className="w-6 h-6" />,
      color: 'blue' as const,
      trend: { value: 0, isPositive: false },
    },
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'homework':
        return '📝';
      case 'attendance':
        return '✓';
      case 'event':
        return '🎉';
      case 'fee':
        return '💰';
      case 'report':
        return '📊';
      default:
        return '📢';
    }
  };

  const formatTimestamp = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-gray-900">
        Welcome, {profile?.full_name?.split(' ')[0] ?? 'Parent'}!
      </h1>

      {/* Stats Cards */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
      </div>

      {/* Child Info Card */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Child Information</h2>
        <Card className="p-6 border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
          {child ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wider font-semibold">Student Name</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{child.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wider font-semibold">Class</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{child.class_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wider font-semibold">Admission No.</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{child.admission_no}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wider font-semibold">Class Teacher</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{child.teacher_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wider font-semibold">Attendance</p>
                  <p className="text-lg font-bold text-green-600 mt-1">{child.attendance_rate}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wider font-semibold">Performance</p>
                  <p className="text-lg font-bold text-amber-600 mt-1">{child.recent_grade}</p>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-amber-200">
                <Button
                  className="bg-amber-500 hover:bg-amber-600 text-white mr-3"
                  onClick={() => router.push('/parent/profile')}
                >
                  View Full Profile
                </Button>
                <Button
                  variant="outline"
                  className="border-amber-300 text-amber-600"
                  onClick={() => router.push('/parent/messages')}
                >
                  Contact Teacher
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">
                No student is linked to your account yet. Please contact the school administrator.
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Recent Notifications */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Announcements</h2>
        <div className="space-y-3">
          {announcements.length === 0 ? (
            <Card className="p-4 border-2 border-gray-200">
              <p className="text-sm text-gray-500 text-center">No announcements yet.</p>
            </Card>
          ) : (
            announcements.map((notification) => (
              <Card
                key={notification.id}
                className="p-4 border-2 border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4">
                  <div className="text-3xl flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{notification.content}</p>
                    <p className="text-xs text-gray-500 mt-2">{formatTimestamp(notification.created_at)}</p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Button
          variant="outline"
          className="border-2 h-16 flex flex-col gap-2"
          onClick={() => router.push('/parent/messages')}
        >
          <span className="text-2xl">📞</span>
          <span className="text-xs font-semibold">Contact School</span>
        </Button>
        <Button
          variant="outline"
          className="border-2 h-16 flex flex-col gap-2"
          onClick={() => router.push('/parent/timetable')}
        >
          <span className="text-2xl">📋</span>
          <span className="text-xs font-semibold">View Schedule</span>
        </Button>
        <Button
          variant="outline"
          className="border-2 h-16 flex flex-col gap-2"
          onClick={() => router.push('/parent/groups')}
        >
          <span className="text-2xl">📸</span>
          <span className="text-xs font-semibold">Class Photos</span>
        </Button>
        <Button
          variant="outline"
          className="border-2 h-16 flex flex-col gap-2"
          onClick={() => router.push('/teacher/announcements')}
        >
          <span className="text-2xl">📢</span>
          <span className="text-xs font-semibold">Announcements</span>
        </Button>
      </div>
    </div>
  );
}
