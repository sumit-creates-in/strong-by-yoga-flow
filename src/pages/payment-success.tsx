import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useTeachers } from '@/contexts/TeacherContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Check, RefreshCw, AlertTriangle } from 'lucide-react';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { purchaseCredits } = useTeachers();
  const { toast } = useToast();
  const supabase = useSupabaseClient();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your payment...');
  const [creditAmount, setCreditAmount] = useState(0);
  
  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setStatus('error');
        setMessage('Invalid session ID');
        return;
      }
      
      try {
        const { data, error } = await supabase.functions.invoke('verify-payment', {
          body: { sessionId }
        });
        
        if (error) throw new Error(error.message);
        
        if (!data.success || !data.verified) {
          setStatus('error');
          setMessage(data.message || 'Payment verification failed');
          return;
        }
        
        setCreditAmount(data.credits || 0);
        
        if (typeof purchaseCredits === 'function') {
          purchaseCredits(data.credits || 0);
          
          toast({
            title: "Credits Added!",
            description: `${data.credits} credits have been added to your account.`,
          });
        }
        
        setStatus('success');
        setMessage('Payment successful! Your credits have been added.');
      } catch (error) {
        console.error('Payment verification error:', error);
        setStatus('error');
        setMessage('An error occurred while verifying your payment.');
      }
    };
    
    verifyPayment();
  }, [sessionId, supabase, purchaseCredits, toast]);
  
  return (
    <Layout>
      <div className="container max-w-lg mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {status === 'loading' && 'Processing Payment'}
              {status === 'success' && 'Payment Successful!'}
              {status === 'error' && 'Payment Verification Issue'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {status === 'loading' && (
              <div className="flex flex-col items-center justify-center py-6">
                <RefreshCw className="h-12 w-12 text-blue-500 animate-spin" />
                <p className="mt-4 text-lg text-center">{message}</p>
              </div>
            )}
            
            {status === 'success' && (
              <div className="flex flex-col items-center justify-center py-6">
                <div className="bg-green-100 p-4 rounded-full">
                  <Check className="h-12 w-12 text-green-500" />
                </div>
                
                <p className="mt-4 text-lg text-center">{message}</p>
                
                <div className="mt-6 bg-gray-50 rounded-lg p-4 w-full">
                  <h3 className="font-medium text-center mb-2">Order Summary</h3>
                  <div className="flex justify-between items-center border-b pb-2 mb-2">
                    <span>Credit Package:</span>
                    <span className="font-medium">{creditAmount} Credits</span>
                  </div>
                  <div className="flex justify-between items-center font-medium">
                    <span>Your new credit balance:</span>
                    <span>View in Profile</span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 mt-6 w-full">
                  <Button asChild className="flex-1">
                    <Link to="/teachers">Browse Teachers</Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1">
                    <Link to="/profile">View Profile</Link>
                  </Button>
                </div>
              </div>
            )}
            
            {status === 'error' && (
              <div className="flex flex-col items-center justify-center py-6">
                <div className="bg-red-100 p-4 rounded-full">
                  <AlertTriangle className="h-12 w-12 text-red-500" />
                </div>
                
                <p className="mt-4 text-lg text-center">{message}</p>
                
                <div className="flex flex-col sm:flex-row gap-4 mt-6 w-full">
                  <Button asChild className="flex-1">
                    <Link to="/pricing">Try Again</Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1">
                    <Link to="/">Go Home</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PaymentSuccess;
