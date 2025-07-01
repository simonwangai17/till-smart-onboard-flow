
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Search, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";

interface TillPaymentProps {
  onBack: () => void;
}

const TillPayment: React.FC<TillPaymentProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tillNumber, setTillNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchedTill, setSearchedTill] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const searchTillNumber = async () => {
    if (!tillNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a till number to search",
        variant: "destructive"
      });
      return;
    }

    setSearchLoading(true);
    try {
      const { data, error } = await supabase
        .from('till_registrations')
        .select('*')
        .eq('till_number', tillNumber.trim())
        .eq('status', 'approved')
        .single();

      if (error || !data) {
        toast({
          title: "Till Not Found",
          description: "No approved till found with this number",
          variant: "destructive"
        });
        setSearchedTill(null);
        return;
      }

      setSearchedTill(data);
      toast({
        title: "Till Found",
        description: `Found till for ${data.customer_name}`,
        variant: "default"
      });
    } catch (error: any) {
      console.error('Error searching till:', error);
      toast({
        title: "Error",
        description: "Failed to search till number",
        variant: "destructive"
      });
      setSearchedTill(null);
    } finally {
      setSearchLoading(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to make payments",
        variant: "destructive"
      });
      return;
    }

    if (!searchedTill) {
      toast({
        title: "Error",
        description: "Please search and select a valid till number first",
        variant: "destructive"
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('till_payments')
        .insert([{
          agent_id: user.id,
          till_number: tillNumber.trim(),
          amount: parseFloat(amount)
        }])
        .select()
        .single();

      if (error) {
        console.error('Error making payment:', error);
        toast({
          title: "Error",
          description: "Failed to process payment",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Payment Successful",
        description: `Payment of KES ${amount} made to till ${tillNumber}`,
        variant: "default"
      });

      // Reset form
      setTillNumber('');
      setAmount('');
      setSearchedTill(null);
    } catch (error: any) {
      console.error('Error making payment:', error);
      toast({
        title: "Error",
        description: "Failed to process payment",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Make Payment</h3>
          <p className="text-mpesa-gray">Pay to registered till numbers</p>
        </div>
      </div>

      {/* Till Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-mpesa-green" />
            <span>Search Till Number</span>
          </CardTitle>
          <CardDescription>
            Enter the till number to verify it's registered and approved
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <div className="flex-1">
              <Input
                placeholder="Enter till number..."
                value={tillNumber}
                onChange={(e) => setTillNumber(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchTillNumber()}
              />
            </div>
            <Button 
              onClick={searchTillNumber} 
              disabled={searchLoading}
              className="bg-mpesa-green hover:bg-mpesa-green/90"
            >
              <Search className="w-4 h-4 mr-2" />
              {searchLoading ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {searchedTill && (
            <div className="border border-green-200 rounded-lg p-4 bg-green-50/50">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-green-700">
                    {searchedTill.customer_name.split(' ').map((n: string) => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{searchedTill.customer_name}</h4>
                  <p className="text-sm text-mpesa-gray">{searchedTill.phone_number}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-mpesa-gray">Store Number</p>
                  <p className="font-medium">{searchedTill.store_number}</p>
                </div>
                <div>
                  <p className="text-mpesa-gray">Serial Number</p>
                  <p className="font-medium">{searchedTill.serial_number}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-mpesa-green" />
            <span>Payment Details</span>
          </CardTitle>
          <CardDescription>
            Enter the payment amount for the selected till
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePayment} className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount (KES)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Enter amount..."
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                disabled={!searchedTill}
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !searchedTill || !amount}
              className="w-full bg-mpesa-green hover:bg-mpesa-green/90"
            >
              {loading ? 'Processing...' : `Pay KES ${amount || '0.00'}`}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TillPayment;
