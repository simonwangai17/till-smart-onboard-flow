
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Download, Eye, Clock, CheckCircle, XCircle, AlertTriangle, FileText, CreditCard, BarChart3, Wallet as WalletIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { useSupabaseData } from '@/hooks/useSupabaseData';
import ApprovedTillsList from './ApprovedTillsList';
import TillPayment from './TillPayment';
import PaymentReports from './PaymentReports';
import Wallet from './Wallet';

interface TillRegistration {
  id: string;
  customer_name: string;
  phone_number: string;
  id_number: string;
  till_number: string;
  store_number: string;
  serial_number: string;
  agent_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing';
  created_at: string;
  updated_at: string;
}

const AgentDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { walletBalance, tillRegistrations, loading } = useSupabaseData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [submissions, setSubmissions] = useState<TillRegistration[]>([]);
  const [showApprovedTills, setShowApprovedTills] = useState(false);
  const [showTillPayment, setShowTillPayment] = useState(false);
  const [showPaymentReports, setShowPaymentReports] = useState(false);
  const [showWallet, setShowWallet] = useState(false);

  useEffect(() => {
    if (tillRegistrations) {
      const typedData = tillRegistrations.map((item: any) => ({
        ...item,
        status: item.status as 'pending' | 'approved' | 'rejected' | 'processing'
      })) as TillRegistration[];
      setSubmissions(typedData);
    }
  }, [tillRegistrations]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'processing':
        return <AlertTriangle className="w-4 h-4 text-blue-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = submission.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.phone_number.includes(searchTerm) ||
                         submission.till_number.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: submissions.length,
    pending: submissions.filter(s => s.status === 'pending').length,
    approved: submissions.filter(s => s.status === 'approved').length,
    processing: submissions.filter(s => s.status === 'processing').length,
    rejected: submissions.filter(s => s.status === 'rejected').length
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Agent Dashboard</h3>
          <p className="text-gray-600">Track and manage your customer registrations</p>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your submissions...</p>
        </div>
      </div>
    );
  }

  if (showApprovedTills) {
    return <ApprovedTillsList onBack={() => setShowApprovedTills(false)} />;
  }

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Agent Dashboard</h3>
          <p className="text-gray-600">Track and manage your customer registrations</p>
        </div>
        
        {/* Primary Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setShowWallet(true)}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          >
            <WalletIcon className="w-4 h-4" />
            Wallet (KSH {walletBalance.toLocaleString()})
          </Button>
          
          <Button
            onClick={() => setShowTillPayment(true)}
            className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            Make Payment
          </Button>
          
          <Button
            onClick={() => setShowPaymentReports(true)}
            variant="outline"
            className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Payment Reports
          </Button>
          
          <Button
            onClick={() => setShowApprovedTills(true)}
            variant="outline"
            className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Registrations
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-green-200">
          <CardContent className="p-4 text-center">
            <WalletIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">KSH {walletBalance.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Wallet Balance</p>
          </CardContent>
        </Card>
        
        <Card className="border-blue-200">
          <CardContent className="p-4 text-center">
            <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">{statusCounts.approved}</p>
            <p className="text-sm text-gray-600">Approved Tills</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200">
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</p>
            <p className="text-sm text-gray-600">Pending</p>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardContent className="p-4 text-center">
            <CreditCard className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-600">{statusCounts.all}</p>
            <p className="text-sm text-gray-600">Total Submissions</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(statusCounts).map(([status, count]) => (
          <Card 
            key={status}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              statusFilter === status ? 'ring-2 ring-green-600' : ''
            }`}
            onClick={() => setStatusFilter(status)}
          >
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <p className="text-sm text-gray-600 capitalize">{status}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name, phone, or till number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-green-300 focus:border-green-500"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm" className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Submissions</CardTitle>
          <CardDescription>
            {filteredSubmissions.length} of {submissions.length} submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSubmissions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">
                  {submissions.length === 0 
                    ? "No submissions yet. Start by registering a customer's till!" 
                    : "No submissions found matching your criteria"
                  }
                </p>
              </div>
            ) : (
              filteredSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-green-600">
                          {submission.customer_name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{submission.customer_name}</h4>
                        <p className="text-sm text-gray-600">{submission.phone_number}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="outline" 
                        className={`${getStatusColor(submission.status)} flex items-center space-x-1`}
                      >
                        {getStatusIcon(submission.status)}
                        <span className="capitalize">{submission.status}</span>
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Till Number</p>
                      <p className="font-medium">{submission.till_number}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Store Number</p>
                      <p className="font-medium">{submission.store_number}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Serial Number</p>
                      <p className="font-medium">{submission.serial_number}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Submitted</p>
                      <p className="font-medium">
                        {new Date(submission.created_at).toLocaleDateString()}
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

export default AgentDashboard;
