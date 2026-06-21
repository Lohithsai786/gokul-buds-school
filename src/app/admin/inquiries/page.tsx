'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared';
import { Trash2, Eye, Download, Search, Inbox } from 'lucide-react';

interface ContactSubmission {
  id: string;
  full_name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}

export default function InquiriesPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [viewing, setViewing] = useState<ContactSubmission | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from('contact_submissions')
        .select('id, full_name, email, subject, message, created_at')
        .order('created_at', { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
        setSubmissions([]);
      } else {
        setSubmissions((data ?? []) as ContactSubmission[]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (submission: ContactSubmission) => {
    if (!confirm(`Delete inquiry from ${submission.full_name}? This cannot be undone.`)) return;
    try {
      const supabase = createClient();
      const { error: deleteError } = await supabase
        .from('contact_submissions')
        .delete()
        .eq('id', submission.id);
      if (deleteError) {
        setError(deleteError.message);
        return;
      }
      setSubmissions((prev) => prev.filter((s) => s.id !== submission.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete inquiry');
    }
  };

  const exportCsv = () => {
    const csv = [
      ['Name', 'Email', 'Subject', 'Message', 'Date'],
      ...submissions.map((s) => [
        s.full_name,
        s.email,
        s.subject,
        s.message,
        new Date(s.created_at).toLocaleString(),
      ]),
    ]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contact_inquiries.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const truncate = (text: string, max: number = 60) => {
    if (text.length <= max) return text;
    return text.slice(0, max).trimEnd() + '…';
  };

  const filteredSubmissions = submissions.filter((s) => {
    const q = searchTerm.toLowerCase();
    return (
      s.full_name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.subject.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
          <p className="mt-4 text-gray-600">Loading inquiries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Inquiries Management</h1>
          <p className="text-gray-600 mt-1">View, search, and manage contact form submissions</p>
        </div>
        <Button onClick={exportCsv} className="bg-amber-600 hover:bg-amber-700 text-white gap-2">
          <Download size={20} />
          Export CSV
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}

      <Card className="p-4 border-amber-200 bg-white">
        <Label className="text-amber-900">Search</Label>
        <div className="relative mt-2">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
          <Input
            placeholder="Search by name, email, or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-amber-200 focus:border-amber-500"
          />
        </div>
      </Card>

      {filteredSubmissions.length > 0 ? (
        <Card className="border-amber-200">
          {submissions.length > 0 && (
            <div className="px-4 py-3 border-b border-amber-100 bg-amber-50/50">
              <Badge className="bg-amber-100 text-amber-800">
                {filteredSubmissions.length} of {submissions.length} inquiries
              </Badge>
            </div>
          )}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-amber-50">
                <TableRow className="border-b-2 border-amber-200">
                  <TableHead className="text-amber-900 font-semibold">Name</TableHead>
                  <TableHead className="text-amber-900 font-semibold">Email</TableHead>
                  <TableHead className="text-amber-900 font-semibold">Subject</TableHead>
                  <TableHead className="text-amber-900 font-semibold">Message</TableHead>
                  <TableHead className="text-amber-900 font-semibold">Date</TableHead>
                  <TableHead className="text-amber-900 font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((submission) => (
                  <TableRow key={submission.id} className="border-b border-amber-100 hover:bg-amber-50">
                    <TableCell className="font-semibold text-gray-900">{submission.full_name}</TableCell>
                    <TableCell className="text-gray-700 text-sm">{submission.email}</TableCell>
                    <TableCell className="text-gray-700 text-sm">{submission.subject}</TableCell>
                    <TableCell className="text-gray-600 text-sm max-w-xs">
                      {truncate(submission.message)}
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm whitespace-nowrap">
                      {new Date(submission.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewing(submission)}
                        className="text-amber-600 hover:bg-amber-100"
                      >
                        <Eye size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(submission)}
                        className="text-red-600 hover:bg-red-100"
                      >
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
          title="No inquiries found"
          description={searchTerm ? 'Try adjusting your search terms' : 'Contact form submissions will appear here'}
          icon={<Inbox size={48} className="mx-auto text-amber-300" />}
        />
      )}

      {/* View Dialog */}
      <Dialog open={!!viewing} onOpenChange={(open) => { if (!open) setViewing(null); }}>
        <DialogContent className="max-w-2xl border-amber-200">
          <DialogHeader>
            <DialogTitle className="text-amber-900">Inquiry Details</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-amber-900">Name</Label>
                  <p className="mt-1 font-semibold text-gray-900">{viewing.full_name}</p>
                </div>
                <div>
                  <Label className="text-amber-900">Email</Label>
                  <p className="mt-1 text-gray-700 text-sm break-all">{viewing.email}</p>
                </div>
              </div>
              <div>
                <Label className="text-amber-900">Subject</Label>
                <p className="mt-1 text-gray-900 font-medium">{viewing.subject}</p>
              </div>
              <div>
                <Label className="text-amber-900">Message</Label>
                <div className="mt-1 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">{viewing.message}</p>
                </div>
              </div>
              <div>
                <Label className="text-amber-900">Received</Label>
                <p className="mt-1 text-gray-500 text-sm">{new Date(viewing.created_at).toLocaleString()}</p>
              </div>
              <div className="flex gap-3 pt-4">
                <Button onClick={() => setViewing(null)} className="bg-amber-600 hover:bg-amber-700 text-white flex-1">
                  Close
                </Button>
                <Button
                  variant="outline"
                  onClick={() => { setViewing(null); handleDelete(viewing); }}
                  className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
