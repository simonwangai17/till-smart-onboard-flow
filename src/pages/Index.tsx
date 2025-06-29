
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, Shield, BarChart3 } from 'lucide-react';
import CustomerRegistration from '@/components/CustomerRegistration';
import AgentDashboard from '@/components/AgentDashboard';
import AdminPanel from '@/components/AdminPanel';
import LoginForm from '@/components/LoginForm';
import MobileOptimizedHeader from '@/components/MobileOptimizedHeader';
import ServicesDashboard from '@/components/ServicesDashboard';
import BundlesService from '@/components/BundlesService';
import AirtimeService from '@/components/AirtimeService';
import ReportsService from '@/components/ReportsService';
import { WalletProvider } from '@/contexts/WalletContext';

interface User {
  userId: string;
  password: string;
  role: string;
  name?: string;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState('services');
  const [activeService, setActiveService] = useState<string | null>(null);
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
    setActiveTab('services');
    setActiveService(null);
  };

  const handleServiceSelect = (service: string) => {
    if (service === 'lipa-na-mpesa') {
      setActiveTab('register');
      setActiveService(null);
    } else {
      setActiveService(service);
    }
  };

  const handleBackToServices = () => {
    setActiveService(null);
    setActiveTab('services');
  };

  // Show login form if user is not authenticated
  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  // Render active service
  if (activeService) {
    switch (activeService) {
      case 'bundles':
        return (
          <WalletProvider>
            <div className="min-h-screen bg-gradient-to-br from-mpesa-green-light via-white to-mpesa-blue-light">
              <MobileOptimizedHeader 
                userRole={user.role}
                userName={user.name}
                onLogout={handleLogout}
              />
              <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
                <BundlesService onBack={handleBackToServices} />
              </div>
            </div>
          </WalletProvider>
        );
      case 'airtime':
        return (
          <WalletProvider>
            <div className="min-h-screen bg-gradient-to-br from-mpesa-green-light via-white to-mpesa-blue-light">
              <MobileOptimizedHeader 
                userRole={user.role}
                userName={user.name}
                onLogout={handleLogout}
              />
              <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
                <AirtimeService onBack={handleBackToServices} />
              </div>
            </div>
          </WalletProvider>
        );
      case 'reports':
        return (
          <WalletProvider>
            <div className="min-h-screen bg-gradient-to-br from-mpesa-green-light via-white to-mpesa-blue-light">
              <MobileOptimizedHeader 
                userRole={user.role}
                userName={user.name}
                onLogout={handleLogout}
              />
              <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
                <ReportsService onBack={handleBackToServices} />
              </div>
            </div>
          </WalletProvider>
        );
      default:
        return null;
    }
  }

  return (
    <WalletProvider>
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

          {/* Main Content - Mobile Optimized Tabs */}
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                {/* Mobile-First Tab Navigation */}
                <div className="border-b border-gray-200 bg-gray-50 px-3 sm:px-6 py-3 sm:py-4">
                  <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 bg-white h-auto p-1 gap-1 sm:gap-0">
                    <TabsTrigger 
                      value="services" 
                      className="flex items-center justify-center space-x-2 py-3 sm:py-2 text-sm sm:text-base"
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span>Services</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="register" 
                      className="flex items-center justify-center space-x-2 py-3 sm:py-2 text-sm sm:text-base"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Register</span>
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
                  <TabsContent value="services" className="mt-0">
                    <ServicesDashboard onServiceSelect={handleServiceSelect} />
                  </TabsContent>

                  <TabsContent value="register" className="mt-0">
                    <CustomerRegistration />
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
    </WalletProvider>
  );
};

export default Index;
