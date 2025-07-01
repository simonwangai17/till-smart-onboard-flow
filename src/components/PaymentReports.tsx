
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, CreditCard, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";

interface Payment {
  id: string;
  till_number: string;
  amount: number;
  created_at: string;
}

interface TillStats {
  till_number: string;
  transaction_count: number;
  total_amount: number;
  customer_name?: string;
  phone_number?: string;
}

interface PaymentReportsProps {
  onBack: () => void;
}

const PaymentReports: React.FC<PaymentReportsProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [tillStats, setTillStats] = useState<TillStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPayments();
    }
  }, [user]);

  const fetchPayments = async () => {
    if (!user) return;
    
    try {
      // Fetch payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('till_payments')
        .select('*')
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false });

      if (paymentsError) {
        console.error('Error fetching payments:', paymentsError);
        toast({
          title: "Error",
          description: "Failed to load payment data",
          variant: "destructive"
        });
        return;
      }

      setPayments(paymentsData || []);

      // Calculate till statistics
      const tillStatsMap = new Map<string, TillStats>();
      
      (paymentsData || []).forEach(payment => {
        const existing = tillStatsMap.get(payment.till_number);
        if (existing) {
          existing.transaction_count += 1;
          existing.total_amount += Number(payment.amount);
        } else {
          tillStatsMap.set(payment.till_number, {
            till_number: payment.till_number,
            transaction_count: 1,
            total_amount: Number(payment.amount)
          });
        }
      });

      // Get customer details for each till
      const tillNumbers = Array.from(tillStatsMap.keys());
      if (tillNumbers.length > 0) {
        const { data: tillsData } = await supabase
          .from('till_registrations')
          .select('till_number, customer_name, phone_number')
          .in('till_number', tillNumbers)
          .eq('status', 'approved');

        if (tillsData) {
          tillsData.forEach(till => {
            const stats = tillStatsMap.get(till.till_number);
            if (stats) {
              stats.customer_name = till.customer_name;
              stats.phone_number = till.phone_number;
            }
          });
        }
      }

      setTillStats(Array.from(tillStatsMap.values()).sort((a, b) => b.transaction_count - a.transaction_count));
    } catch (error: any) {
      console.error('Error fetching payments:', error);
      toast({
        title: "Error",
        description: "Failed to load payment data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(payment => 
    payment.till_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTillStats = tillStats.filter(stat => 
    stat.till_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (stat.customer_name && stat.customer_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPayments = payments.length;
  const totalAmount = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  const uniqueTills = new Set(payments.map(p => p.till_number)).size;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Reports</h3>
            <p className="text-mpesa-gray">View your payment transactions</p>
          </div>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-mpesa-green mx-auto"></div>
          <p className="mt-4 text-mpesa-gray">Loading payment reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Reports</h3>
          <p className="text-mpesa-gray">View your payment transactions and statistics</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <CreditCard className="w-8 h-8 text-mpesa-green mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{totalPayments}</p>
            <p className="text-sm text-mpesa-gray">Total Payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">KES {totalAmount.toLocaleString()}</p>
            <p className="text-sm text-mpesa-gray">Total Amount</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-blue-600 font-bold">{uniqueTills}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{uniqueTills}</p>
            <p className="text-sm text-mpesa-gray">Unique Tills</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by till number or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Till Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Till Payment Statistics</CardTitle>
          <CardDescription>
            Transaction count and total amounts per till number
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTillStats.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-mpesa-gray">
                  {tillStats.length === 0 
                    ? "No payments made yet" 
                    : "No statistics found matching your search criteria"
                  }
                </p>
              </div>
            ) : (
              filteredTillStats.map((stat) => (
                <div
                  key={stat.till_number}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-mpesa-green-light rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-mpesa-green">
                          {stat.customer_name ? stat.customer_name.split(' ').map(n => n[0]).join('') : 'T'}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {stat.customer_name || 'Unknown Customer'}
                        </h4>
                        <p className="text-sm text-mpesa-gray">
                          {stat.phone_number || stat.till_number}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-mpesa-green">
                        {stat.transaction_count} transactions
                      </p>
                      <p className="text-sm text-mpesa-gray">
                        KES {stat.total_amount.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-mpesa-gray">Till Number</p>
                      <p className="font-medium">{stat.till_number}</p>
                    </div>
                    <div>
                      <p className="text-mpesa-gray">Average Payment</p>
                      <p className="font-medium">
                        KES {(stat.total_amount / stat.transaction_count).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>
            Your latest payment transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPayments.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-mpesa-gray">
                  {payments.length === 0 
                    ? "No payments made yet" 
                    : "No payments found matching your search criteria"
                  }
                </p>
              </div>
            ) : (
              filteredPayments.slice(0, 10).map((payment) => (
                <div
                  key={payment.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Till {payment.till_number}</h4>
                        <p className="text-sm text-mpesa-gray">
                          {new Date(payment.created_at).toLocaleDateString()} at {new Date(payment.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        KES {Number(payment.amount).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentReports;
