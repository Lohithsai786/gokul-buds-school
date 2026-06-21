'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EmptyState } from '@/components/shared';
import { CreditCard, AlertCircle, CheckCircle } from 'lucide-react';

interface Fee {
  id: string;
  class_id: string;
  fee_type: string;
  amount: number;
  academic_year: string;
  due_date: string;
  created_at: string;
}

interface Payment {
  id: string;
  student_id: string;
  fee_id: string;
  amount_paid: number;
  payment_date: string;
  payment_method: string;
  transaction_id: string;
  status: string;
  remarks?: string;
  fee?: { id: string; fee_type: string; amount: number };
  created_at: string;
}

interface Student {
  id: string;
  full_name: string;
  class_id: string;
}

export default function FeesPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<Student | null>(null);
  const [fees, setFees] = useState<Fee[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

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
            // Get fees for the class
            const { data: feesData } = await supabase
              .from('fees')
              .select('*')
              .eq('class_id', studentData.class_id)
              .order('due_date', { ascending: true });

            setFees(feesData || []);
          }

          // Get payment history
          const { data: paymentsData } = await supabase
            .from('payments')
            .select(
              `
              id,
              student_id,
              fee_id,
              amount_paid,
              payment_date,
              payment_method,
              transaction_id,
              status,
              remarks,
              fees:fee_id(id, fee_type, amount),
              created_at
            `
            )
            .eq('student_id', parentData.student_id)
            .order('payment_date', { ascending: false });

          setPayments(paymentsData || []);
        }
      } catch (error) {
        console.error('Error loading fees:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [supabase]);

  const calculateTotalFees = () => {
    return fees.reduce((sum, fee) => sum + fee.amount, 0);
  };

  const calculatePaidAmount = () => {
    return payments
      .filter((p) => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount_paid, 0);
  };

  const calculatePendingAmount = () => {
    return calculateTotalFees() - calculatePaidAmount();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            Completed
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
            Pending
          </Badge>
        );
      case 'failed':
        return <Badge className="bg-red-100 text-red-700 border-red-200">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'credit_card':
        return <Badge variant="outline">Credit Card</Badge>;
      case 'debit_card':
        return <Badge variant="outline">Debit Card</Badge>;
      case 'bank_transfer':
        return <Badge variant="outline">Bank Transfer</Badge>;
      case 'cheque':
        return <Badge variant="outline">Cheque</Badge>;
      default:
        return <Badge variant="outline">{method}</Badge>;
    }
  };

  const totalFees = calculateTotalFees();
  const paidAmount = calculatePaidAmount();
  const pendingAmount = calculatePendingAmount();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block mb-4">
            <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600">Loading fee information...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <EmptyState
        icon={<CreditCard className="w-8 h-8" />}
        title="No Student Linked"
        description="No student linked to your account. Please contact administration."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Fee Status</h1>
        <p className="text-gray-600">Payment information for {student.full_name}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Fees */}
        <Card className="p-6 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
          <div className="text-sm font-semibold text-gray-700 mb-2">Total Fees</div>
          <div className="text-4xl font-bold text-amber-600">
            {totalFees.toLocaleString('en-IN', {
              style: 'currency',
              currency: 'INR',
            })}
          </div>
          <p className="text-xs text-gray-600 mt-2">Annual</p>
        </Card>

        {/* Paid Amount */}
        <Card className="p-6 border-green-200 bg-gradient-to-br from-green-50 to-teal-50">
          <div className="text-sm font-semibold text-gray-700 mb-2">Paid</div>
          <div className="text-4xl font-bold text-green-600">
            {paidAmount.toLocaleString('en-IN', {
              style: 'currency',
              currency: 'INR',
            })}
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {totalFees > 0 ? Math.round((paidAmount / totalFees) * 100) : 0}% paid
          </p>
        </Card>

        {/* Pending Amount */}
        <Card
          className={`p-6 ${
            pendingAmount > 0
              ? 'border-red-200 bg-gradient-to-br from-red-50 to-pink-50'
              : 'border-green-200 bg-gradient-to-br from-green-50 to-teal-50'
          }`}
        >
          <div className="text-sm font-semibold text-gray-700 mb-2">Pending</div>
          <div
            className={`text-4xl font-bold ${
              pendingAmount > 0 ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {pendingAmount.toLocaleString('en-IN', {
              style: 'currency',
              currency: 'INR',
            })}
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {totalFees > 0 ? Math.round((pendingAmount / totalFees) * 100) : 0}% pending
          </p>
        </Card>
      </div>

      {/* Alert if pending */}
      {pendingAmount > 0 && (
        <Card className="p-4 border-red-300 bg-red-50 border-l-4 border-l-red-600">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900 mb-1">Outstanding Balance</p>
              <p className="text-sm text-red-800">
                There is a pending payment of{' '}
                <span className="font-bold">
                  {pendingAmount.toLocaleString('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                  })}
                </span>
                . Please submit payment at your earliest convenience.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Fee Breakdown */}
      {fees.length > 0 && (
        <Card className="border-amber-200">
          <div className="p-6 border-b border-amber-200 bg-gradient-to-r from-amber-100 to-orange-100">
            <h2 className="text-lg font-bold text-gray-900">Fee Breakdown</h2>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-amber-200">
                  <TableHead className="text-gray-700 font-bold">Fee Type</TableHead>
                  <TableHead className="text-gray-700 font-bold">Amount</TableHead>
                  <TableHead className="text-gray-700 font-bold">Due Date</TableHead>
                  <TableHead className="text-gray-700 font-bold">Academic Year</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fees.map((fee) => (
                  <TableRow key={fee.id} className="border-amber-100 hover:bg-amber-50">
                    <TableCell className="font-medium text-gray-900">
                      {fee.fee_type}
                    </TableCell>
                    <TableCell className="text-amber-600 font-bold">
                      {fee.amount.toLocaleString('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                      })}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {new Date(fee.due_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-gray-600">{fee.academic_year}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Payment History */}
      {payments.length > 0 && (
        <Card className="border-amber-200">
          <div className="p-6 border-b border-amber-200 bg-gradient-to-r from-amber-100 to-orange-100">
            <h2 className="text-lg font-bold text-gray-900">Payment History</h2>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-amber-200">
                  <TableHead className="text-gray-700 font-bold">Date</TableHead>
                  <TableHead className="text-gray-700 font-bold">Amount</TableHead>
                  <TableHead className="text-gray-700 font-bold">Method</TableHead>
                  <TableHead className="text-gray-700 font-bold">Transaction ID</TableHead>
                  <TableHead className="text-gray-700 font-bold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id} className="border-amber-100 hover:bg-amber-50">
                    <TableCell className="text-gray-900 font-medium">
                      {new Date(payment.payment_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-amber-600 font-bold">
                      {payment.amount_paid.toLocaleString('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                      })}
                    </TableCell>
                    <TableCell>{getMethodBadge(payment.payment_method)}</TableCell>
                    <TableCell className="text-sm text-gray-600 font-mono">
                      {payment.transaction_id || '-'}
                    </TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* No data states */}
      {fees.length === 0 && (
        <EmptyState
          icon={<CreditCard className="w-8 h-8" />}
          title="No Fee Information"
          description="Fee information will be available once it's configured by the school."
        />
      )}

      {/* Info Card */}
      <Card className="p-6 border-blue-200 bg-blue-50">
        <h3 className="font-bold text-blue-900 mb-3">Payment Information</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex gap-2">
            <span className="text-blue-600">•</span>
            <span>All fees must be paid by the due date mentioned above</span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-600">•</span>
            <span>Multiple payment methods are accepted for your convenience</span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-600">•</span>
            <span>
              Keep payment receipts and transaction IDs for your records
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-600">•</span>
            <span>
              Contact the office for payment plans or financial assistance if needed
            </span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
