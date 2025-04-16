
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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
import { X, Plus, Trash2, Clock } from 'lucide-react';
import { useTeachers, AvailabilitySlot, ZoomAccount, Teacher } from '@/contexts/TeacherContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

// Define form schema
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
  onComplete: () => void;
}

const TeacherForm = ({ teacher, onComplete }: TeacherFormProps) => {
  const { addTeacher, updateTeacher, addTeacherAvailability, removeTeacherAvailability, connectZoomAccount, disconnectZoomAccount } = useTeachers();
  
  const [specialties, setSpecialties] = useState<string[]>(teacher?.specialties || []);
  const [newSpecialty, setNewSpecialty] = useState('');
  
  const [expertise, setExpertise] = useState<string[]>(teacher?.expertise || []);
  const [newExpertise, setNewExpertise] = useState('');
  
  const [certifications, setCertifications] = useState<string[]>(teacher?.certifications || []);
  const [newCertification, setNewCertification] = useState('');
  
  const [sessionTypes, setSessionTypes] = useState(teacher?.sessionTypes || [
    { id: '1', name: 'Video Consultation', type: 'video', duration: 60, price: 50, credits: 50 },
    { id: '2', name: 'Phone Call', type: 'call', duration: 30, price: 35, credits: 35 }
  ]);

  const [availability, setAvailability] = useState<AvailabilitySlot[]>(teacher?.availability || []);
  const [newAvailability, setNewAvailability] = useState<Partial<AvailabilitySlot>>({
    day: 'monday',
    startTime: '09:00',
    endTime: '10:00',
    isRecurring: true
  });

  const [zoomAccount, setZoomAccount] = useState<ZoomAccount | null>(teacher?.zoomAccount || null);
  const [zoomEmail, setZoomEmail] = useState('');
  const [zoomAccountName, setZoomAccountName] = useState('');
  
  // Initialize form
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
  
  // Helper functions for managing arrays
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
  
  // Update session type
  const handleSessionTypeChange = (index: number, field: string, value: any) => {
    const updatedTypes = [...sessionTypes];
    updatedTypes[index] = { ...updatedTypes[index], [field]: value };
    
    // If price is updated, automatically update credits to match (1 credit = $1)
    if (field === 'price') {
      updatedTypes[index].credits = value;
    }
    
    setSessionTypes(updatedTypes);
  };
  
  const handleAddSessionType = () => {
    const newId = `session-${Date.now()}`;
    setSessionTypes([
      ...sessionTypes, 
      { id: newId, name: 'New Session', type: 'video', duration: 60, price: 50, credits: 50 }
    ]);
  };
  
  const handleRemoveSessionType = (index: number) => {
    if (sessionTypes.length > 1) {
      const updatedTypes = [...sessionTypes];
      updatedTypes.splice(index, 1);
      setSessionTypes(updatedTypes);
    }
  };

  // Availability management
  const handleAddAvailability = () => {
    const newSlot: AvailabilitySlot = {
      id: `avail-${Date.now()}`,
      day: newAvailability.day as 'monday',
      startTime: newAvailability.startTime || '09:00',
      endTime: newAvailability.endTime || '10:00',
      isRecurring: newAvailability.isRecurring || true
    };
    
    setAvailability([...availability, newSlot]);
    
    // Reset form
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

  const handleAvailabilityChange = (field: keyof AvailabilitySlot, value: any) => {
    setNewAvailability({
      ...newAvailability,
      [field]: value
    });
  };

  // Zoom account management
  const handleConnectZoom = () => {
    if (zoomEmail && zoomAccountName) {
      const newZoomAccount: ZoomAccount = {
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
  
  // Format day for display
  const formatDay = (day: string): string => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  // Format time for display
  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };
  
  // Form submission
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const teacherData: Teacher = {
      ...values,
      id: teacher?.id || `teacher-${Date.now()}`,
      specialties,
      expertise,
      certifications,
      sessionTypes,
      availability,
      zoomAccount,
      rating: teacher?.rating || 5.0,
      reviewCount: teacher?.reviewCount || 0,
      totalSessions: teacher?.totalSessions || 0,
      reviews: teacher?.reviews || [],
      lastReviewDate: teacher?.lastReviewDate || format(new Date(), 'MMMM d, yyyy'),
    };
    
    if (teacher) {
      updateTeacher(teacherData);
    } else {
      addTeacher(teacherData);
    }
    
    onComplete();
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
            {/* Basic Information */}
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
                        onValueChange={(value) => handleSessionTypeChange(index, 'type', value)}
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
                      onValueChange={(value: any) => handleAvailabilityChange('day', value)}
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
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-md p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">Z</span>
                          </div>
                          <div>
                            <p className="font-semibold">{zoomAccount.accountName}</p>
                            <p className="text-sm text-gray-600">{zoomAccount.email}</p>
                          </div>
                          <Badge className="bg-green-500">Connected</Badge>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleDisconnectZoom}
                          className="text-red-500 hover:text-red-700 border-red-200"
                        >
                          Disconnect
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>This Zoom account will be used to automatically create meetings when students book sessions with this teacher.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      Connect a Zoom account to automatically create meetings when students book sessions with this teacher.
                    </p>
                    
                    <div className="space-y-4">
                      <div>
                        <FormLabel>Zoom Account Email</FormLabel>
                        <Input
                          type="email"
                          value={zoomEmail}
                          onChange={(e) => setZoomEmail(e.target.value)}
                          placeholder="teacher@example.com"
                        />
                      </div>
                      
                      <div>
                        <FormLabel>Account Name</FormLabel>
                        <Input
                          type="text"
                          value={zoomAccountName}
                          onChange={(e) => setZoomAccountName(e.target.value)}
                          placeholder="Teacher Name"
                        />
                      </div>
                      
                      <Button
                        type="button"
                        onClick={handleConnectZoom}
                        className="w-full"
                        disabled={!zoomEmail || !zoomAccountName}
                      >
                        Connect Zoom Account
                      </Button>
                      
                      <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-sm text-gray-600">
                        <p>
                          Note: This is a demo integration. In a real application, this would open a Zoom OAuth flow to connect the teacher's actual Zoom account.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onComplete}>
            Cancel
          </Button>
          <Button type="submit">
            {teacher ? 'Update Teacher' : 'Add Teacher'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TeacherForm;
