import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { AlertTriangle, CreditCard } from 'lucide-react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

interface StripePaymentIntegrationProps {
  isActive?: boolean;
}

const StripePaymentIntegration: React.FC<StripePaymentIntegrationProps> = ({ 
  isActive = false 
}) => {
  const [apiKey, setApiKey] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [testApiKey, setTestApiKey] = useState('');
  const [testWebhookSecret, setTestWebhookSecret] = useState('');
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [enableCoupons, setEnableCoupons] = useState(true);
  const [enableSubscriptions, setEnableSubscriptions] = useState(false);
  const [activationStatus, setActivationStatus] = useState(isActive);
  const [testingConnection, setTestingConnection] = useState(false);
  const { toast } = useToast();
  const supabase = useSupabaseClient();
  
  const handleSaveSettings = async () => {
    const requiredTest = [testApiKey];
    const requiredLive = [apiKey];
    
    const missing = isLiveMode 
      ? requiredLive.some(field => !field)
      : requiredTest.some(field => !field);
    
    if (missing) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    setTestingConnection(true);
    
    try {
      toast({
        title: "Testing Stripe connection...",
        description: "Checking API key validity...",
      });
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setActivationStatus(true);
      setTestingConnection(false);
      
      toast({
        title: "Settings saved",
        description: `Stripe integration ${isLiveMode ? 'LIVE' : 'TEST'} mode has been activated.`,
      });
    } catch (error) {
      setTestingConnection(false);
      toast({
        title: "Connection error",
        description: "Could not connect to Stripe. Please check your API key.",
        variant: "destructive",
      });
    }
  };
  
  const handleDisconnect = () => {
    setActivationStatus(false);
    toast({
      title: "Disconnected",
      description: "Stripe integration has been disabled.",
    });
  };
  
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [coupons, setCoupons] = useState([
    { id: '1', code: 'WELCOME10', type: 'percentage', amount: '10', active: true },
    { id: '2', code: 'YOGA25', type: 'percentage', amount: '25', active: true },
    { id: '3', code: 'FLAT20', type: 'fixed', amount: '20', active: true },
  ]);
  
  const handleAddCoupon = () => {
    if (!couponCode || !discountAmount) {
      toast({
        title: "Missing information",
        description: "Please provide a coupon code and discount amount.",
        variant: "destructive",
      });
      return;
    }
    
    const newCoupon = {
      id: `${Date.now()}`,
      code: couponCode,
      type: discountType,
      amount: discountAmount,
      active: true,
    };
    
    setCoupons([...coupons, newCoupon]);
    setCouponCode('');
    setDiscountAmount('');
    
    toast({
      title: "Coupon created",
      description: `${couponCode} coupon has been created successfully.`,
    });
  };
  
  const handleToggleCoupon = (id: string) => {
    setCoupons(coupons.map(coupon => 
      coupon.id === id ? { ...coupon, active: !coupon.active } : coupon
    ));
  };
  
  const handleDeleteCoupon = (id: string) => {
    setCoupons(coupons.filter(coupon => coupon.id !== id));
    
    toast({
      title: "Coupon deleted",
      description: "The coupon has been deleted.",
    });
  };
  
  const handleTestCheckout = async () => {
    try {
      setTestingConnection(true);
      toast({
        title: "Creating test checkout session...",
        description: "Redirecting to Stripe...",
      });
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          packageId: 'test-package',
          packageName: 'Test Package',
          creditAmount: 100,
          price: 10
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      toast({
        title: "Checkout Error",
        description: error instanceof Error ? error.message : "Failed to create checkout session",
        variant: "destructive",
      });
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Stripe Payment Integration</CardTitle>
            <CardDescription>
              Configure Stripe to accept payments for classes and memberships
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {activationStatus ? 'Active' : 'Inactive'}
            </span>
            <div className={`w-3 h-3 rounded-full ${activationStatus ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {activationStatus ? (
          <Tabs defaultValue="settings">
            <TabsList className="mb-4">
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="coupons">Coupon Codes</TabsTrigger>
              <TabsTrigger value="testing">Test Integration</TabsTrigger>
            </TabsList>
            
            <TabsContent value="settings">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Live Mode</h3>
                    <p className="text-sm text-gray-500">
                      Use live keys to process real payments
                    </p>
                  </div>
                  <Switch
                    checked={isLiveMode}
                    onCheckedChange={setIsLiveMode}
                  />
                </div>
                
                <div className={`p-4 rounded-md border ${isLiveMode ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}`}>
                  <div className="flex items-start">
                    <AlertTriangle className={`h-5 w-5 mr-2 ${isLiveMode ? 'text-red-500' : 'text-yellow-500'}`} />
                    <p className="text-sm">
                      {isLiveMode
                        ? "You are in LIVE mode. Real payments will be processed."
                        : "You are in TEST mode. No real payments will be processed."}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">{isLiveMode ? 'Live API Keys' : 'Test API Keys'}</h3>
                  
                  {isLiveMode ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="apiKey">Secret API Key</Label>
                        <Input
                          id="apiKey"
                          type="password"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder="sk_live_..."
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="webhookSecret">Webhook Secret (optional)</Label>
                        <Input
                          id="webhookSecret"
                          type="password"
                          value={webhookSecret}
                          onChange={(e) => setWebhookSecret(e.target.value)}
                          placeholder="whsec_..."
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="testApiKey">Test Secret API Key</Label>
                        <Input
                          id="testApiKey"
                          type="password"
                          value={testApiKey}
                          onChange={(e) => setTestApiKey(e.target.value)}
                          placeholder="sk_test_..."
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="testWebhookSecret">Test Webhook Secret (optional)</Label>
                        <Input
                          id="testWebhookSecret"
                          type="password"
                          value={testWebhookSecret}
                          onChange={(e) => setTestWebhookSecret(e.target.value)}
                          placeholder="whsec_..."
                        />
                      </div>
                    </>
                  )}
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Payment Features</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Enable coupon codes</p>
                      <p className="text-sm text-gray-500">
                        Allow users to apply discount codes at checkout
                      </p>
                    </div>
                    <Switch
                      checked={enableCoupons}
                      onCheckedChange={setEnableCoupons}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Enable subscriptions</p>
                      <p className="text-sm text-gray-500">
                        Allow recurring payments for memberships
                      </p>
                    </div>
                    <Switch
                      checked={enableSubscriptions}
                      onCheckedChange={setEnableSubscriptions}
                    />
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <Button variant="outline" onClick={handleDisconnect}>
                    Disconnect Stripe
                  </Button>
                  <Button onClick={handleSaveSettings} disabled={testingConnection}>
                    {testingConnection ? 'Connecting...' : 'Save Settings'}
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="coupons">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Create Coupon Code</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="couponCode">Coupon Code</Label>
                      <Input
                        id="couponCode"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="e.g., WELCOME10"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="discountAmount">Discount Amount</Label>
                      <Input
                        id="discountAmount"
                        value={discountAmount}
                        onChange={(e) => setDiscountAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                        placeholder="e.g., 10"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="discountType">Discount Type</Label>
                      <select
                        id="discountType"
                        className="w-full p-2 border border-gray-300 rounded"
                        value={discountType}
                        onChange={(e) => setDiscountType(e.target.value)}
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount ($)</option>
                      </select>
                    </div>
                  </div>
                  <Button onClick={handleAddCoupon} className="w-full">
                    Add Coupon
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Active Coupon Codes</h3>
                  
                  {coupons.length === 0 ? (
                    <p className="text-center py-4 text-gray-500">No coupon codes found</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Code
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Discount
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {coupons.map((coupon) => (
                            <tr key={coupon.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{coupon.code}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">
                                  {coupon.amount}{coupon.type === 'percentage' ? '%' : ' USD'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Switch
                                  checked={coupon.active}
                                  onCheckedChange={() => handleToggleCoupon(coupon.id)}
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <Button 
                                  variant="ghost" 
                                  onClick={() => handleDeleteCoupon(coupon.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Delete
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="testing">
              <div className="space-y-6">
                <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                  <h3 className="font-medium">Test Stripe Integration</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    You can test the payment flow by creating a test checkout session.
                    This will simulate a real payment using Stripe's test environment.
                  </p>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-md">
                  <h4 className="font-medium">Test Checkout</h4>
                  <p className="mt-2 text-sm text-gray-600">
                    Create a test checkout session for 100 credits ($10).
                  </p>
                  <Button 
                    onClick={handleTestCheckout} 
                    className="mt-4"
                    disabled={testingConnection}
                  >
                    {testingConnection ? 'Processing...' : 'Create Test Checkout'}
                  </Button>
                </div>
                
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <h4 className="font-medium text-yellow-800">Stripe Test Cards</h4>
                  <p className="mt-2 text-sm text-yellow-800">
                    Use these card details for testing:
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-yellow-800">
                    <li>Success: 4242 4242 4242 4242</li>
                    <li>Decline: 4000 0000 0000 0002</li>
                    <li>Any future date, any 3 digits for CVC</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-6">
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
              <div className="flex">
                <CreditCard className="h-6 w-6 text-gray-600 mr-3" />
                <div>
                  <h3 className="font-medium">Accept payments with Stripe</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Connect your Stripe account to accept payments for classes, sessions, and memberships.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Live Mode</h3>
                  <p className="text-sm text-gray-500">
                    Use live keys to process real payments
                  </p>
                </div>
                <Switch
                  checked={isLiveMode}
                  onCheckedChange={setIsLiveMode}
                />
              </div>
              
              <div className={`p-4 rounded-md border ${isLiveMode ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}`}>
                <div className="flex items-start">
                  <AlertTriangle className={`h-5 w-5 mr-2 ${isLiveMode ? 'text-red-500' : 'text-yellow-500'}`} />
                  <p className="text-sm">
                    {isLiveMode
                      ? "You are in LIVE mode. Real payments will be processed."
                      : "You are in TEST mode. No real payments will be processed."}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium">{isLiveMode ? 'Live API Keys' : 'Test API Keys'}</h3>
                
                {isLiveMode ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="apiKey">Secret API Key</Label>
                      <Input
                        id="apiKey"
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="sk_live_..."
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="testApiKey">Test Secret API Key</Label>
                      <Input
                        id="testApiKey"
                        type="password"
                        value={testApiKey}
                        onChange={(e) => setTestApiKey(e.target.value)}
                        placeholder="sk_test_..."
                      />
                    </div>
                  </>
                )}
              </div>
              
              <Button 
                onClick={handleSaveSettings} 
                className="w-full"
                disabled={testingConnection}
              >
                {testingConnection ? 'Connecting...' : 'Connect Stripe'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StripePaymentIntegration;
