
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Shield, User, Lock, AlertCircle, CheckCircle } from 'lucide-react';

interface LoginCredentials {
  userId: string;
  password: string;
}

interface ValidationRules {
  userId: {
    isValid: boolean;
    message: string;
  };
  password: {
    isValid: boolean;
    message: string;
  };
}

const LoginForm = ({ onLogin }: { onLogin: (credentials: LoginCredentials & { role: string }) => void }) => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    userId: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [validation, setValidation] = useState<ValidationRules>({
    userId: { isValid: false, message: '' },
    password: { isValid: false, message: '' }
  });

  // Mock user database - in real app, this would come from Supabase
  const mockUsers = {
    'AGENT001': { password: 'Agent@123', role: 'agent', name: 'John Doe' },
    'AGENT002': { password: 'Agent@456', role: 'agent', name: 'Jane Smith' },
    'ADMIN001': { password: 'Admin@123', role: 'admin', name: 'Admin User' },
    'SUPER001': { password: 'Super@123', role: 'admin', name: 'Super Admin' }
  };

  const validateUserId = (userId: string): { isValid: boolean; message: string } => {
    if (!userId.trim()) {
      return { isValid: false, message: 'User ID is required' };
    }
    if (userId.length < 5) {
      return { isValid: false, message: 'User ID must be at least 5 characters' };
    }
    if (!/^[A-Z]{3,5}\d{3}$/.test(userId)) {
      return { isValid: false, message: 'Format: 3-5 letters + 3 digits (e.g., AGENT001)' };
    }
    return { isValid: true, message: 'Valid User ID format' };
  };

  const validatePassword = (password: string): { isValid: boolean; message: string } => {
    if (!password) {
      return { isValid: false, message: 'Password is required' };
    }
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters' };
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)) {
      return { isValid: false, message: 'Must contain uppercase, lowercase, number, and special character' };
    }
    return { isValid: true, message: 'Strong password' };
  };

  const handleInputChange = (field: keyof LoginCredentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    setError('');

    // Real-time validation
    if (field === 'userId') {
      const userIdValidation = validateUserId(value);
      setValidation(prev => ({ ...prev, userId: userIdValidation }));
    } else if (field === 'password') {
      const passwordValidation = validatePassword(value);
      setValidation(prev => ({ ...prev, password: passwordValidation }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Validate inputs
      const userIdValidation = validateUserId(credentials.userId);
      const passwordValidation = validatePassword(credentials.password);

      if (!userIdValidation.isValid || !passwordValidation.isValid) {
        setError('Please fix validation errors before submitting');
        return;
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Check credentials
      const user = mockUsers[credentials.userId as keyof typeof mockUsers];
      if (!user) {
        setError('User ID not found. Please check your credentials.');
        return;
      }

      if (user.password !== credentials.password) {
        setError('Invalid password. Please try again.');
        return;
      }

      // Successful login
      onLogin({
        ...credentials,
        role: user.role
      });

    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = validation.userId.isValid && validation.password.isValid;

  return (
    <div className="min-h-screen bg-gradient-to-br from-mpesa-green-light via-white to-mpesa-blue-light flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-xl border-0">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="w-16 h-16 bg-mpesa-green rounded-full flex items-center justify-center mx-auto shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">Smart Till Login</CardTitle>
            <CardDescription className="text-mpesa-gray mt-2">
              Enter your credentials to access the system
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User ID Field */}
            <div className="space-y-2">
              <Label htmlFor="userId" className="text-sm font-medium text-gray-700">
                User ID
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-mpesa-gray" />
                <Input
                  id="userId"
                  type="text"
                  placeholder="AGENT001"
                  value={credentials.userId}
                  onChange={(e) => handleInputChange('userId', e.target.value.toUpperCase())}
                  className={`pl-10 h-12 text-base ${
                    credentials.userId && !validation.userId.isValid 
                      ? 'border-red-500 focus:ring-red-500' 
                      : validation.userId.isValid 
                      ? 'border-green-500 focus:ring-green-500' 
                      : 'focus:ring-mpesa-green'
                  }`}
                />
                {credentials.userId && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {validation.userId.isValid ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              {credentials.userId && (
                <p className={`text-xs mt-1 ${validation.userId.isValid ? 'text-green-600' : 'text-red-600'}`}>
                  {validation.userId.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-mpesa-gray" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`pl-10 pr-12 h-12 text-base ${
                    credentials.password && !validation.password.isValid 
                      ? 'border-red-500 focus:ring-red-500' 
                      : validation.password.isValid 
                      ? 'border-green-500 focus:ring-green-500' 
                      : 'focus:ring-mpesa-green'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-mpesa-gray hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {credentials.password && (
                <p className={`text-xs mt-1 ${validation.password.isValid ? 'text-green-600' : 'text-red-600'}`}>
                  {validation.password.message}
                </p>
              )}
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="animate-slide-in">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-mpesa-green hover:bg-mpesa-green-dark text-white font-medium text-base transition-all duration-200 disabled:opacity-50"
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Demo Credentials:</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="font-mono">AGENT001</span>
                <Badge variant="outline" className="text-xs">Agent</Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="font-mono">ADMIN001</span>
                <Badge variant="outline" className="text-xs">Admin</Badge>
              </div>
              <p className="text-gray-500 text-center mt-2">Password: Use format above with @123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
