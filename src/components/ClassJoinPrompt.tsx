import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { format, addMinutes, differenceInSeconds } from 'date-fns';
import { ExternalLink, Clock } from 'lucide-react';

interface ClassJoinPromptProps {
  isOpen: boolean;
  onClose: () => void;
  classDate: string;
  className: string;
  joinLink: string;
}

const ClassJoinPrompt: React.FC<ClassJoinPromptProps> = ({
  isOpen,
  onClose,
  classDate,
  className,
  joinLink,
}) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [canJoin, setCanJoin] = useState<boolean>(false);
  const classDateTime = new Date(classDate);
  const joinTime = addMinutes(classDateTime, -5); // 5 minutes before class starts
  const now = new Date();
  
  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const diffInSeconds = differenceInSeconds(classDateTime, now);
      
      // Can join 5 minutes before class starts
      setCanJoin(now >= joinTime);
      
      if (diffInSeconds <= 0) {
        setTimeRemaining('Class has started');
        return;
      }
      
      // Format remaining time
      const hours = Math.floor(diffInSeconds / 3600);
      const minutes = Math.floor((diffInSeconds % 3600) / 60);
      const seconds = diffInSeconds % 60;
      
      if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining(`${seconds}s`);
      }
    };
    
    checkTime();
    const interval = setInterval(checkTime, 1000);
    
    return () => clearInterval(interval);
  }, [classDate, classDateTime, joinTime]);
  
  const handleJoin = () => {
    window.open(joinLink, '_blank', 'noopener,noreferrer');
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{className}</DialogTitle>
          <DialogDescription>
            {canJoin ? 'Your class is ready to join!' : 'Your class will start soon'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
          {!canJoin ? (
            <>
              <div className="text-5xl font-bold text-yoga-blue mb-4">
                {timeRemaining}
              </div>
              <Clock size={48} className="text-yoga-blue animate-pulse mb-2" />
              <p className="text-lg">
                This class will start at{' '}
                <span className="font-semibold">
                  {format(classDateTime, 'h:mm a')}
                </span>
              </p>
              <p className="text-muted-foreground text-sm">
                You'll be able to join 5 minutes before the class starts
              </p>
            </>
          ) : (
            <>
              <div className="text-2xl font-bold text-yoga-blue mb-4">
                {timeRemaining === 'Class has started' ? 
                  'Class has started!' : 
                  `Starting in ${timeRemaining}`
                }
              </div>
              <p className="text-lg mb-4">
                Click the button below to join your class now
              </p>
              <Button 
                onClick={handleJoin} 
                className="bg-yoga-blue hover:bg-yoga-blue/90 text-white px-8 py-6 text-lg"
              >
                <ExternalLink size={20} className="mr-2" />
                Join Class Now
              </Button>
            </>
          )}
        </div>
        
        <DialogFooter className="sm:justify-center">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClassJoinPrompt;
