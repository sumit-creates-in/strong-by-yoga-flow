
import React from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CreditTransaction, useTeachers } from '@/contexts/TeacherContext';
import { Coins, ArrowDown, ArrowUp, RefreshCw } from 'lucide-react';

interface CreditHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreditHistoryModal: React.FC<CreditHistoryModalProps> = ({ open, onOpenChange }) => {
  const { creditTransactions, userCredits } = useTeachers();
  
  // Sort transactions by date (newest first)
  const sortedTransactions = creditTransactions && creditTransactions.length > 0
    ? [...creditTransactions].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    : [];
  
  const getTransactionIcon = (transaction: CreditTransaction) => {
    switch (transaction.type) {
      case 'purchase':
        return <ArrowUp className="h-4 w-4 text-green-500" />;
      case 'usage':
        return <ArrowDown className="h-4 w-4 text-amber-500" />;
      case 'refund':
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
      default:
        return <Coins className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTransactionClass = (transaction: CreditTransaction) => {
    switch (transaction.type) {
      case 'purchase':
        return 'text-green-600';
      case 'usage':
        return 'text-amber-600';
      case 'refund':
        return 'text-blue-600';
      default:
        return '';
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-amber-500" />
            Credit History
          </DialogTitle>
          <DialogDescription>
            Your credit transactions and current balance
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="bg-indigo-50 p-4 rounded-lg mb-6">
            <div className="flex items-center justify-between">
              <span className="text-indigo-700 font-medium">Current Balance:</span>
              <div className="bg-white px-3 py-1 rounded-lg border shadow-sm">
                <span className="text-xl font-bold text-indigo-600">{userCredits} Credits</span>
              </div>
            </div>
          </div>
          
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTransactions.length > 0 ? (
                  sortedTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium capitalize">
                        <div className="flex items-center gap-1.5">
                          {getTransactionIcon(transaction)}
                          <span>{transaction.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>{format(new Date(transaction.date), 'MMM d, yyyy')}</TableCell>
                      <TableCell className={`text-right ${getTransactionClass(transaction)} font-medium`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreditHistoryModal;
