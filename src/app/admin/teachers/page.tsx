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

interface TeacherRow {
  teacher_id: string;
  user_id: string;
  employee_id: string;
  qualification: string | null;
  specialization: string | null;
  join_date: string | null;
  status: string;
  email: string;
  full_name: string;
  phone: string | null;
  assigned_class_name: string | null;
  assigned_class_id: string | null;
}

interface ClassOption {
  id: string;
  name: string;
  section: string;
}

interface TeacherForm {
  full_name: string;
  email: string;
  password: string;
  phone: string;
  employee_id: string;
  qualification: string;
  specialization: string;
  join_date: string;
  status: string;
  class_id: string;
}

const EMPTY_FORM: TeacherForm = {
  full_name: '',
  email: '',
  password: '',
  phone: '',
  employee_id: '',
  qualification: '',
  specialization: '',
  join_date: new Date().toISOString().slice(0, 10),
  status: 'active',
  class_id: 'none',
};

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<TeacherRow[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<TeacherForm>(EMPTY_FORM);
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

      // Fetch teachers joined to their user profile.
      const { data: teachersData, error } = await supabase
        .from('teachers')
        .select(`
          id,
          user_id,
          employee_id,
          qualification,
          specialization,
          join_date,
          status,
          users!inner(email, full_name, phone)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
        setTeachers([]);
      } else {
        // Fetch class assignments for these teachers.
        const teacherIds = (teachersData ?? []).map((t) => t.id);
        let assignmentMap: Record<string, { class_id: string; class_name: string }> = {};
        if (teacherIds.length > 0) {
          const { data: assignments } = await supabase
            .from('class_teachers')
            .select('teacher_id, class_id, classes(name, section)')
            .in('teacher_id', teacherIds)
            .eq('is_class_teacher', true);
          if (assignments) {
            assignmentMap = {};
            for (const a of assignments as unknown as Array<{
              teacher_id: string;
              class_id: string;
              classes: { name: string; section: string } | null;
            }>) {
              if (a.teacher_id && a.class_id && a.classes) {
                assignmentMap[a.teacher_id] = {
                  class_id: a.class_id,
                  class_name: `${a.classes.name} - ${a.classes.section}`,
                };
              }
            }
          }
        }

        const rows: TeacherRow[] = (teachersData ?? []).map((t: any) => {
          const assignment = assignmentMap[t.id] ?? {
            class_id: null,
            class_name: null,
          };
          return {
            teacher_id: t.id,
            user_id: t.user_id,
            employee_id: t.employee_id,
            qualification: t.qualification,
            specialization: t.specialization,
            join_date: t.join_date,
            status: t.status,
            email: t.users?.email ?? '',
            full_name: t.users?.full_name ?? '',
            phone: t.users?.phone ?? null,
            assigned_class_name: assignment.class_name,
            assigned_class_id: assignment.class_id,
          };
        });
        setTeachers(rows);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load teachers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setError('');
    setShowPassword(false);
  };

  const handleAddClick = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleEdit = (t: TeacherRow) => {
    setFormData({
      full_name: t.full_name,
      email: t.email,
      password: '',
      phone: t.phone ?? '',
      employee_id: t.employee_id,
      qualification: t.qualification ?? '',
      specialization: t.specialization ?? '',
      join_date: t.join_date ?? new Date().toISOString().slice(0, 10),
      status: t.status,
      class_id: t.assigned_class_id ?? 'none',
    });
    setEditingId(t.teacher_id);
    setError('');
    setShowPassword(false);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setError('');
    if (!formData.full_name || !formData.email || !formData.employee_id) {
      setError('Full name, email and employee ID are required.');
      return;
    }
    if (!editingId && (!formData.password || formData.password.length < 6)) {
      setError('Password is required for new accounts (min 6 characters).');
      return;
    }
    if (!editingId && !formData.email.endsWith('@gokulbuds.com') && !formData.email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();

      if (editingId) {
        // EDIT: update users profile + teacher record. (Email/password changes via edge function if needed — not in scope here.)
        const editing = teachers.find((t) => t.teacher_id === editingId);
        if (!editing) throw new Error('Teacher not found');

        const { error: userUpdateError } = await supabase
          .from('users')
          .update({ full_name: formData.full_name, phone: formData.phone || null })
          .eq('id', editing.user_id);
        if (userUpdateError) throw new Error(`User update failed: ${userUpdateError.message}`);

        const { error: teacherUpdateError } = await supabase
          .from('teachers')
          .update({
            employee_id: formData.employee_id,
            qualification: formData.qualification || null,
            specialization: formData.specialization || null,
            join_date: formData.join_date || null,
            status: formData.status,
          })
          .eq('id', editingId);
        if (teacherUpdateError) throw new Error(`Teacher update failed: ${teacherUpdateError.message}`);

        // Update class assignment.
        if (editing.assigned_class_id) {
          await supabase
            .from('class_teachers')
            .delete()
            .eq('teacher_id', editingId)
            .eq('class_id', editing.assigned_class_id);
        }
        if (formData.class_id && formData.class_id !== 'none') {
          await supabase.from('class_teachers').insert({
            teacher_id: editingId,
            class_id: formData.class_id,
            is_class_teacher: true,
            academic_year: new Date().getFullYear().toString(),
          });
        }
      } else {
        // CREATE: use the edge function to create the auth user + users profile.
        const result = await createUserAccount({
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          role: 'teacher',
          phone: formData.phone || null,
        });

        // Create the teacher record linked to the new auth user.
        const { data: newTeacher, error: teacherError } = await supabase
          .from('teachers')
          .insert({
            user_id: result.userId,
            employee_id: formData.employee_id,
            qualification: formData.qualification || null,
            specialization: formData.specialization || null,
            join_date: formData.join_date || null,
            status: formData.status,
          })
          .select('id')
          .single();

        if (teacherError || !newTeacher) {
          throw new Error(`Teacher record failed: ${teacherError?.message ?? 'unknown'}`);
        }

        // Assign to class if selected.
        if (formData.class_id && formData.class_id !== 'none') {
          await supabase.from('class_teachers').insert({
            teacher_id: newTeacher.id,
            class_id: formData.class_id,
            is_class_teacher: true,
            academic_year: new Date().getFullYear().toString(),
          });
        }

        setCreatedCreds({ email: formData.email, password: formData.password });
      }

      setDialogOpen(false);
      resetForm();
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save teacher');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (t: TeacherRow) => {
    if (!confirm(`Delete teacher ${t.full_name}? This removes their login and all records.`)) return;
    try {
      const supabase = createClient();
      // Remove class assignments + teacher record (cascade handles children),
      // then delete the auth user via edge function (also removes public.users row via FK cascade).
      await supabase.from('class_teachers').delete().eq('teacher_id', t.teacher_id);
      await supabase.from('teachers').delete().eq('id', t.teacher_id);
      await deleteUserAccount(t.user_id);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete teacher');
    }
  };

  const filteredTeachers = teachers.filter((t) => {
    const q = searchTerm.toLowerCase();
    return (
      t.full_name.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q) ||
      t.employee_id.toLowerCase().includes(q) ||
      (t.specialization ?? '').toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
          <p className="mt-4 text-gray-600">Loading teachers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Teacher Management</h1>
          <p className="text-gray-600 mt-1">Create teacher accounts, assign classes, and manage records</p>
        </div>
        <Button onClick={handleAddClick} className="bg-amber-600 hover:bg-amber-700 text-white gap-2">
          <Plus size={20} />
          Add Teacher
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}

      <Card className="p-4 border-amber-200 bg-white">
        <Label className="text-amber-900">Search</Label>
        <Input
          placeholder="Search by name, email, employee ID or specialization..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mt-2 border-amber-200 focus:border-amber-500"
        />
      </Card>

      {filteredTeachers.length > 0 ? (
        <Card className="border-amber-200">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-amber-50">
                <TableRow className="border-b-2 border-amber-200">
                  <TableHead className="text-amber-900 font-semibold">Name</TableHead>
                  <TableHead className="text-amber-900 font-semibold">Email</TableHead>
                  <TableHead className="text-amber-900 font-semibold">Employee ID</TableHead>
                  <TableHead className="text-amber-900 font-semibold">Assigned Class</TableHead>
                  <TableHead className="text-amber-900 font-semibold">Specialization</TableHead>
                  <TableHead className="text-amber-900 font-semibold">Status</TableHead>
                  <TableHead className="text-amber-900 font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeachers.map((teacher) => (
                  <TableRow key={teacher.teacher_id} className="border-b border-amber-100 hover:bg-amber-50">
                    <TableCell className="font-semibold text-gray-900">{teacher.full_name}</TableCell>
                    <TableCell className="text-gray-700 text-sm">{teacher.email}</TableCell>
                    <TableCell className="font-mono font-semibold text-amber-700">{teacher.employee_id}</TableCell>
                    <TableCell className="text-gray-700">
                      {teacher.assigned_class_name ?? <span className="text-gray-400">Unassigned</span>}
                    </TableCell>
                    <TableCell className="text-gray-700">{teacher.specialization ?? '—'}</TableCell>
                    <TableCell>
                      <Badge className={teacher.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {teacher.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(teacher)} className="text-amber-600 hover:bg-amber-100">
                        <Edit2 size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(teacher)} className="text-red-600 hover:bg-red-100">
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
          title="No teachers found"
          description="Add your first teacher to create their login credentials"
          action={{ label: 'Add Teacher', onClick: handleAddClick }}
        />
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-2xl border-amber-200">
          <DialogHeader>
            <DialogTitle className="text-amber-900">{editingId ? 'Edit Teacher' : 'Add New Teacher'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {!editingId && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-800">
                  Login credentials will be created automatically. Share the email and password with the teacher.
                </p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-amber-900">Full Name *</Label>
                <Input
                  placeholder="Roopa Devi"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="mt-2 border-amber-200"
                />
              </div>
              <div>
                <Label className="text-amber-900">Email *</Label>
                <Input
                  type="email"
                  placeholder="roopa@gokulbuds.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-2 border-amber-200"
                />
              </div>
            </div>

            {!editingId && (
              <div>
                <Label className="text-amber-900">Login Password *</Label>
                <div className="relative mt-2">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Temporary password (min 6 chars)"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="border-amber-200 pr-10"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-amber-900">Employee ID *</Label>
                <Input
                  placeholder="EMP001"
                  value={formData.employee_id}
                  onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                  className="mt-2 border-amber-200"
                />
              </div>
              <div>
                <Label className="text-amber-900">Phone</Label>
                <Input
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-2 border-amber-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-amber-900">Qualification</Label>
                <Input
                  placeholder="B.Ed"
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  className="mt-2 border-amber-200"
                />
              </div>
              <div>
                <Label className="text-amber-900">Specialization</Label>
                <Input
                  placeholder="English"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="mt-2 border-amber-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-amber-900">Assigned Class</Label>
                <Select value={formData.class_id} onValueChange={(value) => setFormData({ ...formData, class_id: value })}>
                  <SelectTrigger className="mt-2 border-amber-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No assignment</SelectItem>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name} - {cls.section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-amber-900">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger className="mt-2 border-amber-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="on_leave">On Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-amber-900">Join Date</Label>
              <Input
                type="date"
                value={formData.join_date}
                onChange={(e) => setFormData({ ...formData, join_date: e.target.value })}
                className="mt-2 border-amber-200"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-700">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} disabled={saving} className="bg-amber-600 hover:bg-amber-700 text-white flex-1">
                {saving ? 'Saving...' : editingId ? 'Update Teacher' : 'Create Teacher Account'}
              </Button>
              <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }} className="flex-1 border-amber-200">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Credentials confirmation dialog */}
      <Dialog open={!!createdCreds} onOpenChange={(open) => { if (!open) setCreatedCreds(null); }}>
        <DialogContent className="max-w-md border-amber-200">
          <DialogHeader>
            <DialogTitle className="text-amber-900">Teacher Account Created</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-gray-700">Share these credentials with the teacher:</p>
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
            <p className="text-xs text-gray-500">The teacher can now log in at the login page with these credentials.</p>
            <Button onClick={() => setCreatedCreds(null)} className="w-full bg-amber-600 hover:bg-amber-700 text-white">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
