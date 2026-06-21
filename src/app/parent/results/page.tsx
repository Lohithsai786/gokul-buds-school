'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EmptyState } from '@/components/shared';
import { Award, Download, TrendingUp } from 'lucide-react';

interface Mark {
  id: string;
  exam_id: string;
  student_id: string;
  marks_obtained: number;
  grade: string;
  remarks?: string;
  exam?: { id: string; name: string; total_marks: number };
}

interface Exam {
  id: string;
  name: string;
  class_id: string;
  subject_id: string;
  exam_date: string;
  total_marks: number;
  marks?: Mark[];
  subject?: { id: string; name: string };
}

interface ReportCard {
  id: string;
  student_id: string;
  exam_name: string;
  academic_year: string;
  total_marks: number;
  percentage: number;
  grade: string;
  remarks?: string;
  file_url?: string;
  created_at: string;
}

interface Student {
  id: string;
  full_name: string;
}

export default function ResultsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<Student | null>(null);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [reportCards, setReportCards] = useState<ReportCard[]>([]);

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
            .select('id, full_name')
            .eq('id', parentData.student_id)
            .single();

          setStudent(studentData);

          // Get exam marks
          const { data: marksData } = await supabase
            .from('marks')
            .select(
              `
              id,
              exam_id,
              student_id,
              marks_obtained,
              grade,
              remarks,
              exams:exam_id(id, name, total_marks),
              subjects:exam_id.subjects(id, name)
            `
            )
            .eq('student_id', parentData.student_id)
            .order('exams.exam_date', { ascending: false });

          setMarks(marksData || []);

          // Get report cards
          const { data: reportCardsData } = await supabase
            .from('report_cards')
            .select('*')
            .eq('student_id', parentData.student_id)
            .order('created_at', { ascending: false });

          setReportCards(reportCardsData || []);
        }
      } catch (error) {
        console.error('Error loading results:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [supabase]);

  const getGradeColor = (grade: string) => {
    if (!grade) return 'bg-gray-100 text-gray-700 border-gray-200';
    const g = grade.toUpperCase();
    if (g === 'A+' || g === 'A') {
      return 'bg-green-100 text-green-700 border-green-200';
    }
    if (g === 'B') {
      return 'bg-blue-100 text-blue-700 border-blue-200';
    }
    if (g === 'C') {
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
    return 'bg-orange-100 text-orange-700 border-orange-200';
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block mb-4">
            <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <EmptyState
        icon={<Award className="w-8 h-8" />}
        title="No Student Linked"
        description="No student linked to your account. Please contact administration."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Results & Reports</h1>
        <p className="text-gray-600">Exam scores and academic progress for {student.full_name}</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="marks" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-amber-100 p-1 rounded-lg">
          <TabsTrigger
            value="marks"
            className="rounded data-[state=active]:bg-white data-[state=active]:text-amber-600"
          >
            Exam Marks
          </TabsTrigger>
          <TabsTrigger
            value="reports"
            className="rounded data-[state=active]:bg-white data-[state=active]:text-amber-600"
          >
            Report Cards
          </TabsTrigger>
        </TabsList>

        {/* Exam Marks Tab */}
        <TabsContent value="marks" className="space-y-4">
          {marks.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="space-y-4">
                {marks.map((mark) => {
                  const exam = Array.isArray(mark.exam) ? mark.exam[0] : mark.exam;
                  const percentage = exam
                    ? Math.round((mark.marks_obtained / exam.total_marks) * 100)
                    : 0;

                  return (
                    <Card
                      key={mark.id}
                      className="p-6 border-amber-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900">
                            {exam?.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Exam
                          </p>
                        </div>
                        <Badge className={`text-lg font-bold py-1 px-3 border ${getGradeColor(mark.grade)}`}>
                          {mark.grade}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Marks</p>
                          <p className="text-2xl font-bold text-amber-600">
                            {mark.marks_obtained}/{exam?.total_marks}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Percentage</p>
                          <p className={`text-2xl font-bold ${getPerformanceColor(percentage)}`}>
                            {percentage}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Performance</p>
                          <div className="flex items-center gap-1 text-amber-600 font-semibold mt-1">
                            <TrendingUp className="w-5 h-5" />
                            {percentage >= 75 ? 'Excellent' : percentage >= 60 ? 'Good' : 'Fair'}
                          </div>
                        </div>
                      </div>

                      {mark.remarks && (
                        <div className="p-3 bg-blue-50 rounded border border-blue-200">
                          <p className="text-sm text-blue-900">
                            <span className="font-semibold">Teacher's Remark: </span>
                            {mark.remarks}
                          </p>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          ) : (
            <EmptyState
              icon={<Award className="w-8 h-8" />}
              title="No Exam Results"
              description="No exam results available yet. Check back after exams."
            />
          )}
        </TabsContent>

        {/* Report Cards Tab */}
        <TabsContent value="reports" className="space-y-4">
          {reportCards.length > 0 ? (
            <div className="space-y-4">
              {reportCards.map((report) => (
                <Card
                  key={report.id}
                  className="p-6 border-amber-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">
                        {report.exam_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Academic Year: {report.academic_year}
                      </p>
                    </div>
                    <Badge
                      className={`text-lg font-bold py-1 px-3 border ${getGradeColor(
                        report.grade
                      )}`}
                    >
                      {report.grade}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Total Marks</p>
                      <p className="text-2xl font-bold text-amber-600">
                        {report.total_marks}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Percentage</p>
                      <p
                        className={`text-2xl font-bold ${getPerformanceColor(
                          report.percentage
                        )}`}
                      >
                        {report.percentage.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Generated</p>
                      <p className="text-sm font-semibold text-gray-900 mt-2">
                        {new Date(report.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {report.remarks && (
                    <div className="p-3 bg-blue-50 rounded border border-blue-200 mb-4">
                      <p className="text-sm text-blue-900">
                        <span className="font-semibold">Comments: </span>
                        {report.remarks}
                      </p>
                    </div>
                  )}

                  {report.file_url && (
                    <Button
                      asChild
                      className="w-full gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                    >
                      <a
                        href={report.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="w-4 h-4" />
                        Download Report Card
                      </a>
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Award className="w-8 h-8" />}
              title="No Report Cards"
              description="Report cards will be available after the academic term ends."
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Summary Card */}
      {marks.length > 0 && (
        <Card className="p-6 border-green-200 bg-gradient-to-br from-green-50 to-teal-50">
          <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Academic Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-green-700 font-medium">Total Exams</p>
              <p className="text-2xl font-bold text-green-600">{marks.length}</p>
            </div>
            <div>
              <p className="text-sm text-green-700 font-medium">Average Grade</p>
              <p className="text-2xl font-bold text-green-600">
                {marks.length > 0
                  ? marks.reduce((sum, m) => sum + (m.grade?.charCodeAt(0) || 0), 0) / marks.length > 65
                    ? 'A'
                    : 'B'
                  : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-green-700 font-medium">Highest Score</p>
              <p className="text-2xl font-bold text-green-600">
                {marks.length > 0 ? Math.max(...marks.map((m) => m.marks_obtained)) : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-green-700 font-medium">Status</p>
              <p className="text-lg font-bold text-green-600">On Track</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
