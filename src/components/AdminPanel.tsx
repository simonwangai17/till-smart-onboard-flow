
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, MessageSquare, User, Calendar, Smartphone, Users, Settings } from 'lucide-react';
import UserManagement from './UserManagement';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
  profiles?: {
    name: string;
  };
}

const AdminPanel = () => {
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [tillRegistrations, setTillRegistrations] = useState<TillRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvedToday, setApprovedToday] = useState(0);

  useEffect(() => {
    if (userProfile?.role === 'admin') {
      fetchTillRegistrations();
    }
  }, [userProfile]);

  const fetchTillRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('till_registrations')
        .select(`
          *,
          profiles(name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching till registrations:', error);
        toast({
          title: "Error",
          description: "Failed to load till registrations",
          variant: "destructive"
        });
        return;
      }

      // Type assertion to ensure status field matches our interface
      const typedData = (data || []).map(item => ({
        ...item,
        status: item.status as 'pending' | 'approved' | 'rejected' | 'processing'
      })) as TillRegistration[];

      setTillRegistrations(typedData);
      
      // Count approved registrations today
      const today = new Date().toISOString().split('T')[0];
      const approvedTodayCount = typedData.filter(reg => 
        reg.status === 'approved' && 
        reg.updated_at?.startsWith(today)
      ).length;
      setApprovedToday(approvedTodayCount);
      
    } catch (error: any) {
      console.error('Error fetching till registrations:', error);
      toast({
        title: "Error",
        description: "Failed to load till registrations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (submissionId: string) => {
    try {
      const { error } = await supabase
        .from('till_registrations')
        .update({ 
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', submissionId);

      if (error) throw error;

      toast({
        title: "Submission Approved",
        description: "Customer registration has been approved successfully",
      });
      
      setSelectedSubmission(null);
      setReviewComment('');
      fetchTillRegistrations(); // Refresh data
    } catch (error: any) {
      console.error('Error approving submission:', error);
      toast({
        title: "Error",
        description: "Failed to approve submission",
        variant: "destructive"
      });
    }
  };

  const handleReject = async (submissionId: string) => {
    if (!reviewComment.trim()) {
      toast({
        title: "Review Comment Required",
        description: "Please provide a reason for rejection",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('till_registrations')
        .update({ 
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', submissionId);

      if (error) throw error;

      toast({
        title: "Submission Rejected",
        description: "Customer registration has been rejected with comments",
        variant: "destructive"
      });
      
      setSelectedSubmission(null);
      setReviewComment('');
      fetchTillRegistrations(); // Refresh data
    } catch (error: any) {
      console.error('Error rejecting submission:', error);
      toast({
        title: "Error",
        description: "Failed to reject submission",
        variant: "destructive"
      });
    }
  };

  if (userProfile?.role !== 'admin') {
    return (
      <div className="text-center py-8">
        <p className="text-mpesa-gray">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  const pendingSubmissions = tillRegistrations.filter(reg => reg.status === 'pending');
  const activeAgents = [...new Set(tillRegistrations.map(reg => reg.agent_id))].length;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Admin Panel</h3>
        <p className="text-mpesa-gray">Manage system operations and user permissions</p>
      </div>

      <Tabs defaultValue="approvals" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="approvals" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Till Approvals</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>User Management</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="approvals" className="mt-6">
          {/* Admin Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{pendingSubmissions.length}</p>
                    <p className="text-sm text-mpesa-gray">Pending Review</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{approvedToday}</p>
                    <p className="text-sm text-mpesa-gray">Approved Today</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-mpesa-blue-light rounded-lg flex items-center justify-center">
                    <User className="w-6 h-6 text-mpesa-blue" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{activeAgents}</p>
                    <p className="text-sm text-mpesa-gray">Active Agents</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-mpesa-green mx-auto"></div>
              <p className="mt-4 text-mpesa-gray">Loading till registrations...</p>
            </div>
          ) : (
            /* Pending Submissions */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Submissions</CardTitle>
                  <CardDescription>Click on a submission to review details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pendingSubmissions.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-mpesa-gray">No pending submissions</p>
                      </div>
                    ) : (
                      pendingSubmissions.map((submission) => (
                        <div
                          key={submission.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                            selectedSubmission === submission.id 
                              ? 'border-mpesa-green bg-mpesa-green-light' 
                              : 'border-gray-200'
                          }`}
                          onClick={() => setSelectedSubmission(submission.id)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{submission.customer_name}</h4>
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                              Pending
                            </Badge>
                          </div>
                          <div className="text-sm text-mpesa-gray space-y-1">
                            <p>Agent: {submission.profiles?.name || 'Unknown'}</p>
                            <p>Till: {submission.till_number}</p>
                            <p>Submitted: {new Date(submission.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Review Panel */}
              <Card>
                <CardHeader>
                  <CardTitle>Review Details</CardTitle>
                  <CardDescription>
                    {selectedSubmission ? 'Review submission details and make a decision' : 'Select a submission to review'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedSubmission ? (
                    <div className="space-y-6">
                      {(() => {
                        const submission = pendingSubmissions.find(s => s.id === selectedSubmission);
                        if (!submission) return null;

                        return (
                          <>
                            {/* Customer Details */}
                            <div className="space-y-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-mpesa-green-light rounded-full flex items-center justify-center">
                                  <User className="w-6 h-6 text-mpesa-green" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900">{submission.customer_name}</h4>
                                  <p className="text-sm text-mpesa-gray">Customer Details</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-mpesa-gray">Phone Number</p>
                                  <p className="font-medium flex items-center">
                                    <Smartphone className="w-4 h-4 mr-1" />
                                    {submission.phone_number}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-mpesa-gray">ID Number</p>
                                  <p className="font-medium">{submission.id_number}</p>
                                </div>
                                <div>
                                  <p className="text-mpesa-gray">Till Number</p>
                                  <p className="font-medium">{submission.till_number}</p>
                                </div>
                                <div>
                                  <p className="text-mpesa-gray">Store Number</p>
                                  <p className="font-medium">{submission.store_number}</p>
                                </div>
                                <div className="col-span-2">
                                  <p className="text-mpesa-gray">Serial Number</p>
                                  <p className="font-medium">{submission.serial_number}</p>
                                </div>
                              </div>

                              <div className="border-t pt-4">
                                <div className="flex items-center space-x-2 text-sm text-mpesa-gray">
                                  <Calendar className="w-4 h-4" />
                                  <span>Submitted by {submission.profiles?.name || 'Unknown Agent'} on {new Date(submission.created_at).toLocaleString()}</span>
                                </div>
                              </div>
                            </div>

                            {/* Review Comment */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Review Comment (Required for rejection)
                              </label>
                              <Textarea
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                placeholder="Add your review comments here..."
                                rows={3}
                              />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-3">
                              <Button
                                onClick={() => handleApprove(submission.id)}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleReject(submission.id)}
                                variant="destructive"
                                className="flex-1"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-mpesa-gray">Select a pending submission to begin review</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <UserManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
