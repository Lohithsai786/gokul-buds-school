'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { createUserAccount, deleteUserAccount } from '@/lib/admin-accounts';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared';
import { Trash2, Edit2, Plus, Eye, EyeOff } from 'lucide-react';

interface StudentRow {
  id: string;
  admission_number: string;
  full_name: string;
  date_of_birth: string | null;
  gender: string | null;
  class_id: string | null;
  class_name: string | null;
  admission_date: string | null;
  status: string;
  parent_full_name: string | null;
  parent_phone: string | null;
  parent_user_id: string | null;
}

interface ClassOption {
  id: string;
  name: string;
  section: string;
}

interface StudentForm {
  admission_number: string;
  full_name: string;
  date_of_birth: string;
  gender: string;
  class_id: string;
  admission_date: string;
  status: string;
}

interface ParentForm {
  create_account: boolean;
  full_name: string;
  email: string;
  password: string;
  phone: string;
  father_name: string;
  mother_name: string;
  alternate_phone: string;
  address: string;
  relation: string;
}

const EMPTY_STUDENT: StudentForm = {
  admission_number: '',
  full_name: '',
  date_of_birth: '',
  gender: '',
  class_id: '',
  admission_date: new Date().toISOString().slice(0, 10),
  status: 'active',
};

const EMPTY_PARENT: ParentForm = {
  create_account: true,
  full_name: '',
  email: '',
  password: '',
  phone: '',
  father_name: '',
  mother_name: '',
  alternate_phone: '',
  address: '',
  relation: 'father',
};

