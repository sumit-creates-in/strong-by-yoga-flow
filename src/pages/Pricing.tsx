import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useYogaClasses } from '@/contexts/YogaClassContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { createMembershipCheckoutSession } from '@/lib/stripe';
import { useAuth } from '@/contexts/AuthContext';

const Pricing = () => {
  const { membershipTiers, userMembership } = useYogaClasses();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handlePurchase = async (tierId: string) => {
    try {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to purchase a membership.",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }

      // Create success and cancel URLs
      const successUrl = `${window.location.origin}/membership-success?tier=${tierId}`;
      const cancelUrl = `${window.location.origin}/pricing`;

      // Redirect to Stripe Checkout
      await createMembershipCheckoutSession(tierId, user.id, successUrl, cancelUrl);
    } catch (error) {
      console.error("Error initiating checkout:", error);
      toast({
        title: "Checkout failed",
        description: "Sorry, there was an error starting the checkout process. Please try again later.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Membership Plan</h1>
          <p className="text-xl text-gray-600">
            Get unlimited access to all yoga classes and exclusive benefits
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {membershipTiers.map(tier => (
            <Card 
              key={tier.id} 
              className={`relative ${tier.popular ? 'border-2 border-yoga-blue shadow-lg' : ''}`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-yoga-blue text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                <CardDescription className="text-lg">
                  ${tier.price}
                  <span className="text-sm text-gray-500">/month</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-t border-b py-4">
                  <p className="text-sm text-gray-500">
                    {tier.duration === 1 ? 'Monthly' : 
                     tier.duration === 6 ? '6 Months' : 
                     'Annual'} billing
                  </p>
                  {tier.duration > 1 && (
                    <p className="text-sm text-green-600 font-medium">
                      Save ${((39.99 - tier.price) * tier.duration).toFixed(2)}
                    </p>
                  )}
                </div>
                
                <ul className="space-y-3">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${tier.popular ? 'bg-yoga-blue hover:bg-yoga-blue/90' : ''}`}
                  variant={tier.popular ? 'default' : 'outline'}
                  onClick={() => handlePurchase(tier.id)}
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Questions about our membership plans?
          </p>
          <Button variant="outline" onClick={() => navigate('/contact')}>
            Contact Us
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Pricing;
