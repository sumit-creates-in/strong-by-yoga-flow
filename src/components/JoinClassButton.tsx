import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useYogaClasses, YogaClass } from '@/contexts/YogaClassContext';
import ClassJoinPrompt from './ClassJoinPrompt';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface JoinClassButtonProps {
  yogaClass: YogaClass;
  variant?: 'default' | 'outline' | 'secondary';
  className?: string;
  buttonText?: string;
  showIcon?: boolean;
}

const JoinClassButton: React.FC<JoinClassButtonProps> = ({
  yogaClass,
  variant = 'default',
  className = '',
  buttonText = 'Join Class',
  showIcon = true,
}) => {
  const { user } = useAuth();
  const { joinClass, userMembership, isClassLive } = useYogaClasses();
  const navigate = useNavigate();
  const [isMembershipDialogOpen, setIsMembershipDialogOpen] = useState(false);
  const [isJoinPromptOpen, setIsJoinPromptOpen] = useState(false);
  
  // Check for special roles that don't need membership
  const isAdmin = user?.email === 'sumit_204@yahoo.com' || user?.email === 'admin@strongbyyoga.com' || user?.role === 'admin';
  const isTeacher = user?.role === 'teacher';
  const isLive = isClassLive(yogaClass);
  
  // Debug log for role detection
  useEffect(() => {
    console.log('User email:', user?.email);
    console.log('User role:', user?.role);
    console.log('Is admin detected:', isAdmin);
    console.log('Is teacher detected:', isTeacher);
  }, [user, isAdmin, isTeacher]);
  
  const handleClick = () => {
    // Force admin check for specific email addresses
    const isAdminEmail = user?.email === 'sumit_204@yahoo.com' || user?.email === 'admin@strongbyyoga.com';
    
    // Check if user is admin, teacher, or has membership
    if (isAdminEmail || isAdmin || isTeacher || userMembership.active) {
      console.log('Proceeding as admin, teacher, or member', { 
        isAdmin, 
        isTeacher,
        isAdminEmail, 
        hasMembership: userMembership.active 
      });
      
      const classDate = new Date(yogaClass.date);
      const now = new Date();
      const fiveMinutesBefore = new Date(classDate);
      fiveMinutesBefore.setMinutes(classDate.getMinutes() - 5);
      const classEndTime = new Date(classDate);
      classEndTime.setMinutes(classDate.getMinutes() + yogaClass.duration);
      
      if (isLive || (now >= fiveMinutesBefore && now <= classEndTime)) {
        // Class is live or starting within 5 minutes - join directly
        joinClass(yogaClass.id);
        window.open(yogaClass.joinLink, '_blank', 'noopener,noreferrer');
      } else {
        // Show countdown dialog for classes starting later
        setIsJoinPromptOpen(true);
      }
    } else {
      console.log('Showing membership dialog', { isAdmin, isTeacher, hasMembership: userMembership.active, email: user?.email });
      // User doesn't have membership - show membership required dialog
      setIsMembershipDialogOpen(true);
    }
  };
  
  return (
    <>
      <Button 
        variant={variant}
        className={`${className}`}
        onClick={handleClick}
      >
        {isTeacher && !userMembership.active ? (
          <>
            {buttonText} <span className="ml-1 text-xs">(Teacher Access)</span>
          </>
        ) : (
          <>
            {buttonText}
            {showIcon && <ChevronRight size={16} className="ml-1" />}
          </>
        )}
      </Button>
      
      {/* Membership Required Dialog */}
      <Dialog open={isMembershipDialogOpen} onOpenChange={setIsMembershipDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Membership Required</DialogTitle>
            <DialogDescription>
              You need an active membership to join yoga classes. Would you like to get a membership now?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm font-medium">
              Benefits of membership:
            </p>
            <ul className="list-disc pl-5 text-sm pt-2">
              <li>Access to all live yoga classes</li>
              <li>Recordings of past sessions</li>
              <li>Personal guidance from instructors</li>
              <li>Monthly progress tracking</li>
            </ul>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsMembershipDialogOpen(false)}
            >
              Later
            </Button>
            <Button
              className="bg-yoga-blue hover:bg-yoga-blue/90"
              onClick={() => {
                setIsMembershipDialogOpen(false);
                navigate('/pricing');
              }}
            >
              View Plans
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Class Join Prompt */}
      <ClassJoinPrompt
        isOpen={isJoinPromptOpen}
        onClose={() => setIsJoinPromptOpen(false)}
        classDate={yogaClass.date}
        className={yogaClass.name}
        joinLink={yogaClass.joinLink}
      />
    </>
  );
};

export default JoinClassButton; 