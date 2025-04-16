
import React from 'react';
import { useTeachers, NotificationTemplate } from '../contexts/TeacherContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, Trash2, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

type NotificationTemplateListProps = {
  templates: NotificationTemplate[];
  onEdit: (template: NotificationTemplate) => void;
};

const NotificationTemplateList: React.FC<NotificationTemplateListProps> = ({ templates, onEdit }) => {
  const { updateNotificationTemplate, deleteNotificationTemplate, sendTestNotification } = useTeachers();
  const [testRecipient, setTestRecipient] = React.useState('');
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string>('');
  
  const handleToggleEnabled = (template: NotificationTemplate, enabled: boolean) => {
    updateNotificationTemplate({
      ...template,
      enabled
    });
  };
  
  const handleDelete = (id: string) => {
    deleteNotificationTemplate(id);
  };
  
  const handleSendTest = () => {
    sendTestNotification(selectedTemplateId, testRecipient);
  };
  
  const getScheduleText = (template: NotificationTemplate) => {
    if (template.triggerType === 'action') {
      const triggerMap: Record<string, string> = {
        'booking_confirmed': 'When booking is confirmed',
        'booking_cancelled': 'When booking is cancelled',
        'booking_rescheduled': 'When booking is rescheduled',
        'booking_reminder': 'As a booking reminder'
      };
      return triggerMap[template.triggerAction || ''] || 'When action is triggered';
    } else if (template.triggerType === 'scheduled' && template.scheduledTime) {
      const { when, time } = template.scheduledTime;
      if (when === 'before') {
        return `${time} minutes before`;
      } else if (when === 'after') {
        return `${time} minutes after`;
      } else {
        return 'On the same day';
      }
    }
    return 'Unknown schedule';
  };
  
  if (templates.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md bg-muted/10">
        <h3 className="font-medium mb-2">No templates created yet</h3>
        <p className="text-muted-foreground mb-4">Create your first notification template to get started</p>
      </div>
    );
  }
  
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Schedule</TableHead>
            <TableHead>Recipients</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[120px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates.map((template) => (
            <TableRow key={template.id}>
              <TableCell>
                <div className="font-medium">{template.name}</div>
              </TableCell>
              <TableCell>
                {getScheduleText(template)}
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {template.recipientType === 'student' ? 'Students' : 
                   template.recipientType === 'teacher' ? 'Teachers' : 'Both'}
                </Badge>
              </TableCell>
              <TableCell>
                <Switch 
                  checked={template.enabled} 
                  onCheckedChange={(checked) => handleToggleEnabled(template, checked)}
                />
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(template)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setSelectedTemplateId(template.id)}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Send Test Notification</DialogTitle>
                        <DialogDescription>
                          Send a test notification to verify template functionality
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <Label htmlFor="recipient" className="mb-2 block">
                          Recipient {template.type === 'email' ? 'Email' : 
                                   template.type === 'sms' || template.type === 'whatsapp' ? 'Phone' : 'User ID'}
                        </Label>
                        <Input
                          id="recipient"
                          value={testRecipient}
                          onChange={(e) => setTestRecipient(e.target.value)}
                          placeholder={template.type === 'email' ? 'email@example.com' : 
                                      template.type === 'sms' || template.type === 'whatsapp' ? '+1234567890' : 'user-123'}
                        />
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setTestRecipient('')}>Cancel</Button>
                        <Button onClick={handleSendTest}>Send Test</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Template</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this template? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDelete(template.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};

export default NotificationTemplateList;
