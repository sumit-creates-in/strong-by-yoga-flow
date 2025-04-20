import React from 'react';
import Layout from '@/components/Layout';
import { useTeachers } from '@/contexts/TeacherContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const Pricing = () => {
  const { creditPackages, userCredits, purchaseCredits } = useTeachers();
  
  const handlePurchase = (packageId: string) => {
    if (purchaseCredits) {
      purchaseCredits(packageId);
      toast({
        title: "Credits purchased!",
        description: "The credits have been added to your account.",
      });
    } else {
      console.error("purchaseCredits function is not available in the context");
      toast({
        title: "Purchase failed",
        description: "Sorry, there was an error processing your purchase. Please try again later.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Pricing Plans</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {creditPackages.map(pkg => (
            <Card key={pkg.id} className={pkg.popular ? "border-2 border-yoga-blue" : ""}>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">{pkg.name}</CardTitle>
                <CardDescription>
                  {pkg.credits} Credits
                  {pkg.mostValue && <span className="ml-2 text-sm text-green-500">(Most Value)</span>}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-4xl font-bold">${pkg.price}</div>
                
                <ul className="space-y-2">
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                    Access to all teachers
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                    Flexible scheduling
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                    24/7 support
                  </li>
                </ul>
                
                <Button className="w-full yoga-button" onClick={() => handlePurchase(pkg.id)}>
                  Purchase
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-8 p-4 bg-gray-50 rounded-md">
          <h2 className="text-xl font-semibold mb-2">Your Current Credits</h2>
          <p className="text-gray-700">You currently have {userCredits} credits available.</p>
        </div>
      </div>
    </Layout>
  );
};

export default Pricing;
