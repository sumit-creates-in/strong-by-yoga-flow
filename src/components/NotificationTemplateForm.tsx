
import React, { useState, useEffect } from 'react';
import { NotificationTemplate } from '../contexts/TeacherContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

type NotificationTemplateFormProps = {
  initialTemplate?: NotificationTemplate;
  onSave: (template: Omit<NotificationTemplate, 'id'>) => void;
  onCancel: () => void;
};

// Define template content structure based on notification type
interface TemplateContent {
  subject?: string;
  body: string;
}

const defaultTemplates: Record<string, TemplateContent> = {
  'email_booking_confirmed': {
    subject: 'Your booking is confirmed - %service_name%',
    body: `<p>Hello %customer_full_name%,</p>
<p>Your booking with %employee_full_name% has been confirmed for %appointment_date_time%.</p>
<p>Class: %service_name%</p>
<p>With: %employee_full_name%</p>
<p>When: %appointment_date_time%</p>
<p>Zoom Link: %zoom_join_url%</p>
<p>We look forward to seeing you!</p>`
  },
  'email_booking_reminder': {
    subject: 'Reminder: %service_name% coming up in 30 minutes',
    body: `<p>Hello %customer_full_name%,</p>
<p>Your appointment is coming up in 30 minutes:</p>
<ul>
<li>Class: %service_name%</li>
<li>When: %appointment_date_time%</li>
<li>With: %employee_full_name%</li>
<li>Class Link: %zoom_join_url%</li>
</ul>
<p>We look forward to seeing you soon!</p>`
  },
  'sms_booking_confirmed': {
    body: `Your %service_name% with %employee_full_name% is confirmed for %appointment_date_time%. Join at: %zoom_join_url%`
  },
  'sms_booking_reminder': {
    body: `Reminder: Your session with %employee_full_name% starts in 30 minutes. Join at: %zoom_join_url%`
  },
  'whatsapp_booking_confirmed': {
    body: `Namaste, %customer_full_name%!

Your booking has been confirmed:

• Class: %service_name%
• When: %appointment_date_time%
• With: %employee_full_name%

We look forward to seeing you!`
  },
  'whatsapp_booking_reminder': {
    body: `Namaste %customer_full_name%,

This is a friendly reminder that your session with %employee_full_name% is starting in 30 minutes.

• Class: %service_name%
• Time: %appointment_date_time%
• Zoom link: %zoom_join_url%

See you soon!`
  },
  'in_app_booking_confirmed': {
    body: `Your booking for %service_name% with %employee_full_name% has been confirmed.`
  },
  'in_app_booking_reminder': {
    body: `Your session with %employee_full_name% starts in 30 minutes.`
  },
};

