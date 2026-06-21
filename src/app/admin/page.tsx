'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/shared';
import { useAuth } from '@/contexts/auth-context';
import { createClient } from '@/lib/supabase';
import {
  Users,
  BookOpen,
  MessageSquare,
  Mail,
  Inbox,
  TrendingUp,
  AlertCircle,
  Calendar,
  Trash2,
  Download,
} from 'lucide-react';

type Inquiry = {
  id: string;
  parent_name: string;
  email: string;
  phone: string;
  child_name: string;
  child_age: string;
  program: string;
  message: string | null;
  created_at: string;
};

type ContactSubmission = {
  id: string;
  full_name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
};

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [students, setStudents] = useState(0);
  const [teachers, setTeachers] = useState(0);
  const [parents, setParents] = useState(0);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [classesCount, setClassesCount] = useState(0);

  const supabase = createClient();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [studentsRes, teachersRes, parentsRes, classesRes, inquiriesRes, contactsRes] = await Promise.all([
        supabase.from('students').select('*', { count: 'exact', head: true }),
        supabase.from('teachers').select('*', { count: 'exact', head: true }),
        supabase.from('parents').select('*', { count: 'exact', head: true }),
        supabase.from('classes').select('*', { count: 'exact', head: true }),
        supabase.from('admission_inquiries').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('contact_submissions').select('*').order('created_at', { ascending: false }).limit(10),
      ]);
      setStudents(studentsRes.count ?? 0);
      setTeachers(teachersRes.count ?? 0);
      setParents(parentsRes.count ?? 0);
      setClassesCount(classesRes.count ?? 0);
      setInquiries(inquiriesRes.data ?? []);
      setContacts(contactsRes.data ?? []);
      setLoading(false);
    };
    loadData();
  }, [supabase]);

  const deleteInquiry = async (id: string) => {
    await supabase.from('admission_inquiries').delete().eq('id', id);
    setInquiries((prev) => prev.filter((i) => i.id !== id));
  };

  const deleteContact = async (id: string) => {
    await supabase.from('contact_submissions').delete().eq('id', id);
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const exportInquiries = () => {
    const csv = [
      ['Parent Name', 'Email', 'Phone', 'Child Name', 'Child Age', 'Program', 'Message', 'Created At'],
      ...inquiries.map((i) => [
        i.parent_name,
        i.email,
        i.phone,
        i.child_name,
        i.child_age,
        i.program,
        i.message ?? '',
        new Date(i.created_at).toLocaleString(),
      ]),
    ]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'admission_inquiries.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = [
    {
      title: 'Total Students',
      value: String(students),
      icon: <Users className="w-6 h-6" />,
      color: 'amber' as const,
      trend: { value: 0, isPositive: true },
    },
    {
      title: 'Total Teachers',
      value: String(teachers),
      icon: <BookOpen className="w-6 h-6" />,
      color: 'teal' as const,
      trend: { value: 0, isPositive: true },
    },
    {
      title: 'Total Parents',
      value: String(parents),
      icon: <Users className="w-6 h-6" />,
      color: 'green' as const,
      trend: { value: 0, isPositive: true },
    },
    {
      title: 'Admissions',
      value: String(inquiries.length),
      icon: <Inbox className="w-6 h-6" />,
      color: 'blue' as const,
      trend: { value: 0, isPositive: true },
    },
    {
      title: 'Contact Inquiries',
      value: String(contacts.length),
      icon: <Mail className="w-6 h-6" />,
      color: 'coral' as const,
      trend: { value: 0, isPositive: true },
    },
    {
      title: 'Active Classes',
      value: String(classesCount),
      icon: <Calendar className="w-6 h-6" />,
      color: 'purple' as const,
      trend: { value: 0, isPositive: true },
    },
  ];

  const quickActions = [
    { label: 'Add Student', href: '/admin/students', icon: '👨‍🎓', color: 'from-blue-500 to-blue-600' },
    { label: 'Add Teacher', href: '/admin/teachers', icon: '👨‍🏫', color: 'from-purple-500 to-purple-600' },
    { label: 'Create Class', href: '/admin/classes', icon: '🏫', color: 'from-green-500 to-green-600' },
    { label: 'Send Message', href: '/admin/messages', icon: '💬', color: 'from-pink-500 to-pink-600' },
    { label: 'View Reports', href: '/admin/exams', icon: '📊', color: 'from-orange-500 to-orange-600' },
    { label: 'Fee Management', href: '/admin/fees', icon: '💰', color: 'from-yellow-500 to-yellow-600' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="inline-block w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {profile?.full_name ?? 'Admin'}
        </h1>
        <p className="text-gray-500 mt-1">Manage your school efficiently from here.</p>
      </div>

      {/* Stats */}
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

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              onClick={() => (window.location.href = action.href)}
              className="h-24 flex flex-col items-center justify-center gap-2 border-2 hover:shadow-lg transition-all duration-200 group cursor-pointer"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">{action.icon}</span>
              <span className="text-xs font-semibold text-center text-gray-700 group-hover:text-amber-600">
                {action.label}
              </span>
            </Button>
          ))}
        </div>
      </div>

      {/* Admission Inquiries */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Admission Inquiries</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportInquiries}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </div>
        <Card className="overflow-hidden border-2 border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Parent</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Phone</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Child</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Program</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {inquiries.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      No admission inquiries yet.
                    </td>
                  </tr>
                )}
                {inquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{inquiry.parent_name}</td>
                    <td className="px-4 py-3 text-gray-600">{inquiry.email}</td>
                    <td className="px-4 py-3 text-gray-600">{inquiry.phone}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {inquiry.child_name} ({inquiry.child_age}y)
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold capitalize">
                        {inquiry.program}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(inquiry.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteInquiry(inquiry.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Contact Inquiries */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Inquiries</h2>
        <Card className="overflow-hidden border-2 border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Subject</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Message</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {contacts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No contact inquiries yet.
                    </td>
                  </tr>
                )}
                {contacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{contact.full_name}</td>
                    <td className="px-4 py-3 text-gray-600">{contact.email}</td>
                    <td className="px-4 py-3 text-gray-600">{contact.subject}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{contact.message}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(contact.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteContact(contact.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
