import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTeacher } from '@/contexts/TeacherContext';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users2, MapPin, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { YogaClass } from '@/types/yogaClass';
import { Teacher } from '@/types/teacher';
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from 'date-fns';
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

const TeacherDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { getTeacher } = useTeacher();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [yogaClasses, setYogaClasses] = useState<YogaClass[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(new Date().setDate(new Date().getDate() + 7)),
  });

  useEffect(() => {
    if (id) {
      const fetchTeacher = async () => {
        const teacherData = await getTeacher(id);
        if (teacherData) {
          setTeacher(teacherData);
          // Mock yoga classes for the teacher
          setYogaClasses([
            { id: '1', name: 'Yoga for Beginners', teacherId: id, date: '2024-03-15', time: '10:00 AM', duration: '60 minutes', location: 'Online' },
            { id: '2', name: 'Advanced Vinyasa Flow', teacherId: id, date: '2024-03-16', time: '05:00 PM', duration: '75 minutes', location: 'In-Person' },
          ]);
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to fetch teacher details.",
          });
        }
      };
      fetchTeacher();
    }
  }, [id, getTeacher, toast]);

  if (!teacher) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center gap-4 mb-6">
        <Avatar className="w-24 h-24">
          <AvatarFallback>{teacher.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
          {/* You might want to add an actual image source here */}
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{teacher.name}</h1>
          <p className="text-gray-600">{teacher.title}</p>
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">About</h2>
        <p>{teacher.bio}</p>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Specialties</h2>
        <div className="flex gap-2">
          {teacher.specialties.map((specialty) => (
            <span key={specialty.id} className="px-2 py-1 rounded-full bg-gray-200 text-gray-700 text-sm">{specialty.name}</span>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Expertise</h2>
        <div className="flex gap-2">
          {teacher.expertise.map((exp) => (
            <span key={exp.id} className="px-2 py-1 rounded-full bg-gray-200 text-gray-700 text-sm">{exp.name}</span>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Contact</h2>
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-gray-500" />
          <span>{teacher.location || 'No location specified'}</span>
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Availability</h2>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-500" />
          <span>{teacher.availability || 'Not specified'}</span>
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Session Types</h2>
        {teacher.sessionTypes.map((sessionType) => (
          <div key={sessionType.id} className="mb-4">
            <div className="font-semibold">{sessionType.name || 'Session type'}</div>
            <div>{sessionType.description}</div>
            <div>Price: ${sessionType.price}</div>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Book a Session</h2>
        <p>Select a date range to check availability and book a session with {teacher.name}.</p>
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[300px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    `${format(date.from, "MMM dd, yyyy")} - ${format(
                      date.to,
                      "MMM dd, yyyy"
                    )}`
                  ) : (
                    format(date.from, "MMM dd, yyyy")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
                pagedNavigation
                className="border-0 rounded-md"
              />
            </PopoverContent>
          </Popover>
          <Button onClick={() => navigate(`/teachers/${id}/booking`)} className="yoga-button">
            Check Availability
          </Button>
        </div>
      </div>

      <div className="mt-4 font-medium">
        Last review: {teacher.lastReviewDate ? new Date(teacher.lastReviewDate).toLocaleDateString() : 'No reviews yet'}
      </div>

      {teacher.reviews && teacher.reviews.length > 0 ? (
        <div className="mt-4 space-y-4">
          <h3 className="text-xl font-semibold mb-2">Student Reviews ({teacher.reviews.length})</h3>
          {teacher.reviews.map((review) => (
            <div key={review.id} className="border-b pb-4">
              <div className="flex items-center gap-2">
                <Avatar className="w-10 h-10">
                  <AvatarFallback>{review.userInitials || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{review.userName || 'Anonymous'}</div>
                  <div className="text-sm text-muted-foreground">{review.date ? new Date(review.date).toLocaleDateString() : 'Unknown date'}</div>
                </div>
              </div>
              <p className="mt-2">{review.comment}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No reviews yet
        </div>
      )}
    </div>
  );
};

export default TeacherDetail;
