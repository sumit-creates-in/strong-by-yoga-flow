import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useYogaClasses } from '@/contexts/YogaClassContext';
import { CheckCircle, Calendar, Shield, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/Layout';
import { format, addMonths } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';

const MembershipSuccess = () => {
  const [searchParams] = useSearchParams();
  const { membershipTiers, purchaseMembership, userMembership } = useYogaClasses();
  const [purchasedTier, setPurchasedTier] = useState<any>(null);
  const [activating, setActivating] = useState(false);
  const { toast } = useToast();
  
  const tierId = searchParams.get('tier');
  
  // Activate the membership when the component loads
  useEffect(() => {
    const activateMembership = async () => {
      if (tierId && !userMembership.active && !activating) {
        try {
          setActivating(true);
          console.log('Activating membership tier:', tierId);
          await purchaseMembership(tierId);
          toast({
            title: "Membership Activated",
            description: "Your membership has been successfully activated",
          });
          setActivating(false);
        } catch (error) {
          console.error('Error activating membership:', error);
          toast({
            variant: "destructive",
            title: "Activation Error",
            description: "There was an error activating your membership. Please contact support.",
          });
          setActivating(false);
        }
      }
    };
    
    activateMembership();
  }, [tierId, userMembership, purchaseMembership, toast]);
  
  useEffect(() => {
    if (tierId) {
      const tier = membershipTiers.find(t => t.id === tierId);
      if (tier) {
        setPurchasedTier(tier);
      }
    }
  }, [tierId, membershipTiers]);
  
  if (!purchasedTier) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-12 px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-6">Membership Confirmation</h1>
            <p className="text-gray-600 mb-8">
              Thank you for purchasing a membership. We're processing your information.
            </p>
            <Link to="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }
  
  const startDate = new Date();
  const expiryDate = addMonths(startDate, purchasedTier.duration);
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Membership Activated Successfully!</h1>
          <p className="text-gray-600">
            Your {purchasedTier.name} has been activated and is ready to use.
          </p>
        </div>
        
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Membership Details</CardTitle>
            <CardDescription>Here's a summary of your membership</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Membership Type</h3>
                  <p className="font-semibold text-lg">{purchasedTier.name}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Duration</h3>
                  <p className="font-semibold">
                    {purchasedTier.duration} {purchasedTier.duration === 1 ? 'month' : 'months'}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Price</h3>
                  <p className="font-semibold">${purchasedTier.price}/month</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Start Date</h3>
                  <p className="font-semibold">{format(startDate, 'MMMM d, yyyy')}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Expiry Date</h3>
                  <p className="font-semibold">{format(expiryDate, 'MMMM d, yyyy')}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Included Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {purchasedTier.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="flex-1">
              <Link to="/classes">
                Browse Classes <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link to="/dashboard">
                Go to Dashboard
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        <div className="mt-12 bg-blue-50 rounded-lg p-6 flex items-start gap-4">
          <div className="rounded-full bg-blue-100 p-2">
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-blue-900 mb-1">What's Next?</h3>
            <p className="text-blue-700">
              You now have access to all the classes included in your membership. Head over to the classes page to browse and join upcoming sessions, or check your dashboard for personalized recommendations.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MembershipSuccess; 