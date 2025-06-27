
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, CheckCircle, Clock, BarChart3 } from 'lucide-react';

interface StatItem {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
  color: string;
  bgColor: string;
}

const MobileStatsGrid = () => {
  const stats: StatItem[] = [
    {
      icon: UserPlus,
      value: '2,847',
      label: 'Total Registrations',
      color: 'text-mpesa-green',
      bgColor: 'bg-mpesa-green-light'
    },
    {
      icon: CheckCircle,
      value: '2,194',
      label: 'Approved',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: Clock,
      value: '653',
      label: 'Pending Review',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      icon: BarChart3,
      value: '94.2%',
      label: 'Success Rate',
      color: 'text-mpesa-blue',
      bgColor: 'bg-mpesa-blue-light'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card key={index} className="bg-white hover:shadow-lg transition-all duration-200 border-0 shadow-sm">
            <CardContent className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.bgColor} rounded-lg flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0`}>
                  <IconComponent className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
                </div>
                <div className="text-center sm:text-left min-w-0 flex-1">
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 leading-tight">
                    {stat.value}
                  </p>
                  <p className="text-xs sm:text-sm text-mpesa-gray leading-tight mt-1">
                    {stat.label}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default MobileStatsGrid;
