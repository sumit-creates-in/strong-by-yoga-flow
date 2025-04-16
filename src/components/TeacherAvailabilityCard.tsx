
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { AvailabilitySlot } from '@/contexts/TeacherContext';

interface TeacherAvailabilityCardProps {
  availability: AvailabilitySlot[];
}

const TeacherAvailabilityCard: React.FC<TeacherAvailabilityCardProps> = ({ availability }) => {
  // Format day for display
  const formatDay = (day: string): string => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  // Format time for display
  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };
  
  // Group availability by day
  const availabilityByDay: Record<string, AvailabilitySlot[]> = availability.reduce((acc, slot) => {
    if (!acc[slot.day]) {
      acc[slot.day] = [];
    }
    acc[slot.day].push(slot);
    return acc;
  }, {} as Record<string, AvailabilitySlot[]>);
  
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
        {availability.length === 0 ? (
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
                    {availabilityByDay[day].map((slot, index) => (
                      <div key={index} className="text-sm flex items-center space-x-1">
                        <Clock size={14} className="text-gray-400" />
                        <span className="text-gray-600">
                          {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                        </span>
                        <span className="text-xs text-gray-500">
                          (15-min slots)
                        </span>
                      </div>
                    ))}
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
