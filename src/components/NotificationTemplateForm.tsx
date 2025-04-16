
import React, { useState } from 'react';
import { useTeachers, NotificationTemplate } from '../contexts/TeacherContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type NotificationTemplateFormProps = {
  type: 'email' | 'sms' | 'whatsapp' | 'in-app';
  template: NotificationTemplate | null;
  onClose: () => void;
};

const placeholders = [
  { name: '%customer_full_name%', description: 'Full name of the customer' },
  { name: '%customer_first_name%', description: 'First name of the customer' },
  { name: '%employee_full_name%', description: 'Full name of the teacher' },
  { name: '%employee_first_name%', description: 'First name of the teacher' },
  { name: '%service_name%', description: 'Name of the booked service/session' },
  { name: '%appointment_date_time%', description: 'Date and time of the appointment' },
  { name: '%zoom_join_url%', description: 'Zoom meeting link' },
  { name: '%company_phone%', description: 'Company phone number' },
];

const defaultTemplates = {
  email: {
    reminderBefore: {
      subject: 'Reminder: %service_name% coming up in 30 minutes at %appointment_date_time%',
      body: `<p>Hello %customer_full_name%,</p>
<p>Your appointment is coming up in 30 minutes:</p>
<ul>
<li>Class: %service_name%</li>
<li>When: %appointment_date_time%</li>
<li>With: %employee_full_name%</li>
<li>Class Link: %zoom_join_url%</li>
</ul>
<p>We use Zoom for classes. If you don't have Zoom installed please click on the meeting link above and download it.</p>
<p><strong>Points to be taken care of for the session:</strong></p>
<ul>
<li>Avoid eating a heavy meal at least 3 hours prior to the session.</li>
<li>A Yoga Mat will be a great help.</li>
<li>We suggest that you use a tablet, laptop, or TV for this session. Bigger the screen better the experience.</li>
<li>We highly recommend the use of wireless earbuds/Air Pods to listen and interact with the teacher</li>
<li>Set up your device and yoga mat at least 6 steps away from each other.</li>
</ul>`
    },
    bookingConfirmed: {
      subject: 'Your booking is confirmed - %service_name%',
      body: `<p>Hello %customer_full_name%,</p>
<p>Your booking with %employee_full_name% has been confirmed for %appointment_date_time%.</p>
<p>Class: %service_name%</p>
<p>With: %employee_full_name%</p>
<p>When: %appointment_date_time%</p>
<p>Zoom Link: %zoom_join_url%</p>
<p>We look forward to seeing you!</p>`
    }
  },
  whatsapp: {
    reminderBefore: {
      body: `Namaste, %customer_full_name%!

Your appointment is coming up in 15 minutes:

• Class: %service_name%
• When: %appointment_date_time%
• With: %employee_full_name%

Class Link: %zoom_join_url%

Get ready to enjoy this time dedicated to your health & wellness! 😊`
    },
    bookingConfirmed: {
      body: `Namaste, %customer_full_name%!

Your booking has been confirmed:

• Class: %service_name%
• When: %appointment_date_time%
• With: %employee_full_name%

We look forward to seeing you!`
    }
  },
  sms: {
    reminderBefore: {
      body: `Reminder: Your %service_name% with %employee_first_name% is in 30 mins at %appointment_date_time%. Join: %zoom_join_url%`
    },
    bookingConfirmed: {
      body: `Your booking for %service_name% with %employee_first_name% on %appointment_date_time% is confirmed. Details sent to your email.`
    }
  },
  'in-app': {
    reminderBefore: {
      body: `Your %service_name% with %employee_full_name% starts in 30 minutes!`
    },
    bookingConfirmed: {
      body: `Your booking for %service_name% with %employee_full_name% has been confirmed for %appointment_date_time%.`
    }
  }
};

