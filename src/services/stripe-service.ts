
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useToast } from '@/components/ui/use-toast';

export interface StripeCheckoutOptions {
  packageId: string;
  packageName: string;
  creditAmount?: number;
  price: number;
  mode?: 'payment' | 'subscription';
  interval?: 'month' | 'year';
  metadata?: Record<string, string>;
}

export const useStripeService = () => {
  const supabase = useSupabaseClient();
  const { toast } = useToast();

  /**
   * Creates a checkout session for one-time payment or subscription
   */
  const createCheckoutSession = async (options: StripeCheckoutOptions) => {
    try {
      const { packageId, packageName, creditAmount, price, mode = 'payment', interval, metadata } = options;
      
      toast({
        title: "Creating checkout session...",
        description: "You'll be redirected to the payment page shortly.",
      });
      
      const response = await supabase.functions.invoke('create-checkout', {
        body: {
          packageId,
          packageName,
          creditAmount,
          price,
          mode,
          interval,
          metadata
        }
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (response.data?.url) {
        window.location.href = response.data.url;
        return true;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Stripe checkout error:', error);
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Failed to create checkout session",
        variant: "destructive",
      });
      return false;
    }
  };
  
  /**
   * Verifies payment after successful checkout
   */
  const verifyPayment = async (sessionId: string) => {
    try {
      const response = await supabase.functions.invoke('verify-payment', {
        body: { sessionId }
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      return response.data;
    } catch (error) {
      console.error('Payment verification error:', error);
      toast({
        title: "Verification Error",
        description: error instanceof Error ? error.message : "Failed to verify payment",
        variant: "destructive",
      });
      return { success: false, verified: false };
    }
  };

  return {
    createCheckoutSession,
    verifyPayment
  };
};
