
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar, Check, CreditCard, Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useYogaClasses } from '@/contexts/YogaClassContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

interface MembershipManagerProps {
  onMembershipChange?: () => void;
}

const MembershipManager: React.FC<MembershipManagerProps> = ({ onMembershipChange }) => {
  const { userMembership, membershipTiers, purchaseMembership } = useYogaClasses();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleSelectTier = (tierId: string) => {
    setSelectedTier(tierId);
    setIsPaymentDialogOpen(true);
  };
  
  const handlePurchase = async () => {
    if (selectedTier) {
      await purchaseMembership(selectedTier);
      setIsPaymentDialogOpen(false);
      if (onMembershipChange) {
        onMembershipChange();
      }
    }
  };
  
  const handleCancelMembership = () => {
    // In a real app, this would call an API to cancel the membership
    setIsCancelDialogOpen(false);
    toast({
      title: 'Membership Cancelled',
      description: 'Your membership has been cancelled but will remain active until the end of the current period.',
    });
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Your Membership</h2>
      
      {userMembership.active ? (
        <Card className="bg-white border border-yoga-light-blue">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">
                {userMembership.type} Membership
              </CardTitle>
              <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded-full flex items-center">
                <Check size={14} className="mr-1" />
                Active
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userMembership.expiryDate && (
                <div className="flex items-center text-gray-700">
                  <Calendar size={18} className="mr-2 text-yoga-blue" />
                  <span>
                    Valid until {format(userMembership.expiryDate, 'MMMM d, yyyy')}
                  </span>
                </div>
              )}
              
              <div className="flex items-center text-gray-700">
                <Shield size={18} className="mr-2 text-yoga-blue" />
                <span>Unlimited access to all yoga classes</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex flex-col xs:flex-row gap-3 w-full">
              <Button 
                variant="outline" 
                onClick={() => setIsCancelDialogOpen(true)}
                className="flex-1"
              >
                Cancel Membership
              </Button>
              <Button
                onClick={() => navigate('/pricing')}
                className="flex-1 bg-yoga-blue hover:bg-yoga-blue/90"
              >
                Upgrade Plan
              </Button>
            </div>
          </CardFooter>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-md flex items-start gap-3">
            <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800">No active membership</h3>
              <p className="text-amber-700 text-sm mt-1">
                You currently don't have an active membership. Purchase a membership to join yoga classes.
              </p>
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            {membershipTiers.slice(0, 2).map((tier) => (
              <Card key={tier.id} className={`transition-shadow hover:shadow-md ${tier.popular ? 'border-2 border-yoga-blue' : ''}`}>
                <CardHeader>
                  {tier.popular && (
                    <span className="bg-yoga-yellow text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full mb-2 inline-block">
                      Most Popular
                    </span>
                  )}
                  <CardTitle>{tier.name}</CardTitle>
                  <div className="mt-2 text-2xl font-bold">
                    ${tier.price}
                    <span className="text-base font-normal text-gray-600">
                      /month
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center">
                        <Check size={16} className="text-green-500 mr-2" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className={tier.popular ? 'w-full bg-yoga-blue hover:bg-yoga-blue/90' : 'w-full'}
                    variant={tier.popular ? 'default' : 'outline'}
                    onClick={() => handleSelectTier(tier.id)}
                  >
                    Select Plan
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          <div className="flex justify-center">
            <Button 
              variant="outline"
              onClick={() => navigate('/pricing')}
              className="mt-2"
            >
              View All Plans
            </Button>
          </div>
        </div>
      )}
      
      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Your Purchase</DialogTitle>
            <DialogDescription>
              Enter your payment details to activate your membership
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6">
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {membershipTiers.find(t => t.id === selectedTier)?.name} Plan
                  </p>
                  <p className="text-sm text-gray-500">
                    {membershipTiers.find(t => t.id === selectedTier)?.duration} month{membershipTiers.find(t => t.id === selectedTier)?.duration !== 1 ? 's' : ''}
                  </p>
                </div>
                <p className="font-bold">
                  ${membershipTiers.find(t => t.id === selectedTier)?.price}
                </p>
              </div>
              
              <div className="border rounded-md p-4">
                <div className="flex items-center space-x-3 mb-4">
                  <CreditCard className="text-gray-400" size={20} />
                  <span className="font-medium">Payment Details</span>
                </div>
                
                <p className="text-sm text-gray-500 mb-2">
                  For demo purposes, no actual payment will be processed.
                </p>
                
                <div className="flex items-center justify-center bg-gray-50 rounded-md p-6 mb-2">
                  <span className="text-lg font-medium">Demo Payment System</span>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePurchase}>
              Activate Membership
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Cancel Membership Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Membership</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your membership? You'll continue to have access until the end of your current billing period.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800">
                After your membership ends, you'll lose access to:
              </p>
              <ul className="list-disc pl-5 text-sm mt-2 space-y-1 text-red-700">
                <li>All live yoga classes</li>
                <li>Class recordings</li>
                <li>Personal guidance from teachers</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
              Keep Membership
            </Button>
            <Button variant="destructive" onClick={handleCancelMembership}>
              Cancel Membership
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MembershipManager;
