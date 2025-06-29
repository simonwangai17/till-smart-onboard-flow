import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Camera } from 'lucide-react';

interface FormData {
  fullName: string;
  phoneNumber: string;
  idNumber: string;
  tillNumber: string;
  storeNumber: string;
  serialNumber: string;
}

const CustomerRegistration = () => {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    phoneNumber: '',
    idNumber: '',
    tillNumber: '',
    storeNumber: '',
    serialNumber: ''
  });

  const [isScanning, setIsScanning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const validatePhoneNumber = (number: string) => {
    const kenyanRegex = /^2547\d{8}$/;
    return kenyanRegex.test(number);
  };

  const validateIDNumber = (id: string) => {
    const idRegex = /^\d{7,8}$/;
    return idRegex.test(id);
  };

  const validateTillNumber = (till: string) => {
    const tillRegex = /^\d{6,8}$/;
    return tillRegex.test(till);
  };

  const validateSerialNumber = (serial: string) => {
    const serialRegex = /^[a-zA-Z0-9]{10,}$/;
    return serialRegex.test(serial);
  };

  const validateForm = () => {
    if (!formData.fullName || !formData.phoneNumber || !formData.idNumber || !formData.tillNumber || !formData.storeNumber || !formData.serialNumber) {
      return false;
    }

    if (!validatePhoneNumber(formData.phoneNumber)) {
      return false;
    }

    if (!validateIDNumber(formData.idNumber)) {
      return false;
    }

    if (!validateTillNumber(formData.tillNumber)) {
      return false;
    }

    if (!validateSerialNumber(formData.serialNumber)) {
      return false;
    }

    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setFormData(prevState => ({
        ...prevState,
        serialNumber: 'SCANNED12345'
      }));
      setIsScanning(false);
    }, 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Save to localStorage for demo purposes
      const submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
      const newSubmission = {
        id: Date.now().toString(),
        ...formData,
        submittedAt: new Date().toISOString(),
        status: 'pending'
      };
      submissions.push(newSubmission);
      localStorage.setItem('submissions', JSON.stringify(submissions));

      // Save to till registrations for reports
      const tillRegistrations = JSON.parse(localStorage.getItem('till-registrations') || '[]');
      tillRegistrations.push({
        id: Date.now(),
        customerName: formData.fullName,
        tillNumber: formData.tillNumber,
        date: new Date().toISOString(),
        status: 'pending'
      });
      localStorage.setItem('till-registrations', JSON.stringify(tillRegistrations));

      toast({
        title: "Registration Successful!",
        description: "Customer till registration has been submitted for approval. You'll earn KSH 100 once approved.",
      });

      // Reset form
      setFormData({
        fullName: '',
        phoneNumber: '',
        idNumber: '',
        tillNumber: '',
        storeNumber: '',
        serialNumber: ''
      });

    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "There was an error submitting the registration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-white shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-2xl">Customer Till Registration</CardTitle>
        <CardDescription>Register a new customer's till for M-Pesa services</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              type="text"
              id="fullName"
              name="fullName"
              placeholder="Enter full name"
              value={formData.fullName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="phoneNumber">Phone Number (2547...)</Label>
            <Input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              placeholder="254712345678"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="idNumber">ID Number</Label>
            <Input
              type="number"
              id="idNumber"
              name="idNumber"
              placeholder="Enter ID number"
              value={formData.idNumber}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="tillNumber">Till Number</Label>
            <Input
              type="number"
              id="tillNumber"
              name="tillNumber"
              placeholder="Enter till number"
              value={formData.tillNumber}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="storeNumber">Store Number</Label>
            <Input
              type="text"
              id="storeNumber"
              name="storeNumber"
              placeholder="Enter store number"
              value={formData.storeNumber}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="serialNumber">Serial Number</Label>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleScan}
                disabled={isScanning}
              >
                {isScanning ? (
                  <>
                    <Camera className="mr-2 h-4 w-4 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Camera className="mr-2 h-4 w-4" />
                    Scan
                  </>
                )}
              </Button>
            </div>
            <Input
              type="text"
              id="serialNumber"
              name="serialNumber"
              placeholder="Enter serial number"
              value={formData.serialNumber}
              onChange={handleInputChange}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Register Till'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CustomerRegistration;
