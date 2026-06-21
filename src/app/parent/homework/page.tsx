'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared';
import { BookOpen, Download, Calendar } from 'lucide-react';

interface Homework {
  id: string;
  title: string;
  description: string;
  subject_id: string;
  class_id: string;
  due_date: string;
  created_at: string;
  subject?: { id: string; name: string };
  class?: { id: string; name: string; section: string };
  files?: Array<{ id: string; file_name: string; file_url: string }>;
}

interface Student {
  id: string;
  full_name: string;
  class_id: string;
}

export default function HomeworkPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  const [student, setStudent] = useState<Student | null>(null);

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
            // Get homework for student's class
            const { data: homeworkData } = await supabase
              .from('homework')
              .select(
                `
                id,
                title,
                description,
                subject_id,
                class_id,
                due_date,
                created_at,
                subjects:subject_id(id, name),
                classes:class_id(id, name, section),
                homework_files(id, file_name, file_url)
              `
              )
              .eq('class_id', studentData.class_id)
              .order('due_date', { ascending: true });

            setHomeworkList(homeworkData || []);
          }
        }
      } catch (error) {
        console.error('Error loading homework:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [supabase]);

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const daysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getSubjectName = (homework: Homework) => {
    return Array.isArray(homework.subject)
      ? homework.subject[0]?.name
      : homework.subject?.name;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block mb-4">
            <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600">Loading homework...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Homework</h1>
        {student && (
          <p className="text-gray-600">For {student.full_name}</p>
        )}
      </div>

      {/* Homework List */}
      {homeworkList.length > 0 ? (
        <div className="space-y-4">
          {homeworkList.map((homework) => {
            const daysLeft = daysUntilDue(homework.due_date);
            const subjectName = getSubjectName(homework);

            return (
              <Card
                key={homework.id}
                className="p-6 border-amber-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {homework.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {subjectName}
                    </p>
                  </div>
                </div>

                {homework.description && (
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {homework.description}
                  </p>
                )}

                {/* Due Date */}
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Due: {new Date(homework.due_date).toLocaleDateString()}
                  </span>
                  {isOverdue(homework.due_date) ? (
                    <Badge className="bg-red-100 text-red-700 border-red-200">
                      Overdue
                    </Badge>
                  ) : daysLeft === 0 ? (
                    <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                      Due Today
                    </Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      {daysLeft} days left
                    </Badge>
                  )}
                </div>

                {/* Files */}
                {homework.files && homework.files.length > 0 && (
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <p className="text-sm font-semibold text-gray-700 mb-3">
                      Files & Resources:
                    </p>
                    <div className="space-y-2">
                      {homework.files.map((file) => (
                        <a
                          key={file.id}
                          href={file.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-2 bg-white rounded hover:bg-amber-100 transition-colors"
                        >
                          <Download className="w-5 h-5 text-amber-600" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-amber-600 hover:text-amber-700">
                              {file.file_name}
                            </p>
                          </div>
                          <span className="text-xs text-gray-600">↓</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<BookOpen className="w-8 h-8" />}
          title="No Homework Assigned"
          description="No homework has been assigned yet. Check back soon!"
        />
      )}

      {/* Info Card */}
      {homeworkList.length > 0 && (
        <Card className="p-6 border-blue-200 bg-blue-50">
          <h3 className="font-bold text-blue-900 mb-3">Homework Tips</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex gap-2">
              <span className="text-blue-600">•</span>
              <span>Download and review all attached files</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600">•</span>
              <span>Plan ahead to complete homework before the due date</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600">•</span>
              <span>Contact the teacher if clarifications are needed</span>
            </li>
          </ul>
        </Card>
      )}
    </div>
  );
}
