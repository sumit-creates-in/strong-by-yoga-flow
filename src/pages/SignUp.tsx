
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phone, Mail, ArrowRight, Loader2 } from 'lucide-react';
import OTPVerification from '@/components/OTPVerification';
import { supabase } from '@/integrations/supabase/client';

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');
  const [step, setStep] = useState<'details' | 'verify'>('details');
  const { signup, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    await signup(name, email, phone, password);
  };

  const validateForm = () => {
    if (authMethod === 'phone') {
      if (!phone || !name) {
        toast({
          variant: "destructive",
          title: "Missing information",
          description: "Please enter your name and phone number."
        });
        return false;
      }
      return true;
    } else {
      if (!name || !email || !password) {
        toast({
          variant: "destructive",
          title: "Missing information",
          description: "Please fill in all required fields."
        });
        return false;
      }
      return true;
    }
  };
  
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      // In a real implementation, you would call your backend to send the OTP
      const { error } = await supabase.functions.invoke('send-otp', {
        body: { phoneNumber: phone, via: 'sms' }
      });
      
      if (error) throw new Error(error.message);
      
      toast({
        title: "Verification Code Sent",
        description: `A verification code has been sent to ${phone}.`,
      });
      
      setStep('verify');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to send code",
        description: error.message || "Something went wrong. Please try again.",
      });
    }
  };

  const handleVerificationComplete = async () => {
    try {
      // Create the user after successful verification
      // This is a simplified example. In a real app, you might want to
      // create a custom function in your backend to handle this
      await signup(name, email || `${phone}@placeholder.com`, phone, password || 'temporary-pw');
      
      toast({
        title: "Account Created",
        description: "Your account has been created successfully!",
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message || "Something went wrong. Please try again.",
      });
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-yoga-light-yellow p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-yoga-blue flex items-center justify-center">
            <span className="text-5xl mr-2">🧘</span>
            Strong By Yoga
          </h1>
          <p className="text-gray-600">Create your account to get started</p>
        </div>
        
        <div className="yoga-card">
          {step === 'details' ? (
            <>
              <Tabs defaultValue={authMethod} onValueChange={(v) => setAuthMethod(v as 'phone' | 'email')}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="phone" className="flex items-center">
                    <Phone size={16} className="mr-2" />
                    Phone
                  </TabsTrigger>
                  <TabsTrigger value="email" className="flex items-center">
                    <Mail size={16} className="mr-2" />
                    Email
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="phone">
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
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="yoga-input w-full"
                        required
                      />
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
                </TabsContent>
                
                <TabsContent value="email">
                  <form onSubmit={handleSubmitEmail} className="space-y-6">
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
                        Phone Number (optional)
                      </label>
                      <Input
                        id="phone-optional"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="yoga-input w-full"
                      />
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
                </TabsContent>
              </Tabs>
              
              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <Link to="/login" className="text-yoga-blue hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          ) : (
            <OTPVerification 
              phoneNumber={phone} 
              onVerificationComplete={handleVerificationComplete} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SignUp;