export default function StudentsPage() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [studentForm, setStudentForm] = useState<StudentForm>(EMPTY_STUDENT);
  const [parentForm, setParentForm] = useState<ParentForm>(EMPTY_PARENT);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [createdCreds, setCreatedCreds] = useState<{ email: string; password: string } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      const { data: classesData } = await supabase
        .from('classes')
        .select('id, name, section')
        .order('name');
      if (classesData) setClasses(classesData as ClassOption[]);

      const { data: studentsData, error } = await supabase
        .from('students')
        .select(`
          id,
          admission_number,
          full_name,
          date_of_birth,
          gender,
          class_id,
          admission_date,
          status,
          classes(name, section)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
        setStudents([]);
      } else {
        const studentIds = (studentsData ?? []).map((s: any) => s.id);
        let parentMap: Record<string, { full_name: string | null; phone: string | null; user_id: string | null }> = {};
        if (studentIds.length > 0) {
          const { data: parentsData } = await supabase
            .from('parents')
            .select('student_id, user_id, father_name, mother_name, phone')
            .in('student_id', studentIds);
          if (parentsData) {
            parentMap = {};
            for (const p of parentsData as any[]) {
              const existing = parentMap[p.student_id];
              if (!existing) {
                parentMap[p.student_id] = {
                  full_name: p.father_name ?? p.mother_name ?? null,
                  phone: p.phone ?? null,
                  user_id: p.user_id ?? null,
                };
              }
            }
            // Fetch parent user emails for the rows that have a user_id.
            const userIds = Object.values(parentMap).map((p) => p.user_id).filter(Boolean) as string[];
            if (userIds.length > 0) {
              const { data: parentUsers } = await supabase
                .from('users')
                .select('id, full_name')
                .in('id', userIds);
              if (parentUsers) {
                const userMap: Record<string, string> = {};
                for (const u of parentUsers as any[]) {
                  userMap[u.id] = u.full_name;
                }
                for (const key of Object.keys(parentMap)) {
                  const entry = parentMap[key];
                  if (entry.user_id && userMap[entry.user_id]) {
                    entry.full_name = userMap[entry.user_id];
                  }
                }
              }
            }
          }
        }

        const rows: StudentRow[] = (studentsData ?? []).map((s: any) => {
          const cls = s.classes;
          const parentEntry = parentMap[s.id] ?? { full_name: null, phone: null, user_id: null };
          return {
            id: s.id,
            admission_number: s.admission_number,
            full_name: s.full_name,
            date_of_birth: s.date_of_birth,
            gender: s.gender,
            class_id: s.class_id,
            class_name: cls ? `${cls.name} - ${cls.section}` : null,
            admission_date: s.admission_date,
            status: s.status,
            parent_full_name: parentEntry.full_name,
            parent_phone: parentEntry.phone,
            parent_user_id: parentEntry.user_id,
          };
        });
        setStudents(rows);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load students');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setStudentForm(EMPTY_STUDENT);
    setParentForm(EMPTY_PARENT);
    setEditingId(null);
    setError('');
    setShowPassword(false);
  };

  const handleAddClick = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleEdit = (s: StudentRow) => {
    setStudentForm({
      admission_number: s.admission_number,
      full_name: s.full_name,
      date_of_birth: s.date_of_birth ?? '',
      gender: s.gender ?? '',
      class_id: s.class_id ?? '',
      admission_date: s.admission_date ?? new Date().toISOString().slice(0, 10),
      status: s.status,
    });
    setParentForm({ ...EMPTY_PARENT, create_account: false });
    setEditingId(s.id);
    setError('');
    setShowPassword(false);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setError('');
    if (!studentForm.full_name || !studentForm.admission_number || !studentForm.class_id) {
      setError('Full name, admission number and class are required.');
      return;
    }
    if (!editingId && parentForm.create_account) {
      if (!parentForm.email || !parentForm.password) {
        setError('Parent email and password are required when creating a parent account.');
        return;
      }
      if (parentForm.password.length < 6) {
        setError('Parent password must be at least 6 characters.');
        return;
      }
    }

    setSaving(true);
    try {
      const supabase = createClient();
      const studentPayload = {
        admission_number: studentForm.admission_number,
        full_name: studentForm.full_name,
        date_of_birth: studentForm.date_of_birth || null,
        gender: studentForm.gender || null,
        class_id: studentForm.class_id,
        admission_date: studentForm.admission_date || null,
        status: studentForm.status,
      };

      if (editingId) {
        const { error: updateError } = await supabase
          .from('students')
          .update(studentPayload)
          .eq('id', editingId);
        if (updateError) throw new Error(`Student update failed: ${updateError.message}`);
      } else {
        const { data: newStudent, error: insertError } = await supabase
          .from('students')
          .insert(studentPayload)
          .select('id')
          .single();
        if (insertError || !newStudent) {
          throw new Error(`Student insert failed: ${insertError?.message ?? 'unknown'}`);
        }
        const studentId = newStudent.id;

        // Create parent record (and optionally a parent login account).
        if (parentForm.create_account || parentForm.father_name || parentForm.mother_name || parentForm.phone) {
          let parentUserId: string | null = null;

          if (parentForm.create_account && parentForm.email && parentForm.password) {
            const result = await createUserAccount({
              email: parentForm.email,
              password: parentForm.password,
              full_name: parentForm.full_name || parentForm.father_name || parentForm.mother_name || studentForm.full_name + "'s Parent",
              role: 'parent',
              phone: parentForm.phone || null,
            });
            parentUserId = result.userId;
            setCreatedCreds({ email: parentForm.email, password: parentForm.password });
          }

          const { error: parentInsertError } = await supabase.from('parents').insert({
            user_id: parentUserId,
            student_id: studentId,
            father_name: parentForm.father_name || null,
            mother_name: parentForm.mother_name || null,
            phone: parentForm.phone || null,
            alternate_phone: parentForm.alternate_phone || null,
            address: parentForm.address || null,
            relation: parentForm.relation,
          });
          if (parentInsertError) {
            console.error('Parent insert failed:', parentInsertError.message);
          }

          // Auto-add parent to the class chat group.
          if (parentUserId && studentForm.class_id) {
            await supabase.rpc('add_class_group_member', {
              p_class_id: studentForm.class_id,
              p_user_id: parentUserId,
              p_role: 'parent',
            });
          }
        }
      }

      setDialogOpen(false);
      resetForm();
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save student');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (s: StudentRow) => {
    if (!confirm(`Delete student ${s.full_name}? This removes the student and related records.`)) return;
    try {
      const supabase = createClient();
      await supabase.from('parents').delete().eq('student_id', s.id);
      await supabase.from('students').delete().eq('id', s.id);
      if (s.parent_user_id) {
        await deleteUserAccount(s.parent_user_id);
      }
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete student');
    }
  };

  const filteredStudents = students.filter((s) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      s.full_name.toLowerCase().includes(q) ||
      s.admission_number.toLowerCase().includes(q);
    const matchesClass = filterClass === 'all' || s.class_id === filterClass;
    return matchesSearch && matchesClass;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
          <p className="mt-4 text-gray-600">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Student Management</h1>
          <p className="text-gray-600 mt-1">Manage student records and parent accounts</p>
        </div>
        <Button onClick={handleAddClick} className="bg-amber-600 hover:bg-amber-700 text-white gap-2">
          <Plus size={20} />
          Add Student
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}

      <Card className="p-4 border-amber-200 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-amber-900">Search</Label>
            <Input
              placeholder="Search by name or admission #"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mt-2 border-amber-200 focus:border-amber-500"
            />
          </div>
          <div>
            <Label className="text-amber-900">Filter by Class</Label>
            <Select value={filterClass} onValueChange={setFilterClass}>
              <SelectTrigger className="mt-2 border-amber-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name} - {cls.section}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              Showing {filteredStudents.length} of {students.length} students
            </div>
          </div>
        </div>
      </Card>

      {filteredStudents.length > 0 ? (
        <Card className="border-amber-200">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-amber-50">
                <TableRow className="border-b-2 border-amber-200">
                  <TableHead className="text-amber-900 font-semibold">Admission #</TableHead>
                  <TableHead className="text-amber-900 font-semibold">Student Name</TableHead>
                  <TableHead className="text-amber-900 font-semibold">Class</TableHead>
                  <TableHead className="text-amber-900 font-semibold">Parent</TableHead>
                  <TableHead className="text-amber-900 font-semibold">Phone</TableHead>
                  <TableHead className="text-amber-900 font-semibold">Status</TableHead>
                  <TableHead className="text-amber-900 font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id} className="border-b border-amber-100 hover:bg-amber-50">
                    <TableCell className="font-mono font-semibold text-amber-700">{student.admission_number}</TableCell>
                    <TableCell className="font-semibold text-gray-900">{student.full_name}</TableCell>
                    <TableCell className="text-gray-700">{student.class_name ?? 'N/A'}</TableCell>
                    <TableCell className="text-gray-700">{student.parent_full_name ?? '—'}</TableCell>
                    <TableCell className="text-gray-600 text-sm">{student.parent_phone ?? '—'}</TableCell>
                    <TableCell>
                      <Badge className={student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(student)} className="text-amber-600 hover:bg-amber-100">
                        <Edit2 size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(student)} className="text-red-600 hover:bg-red-100">
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      ) : (
        <EmptyState
          title="No students found"
          description="Add your first student to get started"
          action={{ label: 'Add Student', onClick: handleAddClick }}
        />
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-2xl border-amber-200 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-amber-900">{editingId ? 'Edit Student' : 'Add New Student'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-amber-900">Admission Number *</Label>
                <Input
                  placeholder="ADM001"
                  value={studentForm.admission_number}
                  onChange={(e) => setStudentForm({ ...studentForm, admission_number: e.target.value })}
                  className="mt-2 border-amber-200"
                />
              </div>
              <div>
                <Label className="text-amber-900">Full Name *</Label>
                <Input
                  placeholder="Student name"
                  value={studentForm.full_name}
                  onChange={(e) => setStudentForm({ ...studentForm, full_name: e.target.value })}
                  className="mt-2 border-amber-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-amber-900">Date of Birth</Label>
                <Input
                  type="date"
                  value={studentForm.date_of_birth}
                  onChange={(e) => setStudentForm({ ...studentForm, date_of_birth: e.target.value })}
                  className="mt-2 border-amber-200"
                />
              </div>
              <div>
                <Label className="text-amber-900">Gender</Label>
                <Select value={studentForm.gender} onValueChange={(value) => setStudentForm({ ...studentForm, gender: value })}>
                  <SelectTrigger className="mt-2 border-amber-200">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-amber-900">Class *</Label>
                <Select value={studentForm.class_id} onValueChange={(value) => setStudentForm({ ...studentForm, class_id: value })}>
                  <SelectTrigger className="mt-2 border-amber-200">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name} - {cls.section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-amber-900">Admission Date</Label>
                <Input
                  type="date"
                  value={studentForm.admission_date}
                  onChange={(e) => setStudentForm({ ...studentForm, admission_date: e.target.value })}
                  className="mt-2 border-amber-200"
                />
              </div>
            </div>

            <div>
              <Label className="text-amber-900">Status</Label>
              <Select value={studentForm.status} onValueChange={(value) => setStudentForm({ ...studentForm, status: value })}>
                <SelectTrigger className="mt-2 border-amber-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!editingId && (
              <>
                <div className="border-t border-amber-100 pt-4 mt-2">
                  <h3 className="text-sm font-semibold text-amber-800 mb-3">Parent / Guardian</h3>
                  <label className="flex items-center gap-2 mb-3">
                    <input
                      type="checkbox"
                      checked={parentForm.create_account}
                      onChange={(e) => setParentForm({ ...parentForm, create_account: e.target.checked })}
                      className="rounded border-amber-300"
                    />
                    <span className="text-sm text-gray-700">Create a parent login account</span>
                  </label>
                </div>

                {parentForm.create_account && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-amber-900">Parent Full Name *</Label>
                        <Input
                          placeholder="Parent name"
                          value={parentForm.full_name}
                          onChange={(e) => setParentForm({ ...parentForm, full_name: e.target.value })}
                          className="mt-2 border-amber-200"
                        />
                      </div>
                      <div>
                        <Label className="text-amber-900">Parent Email *</Label>
                        <Input
                          type="email"
                          placeholder="parent@example.com"
                          value={parentForm.email}
                          onChange={(e) => setParentForm({ ...parentForm, email: e.target.value })}
                          className="mt-2 border-amber-200"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-amber-900">Login Password *</Label>
                      <div className="relative mt-2">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Temporary password (min 6 chars)"
                          value={parentForm.password}
                          onChange={(e) => setParentForm({ ...parentForm, password: e.target.value })}
                          className="border-amber-200 pr-10"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-amber-900">Father&apos;s Name</Label>
                        <Input
                          placeholder="Father's name"
                          value={parentForm.father_name}
                          onChange={(e) => setParentForm({ ...parentForm, father_name: e.target.value })}
                          className="mt-2 border-amber-200"
                        />
                      </div>
                      <div>
                        <Label className="text-amber-900">Mother&apos;s Name</Label>
                        <Input
                          placeholder="Mother's name"
                          value={parentForm.mother_name}
                          onChange={(e) => setParentForm({ ...parentForm, mother_name: e.target.value })}
                          className="mt-2 border-amber-200"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-amber-900">Phone</Label>
                        <Input
                          placeholder="+91 9876543210"
                          value={parentForm.phone}
                          onChange={(e) => setParentForm({ ...parentForm, phone: e.target.value })}
                          className="mt-2 border-amber-200"
                        />
                      </div>
                      <div>
                        <Label className="text-amber-900">Alternate Phone</Label>
                        <Input
                          placeholder="Alternate phone"
                          value={parentForm.alternate_phone}
                          onChange={(e) => setParentForm({ ...parentForm, alternate_phone: e.target.value })}
                          className="mt-2 border-amber-200"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-amber-900">Address</Label>
                      <Input
                        placeholder="Home address"
                        value={parentForm.address}
                        onChange={(e) => setParentForm({ ...parentForm, address: e.target.value })}
                        className="mt-2 border-amber-200"
                      />
                    </div>
                    <div>
                      <Label className="text-amber-900">Relation</Label>
                      <Select value={parentForm.relation} onValueChange={(value) => setParentForm({ ...parentForm, relation: value })}>
                        <SelectTrigger className="mt-2 border-amber-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="father">Father</SelectItem>
                          <SelectItem value="mother">Mother</SelectItem>
                          <SelectItem value="guardian">Guardian</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {!parentForm.create_account && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-amber-900">Father&apos;s Name</Label>
                      <Input
                        placeholder="Father's name"
                        value={parentForm.father_name}
                        onChange={(e) => setParentForm({ ...parentForm, father_name: e.target.value })}
                        className="mt-2 border-amber-200"
                      />
                    </div>
                    <div>
                      <Label className="text-amber-900">Phone</Label>
                      <Input
                        placeholder="Phone"
                        value={parentForm.phone}
                        onChange={(e) => setParentForm({ ...parentForm, phone: e.target.value })}
                        className="mt-2 border-amber-200"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-700">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} disabled={saving} className="bg-amber-600 hover:bg-amber-700 text-white flex-1">
                {saving ? 'Saving...' : editingId ? 'Update Student' : 'Add Student'}
              </Button>
              <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }} className="flex-1 border-amber-200">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!createdCreds} onOpenChange={(open) => { if (!open) setCreatedCreds(null); }}>
        <DialogContent className="max-w-md border-amber-200">
          <DialogHeader>
            <DialogTitle className="text-amber-900">Parent Account Created</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-gray-700">Share these credentials with the parent:</p>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
              <div>
                <span className="text-xs font-medium text-amber-900">Email:</span>
                <p className="font-mono font-semibold text-gray-900">{createdCreds?.email}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-amber-900">Password:</span>
                <p className="font-mono font-semibold text-gray-900">{createdCreds?.password}</p>
              </div>
            </div>
            <Button onClick={() => setCreatedCreds(null)} className="w-full bg-amber-600 hover:bg-amber-700 text-white">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
