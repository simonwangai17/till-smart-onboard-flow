
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";

interface ApprovedTill {
  id: string;
  customer_name: string;
  phone_number: string;
  id_number: string;
  till_number: string;
  store_number: string;
  serial_number: string;
  created_at: string;
  updated_at: string;
}

interface ApprovedTillsListProps {
  onBack: () => void;
}

const ApprovedTillsList: React.FC<ApprovedTillsListProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [approvedTills, setApprovedTills] = useState<ApprovedTill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchApprovedTills();
    }
  }, [user]);

  const fetchApprovedTills = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('till_registrations')
        .select('*')
        .eq('agent_id', user.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching approved tills:', error);
        toast({
          title: "Error",
          description: "Failed to load approved registrations",
          variant: "destructive"
        });
        return;
      }

      setApprovedTills(data || []);
    } catch (error: any) {
      console.error('Error fetching approved tills:', error);
      toast({
        title: "Error",
        description: "Failed to load approved registrations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredTills = approvedTills.filter(till => 
    till.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    till.phone_number.includes(searchTerm) ||
    till.till_number.includes(searchTerm) ||
    till.store_number.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Approved Registrations</h3>
            <p className="text-mpesa-gray">Your successfully registered tills</p>
          </div>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-mpesa-green mx-auto"></div>
          <p className="mt-4 text-mpesa-gray">Loading approved registrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Approved Registrations</h3>
          <p className="text-mpesa-gray">Your successfully registered tills ({approvedTills.length} total)</p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by name, phone, till, or store number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Approved Tills List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span>Approved Till Registrations</span>
          </CardTitle>
          <CardDescription>
            {filteredTills.length} of {approvedTills.length} approved registrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTills.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-mpesa-gray">
                  {approvedTills.length === 0 
                    ? "No approved registrations yet. Keep registering customers to earn commissions!" 
                    : "No approved registrations found matching your search criteria"
                  }
                </p>
              </div>
            ) : (
              filteredTills.map((till) => (
                <div
                  key={till.id}
                  className="border border-green-200 rounded-lg p-4 bg-green-50/50 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-green-700">
                          {till.customer_name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{till.customer_name}</h4>
                        <p className="text-sm text-mpesa-gray">{till.phone_number}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="bg-green-100 text-green-800 border border-green-200 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Approved</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-mpesa-gray">Till Number</p>
                      <p className="font-medium text-green-700">{till.till_number}</p>
                    </div>
                    <div>
                      <p className="text-mpesa-gray">Store Number</p>
                      <p className="font-medium">{till.store_number}</p>
                    </div>
                    <div>
                      <p className="text-mpesa-gray">Serial Number</p>
                      <p className="font-medium">{till.serial_number}</p>
                    </div>
                    <div>
                      <p className="text-mpesa-gray">Approved On</p>
                      <p className="font-medium">
                        {new Date(till.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-green-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-mpesa-gray">Customer ID</p>
                        <p className="font-medium">{till.id_number}</p>
                      </div>
                      <div>
                        <p className="text-mpesa-gray">Registration Date</p>
                        <p className="font-medium">
                          {new Date(till.created_at).toLocaleDateString()}
                        </p>
                      </div>
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

export default ApprovedTillsList;
