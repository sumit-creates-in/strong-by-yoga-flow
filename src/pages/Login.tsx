
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phone, Mail } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import OTPVerification from '@/components/OTPVerification';
import { supabase } from '@/integrations/supabase/client';
import EmailLoginForm from '@/components/EmailLoginForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('email');
  const [step, setStep] = useState<'credentials' | 'verify'>('credentials');
  const { login, loginWithPhone, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone) {
      toast({
        variant: "destructive",
        title: "Phone number required",
        description: "Please enter your phone number."
      });
      return;
    }
    
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
      await loginWithPhone(phone);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
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
          <p className="text-gray-600">Sign in to access your yoga classes</p>
        </div>
        
        <div className="yoga-card">
          {step === 'credentials' ? (
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
                    >
                      Continue with Phone
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="email">
                  <EmailLoginForm 
                    email={email}
                    setEmail={setEmail}
                    password={password}
                    setPassword={setPassword}
                  />
                </TabsContent>
              </Tabs>
              
              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-yoga-blue hover:underline">
                    Sign up
                  </Link>
                </p>
                
                {/* For demo purposes only */}
                <div className="mt-8 p-4 bg-yoga-light-blue/50 rounded-lg">
                  <p className="font-semibold mb-2">Demo accounts:</p>
                  <p>Admin: sumit_204@yahoo.com (password: admin123)</p>
                  <p>Admin: admin@strongbyyoga.com (any password)</p>
                  <p>User: john@example.com (any password)</p>
                </div>
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

export default Login;
