
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CreditCard, Coins } from 'lucide-react';
import { useTeachers } from '@/contexts/TeacherContext';

interface LowCreditsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requiredCredits: number;
  onProceed?: () => void;
}

const LowCreditsDialog: React.FC<LowCreditsDialogProps> = ({
  open,
  onOpenChange,
  requiredCredits,
  onProceed
}) => {
  const navigate = useNavigate();
  const { userCredits } = useTeachers();
  const creditsNeeded = requiredCredits - (userCredits || 0);
  
  const goToPricing = () => {
    navigate('/pricing');
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-amber-500" />
            Low Credit Balance
          </DialogTitle>
          <DialogDescription>
            You don't have enough credits to book this session.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6">
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-md">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-700 font-medium">Your current balance:</span>
                <span className="font-bold">{userCredits || 0} credits</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">Required for this session:</span>
                <span className="font-bold">{requiredCredits} credits</span>
              </div>
              <div className="mt-4 pt-4 border-t border-amber-200 flex items-center justify-between">
                <span className="text-gray-700 font-medium">Credits needed:</span>
                <span className="font-bold text-red-600">{creditsNeeded} more</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <p className="text-sm text-gray-600">
                You'll need to purchase {creditsNeeded} more credits to book this session.
              </p>
              <p className="text-sm text-gray-600">
                Would you like to purchase more credits now?
              </p>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {creditsNeeded <= 0 && onProceed && (
            <Button onClick={onProceed}>
              Proceed Anyway
            </Button>
          )}
          <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={goToPricing}>
            <CreditCard className="mr-2 h-4 w-4" />
            Purchase Credits
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LowCreditsDialog;
