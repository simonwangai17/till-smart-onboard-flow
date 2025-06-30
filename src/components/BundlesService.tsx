
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Smartphone } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { useToast } from "@/hooks/use-toast";
import { useSupabaseData } from '@/hooks/useSupabaseData';

interface BundlesServiceProps {
  onBack: () => void;
}

const BundlesService = ({ onBack }: BundlesServiceProps) => {
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedBundle, setSelectedBundle] = useState<any>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { balance } = useWallet();
  const { toast } = useToast();
  const { purchaseBundle } = useSupabaseData();

  const providers = [
    { id: 'safaricom', name: 'Safaricom', color: 'bg-green-600' },
    { id: 'airtel', name: 'Airtel', color: 'bg-red-600' },
    { id: 'faiba', name: 'Faiba', color: 'bg-blue-600' },
    { id: 'telkom', name: 'Telkom', color: 'bg-orange-600' }
  ];

  const bundles: Record<string, any[]> = {
    safaricom: [
      { id: 1, name: '1GB Daily', price: 20, validity: '24 Hours' },
      { id: 2, name: '2GB Weekly', price: 50, validity: '7 Days' },
      { id: 3, name: '5GB Monthly', price: 150, validity: '30 Days' },
      { id: 4, name: '10GB Monthly', price: 300, validity: '30 Days' }
    ],
    airtel: [
      { id: 1, name: '1GB Daily', price: 25, validity: '24 Hours' },
      { id: 2, name: '3GB Weekly', price: 60, validity: '7 Days' },
      { id: 3, name: '6GB Monthly', price: 180, validity: '30 Days' },
      { id: 4, name: '12GB Monthly', price: 350, validity: '30 Days' }
    ],
    faiba: [
      { id: 1, name: '2GB Daily', price: 30, validity: '24 Hours' },
      { id: 2, name: '5GB Weekly', price: 80, validity: '7 Days' },
      { id: 3, name: '10GB Monthly', price: 200, validity: '30 Days' }
    ],
    telkom: [
      { id: 1, name: '1.5GB Daily', price: 22, validity: '24 Hours' },
      { id: 2, name: '4GB Weekly', price: 70, validity: '7 Days' },
      { id: 3, name: '8GB Monthly', price: 190, validity: '30 Days' }
    ]
  };

  const handlePurchase = async () => {
    if (!phoneNumber || !selectedBundle) {
      toast({
        title: "Error",
        description: "Please fill all fields and select a bundle",
        variant: "destructive"
      });
      return;
    }

    if (balance < selectedBundle.price) {
      toast({
        title: "Insufficient Balance",
        description: `You need KSH ${selectedBundle.price - balance} more to complete this purchase`,
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      await purchaseBundle({
        provider: selectedProvider,
        bundle_name: selectedBundle.name,
        phone_number: phoneNumber,
        amount: selectedBundle.price
      });

      toast({
        title: "Success!",
        description: `${selectedBundle.name} bundle purchased for ${phoneNumber}`,
      });

      setPhoneNumber('');
      setSelectedBundle(null);
    } catch (error: any) {
      console.error('Bundle purchase error:', error);
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to purchase bundle. Please try again.",
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
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Data Bundles</h3>
      </div>

      {!selectedProvider ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {providers.map((provider) => (
            <Card key={provider.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedProvider(provider.id)}>
              <CardContent className="p-6 text-center">
                <div className={`w-16 h-16 ${provider.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-semibold text-lg">{provider.name}</h4>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold">{providers.find(p => p.id === selectedProvider)?.name} Bundles</h4>
            <Button variant="outline" size="sm" onClick={() => setSelectedProvider('')}>
              Change Provider
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {bundles[selectedProvider]?.map((bundle) => (
              <Card key={bundle.id} className={`cursor-pointer transition-all ${selectedBundle?.id === bundle.id ? 'ring-2 ring-mpesa-green' : 'hover:shadow-md'}`} onClick={() => setSelectedBundle(bundle)}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-semibold">{bundle.name}</h5>
                    <Badge variant="secondary">KSH {bundle.price}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">Valid for {bundle.validity}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedBundle && (
            <Card>
              <CardHeader>
                <CardTitle>Purchase Bundle</CardTitle>
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
                <div className="flex justify-between text-sm">
                  <span>Selected: {selectedBundle.name}</span>
                  <span>Cost: KSH {selectedBundle.price}</span>
                </div>
                <Button 
                  onClick={handlePurchase} 
                  className="w-full bg-mpesa-green hover:bg-mpesa-green/90"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Purchase Bundle'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default BundlesService;
