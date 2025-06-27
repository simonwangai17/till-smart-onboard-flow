
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Download, Eye, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface Submission {
  id: string;
  customerName: string;
  phoneNumber: string;
  tillNumber: string;
  storeNumber: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing';
  submittedAt: string;
  serialNumber: string;
  agentName: string;
}

const AgentDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Mock data - in real app this would come from Supabase
  const submissions: Submission[] = [
    {
      id: '001',
      customerName: 'John Doe',
      phoneNumber: '254712345678',
      tillNumber: '123456',
      storeNumber: 'ST001',
      status: 'approved',
      submittedAt: '2024-01-15T10:30:00Z',
      serialNumber: 'SN1234567890',
      agentName: 'Agent Smith'
    },
    {
      id: '002',
      customerName: 'Jane Smith',
      phoneNumber: '254723456789',
      tillNumber: '234567',
      storeNumber: 'ST002',
      status: 'pending',
      submittedAt: '2024-01-15T11:45:00Z',
      serialNumber: 'SN2345678901',
      agentName: 'Agent Smith'
    },
    {
      id: '003',
      customerName: 'Mike Johnson',
      phoneNumber: '254734567890',
      tillNumber: '345678',
      storeNumber: 'ST003',
      status: 'processing',
      submittedAt: '2024-01-15T14:20:00Z',
      serialNumber: 'SN3456789012',
      agentName: 'Agent Smith'
    },
    {
      id: '004',
      customerName: 'Sarah Wilson',
      phoneNumber: '254745678901',
      tillNumber: '456789',
      storeNumber: 'ST004',
      status: 'rejected',
      submittedAt: '2024-01-14T16:15:00Z',
      serialNumber: 'SN4567890123',
      agentName: 'Agent Smith'
    }
  ];

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
    const matchesSearch = submission.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.phoneNumber.includes(searchTerm) ||
                         submission.tillNumber.includes(searchTerm);
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

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Agent Dashboard</h3>
        <p className="text-mpesa-gray">Track and manage your customer registrations</p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(statusCounts).map(([status, count]) => (
          <Card 
            key={status}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              statusFilter === status ? 'ring-2 ring-mpesa-green' : ''
            }`}
            onClick={() => setStatusFilter(status)}
          >
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <p className="text-sm text-mpesa-gray capitalize">{status}</p>
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
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
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
          <CardTitle>Recent Submissions</CardTitle>
          <CardDescription>
            {filteredSubmissions.length} of {submissions.length} submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSubmissions.map((submission) => (
              <div
                key={submission.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-mpesa-green-light rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-mpesa-green">
                        {submission.customerName.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{submission.customerName}</h4>
                      <p className="text-sm text-mpesa-gray">{submission.phoneNumber}</p>
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
                    <p className="text-mpesa-gray">Till Number</p>
                    <p className="font-medium">{submission.tillNumber}</p>
                  </div>
                  <div>
                    <p className="text-mpesa-gray">Store Number</p>
                    <p className="font-medium">{submission.storeNumber}</p>
                  </div>
                  <div>
                    <p className="text-mpesa-gray">Serial Number</p>
                    <p className="font-medium">{submission.serialNumber}</p>
                  </div>
                  <div>
                    <p className="text-mpesa-gray">Submitted</p>
                    <p className="font-medium">
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {filteredSubmissions.length === 0 && (
              <div className="text-center py-8">
                <p className="text-mpesa-gray">No submissions found matching your criteria</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentDashboard;
