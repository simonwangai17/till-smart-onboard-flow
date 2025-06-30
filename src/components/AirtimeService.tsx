
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Phone } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { useToast } from "@/hooks/use-toast";
import { useSupabaseData } from '@/hooks/useSupabaseData';

interface AirtimeServiceProps {
  onBack: () => void;
}

const AirtimeService = ({ onBack }: AirtimeServiceProps) => {
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { balance } = useWallet();
  const { toast } = useToast();
  const { purchaseAirtime } = useSupabaseData();

  const providers = [
    { id: 'safaricom', name: 'Safaricom', color: 'bg-green-600' },
    { id: 'airtel', name: 'Airtel', color: 'bg-red-600' },
    { id: 'faiba', name: 'Faiba', color: 'bg-blue-600' },
    { id: 'telkom', name: 'Telkom', color: 'bg-orange-600' }
  ];

  const quickAmounts = [10, 20, 50, 100, 200, 500];

  const handlePurchase = async () => {
    const airtimeAmount = parseFloat(amount);
    
    if (!phoneNumber || !amount || airtimeAmount <= 0 || !selectedProvider) {
      toast({
        title: "Error",
        description: "Please fill all fields with valid values and select a provider",
        variant: "destructive"
      });
      return;
    }

    if (balance < airtimeAmount) {
      toast({
        title: "Insufficient Balance",
        description: `You need KSH ${airtimeAmount - balance} more to complete this purchase`,
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      await purchaseAirtime({
        provider: selectedProvider,
        phone_number: phoneNumber,
        amount: airtimeAmount
      });

      toast({
        title: "Success!",
        description: `KSH ${airtimeAmount} airtime sent to ${phoneNumber}`,
      });

      setPhoneNumber('');
      setAmount('');
    } catch (error: any) {
      console.error('Airtime purchase error:', error);
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to purchase airtime. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Buy Airtime</h3>
      </div>

      {!selectedProvider ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {providers.map((provider) => (
            <Card key={provider.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedProvider(provider.id)}>
              <CardContent className="p-6 text-center">
                <div className={`w-16 h-16 ${provider.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-semibold text-lg">{provider.name}</h4>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{providers.find(p => p.id === selectedProvider)?.name} Airtime</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setSelectedProvider('')}>
                Change Provider
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="254712345678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="amount">Amount (KSH)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
              />
            </div>

            <div>
              <Label>Quick Amounts</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {quickAmounts.map((quickAmount) => (
                  <Button
                    key={quickAmount}
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(quickAmount.toString())}
                    className="text-sm"
                  >
                    KSH {quickAmount}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex justify-between text-sm text-gray-600">
              <span>Your Balance: KSH {balance}</span>
              <span>Amount: KSH {amount || 0}</span>
            </div>

            <Button 
              onClick={handlePurchase} 
              className="w-full bg-mpesa-green hover:bg-mpesa-green/90"
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Buy Airtime'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AirtimeService;
