
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Calendar, Smartphone, Phone, Wifi } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";

interface ReportsServiceProps {
  onBack: () => void;
}

interface Transaction {
  id: string;
  category: 'bundles' | 'airtime' | 'tills';
  amount: number;
  date: string;
  customerName?: string;
  phoneNumber?: string;
  tillNumber?: string;
  provider?: string;
  bundleName?: string;
  status?: string;
}

const ReportsService = ({ onBack }: ReportsServiceProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch till registrations
      const { data: tillData, error: tillError } = await supabase
        .from('till_registrations')
        .select('*')
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false });

      if (tillError) {
        console.error('Error fetching till registrations:', tillError);
      }

      // Fetch airtime purchases
      const { data: airtimeData, error: airtimeError } = await supabase
        .from('airtime_purchases')
        .select('*')
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false });

      if (airtimeError) {
        console.error('Error fetching airtime purchases:', airtimeError);
      }

      // Fetch bundle purchases
      const { data: bundleData, error: bundleError } = await supabase
        .from('bundle_purchases')
        .select('*')
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false });

      if (bundleError) {
        console.error('Error fetching bundle purchases:', bundleError);
      }

      // Transform data into unified transaction format
      const allTransactions: Transaction[] = [];

      // Add till registrations (earnings) - only count approved ones for earnings
      if (tillData) {
        tillData.forEach(till => {
          const commission = till.status === 'approved' ? 100 : 0; // Only approved tills earn commission
          allTransactions.push({
            id: till.id,
            category: 'tills',
            amount: commission,
            date: till.created_at || new Date().toISOString(),
            customerName: till.customer_name,
            phoneNumber: till.phone_number,
            tillNumber: till.till_number,
            status: till.status
          });
        });
      }

      // Add airtime purchases (expenses)
      if (airtimeData) {
        airtimeData.forEach(airtime => {
          allTransactions.push({
            id: airtime.id,
            category: 'airtime',
            amount: Number(airtime.amount),
            date: airtime.created_at || new Date().toISOString(),
            phoneNumber: airtime.phone_number,
            provider: airtime.provider
          });
        });
      }

      // Add bundle purchases (expenses)
      if (bundleData) {
        bundleData.forEach(bundle => {
          allTransactions.push({
            id: bundle.id,
            category: 'bundles',
            amount: Number(bundle.amount),
            date: bundle.created_at || new Date().toISOString(),
            phoneNumber: bundle.phone_number,
            provider: bundle.provider,
            bundleName: bundle.bundle_name
          });
        });
      }

      // Sort by date (newest first)
      allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setTransactions(allTransactions);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Error",
        description: "Failed to load transaction data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTransactions = () => {
    switch (activeTab) {
      case 'bundles':
        return transactions.filter(t => t.category === 'bundles');
      case 'airtime':
        return transactions.filter(t => t.category === 'airtime');
      case 'tills':
        return transactions.filter(t => t.category === 'tills');
      default:
        return transactions;
    }
  };

  const getTransactionIcon = (category: string) => {
    switch (category) {
      case 'bundles':
        return <Wifi className="w-4 h-4" />;
      case 'airtime':
        return <Phone className="w-4 h-4" />;
      case 'tills':
        return <Smartphone className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getTransactionColor = (category: string) => {
    switch (category) {
      case 'bundles':
        return 'bg-blue-100 text-blue-800';
      case 'airtime':
        return 'bg-orange-100 text-orange-800';
      case 'tills':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate totals - only approved tills count as earnings
  const totalEarnings = transactions
    .filter(t => t.category === 'tills' && t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalSpent = transactions
    .filter(t => t.category === 'bundles' || t.category === 'airtime')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalTillRegistrations = transactions.filter(t => t.category === 'tills').length;
  const approvedTillRegistrations = transactions.filter(t => t.category === 'tills' && t.amount > 0).length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Transaction Reports</h3>
          </div>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-mpesa-green mx-auto"></div>
          <p className="mt-4 text-mpesa-gray">Loading transaction data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Transaction Reports</h3>
        </div>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">KSH {totalEarnings}</p>
            <p className="text-sm text-gray-600">Total Earnings</p>
            <p className="text-xs text-gray-500">{approvedTillRegistrations} approved tills</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">KSH {totalSpent}</p>
            <p className="text-sm text-gray-600">Total Spent</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-mpesa-green">KSH {totalEarnings - totalSpent}</p>
            <p className="text-sm text-gray-600">Net Balance</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{totalTillRegistrations}</p>
            <p className="text-sm text-gray-600">Till Registrations</p>
            <p className="text-xs text-gray-500">{approvedTillRegistrations} approved</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'all', label: `All Transactions (${transactions.length})` },
          { id: 'tills', label: `Till Registrations (${transactions.filter(t => t.category === 'tills').length})` },
          { id: 'bundles', label: `Data Bundles (${transactions.filter(t => t.category === 'bundles').length})` },
          { id: 'airtime', label: `Airtime (${transactions.filter(t => t.category === 'airtime').length})` }
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab(tab.id)}
            className={activeTab === tab.id ? 'bg-mpesa-green hover:bg-mpesa-green/90' : ''}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {getFilteredTransactions().length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                {transactions.length === 0 
                  ? "No transactions found. Start by registering a till or making purchases!" 
                  : "No transactions found for the selected filter"
                }
              </p>
            ) : (
              getFilteredTransactions().map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getTransactionColor(transaction.category)}`}>
                      {getTransactionIcon(transaction.category)}
                    </div>
                    <div>
                      <p className="font-medium">
                        {transaction.category === 'tills' ? `Till Registration - ${transaction.customerName}` :
                         transaction.category === 'bundles' ? `${transaction.bundleName} - ${transaction.provider}` :
                         `${transaction.provider} Airtime`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {transaction.phoneNumber || transaction.tillNumber} • {new Date(transaction.date).toLocaleDateString()}
                        {transaction.status && transaction.category === 'tills' && (
                          <span className={`ml-2 px-2 py-1 rounded text-xs ${
                            transaction.status === 'approved' ? 'bg-green-100 text-green-800' :
                            transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            transaction.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {transaction.status}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.category === 'tills' && transaction.amount > 0 ? 'text-green-600' : 
                      transaction.category === 'tills' && transaction.amount === 0 ? 'text-gray-600' :
                      'text-red-600'
                    }`}>
                      {transaction.category === 'tills' && transaction.amount > 0 ? '+' : 
                       transaction.category === 'tills' && transaction.amount === 0 ? '' : '-'}
                      KSH {transaction.amount}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {transaction.category}
                    </Badge>
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

export default ReportsService;
