
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, CreditCard, Zap } from 'lucide-react';
import { useYogaClasses } from '@/contexts/YogaClassContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { format } from 'date-fns';

const Pricing = () => {
  const { membershipTiers, purchaseMembership, userMembership } = useYogaClasses();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  
  const handleSelectTier = (tierId: string) => {
    setSelectedTier(tierId);
    setIsPaymentDialogOpen(true);
  };
  
  const handlePurchase = () => {
    if (selectedTier) {
      purchaseMembership(selectedTier);
      setIsPaymentDialogOpen(false);
    }
  };
  
  const FeatureItem = ({ text }: { text: string }) => (
    <div className="flex items-center space-x-3">
      <div className="h-5 w-5 flex items-center justify-center rounded-full bg-green-100">
        <Check className="h-3.5 w-3.5 text-green-600" />
      </div>
      <span className="text-gray-700">{text}</span>
    </div>
  );
  
  return (
    <Layout>
      <div className="space-y-8">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-3">Choose Your Membership Plan</h1>
          <p className="text-gray-600 text-lg">
            Unlock access to all our yoga classes with a membership that suits your needs
          </p>
        </div>
        
        {userMembership.active && userMembership.expiryDate && (
          <div className="bg-yoga-light-blue/40 border border-yoga-light-blue p-4 rounded-lg text-center mb-8">
            <p className="text-yoga-blue font-medium">
              You have an active {userMembership.type} membership valid until {format(userMembership.expiryDate, 'MMMM d, yyyy')}
            </p>
          </div>
        )}
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {membershipTiers.map((tier) => (
            <Card 
              key={tier.id} 
              className={`relative overflow-hidden transition-transform hover:scale-105 ${tier.popular ? 'border-2 border-yoga-blue shadow-lg' : ''}`}
            >
              {tier.popular && (
                <div className="absolute top-0 right-0">
                  <Badge className="bg-yoga-blue text-white rounded-tl-none rounded-br-none rounded-tr-md rounded-bl-md px-3 py-1.5">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <div className="mt-3">
                  <span className="text-3xl font-bold">${tier.price}</span>
                  {tier.duration === 1 ? (
                    <span className="text-gray-600 ml-1">/month</span>
                  ) : (
                    <span className="text-gray-600 ml-1">for {tier.duration} months</span>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {tier.features.map((feature, idx) => (
                    <FeatureItem key={idx} text={feature} />
                  ))}
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  className={`w-full ${tier.popular ? 'bg-yoga-blue hover:bg-yoga-blue/90' : ''}`}
                  variant={tier.popular ? 'default' : 'outline'}
                  onClick={() => handleSelectTier(tier.id)}
                  disabled={userMembership.active}
                >
                  {userMembership.active ? 'Already Subscribed' : 'Select Plan'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="mt-12 bg-yoga-light-blue/20 p-6 rounded-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="bg-yoga-light-blue p-4 rounded-full">
              <Zap size={24} className="text-yoga-blue" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">Need a custom plan for your team?</h3>
              <p className="text-gray-700 mt-1">
                We offer special rates for groups of 5 or more. Contact us to learn more about our corporate plans.
              </p>
            </div>
            <Button variant="outline" className="whitespace-nowrap">
              Contact Sales
            </Button>
          </div>
        </div>
      </div>
      
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
    </Layout>
  );
};

export default Pricing;
