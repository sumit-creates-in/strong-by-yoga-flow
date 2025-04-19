import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { AlertTriangle, CreditCard } from 'lucide-react';

interface StripePaymentIntegrationProps {
  isActive?: boolean;
}

const StripePaymentIntegration: React.FC<StripePaymentIntegrationProps> = ({ 
  isActive = false 
}) => {
  // Load saved settings from localStorage if they exist
  const loadSavedSettings = () => {
    try {
      const savedSettings = localStorage.getItem('stripeSettings');
      if (savedSettings) {
        return JSON.parse(savedSettings);
      }
    } catch (error) {
      console.error('Failed to load stripe settings:', error);
    }
    return null;
  };

  const savedSettings = loadSavedSettings();
  
  const [apiKey, setApiKey] = useState(savedSettings?.apiKey || '');
  const [publishableKey, setPublishableKey] = useState(savedSettings?.publishableKey || '');
  const [webhookSecret, setWebhookSecret] = useState(savedSettings?.webhookSecret || '');
  const [testApiKey, setTestApiKey] = useState(savedSettings?.testApiKey || '');
  const [testPublishableKey, setTestPublishableKey] = useState(savedSettings?.testPublishableKey || '');
  const [testWebhookSecret, setTestWebhookSecret] = useState(savedSettings?.testWebhookSecret || '');
  const [isLiveMode, setIsLiveMode] = useState(savedSettings?.isLiveMode || false);
  const [enableCoupons, setEnableCoupons] = useState(savedSettings?.enableCoupons !== undefined ? savedSettings.enableCoupons : true);
  const [enableSubscriptions, setEnableSubscriptions] = useState(savedSettings?.enableSubscriptions || false);
  const [activationStatus, setActivationStatus] = useState(savedSettings?.activationStatus || isActive);
  const { toast } = useToast();
  
  const saveSettings = (settings) => {
    try {
      localStorage.setItem('stripeSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save stripe settings:', error);
    }
  };
  
  const handleSaveSettings = () => {
    const requiredTest = [testApiKey, testPublishableKey];
    const requiredLive = [apiKey, publishableKey];
    
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

    // Validate API key format
    const apiKeyToValidate = isLiveMode ? apiKey : testApiKey;
    const expectedSecretPrefix = isLiveMode ? 'sk_live_' : 'sk_test_';
    
    if (!apiKeyToValidate.startsWith(expectedSecretPrefix)) {
      toast({
        title: "Invalid Secret API key",
        description: `Secret API key must start with '${expectedSecretPrefix}'`,
        variant: "destructive",
      });
      return;
    }
    
    // Validate Publishable key format
    const pubKeyToValidate = isLiveMode ? publishableKey : testPublishableKey;
    const expectedPubPrefix = isLiveMode ? 'pk_live_' : 'pk_test_';
    
    if (!pubKeyToValidate.startsWith(expectedPubPrefix)) {
      toast({
        title: "Invalid Publishable API key",
        description: `Publishable API key must start with '${expectedPubPrefix}'`,
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, this would save the settings to the server
    const newSettings = {
      apiKey,
      publishableKey,
      webhookSecret,
      testApiKey,
      testPublishableKey,
      testWebhookSecret,
      isLiveMode,
      enableCoupons,
      enableSubscriptions,
      activationStatus: true
    };
    
    setActivationStatus(true);
    saveSettings(newSettings);
    
    toast({
      title: "Settings saved",
      description: `Stripe integration ${isLiveMode ? 'LIVE' : 'TEST'} mode has been activated.`,
    });
  };
  
  const handleDisconnect = () => {
    // In a real app, this would disconnect Stripe from the server
    setActivationStatus(false);
    
    const newSettings = {
      apiKey,
      publishableKey,
      webhookSecret,
      testApiKey,
      testPublishableKey,
      testWebhookSecret,
      isLiveMode,
      enableCoupons,
      enableSubscriptions,
      activationStatus: false
    };
    
    saveSettings(newSettings);
    
    toast({
      title: "Disconnected",
      description: "Stripe integration has been disabled.",
    });
  };
  
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [coupons, setCoupons] = useState(savedSettings?.coupons || [
    { id: '1', code: 'WELCOME10', type: 'percentage', amount: '10', active: true },
    { id: '2', code: 'YOGA25', type: 'percentage', amount: '25', active: true },
    { id: '3', code: 'FLAT20', type: 'fixed', amount: '20', active: true },
  ]);
  
  useEffect(() => {
    // Save coupons when they change
    const settings = loadSavedSettings() || {};
    saveSettings({
      ...settings,
      coupons
    });
  }, [coupons]);
  
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
                        <p className="text-xs text-gray-500">Get this from your Stripe Dashboard API keys section</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="publishableKey">Publishable API Key</Label>
                        <Input
                          id="publishableKey"
                          value={publishableKey}
                          onChange={(e) => setPublishableKey(e.target.value)}
                          placeholder="pk_live_..."
                        />
                        <p className="text-xs text-gray-500">Get this from your Stripe Dashboard API keys section</p>
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
                        <Label htmlFor="testApiKey">Secret API Key</Label>
                        <Input
                          id="testApiKey"
                          type="password"
                          value={testApiKey}
                          onChange={(e) => setTestApiKey(e.target.value)}
                          placeholder="sk_test_..."
                        />
                        <p className="text-xs text-gray-500">Get this from your Stripe Dashboard API keys section</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="testPublishableKey">Publishable API Key</Label>
                        <Input
                          id="testPublishableKey"
                          value={testPublishableKey}
                          onChange={(e) => setTestPublishableKey(e.target.value)}
                          placeholder="pk_test_..."
                        />
                        <p className="text-xs text-gray-500">Get this from your Stripe Dashboard API keys section</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="testWebhookSecret">Webhook Secret (optional)</Label>
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
                  <Button onClick={handleSaveSettings}>
                    Save Settings
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
                
                {coupons.length > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {coupons.map((coupon) => (
                          <tr key={coupon.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{coupon.code}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {coupon.type === 'percentage' ? `${coupon.amount}%` : `$${coupon.amount}`}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${coupon.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {coupon.active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleCoupon(coupon.id)}
                                className="text-indigo-600 hover:text-indigo-900 mr-3"
                              >
                                {coupon.active ? 'Disable' : 'Enable'}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
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
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No coupon codes created yet.
                  </div>
                )}
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
                      <p className="text-xs text-gray-500">Get this from your Stripe Dashboard API keys section</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="publishableKey">Publishable API Key</Label>
                      <Input
                        id="publishableKey"
                        value={publishableKey}
                        onChange={(e) => setPublishableKey(e.target.value)}
                        placeholder="pk_live_..."
                      />
                      <p className="text-xs text-gray-500">Get this from your Stripe Dashboard API keys section</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="testApiKey">Secret API Key</Label>
                      <Input
                        id="testApiKey"
                        type="password"
                        value={testApiKey}
                        onChange={(e) => setTestApiKey(e.target.value)}
                        placeholder="sk_test_..."
                      />
                      <p className="text-xs text-gray-500">Get this from your Stripe Dashboard API keys section</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="testPublishableKey">Publishable API Key</Label>
                      <Input
                        id="testPublishableKey"
                        value={testPublishableKey}
                        onChange={(e) => setTestPublishableKey(e.target.value)}
                        placeholder="pk_test_..."
                      />
                      <p className="text-xs text-gray-500">Get this from your Stripe Dashboard API keys section</p>
                    </div>
                  </>
                )}
              </div>
              
              <Button onClick={handleSaveSettings} className="w-full">
                Connect Stripe
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StripePaymentIntegration;
