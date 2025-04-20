import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus, Trash2, Clock, Info } from 'lucide-react';
import { useTeachers, Teacher, SessionType, AvailabilitySlot, ZoomAccount } from '@/contexts/TeacherContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface CustomAvailabilitySlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
}

interface CustomZoomAccount {
  id: string;
  email: string;
  accountName: string;
  connected: boolean;
}

interface CustomSessionType extends Omit<SessionType, 'bookingRestrictions'> {
  type: 'video' | 'call' | 'chat';
  allowRecurring: boolean;
  minTimeBeforeBooking: number;
  minTimeBeforeCancel: number;
  minTimeBeforeReschedule: number;
  maxAdvanceBookingDays: number;
}

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  avatarUrl: z.string().optional(),
  shortBio: z.string().min(1, 'Short bio is required').max(150, 'Short bio should be under 150 characters'),
  fullBio: z.string().min(50, 'Full bio should be at least 50 characters'),
  experience: z.coerce.number().min(0, 'Experience cannot be negative'),
  teachingStyle: z.string().min(1, 'Teaching style is required'),
  languages: z.array(z.string()).min(1, 'At least one language is required'),
});

interface TeacherFormProps {
  teacher?: Teacher;
  onComplete: (updatedTeacher?: Teacher) => void;
}

