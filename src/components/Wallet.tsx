
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Wallet as WalletIcon, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useSupabaseData } from '@/hooks/useSupabaseData';

interface WalletProps {
  onBack: () => void;
}

interface PayoutData {
  name: string;
  payment_number: string;
  amount: number;
}

const Wallet = ({ onBack }: WalletProps) => {
  const { toast } = useToast();
  const { walletBalance, payouts, requestPayout, refetch } = useSupabaseData();
  const [showPayoutForm, setShowPayoutForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [payoutData, setPayoutData] = useState<PayoutData>({
    name: '',
    payment_number: '',
    amount: walletBalance
  });

  useEffect(() => {
    setPayoutData(prev => ({ ...prev, amount: walletBalance }));
  }, [walletBalance]);

  const handlePayout = async (e: React.FormEvent) => {
    e.preventDefault();

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
      await requestPayout({
        name: payoutData.name,
        payment_number: payoutData.payment_number,
        amount: payoutData.amount
      });

      toast({
        title: "Payout Requested",
        description: "Your payout request has been submitted successfully",
      });

      setShowPayoutForm(false);
      setPayoutData({ name: '', payment_number: '', amount: walletBalance });
      refetch();
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
      <Card className="border-green-200">
        <CardContent className="p-6 text-center">
          <WalletIcon className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <p className="text-3xl font-bold text-green-600 mb-2">KSH {walletBalance.toLocaleString()}</p>
          <p className="text-gray-600">Available Balance</p>
        </CardContent>
      </Card>

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
                  Maximum available: KSH {walletBalance.toLocaleString()}
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
                    <p className="font-semibold text-gray-900">KSH {payout.amount.toLocaleString()}</p>
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
