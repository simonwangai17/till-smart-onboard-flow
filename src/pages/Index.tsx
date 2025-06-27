
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, Shield, BarChart3 } from 'lucide-react';
import CustomerRegistration from '@/components/CustomerRegistration';
import AgentDashboard from '@/components/AgentDashboard';
import AdminPanel from '@/components/AdminPanel';
import LoginForm from '@/components/LoginForm';
import MobileOptimizedHeader from '@/components/MobileOptimizedHeader';
import MobileStatsGrid from '@/components/MobileStatsGrid';

interface User {
  userId: string;
  password: string;
  role: string;
  name?: string;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState('register');
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (credentials: User) => {
    // In a real app, this would set user data from API response
    const userNames = {
      'AGENT001': 'John Doe',
      'AGENT002': 'Jane Smith', 
      'ADMIN001': 'Admin User',
      'SUPER001': 'Super Admin'
    };
    
    setUser({
      ...credentials,
      name: userNames[credentials.userId as keyof typeof userNames] || 'User'
    });
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('register');
  };

  // Show login form if user is not authenticated
  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-mpesa-green-light via-white to-mpesa-blue-light">
      {/* Mobile Optimized Header */}
      <MobileOptimizedHeader 
        userRole={user.role}
        userName={user.name}
        onLogout={handleLogout}
      />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Welcome Section - Mobile Optimized */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name}!
          </h2>
          <p className="text-sm sm:text-lg text-mpesa-gray">
            Streamline your M-Pesa agent operations with our comprehensive platform
          </p>
        </div>

        {/* Mobile Optimized Stats */}
        <MobileStatsGrid />

        {/* Main Content - Mobile Optimized Tabs */}
        <Card className="bg-white shadow-lg border-0">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Mobile-First Tab Navigation */}
              <div className="border-b border-gray-200 bg-gray-50 px-3 sm:px-6 py-3 sm:py-4">
                <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 bg-white h-auto p-1 gap-1 sm:gap-0">
                  <TabsTrigger 
                    value="register" 
                    className="flex items-center justify-center space-x-2 py-3 sm:py-2 text-sm sm:text-base"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Register</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="dashboard" 
                    className="flex items-center justify-center space-x-2 py-3 sm:py-2 text-sm sm:text-base"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Dashboard</span>
                  </TabsTrigger>
                  {user.role === 'admin' && (
                    <TabsTrigger 
                      value="admin" 
                      className="flex items-center justify-center space-x-2 py-3 sm:py-2 text-sm sm:text-base"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Admin</span>
                    </TabsTrigger>
                  )}
                </TabsList>
              </div>

              {/* Tab Content */}
              <div className="p-3 sm:p-6">
                <TabsContent value="register" className="mt-0">
                  <CustomerRegistration />
                </TabsContent>

                <TabsContent value="dashboard" className="mt-0">
                  <AgentDashboard />
                </TabsContent>

                {user.role === 'admin' && (
                  <TabsContent value="admin" className="mt-0">
                    <AdminPanel />
                  </TabsContent>
                )}
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
