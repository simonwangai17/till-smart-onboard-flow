
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Camera, Scan, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface CustomerData {
  name: string;
  phoneNumber: string;
  idNumber: string;
  storeNumber: string;
  tillNumber: string;
  serialNumber: string;
}

const CustomerRegistration = () => {
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [formData, setFormData] = useState<CustomerData>({
    name: '',
    phoneNumber: '',
    idNumber: '',
    storeNumber: '',
    tillNumber: '',
    serialNumber: ''
  });

  const [errors, setErrors] = useState<Partial<CustomerData>>({});

  const validateForm = () => {
    const newErrors: Partial<CustomerData> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phoneNumber.match(/^254\d{9}$/)) {
      newErrors.phoneNumber = 'Phone number must start with 254 and be 12 digits';
    }
    if (!formData.idNumber.match(/^\d{7,8}$/)) {
      newErrors.idNumber = 'ID number must be 7-8 digits';
    }
    if (!formData.storeNumber.trim()) newErrors.storeNumber = 'Store number is required';
    if (!formData.tillNumber.match(/^\d{6,7}$/)) {
      newErrors.tillNumber = 'Till number must be 6-7 digits';
    }
    if (!formData.serialNumber.trim()) newErrors.serialNumber = 'Serial number is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof CustomerData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Auto-format phone number
    if (field === 'phoneNumber' && !value.startsWith('254') && value.length > 0) {
      if (value.startsWith('0')) {
        setFormData(prev => ({ ...prev, phoneNumber: '254' + value.slice(1) }));
      } else if (!value.startsWith('254')) {
        setFormData(prev => ({ ...prev, phoneNumber: '254' + value }));
      }
    }
  };

  const simulateScanning = () => {
    setIsScanning(true);
    setScanComplete(false);
    
    // Simulate OCR/Barcode scanning delay
    setTimeout(() => {
      const mockSerial = 'SN' + Math.random().toString(36).substr(2, 10).toUpperCase();
      setFormData(prev => ({ ...prev, serialNumber: mockSerial }));
      setIsScanning(false);
      setScanComplete(true);
      toast({
        title: "Serial Number Scanned",
        description: `Captured: ${mockSerial}`,
      });
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors below",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Registration Successful",
        description: `Customer ${formData.name} has been registered successfully!`,
      });
      
      // Reset form
      setFormData({
        name: '',
        phoneNumber: '',
        idNumber: '',
        storeNumber: '',
        tillNumber: '',
        serialNumber: ''
      });
      setScanComplete(false);
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Customer Registration</h3>
        <p className="text-mpesa-gray">Register new M-Pesa customers and their till devices</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Registration Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
              <CardDescription>Fill in all required customer information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={errors.name ? 'border-red-500' : ''}
                      placeholder="Enter customer's full name"
                    />
                    {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      className={errors.phoneNumber ? 'border-red-500' : ''}
                      placeholder="254XXXXXXXXX"
                      maxLength={12}
                    />
                    {errors.phoneNumber && <p className="text-sm text-red-500 mt-1">{errors.phoneNumber}</p>}
                  </div>

                  <div>
                    <Label htmlFor="id">ID Number *</Label>
                    <Input
                      id="id"
                      value={formData.idNumber}
                      onChange={(e) => handleInputChange('idNumber', e.target.value)}
                      className={errors.idNumber ? 'border-red-500' : ''}
                      placeholder="12345678"
                      maxLength={8}
                    />
                    {errors.idNumber && <p className="text-sm text-red-500 mt-1">{errors.idNumber}</p>}
                  </div>

                  <div>
                    <Label htmlFor="store">Store Number *</Label>
                    <Input
                      id="store"
                      value={formData.storeNumber}
                      onChange={(e) => handleInputChange('storeNumber', e.target.value)}
                      className={errors.storeNumber ? 'border-red-500' : ''}
                      placeholder="Store identification number"
                    />
                    {errors.storeNumber && <p className="text-sm text-red-500 mt-1">{errors.storeNumber}</p>}
                  </div>

                  <div>
                    <Label htmlFor="till">Till Number *</Label>
                    <Input
                      id="till"
                      value={formData.tillNumber}
                      onChange={(e) => handleInputChange('tillNumber', e.target.value)}
                      className={errors.tillNumber ? 'border-red-500' : ''}
                      placeholder="123456"
                      maxLength={7}
                    />
                    {errors.tillNumber && <p className="text-sm text-red-500 mt-1">{errors.tillNumber}</p>}
                  </div>

                  <div>
                    <Label htmlFor="serial">Device Serial Number *</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="serial"
                        value={formData.serialNumber}
                        onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                        className={errors.serialNumber ? 'border-red-500' : ''}
                        placeholder="Scan or enter manually"
                        readOnly={isScanning}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={simulateScanning}
                        disabled={isScanning}
                        className="flex items-center space-x-1"
                      >
                        {isScanning ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : scanComplete ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Scan className="w-4 h-4" />
                        )}
                        <span>{isScanning ? 'Scanning...' : 'Scan'}</span>
                      </Button>
                    </div>
                    {errors.serialNumber && <p className="text-sm text-red-500 mt-1">{errors.serialNumber}</p>}
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-mpesa-green hover:bg-mpesa-green-dark px-8"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Register Customer'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Scanning Guide */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Camera className="w-5 h-5" />
                <span>Scanning Guide</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Badge variant="outline" className="bg-mpesa-green-light text-mpesa-green">1</Badge>
                  <p className="text-sm">Position device barcode in good lighting</p>
                </div>
                <div className="flex items-start space-x-3">
                  <Badge variant="outline" className="bg-mpesa-green-light text-mpesa-green">2</Badge>
                  <p className="text-sm">Hold camera steady and click scan</p>
                </div>
                <div className="flex items-start space-x-3">
                  <Badge variant="outline" className="bg-mpesa-green-light text-mpesa-green">3</Badge>
                  <p className="text-sm">Verify captured serial number</p>
                </div>
              </div>

              <div className="bg-mpesa-green-light p-3 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-mpesa-green mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-mpesa-green">Note</p>
                    <p className="text-xs text-mpesa-gray">Ensure all device labels are clearly visible before scanning</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomerRegistration;
