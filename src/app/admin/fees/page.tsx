'use client';

import { useEffect, useState } from 'react';
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
import { Plus, Edit2, Trash2 } from 'lucide-react';

interface Fee {
  id: string;
  class_id: string;
  fee_type: 'tuition' | 'transport' | 'exam' | 'other';
  amount: number;
  academic_year: string;
  due_date: string;
  created_at: string;
}

interface Payment {
  id: string;
  student_id: string;
  fee_id: string;
  student_name: string;
  amount_paid: number;
  payment_date: string;
  payment_method: string;
  transaction_id: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

interface Class {
  id: string;
  name: string;
  section: string;
}

const MOCK_FEES: Fee[] = [
  {
    id: 'fee1',
    class_id: 'cls1',
    fee_type: 'tuition',
    amount: 5000,
    academic_year: '2024-2025',
    due_date: '2024-06-15',
    created_at: '2024-06-01',
  },
  {
    id: 'fee2',
    class_id: 'cls1',
    fee_type: 'transport',
    amount: 2000,
    academic_year: '2024-2025',
    due_date: '2024-06-15',
    created_at: '2024-06-01',
  },
];

const MOCK_PAYMENTS: Payment[] = [
  {
    id: 'p1',
    student_id: 's1',
    fee_id: 'fee1',
    student_name: 'Aarav Sharma',
    amount_paid: 5000,
    payment_date: '2024-06-10',
    payment_method: 'bank_transfer',
    transaction_id: 'TXN001',
    status: 'completed',
    created_at: '2024-06-10',
  },
  {
    id: 'p2',
    student_id: 's2',
    fee_id: 'fee1',
    student_name: 'Priya Verma',
    amount_paid: 2500,
    payment_date: '2024-06-12',
    payment_method: 'check',
    transaction_id: 'CHK001',
    status: 'completed',
    created_at: '2024-06-12',
  },
];

const MOCK_CLASSES: Class[] = [
  { id: 'cls1', name: 'Nursery', section: 'A' },
  { id: 'cls2', name: 'Nursery', section: 'B' },
];

export default function FeesPage() {
  const [fees, setFees] = useState<Fee[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'structure' | 'payments'>('structure');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    class_id: '',
    fee_type: 'tuition' as const,
    amount: '',
    academic_year: '',
    due_date: '',
  });
  const [paymentFormData, setPaymentFormData] = useState({
    student_id: '',
    fee_id: '',
    amount_paid: '',
    payment_date: '',
    payment_method: 'bank_transfer',
    transaction_id: '',
    status: 'completed' as const,
  });
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const supabase = createClient();

      // Fetch classes
      const { data: classesData } = await supabase
        .from('classes')
        .select('*')
        .limit(10);

      if (classesData && classesData.length > 0) {
        setClasses(classesData);
      } else {
        setClasses(MOCK_CLASSES);
      }

      // Fetch fees
      const { data: feesData } = await supabase
        .from('fees')
        .select('*')
        .limit(50);

      if (feesData && feesData.length > 0) {
        setFees(feesData);
      } else {
        setFees(MOCK_FEES);
      }

      // Fetch payments
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('*')
        .limit(100);

      if (paymentsData && paymentsData.length > 0) {
        // Enrich with student names (would need proper join in real implementation)
        setPayments(paymentsData as Payment[]);
      } else {
        setPayments(MOCK_PAYMENTS);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setFees(MOCK_FEES);
      setPayments(MOCK_PAYMENTS);
      setClasses(MOCK_CLASSES);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFee = async () => {
    if (!formData.class_id || !formData.amount || !formData.academic_year) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const supabase = createClient();
      const data = {
        class_id: formData.class_id,
        fee_type: formData.fee_type,
        amount: parseFloat(formData.amount),
        academic_year: formData.academic_year,
        due_date: formData.due_date,
      };

      if (editingId) {
        const { error } = await supabase
          .from('fees')
          .update(data)
          .eq('id', editingId);
        if (!error) {
          setFees(fees.map(f => f.id === editingId ? { ...f, ...data } : f));
        }
      } else {
        const { data: result, error } = await supabase
          .from('fees')
          .insert([data])
          .select();
        if (!error && result) {
          setFees([...fees, result[0]]);
        }
      }
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving fee:', error);
    }
  };

