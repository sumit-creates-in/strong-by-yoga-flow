import React, { useState } from 'react';
import Layout from '@/components/Layout';
import AdminGuard from '@/components/AdminGuard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Info, AlertTriangle } from 'lucide-react';
import ZoomSetupCard from '@/components/ZoomSetupCard';
import StripePaymentIntegration from '@/components/StripePaymentIntegration';

const AdminZoomSettings = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const { toast } = useToast();
  
  const handleConnect = (email: string) => {
    setIsConnected(true);
    setAdminEmail(email);
    
    toast({
      title: "Zoom connected",
      description: "Your Zoom admin account has been connected successfully.",
    });
  };
  
  const handleDisconnect = () => {
    setIsConnected(false);
    setAdminEmail('');
    
    toast({
      title: "Zoom disconnected",
      description: "Your Zoom admin account has been disconnected.",
    });
  };
  
  return (
    <AdminGuard>
      <Layout>
        <div className="container mx-auto py-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Admin Settings</h1>
            <p className="text-gray-500">Manage integrations and payment settings</p>
          </div>
          
          <Tabs defaultValue="zoom" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="zoom">Zoom Integration</TabsTrigger>
              <TabsTrigger value="payments">Payment Settings</TabsTrigger>
              <TabsTrigger value="help">Help</TabsTrigger>
            </TabsList>
            
            <TabsContent value="zoom" className="space-y-6">
              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-600">Integration Note</AlertTitle>
                <AlertDescription>
                  In a production environment, clicking "Connect Zoom Account" would initiate the OAuth flow with Zoom. 
                  This demo simulates the process without requiring actual Zoom credentials.
                </AlertDescription>
              </Alert>
              
              <ZoomSetupCard
                isConnected={isConnected}
                adminEmail={adminEmail}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
              />
            </TabsContent>
            
            <TabsContent value="payments" className="space-y-6">
              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-600">Configuration Guide</AlertTitle>
                <AlertDescription>
                  You need both Secret and Publishable API keys from your Stripe Dashboard to set up payments. The Secret key starts with 'sk_' and the Publishable key starts with 'pk_'. Use test keys for testing payments.
                </AlertDescription>
              </Alert>

              <StripePaymentIntegration />
              
              <div className="mt-6 bg-white p-6 rounded-lg border">
                <h3 className="font-semibold text-lg mb-4">How to Find Your Stripe API Keys</h3>
                
                <ol className="space-y-4 list-decimal pl-6">
                  <li>
                    <p className="mb-2">Go to <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Stripe Dashboard</a> and sign in</p>
                  </li>
                  <li>
                    <p className="mb-2">Switch to Test mode (for testing) or Live mode (for production)</p>
                    <p className="text-sm text-gray-500">Make sure you use test keys while testing to avoid processing real payments</p>
                  </li>
                  <li>
                    <p className="mb-2">Find both your Secret and Publishable keys</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div className="bg-gray-50 p-3 rounded border">
                        <p className="font-medium mb-1">Secret Key (sk)</p>
                        <p className="text-sm text-gray-600 font-mono">sk_test_51ABCDEFGHIJKLMNO...</p>
                        <p className="text-xs text-gray-500 mt-1">Starts with sk_test_ for test mode</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded border">
                        <p className="font-medium mb-1">Publishable Key (pk)</p>
                        <p className="text-sm text-gray-600 font-mono">pk_test_51ABCDEFGHIJKLMNO...</p>
                        <p className="text-xs text-gray-500 mt-1">Starts with pk_test_ for test mode</p>
                      </div>
                    </div>
                  </li>
                  <li>
                    <p className="mb-2">Enter both keys in the Stripe Payment Integration form above</p>
                  </li>
                </ol>
                
                <div className="mt-6 bg-yellow-50 p-4 rounded border border-yellow-200">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-yellow-800">Security Warning</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Keep your Secret key confidential. Never expose it in your frontend code or to customers.
                        The Publishable key is meant to be public and used in your frontend code.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="help" className="space-y-6">
              <div className="bg-white p-6 rounded-lg border">
                <h2 className="text-2xl font-bold mb-4">Integration Help</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Zoom Integration</h3>
                    <p className="mb-4">
                      The Zoom integration allows you to automatically create meetings for 1-on-1 sessions
                      and manage teacher accounts.
                    </p>
                    <div className="space-y-2">
                      <details className="border rounded-md p-2">
                        <summary className="font-medium cursor-pointer">How to create a Zoom App</summary>
                        <div className="mt-2 pl-4 text-gray-700">
                          <ol className="list-decimal space-y-2 pl-4">
                            <li>Go to the <a href="https://marketplace.zoom.us/develop/create" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Zoom App Marketplace</a></li>
                            <li>Click "Build App" and select "OAuth" as the app type</li>
                            <li>Fill in the required details and set the redirect URL to your application's callback URL</li>
                            <li>Copy the Client ID and Client Secret to use with our system</li>
                          </ol>
                        </div>
                      </details>
                      
                      <details className="border rounded-md p-2">
                        <summary className="font-medium cursor-pointer">Required Zoom API permissions</summary>
                        <div className="mt-2 pl-4 text-gray-700">
                          <ul className="list-disc space-y-2 pl-4">
                            <li><code>meeting:write:admin</code> - Create meetings on behalf of users</li>
                            <li><code>user:read:admin</code> - Read user information</li>
                            <li><code>user_profile:read</code> - Access user profiles</li>
                          </ul>
                        </div>
                      </details>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Stripe Integration</h3>
                    <p className="mb-4">
                      The Stripe integration enables payment processing for classes, memberships,
                      and 1-on-1 sessions.
                    </p>
                    <div className="space-y-2">
                      <details className="border rounded-md p-2">
                        <summary className="font-medium cursor-pointer">Setting up Stripe</summary>
                        <div className="mt-2 pl-4 text-gray-700">
                          <ol className="list-decimal space-y-2 pl-4">
                            <li>Create a <a href="https://dashboard.stripe.com/register" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Stripe account</a></li>
                            <li>Get your API keys from the Stripe Dashboard</li>
                            <li>Use test keys first to ensure everything works</li>
                            <li>Set up products and prices in the Stripe Dashboard</li>
                          </ol>
                        </div>
                      </details>
                      
                      <details className="border rounded-md p-2">
                        <summary className="font-medium cursor-pointer">Testing payments</summary>
                        <div className="mt-2 pl-4 text-gray-700">
                          <p className="mb-2">Use these test card numbers to simulate different scenarios:</p>
                          <ul className="list-disc space-y-2 pl-4">
                            <li><code>4242 4242 4242 4242</code> - Successful payment</li>
                            <li><code>4000 0000 0000 0002</code> - Card declined</li>
                            <li><code>4000 0000 0000 3220</code> - 3D Secure authentication required</li>
                          </ul>
                        </div>
                      </details>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button variant="outline" className="w-full">
                    <a 
                      href="mailto:support@strongbyyoga.com" 
                      className="w-full flex justify-center"
                    >
                      Contact Support
                    </a>
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Layout>
    </AdminGuard>
  );
};

export default AdminZoomSettings;
