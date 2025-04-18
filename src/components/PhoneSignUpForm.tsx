
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import CountryCodeSelector, { useCountryDetection } from './CountryCodeSelector';

interface PhoneSignUpFormProps {
  name: string;
  setName: (name: string) => void;
  phone: string;
  setPhone: (phone: string) => void;
  onSendOtp: (phoneWithCode: string) => void;
}

const PhoneSignUpForm: React.FC<PhoneSignUpFormProps> = ({ 
  name, 
  setName, 
  phone, 
  setPhone, 
  onSendOtp 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { country, setCountry } = useCountryDetection();
  
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone || !name) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please enter your name and phone number."
      });
      return;
    }
    
    // Format the phone number with country code
    const formattedPhone = `${country.dialCode}${phone.startsWith('0') ? phone.substring(1) : phone}`;
    
    setIsLoading(true);
    try {
      onSendOtp(formattedPhone);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to send code",
        description: error.message || "Something went wrong. Please try again.",
      });
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSendOtp} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="name-phone" className="block text-gray-700 text-lg">
          Full Name
        </label>
        <Input
          id="name-phone"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="yoga-input w-full"
          required
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="phone" className="block text-gray-700 text-lg">
          Phone Number
        </label>
        <div className="flex gap-2">
          {country && (
            <CountryCodeSelector
              selectedCountry={country}
              onSelect={setCountry}
            />
          )}
          <Input
            id="phone"
            type="tel"
            placeholder="(555) 123-4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="yoga-input flex-1"
            required
          />
        </div>
        <p className="text-xs text-gray-500">
          We'll send you a verification code via SMS
        </p>
      </div>
      
      <Button 
        type="submit" 
        className="yoga-button w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <ArrowRight size={16} className="mr-2" />
        )}
        Continue with Phone
      </Button>
    </form>
  );
};

export default PhoneSignUpForm;
