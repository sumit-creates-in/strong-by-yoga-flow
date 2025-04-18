
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Coins } from 'lucide-react';

interface CustomAvailabilitySlot {
  id?: string;
  day: string;
  startTime?: string;
  endTime?: string;
  isRecurring?: boolean;
  slots?: { start: string; end: string }[];
}

interface TeacherAvailabilityCardProps {
  availability: CustomAvailabilitySlot[];
}

const TeacherAvailabilityCard: React.FC<TeacherAvailabilityCardProps> = ({ availability }) => {
  // Format day for display
  const formatDay = (day: string): string => {
    if (!day) return '';
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  // Format time for display with null checks
  const formatTime = (time: string | undefined): string => {
    if (!time) return '';
    
    const [hours, minutes] = time.split(':');
    if (!hours || !minutes) return time;
    
    const hour = parseInt(hours, 10);
    if (isNaN(hour)) return time;
    
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  };
  
  // Handle both formats of availability data
  const getTimeDisplay = (slot: CustomAvailabilitySlot): { start: string, end: string } => {
    // If slot has direct startTime/endTime properties
    if (slot.startTime && slot.endTime) {
      return {
        start: formatTime(slot.startTime),
        end: formatTime(slot.endTime)
      };
    }
    
    // If slot has nested slots array (from context format)
    if (slot.slots && slot.slots.length > 0) {
      return {
        start: formatTime(slot.slots[0].start),
        end: formatTime(slot.slots[0].end)
      };
    }
    
    // Fallback
    return { start: '', end: '' };
  };
  
  // Group availability by day
  const availabilityByDay: Record<string, CustomAvailabilitySlot[]> = (availability || []).reduce((acc, slot) => {
    if (!slot.day) return acc;
    
    const day = slot.day.toLowerCase();
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(slot);
    return acc;
  }, {} as Record<string, CustomAvailabilitySlot[]>);
  
  // Order days for display
  const orderedDays = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" /> 
          Weekly Availability
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!availability || availability.length === 0 ? (
          <p className="text-center text-gray-500 py-4">
            No regular availability has been set by this teacher.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orderedDays.map(day => (
              availabilityByDay[day] && (
                <div key={day} className="border rounded-md p-3">
                  <h3 className="font-medium text-gray-800 mb-2">{formatDay(day)}</h3>
                  <div className="space-y-2">
                    {availabilityByDay[day].map((slot, index) => {
                      const timeDisplay = getTimeDisplay(slot);
                      return (
                        <div key={index} className="text-sm flex items-center space-x-1">
                          <Clock size={14} className="text-gray-400" />
                          <span className="text-gray-600">
                            {timeDisplay.start} - {timeDisplay.end}
                          </span>
                          <span className="text-xs text-gray-500">
                            (15-min slots)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeacherAvailabilityCard;
