import React, { useState, useEffect } from 'react';
import { Teacher, NotificationTemplate } from '@/types/teacher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface TeacherFormProps {
  teacher: Teacher;
  onSubmit: (teacher: Teacher) => void;
  onCancel: () => void;
}

const sessionTypesData = [
  { id: "one-on-one", name: "One-on-One", description: "Personalized individual sessions" },
  { id: "group", name: "Group Session", description: "Sessions with multiple participants" },
  { id: "workshop", name: "Workshop", description: "Specialized workshops on specific topics" },
  { id: "retreat", name: "Retreat", description: "Immersive retreat experiences" },
];

const expertiseData = [
  { id: "beginner", name: "Beginner" },
  { id: "intermediate", name: "Intermediate" },
  { id: "advanced", name: "Advanced" },
];

const specialtiesData = [
  { id: "yoga", name: "Yoga" },
  { id: "meditation", name: "Meditation" },
  { id: "pilates", name: "Pilates" },
  { id: "fitness", name: "Fitness" },
];

const languagesData = [
  { id: "en", name: "English" },
  { id: "es", name: "Spanish" },
  { id: "fr", name: "French" },
  { id: "de", name: "German" },
];

const timeSlots = [
  "00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00",
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00",
  "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"
];

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const TeacherForm: React.FC<TeacherFormProps> = ({ teacher, onSubmit, onCancel }) => {
  const [name, setName] = useState(teacher.name || '');
  const [title, setTitle] = useState(teacher.title || '');
  const [bio, setBio] = useState(teacher.bio || '');
  const [imageUrl, setImageUrl] = useState(teacher.imageUrl || '');
  const [zoomEmail, setZoomEmail] = useState(teacher.zoomAccount?.email || '');
  const [oneOnOneRate, setOneOnOneRate] = useState(teacher.pricing?.oneOnOne?.toString() || '50');
  const [groupRate, setGroupRate] = useState(teacher.pricing?.group?.toString() || '30');
  const [experience, setExperience] = useState(teacher.experience?.toString() || '5');
  const [location, setLocation] = useState(teacher.location || '');
  const [teachingStyle, setTeachingStyle] = useState(teacher.teachingStyle || '');
  const [education, setEducation] = useState(teacher.education || '');
  const [certifications, setCertifications] = useState(teacher.certifications || '');
  const [selectedSpecialties, setSelectedSpecialties] = useState(teacher.specialties || []);
  const [selectedExpertise, setSelectedExpertise] = useState(teacher.expertise || []);
  const [selectedLanguages, setSelectedLanguages] = useState(teacher.languages || []);
  const [sessionTypes, setSessionTypes] = useState(teacher.sessionTypes || []);
  const [availability, setAvailability] = useState(teacher.availability || []);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const validateForm = () => {
    if (!name || !title || !bio) {
      toast({
        variant: "destructive",
        title: "Required fields",
        description: "Please fill in all required fields."
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      const updatedTeacher: Teacher = {
        id: teacher.id || crypto.randomUUID(),
        name: name || teacher.name, // Ensure name is always provided
        title: title,
        bio: bio,
        specialties: selectedSpecialties,
        expertise: selectedExpertise,
        certifications: certifications,
        sessionTypes: sessionTypes,
        availability: availability,
        zoomAccount: {
          email: zoomEmail,
          connected: !!zoomEmail,
        },
        imageUrl: imageUrl || teacher.imageUrl,
        pricing: {
          oneOnOne: Number(oneOnOneRate),
          group: Number(groupRate),
        },
        languages: selectedLanguages,
        education: education,
        location: location,
        experience: Number(experience),
        ratings: teacher.ratings || { average: 0, count: 0 },
        teachingStyle: teachingStyle,
        notificationSettings: teacher.notificationSettings || {
          email: { enabled: true, templates: [] },
          sms: { enabled: true, templates: [] },
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
          inApp: { enabled: true, templates: [] }
        },
        reviews: teacher.reviews || []
      };
      
      onSubmit(updatedTeacher);
    } catch (error) {
      console.error("Error submitting teacher form:", error);
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: "Failed to submit teacher information. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg border">
      <h3 className="font-medium text-lg mb-4">
        {teacher.id ? 'Edit Teacher' : 'Create Teacher'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input
            type="url"
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
          {imageUrl && (
            <Avatar className="w-24 h-24 mt-2">
              <AvatarFallback>{name?.substring(0, 2).toUpperCase()}</AvatarFallback>
              <img src={imageUrl} alt={name} className="rounded-full" />
            </Avatar>
          )}
        </div>
        
        <div>
          <Label htmlFor="zoomEmail">Zoom Email</Label>
          <Input
            type="email"
            id="zoomEmail"
            value={zoomEmail}
            onChange={(e) => setZoomEmail(e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="oneOnOneRate">One-on-One Rate</Label>
          <Input
            type="number"
            id="oneOnOneRate"
            value={oneOnOneRate}
            onChange={(e) => setOneOnOneRate(e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="groupRate">Group Rate</Label>
          <Input
            type="number"
            id="groupRate"
            value={groupRate}
            onChange={(e) => setGroupRate(e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="experience">Experience (years)</Label>
          <Input
            type="number"
            id="experience"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="teachingStyle">Teaching Style</Label>
          <Input
            type="text"
            id="teachingStyle"
            value={teachingStyle}
            onChange={(e) => setTeachingStyle(e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="education">Education</Label>
          <Input
            type="text"
            id="education"
            value={education}
            onChange={(e) => setEducation(e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="certifications">Certifications</Label>
          <Input
            type="text"
            id="certifications"
            value={certifications}
            onChange={(e) => setCertifications(e.target.value)}
          />
        </div>
        
        <div>
          <Label>Specialties</Label>
          <div className="flex flex-wrap gap-2">
            {specialtiesData.map((specialty) => (
              <div key={specialty.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`specialty-${specialty.id}`}
                  checked={selectedSpecialties.some((s) => s.id === specialty.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedSpecialties([...selectedSpecialties, specialty]);
                    } else {
                      setSelectedSpecialties(selectedSpecialties.filter((s) => s.id !== specialty.id));
                    }
                  }}
                />
                <Label htmlFor={`specialty-${specialty.id}`}>{specialty.name}</Label>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <Label>Expertise</Label>
          <div className="flex flex-wrap gap-2">
            {expertiseData.map((expertise) => (
              <div key={expertise.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`expertise-${expertise.id}`}
                  checked={selectedExpertise.some((e) => e.id === expertise.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedExpertise([...selectedExpertise, expertise]);
                    } else {
                      setSelectedExpertise(selectedExpertise.filter((e) => e.id !== expertise.id));
                    }
                  }}
                />
                <Label htmlFor={`expertise-${expertise.id}`}>{expertise.name}</Label>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <Label>Languages</Label>
          <div className="flex flex-wrap gap-2">
            {languagesData.map((language) => (
              <div key={language.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`language-${language.id}`}
                  checked={selectedLanguages.some((l) => l.id === language.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedLanguages([...selectedLanguages, language]);
                    } else {
                      setSelectedLanguages(selectedLanguages.filter((l) => l.id !== language.id));
                    }
                  }}
                />
                <Label htmlFor={`language-${language.id}`}>{language.name}</Label>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <Label>Session Types</Label>
          <div className="flex flex-wrap gap-2">
            {sessionTypesData.map((sessionType) => (
              <div key={sessionType.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`sessionType-${sessionType.id}`}
                  checked={sessionTypes.some((st) => st.id === sessionType.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSessionTypes([...sessionTypes, sessionType]);
                    } else {
                      setSessionTypes(sessionTypes.filter((st) => st.id !== sessionType.id));
                    }
                  }}
                />
                <Label htmlFor={`sessionType-${sessionType.id}`}>{sessionType.name}</Label>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <Label>Availability</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {daysOfWeek.map((day) => (
              <div key={day} className="space-y-2">
                <h4 className="font-semibold">{day}</h4>
                <div className="flex flex-wrap gap-2">
                  {timeSlots.map((time) => {
                    const isAvailable = availability.some(
                      (slot) => slot.day === day && slot.time === time
                    );
                    return (
                      <div key={`${day}-${time}`} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${day}-${time}`}
                          checked={isAvailable}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setAvailability([
                                ...availability,
                                { day, time },
                              ]);
                            } else {
                              setAvailability(
                                availability.filter(
                                  (slot) => !(slot.day === day && slot.time === time)
                                )
                              );
                            }
                          }}
                        />
                        <Label htmlFor={`${day}-${time}`}>{time}</Label>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TeacherForm;
