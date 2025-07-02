
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Wallet as WalletIcon, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface WalletProps {
  onBack: () => void;
  walletBalance: number;
}

interface PayoutData {
  name: string;
  payment_number: string;
  amount: number;
}

interface Transaction {
  id: string;
  transaction_type: string;
  amount: number;
  description: string;
  created_at: string;
}

const Wallet = ({ onBack, walletBalance }: WalletProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showPayoutForm, setShowPayoutForm] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [payoutData, setPayoutData] = useState<PayoutData>({
    name: '',
    payment_number: '',
    amount: walletBalance
  });

  useEffect(() => {
    if (user) {
      fetchWalletData();
    }
  }, [user]);

  useEffect(() => {
    setPayoutData(prev => ({ ...prev, amount: walletBalance }));
  }, [walletBalance]);

  const fetchWalletData = async () => {
    if (!user) return;
    
    try {
      // Fetch wallet transactions
      const { data: transactionData, error: transactionError } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false });

      if (transactionError) throw transactionError;

      // Fetch payouts
      const { data: payoutData, error: payoutError } = await supabase
        .from('payouts')
        .select('*')
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false });

      if (payoutError) throw payoutError;

      setTransactions(transactionData || []);
      setPayouts(payoutData || []);
    } catch (error: any) {
      console.error('Error fetching wallet data:', error);
      toast({
        title: "Error",
        description: "Failed to load wallet data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (payoutData.amount > walletBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You cannot withdraw more than your available balance",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('payouts')
        .insert([{
          agent_id: user.id,
          name: payoutData.name,
          payment_number: payoutData.payment_number,
          amount: payoutData.amount
        }]);

      if (error) throw error;

      toast({
        title: "Payout Requested",
        description: "Your payout request has been submitted successfully",
      });

      setShowPayoutForm(false);
      setPayoutData({ name: '', payment_number: '', amount: walletBalance });
      fetchWalletData();
    } catch (error: any) {
      console.error('Payout error:', error);
      toast({
        title: "Payout Failed",
        description: error.message || "Failed to process payout request",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const totalEarnings = transactions
    .filter(t => t.transaction_type === 'earning')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalSpending = transactions
    .filter(t => t.transaction_type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h3 className="text-2xl font-bold text-gray-900">Wallet</h3>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading wallet data...</p>
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
          <h3 className="text-2xl font-bold text-gray-900">My Wallet</h3>
        </div>
        <Button
          onClick={() => setShowPayoutForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white"
          disabled={walletBalance <= 0}
        >
          <DollarSign className="w-4 h-4 mr-2" />
          Request Payout
        </Button>
      </div>

      {/* Wallet Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-green-200">
          <CardContent className="p-4 text-center">
            <WalletIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">KSH {walletBalance}</p>
            <p className="text-sm text-gray-600">Available Balance</p>
          </CardContent>
        </Card>
        
        <Card className="border-blue-200">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">KSH {totalEarnings}</p>
            <p className="text-sm text-gray-600">Total Earnings</p>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardContent className="p-4 text-center">
            <TrendingDown className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-600">KSH {totalSpending}</p>
            <p className="text-sm text-gray-600">Total Spending</p>
          </CardContent>
        </Card>
      </div>

      {/* Payout Form */}
      {showPayoutForm && (
        <Card>
          <CardHeader>
            <CardTitle>Request Payout</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePayout} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={payoutData.name}
                  onChange={(e) => setPayoutData({ ...payoutData, name: e.target.value })}
                  required
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <Label htmlFor="payment_number">Payment Number (M-Pesa/Bank)</Label>
                <Input
                  id="payment_number"
                  type="text"
                  value={payoutData.payment_number}
                  onChange={(e) => setPayoutData({ ...payoutData, payment_number: e.target.value })}
                  required
                  placeholder="Enter M-Pesa number or bank account"
                />
              </div>
              
              <div>
                <Label htmlFor="amount">Amount (KSH)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={payoutData.amount}
                  onChange={(e) => setPayoutData({ ...payoutData, amount: Number(e.target.value) })}
                  required
                  max={walletBalance}
                  min={1}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Maximum available: KSH {walletBalance}
                </p>
              </div>

              <div className="flex space-x-2">
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700"
                  disabled={submitting}
                >
                  {submitting ? 'Processing...' : 'Request Payout'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPayoutForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No transactions found</p>
            ) : (
              transactions.slice(0, 10).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.transaction_type === 'earning' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.transaction_type === 'earning' ? '+' : '-'}KSH {transaction.amount}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {transaction.transaction_type}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payout History */}
      {payouts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payout History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {payouts.map((payout: any) => (
                <div key={payout.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{payout.name}</p>
                    <p className="text-sm text-gray-600">{payout.payment_number}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(payout.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">KSH {payout.amount}</p>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        payout.status === 'completed' ? 'bg-green-100 text-green-800' :
                        payout.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {payout.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Wallet;
