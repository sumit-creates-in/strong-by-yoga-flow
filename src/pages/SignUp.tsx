
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phone, Mail } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import OTPVerification from '@/components/OTPVerification';
import { supabase } from '@/integrations/supabase/client';
import PhoneSignUpForm from '@/components/PhoneSignUpForm';
import EmailSignUpForm from '@/components/EmailSignUpForm';

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
  
  const handleSendOtp = async (formattedPhone: string) => {
    if (!name) {
      toast({
        variant: "destructive",
        title: "Name required",
        description: "Please enter your name."
      });
      return;
    }
    
    try {
      // In a real implementation, you would call your backend to send the OTP
      const { error } = await supabase.functions.invoke('send-otp', {
        body: { phoneNumber: formattedPhone, via: 'sms' }
      });
      
      if (error) throw new Error(error.message);
      
      toast({
        title: "Verification Code Sent",
        description: `A verification code has been sent to ${formattedPhone}.`,
      });
      
      setPhone(formattedPhone);
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
                  <PhoneSignUpForm 
                    name={name}
                    setName={setName}
                    phone={phone}
                    setPhone={setPhone}
                    onSendOtp={handleSendOtp}
                  />
                </TabsContent>
                
                <TabsContent value="email">
                  <EmailSignUpForm
                    name={name}
                    setName={setName}
                    email={email}
                    setEmail={setEmail}
                    phone={phone}
                    setPhone={setPhone}
                    password={password}
                    setPassword={setPassword}
                    onSubmit={handleSubmitEmail}
                  />
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
