
import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from '@/components/ui/button';
import { Loader2, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface OTPVerificationProps {
  phoneNumber: string;
  onVerificationComplete: () => void;
  resendTimeout?: number; // Time in seconds before allowing resend
}

const OTPVerification: React.FC<OTPVerificationProps> = ({
  phoneNumber,
  onVerificationComplete,
  resendTimeout = 30
}) => {
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(resendTimeout);
  const [canResend, setCanResend] = useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  const handleResend = async (via: 'sms' | 'whatsapp') => {
    try {
      setIsSubmitting(true);
      
      // In a real implementation, you would use an API to send the OTP
      // This is a mock implementation
      const { error } = await supabase.functions.invoke('send-otp', {
        body: { phoneNumber, via }
      });
      
      if (error) throw new Error(error.message);
      
      toast({
        title: "OTP Resent",
        description: `A new verification code has been sent to ${phoneNumber} via ${via === 'sms' ? 'SMS' : 'WhatsApp'}`,
      });
      
      // Reset timer
      setTimeLeft(resendTimeout);
      setCanResend(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to resend OTP",
        description: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast({
        variant: "destructive",
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit code.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // In a real implementation, you would verify the OTP with your backend
      // This is a mock implementation for demonstration
      const { error } = await supabase.functions.invoke('verify-otp', {
        body: { phoneNumber, otp }
      });
      
      if (error) throw new Error(error.message);
      
      toast({
        title: "Verification Successful",
        description: "Your phone number has been verified successfully.",
      });
      
      onVerificationComplete();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: error.message || "Invalid verification code. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <p className="text-muted-foreground">
          Enter the 6-digit verification code sent to
        </p>
        <p className="font-semibold text-lg">{phoneNumber}</p>
      </div>

      <div className="flex justify-center">
        <InputOTP
          maxLength={6}
          value={otp}
          onChange={setOtp}
          render={({ slots }) => (
            <InputOTPGroup>
              {slots.map((slot, index) => (
                <InputOTPSlot key={index} {...slot} index={index} />
              ))}
            </InputOTPGroup>
          )}
        />
      </div>

      <Button
        onClick={handleVerify}
        disabled={otp.length !== 6 || isSubmitting}
        className="w-full yoga-button"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
          </>
        ) : (
          "Verify"
        )}
      </Button>

      <div className="text-center">
        {canResend ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">Didn't receive the code?</p>
            <div className="flex justify-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleResend('sms')}
                disabled={isSubmitting}
              >
                Resend via SMS
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleResend('whatsapp')}
                disabled={isSubmitting}
                className="flex items-center"
              >
                <MessageSquare className="mr-1 h-4 w-4" />
                Via WhatsApp
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Resend code in {timeLeft} seconds
          </p>
        )}
      </div>
    </div>
  );
};

export default OTPVerification;
