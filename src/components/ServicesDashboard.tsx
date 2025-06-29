
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smartphone, Wifi, Phone, FileText, Wallet } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';

interface ServicesDashboardProps {
  onServiceSelect: (service: string) => void;
}

const ServicesDashboard = ({ onServiceSelect }: ServicesDashboardProps) => {
  const { balance } = useWallet();

  const services = [
    {
      id: 'lipa-na-mpesa',
      title: 'Lipa na M-Pesa',
      description: 'Register customer tills',
      icon: Smartphone,
      color: 'bg-mpesa-green hover:bg-mpesa-green/90',
      textColor: 'text-white'
    },
    {
      id: 'bundles',
      title: 'Data Bundles',
      description: 'Purchase data packages',
      icon: Wifi,
      color: 'bg-blue-600 hover:bg-blue-700',
      textColor: 'text-white'
    },
    {
      id: 'airtime',
      title: 'Airtime',
      description: 'Buy airtime for customers',
      icon: Phone,
      color: 'bg-orange-600 hover:bg-orange-700',
      textColor: 'text-white'
    },
    {
      id: 'reports',
      title: 'Reports',
      description: 'View transaction history',
      icon: FileText,
      color: 'bg-purple-600 hover:bg-purple-700',
      textColor: 'text-white'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Wallet Balance */}
      <Card className="bg-gradient-to-r from-mpesa-green to-mpesa-green/80 text-white">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm opacity-90">Wallet Balance</p>
              <p className="text-2xl sm:text-3xl font-bold">KSH {balance.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {services.map((service) => {
          const IconComponent = service.icon;
          return (
            <Card key={service.id} className="hover:shadow-lg transition-all duration-200 border-0 shadow-sm">
              <CardContent className="p-4 sm:p-6">
                <Button
                  onClick={() => onServiceSelect(service.id)}
                  className={`w-full h-auto p-4 sm:p-6 ${service.color} ${service.textColor} flex-col space-y-3 hover:scale-105 transition-transform`}
                >
                  <IconComponent className="w-8 h-8 sm:w-10 sm:h-10" />
                  <div className="text-center">
                    <h3 className="font-bold text-base sm:text-lg">{service.title}</h3>
                    <p className="text-xs sm:text-sm opacity-90 mt-1">{service.description}</p>
                  </div>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ServicesDashboard;
