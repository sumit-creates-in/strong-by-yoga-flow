import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Users, Clock, Search, LayoutGrid, CalendarDays, Check, Zap } from 'lucide-react';
import Layout from '@/components/Layout';
import { useYogaClasses } from '@/contexts/YogaClassContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

const Classes = () => {
  const { 
    filteredClasses, 
    setFilters, 
    joinClass, 
    viewMode, 
    setViewMode,
    isClassLive,
    isClassVisible
  } = useYogaClasses();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<'' | 'morning' | 'afternoon' | 'evening'>('');
  
  const allTags = Array.from(
    new Set(filteredClasses.flatMap((yogaClass) => yogaClass.tags))
  ).sort();
  
  const allTeachers = Array.from(
    new Set(filteredClasses.map((yogaClass) => yogaClass.teacher))
  ).sort();
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setFilters((prev) => ({ ...prev, search: value }));
  };
  
  const toggleTag = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    
    setSelectedTags(newTags);
    setFilters((prev) => ({ ...prev, tags: newTags }));
  };
  
  const selectTeacher = (teacher: string) => {
    const newTeacher = selectedTeacher === teacher ? '' : teacher;
    setSelectedTeacher(newTeacher);
    setFilters((prev) => ({ ...prev, teacher: newTeacher }));
  };
  
  const selectTimeSlot = (timeSlot: '' | 'morning' | 'afternoon' | 'evening') => {
    setSelectedTimeSlot(timeSlot);
    setFilters((prev) => ({ ...prev, timeSlot }));
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTags([]);
    setSelectedTeacher('');
    setSelectedTimeSlot('');
    setFilters({
      tags: [],
      teacher: '',
      timeSlot: '',
      search: '',
    });
  };
  
  const classesByDate = filteredClasses.reduce((acc, yogaClass) => {
    const dateKey = format(new Date(yogaClass.date), 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(yogaClass);
    return acc;
  }, {} as Record<string, typeof filteredClasses>);
  
  const sortedDates = Object.keys(classesByDate).sort();
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-bold">Yoga Classes</h1>
          
          <div className="flex mt-4 md:mt-0">
            <Button
              variant={viewMode === 'card' ? 'secondary' : 'outline'}
              className="rounded-r-none"
              onClick={() => setViewMode('card')}
            >
              <LayoutGrid size={20} className="mr-2" />
              Card View
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'secondary' : 'outline'}
              className="rounded-l-none"
              onClick={() => setViewMode('calendar')}
            >
              <CalendarDays size={20} className="mr-2" />
              Calendar View
            </Button>
          </div>
        </div>
        
        <div className="yoga-card">
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search by class name, teacher, or tag..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="yoga-input pl-10 w-full"
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="border-yoga-light-blue">
                      Tags {selectedTags.length > 0 && `(${selectedTags.length})`}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56">
                    <div className="space-y-2">
                      {allTags.map((tag) => (
                        <div
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`flex items-center p-2 rounded-md cursor-pointer ${
                            selectedTags.includes(tag)
                              ? 'bg-yoga-light-blue text-yoga-blue'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          <div className={`w-4 h-4 border rounded-sm mr-2 flex items-center justify-center ${
                            selectedTags.includes(tag) ? 'bg-yoga-blue border-yoga-blue' : 'border-gray-300'
                          }`}>
                            {selectedTags.includes(tag) && <Check size={14} className="text-white" />}
                          </div>
                          {tag}
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="border-yoga-light-blue">
                      Teacher {selectedTeacher && `(${selectedTeacher})`}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56">
                    <div className="space-y-2">
                      {allTeachers.map((teacher) => (
                        <div
                          key={teacher}
                          onClick={() => selectTeacher(teacher)}
                          className={`flex items-center p-2 rounded-md cursor-pointer ${
                            selectedTeacher === teacher
                              ? 'bg-yoga-light-blue text-yoga-blue'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          <div className={`w-4 h-4 border rounded-full mr-2 flex items-center justify-center ${
                            selectedTeacher === teacher ? 'bg-yoga-blue border-yoga-blue' : 'border-gray-300'
                          }`}>
                            {selectedTeacher === teacher && <Check size={14} className="text-white" />}
                          </div>
                          {teacher}
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="border-yoga-light-blue">
                      Time {selectedTimeSlot && `(${selectedTimeSlot})`}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56">
                    <div className="space-y-2">
                      {[
                        { value: 'morning', label: 'Morning (5am - 12pm)' },
                        { value: 'afternoon', label: 'Afternoon (12pm - 5pm)' },
                        { value: 'evening', label: 'Evening (5pm - 9pm)' },
                      ].map((option) => (
                        <div
                          key={option.value}
                          onClick={() => selectTimeSlot(option.value as any)}
                          className={`flex items-center p-2 rounded-md cursor-pointer ${
                            selectedTimeSlot === option.value
                              ? 'bg-yoga-light-blue text-yoga-blue'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          <div className={`w-4 h-4 border rounded-full mr-2 flex items-center justify-center ${
                            selectedTimeSlot === option.value ? 'bg-yoga-blue border-yoga-blue' : 'border-gray-300'
                          }`}>
                            {selectedTimeSlot === option.value && <Check size={14} className="text-white" />}
                          </div>
                          {option.label}
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                
                {(selectedTags.length > 0 || selectedTeacher || selectedTimeSlot || searchTerm) && (
                  <Button variant="ghost" onClick={clearFilters} className="text-yoga-blue">
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {filteredClasses.length === 0 ? (
          <div className="yoga-card bg-yoga-light-blue/30 text-center py-12">
            <p className="text-xl">No classes match your search</p>
            <p className="text-gray-600 mt-2">
              Try adjusting your filters or search term
            </p>
            <Button onClick={clearFilters} className="yoga-button mt-4">
              Clear All Filters
            </Button>
          </div>
        ) : viewMode === 'card' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map((yogaClass) => (
              <Card key={yogaClass.id} className="yoga-card h-full flex flex-col relative">
                {yogaClass.imageUrl && (
                  <div className="w-full h-48 relative overflow-hidden">
                    <img 
                      src={yogaClass.imageUrl} 
                      alt={yogaClass.name} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                      {yogaClass.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="bg-white/80 text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    {isClassLive(yogaClass) && (
                      <span className="absolute top-2 right-2 bg-red-500 text-white py-1 px-2 rounded-md flex items-center shadow-md animate-pulse">
                        <Zap size={14} className="mr-1.5" />
                        <span className="font-medium text-xs">LIVE</span>
                      </span>
                    )}
                  </div>
                )}
                <CardContent className="pt-6 flex flex-col h-full">
                  <div className="flex flex-col flex-grow">
                    <div className="flex justify-between">
                      <h3 className="text-xl font-semibold mb-2">{yogaClass.name}</h3>
                      {isClassLive(yogaClass) && (
                        <span className="bg-red-500 text-white py-1 px-2 rounded-md flex items-center shadow-md animate-pulse">
                          <Zap size={14} className="mr-1.5" />
                          <span className="font-medium">LIVE</span>
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center text-gray-600 mb-2">
                      <CalendarIcon size={16} className="mr-2" />
                      <span>{format(new Date(yogaClass.date), 'EEEE, MMMM d, yyyy')}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600 mb-2">
                      <Clock size={16} className="mr-2" />
                      <span>
                        {format(new Date(yogaClass.date), 'h:mm a')} • {yogaClass.duration} mins
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <span className="font-medium">Teacher:</span> {yogaClass.teacher}
                    </div>
                    
                    <div className="mb-3 flex flex-wrap">
                      {yogaClass.tags.map((tag) => (
                        <span key={tag} className="yoga-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <p className="text-gray-700 mb-4 line-clamp-2">
                      {yogaClass.description}
                    </p>
                    
                    <div className="mt-auto flex flex-wrap gap-2">
                      <Button
                        onClick={() => navigate(`/classes/${yogaClass.id}`)}
                        variant="outline"
                        className="flex-grow"
                      >
                        View Details
                      </Button>
                      
                      {new Date() <= new Date(yogaClass.date) && (
                        <Button 
                          className="flex-grow bg-yoga-blue text-white hover:bg-yoga-blue/90"
                          onClick={() => joinClass(yogaClass.id)}
                        >
                          {isClassLive(yogaClass) ? 'Join Live Now' : 'Join Class'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {sortedDates.map((dateKey) => {
              const date = new Date(dateKey);
              const classes = classesByDate[dateKey];
              
              return (
                <div key={dateKey} className="yoga-card">
                  <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-yoga-light-blue">
                    {format(date, 'EEEE, MMMM d, yyyy')}
                  </h2>
                  
                  <div className="space-y-4">
                    {classes.map((yogaClass) => (
                      <div 
                        key={yogaClass.id} 
                        className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 hover:bg-yoga-light-yellow/20 rounded-lg"
                      >
                        <div className="mb-4 md:mb-0">
                          <div className="flex items-center">
                            <h3 className="text-lg font-medium">{yogaClass.name}</h3>
                            {isClassLive(yogaClass) && (
                              <span className="ml-2 bg-red-500 text-white py-0.5 px-2 rounded-md flex items-center text-xs shadow-md animate-pulse">
                                <Zap size={12} className="mr-1" />
                                <span className="font-medium text-xs">LIVE</span>
                              </span>
                            )}
                          </div>
                          <div className="flex items-center text-gray-600 text-sm">
                            <Clock size={14} className="mr-1" />
                            <span>
                              {format(new Date(yogaClass.date), 'h:mm a')} - {format(new Date(new Date(yogaClass.date).getTime() + yogaClass.duration * 60000), 'h:mm a')} ({yogaClass.duration} mins)
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Teacher:</span> {yogaClass.teacher}
                          </div>
                          <div className="mt-2 flex flex-wrap">
                            {yogaClass.tags.map((tag) => (
                              <span key={tag} className="yoga-tag">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 w-full md:w-auto">
                          <Button
                            onClick={() => navigate(`/classes/${yogaClass.id}`)}
                            variant="outline"
                            size="sm"
                            className="flex-grow md:flex-grow-0"
                          >
                            View Details
                          </Button>
                          
                          {new Date() <= new Date(yogaClass.date) && (
                            <Button 
                              className="flex-grow md:flex-grow-0 bg-yoga-blue text-white hover:bg-yoga-blue/90"
                              size="sm"
                              onClick={() => joinClass(yogaClass.id)}
                            >
                              {isClassLive(yogaClass) ? 'Join Live Now' : 'Join Class'}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Classes;
