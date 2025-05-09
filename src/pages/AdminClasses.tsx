import React, { useState } from 'react';
import { format } from 'date-fns';
import { Edit, Trash2, Plus, Calendar, Clock, Users, X, Repeat } from 'lucide-react';
import Layout from '@/components/Layout';
import AdminGuard from '@/components/AdminGuard';
import { useYogaClasses, YogaClass, getDayNames, RecurringPattern } from '@/contexts/YogaClassContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';

const AdminClasses = () => {
  const { classes, addClass, editClass, deleteClass, formatRecurringPattern } = useYogaClasses();
  const { toast } = useToast();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [deletingClassId, setDeletingClassId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Omit<YogaClass, 'id'>>({
    name: '',
    teacher: '',
    description: '',
    date: new Date().toISOString(),
    duration: 60,
    tags: [],
    joinLink: '',
    imageUrl: '',
    recurringPattern: {
      isRecurring: false,
      daysOfWeek: [],
      frequency: 'weekly'
    }
  });
  
  const [newTag, setNewTag] = useState('');
  const daysOfWeek = [
    { id: 0, name: 'Sunday' },
    { id: 1, name: 'Monday' },
    { id: 2, name: 'Tuesday' },
    { id: 3, name: 'Wednesday' },
    { id: 4, name: 'Thursday' },
    { id: 5, name: 'Friday' },
    { id: 6, name: 'Saturday' },
  ];
  
  const resetForm = () => {
    setFormData({
      name: '',
      teacher: '',
      description: '',
      date: new Date().toISOString(),
      duration: 60,
      tags: [],
      joinLink: '',
      imageUrl: '',
      recurringPattern: {
        isRecurring: false,
        daysOfWeek: [],
        frequency: 'weekly'
      }
    });
    setEditingClassId(null);
    setNewTag('');
  };
  
  const openAddDialog = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };
  
  const openEditDialog = (id: string) => {
    const yogaClass = classes.find((c) => c.id === id);
    if (yogaClass) {
      setFormData({
        name: yogaClass.name,
        teacher: yogaClass.teacher,
        description: yogaClass.description,
        date: yogaClass.date,
        duration: yogaClass.duration,
        tags: [...yogaClass.tags],
        joinLink: yogaClass.joinLink,
        imageUrl: yogaClass.imageUrl || '',
        recurringPattern: yogaClass.recurringPattern ? { 
          ...yogaClass.recurringPattern 
        } : {
          isRecurring: false,
          daysOfWeek: [],
          frequency: 'weekly'
        }
      });
      setEditingClassId(id);
      setIsEditDialogOpen(true);
    }
  };
  
  const openDeleteDialog = (id: string) => {
    setDeletingClassId(id);
    setIsDeleteDialogOpen(true);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value === '' ? 0 : Number(value) });
  };
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    const currentDate = new Date(formData.date);
    const timeValue = isNaN(currentDate.getTime()) 
      ? '00:00' 
      : format(currentDate, 'HH:mm');
    
    const [year, month, day] = dateValue.split('-').map(Number);
    const [hours, minutes] = timeValue.split(':').map(Number);
    
    const newDate = new Date(year, month - 1, day, hours, minutes);
    setFormData({ ...formData, date: newDate.toISOString() });
  };
  
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeValue = e.target.value;
    const currentDate = new Date(formData.date);
    
    if (isNaN(currentDate.getTime())) {
      const newDate = new Date();
      const [hours, minutes] = timeValue.split(':').map(Number);
      newDate.setHours(hours, minutes);
      setFormData({ ...formData, date: newDate.toISOString() });
    } else {
      const [hours, minutes] = timeValue.split(':').map(Number);
      
      const newDate = new Date(currentDate);
      newDate.setHours(hours, minutes);
      
      setFormData({ ...formData, date: newDate.toISOString() });
    }
  };
  
  const handleRecurringToggle = (checked: boolean) => {
    const updatedPattern: RecurringPattern = {
      ...formData.recurringPattern!,
      isRecurring: checked,
    };
    
    if (checked && (!updatedPattern.daysOfWeek || updatedPattern.daysOfWeek.length === 0)) {
      const dateObj = new Date(formData.date);
      const dayOfWeek = dateObj.getDay();
      updatedPattern.daysOfWeek = [dayOfWeek];
    }
    
    setFormData({ 
      ...formData, 
      recurringPattern: updatedPattern 
    });
  };
  
  const handleDayToggle = (day: number) => {
    const currentDays = formData.recurringPattern?.daysOfWeek || [];
    const updatedDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day].sort();
    
    setFormData({
      ...formData,
      recurringPattern: {
        ...formData.recurringPattern!,
        daysOfWeek: updatedDays,
      },
    });
  };
  
  const handleFrequencyChange = (frequency: 'daily' | 'weekly') => {
    setFormData({
      ...formData,
      recurringPattern: {
        ...formData.recurringPattern!,
        frequency,
      },
    });
  };
  
  const handleAddTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData({ ...formData, tags: [...formData.tags, newTag] });
      setNewTag('');
    }
  };
  
  const handleRemoveTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.teacher || !formData.description || !formData.joinLink || formData.tags.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Missing information',
        description: 'Please fill out all required fields.',
      });
      return;
    }
    
    if (formData.recurringPattern?.isRecurring) {
      if (!formData.recurringPattern.daysOfWeek || formData.recurringPattern.daysOfWeek.length === 0) {
        toast({
          variant: 'destructive',
          title: 'Recurring pattern incomplete',
          description: 'Please select at least one day of the week for recurring classes.',
        });
        return;
      }
    }
    
    if (editingClassId) {
      editClass(editingClassId, formData);
      setIsEditDialogOpen(false);
    } else {
      addClass(formData);
      setIsAddDialogOpen(false);
    }
    
    resetForm();
  };
  
  const handleDelete = () => {
    if (deletingClassId) {
      deleteClass(deletingClassId);
      setIsDeleteDialogOpen(false);
      setDeletingClassId(null);
    }
  };
  
  return (
    <AdminGuard>
      <Layout>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h1 className="text-3xl font-bold">Manage Classes</h1>
            <Button onClick={openAddDialog} className="mt-4 md:mt-0 yoga-button">
              <Plus size={18} className="mr-2" />
              Add New Class
            </Button>
          </div>
          
          {classes.length === 0 ? (
            <div className="yoga-card bg-yoga-light-blue/30 text-center py-12">
              <p className="text-xl">No classes have been created yet</p>
              <p className="text-gray-600 mt-2">
                Click the "Add New Class" button to create your first class
              </p>
              <Button onClick={openAddDialog} className="yoga-button mt-4">
                <Plus size={18} className="mr-2" />
                Add New Class
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {classes.map((yogaClass) => (
                <Card key={yogaClass.id} className="yoga-card">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row justify-between">
                      <div className="flex-grow">
                        <h2 className="text-2xl font-semibold mb-2">
                          {yogaClass.name}
                          {yogaClass.recurringPattern?.isRecurring && (
                            <span className="ml-2 inline-flex items-center text-yoga-blue text-sm">
                              <Repeat size={16} className="mr-1" />
                              {formatRecurringPattern(yogaClass.recurringPattern)}
                            </span>
                          )}
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <div className="flex items-center text-gray-600 mb-1">
                              <Calendar size={16} className="mr-2" />
                              {format(new Date(yogaClass.date), 'EEEE, MMMM d, yyyy')}
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Clock size={16} className="mr-2" />
                              {format(new Date(yogaClass.date), 'h:mm a')} • {yogaClass.duration} mins
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-gray-600 mb-1">
                              <span className="font-medium">Teacher:</span> {yogaClass.teacher}
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex flex-wrap">
                              {yogaClass.tags.map((tag) => (
                                <span key={tag} className="yoga-tag">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 line-clamp-2">{yogaClass.description}</p>
                      </div>
                      
                      <div className="flex space-x-2 mt-4 md:mt-0 md:ml-4">
                        <Button
                          variant="outline"
                          size="icon"
                          className="border-yoga-blue text-yoga-blue hover:bg-yoga-blue hover:text-white"
                          onClick={() => openEditDialog(yogaClass.id)}
                        >
                          <Edit size={18} />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="border-destructive text-destructive hover:bg-destructive hover:text-white"
                          onClick={() => openDeleteDialog(yogaClass.id)}
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">Add New Yoga Class</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="block font-medium">
                      Class Name *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="yoga-input"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="teacher" className="block font-medium">
                      Teacher Name *
                    </label>
                    <Input
                      id="teacher"
                      name="teacher"
                      value={formData.teacher}
                      onChange={handleInputChange}
                      className="yoga-input"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="date" className="block font-medium">
                      Date *
                    </label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={format(new Date(formData.date), 'yyyy-MM-dd')}
                      onChange={handleDateChange}
                      className="yoga-input"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="time" className="block font-medium">
                      Time *
                    </label>
                    <Input
                      id="time"
                      name="time"
                      type="time"
                      value={format(new Date(formData.date), 'HH:mm')}
                      onChange={handleTimeChange}
                      className="yoga-input"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="duration" className="block font-medium">
                      Duration (minutes) *
                    </label>
                    <Input
                      id="duration"
                      name="duration"
                      type="number"
                      value={formData.duration}
                      onChange={handleNumberInputChange}
                      min={15}
                      step={5}
                      className="yoga-input"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="joinLink" className="block font-medium">
                      Join Link (Zoom/Meet) *
                    </label>
                    <Input
                      id="joinLink"
                      name="joinLink"
                      type="url"
                      value={formData.joinLink}
                      onChange={handleInputChange}
                      className="yoga-input"
                      placeholder="https://zoom.us/j/123456789"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="imageUrl" className="block font-medium">
                      Class Image URL
                    </label>
                    <Input
                      id="imageUrl"
                      name="imageUrl"
                      type="url"
                      value={formData.imageUrl}
                      onChange={handleInputChange}
                      className="yoga-input"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block font-medium">Tags *</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.tags.map((tag) => (
                        <div 
                          key={tag} 
                          className="flex items-center bg-yoga-light-blue text-yoga-blue rounded-full text-sm px-3 py-1"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-2 focus:outline-none"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        className="yoga-input rounded-r-none"
                        placeholder="Add a tag..."
                      />
                      <Button
                        type="button"
                        onClick={handleAddTag}
                        className="rounded-l-none border-l-0"
                      >
                        Add
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">
                      Common tags: Morning, Evening, Beginners, Advanced, Vinyasa, Restorative
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2 col-span-full">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="isRecurring" 
                      checked={formData.recurringPattern?.isRecurring || false}
                      onCheckedChange={handleRecurringToggle}
                    />
                    <label
                      htmlFor="isRecurring"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      This is a recurring class
                    </label>
                  </div>
                </div>
                
                {formData.recurringPattern?.isRecurring && (
                  <div className="space-y-4 border rounded-md p-4 bg-slate-50">
                    <div className="space-y-3">
                      <label className="block font-medium">
                        Frequency
                      </label>
                      <div className="flex space-x-4">
                        <div className="flex items-center space-x-2">
                          <input 
                            type="radio" 
                            id="weekly" 
                            name="frequency"
                            checked={formData.recurringPattern?.frequency === 'weekly'} 
                            onChange={() => handleFrequencyChange('weekly')}
                            className="h-4 w-4 text-yoga-blue focus:ring-yoga-blue"
                          />
                          <label htmlFor="weekly">Weekly</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input 
                            type="radio" 
                            id="daily" 
                            name="frequency"
                            checked={formData.recurringPattern?.frequency === 'daily'} 
                            onChange={() => handleFrequencyChange('daily')}
                            className="h-4 w-4 text-yoga-blue focus:ring-yoga-blue" 
                          />
                          <label htmlFor="daily">Daily</label>
                        </div>
                      </div>
                    </div>
                    
                    {formData.recurringPattern?.frequency === 'weekly' && (
                      <div className="space-y-3">
                        <label className="block font-medium">
                          Days of the Week
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {daysOfWeek.map((day) => (
                            <div key={day.id} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`day-${day.id}`}
                                checked={(formData.recurringPattern?.daysOfWeek || []).includes(day.id)}
                                onCheckedChange={() => handleDayToggle(day.id)}
                              />
                              <label
                                htmlFor={`day-${day.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {day.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="pt-2">
                      <p className="text-sm text-yoga-blue">
                        <strong>Pattern:</strong> {formatRecurringPattern(formData.recurringPattern)}
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2 col-span-full">
                  <label htmlFor="description" className="block font-medium">
                    Class Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="yoga-input w-full min-h-[120px]"
                    required
                  ></textarea>
                </div>
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      resetForm();
                      setIsAddDialogOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="yoga-button">
                    Add Class
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">Edit Yoga Class</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="block font-medium">
                      Class Name *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="yoga-input"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="teacher" className="block font-medium">
                      Teacher Name *
                    </label>
                    <Input
                      id="teacher"
                      name="teacher"
                      value={formData.teacher}
                      onChange={handleInputChange}
                      className="yoga-input"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="date" className="block font-medium">
                      Date *
                    </label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={format(new Date(formData.date), 'yyyy-MM-dd')}
                      onChange={handleDateChange}
                      className="yoga-input"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="time" className="block font-medium">
                      Time *
                    </label>
                    <Input
                      id="time"
                      name="time"
                      type="time"
                      value={format(new Date(formData.date), 'HH:mm')}
                      onChange={handleTimeChange}
                      className="yoga-input"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="duration" className="block font-medium">
                      Duration (minutes) *
                    </label>
                    <Input
                      id="duration"
                      name="duration"
                      type="number"
                      value={formData.duration}
                      onChange={handleNumberInputChange}
                      min={15}
                      step={5}
                      className="yoga-input"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="joinLink" className="block font-medium">
                      Join Link (Zoom/Meet) *
                    </label>
                    <Input
                      id="joinLink"
                      name="joinLink"
                      type="url"
                      value={formData.joinLink}
                      onChange={handleInputChange}
                      className="yoga-input"
                      placeholder="https://zoom.us/j/123456789"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="imageUrl" className="block font-medium">
                      Class Image URL
                    </label>
                    <Input
                      id="imageUrl"
                      name="imageUrl"
                      type="url"
                      value={formData.imageUrl}
                      onChange={handleInputChange}
                      className="yoga-input"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block font-medium">Tags *</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.tags.map((tag) => (
                        <div 
                          key={tag} 
                          className="flex items-center bg-yoga-light-blue text-yoga-blue rounded-full text-sm px-3 py-1"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-2 focus:outline-none"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        className="yoga-input rounded-r-none"
                        placeholder="Add a tag..."
                      />
                      <Button
                        type="button"
                        onClick={handleAddTag}
                        className="rounded-l-none border-l-0"
                      >
                        Add
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">
                      Common tags: Morning, Evening, Beginners, Advanced, Vinyasa, Restorative
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2 col-span-full">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="isRecurring" 
                      checked={formData.recurringPattern?.isRecurring || false}
                      onCheckedChange={handleRecurringToggle}
                    />
                    <label
                      htmlFor="isRecurring"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      This is a recurring class
                    </label>
                  </div>
                </div>
                
                {formData.recurringPattern?.isRecurring && (
                  <div className="space-y-4 border rounded-md p-4 bg-slate-50">
                    <div className="space-y-3">
                      <label className="block font-medium">
                        Frequency
                      </label>
                      <div className="flex space-x-4">
                        <div className="flex items-center space-x-2">
                          <input 
                            type="radio" 
                            id="weekly" 
                            name="frequency"
                            checked={formData.recurringPattern?.frequency === 'weekly'} 
                            onChange={() => handleFrequencyChange('weekly')}
                            className="h-4 w-4 text-yoga-blue focus:ring-yoga-blue"
                          />
                          <label htmlFor="weekly">Weekly</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input 
                            type="radio" 
                            id="daily" 
                            name="frequency"
                            checked={formData.recurringPattern?.frequency === 'daily'} 
                            onChange={() => handleFrequencyChange('daily')}
                            className="h-4 w-4 text-yoga-blue focus:ring-yoga-blue" 
                          />
                          <label htmlFor="daily">Daily</label>
                        </div>
                      </div>
                    </div>
                    
                    {formData.recurringPattern?.frequency === 'weekly' && (
                      <div className="space-y-3">
                        <label className="block font-medium">
                          Days of the Week
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {daysOfWeek.map((day) => (
                            <div key={day.id} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`day-${day.id}`}
                                checked={(formData.recurringPattern?.daysOfWeek || []).includes(day.id)}
                                onCheckedChange={() => handleDayToggle(day.id)}
                              />
                              <label
                                htmlFor={`day-${day.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {day.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="pt-2">
                      <p className="text-sm text-yoga-blue">
                        <strong>Pattern:</strong> {formatRecurringPattern(formData.recurringPattern)}
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2 col-span-full">
                  <label htmlFor="description" className="block font-medium">
                    Class Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="yoga-input w-full min-h-[120px]"
                    required
                  ></textarea>
                </div>
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      resetForm();
                      setIsEditDialogOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="yoga-button">
                    Save Changes
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Yoga Class</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this class? This action cannot be undone.
                  Students who have already enrolled will be notified.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </Layout>
    </AdminGuard>
  );
};

export default AdminClasses;
