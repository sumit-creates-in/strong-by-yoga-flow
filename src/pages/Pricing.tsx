
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Check, CreditCard, Zap, Clock, Award, Sparkles } from 'lucide-react';
import { useYogaClasses } from '@/contexts/YogaClassContext';
import { useTeachers } from '@/contexts/TeacherContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';

const Pricing = () => {
  const { membershipTiers, purchaseMembership, userMembership } = useYogaClasses();
  const { creditPackages, userCredits, purchaseCredits } = useTeachers();
  
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedCreditPackage, setSelectedCreditPackage] = useState<string | null>(null);
  const [paymentType, setPaymentType] = useState<'membership' | 'credits'>('membership');
  
  const handleSelectTier = (tierId: string) => {
    setSelectedTier(tierId);
    setPaymentType('membership');
    setIsPaymentDialogOpen(true);
  };

  const handleSelectCreditPackage = (packageId: string) => {
    setSelectedCreditPackage(packageId);
    setPaymentType('credits');
    setIsPaymentDialogOpen(true);
  };
  
  const handlePurchase = () => {
    if (paymentType === 'membership' && selectedTier) {
      purchaseMembership(selectedTier);
      setIsPaymentDialogOpen(false);
    } else if (paymentType === 'credits' && selectedCreditPackage) {
      purchaseCredits(selectedCreditPackage);
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
          <h1 className="text-3xl font-bold mb-3">Choose Your Plan</h1>
          <p className="text-gray-600 text-lg">
            Find the perfect plan for your yoga journey - group classes or personalized 1-on-1 sessions
          </p>
        </div>
        
        <Tabs defaultValue="memberships" className="w-full">
          <div className="flex justify-center mb-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="memberships">Group Classes</TabsTrigger>
              <TabsTrigger value="credits">1-on-1 Sessions</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="memberships" className="space-y-6">
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
          </TabsContent>
          
          <TabsContent value="credits" className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold mb-1">Your Current Credit Balance</h2>
                <p className="text-gray-600">Use credits for booking 1-on-1 sessions with our expert teachers</p>
              </div>
              <div className="bg-white px-6 py-3 rounded-lg border shadow-sm">
                <span className="text-2xl font-bold text-indigo-600">{userCredits} Credits</span>
              </div>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {creditPackages.map((pkg) => (
                <Card 
                  key={pkg.id} 
                  className={`relative overflow-hidden transition-transform hover:scale-105 ${
                    pkg.popular ? 'border-2 border-indigo-500 shadow-lg' : 
                    pkg.mostValue ? 'border-2 border-amber-500 shadow-lg' : ''
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute top-0 right-0">
                      <Badge className="bg-indigo-500 text-white rounded-tl-none rounded-br-none rounded-tr-md rounded-bl-md px-3 py-1.5">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  {pkg.mostValue && (
                    <div className="absolute top-0 right-0">
                      <Badge className="bg-amber-500 text-white rounded-tl-none rounded-br-none rounded-tr-md rounded-bl-md px-3 py-1.5">
                        Best Value
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader>
                    <CardTitle className="text-xl">{pkg.name}</CardTitle>
                    <div className="mt-2 flex items-center space-x-2">
                      <span className="text-3xl font-bold">${pkg.price}</span>
                      {pkg.credits > pkg.price && (
                        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                          Save ${pkg.credits - pkg.price}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 flex items-center justify-center rounded-full bg-indigo-100">
                          <Sparkles className="h-5 w-5 text-indigo-600" />
                        </div>
                        <span className="text-lg font-medium">{pkg.credits} credits</span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Clock className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-600">{Math.floor(pkg.credits / 60)} hrs of 1-on-1 sessions</span>
                      </div>
                      
                      {pkg.mostValue && (
                        <div className="flex items-center space-x-3">
                          <Award className="h-5 w-5 text-amber-500" />
                          <span className="text-gray-700">Most value for money</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <Button 
                      className={`w-full ${
                        pkg.popular ? 'bg-indigo-500 hover:bg-indigo-600' : 
                        pkg.mostValue ? 'bg-amber-500 hover:bg-amber-600' : ''
                      }`}
                      variant={pkg.popular || pkg.mostValue ? 'default' : 'outline'}
                      onClick={() => handleSelectCreditPackage(pkg.id)}
                    >
                      Buy Credits
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            <div className="mt-6 bg-gray-50 border rounded-lg p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">How do credits work?</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start space-x-2">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">1 credit = $1 value for booking sessions</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Credits never expire - use them anytime</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Use with any teacher for any session type</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Larger packages provide better value</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-white p-4 rounded-lg border flex-1">
                  <h4 className="font-medium mb-2">Example Session Costs:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span>30min Quick Guidance Call</span>
                      <span className="font-semibold">35-50 credits</span>
                    </li>
                    <li className="flex justify-between">
                      <span>60min Video Session</span>
                      <span className="font-semibold">75-85 credits</span>
                    </li>
                    <li className="flex justify-between">
                      <span>90min Yoga Therapy Session</span>
                      <span className="font-semibold">110 credits</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
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
              Enter your payment details to {paymentType === 'membership' ? 'activate your membership' : 'purchase credits'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6">
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md flex items-center justify-between">
                <div>
                  {paymentType === 'membership' ? (
                    <>
                      <p className="font-medium">
                        {membershipTiers.find(t => t.id === selectedTier)?.name} Plan
                      </p>
                      <p className="text-sm text-gray-500">
                        {membershipTiers.find(t => t.id === selectedTier)?.duration} month{membershipTiers.find(t => t.id === selectedTier)?.duration !== 1 ? 's' : ''}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium">
                        {creditPackages.find(p => p.id === selectedCreditPackage)?.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {creditPackages.find(p => p.id === selectedCreditPackage)?.credits} credits
                      </p>
                    </>
                  )}
                </div>
                <p className="font-bold">
                  ${paymentType === 'membership' 
                    ? membershipTiers.find(t => t.id === selectedTier)?.price 
                    : creditPackages.find(p => p.id === selectedCreditPackage)?.price
                  }
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
              {paymentType === 'membership' ? 'Activate Membership' : 'Purchase Credits'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Pricing;
