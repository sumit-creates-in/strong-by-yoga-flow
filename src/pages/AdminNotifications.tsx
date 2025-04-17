
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import AdminGuard from '@/components/AdminGuard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Save } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import NotificationTemplateList from '@/components/NotificationTemplateList';
import NotificationTemplateForm from '@/components/NotificationTemplateForm';
import WhatsAppSettings from '@/components/WhatsAppSettings';
import { useTeachers, NotificationTemplate } from '@/contexts/TeacherContext';

// Add this type to match the component's expected props
type NotificationTemplateFormWithTypeProps = {
  type: string;
  template?: NotificationTemplate;
  onClose: () => void;
};

// Create a wrapper component that adds the type prop
const NotificationTemplateFormWrapper = ({ 
  type, 
  template, 
  onClose 
}: NotificationTemplateFormWithTypeProps) => {
  // This component passes down only the props that NotificationTemplateForm expects
  return (
    <NotificationTemplateForm
      template={template}
      onClose={onClose}
    />
  );
};

const AdminNotifications = () => {
  const { teachers, updateTeacher } = useTeachers();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('email');
  
  // Get the first teacher for demo purposes - in a real app, you would manage notifications globally
  const teacher = teachers[0];
  
  // States for dialogs
  const [isAddTemplateOpen, setIsAddTemplateOpen] = useState(false);
  const [isEditTemplateOpen, setIsEditTemplateOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [currentType, setCurrentType] = useState<string>('email');
  
  const handleSaveSettings = (type: string, settings: any) => {
    if (teacher) {
      const updatedNotificationSettings = {
        ...teacher.notificationSettings,
        [type]: settings
      };
      
      updateTeacher(teacher.id, {
        notificationSettings: updatedNotificationSettings
      });
      
      toast({
        title: "Settings saved",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} notification settings have been saved.`
      });
    }
  };
  
  const handleAddTemplate = () => {
    setCurrentType(activeTab);
    setSelectedTemplate(null);
    setIsAddTemplateOpen(true);
  };
  
  const handleEditTemplate = (template: NotificationTemplate) => {
    setCurrentType(activeTab);
    setSelectedTemplate(template);
    setIsEditTemplateOpen(true);
  };
  
  const handleDeleteTemplate = (templateId: string) => {
    if (teacher) {
      const notificationSettings = { ...teacher.notificationSettings };
      const templates = notificationSettings[activeTab as keyof typeof notificationSettings].templates.filter(
        t => t.id !== templateId
      );
      
      const updatedSettings = {
        ...notificationSettings[activeTab as keyof typeof notificationSettings],
        templates
      };
      
      handleSaveSettings(activeTab, updatedSettings);
      
      toast({
        title: "Template deleted",
        description: "The notification template has been deleted."
      });
    }
  };
  
  return (
    <AdminGuard>
      <Layout>
        <div className="container mx-auto py-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Notification Management</h1>
            <p className="text-gray-500">Manage notification templates and settings</p>
          </div>
          
          <Tabs defaultValue="email" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="app">In-App</TabsTrigger>
              <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
              <TabsTrigger value="sms">SMS</TabsTrigger>
            </TabsList>
            
            <TabsContent value="email" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Email Notifications</CardTitle>
                  <CardDescription>
                    Configure email notifications for one-on-one sessions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1">
                      <p className="font-medium">Enable Email Notifications</p>
                      <p className="text-sm text-gray-500">
                        Send automated emails for session bookings, reminders, and follow-ups
                      </p>
                    </div>
                    <div>
                      <input 
                        type="checkbox" 
                        id="emailEnabled"
                        className="toggle toggle-primary"
                        checked={teacher?.notificationSettings.email.enabled}
                        onChange={(e) => handleSaveSettings('email', {
                          ...teacher?.notificationSettings.email,
                          enabled: e.target.checked
                        })}
                      />
                    </div>
                  </div>
                  
                  <NotificationTemplateList 
                    templates={teacher?.notificationSettings.email.templates || []}
                    onEdit={handleEditTemplate}
                    onDelete={handleDeleteTemplate}
                  />
                </CardContent>
                <CardFooter className="justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => handleSaveSettings('email', teacher?.notificationSettings.email)}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Settings
                  </Button>
                  <Button onClick={handleAddTemplate}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Template
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="app" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>In-App Notifications</CardTitle>
                  <CardDescription>
                    Configure in-app notifications and alerts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1">
                      <p className="font-medium">Enable In-App Notifications</p>
                      <p className="text-sm text-gray-500">
                        Show notifications within the app for upcoming sessions and important alerts
                      </p>
                    </div>
                    <div>
                      <input 
                        type="checkbox" 
                        id="appEnabled"
                        className="toggle toggle-primary"
                        checked={teacher?.notificationSettings.app.enabled}
                        onChange={(e) => handleSaveSettings('app', {
                          ...teacher?.notificationSettings.app,
                          enabled: e.target.checked
                        })}
                      />
                    </div>
                  </div>
                  
                  <NotificationTemplateList 
                    templates={teacher?.notificationSettings.app.templates || []}
                    onEdit={handleEditTemplate}
                    onDelete={handleDeleteTemplate}
                  />
                </CardContent>
                <CardFooter className="justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => handleSaveSettings('app', teacher?.notificationSettings.app)}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Settings
                  </Button>
                  <Button onClick={handleAddTemplate}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Template
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="whatsapp" className="space-y-6">
              <WhatsAppSettings 
                settings={teacher?.notificationSettings.whatsapp || {
                  enabled: false,
                  phoneNumberId: '',
                  accessToken: '',
                  businessAccountId: '',
                  verifyToken: 'strongbyyoga_verify_token',
                  autoReplyEnabled: true,
                  autoReplyMessage: '',
                  templates: []
                }}
                onSave={(settings) => handleSaveSettings('whatsapp', settings)}
              />
              
              <Card>
                <CardHeader>
                  <CardTitle>WhatsApp Notification Templates</CardTitle>
                  <CardDescription>
                    Manage notification templates for WhatsApp messages
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <NotificationTemplateList 
                    templates={teacher?.notificationSettings.whatsapp.templates || []}
                    onEdit={handleEditTemplate}
                    onDelete={handleDeleteTemplate}
                  />
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button 
                    onClick={handleAddTemplate} 
                    disabled={!teacher?.notificationSettings.whatsapp.enabled}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Template
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="sms" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>SMS Notifications</CardTitle>
                  <CardDescription>
                    Configure SMS notifications for important alerts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1">
                      <p className="font-medium">Enable SMS Notifications</p>
                      <p className="text-sm text-gray-500">
                        Send text message notifications for session reminders
                      </p>
                    </div>
                    <div>
                      <input 
                        type="checkbox" 
                        id="smsEnabled"
                        className="toggle toggle-primary"
                        checked={teacher?.notificationSettings.sms.enabled}
                        onChange={(e) => handleSaveSettings('sms', {
                          ...teacher?.notificationSettings.sms,
                          enabled: e.target.checked
                        })}
                      />
                    </div>
                  </div>
                  
                  <NotificationTemplateList 
                    templates={teacher?.notificationSettings.sms.templates || []}
                    onEdit={handleEditTemplate}
                    onDelete={handleDeleteTemplate}
                  />
                </CardContent>
                <CardFooter className="justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => handleSaveSettings('sms', teacher?.notificationSettings.sms)}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Settings
                  </Button>
                  <Button 
                    onClick={handleAddTemplate}
                    disabled={!teacher?.notificationSettings.sms.enabled}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Template
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </Layout>
      
      {/* Add Template Dialog */}
      <Dialog open={isAddTemplateOpen} onOpenChange={setIsAddTemplateOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add Notification Template</DialogTitle>
            <DialogDescription>
              Create a new notification template for {currentType} notifications
            </DialogDescription>
          </DialogHeader>
          <NotificationTemplateFormWrapper 
            type={currentType} 
            onClose={() => setIsAddTemplateOpen(false)} 
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Template Dialog */}
      <Dialog open={isEditTemplateOpen} onOpenChange={setIsEditTemplateOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Notification Template</DialogTitle>
            <DialogDescription>
              Modify the notification template
            </DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <NotificationTemplateFormWrapper 
              type={currentType} 
              template={selectedTemplate} 
              onClose={() => setIsEditTemplateOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </AdminGuard>
  );
};

export default AdminNotifications;
