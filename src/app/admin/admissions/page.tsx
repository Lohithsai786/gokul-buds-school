'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared';
import { Trash2, Eye, UserPlus, Search, Inbox } from 'lucide-react';

interface AdmissionInquiry {
  id: string;
  parent_name: string;
  email: string;
  phone: string;
  child_name: string;
  child_age: number | string | null;
  program: string;
  message: string | null;
  created_at: string;
}

interface ClassOption {
  id: string;
  name: string;
  section: string;
}

export default function AdmissionsPage() {
  const [inquiries, setInquiries] = useState<AdmissionInquiry[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  // View dialog
  const [viewInquiry, setViewInquiry] = useState<AdmissionInquiry | null>(null);

  // Convert dialog
  const [convertInquiry, setConvertInquiry] = useState<AdmissionInquiry | null>(null);
  const [convertClassId, setConvertClassId] = useState('none');
  const [converting, setConverting] = useState(false);
  const [convertError, setConvertError] = useState('');
  const [convertSuccess, setConvertSuccess] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      const { data: classesData } = await supabase
        .from('classes')
        .select('id, name, section')
        .order('name');
      if (classesData) setClasses(classesData as ClassOption[]);

      const { data: inquiryData, error: inquiryError } = await supabase
        .from('admission_inquiries')
        .select('id, parent_name, email, phone, child_name, child_age, program, message, created_at')
        .order('created_at', { ascending: false });

      if (inquiryError) {
        setError(inquiryError.message);
        setInquiries([]);
      } else {
        setInquiries((inquiryData ?? []) as AdmissionInquiry[]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admission inquiries');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (inquiry: AdmissionInquiry) => {
    if (!confirm(`Delete inquiry from ${inquiry.parent_name}? This cannot be undone.`)) return;
    try {
      const supabase = createClient();
      const { error: deleteError } = await supabase
        .from('admission_inquiries')
        .delete()
        .eq('id', inquiry.id);
      if (deleteError) throw new Error(deleteError.message);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete inquiry');
    }
  };

  const openConvert = (inquiry: AdmissionInquiry) => {
    setConvertInquiry(inquiry);
    setConvertClassId('none');
    setConvertError('');
    setConvertSuccess(null);
  };

  const handleConvert = async () => {
    if (!convertInquiry) return;
    setConvertError('');
    if (!convertClassId || convertClassId === 'none') {
      setConvertError('Please select a class to assign the student.');
      return;
    }

    setConverting(true);
    try {
      const supabase = createClient();
      const admissionNumber = `ADM${Date.now()}`;

      const { data: newStudent, error: insertError } = await supabase
        .from('students')
        .insert({
          admission_number: admissionNumber,
          full_name: convertInquiry.child_name,
          class_id: convertClassId,
          status: 'active',
        })
        .select('id')
        .single();

      if (insertError || !newStudent) {
        throw new Error(insertError?.message ?? 'Failed to create student record');
      }

      setConvertSuccess(
        `Student "${convertInquiry.child_name}" created successfully. Admission Number: ${admissionNumber}`
      );
      // Refresh inquiries list (do not auto-close; the success message gives the admin the admission number)
      await fetchData();
    } catch (err) {
      setConvertError(err instanceof Error ? err.message : 'Failed to convert inquiry to student');
    } finally {
      setConverting(false);
    }
  };

  const closeConvert = () => {
    setConvertInquiry(null);
    setConvertClassId('none');
    setConvertError('');
    setConvertSuccess(null);
  };

  const filteredInquiries = inquiries.filter((inq) => {
    const q = searchTerm.toLowerCase();
    return (
      inq.parent_name.toLowerCase().includes(q) ||
      inq.email.toLowerCase().includes(q) ||
      inq.child_name.toLowerCase().includes(q)
    );
  });

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
          <p className="mt-4 text-gray-600">Loading admission inquiries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Admission Inquiries</h1>
          <p className="text-gray-600 mt-1">Review inquiries, view details, and convert them into students</p>
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
          placeholder="Search by parent name, email, or child name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mt-2 border-amber-200 focus:border-amber-500"
        />
      </Card>

      {filteredInquiries.length > 0 ? (
        <Card className="border-amber-200">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-amber-50">
                <TableRow className="border-b-2 border-amber-200">
                  <TableHead className="text-amber-900 font-semibold">Parent Name</TableHead>
                  <TableHead className="text-amber-900 font-semibold">Email</TableHead>
                  <TableHead className="text-amber-900 font-semibold">Phone</TableHead>
                  <TableHead className="text-amber-900 font-semibold">Child Name</TableHead>
                  <TableHead className="text-amber-900 font-semibold">Child Age</TableHead>
                  <TableHead className="text-amber-900 font-semibold">Program</TableHead>
                  <TableHead className="text-amber-900 font-semibold">Date</TableHead>
                  <TableHead className="text-amber-900 font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInquiries.map((inq) => (
                  <TableRow key={inq.id} className="border-b border-amber-100 hover:bg-amber-50">
                    <TableCell className="font-semibold text-gray-900">{inq.parent_name}</TableCell>
                    <TableCell className="text-gray-700 text-sm">{inq.email}</TableCell>
                    <TableCell className="text-gray-700 text-sm">{inq.phone}</TableCell>
                    <TableCell className="font-semibold text-gray-900">{inq.child_name}</TableCell>
                    <TableCell className="text-gray-700">{inq.child_age ?? '—'}</TableCell>
                    <TableCell>
                      <Badge className="bg-amber-100 text-amber-800">{inq.program}</Badge>
                    </TableCell>
                    <TableCell className="text-gray-700 text-sm">{formatDate(inq.created_at)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => setViewInquiry(inq)} className="text-amber-600 hover:bg-amber-100">
                        <Eye size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openConvert(inq)} className="text-amber-600 hover:bg-amber-100">
                        <UserPlus size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(inq)} className="text-red-600 hover:bg-red-100">
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
          icon={<Inbox size={32} />}
          title="No admission inquiries found"
          description="When parents submit admission inquiries, they will appear here for review"
        />
      )}

      {/* View Inquiry Dialog */}
      <Dialog open={!!viewInquiry} onOpenChange={(open) => { if (!open) setViewInquiry(null); }}>
        <DialogContent className="max-w-lg border-amber-200">
          <DialogHeader>
            <DialogTitle className="text-amber-900">Inquiry Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-amber-900">Parent Name</Label>
                <p className="mt-1 font-semibold text-gray-900">{viewInquiry?.parent_name}</p>
              </div>
              <div>
                <Label className="text-amber-900">Child Name</Label>
                <p className="mt-1 font-semibold text-gray-900">{viewInquiry?.child_name}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-amber-900">Email</Label>
                <p className="mt-1 text-gray-700 text-sm">{viewInquiry?.email}</p>
              </div>
              <div>
                <Label className="text-amber-900">Phone</Label>
                <p className="mt-1 text-gray-700 text-sm">{viewInquiry?.phone}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-amber-900">Child Age</Label>
                <p className="mt-1 text-gray-700">{viewInquiry?.child_age ?? '—'}</p>
              </div>
              <div>
                <Label className="text-amber-900">Program</Label>
                <p className="mt-1">
                  <Badge className="bg-amber-100 text-amber-800">{viewInquiry?.program}</Badge>
                </p>
              </div>
            </div>
            <div>
              <Label className="text-amber-900">Date Received</Label>
              <p className="mt-1 text-gray-700 text-sm">{viewInquiry ? formatDate(viewInquiry.created_at) : ''}</p>
            </div>
            <div>
              <Label className="text-amber-900">Message</Label>
              <div className="mt-1 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {viewInquiry?.message || 'No message provided.'}
                </p>
              </div>
            </div>
            <Button
              onClick={() => {
                const inq = viewInquiry;
                if (inq) {
                  setViewInquiry(null);
                  openConvert(inq);
                }
              }}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white gap-2"
            >
              <UserPlus size={16} />
              Convert to Student
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Convert to Student Dialog */}
      <Dialog
        open={!!convertInquiry}
        onOpenChange={(open) => {
          if (!open && !converting) closeConvert();
        }}
      >
        <DialogContent className="max-w-lg border-amber-200">
          <DialogHeader>
            <DialogTitle className="text-amber-900">Convert to Student</DialogTitle>
          </DialogHeader>
          {convertSuccess ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-800">{convertSuccess}</p>
              </div>
              <Button onClick={closeConvert} className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                Done
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-800">
                  This will create a new student record from the inquiry. An admission number will be auto-generated.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-amber-900">Child Name</Label>
                  <Input value={convertInquiry?.child_name ?? ''} disabled className="mt-2 border-amber-200 bg-gray-50" />
                </div>
                <div>
                  <Label className="text-amber-900">Program</Label>
                  <Input value={convertInquiry?.program ?? ''} disabled className="mt-2 border-amber-200 bg-gray-50" />
                </div>
              </div>

              <div>
                <Label className="text-amber-900">Admission Number</Label>
                <Input
                  value={`ADM${Date.now()}`}
                  disabled
                  className="mt-2 border-amber-200 bg-gray-50 font-mono text-amber-700"
                />
                <p className="text-xs text-gray-500 mt-1">Auto-generated. Final value is assigned on save.</p>
              </div>

              <div>
                <Label className="text-amber-900">Assign Class *</Label>
                <Select value={convertClassId} onValueChange={(value) => setConvertClassId(value)}>
                  <SelectTrigger className="mt-2 border-amber-200">
                    <SelectValue placeholder="Select a class" />
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
                <Input value="Active" disabled className="mt-2 border-amber-200 bg-gray-50" />
              </div>

              {convertError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-medium text-red-700">{convertError}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleConvert}
                  disabled={converting}
                  className="bg-amber-600 hover:bg-amber-700 text-white flex-1 gap-2"
                >
                  {converting ? 'Converting...' : (
                    <>
                      <UserPlus size={16} />
                      Create Student
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={closeConvert} disabled={converting} className="flex-1 border-amber-200">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
