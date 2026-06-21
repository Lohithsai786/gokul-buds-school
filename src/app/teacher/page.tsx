'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/shared';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth-context';
import { Clock, Users, BookOpen, MessageSquare } from 'lucide-react';

interface AssignedClass {
  class_id: string;
  class_name: string;
  section: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export default function TeacherDashboard() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [assignedClasses, setAssignedClasses] = useState<AssignedClass[]>([]);
  const [studentCount, setStudentCount] = useState(0);
  const [presentToday, setPresentToday] = useState(0);
  const [homeworkCount, setHomeworkCount] = useState(0);
  const [announcementCount, setAnnouncementCount] = useState(0);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (authLoading || !user) return;
    const loadData = async () => {
      setLoading(true);
      try {
        // Find the teacher record.
        const { data: teacher } = await supabase
          .from('teachers')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!teacher) {
          setLoading(false);
          return;
        }

        // Class assignments for this teacher.
        const { data: assignments } = await supabase
          .from('class_teachers')
          .select('class_id, classes(id, name, section)')
          .eq('teacher_id', teacher.id);

        const classes = (assignments ?? [])
          .map((a: any) => a.classes)
          .filter(Boolean)
          .map((c: any) => ({
            class_id: c.id,
            class_name: c.name,
            section: c.section,
          }));
        setAssignedClasses(classes);

        const classIds = classes.map((c) => c.class_id);
        if (classIds.length === 0) {
          setLoading(false);
          return;
        }

        // Students in these classes.
        const { count: sCount } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true })
          .in('class_id', classIds);
        setStudentCount(sCount ?? 0);

        // Present today in these classes.
        const today = new Date().toISOString().slice(0, 10);
        const { count: pCount } = await supabase
          .from('attendance')
          .select('*', { count: 'exact', head: true })
          .in('class_id', classIds)
          .eq('date', today)
          .eq('status', 'present');
        setPresentToday(pCount ?? 0);

        // Homework count (homework created by this teacher).
        const { count: hwCount } = await supabase
          .from('homework')
          .select('*', { count: 'exact', head: true })
          .eq('teacher_id', teacher.id);
        setHomeworkCount(hwCount ?? 0);

        // Active announcements count.
        const { count: annCount } = await supabase
          .from('announcements')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);
        setAnnouncementCount(annCount ?? 0);

        // Recent announcements for the list.
        const { data: ann } = await supabase
          .from('announcements')
          .select('id, title, content, created_at')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(3);
        setAnnouncements((ann ?? []) as unknown as Announcement[]);
      } catch (err) {
        console.error('Teacher dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user, supabase, authLoading]);

  const stats = [
    {
      title: 'My Classes',
      value: String(assignedClasses.length),
      icon: <Clock className="w-6 h-6" />,
      color: 'amber' as const,
    },
    {
      title: 'My Students',
      value: String(studentCount),
      icon: <Users className="w-6 h-6" />,
      color: 'teal' as const,
      trend: { value: 0, isPositive: true },
    },
    {
      title: 'Present Today',
      value: String(presentToday),
      icon: <BookOpen className="w-6 h-6" />,
      color: 'coral' as const,
      trend: { value: 0, isPositive: true },
    },
    {
      title: 'Homework Posted',
      value: String(homeworkCount),
      icon: <MessageSquare className="w-6 h-6" />,
      color: 'blue' as const,
    },
  ];

  const quickShortcuts = [
    { label: 'Mark Attendance', icon: '✓', href: '/teacher/attendance' },
    { label: 'Post Homework', icon: '📝', href: '/teacher/homework' },
    { label: 'Class Group', icon: '💬', href: '/teacher/groups' },
    { label: 'Announcements', icon: '📋', href: '/teacher/announcements' },
  ];

  const formatTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">
          Welcome, {profile?.full_name?.split(' ')[0] ?? 'Teacher'}!
        </h1>
        <p className="text-gray-600 mt-1">
          {assignedClasses.length > 0
            ? `Assigned to: ${assignedClasses.map((c) => `${c.class_name} - ${c.section}`).join(', ')}`
            : 'No class assigned yet. Please contact the administrator.'}
        </p>
      </div>

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

      {/* Quick Shortcuts */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Shortcuts</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickShortcuts.map((shortcut, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2 border-2 hover:shadow-lg transition-all duration-200 group"
              onClick={() => router.push(shortcut.href)}
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">
                {shortcut.icon}
              </span>
              <span className="text-xs font-semibold text-center text-gray-700 group-hover:text-amber-600">
                {shortcut.label}
              </span>
            </Button>
          ))}
        </div>
      </div>

      {/* Assigned Classes */}
      {assignedClasses.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">My Classes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignedClasses.map((cls) => (
              <Card key={cls.class_id} className="p-5 border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
                <h3 className="text-lg font-bold text-gray-900">
                  {cls.class_name} - {cls.section}
                </h3>
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                    onClick={() => router.push('/teacher/attendance')}
                  >
                    Attendance
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-amber-300 text-amber-700"
                    onClick={() => router.push('/teacher/groups')}
                  >
                    Group
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 border-2 border-blue-200 bg-blue-50">
          <h3 className="text-lg font-bold text-blue-900 mb-3">Recent Announcements</h3>
          {announcements.length === 0 ? (
            <p className="text-sm text-blue-700">No announcements yet.</p>
          ) : (
            <ul className="space-y-2 text-sm text-blue-800">
              {announcements.map((a) => (
                <li key={a.id} className="flex gap-2">
                  <span className="text-blue-600">•</span>
                  <span>
                    <strong>{a.title}</strong> — {a.content?.slice(0, 80)}
                    {a.content && a.content.length > 80 ? '…' : ''}
                    <span className="text-xs text-blue-500 ml-1">({formatTime(a.created_at)})</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card className="p-6 border-2 border-green-200 bg-green-50">
          <h3 className="text-lg font-bold text-green-900 mb-3">Class Summary</h3>
          <ul className="space-y-2 text-sm text-green-800">
            <li className="flex gap-2">
              <span className="text-green-600">•</span>
              <span>{studentCount} students across {assignedClasses.length} class(es)</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-600">•</span>
              <span>{presentToday} students present today</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-600">•</span>
              <span>{homeworkCount} homework assignments posted</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-600">•</span>
              <span>{announcementCount} active announcements school-wide</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
