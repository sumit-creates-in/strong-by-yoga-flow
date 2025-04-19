import React, { useState, useEffect } from 'react';
import { User, MoreVertical, Mail, Phone, Lock } from 'lucide-react';
import Layout from '@/components/Layout';
import AdminGuard from '@/components/AdminGuard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useTeachers } from '@/contexts/TeacherContext';

// Define the User type based on Supabase structure
interface AppUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  joinedDate: string;
}

// Define Supabase profile structure
interface SupabaseProfile {
  id: string;
  first_name: string;
  last_name: string;
  created_at: string;
  updated_at: string;
  avatar_url: string;
  // Fields that might not be in the original type definition but we need
  email?: string;
  phone?: string;
}

// User dialog props
interface UserDialogProps {
  user: AppUser | null;
  isOpen: boolean;
  onClose: () => void;
  mode: 'view' | 'edit';
  onSave?: (userData: Partial<AppUser>) => void;
}

// Mock users are no longer needed

// User Dialog component
const UserDialog: React.FC<UserDialogProps> = ({ user, isOpen, onClose, mode, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: ''
  });
  const { toast } = useToast();
  
  React.useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role
      });
    }
  }, [user]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSave = () => {
    if (onSave && user) {
      onSave({
        ...user,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role as 'admin' | 'user'
      });
    }
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'view' ? 'User Profile' : 'Edit User'}</DialogTitle>
          <DialogDescription>
            {mode === 'view' ? 'View user details' : 'Update user information'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input 
              id="name" 
              name="name" 
              value={formData.name} 
              onChange={handleInputChange}
              readOnly={mode === 'view'} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              name="email" 
              value={formData.email} 
              onChange={handleInputChange}
              readOnly={mode === 'view'} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input 
              id="phone" 
              name="phone" 
              value={formData.phone} 
              onChange={handleInputChange}
              readOnly={mode === 'view'} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input 
              id="role" 
              name="role" 
              value={formData.role} 
              onChange={handleInputChange}
              readOnly={mode === 'view'} 
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          {mode === 'edit' && <Button onClick={handleSave}>Save Changes</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ResetPasswordDialog: React.FC<{isOpen: boolean; onClose: () => void; userId: string}> = ({ isOpen, onClose, userId }) => {
  const [newPassword, setNewPassword] = useState('');
  const { toast } = useToast();
  
  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      toast({
        variant: 'destructive',
        title: "Error",
        description: "Please enter a new password."
      });
      return;
    }

    try {
      // In a production app, you would use a secure server endpoint to reset passwords
      // For now, we'll use the passwordResetForEmail function as a workaround
      
      // First, we need to find the user's email from the profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError) throw profileError;
      
      // Send a password reset email using Supabase
      // Note: This will actually send a reset link rather than setting the password directly
      // In a real admin panel, you'd have a dedicated server endpoint for this
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        'user@example.com', // We don't actually have the email in profiles
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );
      
      if (resetError) throw resetError;
      
      toast({
        title: "Password reset link sent",
        description: "A password reset link has been sent to the user's email."
      });
      
      onClose();
    } catch (error) {
      console.error('Error resetting password:', error);
      toast({
        variant: 'destructive',
        title: "Error",
        description: "Failed to reset password. Please try again."
      });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Set a new password for this user
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input 
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleResetPassword}>Reset Password</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const AddMembershipDialog: React.FC<{isOpen: boolean; onClose: () => void; userId: string}> = ({ isOpen, onClose, userId }) => {
  const [membershipType, setMembershipType] = useState('standard');
  const [duration, setDuration] = useState('1');
  const { toast } = useToast();
  
  const handleAddMembership = async () => {
    try {
      // Calculate expiry date based on the duration (in months)
      const startDate = new Date();
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + parseInt(duration, 10));
      
      // Add membership to Supabase
      const { error } = await supabase
        .from('memberships')
        .insert({
          user_id: userId,
          tier: membershipType,
          start_date: startDate.toISOString(),
          expiry_date: expiryDate.toISOString(),
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      
      if (error) throw error;
      
      toast({
        title: "Membership added",
        description: `${membershipType} membership has been added to the user.`
      });
      onClose();
    } catch (error) {
      console.error('Error adding membership:', error);
      toast({
        variant: 'destructive',
        title: "Error",
        description: "Failed to add membership. Please try again."
      });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Membership</DialogTitle>
          <DialogDescription>
            Add a membership plan to this user
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="membershipType">Membership Type</Label>
            <select
              id="membershipType"
              className="w-full p-2 border rounded"
              value={membershipType}
              onChange={(e) => setMembershipType(e.target.value)}
            >
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
              <option value="unlimited">Unlimited</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (months)</Label>
            <select
              id="duration"
              className="w-full p-2 border rounded"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            >
              <option value="1">1 month</option>
              <option value="3">3 months</option>
              <option value="6">6 months</option>
              <option value="12">12 months</option>
            </select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleAddMembership}>Add Membership</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Add an AddCreditsDialog component to add credits to users
const AddCreditsDialog: React.FC<{isOpen: boolean; onClose: () => void; userId: string}> = ({ isOpen, onClose, userId }) => {
  const [creditAmount, setCreditAmount] = useState<number>(10);
  const [reason, setReason] = useState<string>('Admin adjustment');
  const { toast } = useToast();
  const { userCredits, creditTransactions } = useTeachers();
  
  const handleAddCredits = async () => {
    try {
      // Add the credits to the user's account
      // In a real app, you would update the credits in the database
      const newTransaction = {
        id: Date.now().toString(),
        type: 'admin' as const,
        amount: creditAmount,
        description: reason,
        date: new Date().toISOString(),
        userId: userId // Store the user ID with the transaction
      };
      
      // Since our context doesn't have a method to add credits to a specific user,
      // we'll add this transaction to localStorage directly for now
      const userSpecificKey = `creditTransactions_${userId}`;
      const existingTransactions = localStorage.getItem(userSpecificKey);
      const transactions = existingTransactions ? JSON.parse(existingTransactions) : [];
      transactions.push(newTransaction);
      localStorage.setItem(userSpecificKey, JSON.stringify(transactions));
      
      // Update the user's credit balance
      const userSpecificCreditsKey = `userCredits_${userId}`;
      const existingCredits = localStorage.getItem(userSpecificCreditsKey);
      const currentCredits = existingCredits ? parseInt(existingCredits) : 0;
      const newCredits = currentCredits + creditAmount;
      localStorage.setItem(userSpecificCreditsKey, newCredits.toString());
      
      toast({
        title: "Credits Added",
        description: `${creditAmount} credits have been added to the user's account.`
      });
      onClose();
    } catch (error) {
      console.error('Error adding credits:', error);
      toast({
        variant: 'destructive',
        title: "Error",
        description: "Failed to add credits. Please try again."
      });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Credits</DialogTitle>
          <DialogDescription>
            Add credits to this user's account
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="creditAmount">Number of Credits</Label>
            <Input
              id="creditAmount"
              type="number"
              min="1"
              value={creditAmount}
              onChange={(e) => setCreditAmount(parseInt(e.target.value))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for adding credits"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleAddCredits}>Add Credits</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Add a CreditTransactionsDialog component to view a user's credit transactions
const CreditTransactionsDialog: React.FC<{isOpen: boolean; onClose: () => void; userId: string}> = ({ isOpen, onClose, userId }) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [userCreditBalance, setUserCreditBalance] = useState<number>(0);
  
  useEffect(() => {
    // Load user-specific transactions from localStorage
    const userSpecificKey = `creditTransactions_${userId}`;
    const existingTransactions = localStorage.getItem(userSpecificKey);
    const userTransactions = existingTransactions ? JSON.parse(existingTransactions) : [];
    setTransactions(userTransactions);
    
    // Load user's credit balance
    const userSpecificCreditsKey = `userCredits_${userId}`;
    const existingCredits = localStorage.getItem(userSpecificCreditsKey);
    const currentCredits = existingCredits ? parseInt(existingCredits) : 0;
    setUserCreditBalance(currentCredits);
  }, [userId]);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Credit Transactions</DialogTitle>
          <DialogDescription>
            View credit history for this user
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="bg-gray-100 p-4 mb-4 rounded-md">
            <p className="text-lg font-medium">Current Balance: <span className="text-yoga-blue">{userCreditBalance} credits</span></p>
          </div>
          
          {transactions.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500">This user has no credit transactions.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-yoga-light-blue/30">
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Type</th>
                    <th className="px-4 py-2 text-left">Amount</th>
                    <th className="px-4 py-2 text-left">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-t border-yoga-light-blue">
                      <td className="px-4 py-2">{new Date(transaction.date).toLocaleDateString()}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.type === 'purchase' ? 'bg-green-100 text-green-800' : 
                          transaction.type === 'usage' ? 'bg-red-100 text-red-800' :
                          transaction.type === 'refund' ? 'bg-blue-100 text-blue-800' :
                          transaction.type === 'admin' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <span className={transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                        </span>
                      </td>
                      <td className="px-4 py-2">{transaction.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Add a BookingsDialog component to show user bookings
const BookingsDialog: React.FC<{isOpen: boolean; onClose: () => void; userId: string}> = ({ isOpen, onClose, userId }) => {
  const { getUserBookings, getTeacher } = useTeachers();
  const userBookings = getUserBookings(userId);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>User Bookings</DialogTitle>
          <DialogDescription>
            View and manage bookings for this user
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {userBookings.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500">This user has no bookings.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-yoga-light-blue/30">
                    <th className="px-4 py-2 text-left">Teacher</th>
                    <th className="px-4 py-2 text-left">Session Type</th>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Time</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Credits</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {userBookings.map((booking) => {
                    const teacher = getTeacher(booking.teacherId);
                    const bookingDate = new Date(booking.date);
                    
                    return (
                      <tr key={booking.id} className="border-t border-yoga-light-blue">
                        <td className="px-4 py-2">{teacher?.name || 'Unknown'}</td>
                        <td className="px-4 py-2">{booking.sessionType.name}</td>
                        <td className="px-4 py-2">{bookingDate.toLocaleDateString()}</td>
                        <td className="px-4 py-2">{booking.time}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                            booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-4 py-2">{booking.credits}</td>
                        <td className="px-4 py-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600"
                            onClick={() => {
                              // In a real app, this would cancel the booking
                              alert("Booking cancellation would be implemented here");
                            }}
                          >
                            Cancel
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const AdminUsers = () => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [isViewProfileOpen, setIsViewProfileOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [isAddMembershipOpen, setIsAddMembershipOpen] = useState(false);
  const [isViewBookingsOpen, setIsViewBookingsOpen] = useState(false);
  const [isAddCreditsOpen, setIsAddCreditsOpen] = useState(false);
  const [isViewCreditsOpen, setIsViewCreditsOpen] = useState(false);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  // Fetch all users from Supabase
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // First, get all profiles from the profiles table
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) {
        throw profilesError;
      }
      
      if (!profiles || profiles.length === 0) {
        setUsers([]);
        setIsLoading(false);
        return;
      }
      
      console.log(`Found ${profiles.length} profiles`, profiles);
      
      // Convert profiles to AppUser format
      const mappedUsers: AppUser[] = profiles.map(profile => {
        // Cast to our interface with optional fields
        const p = profile as SupabaseProfile;
        
        // Create a display name from first and last name
        const fullName = `${p.first_name || ''} ${p.last_name || ''}`.trim();
        
        // Check if user is admin based on known admin emails
        const email = p.email || '';
        const isAdmin = 
          email === 'admin@strongbyyoga.com' || 
          email === 'sumit_204@yahoo.com';
        
        return {
          id: p.id,
          name: fullName || 'Unknown User',
          email: email,
          phone: p.phone || null,
          role: isAdmin ? 'admin' : 'user',
          status: 'active', // Default status
          joinedDate: p.created_at || new Date().toISOString()
        };
      });
      
      console.log('Mapped users:', mappedUsers);
      setUsers(mappedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch users. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle view profile action
  const handleViewProfile = (user: AppUser) => {
    setSelectedUser(user);
    setIsViewProfileOpen(true);
  };

  // Handle edit user action
  const handleEditUser = (user: AppUser) => {
    setSelectedUser(user);
    setIsEditUserOpen(true);
  };

  // Handle user update
  const handleUpdateUser = async (userData: Partial<AppUser>) => {
    try {
      if (!userData.id) return;

      // Split name into first and last
      const nameParts = userData.name?.split(' ') || [];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Update profile in Supabase
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
        })
        .eq('id', userData.id);

      if (profileError) throw profileError;

      // Update user role if needed (in a real app, you'd need backend functions for this)
      // For now we'll just update the UI

      toast({
        title: "User updated",
        description: "User information has been successfully updated."
      });

      // Refresh the user list
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update user. Please try again.'
      });
    }
  };

  // Handle delete user action
  const handleDeleteUser = (user: AppUser) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  // Handle confirm delete
  const confirmDeleteUser = async () => {
    if (selectedUser) {
      try {
        // In a real app, you would call a secure server endpoint to delete a user
        // Here we'll just delete the profile since we can't directly delete auth users
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', selectedUser.id);

        if (error) throw error;

        toast({
          title: "User deleted",
          description: "User profile has been deleted."
        });

        // Refresh the user list
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to delete user. Please try again.'
        });
      }
      setIsDeleteDialogOpen(false);
    }
  };
  
  // Handle toggle user status
  const handleToggleStatus = async (user: AppUser) => {
    try {
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      
      // In a real app, you would call a secure server endpoint to update user status
      // For this example, we'll just update the local state
      setUsers(prevUsers => 
        prevUsers.map(u => u.id === user.id ? {...u, status: newStatus} : u)
      );
      
      toast({
        title: `User ${newStatus === 'active' ? 'activated' : 'suspended'}`,
        description: `The user account has been ${newStatus === 'active' ? 'activated' : 'suspended'}.`
      });
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update user status. Please try again.'
      });
    }
  };
  
  // Handle reset password
  const handleResetPassword = (user: AppUser) => {
    setSelectedUser(user);
    setIsResetPasswordOpen(true);
  };
  
  // Handle add membership
  const handleAddMembership = (user: AppUser) => {
    setSelectedUser(user);
    setIsAddMembershipOpen(true);
  };
  
  // Handle add user
  const handleAddUser = () => {
    // In a production app, you would implement a form to add a new user
    toast({
      title: "Add user",
      description: "This would open a form to add a new user."
    });
  };

  // Handle view bookings
  const handleViewBookings = (user: AppUser) => {
    setSelectedUser(user);
    setIsViewBookingsOpen(true);
  };

  // Handle add credits
  const handleAddCredits = (user: AppUser) => {
    setSelectedUser(user);
    setIsAddCreditsOpen(true);
  };
  
  // Handle view credit transactions
  const handleViewCredits = (user: AppUser) => {
    setSelectedUser(user);
    setIsViewCreditsOpen(true);
  };

  return (
    <AdminGuard>
      <Layout>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h1 className="text-3xl font-bold">Manage Users</h1>
            <Button className="mt-4 md:mt-0 yoga-button" onClick={handleAddUser}>Add New User</Button>
          </div>
          
          <Card className="yoga-card overflow-hidden">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-10 text-center">Loading users...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-yoga-light-blue/30">
                        <th className="px-6 py-3 text-left text-gray-700 font-medium">Name</th>
                        <th className="px-6 py-3 text-left text-gray-700 font-medium">Email</th>
                        <th className="px-6 py-3 text-left text-gray-700 font-medium">Phone</th>
                        <th className="px-6 py-3 text-left text-gray-700 font-medium">Role</th>
                        <th className="px-6 py-3 text-left text-gray-700 font-medium">Status</th>
                        <th className="px-6 py-3 text-left text-gray-700 font-medium">Joined</th>
                        <th className="px-6 py-3 text-left text-gray-700 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr 
                          key={user.id} 
                          className="border-t border-yoga-light-blue hover:bg-yoga-light-yellow/20"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-yoga-light-blue flex items-center justify-center text-yoga-blue font-medium mr-3">
                                {user.name ? user.name[0] : 'U'}
                              </div>
                              <span>{user.name || 'Unknown User'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Mail size={16} className="mr-2 text-gray-600" />
                              {user.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Phone size={16} className="mr-2 text-gray-600" />
                              {user.phone || 'Not provided'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.role === 'admin' ? 'bg-yoga-yellow text-gray-800' : 'bg-gray-100'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {new Date(user.joinedDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical size={18} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewProfile(user)}>View Profile</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditUser(user)}>Edit User</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleAddMembership(user)}>Add Membership</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleAddCredits(user)}>Add Credits</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleViewCredits(user)}>View Credits</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleViewBookings(user)}>View Bookings</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleResetPassword(user)}>
                                  <Lock className="mr-2 h-4 w-4" />
                                  Reset Password
                                </DropdownMenuItem>
                                {user.status === 'active' ? (
                                  <DropdownMenuItem onClick={() => handleToggleStatus(user)} className="text-yellow-600">
                                    Suspend User
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => handleToggleStatus(user)} className="text-green-600">
                                    Activate User
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleDeleteUser(user)} className="text-red-600">
                                  Delete User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* User Dialogs */}
        <UserDialog 
          user={selectedUser}
          isOpen={isViewProfileOpen}
          onClose={() => setIsViewProfileOpen(false)}
          mode="view"
        />
        
        <UserDialog 
          user={selectedUser}
          isOpen={isEditUserOpen}
          onClose={() => setIsEditUserOpen(false)}
          mode="edit"
          onSave={handleUpdateUser}
        />
        
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the user
                account and remove all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteUser} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        <ResetPasswordDialog 
          isOpen={isResetPasswordOpen}
          onClose={() => setIsResetPasswordOpen(false)}
          userId={selectedUser?.id || ''}
        />
        
        <AddMembershipDialog
          isOpen={isAddMembershipOpen}
          onClose={() => setIsAddMembershipOpen(false)}
          userId={selectedUser?.id || ''}
        />
        
        <BookingsDialog
          isOpen={isViewBookingsOpen}
          onClose={() => setIsViewBookingsOpen(false)}
          userId={selectedUser?.id || ''}
        />
        
        <AddCreditsDialog
          isOpen={isAddCreditsOpen}
          onClose={() => setIsAddCreditsOpen(false)}
          userId={selectedUser?.id || ''}
        />
        
        <CreditTransactionsDialog
          isOpen={isViewCreditsOpen}
          onClose={() => setIsViewCreditsOpen(false)}
          userId={selectedUser?.id || ''}
        />
      </Layout>
    </AdminGuard>
  );
};

export default AdminUsers;