const TeacherForm = ({ teacher, onComplete }: TeacherFormProps) => {
  const { 
    addTeacher, 
    updateTeacher
  } = useTeachers();
  
  const [specialties, setSpecialties] = useState<string[]>(teacher?.specialties || []);
  const [newSpecialty, setNewSpecialty] = useState('');
  
  const [expertise, setExpertise] = useState<string[]>(teacher?.expertise || []);
  const [newExpertise, setNewExpertise] = useState('');
  
  const [certifications, setCertifications] = useState<string[]>(teacher?.certifications || []);
  const [newCertification, setNewCertification] = useState('');
  
  const mapToCustomSessionTypes = (sessions: SessionType[] | undefined): CustomSessionType[] => {
    if (!sessions || !Array.isArray(sessions)) return [];
    
    return sessions.map(session => ({
      id: session.id,
      name: session.name,
      description: session.description || '',
      duration: session.duration,
      price: session.price,
      credits: session.credits || session.price,
      type: (session as any).type || 'video',
      isActive: session.isActive || true,
      allowRecurring: session.bookingRestrictions?.minTimeBeforeBooking !== undefined 
        ? true 
        : true,
      minTimeBeforeBooking: session.bookingRestrictions?.minTimeBeforeBooking || 2,
      minTimeBeforeCancel: session.bookingRestrictions?.minTimeBeforeCancelling || 4,
      minTimeBeforeReschedule: session.bookingRestrictions?.minTimeBeforeRescheduling || 6,
      maxAdvanceBookingDays: session.bookingRestrictions?.maxAdvanceBookingPeriod || 30
    }));
  };
  
  const mapToContextSessionTypes = (sessions: CustomSessionType[]): SessionType[] => {
    return sessions.map(session => ({
      id: session.id,
      name: session.name,
      description: session.description,
      duration: session.duration,
      price: session.price,
      credits: session.credits,
      isActive: session.isActive,
      bookingRestrictions: {
        minTimeBeforeBooking: session.minTimeBeforeBooking,
        minTimeBeforeCancelling: session.minTimeBeforeCancel,
        minTimeBeforeRescheduling: session.minTimeBeforeReschedule,
        maxAdvanceBookingPeriod: session.maxAdvanceBookingDays
      }
    }));
  };
  
  const [sessionTypes, setSessionTypes] = useState<CustomSessionType[]>(
    mapToCustomSessionTypes(teacher?.sessionTypes) || [
      { 
        id: '1',
        name: 'Video Consultation',
        description: 'Video consultation session',
        type: 'video' as const,
        duration: 60,
        price: 50,
        credits: 50,
        isActive: true,
        allowRecurring: true,
        minTimeBeforeBooking: 2,
        minTimeBeforeCancel: 4,
        minTimeBeforeReschedule: 6,
        maxAdvanceBookingDays: 30
      },
      { 
        id: '2',
        name: 'Phone Call',
        description: 'Phone call session',
        type: 'call' as const,
        duration: 30,
        price: 35,
        credits: 35,
        isActive: true,
        allowRecurring: false,
        minTimeBeforeBooking: 1,
        minTimeBeforeCancel: 2,
        minTimeBeforeReschedule: 2,
        maxAdvanceBookingDays: 14
      }
    ]
  );

  const mapToCustomAvailability = (availability: AvailabilitySlot[] | undefined): CustomAvailabilitySlot[] => {
    if (!availability || !Array.isArray(availability)) return [];
    
    return availability.map((slot, index) => {
      if (slot.slots && slot.slots.length > 0) {
        return {
          id: `avail-${Date.now()}-${index}`,
          day: slot.day?.toLowerCase() || 'monday',
          startTime: slot.slots[0].start || '09:00',
          endTime: slot.slots[0].end || '10:00',
          isRecurring: true
        };
      } else {
        return {
          id: (slot as any).id || `avail-${Date.now()}-${index}`,
          day: slot.day?.toLowerCase() || 'monday',
          startTime: (slot as any).startTime || '09:00',
          endTime: (slot as any).endTime || '10:00',
          isRecurring: (slot as any).isRecurring || true
        };
      }
    });
  };
  
  const mapToContextAvailability = (availability: CustomAvailabilitySlot[]): AvailabilitySlot[] => {
    return availability.map(slot => ({
      day: slot.day,
      slots: [{
        start: slot.startTime,
        end: slot.endTime
      }]
    }));
  };

  const [availability, setAvailability] = useState<CustomAvailabilitySlot[]>(
    mapToCustomAvailability(teacher?.availability)
  );
  
  const [newAvailability, setNewAvailability] = useState<Partial<CustomAvailabilitySlot>>({
    day: 'monday',
    startTime: '09:00',
    endTime: '10:00',
    isRecurring: true
  });

  const mapToCustomZoomAccount = (account: ZoomAccount | undefined): CustomZoomAccount | null => {
    if (!account) return null;
    
    return {
      id: (account as any).id || `zoom-${Date.now()}`,
      email: account.email || '',
      accountName: (account as any).accountName || account.email || '',
      connected: account.isConnected || false
    };
  };
  
  const mapToContextZoomAccount = (account: CustomZoomAccount | null): ZoomAccount | null => {
    if (!account) return null;
    
    return {
      email: account.email,
      isConnected: account.connected
    };
  };

  const [zoomAccount, setZoomAccount] = useState<CustomZoomAccount | null>(
    mapToCustomZoomAccount(teacher?.zoomAccount)
  );
  
  const [zoomEmail, setZoomEmail] = useState('');
  const [zoomAccountName, setZoomAccountName] = useState('');
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: teacher?.name || '',
      avatarUrl: teacher?.avatarUrl || '',
      shortBio: teacher?.shortBio || '',
      fullBio: teacher?.fullBio || '',
      experience: teacher?.experience || 0,
      teachingStyle: teacher?.teachingStyle || '',
      languages: teacher?.languages || ['English'],
    },
  });
  
  const handleAddSpecialty = () => {
    if (newSpecialty && !specialties.includes(newSpecialty)) {
      setSpecialties([...specialties, newSpecialty]);
      setNewSpecialty('');
    }
  };
  
  const handleRemoveSpecialty = (specialty: string) => {
    setSpecialties(specialties.filter(s => s !== specialty));
  };
  
  const handleAddExpertise = () => {
    if (newExpertise && !expertise.includes(newExpertise)) {
      setExpertise([...expertise, newExpertise]);
      setNewExpertise('');
    }
  };
  
  const handleRemoveExpertise = (item: string) => {
    setExpertise(expertise.filter(e => e !== item));
  };
  
  const handleAddCertification = () => {
    if (newCertification && !certifications.includes(newCertification)) {
      setCertifications([...certifications, newCertification]);
      setNewCertification('');
    }
  };
  
  const handleRemoveCertification = (cert: string) => {
    setCertifications(certifications.filter(c => c !== cert));
  };
  
  const handleSessionTypeChange = (index: number, field: string, value: any) => {
    const updatedTypes = [...sessionTypes];
    updatedTypes[index] = { ...updatedTypes[index], [field]: value };
    
    if (field === 'price') {
      updatedTypes[index].credits = value;
    }
    
    setSessionTypes(updatedTypes);
  };
  
  const handleAddSessionType = () => {
    const newId = `session-${Date.now()}`;
    setSessionTypes([
      ...sessionTypes, 
      { 
        id: newId, 
        name: 'New Session',
        description: 'New session description',
        type: 'video' as const,
        duration: 60,
        price: 50,
        credits: 50,
        isActive: true,
        allowRecurring: true,
        minTimeBeforeBooking: 2,
        minTimeBeforeCancel: 4,
        minTimeBeforeReschedule: 6,
        maxAdvanceBookingDays: 30
      }
    ]);
  };
  
  const handleRemoveSessionType = (index: number) => {
    if (sessionTypes.length > 1) {
      const updatedTypes = [...sessionTypes];
      updatedTypes.splice(index, 1);
      setSessionTypes(updatedTypes);
    }
  };

  const handleAddAvailability = () => {
    if (!newAvailability.day || !newAvailability.startTime || !newAvailability.endTime) {
      return;
    }
    
    const newSlot: CustomAvailabilitySlot = {
      id: `avail-${Date.now()}`,
      day: newAvailability.day,
      startTime: newAvailability.startTime,
      endTime: newAvailability.endTime,
      isRecurring: newAvailability.isRecurring || true
    };
    
    setAvailability([...availability, newSlot]);
    
    setNewAvailability({
      day: 'monday',
      startTime: '09:00',
      endTime: '10:00',
      isRecurring: true
    });
  };

  const handleRemoveAvailability = (id: string) => {
    setAvailability(availability.filter(slot => slot.id !== id));
  };

  const handleAvailabilityChange = (field: keyof CustomAvailabilitySlot, value: any) => {
    setNewAvailability({
      ...newAvailability,
      [field]: value
    });
  };

  const handleConnectZoom = () => {
    if (zoomEmail && zoomAccountName) {
      const newZoomAccount: CustomZoomAccount = {
        id: `zoom-${Date.now()}`,
        email: zoomEmail,
        accountName: zoomAccountName,
        connected: true
      };
      setZoomAccount(newZoomAccount);
      setZoomEmail('');
      setZoomAccountName('');
    }
  };

  const handleDisconnectZoom = () => {
    setZoomAccount(null);
  };
  
  const formatDay = (day: string): string => {
    if (!day) return 'Monday';
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  const formatTime = (time: string | undefined): string => {
    if (!time) return '';
    
    const [hours, minutes] = time.split(':');
    if (!hours || !minutes) return time;
    
    const hour = parseInt(hours, 10);
    if (isNaN(hour)) return time;
    
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };
  
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const teacherData: Teacher = {
      id: teacher?.id || `teacher-${Date.now()}`,
      name: values.name,
      title: teacher?.title || 'Yoga Teacher',
      bio: values.fullBio,
      avatarUrl: values.avatarUrl || '',
      shortBio: values.shortBio,
      fullBio: values.fullBio,
      experience: values.experience,
      rating: teacher?.rating || 5.0,
      reviewCount: teacher?.reviewCount || 0,
      totalSessions: teacher?.totalSessions || 0,
      specialties: specialties,
      expertise: expertise,
      certifications: certifications,
      languages: values.languages,
      teachingStyle: values.teachingStyle,
      sessionTypes: mapToContextSessionTypes(sessionTypes),
      availability: mapToContextAvailability(availability),
      zoomAccount: mapToContextZoomAccount(zoomAccount) || {
        email: '',
        isConnected: false
      },
      notificationSettings: teacher?.notificationSettings || {
        email: {
          enabled: true,
          templates: []
        },
        app: {
          enabled: true,
          templates: []
        },
        whatsapp: {
          enabled: false,
          phoneNumberId: '',
          accessToken: '',
          businessAccountId: '',
          verifyToken: '',
          autoReplyEnabled: false,
          autoReplyMessage: '',
          templates: []
        },
        sms: {
          enabled: false,
          templates: []
        }
      }
    };
    
    if (teacher) {
      updateTeacher(teacherData.id, teacherData);
    } else {
      addTeacher(teacherData);
    }
    
    onComplete(teacherData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="basic">
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="qualifications">Qualifications</TabsTrigger>
            <TabsTrigger value="sessions">Session Types</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
            <TabsTrigger value="zoom">Zoom Integration</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="avatarUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile Image URL</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://example.com/image.jpg" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years of Experience</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} min={0} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="languages"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Languages Spoken</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value[0]}
                        onValueChange={(value) => field.onChange([value])}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="Spanish">Spanish</SelectItem>
                          <SelectItem value="French">French</SelectItem>
                          <SelectItem value="German">German</SelectItem>
                          <SelectItem value="Portuguese">Portuguese</SelectItem>
                          <SelectItem value="Hindi">Hindi</SelectItem>
                          <SelectItem value="Mandarin">Mandarin</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="shortBio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Bio (displayed on cards)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Brief introduction (max 150 characters)"
                      className="resize-none"
                      rows={2}
                    />
                  </FormControl>
                  <div className="text-xs text-gray-500 mt-1">
                    {field.value.length}/150 characters
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="fullBio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Biography</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Detailed biography with information about background, approach and teaching philosophy"
                      className="resize-none"
                      rows={6}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div>
              <FormLabel>Specialties</FormLabel>
              <div className="flex flex-wrap gap-2 mb-2">
                {specialties.map((specialty, index) => (
                  <Badge key={index} className="bg-gray-100 text-gray-800 pl-2">
                    {specialty}
                    <button
                      type="button"
                      onClick={() => handleRemoveSpecialty(specialty)}
                      className="ml-1 p-1 rounded-full hover:bg-gray-200"
                    >
                      <X size={14} />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  placeholder="Add a specialty"
                  onKeyPress={(e) => e.key === 'Enter' && e.preventDefault()}
                />
                <Button type="button" size="sm" onClick={handleAddSpecialty}>
                  <Plus size={16} />
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="qualifications" className="space-y-4">
            <FormField
              control={form.control}
              name="teachingStyle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teaching Style</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe your teaching approach and style"
                      className="resize-none"
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div>
              <FormLabel>Areas of Expertise</FormLabel>
              <div className="flex flex-wrap gap-2 mb-2">
                {expertise.map((item, index) => (
                  <Badge key={index} className="bg-gray-100 text-gray-800 pl-2">
                    {item}
                    <button
                      type="button"
                      onClick={() => handleRemoveExpertise(item)}
                      className="ml-1 p-1 rounded-full hover:bg-gray-200"
                    >
                      <X size={14} />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newExpertise}
                  onChange={(e) => setNewExpertise(e.target.value)}
                  placeholder="Add an area of expertise"
                  onKeyPress={(e) => e.key === 'Enter' && e.preventDefault()}
                />
                <Button type="button" size="sm" onClick={handleAddExpertise}>
                  <Plus size={16} />
                </Button>
              </div>
            </div>
            
            <div>
              <FormLabel>Certifications</FormLabel>
              <div className="flex flex-wrap gap-2 mb-2">
                {certifications.map((cert, index) => (
                  <Badge key={index} className="bg-gray-100 text-gray-800 pl-2">
                    {cert}
                    <button
                      type="button"
                      onClick={() => handleRemoveCertification(cert)}
                      className="ml-1 p-1 rounded-full hover:bg-gray-200"
                    >
                      <X size={14} />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newCertification}
                  onChange={(e) => setNewCertification(e.target.value)}
                  placeholder="Add a certification"
                  onKeyPress={(e) => e.key === 'Enter' && e.preventDefault()}
                />
                <Button type="button" size="sm" onClick={handleAddCertification}>
                  <Plus size={16} />
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="sessions" className="space-y-4">
            <div className="space-y-4">
              {sessionTypes.map((session, index) => (
                <div key={index} className="border rounded-md p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Session Type {index + 1}</h3>
                    {sessionTypes.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSessionType(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={16} className="mr-1" /> Remove
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <FormLabel>Session Name</FormLabel>
                      <Input
                        value={session.name}
                        onChange={(e) => handleSessionTypeChange(index, 'name', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <FormLabel>Session Type</FormLabel>
                      <Select
                        value={session.type}
                        onValueChange={(value: 'video' | 'call' | 'chat') => handleSessionTypeChange(index, 'type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="video">Video Call</SelectItem>
                          <SelectItem value="call">Phone Call</SelectItem>
                          <SelectItem value="chat">Chat/Messaging</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <Input
                        type="number"
                        value={session.duration}
                        onChange={(e) => handleSessionTypeChange(index, 'duration', Number(e.target.value))}
                        min={15}
                        step={5}
                      />
                    </div>
                    
                    <div>
                      <FormLabel>Price ($)</FormLabel>
                      <Input
                        type="number"
                        value={session.price}
                        onChange={(e) => handleSessionTypeChange(index, 'price', Number(e.target.value))}
                        min={1}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Credits: {session.credits} (1 credit = $1)
                      </p>
                    </div>
                  </div>
                  
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" type="button" className="w-full mt-2">
                        <Info className="w-4 h-4 mr-2" /> Booking Restrictions
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4 space-y-4 border-t pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <FormLabel>Allow Recurring Bookings</FormLabel>
                          <div className="flex items-center mt-2">
                            <Switch
                              id={`recurring-${index}`}
                              checked={session.allowRecurring}
                              onCheckedChange={(checked) => handleSessionTypeChange(index, 'allowRecurring', checked)}
                            />
                            <Label htmlFor={`recurring-${index}`} className="ml-2">
                              {session.allowRecurring ? "Enabled" : "Disabled"}
                            </Label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <FormLabel>Minimum Time Before Booking (hours)</FormLabel>
                          <Input
                            type="number"
                            value={session.minTimeBeforeBooking || 2}
                            onChange={(e) => handleSessionTypeChange(index, 'minTimeBeforeBooking', Number(e.target.value))}
                            min={0}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            How many hours in advance must the booking be made
                          </p>
                        </div>
                        
                        <div>
                          <FormLabel>Minimum Time Before Cancelling (hours)</FormLabel>
                          <Input
                            type="number"
                            value={session.minTimeBeforeCancel || 4}
                            onChange={(e) => handleSessionTypeChange(index, 'minTimeBeforeCancel', Number(e.target.value))}
                            min={0}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            How many hours in advance must cancellations be made
                          </p>
                        </div>
                        
                        <div>
                          <FormLabel>Minimum Time Before Rescheduling (hours)</FormLabel>
                          <Input
                            type="number"
                            value={session.minTimeBeforeReschedule || 6}
                            onChange={(e) => handleSessionTypeChange(index, 'minTimeBeforeReschedule', Number(e.target.value))}
                            min={0}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            How many hours in advance must rescheduling be done
                          </p>
                        </div>
                        
                        <div>
                          <FormLabel>Maximum Advance Booking Period (days)</FormLabel>
                          <Input
                            type="number"
                            value={session.maxAdvanceBookingDays || 30}
                            onChange={(e) => handleSessionTypeChange(index, 'maxAdvanceBookingDays', Number(e.target.value))}
                            min={1}
                            max={365}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            How many days in advance can bookings be made
                          </p>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={handleAddSessionType}
                className="w-full"
              >
                <Plus size={16} className="mr-1" /> Add Another Session Type
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="availability" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Availability Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {availability.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No availability has been set for this teacher.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {availability.map((slot) => (
                      <div key={slot.id} className="flex items-center justify-between border rounded-md p-3">
                        <div className="flex items-center space-x-3">
                          <Clock size={18} className="text-gray-500" />
                          <div>
                            <p className="font-medium">{formatDay(slot.day)}</p>
                            <p className="text-sm text-gray-500">
                              {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                            </p>
                          </div>
                          {slot.isRecurring && (
                            <Badge variant="outline" className="bg-gray-50">
                              Recurring
                            </Badge>
                          )}
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRemoveAvailability(slot.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Add New Availability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <FormLabel>Day of the Week</FormLabel>
                    <Select
                      value={newAvailability.day}
                      onValueChange={(value: string) => handleAvailabilityChange('day', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monday">Monday</SelectItem>
                        <SelectItem value="tuesday">Tuesday</SelectItem>
                        <SelectItem value="wednesday">Wednesday</SelectItem>
                        <SelectItem value="thursday">Thursday</SelectItem>
                        <SelectItem value="friday">Friday</SelectItem>
                        <SelectItem value="saturday">Saturday</SelectItem>
                        <SelectItem value="sunday">Sunday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FormLabel>Start Time</FormLabel>
                    <Input
                      type="time"
                      value={newAvailability.startTime}
                      onChange={(e) => handleAvailabilityChange('startTime', e.target.value)}
                    />
                  </div>
                  <div>
                    <FormLabel>End Time</FormLabel>
                    <Input
                      type="time"
                      value={newAvailability.endTime}
                      onChange={(e) => handleAvailabilityChange('endTime', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 pt-2">
                  <Switch 
                    id="recurring"
                    checked={newAvailability.isRecurring}
                    onCheckedChange={(checked) => handleAvailabilityChange('isRecurring', checked)}
                  />
                  <Label htmlFor="recurring">Recurring weekly availability</Label>
                </div>
                
                <Button
                  type="button"
                  onClick={handleAddAvailability}
                  className="w-full"
                >
                  <Plus size={16} className="mr-1" /> Add Time Slot
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="zoom" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Zoom Integration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {zoomAccount ? (
                  <div className="space-y-2">
                    <div className="bg-gray-50 border rounded-md p-4">
                      <p className="font-medium">{zoomAccount.accountName}</p>
                      <p className="text-sm text-gray-500">{zoomAccount.email}</p>
                      <div className="mt-2 flex items-center">
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          {zoomAccount.connected ? "Connected" : "Not Connected"}
                        </Badge>
                      </div>
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleDisconnectZoom} 
                      className="text-red-500 hover:text-red-600"
                    >
                      Disconnect Zoom Account
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <FormLabel>Zoom Email</FormLabel>
                        <Input
                          value={zoomEmail}
                          onChange={(e) => setZoomEmail(e.target.value)}
                          placeholder="your.email@example.com"
                        />
                      </div>
                      <div>
                        <FormLabel>Account Name</FormLabel>
                        <Input
                          value={zoomAccountName}
                          onChange={(e) => setZoomAccountName(e.target.value)}
                          placeholder="Display name for this account"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={handleConnectZoom}
                      className="w-full"
                      disabled={!zoomEmail || !zoomAccountName}
                    >
                      Connect Zoom Account
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={(e) => {
              e.preventDefault();
              onComplete();
            }}
          >
            Cancel
          </Button>
          <Button type="submit">
            {teacher ? "Update Teacher" : "Add Teacher"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TeacherForm;
