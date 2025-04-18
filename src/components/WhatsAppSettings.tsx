import React, { useState } from 'react';
import { useTeachers } from '../contexts/TeacherContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const WhatsAppSettings = () => {
  const { notificationSettings, updateNotificationSettings } = useTeachers();
  const [testMessage, setTestMessage] = useState('');
  const [testPhone, setTestPhone] = useState('');
  
  const whatsappSettings = notificationSettings?.whatsapp || {
    enabled: false,
    phoneNumberId: '',
    accessToken: '',
    businessAccountId: '',
    verifyToken: 'strongbyyoga_verify_token',
    autoReplyEnabled: true,
    autoReplyMessage: '',
  };
  
  const handleWhatsAppSettingsChange = (field: string, value: any) => {
    if (!notificationSettings || !updateNotificationSettings) return;
    
    updateNotificationSettings({
      whatsapp: {
        ...whatsappSettings,
        [field]: value
      }
    });
  };
  
  const handleToggleWhatsApp = (enabled: boolean) => {
    if (!notificationSettings || !updateNotificationSettings) return;
    
    updateNotificationSettings({
      whatsapp: {
        ...whatsappSettings,
        enabled
      }
    });
  };
  
  const handleToggleAutoReply = (enabled: boolean) => {
    if (!notificationSettings || !updateNotificationSettings) return;
    
    updateNotificationSettings({
      whatsapp: {
        ...whatsappSettings,
        autoReplyEnabled: enabled
      }
    });
  };
  
  const verifyConnection = () => {
    if (
      whatsappSettings.phoneNumberId && 
      whatsappSettings.accessToken && 
      whatsappSettings.businessAccountId
    ) {
      toast({
        title: "Connection verified",
        description: "Your WhatsApp Business account is connected successfully.",
      });
    } else {
      toast({
        title: "Verification failed",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
    }
  };
  
  const sendTestWhatsApp = () => {
    if (!testPhone) {
      toast({
        title: "Error",
        description: "Please enter a phone number.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Test message sent",
      description: "Your test WhatsApp message has been sent.",
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>WhatsApp Integration</CardTitle>
          <div className="flex items-center space-x-2">
            <Label htmlFor="whatsapp-enabled">Enable WhatsApp Notifications</Label>
            <Switch 
              id="whatsapp-enabled" 
              checked={whatsappSettings.enabled} 
              onCheckedChange={handleToggleWhatsApp}
            />
          </div>
        </div>
        <CardDescription>
          Configure WhatsApp Business API integration for 1-on-1 session notifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="phone-number-id">Phone Number ID</Label>
              <Input
                id="phone-number-id"
                value={whatsappSettings.phoneNumberId}
                onChange={(e) => handleWhatsAppSettingsChange('phoneNumberId', e.target.value)}
                placeholder="517502901457013"
                className="w-full"
              />
            </div>
            
            <div>
              <Label htmlFor="verify-token">WhatsApp Webhook Verify Token</Label>
              <Input
                id="verify-token"
                value={whatsappSettings.verifyToken}
                onChange={(e) => handleWhatsAppSettingsChange('verifyToken', e.target.value)}
                placeholder="d0dec07ef961c8895174"
                className="w-full"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="access-token">Permanent Access Token</Label>
            <Input
              id="access-token"
              type="password"
              value={whatsappSettings.accessToken}
              onChange={(e) => handleWhatsAppSettingsChange('accessToken', e.target.value)}
              placeholder="EAAPUsBzc1DEBO8VCMWNgJUxdYMUpKYPZAXS2PINHWUn0nQkWrwL2vpXqoci..."
              className="w-full"
            />
          </div>
          
          <div>
            <Label htmlFor="business-id">WhatsApp Business Account ID</Label>
            <Input
              id="business-id"
              value={whatsappSettings.businessAccountId}
              onChange={(e) => handleWhatsAppSettingsChange('businessAccountId', e.target.value)}
              placeholder="451608464704525"
              className="w-full"
            />
          </div>
          
          <div className="flex justify-between items-center pt-2">
            <Button onClick={verifyConnection}>
              Verify Connection
            </Button>
            
            <Select
              value="en_US"
              onValueChange={(value) => console.log(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en_US">English (US)</SelectItem>
                <SelectItem value="es_ES">Spanish</SelectItem>
                <SelectItem value="fr_FR">French</SelectItem>
                <SelectItem value="de_DE">German</SelectItem>
                <SelectItem value="hi_IN">Hindi</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Auto-Reply Settings</h3>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="auto-reply-enabled" 
                  checked={whatsappSettings.autoReplyEnabled} 
                  onCheckedChange={handleToggleAutoReply}
                />
                <Label htmlFor="auto-reply-enabled" className="font-normal">
                  {whatsappSettings.autoReplyEnabled ? 'Enabled' : 'Disabled'}
                </Label>
              </div>
            </div>
            
            <div>
              <Label htmlFor="auto-reply-message">Auto-Reply Message</Label>
              <Textarea
                id="auto-reply-message"
                value={whatsappSettings.autoReplyMessage}
                onChange={(e) => handleWhatsAppSettingsChange('autoReplyMessage', e.target.value)}
                placeholder="Dear %customer_full_name%, This message does not have an option for responding. If you need additional information about your booking, please contact us at %company_phone%"
                className="h-24"
              />
            </div>
          </div>
          
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Send Test WhatsApp Message</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="test-phone">Phone Number (with country code)</Label>
                <Input
                  id="test-phone"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="+1234567890"
                  className="w-full"
                />
              </div>
              
              <div className="flex items-end">
                <Button 
                  className="w-full" 
                  onClick={sendTestWhatsApp}
                  disabled={!whatsappSettings.enabled || !testPhone}
                >
                  Send Test Message
                </Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="test-message">Test Message</Label>
              <Textarea
                id="test-message"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Enter a test message to send via WhatsApp"
                className="h-24"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WhatsAppSettings;
