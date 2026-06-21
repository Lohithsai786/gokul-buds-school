'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared';
import { Users, ChevronRight, X } from 'lucide-react';

interface Class {
  id: string;
  name: string;
  section: string;
  capacity: number;
  academic_year: string;
  students?: Student[];
  studentCount?: number;
}

interface Student {
  id: string;
  admission_number: string;
  full_name: string;
  date_of_birth: string;
  gender: string;
  status: string;
  avatar_url?: string;
}

export default function ClassesPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [classStudents, setClassStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // Load classes
  useEffect(() => {
    const loadClasses = async () => {
      try {
        setLoading(true);

        // Get classes
        const { data: classesData, error: classesError } = await supabase
          .from('classes')
          .select('id, name, section, capacity, academic_year')
          .order('name');

        if (classesError) throw classesError;

        // Get student counts for each class
        const classesWithCounts = await Promise.all(
          (classesData || []).map(async (cls) => {
            const { count } = await supabase
              .from('students')
              .select('*', { count: 'exact', head: true })
              .eq('class_id', cls.id)
              .eq('status', 'active');

            return {
              ...cls,
              studentCount: count || 0,
            };
          })
        );

        setClasses(classesWithCounts || []);
      } catch (error) {
        console.error('Error loading classes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadClasses();
  }, [supabase]);

  const handleViewClass = async (cls: Class) => {
    try {
      setLoadingStudents(true);
      setSelectedClass(cls);

      const { data, error } = await supabase
        .from('students')
        .select('id, admission_number, full_name, date_of_birth, gender, status, avatar_url')
        .eq('class_id', cls.id)
        .eq('status', 'active')
        .order('full_name');

      if (error) throw error;
      setClassStudents(data || []);
      setShowDetailsDialog(true);
    } catch (error) {
      console.error('Error loading students:', error);
      alert('Failed to load student list');
    } finally {
      setLoadingStudents(false);
    }
  };

  const getGenderBadge = (gender: string) => {
    if (gender.toLowerCase() === 'male') {
      return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Male</Badge>;
    }
    if (gender.toLowerCase() === 'female') {
      return <Badge className="bg-pink-100 text-pink-700 border-pink-200">Female</Badge>;
    }
    return <Badge variant="outline">{gender}</Badge>;
  };

  const getStudentInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block mb-4">
            <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600">Loading classes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Classes</h1>
        <p className="text-gray-600">View and manage your assigned classes</p>
      </div>

      {/* Classes Grid */}
      {classes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls) => (
            <Card
              key={cls.id}
              className="p-6 border-amber-200 hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-orange-300"
              onClick={() => handleViewClass(cls)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{cls.name}</h3>
                  {cls.section && (
                    <p className="text-sm text-gray-600 mt-1">Section {cls.section}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-amber-600">
                    {cls.studentCount || 0}
                  </div>
                  <p className="text-xs text-gray-600">students</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-3 rounded-lg mb-4 border border-amber-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 font-medium">Capacity</p>
                    <p className="text-lg font-bold text-amber-700">{cls.capacity}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Year</p>
                    <p className="text-lg font-bold text-amber-700">{cls.academic_year}</p>
                  </div>
                </div>
              </div>

              <Button
                className="w-full gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewClass(cls);
                }}
              >
                View Students
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Users className="w-8 h-8" />}
          title="No Classes Assigned"
          description="You don't have any classes assigned yet. Contact administration to get started."
        />
      )}

      {/* Class Details Dialog */}
      {selectedClass && (
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>
                  {selectedClass.name}
                  {selectedClass.section && ` - Section ${selectedClass.section}`}
                </span>
              </DialogTitle>
              <DialogDescription>
                {classStudents.length} students enrolled in this class
              </DialogDescription>
            </DialogHeader>

            {loadingStudents ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="inline-block mb-4">
                    <div className="w-6 h-6 border-3 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
                  </div>
                  <p className="text-gray-600">Loading students...</p>
                </div>
              </div>
            ) : classStudents.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gradient-to-r from-amber-100 to-orange-100">
                    <TableRow className="border-amber-200 hover:bg-transparent">
                      <TableHead className="text-gray-700 font-bold">Admission #</TableHead>
                      <TableHead className="text-gray-700 font-bold">Name</TableHead>
                      <TableHead className="text-gray-700 font-bold">Gender</TableHead>
                      <TableHead className="text-gray-700 font-bold">Date of Birth</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classStudents.map((student) => (
                      <TableRow key={student.id} className="border-amber-100 hover:bg-amber-50">
                        <TableCell className="text-sm font-semibold text-amber-700">
                          {student.admission_number}
                        </TableCell>
                        <TableCell className="text-gray-900 font-medium">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center text-xs font-bold text-white">
                              {getStudentInitials(student.full_name)}
                            </div>
                            {student.full_name}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getGenderBadge(student.gender)}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {new Date(student.date_of_birth).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="py-8">
                <EmptyState
                  icon={<Users className="w-6 h-6" />}
                  title="No Students"
                  description="No active students in this class"
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
