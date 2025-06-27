
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Smartphone, Menu, User, LogOut } from 'lucide-react';

interface MobileOptimizedHeaderProps {
  userRole?: string;
  userName?: string;
  onLogout?: () => void;
  onMenuToggle?: () => void;
}

const MobileOptimizedHeader = ({ userRole, userName, onLogout, onMenuToggle }: MobileOptimizedHeaderProps) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Left side - Logo and title */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            {onMenuToggle && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMenuToggle}
                className="md:hidden p-2 h-8 w-8"
              >
                <Menu className="w-4 h-4" />
              </Button>
            )}
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-mpesa-green rounded-lg flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-sm sm:text-xl font-bold text-gray-900 truncate">
                Smart Till System
              </h1>
              <p className="text-xs sm:text-sm text-mpesa-gray hidden sm:block">
                M-Pesa Agent Platform
              </p>
            </div>
          </div>

          {/* Right side - User info and actions */}
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            {/* User info - hidden on very small screens */}
            {userName && (
              <div className="hidden sm:flex items-center space-x-2">
                <div className="w-8 h-8 bg-mpesa-green-light rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-mpesa-green" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{userName}</p>
                  <p className="text-xs text-mpesa-gray capitalize">{userRole}</p>
                </div>
              </div>
            )}

            {/* Role badge */}
            <Badge 
              variant={userRole === 'admin' ? 'default' : 'outline'} 
              className={`text-xs ${
                userRole === 'admin' 
                  ? 'bg-mpesa-blue text-white' 
                  : 'bg-mpesa-green-light text-mpesa-green border-mpesa-green'
              }`}
            >
              {userRole?.toUpperCase()}
            </Badge>

            {/* Logout button */}
            {onLogout && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="p-2 h-8 w-8 sm:h-9 sm:w-auto sm:px-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline ml-2 text-sm">Logout</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default MobileOptimizedHeader;
