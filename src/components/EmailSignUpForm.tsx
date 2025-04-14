
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import CountryCodeSelector, { useCountryDetection } from './CountryCodeSelector';

interface EmailSignUpFormProps {
  name: string;
  setName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  phone: string;
  setPhone: (phone: string) => void;
  password: string;
  setPassword: (password: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

const EmailSignUpForm: React.FC<EmailSignUpFormProps> = ({
  name,
  setName,
  email,
  setEmail,
  phone,
  setPhone,
  password,
  setPassword,
  onSubmit
}) => {
  const { isLoading } = useAuth();
  const { country, setCountry } = useCountryDetection();
  
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="name-email" className="block text-gray-700 text-lg">
          Full Name
        </label>
        <Input
          id="name-email"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="yoga-input w-full"
          required
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="email" className="block text-gray-700 text-lg">
          Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="yoga-input w-full"
          required
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="phone-optional" className="block text-gray-700 text-lg">
          Phone Number
        </label>
        <div className="flex gap-2">
          <CountryCodeSelector
            selectedCountry={country}
            onSelect={setCountry}
          />
          <Input
            id="phone-optional"
            type="tel"
            placeholder="(555) 123-4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="yoga-input flex-1"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="password" className="block text-gray-700 text-lg">
          Password
        </label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="yoga-input w-full"
          required
        />
      </div>
      
      <Button 
        type="submit" 
        className="yoga-button w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Signing up...' : 'Sign up'}
      </Button>
    </form>
  );
};

export default EmailSignUpForm;
