import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Check, CreditCard, Zap, Clock, Award, Sparkles, Plus, Minus, Coins, LockKeyhole } from 'lucide-react';
import { useYogaClasses } from '@/contexts/YogaClassContext';
import { useTeachers } from '@/contexts/TeacherContext';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
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
import { useStripeService } from '@/services/stripe-service';
import { useToast } from '@/components/ui/use-toast';

const Pricing = () => {
  const { membershipTiers, purchaseMembership, userMembership } = useYogaClasses();
  const { creditPackages, userCredits, purchaseCredits } = useTeachers();
  const stripeService = useStripeService();
  const { toast } = useToast();
  
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedCreditPackage, setSelectedCreditPackage] = useState<string | null>(null);
  const [paymentType, setPaymentType] = useState<'membership' | 'credits' | 'custom'>('membership');
  const [customCredits, setCustomCredits] = useState(50);
  const [paymentMethod, setPaymentMethod] = useState<'onetime' | 'subscription'>('onetime');
  
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

  const handleCustomCreditPurchase = () => {
    setPaymentType('custom');
    setIsPaymentDialogOpen(true);
  }
  
  const handlePurchase = async () => {
    setIsPaymentDialogOpen(false);
    
    try {
      if (paymentType === 'membership' && selectedTier) {
        const selectedMembership = membershipTiers.find(t => t.id === selectedTier);
        if (!selectedMembership) throw new Error('Membership tier not found');
        
        // Create Stripe checkout session for membership
        await stripeService.createCheckoutSession({
          packageId: selectedMembership.id,
          packageName: selectedMembership.name,
          price: selectedMembership.price,
          mode: 'subscription',
          interval: 'month',
          metadata: {
            type: 'membership',
            tier: selectedMembership.name,
            duration: String(selectedMembership.duration)
          }
        });
      } 
      else if (paymentType === 'credits' && selectedCreditPackage) {
        const selectedPackage = creditPackages.find(p => p.id === selectedCreditPackage);
        if (!selectedPackage) throw new Error('Credit package not found');
        
        // Create Stripe checkout session for credit package
        await stripeService.createCheckoutSession({
          packageId: selectedPackage.id,
          packageName: selectedPackage.name,
          creditAmount: selectedPackage.credits,
          price: selectedPackage.price,
          metadata: {
            type: 'credit_purchase'
          }
        });
      } 
      else if (paymentType === 'custom') {
        // Custom credits purchase logic
        const price = paymentMethod === 'subscription' 
          ? Math.round(customCredits * 0.95 * 100) / 100 
          : customCredits;
          
        await stripeService.createCheckoutSession({
          packageId: `custom-${Date.now()}`,
          packageName: `${customCredits} Credits ${paymentMethod === 'subscription' ? '(Subscription)' : ''}`,
          creditAmount: customCredits,
          price: price,
          mode: paymentMethod === 'subscription' ? 'subscription' : 'payment',
          interval: paymentMethod === 'subscription' ? 'month' : undefined,
          metadata: {
            type: 'credit_purchase',
            subscription: paymentMethod === 'subscription' ? 'true' : 'false'
          }
        });
        
        // Optional credit purchase function - would be replaced by actual webhook verification
        if (purchaseCredits && paymentType === 'custom') {
          // This is only for demo purposes - real apps should not add credits before payment verification
          // purchaseCredits(customCredits);
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Failed to process payment",
        variant: "destructive",
      });
    }
  };

  const incrementCredits = (amount: number) => {
    setCustomCredits(prev => Math.max(10, Math.min(1000, prev + amount)));
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
            
            {/* Custom Credit Purchase Card */}
            <Card className="mb-8 border-2 border-indigo-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Coins className="h-5 w-5 mr-2 text-indigo-600" />
                  Buy Custom Amount
                </CardTitle>
                <CardDescription>
                  Purchase exactly how many credits you need
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Buying 1-on-1 Credits</h3>
                    <div className="text-gray-600 mb-4">1 Credit = $1 USD</div>
                    
                    <div className="space-y-4">
                      <div className="mb-6">
                        <label htmlFor="custom-credits" className="block text-sm font-medium text-gray-700 mb-2">
                          How many credits would you like to buy?
                        </label>
                        <div className="flex items-center">
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => incrementCredits(-10)}
                            disabled={customCredits <= 10}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <div className="relative mx-2 flex-grow">
                            <Input
                              id="custom-credits"
                              type="number"
                              min="10"
                              max="1000"
                              value={customCredits}
                              onChange={(e) => setCustomCredits(Number(e.target.value))}
                              className="text-center"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Coins className="h-4 w-4 text-gray-400" />
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => incrementCredits(10)}
                            disabled={customCredits >= 1000}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <RadioGroup defaultValue="onetime" className="space-y-3" onValueChange={(value: any) => setPaymentMethod(value)}>
                        <div className="flex items-center space-x-2 border p-4 rounded-md bg-white">
                          <RadioGroupItem value="onetime" id="onetime" />
                          <Label htmlFor="onetime" className="flex-grow">One time payment</Label>
                        </div>
                        <div className="flex items-center space-x-2 border p-4 rounded-md bg-white">
                          <RadioGroupItem value="subscription" id="subscription" />
                          <Label htmlFor="subscription" className="flex-grow">
                            Subscribe & Save 5% every month + Unlimited Group Classes 
                            <span className="block text-sm text-gray-500 mt-1">(Renews every month)</span>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-lg">Total:</span>
                      <span className="font-bold text-xl">
                        ${paymentMethod === 'subscription' ? (customCredits * 0.95).toFixed(2) : customCredits.toFixed(2)}
                      </span>
                    </div>
                    {paymentMethod === 'subscription' && (
                      <div className="text-sm text-green-600 text-right">You save: ${(customCredits * 0.05).toFixed(2)}</div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  onClick={handleCustomCreditPurchase}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Buy {customCredits} Credits
                </Button>
              </CardFooter>
            </Card>
            
            {/* Credit Package Cards */}
            <h3 className="text-xl font-semibold mb-4">Credit Packages</h3>
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
              Enter your payment details to {paymentType === 'membership' 
                ? 'activate your membership' 
                : 'purchase credits'}
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
                  ) : paymentType === 'credits' ? (
                    <>
                      <p className="font-medium">
                        {creditPackages.find(p => p.id === selectedCreditPackage)?.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {creditPackages.find(p => p.id === selectedCreditPackage)?.credits} credits
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium">
                        Custom Credit Purchase
                      </p>
                      <p className="text-sm text-gray-500">
                        {customCredits} credits {paymentMethod === 'subscription' ? '(subscription)' : '(one-time)'}
                      </p>
                    </>
                  )}
                </div>
                <p className="font-bold">
                  ${paymentType === 'membership' 
                    ? membershipTiers.find(t => t.id === selectedTier)?.price 
                    : paymentType === 'credits'
                    ? creditPackages.find(p => p.id === selectedCreditPackage)?.price
                    : paymentMethod === 'subscription' 
                    ? (customCredits * 0.95).toFixed(2)
                    : customCredits.toFixed(2)
                  }
                </p>
              </div>
              
              <div className="border rounded-md p-4">
                <div className="flex items-center space-x-3 mb-4">
                  <CreditCard className="text-gray-400" size={20} />
                  <span className="font-medium">Payment Details</span>
                </div>
                
                <p className="text-sm text-gray-500 mb-4">
                  For demo purposes, no actual payment will be processed.
                </p>
                
                <div className="relative border rounded-md">
                  <div className="flex items-center border-b px-4 py-3">
                    <CreditCard className="h-4 w-4 text-gray-400 mr-3" />
                    <input
                      type="text"
                      placeholder="Card number"
                      className="flex-1 border-none outline-none bg-transparent"
                    />
                    <div className="px-4 bg-gray-50 py-2 rounded-md flex items-center">
                      <LockKeyhole className="h-3.5 w-3.5 text-gray-400 mr-1.5" />
                      <span className="text-sm text-gray-500">Secure</span>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="flex-1 border-r px-4 py-3">
                      <input
                        type="text"
                        placeholder="MM / YY"
                        className="w-full border-none outline-none bg-transparent"
                      />
                    </div>
                    <div className="flex-1 px-4 py-3">
                      <input
                        type="text"
                        placeholder="CVC"
                        className="w-full border-none outline-none bg-transparent"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-center">
                  <img 
                    src="public/lovable-uploads/b2bd268b-8f60-4aea-93bb-955af5727f00.png" 
                    alt="Payment methods" 
                    className="h-10"
                  />
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