  const handleAddPayment = async () => {
    if (!paymentFormData.student_id || !paymentFormData.fee_id || !paymentFormData.amount_paid) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const supabase = createClient();
      const data = {
        student_id: paymentFormData.student_id,
        fee_id: paymentFormData.fee_id,
        amount_paid: parseFloat(paymentFormData.amount_paid),
        payment_date: paymentFormData.payment_date,
        payment_method: paymentFormData.payment_method,
        transaction_id: paymentFormData.transaction_id,
        status: paymentFormData.status,
      };

      const { data: result, error } = await supabase
        .from('payments')
        .insert([data])
        .select();
      if (!error && result) {
        setPayments([...payments, result[0] as Payment]);
      }
      setPaymentDialogOpen(false);
      resetPaymentForm();
    } catch (error) {
      console.error('Error saving payment:', error);
    }
  };

  const handleDeleteFee = async (id: string) => {
    if (confirm('Are you sure you want to delete this fee?')) {
      try {
        const supabase = createClient();
        await supabase.from('fees').delete().eq('id', id);
        setFees(fees.filter(f => f.id !== id));
      } catch (error) {
        console.error('Error deleting fee:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      class_id: '',
      fee_type: 'tuition',
      amount: '',
      academic_year: '',
      due_date: '',
    });
    setEditingId(null);
  };

  const resetPaymentForm = () => {
    setPaymentFormData({
      student_id: '',
      fee_id: '',
      amount_paid: '',
      payment_date: '',
      payment_method: 'bank_transfer',
      transaction_id: '',
      status: 'completed',
    });
  };

  const getClassName = (classId: string) => {
    const cls = classes.find(c => c.id === classId);
    return cls ? `${cls.name} - ${cls.section}` : 'N/A';
  };

  const calculateStats = () => {
    const totalCollected = payments.reduce((sum, p) => sum + (p.status === 'completed' ? p.amount_paid : 0), 0);
    const pendingAmount = payments.reduce((sum, p) => sum + (p.status === 'pending' ? p.amount_paid : 0), 0);
    const totalFee = fees.reduce((sum, f) => sum + f.amount, 0);

    return { totalCollected, pendingAmount, totalFee };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
          <p className="mt-4 text-gray-600">Loading fees data...</p>
        </div>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Fee Management</h1>
          <p className="text-gray-600 mt-1">Manage fees and track payments</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === 'structure' ? 'default' : 'outline'}
            onClick={() => setView('structure')}
            className={view === 'structure' ? 'bg-amber-600 hover:bg-amber-700' : 'border-amber-200'}
          >
            Fee Structure
          </Button>
          <Button
            variant={view === 'payments' ? 'default' : 'outline'}
            onClick={() => setView('payments')}
            className={view === 'payments' ? 'bg-amber-600 hover:bg-amber-700' : 'border-amber-200'}
          >
            Payments
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-amber-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <p className="text-sm text-gray-600 mb-2">Total Collected</p>
          <p className="text-3xl font-bold text-green-600">₹{stats.totalCollected.toLocaleString()}</p>
        </Card>
        <Card className="p-6 border-amber-200 bg-gradient-to-br from-yellow-50 to-orange-50">
          <p className="text-sm text-gray-600 mb-2">Pending</p>
          <p className="text-3xl font-bold text-orange-600">₹{stats.pendingAmount.toLocaleString()}</p>
        </Card>
        <Card className="p-6 border-amber-200 bg-gradient-to-br from-blue-50 to-cyan-50">
          <p className="text-sm text-gray-600 mb-2">Total Fee</p>
          <p className="text-3xl font-bold text-blue-600">₹{stats.totalFee.toLocaleString()}</p>
        </Card>
      </div>

      {view === 'structure' ? (
        <>
          {/* Fee Structure */}
          <div className="flex justify-end">
            <Button
              onClick={() => {
                resetForm();
                setDialogOpen(true);
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white gap-2"
            >
              <Plus size={20} />
              Add Fee
            </Button>
          </div>

          {fees.length > 0 ? (
            <Card className="border-amber-200">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-amber-50">
                    <TableRow className="border-b-2 border-amber-200">
                      <TableHead className="text-amber-900 font-semibold">Class</TableHead>
                      <TableHead className="text-amber-900 font-semibold">Fee Type</TableHead>
                      <TableHead className="text-amber-900 font-semibold">Amount</TableHead>
                      <TableHead className="text-amber-900 font-semibold">Academic Year</TableHead>
                      <TableHead className="text-amber-900 font-semibold">Due Date</TableHead>
                      <TableHead className="text-amber-900 font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fees.map(fee => (
                      <TableRow key={fee.id} className="border-b border-amber-100 hover:bg-amber-50">
                        <TableCell className="font-semibold text-gray-900">
                          {getClassName(fee.class_id)}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-amber-100 text-amber-800 capitalize">
                            {fee.fee_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-gray-900">
                          ₹{fee.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-gray-700">{fee.academic_year}</TableCell>
                        <TableCell className="text-gray-600 text-sm">
                          {new Date(fee.due_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:bg-red-100"
                            onClick={() => handleDeleteFee(fee.id)}
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
              title="No fees found"
              description="Create the first fee structure"
              action={{
                label: 'Add Fee',
                onClick: () => {
                  resetForm();
                  setDialogOpen(true);
                },
              }}
            />
          )}
        </>
      ) : (
        <>
          {/* Payments */}
          <div className="flex justify-end">
            <Button
              onClick={() => {
                resetPaymentForm();
                setPaymentDialogOpen(true);
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white gap-2"
            >
              <Plus size={20} />
              Add Payment
            </Button>
          </div>

          {payments.length > 0 ? (
            <Card className="border-amber-200">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-amber-50">
                    <TableRow className="border-b-2 border-amber-200">
                      <TableHead className="text-amber-900 font-semibold">Student Name</TableHead>
                      <TableHead className="text-amber-900 font-semibold">Amount Paid</TableHead>
                      <TableHead className="text-amber-900 font-semibold">Payment Date</TableHead>
                      <TableHead className="text-amber-900 font-semibold">Method</TableHead>
                      <TableHead className="text-amber-900 font-semibold">Transaction ID</TableHead>
                      <TableHead className="text-amber-900 font-semibold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map(payment => (
                      <TableRow key={payment.id} className="border-b border-amber-100 hover:bg-amber-50">
                        <TableCell className="font-semibold text-gray-900">
                          {payment.student_name}
                        </TableCell>
                        <TableCell className="font-semibold text-gray-900">
                          ₹{payment.amount_paid.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-gray-600 text-sm">
                          {new Date(payment.payment_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-gray-700 capitalize">
                          {payment.payment_method.replace('_', ' ')}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-gray-700">
                          {payment.transaction_id}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`${
                              payment.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : payment.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          ) : (
            <EmptyState
              title="No payments found"
              description="Add the first payment record"
              action={{
                label: 'Add Payment',
                onClick: () => {
                  resetPaymentForm();
                  setPaymentDialogOpen(true);
                },
              }}
            />
          )}
        </>
      )}

      {/* Fee Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl border-amber-200">
          <DialogHeader>
            <DialogTitle className="text-amber-900">
              {editingId ? 'Edit Fee' : 'Add New Fee'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-amber-900">Class</Label>
                <Select value={formData.class_id} onValueChange={(value) => setFormData({ ...formData, class_id: value })}>
                  <SelectTrigger className="mt-2 border-amber-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map(cls => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name} - {cls.section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-amber-900">Fee Type</Label>
                <Select value={formData.fee_type} onValueChange={(value: any) => setFormData({ ...formData, fee_type: value })}>
                  <SelectTrigger className="mt-2 border-amber-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tuition">Tuition</SelectItem>
                    <SelectItem value="transport">Transport</SelectItem>
                    <SelectItem value="exam">Exam</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-amber-900">Amount</Label>
                <Input
                  type="number"
                  placeholder="5000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="mt-2 border-amber-200"
                />
              </div>
              <div>
                <Label className="text-amber-900">Academic Year</Label>
                <Input
                  placeholder="2024-2025"
                  value={formData.academic_year}
                  onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                  className="mt-2 border-amber-200"
                />
              </div>
            </div>

            <div>
              <Label className="text-amber-900">Due Date</Label>
              <Input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="mt-2 border-amber-200"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleAddFee}
                className="bg-amber-600 hover:bg-amber-700 text-white flex-1"
              >
                {editingId ? 'Update Fee' : 'Add Fee'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  resetForm();
                }}
                className="flex-1 border-amber-200"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="max-w-2xl border-amber-200">
          <DialogHeader>
            <DialogTitle className="text-amber-900">Add Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-amber-900">Amount Paid</Label>
                <Input
                  type="number"
                  placeholder="5000"
                  value={paymentFormData.amount_paid}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, amount_paid: e.target.value })}
                  className="mt-2 border-amber-200"
                />
              </div>
              <div>
                <Label className="text-amber-900">Payment Date</Label>
                <Input
                  type="date"
                  value={paymentFormData.payment_date}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, payment_date: e.target.value })}
                  className="mt-2 border-amber-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-amber-900">Payment Method</Label>
                <Select value={paymentFormData.payment_method} onValueChange={(value) => setPaymentFormData({ ...paymentFormData, payment_method: value })}>
                  <SelectTrigger className="mt-2 border-amber-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-amber-900">Transaction ID</Label>
                <Input
                  placeholder="TXN001"
                  value={paymentFormData.transaction_id}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, transaction_id: e.target.value })}
                  className="mt-2 border-amber-200"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleAddPayment}
                className="bg-amber-600 hover:bg-amber-700 text-white flex-1"
              >
                Add Payment
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setPaymentDialogOpen(false);
                  resetPaymentForm();
                }}
                className="flex-1 border-amber-200"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