const NotificationTemplateForm: React.FC<NotificationTemplateFormProps> = ({ 
  initialTemplate, 
  onSave, 
  onCancel 
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'email' | 'sms' | 'whatsapp' | 'in-app'>('email');
  const [recipientType, setRecipientType] = useState<'student' | 'teacher' | 'both'>('student');
  const [triggerType, setTriggerType] = useState<'action' | 'scheduled'>('action');
  const [triggerAction, setTriggerAction] = useState<'booking_confirmed' | 'booking_cancelled' | 'booking_rescheduled' | 'booking_reminder'>('booking_confirmed');
  const [scheduledTime, setScheduledTime] = useState<{when: 'before' | 'after' | 'same-day', time: number}>({
    when: 'before',
    time: 30
  });
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [enabled, setEnabled] = useState(true);
  
  useEffect(() => {
    if (initialTemplate) {
      setName(initialTemplate.name);
      setType(initialTemplate.type);
      setRecipientType(initialTemplate.recipientType);
      setTriggerType(initialTemplate.triggerType);
      if (initialTemplate.triggerAction) {
        setTriggerAction(initialTemplate.triggerAction);
      }
      if (initialTemplate.scheduledTime) {
        setScheduledTime(initialTemplate.scheduledTime);
      }
      if (initialTemplate.type === 'email') {
        setSubject(initialTemplate.subject || '');
      }
      setBody(initialTemplate.body);
      setEnabled(initialTemplate.enabled);
    }
  }, [initialTemplate]);

  // Load template content when type or trigger changes
  useEffect(() => {
    if (!initialTemplate && type && (triggerAction || triggerType === 'scheduled')) {
      const key = `${type}_${triggerAction || 'booking_reminder'}`;
      const template = defaultTemplates[key];
      
      if (template) {
        if (template.subject !== undefined) {
          setSubject(template.subject);
        }
        setBody(template.body);
      }
    }
  }, [type, triggerAction, triggerType, initialTemplate]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const template: Omit<NotificationTemplate, 'id'> = {
      name,
      type,
      body,
      enabled,
      recipientType,
      triggerType,
      ...(type === 'email' && { subject }),
      ...(triggerType === 'action' && { triggerAction }),
      ...(triggerType === 'scheduled' && { scheduledTime })
    };
    
    onSave(template);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{initialTemplate ? 'Edit' : 'Create'} Notification Template</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Template Name</Label>
            <Input 
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Booking Confirmation"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>Notification Type</Label>
            <Tabs value={type} onValueChange={(value) => setType(value as any)} className="w-full">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="sms">SMS</TabsTrigger>
                <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
                <TabsTrigger value="in-app">In-App</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="space-y-2">
            <Label>Recipients</Label>
            <RadioGroup value={recipientType} onValueChange={(value) => setRecipientType(value as any)} className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="student" id="student" />
                <Label htmlFor="student">Students</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="teacher" id="teacher" />
                <Label htmlFor="teacher">Teachers</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="both" id="both" />
                <Label htmlFor="both">Both</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-4">
            <Label>When to Send</Label>
            <RadioGroup value={triggerType} onValueChange={(value) => setTriggerType(value as any)}>
              <div className="flex items-start space-x-2 mb-4">
                <RadioGroupItem value="action" id="action" className="mt-1" />
                <div className="grid gap-1.5">
                  <Label htmlFor="action" className="font-medium">When an action occurs</Label>
                  {triggerType === 'action' && (
                    <select
                      className="w-full p-2 border border-gray-300 rounded"
                      value={triggerAction}
                      onChange={(e) => setTriggerAction(e.target.value as any)}
                    >
                      <option value="booking_confirmed">Booking is confirmed</option>
                      <option value="booking_cancelled">Booking is cancelled</option>
                      <option value="booking_rescheduled">Booking is rescheduled</option>
                      <option value="booking_reminder">Booking reminder</option>
                    </select>
                  )}
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="scheduled" id="scheduled" className="mt-1" />
                <div className="grid gap-1.5 w-full">
                  <Label htmlFor="scheduled" className="font-medium">On a schedule</Label>
                  {triggerType === 'scheduled' && (
                    <div className="flex items-center space-x-2 mt-2">
                      <select
                        className="p-2 border border-gray-300 rounded"
                        value={scheduledTime.when}
                        onChange={(e) => setScheduledTime({
                          ...scheduledTime,
                          when: e.target.value as any
                        })}
                      >
                        <option value="before">Before</option>
                        <option value="after">After</option>
                        <option value="same-day">Same day</option>
                      </select>
                      
                      {scheduledTime.when !== 'same-day' && (
                        <>
                          <Input
                            type="number"
                            className="w-20"
                            min="1"
                            value={scheduledTime.time}
                            onChange={(e) => setScheduledTime({
                              ...scheduledTime,
                              time: parseInt(e.target.value) || 0
                            })}
                          />
                          <span>minutes</span>
                        </>
                      )}
                      
                      <span>
                        {scheduledTime.when === 'before' ? 'the session starts' :
                         scheduledTime.when === 'after' ? 'the session ends' :
                         'of the session'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-4">
            <Label>Template Content</Label>
            
            {type === 'email' && (
              <div className="space-y-2">
                <Label htmlFor="subject">Email Subject</Label>
                <Input 
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Your booking is confirmed"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="body">Template Body</Label>
              <div className="border border-gray-200 rounded-md p-2 mb-2 text-xs bg-gray-50 text-gray-600">
                <strong>Available placeholders:</strong>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span>%customer_full_name%</span>
                  <span>%employee_full_name%</span>
                  <span>%service_name%</span>
                  <span>%appointment_date_time%</span>
                  <span>%zoom_join_url%</span>
                </div>
              </div>
              <Textarea 
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Enter message content"
                rows={6}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enabled" className="font-medium">Enable this notification</Label>
              <p className="text-sm text-gray-500">This template will be used when enabled</p>
            </div>
            <Switch 
              id="enabled"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {initialTemplate ? 'Update Template' : 'Create Template'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default NotificationTemplateForm;
