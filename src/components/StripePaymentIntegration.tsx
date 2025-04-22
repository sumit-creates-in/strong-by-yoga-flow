import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { AlertTriangle, CreditCard } from 'lucide-react';
import { settingsService } from '@/services/settingsService';

interface StripePaymentIntegrationProps {
  isActive?: boolean;
}

const StripePaymentIntegration: React.FC<StripePaymentIntegrationProps> = ({ 
  isActive = false 
}) => {
  // Load saved settings from the database if they exist
  const [loading, setLoading] = useState(true);
  const [savedSettings, setSavedSettings] = useState<any>(null);
  const { toast } = useToast();
  
  // Load initial settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        // Fetch stripe settings from the database
        const settings = await settingsService.getSetting('stripeSettings');
        setSavedSettings(settings);
      } catch (error) {
        console.error('Failed to load stripe settings:', error);
        toast({
          variant: "destructive",
          title: "Error loading settings",
          description: "Could not load saved settings from the database.",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, [toast]);
  
  const [apiKey, setApiKey] = useState('');
  const [publishableKey, setPublishableKey] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [testApiKey, setTestApiKey] = useState('');
  const [testPublishableKey, setTestPublishableKey] = useState('');
  const [testWebhookSecret, setTestWebhookSecret] = useState('');
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [enableCoupons, setEnableCoupons] = useState(true);
  const [enableSubscriptions, setEnableSubscriptions] = useState(false);
  const [activationStatus, setActivationStatus] = useState(isActive);
  const [coupons, setCoupons] = useState<any[]>([
    { id: '1', code: 'WELCOME10', type: 'percentage', amount: '10', active: true },
    { id: '2', code: 'YOGA25', type: 'percentage', amount: '25', active: true },
    { id: '3', code: 'FLAT20', type: 'fixed', amount: '20', active: true },
  ]);
  
  // Update state with saved settings when they load
  useEffect(() => {
    if (savedSettings) {
      setApiKey(savedSettings.apiKey || '');
      setPublishableKey(savedSettings.publishableKey || '');
      setWebhookSecret(savedSettings.webhookSecret || '');
      setTestApiKey(savedSettings.testApiKey || '');
      setTestPublishableKey(savedSettings.testPublishableKey || '');
      setTestWebhookSecret(savedSettings.testWebhookSecret || '');
      setIsLiveMode(savedSettings.isLiveMode || false);
      setEnableCoupons(savedSettings.enableCoupons !== undefined ? savedSettings.enableCoupons : true);
      setEnableSubscriptions(savedSettings.enableSubscriptions || false);
      setActivationStatus(savedSettings.activationStatus || isActive);
      setCoupons(savedSettings.coupons || [
        { id: '1', code: 'WELCOME10', type: 'percentage', amount: '10', active: true },
        { id: '2', code: 'YOGA25', type: 'percentage', amount: '25', active: true },
        { id: '3', code: 'FLAT20', type: 'fixed', amount: '20', active: true },
      ]);
    }
  }, [savedSettings, isActive]);
  
  // Save settings to the database
  const saveSettings = async (settings: any) => {
    try {
      const success = await settingsService.saveSetting('stripeSettings', settings);
      if (!success) {
        toast({
          variant: "destructive",
          title: "Error saving settings",
          description: "Failed to save settings to the database.",
        });
      }
      // Update local state with the new settings
      setSavedSettings(settings);
    } catch (error) {
      console.error('Failed to save stripe settings:', error);
      toast({
        variant: "destructive",
        title: "Error saving settings",
        description: "Failed to save settings to the database.",
      });
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
    
    // Save settings to the database
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
      activationStatus: true,
      coupons
    };
    
    setActivationStatus(true);
    saveSettings(newSettings);
    
    toast({
      title: "Settings saved",
      description: `Stripe integration ${isLiveMode ? 'LIVE' : 'TEST'} mode has been activated.`,
    });
  };
  
  const handleDisconnect = () => {
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
      activationStatus: false,
      coupons
    };
    
    setActivationStatus(false);
    saveSettings(newSettings);
    
    toast({
      title: "Disconnected",
      description: "Stripe integration has been disabled.",
    });
  };
  
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  
  // Save coupons when they change
  useEffect(() => {
    if (savedSettings && !loading) {
      const updatedSettings = {
        ...savedSettings,
        coupons
      };
      saveSettings(updatedSettings);
    }
  }, [coupons, savedSettings, loading]);
  
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Stripe Payment Integration</CardTitle>
          <CardDescription>Loading settings...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

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
                        <p className="text-xs text-gray-500">You'll need this to verify Stripe webhook events</p>
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
                        <p className="text-xs text-gray-500">You'll need this to verify Stripe webhook events</p>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Settings</h3>
                  
                  <div className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">Enable Coupon Codes</p>
                      <p className="text-sm text-gray-500">Allow customers to use discount codes at checkout</p>
                    </div>
                    <Switch
                      checked={enableCoupons}
                      onCheckedChange={setEnableCoupons}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">Enable Subscriptions</p>
                      <p className="text-sm text-gray-500">Allow recurring billing for memberships</p>
                    </div>
                    <Switch
                      checked={enableSubscriptions}
                      onCheckedChange={setEnableSubscriptions}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={handleDisconnect}>
                    Disconnect
                  </Button>
                  <Button onClick={handleSaveSettings}>
                    Save Settings
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="coupons">
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-4">Add Coupon Code</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="couponCode">Coupon Code</Label>
                      <Input
                        id="couponCode"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="WELCOME10"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="discountType">Discount Type</Label>
                      <select
                        id="discountType"
                        value={discountType}
                        onChange={(e) => setDiscountType(e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 mt-1"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount ($)</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="discountAmount">Amount</Label>
                      <Input
                        id="discountAmount"
                        value={discountAmount}
                        onChange={(e) => setDiscountAmount(e.target.value)}
                        placeholder={discountType === 'percentage' ? '10' : '20'}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <Button className="mt-4" onClick={handleAddCoupon}>
                    Add Coupon
                  </Button>
                </div>
                
                <div>
                  <h3 className="font-medium mb-4">Active Coupons</h3>
                  <div className="border rounded-md">
                    <div className="grid grid-cols-5 gap-4 p-4 font-medium border-b">
                      <div>Code</div>
                      <div>Type</div>
                      <div>Amount</div>
                      <div>Status</div>
                      <div>Actions</div>
                    </div>
                    
                    {coupons.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No coupons added yet
                      </div>
                    ) : (
                      <>
                        {coupons.map((coupon) => (
                          <div key={coupon.id} className="grid grid-cols-5 gap-4 p-4 border-b last:border-0">
                            <div className="font-medium">{coupon.code}</div>
                            <div>{coupon.type === 'percentage' ? 'Percentage' : 'Fixed'}</div>
                            <div>{coupon.type === 'percentage' ? `${coupon.amount}%` : `$${coupon.amount}`}</div>
                            <div>
                              <span className={`px-2 py-1 rounded-full text-xs ${coupon.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {coupon.active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleToggleCoupon(coupon.id)}
                                className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100"
                              >
                                {coupon.active ? 'Disable' : 'Enable'}
                              </button>
                              <button
                                onClick={() => handleDeleteCoupon(coupon.id)}
                                className="text-xs px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-6">
            <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Stripe integration is currently not active. Enable it to accept payments for classes and memberships.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">Enable Live Mode</p>
                  <p className="text-sm text-gray-500">Use live keys to process real payments</p>
                </div>
                <Switch
                  checked={isLiveMode}
                  onCheckedChange={setIsLiveMode}
                />
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
                      <Label htmlFor="publishableKey">Publishable API Key</Label>
                      <Input
                        id="publishableKey"
                        value={publishableKey}
                        onChange={(e) => setPublishableKey(e.target.value)}
                        placeholder="pk_live_..."
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
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="testPublishableKey">Publishable API Key</Label>
                      <Input
                        id="testPublishableKey"
                        value={testPublishableKey}
                        onChange={(e) => setTestPublishableKey(e.target.value)}
                        placeholder="pk_test_..."
                      />
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex justify-end mt-6">
                <Button onClick={handleSaveSettings}>
                  Activate Stripe Integration
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StripePaymentIntegration;
