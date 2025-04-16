
import React, { useState } from 'react';
import { useTeachers } from '../contexts/TeacherContext';
import Layout from '../components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { NotificationSettings, NotificationTemplate } from '../contexts/TeacherContext';
import NotificationTemplateForm from '@/components/NotificationTemplateForm';
import NotificationTemplateList from '@/components/NotificationTemplateList';
import WhatsAppSettings from '@/components/WhatsAppSettings';

const AdminNotifications = () => {
  const { notificationSettings, updateNotificationSettings } = useTeachers();
  const [activeTab, setActiveTab] = useState<string>('email');
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);

  const handleToggleEnabled = (type: string, value: boolean) => {
    if (type === 'email') {
      updateNotificationSettings({
        email: { ...notificationSettings.email, enabled: value }
      });
    } else if (type === 'sms') {
      updateNotificationSettings({
        sms: { ...notificationSettings.sms, enabled: value }
      });
    } else if (type === 'whatsapp') {
      updateNotificationSettings({
        whatsapp: { ...notificationSettings.whatsapp, enabled: value }
      });
    } else if (type === 'inApp') {
      updateNotificationSettings({
        inApp: { ...notificationSettings.inApp, enabled: value }
      });
    }
  };

  const handleEditTemplate = (template: NotificationTemplate) => {
    setEditingTemplate(template);
    setShowTemplateForm(true);
  };

  const handleCloseTemplateForm = () => {
    setEditingTemplate(null);
    setShowTemplateForm(false);
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Notification Settings</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="sms">SMS</TabsTrigger>
            <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
            <TabsTrigger value="in-app">In-App</TabsTrigger>
          </TabsList>
          
          {/* Email Notifications Tab */}
          <TabsContent value="email">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Email Notifications</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="email-enabled">Enable Email Notifications</Label>
                    <Switch 
                      id="email-enabled" 
                      checked={notificationSettings.email.enabled} 
                      onCheckedChange={(checked) => handleToggleEnabled('email', checked)}
                    />
                  </div>
                </div>
                <CardDescription>
                  Configure email notifications for 1-on-1 sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {showTemplateForm && activeTab === 'email' ? (
                  <NotificationTemplateForm 
                    type="email" 
                    template={editingTemplate} 
                    onClose={handleCloseTemplateForm}
                  />
                ) : (
                  <>
                    <div className="mb-6">
                      <Button onClick={() => setShowTemplateForm(true)}>
                        Create New Template
                      </Button>
                    </div>
                    
                    <NotificationTemplateList 
                      templates={notificationSettings.email.templates} 
                      onEdit={handleEditTemplate}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* SMS Notifications Tab */}
          <TabsContent value="sms">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>SMS Notifications</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="sms-enabled">Enable SMS Notifications</Label>
                    <Switch 
                      id="sms-enabled" 
                      checked={notificationSettings.sms.enabled} 
                      onCheckedChange={(checked) => handleToggleEnabled('sms', checked)}
                    />
                  </div>
                </div>
                <CardDescription>
                  Configure SMS notifications for 1-on-1 sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {showTemplateForm && activeTab === 'sms' ? (
                  <NotificationTemplateForm 
                    type="sms" 
                    template={editingTemplate} 
                    onClose={handleCloseTemplateForm}
                  />
                ) : (
                  <>
                    <div className="mb-6">
                      <Button onClick={() => setShowTemplateForm(true)}>
                        Create New Template
                      </Button>
                    </div>
                    
                    <NotificationTemplateList 
                      templates={notificationSettings.sms.templates} 
                      onEdit={handleEditTemplate}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* WhatsApp Notifications Tab */}
          <TabsContent value="whatsapp">
            <WhatsAppSettings />
            
            {showTemplateForm && activeTab === 'whatsapp' ? (
              <Card className="mt-6">
                <CardContent className="pt-6">
                  <NotificationTemplateForm 
                    type="whatsapp" 
                    template={editingTemplate} 
                    onClose={handleCloseTemplateForm}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>WhatsApp Templates</CardTitle>
                  <CardDescription>
                    Manage notification templates for WhatsApp
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <Button onClick={() => setShowTemplateForm(true)}>
                      Create New Template
                    </Button>
                  </div>
                  
                  <NotificationTemplateList 
                    templates={notificationSettings.whatsapp.templates} 
                    onEdit={handleEditTemplate}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* In-App Notifications Tab */}
          <TabsContent value="in-app">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>In-App Notifications</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="in-app-enabled">Enable In-App Notifications</Label>
                    <Switch 
                      id="in-app-enabled" 
                      checked={notificationSettings.inApp.enabled} 
                      onCheckedChange={(checked) => handleToggleEnabled('inApp', checked)}
                    />
                  </div>
                </div>
                <CardDescription>
                  Configure in-app notifications for 1-on-1 sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {showTemplateForm && activeTab === 'in-app' ? (
                  <NotificationTemplateForm 
                    type="in-app" 
                    template={editingTemplate} 
                    onClose={handleCloseTemplateForm}
                  />
                ) : (
                  <>
                    <div className="mb-6">
                      <Button onClick={() => setShowTemplateForm(true)}>
                        Create New Template
                      </Button>
                    </div>
                    
                    <NotificationTemplateList 
                      templates={notificationSettings.inApp.templates} 
                      onEdit={handleEditTemplate}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminNotifications;
