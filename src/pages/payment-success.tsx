
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useStripeService } from '@/services/stripe-service';
import { useTeachers } from '@/contexts/TeacherContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyPayment } = useStripeService();
  const { purchaseCredits } = useTeachers();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [creditAmount, setCreditAmount] = useState<number | null>(null);
  
  const sessionId = searchParams.get('session_id');
  
  useEffect(() => {
    const verifyAndAddCredits = async () => {
      if (!sessionId) {
        setVerificationStatus('error');
        return;
      }
      
      try {
        const result = await verifyPayment(sessionId);
        
        if (result?.success && result?.verified) {
          setCreditAmount(result.credits);
          setVerificationStatus('success');
          
          // Add credits to user account
          if (purchaseCredits && result.credits) {
            purchaseCredits(result.credits);
          }
        } else {
          setVerificationStatus('error');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setVerificationStatus('error');
      }
    };
    
    verifyAndAddCredits();
  }, [sessionId, purchaseCredits]);
  
  return (
    <Layout>
      <div className="max-w-md mx-auto mt-10">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              {verificationStatus === 'loading' ? (
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
              ) : verificationStatus === 'success' ? (
                <CheckCircle2 className="text-green-500 h-8 w-8" />
              ) : (
                <div className="bg-red-100 text-red-600 p-1 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
              <CardTitle>
                {verificationStatus === 'loading' && 'Processing Payment...'}
                {verificationStatus === 'success' && 'Payment Successful!'}
                {verificationStatus === 'error' && 'Payment Verification Failed'}
              </CardTitle>
            </div>
            <CardDescription>
              {verificationStatus === 'loading' && 'Please wait while we verify your payment.'}
              {verificationStatus === 'success' && 'Your purchase has been completed successfully.'}
              {verificationStatus === 'error' && 'We could not verify your payment. Please contact support.'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {verificationStatus === 'success' && creditAmount && (
              <div className="text-center py-4">
                <p className="text-lg mb-2">
                  {creditAmount} credits have been added to your account!
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  You can now use these credits to book one-on-one sessions with our teachers.
                </p>
                <div className="flex space-x-4 justify-center">
                  <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
                  <Button variant="outline" onClick={() => navigate('/bookings')}>View Bookings</Button>
                </div>
              </div>
            )}
            
            {verificationStatus === 'error' && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 mb-6">
                  If you believe this is an error, please contact our support team with your order reference.
                </p>
                <div className="flex space-x-4 justify-center">
                  <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
                  <Button variant="outline" onClick={() => navigate('/contact')}>Contact Support</Button>
                </div>
              </div>
            )}
            
            {verificationStatus === 'loading' && (
              <div className="flex justify-center py-8">
                <div className="animate-pulse flex space-x-4">
                  <div className="flex-1 space-y-4 py-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PaymentSuccessPage;
