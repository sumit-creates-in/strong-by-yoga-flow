
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Check, RefreshCw } from 'lucide-react';

interface ZoomSetupCardProps {
  isConnected: boolean;
  adminEmail?: string;
  onConnect: (email: string) => void;
  onDisconnect: () => void;
}

const ZoomSetupCard: React.FC<ZoomSetupCardProps> = ({
  isConnected,
  adminEmail = '',
  onConnect,
  onDisconnect
}) => {
  const [email, setEmail] = useState(adminEmail || '');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [syncTeacherAccounts, setSyncTeacherAccounts] = useState(true);
  
  const handleConnect = () => {
    if (!email) return;
    
    setIsAuthenticating(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsAuthenticating(false);
      onConnect(email);
    }, 1500);
  };
  
  const handleDisconnect = () => {
    onDisconnect();
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Zoom Admin Integration</CardTitle>
          {isConnected && (
            <Badge className="bg-green-500">Connected</Badge>
          )}
        </div>
        <CardDescription>
          Connect your Zoom admin account to manage teacher accounts and automatically create meetings for 1-on-1 sessions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConnected ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">Z</span>
                </div>
                <div>
                  <p className="font-semibold">Zoom Admin Account</p>
                  <p className="text-sm text-gray-600">{adminEmail}</p>
                </div>
                <Check className="h-5 w-5 text-green-500 ml-auto" />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-sync" className="font-medium">Auto-sync teacher accounts</Label>
                  <p className="text-sm text-gray-500 mt-1">
                    Automatically sync teacher Zoom accounts with our platform
                  </p>
                </div>
                <Switch 
                  id="auto-sync" 
                  checked={syncTeacherAccounts}
                  onCheckedChange={setSyncTeacherAccounts}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-meetings" className="font-medium">Auto-create meetings</Label>
                  <p className="text-sm text-gray-500 mt-1">
                    Automatically create Zoom meetings when sessions are booked
                  </p>
                </div>
                <Switch id="auto-meetings" defaultChecked />
              </div>
            </div>
            
            <Button variant="outline" className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Sync Teacher Accounts
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="zoom-email">Zoom Admin Email</Label>
              <Input
                id="zoom-email"
                type="email"
                placeholder="admin@yourcompany.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-sm text-gray-600">
              <p>
                Note: This is a demo integration. In a real application, this would open a Zoom OAuth flow to connect your actual Zoom admin account.
              </p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {isConnected ? (
          <Button 
            variant="outline" 
            onClick={handleDisconnect}
            className="w-full border-red-200 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Disconnect Zoom Account
          </Button>
        ) : (
          <Button 
            onClick={handleConnect}
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={!email || isAuthenticating}
          >
            {isAuthenticating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              'Connect Zoom Account'
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ZoomSetupCard;
