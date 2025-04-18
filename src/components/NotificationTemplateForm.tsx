import React, { useState } from 'react';
import { NotificationTemplate } from '@/types/teacher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface NotificationTemplateFormProps {
  template?: NotificationTemplate;
  onSave: (template: NotificationTemplate) => void;
  onCancel: () => void;
}

const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  subject: z.string().optional(),
  body: z.string().min(1, 'Message body is required'),
  type: z.enum(['email', 'in-app', 'whatsapp', 'sms']),
  enabled: z.boolean().default(true),
  recipientType: z.enum(['teacher', 'student', 'both']),
  triggerType: z.enum(['scheduled', 'action']),
  timing: z.object({
    type: z.enum(['before', 'after']),
    minutes: z.number().int().positive(),
  }),
  recipients: z.array(z.enum(['teacher', 'user'])),
});

type FormValues = z.infer<typeof formSchema>;

const NotificationTemplateForm: React.FC<NotificationTemplateFormProps> = ({ template, onSave, onCancel }) => {
  const [type, setType] = useState<'email' | 'in-app' | 'whatsapp' | 'sms'>(template?.type || 'email');
  const [recipientType, setRecipientType] = useState<'teacher' | 'student' | 'both'>(template?.recipientType || 'both');
  const [triggerType, setTriggerType] = useState<'scheduled' | 'action'>(template?.triggerType || 'scheduled');
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: template?.id || crypto.randomUUID(),
      name: template?.name || '',
      subject: template?.subject || '',
      body: template?.body || '',
      type: template?.type || 'email',
      enabled: template?.enabled ?? true,
      recipientType: template?.recipientType || 'both',
      triggerType: template?.triggerType || 'scheduled',
      timing: template?.timing || {
        type: 'before',
        minutes: 60,
      },
      recipients: template?.recipients || ['user', 'teacher'],
    },
  });

  const onSubmit = (data: FormValues) => {
    onSave(data as NotificationTemplate);
  };

  return (
    <div className="p-4 bg-white rounded-lg border">
      <h3 className="font-medium text-lg mb-4">
        {template ? 'Edit Notification Template' : 'Create Notification Template'}
      </h3>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Template Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notification Type</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    setType(value as 'email' | 'in-app' | 'whatsapp' | 'sms');
                    field.onChange(value);
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select notification type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="in-app">In-App</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="recipientType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recipient Type</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    setRecipientType(value as 'teacher' | 'student' | 'both');
                    field.onChange(value);
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipient type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="triggerType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trigger Type</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    setTriggerType(value as 'scheduled' | 'action');
                    field.onChange(value);
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select trigger type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="action">On Action</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="body"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message Body</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm">Enable Notification</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Enable or disable this notification template.
                  </p>
                </div>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              Save Template
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default NotificationTemplateForm;