const NotificationTemplateForm: React.FC<NotificationTemplateFormProps> = ({ type, template, onClose }) => {
  const { addNotificationTemplate, updateNotificationTemplate } = useTeachers();
  const isEditing = !!template;
  
  const [formData, setFormData] = useState<Partial<NotificationTemplate>>(
    template || {
      name: '',
      type,
      subject: type === 'email' ? '' : undefined,
      body: '',
      enabled: true,
      recipientType: 'student',
      triggerType: 'scheduled',
      triggerAction: undefined,
      scheduledTime: {
        when: 'before',
        time: 30
      }
    }
  );
  
  const [mode, setMode] = useState<'text' | 'html'>(type === 'email' ? 'html' : 'text');
  const [previewTemplate, setPreviewTemplate] = useState<string>('');
  
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleScheduledTimeChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      scheduledTime: {
        ...(prev.scheduledTime || { when: 'before', time: 30 }),
        [field]: value
      }
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.body || (type === 'email' && !formData.subject)) {
      return; // Form validation failed
    }
    
    if (isEditing && template) {
      updateNotificationTemplate({
        ...template,
        ...formData
      } as NotificationTemplate);
    } else {
      addNotificationTemplate(formData as Omit<NotificationTemplate, 'id'>);
    }
    
    onClose();
  };
  
  const loadTemplate = (templateType: string) => {
    if (!defaultTemplates[type as keyof typeof defaultTemplates]) return;
    
    const templates = defaultTemplates[type as keyof typeof defaultTemplates];
    const selectedTemplate = templates[templateType as keyof typeof templates];
    
    if (selectedTemplate) {
      setFormData(prev => ({
        ...prev,
        name: `${templateType === 'reminderBefore' ? 'Reminder: 30 min before' : 'Booking Confirmed'}`,
        subject: selectedTemplate.subject,
        body: selectedTemplate.body,
        triggerType: templateType === 'reminderBefore' ? 'scheduled' : 'action',
        triggerAction: templateType === 'reminderBefore' ? undefined : 'booking_confirmed',
        scheduledTime: templateType === 'reminderBefore' ? { when: 'before', time: 30 } : undefined
      }));
      
      if (type === 'email' && selectedTemplate.subject) {
        setMode('html');
      }
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{isEditing ? 'Edit Template' : 'Create Template'}</h2>
        
        {!isEditing && (
          <Select onValueChange={loadTemplate}>
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Load template" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="reminderBefore">Reminder Before Session</SelectItem>
              <SelectItem value="bookingConfirmed">Booking Confirmation</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Template Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g., Reminder: 30 min before"
            className="w-full"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="enabled">Status</Label>
          <div className="flex items-center space-x-2 h-10 mt-1">
            <Switch 
              id="enabled" 
              checked={formData.enabled} 
              onCheckedChange={(checked) => handleChange('enabled', checked)}
            />
            <Label htmlFor="enabled" className="font-normal">
              {formData.enabled ? 'Enabled' : 'Disabled'}
            </Label>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Recipient Type</Label>
          <RadioGroup 
            value={formData.recipientType} 
            onValueChange={(value) => handleChange('recipientType', value)}
            className="flex space-x-4 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="student" id="student" />
              <Label htmlFor="student" className="font-normal">Student</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="teacher" id="teacher" />
              <Label htmlFor="teacher" className="font-normal">Teacher</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="both" id="both" />
              <Label htmlFor="both" className="font-normal">Both</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div>
          <Label>Notification Type</Label>
          <RadioGroup 
            value={formData.triggerType} 
            onValueChange={(value) => handleChange('triggerType', value as 'scheduled' | 'action')}
            className="flex space-x-4 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="scheduled" id="scheduled" />
              <Label htmlFor="scheduled" className="font-normal">Scheduled</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="action" id="action" />
              <Label htmlFor="action" className="font-normal">Action Triggered</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
      
      {formData.triggerType === 'action' && (
        <div>
          <Label htmlFor="trigger-action">Trigger Action</Label>
          <Select 
            value={formData.triggerAction} 
            onValueChange={(value) => handleChange('triggerAction', value)}
          >
            <SelectTrigger id="trigger-action" className="w-full">
              <SelectValue placeholder="Select trigger action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="booking_confirmed">Booking Confirmed</SelectItem>
              <SelectItem value="booking_cancelled">Booking Cancelled</SelectItem>
              <SelectItem value="booking_rescheduled">Booking Rescheduled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      
      {formData.triggerType === 'scheduled' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Schedule</Label>
            <RadioGroup 
              value={formData.scheduledTime?.when || 'before'} 
              onValueChange={(value) => handleScheduledTimeChange('when', value)}
              className="flex space-x-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="before" id="before" />
                <Label htmlFor="before" className="font-normal">Before</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="after" id="after" />
                <Label htmlFor="after" className="font-normal">After</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="same-day" id="same-day" />
                <Label htmlFor="same-day" className="font-normal">On the same day</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div>
            <Label htmlFor="time">Time (minutes)</Label>
            <div className="flex items-center space-x-2">
              <Button 
                type="button" 
                size="icon" 
                variant="outline" 
                onClick={() => handleScheduledTimeChange(
                  'time', 
                  Math.max(5, (formData.scheduledTime?.time || 30) - 5)
                )}
              >
                -
              </Button>
              
              <Input
                id="time"
                type="number"
                min="5"
                value={formData.scheduledTime?.time || 30}
                onChange={(e) => handleScheduledTimeChange('time', parseInt(e.target.value))}
                className="w-32 text-center"
              />
              
              <Button 
                type="button" 
                size="icon" 
                variant="outline"
                onClick={() => handleScheduledTimeChange(
                  'time', 
                  (formData.scheduledTime?.time || 30) + 5
                )}
              >
                +
              </Button>
              
              <Select 
                value="minutes" 
                disabled
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minutes">Minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
      
      {type === 'email' && (
        <div>
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            value={formData.subject || ''}
            onChange={(e) => handleChange('subject', e.target.value)}
            placeholder="e.g., Reminder: %service_name% coming up in 30 minutes"
            className="w-full"
            required
          />
        </div>
      )}
      
      <div>
        <div className="flex justify-between items-center mb-2">
          <Label htmlFor="body">Message</Label>
          {type === 'email' && (
            <div className="flex items-center space-x-4">
              <Tabs value={mode} onValueChange={setMode as any} className="w-auto">
                <TabsList className="grid grid-cols-2 w-44">
                  <TabsTrigger value="text">Text Mode</TabsTrigger>
                  <TabsTrigger value="html">HTML Mode</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          )}
        </div>
        <Textarea
          id="body"
          value={formData.body}
          onChange={(e) => handleChange('body', e.target.value)}
          placeholder="Enter notification message content"
          className="min-h-[200px]"
          required
        />
      </div>
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="placeholders">
          <AccordionTrigger>Available Placeholders</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {placeholders.map((placeholder) => (
                <div key={placeholder.name} className="flex items-center space-x-2">
                  <code className="bg-muted px-1 py-0.5 rounded text-sm">{placeholder.name}</code>
                  <span className="text-muted-foreground text-sm">{placeholder.description}</span>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      <div className="flex justify-end space-x-4 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          {isEditing ? 'Update Template' : 'Create Template'}
        </Button>
      </div>
    </form>
  );
};

export default NotificationTemplateForm;
