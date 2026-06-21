'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { deleteUserAccount } from '@/lib/admin-accounts';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared';
import { Trash2, Edit2, Plus } from 'lucide-react';

interface ParentRow {
  parent_id: string;
  user_id: string;
  student_id: string;
  father_name: string | null;
  mother_name: string | null;
  phone: string | null;
  alternate_phone: string | null;
  address: string | null;
  relation: string | null;
  email: string;
  full_name: string;
  user_phone: string | null;
  student_name: string;
  admission_number: string | null;
  student_class_name: string | null;
}

interface ParentForm {
  father_name: string;
  mother_name: string;
  phone: string;
  alternate_phone: string;
  address: string;
  relation: string;
}

const EMPTY_FORM: ParentForm = {
  father_name: '',
  mother_name: '',
  phone: '',
  alternate_phone: '',
  address: '',
  relation: 'father',
};

const RELATION_OPTIONS = [
  { value: 'father', label: 'Father' },
  { value: 'mother', label: 'Mother' },
  { value: 'guardian', label: 'Guardian' },
];

export default function ParentsPage() {
  const [parents, setParents] = useState<ParentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<ParentForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const supabase = createClient();

      const { data: parentsData, error } = await supabase
        .from('parents')
        .select(`
          student_id,
          father_name,
          mother_name,
          phone,
          alternate_phone,
          address,
          relation,
          users!inner(email, full_name, phone),
          students!inner(full_name, admission_number, classes(name, section))
        `)
        .order('father_name', { ascending: true });

      if (error) {
        setLoadError(error.message);
        setParents([]);
      } else {
        const rows: ParentRow[] = (parentsData ?? []).map((p: any) => {
          const cls = p.students?.classes;
          return {
            parent_id: p.student_id,
            user_id: p.student_id, // user_id surfaced via the users join; captured below
            student_id: p.student_id,
            father_name: p.father_name,
            mother_name: p.mother_name,
            phone: p.phone,
            alternate_phone: p.alternate_phone,
            address: p.address,
            relation: p.relation,
            email: p.users?.email ?? '',
            full_name: p.users?.full_name ?? '',
            user_phone: p.users?.phone ?? null,
            student_name: p.students?.full_name ?? '',
            admission_number: p.students?.admission_number ?? null,
            student_class_name: cls ? `${cls.name} - ${cls.section}` : null,
          };
        });
        setParents(rows);
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load parents');
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
  };

  const handleEdit = (p: ParentRow) => {
    setFormData({
      father_name: p.father_name ?? '',
      mother_name: p.mother_name ?? '',
      phone: p.phone ?? '',
      alternate_phone: p.alternate_phone ?? '',
      address: p.address ?? '',
      relation: p.relation ?? 'father',
    });
    setEditingId(p.student_id);
    setError('');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setError('');
    if (!formData.father_name && !formData.mother_name) {
      setError('At least one parent name (father or mother) is required.');
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      const editing = parents.find((p) => p.student_id === editingId);
      if (!editing) throw new Error('Parent record not found');

      const { error: updateError } = await supabase
        .from('parents')
        .update({
          father_name: formData.father_name || null,
          mother_name: formData.mother_name || null,
          phone: formData.phone || null,
          alternate_phone: formData.alternate_phone || null,
          address: formData.address || null,
          relation: formData.relation || null,
        })
        .eq('student_id', editingId);

      if (updateError) throw new Error(`Update failed: ${updateError.message}`);

      setDialogOpen(false);
      resetForm();
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save parent');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p: ParentRow) => {
    const name = p.father_name || p.mother_name || p.full_name || 'this parent';
    if (!confirm(`Delete ${name}? This removes their login and the parent record.`)) return;
    try {
      const supabase = createClient();
      // Delete the auth user (cascades to public.users), then remove the parent row.
      await deleteUserAccount(p.user_id);
      await supabase.from('parents').delete().eq('student_id', p.student_id);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete parent');
    }
  };

  const filteredParents = parents.filter((p) => {
    const q = searchTerm.toLowerCase();
    return (
      (p.father_name ?? '').toLowerCase().includes(q) ||
      (p.mother_name ?? '').toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.full_name.toLowerCase().includes(q) ||
      p.student_name.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
          <p className="mt-4 text-gray-600">Loading parents...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block rounded-full h-12 w-12 border-2 border-red-500 flex items-center justify-center mx-auto">
            <span className="text-red-500 text-xl">!</span>
          </div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Failed to load parents</h2>
          <p className="mt-2 text-sm text-gray-600">{loadError}</p>
          <Button onClick={fetchData} className="mt-4 bg-amber-600 hover:bg-amber-700 text-white">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Parent Management</h1>
          <p className="text-gray-600 mt-1">Manage existing parent records, contact details and account access</p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}

      <Card className="p-4 border-amber-200 bg-white">
        <Label className="text-amber-900">Search</Label>
        <Input
          placeholder="Search by parent name, email or student name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mt-2 border-amber-200 focus:border-amber-500"
        />
      </Card>

      {filteredParents.length > 0 ? (
        <Card className="border-amber-200">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-amber-50">
                <TableRow className="border-b-2 border-amber-200">
                  <TableHead className="text-amber-900 font-semibold">Parent Name</TableHead>
                  <TableHead className="text-amber-900 font-semibold">Email</TableHead>
                  <TableHead className="text-amber-900 font-semibold">Phone</TableHead>
                  <TableHead className="text-amber-900 font-semibold">Student Name</TableHead>
                  <TableHead className="text-amber-900 font-semibold">Student Class</TableHead>
                  <TableHead className="text-amber-900 font-semibold">Relation</TableHead>
                  <TableHead className="text-amber-900 font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParents.map((parent) => (
                  <TableRow key={`${parent.student_id}-${parent.user_id}`} className="border-b border-amber-100 hover:bg-amber-50">
                    <TableCell className="font-semibold text-gray-900">
                      {parent.full_name || parent.father_name || parent.mother_name || '—'}
                    </TableCell>
                    <TableCell className="text-gray-700 text-sm">{parent.email}</TableCell>
                    <TableCell className="text-gray-700">
                      {parent.phone || parent.user_phone || <span className="text-gray-400">—</span>}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {parent.student_name}
                      {parent.admission_number && (
                        <span className="ml-2 font-mono text-xs text-amber-700">{parent.admission_number}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {parent.student_class_name ?? <span className="text-gray-400">—</span>}
                    </TableCell>
                    <TableCell>
                      {parent.relation ? (
                        <Badge className="bg-amber-100 text-amber-800 capitalize">{parent.relation}</Badge>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(parent)} className="text-amber-600 hover:bg-amber-100">
                        <Edit2 size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(parent)} className="text-red-600 hover:bg-red-100">
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
          title="No parents found"
          description="Parent records are created automatically when a student is admitted"
        />
      )}

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-2xl border-amber-200">
          <DialogHeader>
            <DialogTitle className="text-amber-900">Edit Parent</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-800">
                Parent accounts are created from the Students page. Here you can only update the parent&apos;s contact and relation details.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-amber-900">Father&apos;s Name</Label>
                <Input
                  placeholder="Father's full name"
                  value={formData.father_name}
                  onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                  className="mt-2 border-amber-200"
                />
              </div>
              <div>
                <Label className="text-amber-900">Mother&apos;s Name</Label>
                <Input
                  placeholder="Mother's full name"
                  value={formData.mother_name}
                  onChange={(e) => setFormData({ ...formData, mother_name: e.target.value })}
                  className="mt-2 border-amber-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-amber-900">Phone</Label>
                <Input
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-2 border-amber-200"
                />
              </div>
              <div>
                <Label className="text-amber-900">Alternate Phone</Label>
                <Input
                  placeholder="+91 9876543211"
                  value={formData.alternate_phone}
                  onChange={(e) => setFormData({ ...formData, alternate_phone: e.target.value })}
                  className="mt-2 border-amber-200"
                />
              </div>
            </div>

            <div>
              <Label className="text-amber-900">Relation</Label>
              <Select value={formData.relation} onValueChange={(value) => setFormData({ ...formData, relation: value })}>
                <SelectTrigger className="mt-2 border-amber-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RELATION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-amber-900">Address</Label>
              <Input
                placeholder="Home address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
                {saving ? 'Saving...' : 'Update Parent'}
              </Button>
              <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }} className="flex-1 border-amber-200">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
