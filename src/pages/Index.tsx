
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Shield, BarChart3, Smartphone, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import CustomerRegistration from '@/components/CustomerRegistration';
import AgentDashboard from '@/components/AgentDashboard';
import AdminPanel from '@/components/AdminPanel';

const Index = () => {
  const [activeTab, setActiveTab] = useState('register');

  return (
    <div className="min-h-screen bg-gradient-to-br from-mpesa-green-light via-white to-mpesa-blue-light">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-mpesa-green rounded-lg flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Smart Till Onboarding</h1>
                <p className="text-sm text-mpesa-gray">M-Pesa Agent System</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-mpesa-green-light text-mpesa-green border-mpesa-green">
              v2.1.0
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Smart Till System</h2>
          <p className="text-lg text-mpesa-gray">Streamline your M-Pesa agent operations with our comprehensive onboarding platform</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-mpesa-green-light rounded-lg flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-mpesa-green" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">2,847</p>
                  <p className="text-sm text-mpesa-gray">Registrations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">2,194</p>
                  <p className="text-sm text-mpesa-gray">Approved</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">653</p>
                  <p className="text-sm text-mpesa-gray">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-mpesa-blue-light rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-mpesa-blue" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">94.2%</p>
                  <p className="text-sm text-mpesa-gray">Success Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="bg-white shadow-lg">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                <TabsList className="grid w-full grid-cols-3 bg-white">
                  <TabsTrigger value="register" className="flex items-center space-x-2">
                    <UserPlus className="w-4 h-4" />
                    <span>Register Customer</span>
                  </TabsTrigger>
                  <TabsTrigger value="dashboard" className="flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4" />
                    <span>Agent Dashboard</span>
                  </TabsTrigger>
                  <TabsTrigger value="admin" className="flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>Admin Panel</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6">
                <TabsContent value="register" className="mt-0">
                  <CustomerRegistration />
                </TabsContent>

                <TabsContent value="dashboard" className="mt-0">
                  <AgentDashboard />
                </TabsContent>

                <TabsContent value="admin" className="mt-0">
                  <AdminPanel />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
