
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthPage from '@/components/AuthPage';
import ServicesDashboard from '@/components/ServicesDashboard';
import CustomerRegistration from '@/components/CustomerRegistration';
import AgentDashboard from '@/components/AgentDashboard';
import AdminPanel from '@/components/AdminPanel';
import AirtimeService from '@/components/AirtimeService';
import BundlesService from '@/components/BundlesService';
import ReportsService from '@/components/ReportsService';
import MobileOptimizedHeader from '@/components/MobileOptimizedHeader';

const Index = () => {
  const { user, userProfile, signOut, loading } = useAuth();
  const [currentService, setCurrentService] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-mpesa-green mx-auto"></div>
          <p className="mt-4 text-mpesa-gray">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const handleServiceSelect = (service: string) => {
    setCurrentService(service);
  };

  const handleBackToServices = () => {
    setCurrentService(null);
  };

  const renderCurrentView = () => {
    if (userProfile?.role === 'admin' && !currentService) {
      return <AdminPanel />;
    }

    switch (currentService) {
      case 'lipa-na-mpesa':
        return <CustomerRegistration />;
      case 'dashboard':
        return <AgentDashboard />;
      case 'airtime':
        return <AirtimeService onBack={handleBackToServices} />;
      case 'bundles':
        return <BundlesService onBack={handleBackToServices} />;
      case 'reports':
        return <ReportsService onBack={handleBackToServices} />;
      default:
        if (userProfile?.role === 'admin') {
          return <AdminPanel />;
        }
        return <ServicesDashboard onServiceSelect={handleServiceSelect} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileOptimizedHeader 
        userRole={userProfile?.role}
        userName={userProfile?.name}
        onLogout={signOut}
        onMenuToggle={currentService ? handleBackToServices : undefined}
      />
      
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        {renderCurrentView()}
      </main>
    </div>
  );
};

export default Index;
