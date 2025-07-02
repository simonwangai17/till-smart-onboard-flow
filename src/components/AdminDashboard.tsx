
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, CreditCard, BarChart3, Users, Wallet as WalletIcon } from 'lucide-react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import TillPayment from './TillPayment';
import PaymentReports from './PaymentReports';
import Wallet from './Wallet';

const AdminDashboard = () => {
  const { walletBalance } = useSupabaseData();
  const [showTillPayment, setShowTillPayment] = useState(false);
  const [showPaymentReports, setShowPaymentReports] = useState(false);
  const [showWallet, setShowWallet] = useState(false);

  if (showTillPayment) {
    return <TillPayment onBack={() => setShowTillPayment(false)} />;
  }

  if (showPaymentReports) {
    return <PaymentReports onBack={() => setShowPaymentReports(false)} />;
  }

  if (showWallet) {
    return <Wallet onBack={() => setShowWallet(false)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h3>
          <p className="text-gray-600">Manage all system operations</p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => setShowWallet(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <WalletIcon className="w-4 h-4 mr-2" />
            Wallet (KSH {walletBalance.toLocaleString()})
          </Button>
          <Button
            onClick={() => setShowTillPayment(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Make Payment
          </Button>
          <Button
            onClick={() => setShowPaymentReports(true)}
            variant="outline"
            className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Payments
          </Button>
        </div>
      </div>

      {/* Admin Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-green-200">
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">156</p>
            <p className="text-sm text-gray-600">Total Agents</p>
          </CardContent>
        </Card>
        
        <Card className="border-blue-200">
          <CardContent className="p-4 text-center">
            <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">1,234</p>
            <p className="text-sm text-gray-600">Till Registrations</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200">
          <CardContent className="p-4 text-center">
            <CreditCard className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-yellow-600">567</p>
            <p className="text-sm text-gray-600">Total Payments</p>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardContent className="p-4 text-center">
            <WalletIcon className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-600">KSH {walletBalance.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Wallet Balance</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col space-y-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
            >
              <Users className="w-6 h-6" />
              <span>Manage Users</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex flex-col space-y-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
            >
              <FileText className="w-6 h-6" />
              <span>View Reports</span>
            </Button>
            
            <Button 
              onClick={() => setShowTillPayment(true)}
              variant="outline" 
              className="h-20 flex flex-col space-y-2 border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-white"
            >
              <CreditCard className="w-6 h-6" />
              <span>Process Payments</span>
            </Button>
            
            <Button 
              onClick={() => setShowPaymentReports(true)}
              variant="outline" 
              className="h-20 flex flex-col space-y-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
            >
              <BarChart3 className="w-6 h-6" />
              <span>Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
