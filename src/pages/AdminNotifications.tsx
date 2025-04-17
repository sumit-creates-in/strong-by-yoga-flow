
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

const AdminNotifications = () => {
  const { teachers, updateTeacher, notificationSettings } = useTeachers();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('email');
  
  // Get the first teacher for demo purposes - in a real app, you would manage notifications globally
  const teacher = teachers && teachers.length > 0 ? teachers[0] : null;
  
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
  
  const handleSaveTemplate = (template: Omit<NotificationTemplate, 'id'>) => {
    if (teacher) {
      const notificationSettings = { ...teacher.notificationSettings };
      const templateType = currentType as keyof typeof notificationSettings;
      
      if (selectedTemplate) {
        // Editing an existing template
        const updatedTemplates = notificationSettings[templateType].templates.map(t => 
          t.id === selectedTemplate.id ? { ...template, id: selectedTemplate.id } : t
        );
        
        const updatedSettings = {
          ...notificationSettings[templateType],
          templates: updatedTemplates
        };
        
        handleSaveSettings(currentType, updatedSettings);
        setIsEditTemplateOpen(false);
      } else {
        // Adding a new template
        const newTemplate = {
          ...template,
          id: `template-${Date.now()}`
        };
        
        const updatedSettings = {
          ...notificationSettings[templateType],
          templates: [...notificationSettings[templateType].templates, newTemplate]
        };
        
        handleSaveSettings(currentType, updatedSettings);
        setIsAddTemplateOpen(false);
      }
      
      toast({
        title: selectedTemplate ? "Template updated" : "Template created",
        description: `The notification template has been ${selectedTemplate ? "updated" : "created"} successfully.`
      });
    }
  };
  
  // Handle the case when there's no teacher data yet
  if (!teacher) {
    return (
      <AdminGuard>
        <Layout>
          <div className="container mx-auto py-6 space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Notification Management</h1>
              <p className="text-gray-500">Loading notification data...</p>
            </div>
          </div>
        </Layout>
      </AdminGuard>
    );
  }
  
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
              <WhatsAppSettings />
              
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
          <NotificationTemplateForm 
            onSave={handleSaveTemplate} 
            onCancel={() => setIsAddTemplateOpen(false)} 
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
            <NotificationTemplateForm 
              initialTemplate={selectedTemplate} 
              onSave={handleSaveTemplate} 
              onCancel={() => setIsEditTemplateOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </AdminGuard>
  );
};

export default AdminNotifications;
