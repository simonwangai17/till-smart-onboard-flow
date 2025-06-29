
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Calendar, Smartphone, Phone, Wifi } from 'lucide-react';

interface ReportsServiceProps {
  onBack: () => void;
}

const ReportsService = ({ onBack }: ReportsServiceProps) => {
  const [activeTab, setActiveTab] = useState('all');

  const bundlePurchases = JSON.parse(localStorage.getItem('bundle-purchases') || '[]');
  const airtimePurchases = JSON.parse(localStorage.getItem('airtime-purchases') || '[]');
  const tillRegistrations = JSON.parse(localStorage.getItem('till-registrations') || '[]');

  const allTransactions = [
    ...bundlePurchases.map((item: any) => ({ ...item, category: 'bundles' })),
    ...airtimePurchases.map((item: any) => ({ ...item, category: 'airtime' })),
    ...tillRegistrations.map((item: any) => ({ ...item, category: 'tills', amount: 100 }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getFilteredTransactions = () => {
    switch (activeTab) {
      case 'bundles':
        return allTransactions.filter(t => t.category === 'bundles');
      case 'airtime':
        return allTransactions.filter(t => t.category === 'airtime');
      case 'tills':
        return allTransactions.filter(t => t.category === 'tills');
      default:
        return allTransactions;
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

  const totalEarnings = tillRegistrations.length * 100;
  const totalSpent = bundlePurchases.reduce((sum: number, item: any) => sum + item.amount, 0) + 
                   airtimePurchases.reduce((sum: number, item: any) => sum + item.amount, 0);

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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">KSH {totalEarnings}</p>
            <p className="text-sm text-gray-600">Total Earnings</p>
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
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'all', label: 'All Transactions' },
          { id: 'tills', label: 'Till Registrations' },
          { id: 'bundles', label: 'Data Bundles' },
          { id: 'airtime', label: 'Airtime' }
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
              <p className="text-center text-gray-500 py-8">No transactions found</p>
            ) : (
              getFilteredTransactions().map((transaction: any) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getTransactionColor(transaction.category)}`}>
                      {getTransactionIcon(transaction.category)}
                    </div>
                    <div>
                      <p className="font-medium">
                        {transaction.category === 'tills' ? `Till Registration - ${transaction.customerName}` :
                         transaction.category === 'bundles' ? `${transaction.bundle} - ${transaction.provider}` :
                         `${transaction.provider} Airtime`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {transaction.phoneNumber || transaction.tillNumber} • {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${transaction.category === 'tills' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.category === 'tills' ? '+' : '-'}KSH {transaction.amount}
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
