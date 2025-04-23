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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, fetchAllUsers } from '@/integrations/supabase/client';
import { useTeachers } from '@/contexts/TeacherContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

interface AppUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: 'admin' | 'user' | 'teacher';
  status: 'active' | 'inactive';
  joinedDate: string;
}

interface UserDialogProps {
  user: AppUser | null;
  isOpen: boolean;
  onClose: () => void;
  mode: 'view' | 'edit';
  onSave?: (userData: Partial<AppUser>) => void;
}

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
  
  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ ...prev, role: value as 'admin' | 'user' | 'teacher' }));
  };
  
  const handleSave = () => {
    if (onSave && user) {
      onSave({
        ...user,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role as 'admin' | 'user' | 'teacher'
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
            {mode === 'view' ? (
              <Input 
                id="role" 
                name="role" 
                value={formData.role} 
                readOnly 
              />
            ) : (
              <Select 
                value={formData.role} 
                onValueChange={handleRoleChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                </SelectContent>
              </Select>
            )}
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
      // Use the correct admin API endpoint with service role key
      const { data, error: updateError } = await supabase.functions.invoke('admin-reset-password', {
        body: {
          userId: userId,
          newPassword: newPassword
        }
      });
      
      if (updateError) throw updateError;
      
      toast({
        title: "Password updated",
        description: "The user's password has been successfully updated."
      });
      
      onClose();
      setNewPassword(''); // Clear the password field
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast({
        variant: 'destructive',
        title: "Error",
        description: error.message || "Failed to reset password. Please try again."
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
              placeholder="Enter new password"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => {
            onClose();
            setNewPassword(''); // Clear password on cancel
          }}>
            Cancel
          </Button>
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
      const startDate = new Date();
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + parseInt(duration, 10));
      
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
    } catch (error: any) {
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

const AddCreditsDialog: React.FC<{isOpen: boolean; onClose: () => void; userId: string}> = ({ isOpen, onClose, userId }) => {
  const [creditAmount, setCreditAmount] = useState<number>(10);
  const [reason, setReason] = useState<string>('Admin adjustment');
  const { toast } = useToast();
  const { userCredits, creditTransactions } = useTeachers();
  
  const handleAddCredits = async () => {
    try {
      const newTransaction = {
        id: Date.now().toString(),
        type: 'admin' as const,
        amount: creditAmount,
        description: reason,
        date: new Date().toISOString(),
        userId: userId
      };
      
      const userSpecificKey = `creditTransactions_${userId}`;
      const existingTransactions = localStorage.getItem(userSpecificKey);
      const transactions = existingTransactions ? JSON.parse(existingTransactions) : [];
      transactions.push(newTransaction);
      localStorage.setItem(userSpecificKey, JSON.stringify(transactions));
      
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
    } catch (error: any) {
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

const CreditTransactionsDialog: React.FC<{isOpen: boolean; onClose: () => void; userId: string}> = ({ isOpen, onClose, userId }) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [userCreditBalance, setUserCreditBalance] = useState<number>(0);
  
  useEffect(() => {
    const userSpecificKey = `creditTransactions_${userId}`;
    const existingTransactions = localStorage.getItem(userSpecificKey);
    const userTransactions = existingTransactions ? JSON.parse(existingTransactions) : [];
    setTransactions(userTransactions);
    
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

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      console.log('Starting to fetch users...');
      try {
        const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
        
        if (!authError && authData?.users) {
          console.log(`Found ${authData.users.length} users in auth.users`);
          
          // Fetch profiles with email information
          const { data: profiles } = await supabase
            .from('profiles')
            .select('*, auth_email:email');
          
          const profilesMap = new Map();
          if (profiles) {
            profiles.forEach((profile: any) => {
              profilesMap.set(profile.id, profile);
            });
          }
          
          const mappedUsers: AppUser[] = authData.users.map(authUser => {
            const profile = profilesMap.get(authUser.id);
            const firstName = profile?.first_name || authUser.user_metadata?.first_name || '';
            const lastName = profile?.last_name || authUser.user_metadata?.last_name || '';
            const fullName = `${firstName} ${lastName}`.trim();
            
            // Prioritize email from profiles table
            const email = profile?.auth_email || authUser.email || '';
            
            // Check if user role is explicitly set in metadata
            let userRole: 'admin' | 'user' | 'teacher' = 'user';
            if (authUser.user_metadata?.role === 'admin') {
              userRole = 'admin';
            } else if (authUser.user_metadata?.role === 'teacher') {
              userRole = 'teacher';
            } else if (email === 'admin@strongbyyoga.com' || email === 'sumit_204@yahoo.com') {
              userRole = 'admin';
            }
            
            return {
              id: authUser.id,
              name: fullName || email.split('@')[0] || 'Unknown User',
              email: email,
              phone: profile?.phone || authUser.phone || null,
              role: userRole,
              status: authUser.banned ? 'inactive' as const : 'active' as const,
              joinedDate: authUser.created_at
            };
          });
          
          console.log('Setting users from auth API:', mappedUsers.length);
          setUsers(mappedUsers);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.log('Admin API access failed, falling back to profiles:', err);
      }
      
      // Fetch profiles with email information
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*, auth_email:email');
      
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }
      
      if (!profiles || profiles.length === 0) {
        console.log('No profiles found in the database');
        setUsers([]);
        setIsLoading(false);
        return;
      }
      
      console.log(`Found ${profiles.length} users in profiles table`);
      
      const mappedUsers: AppUser[] = profiles.map((profile: any) => {
        // Use email from profiles table
        const email = profile.auth_email || '';
        
        const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
        
        // Determine user role
        let userRole: 'admin' | 'user' | 'teacher' = 'user';
        
        if (email === 'admin@strongbyyoga.com' || email === 'sumit_204@yahoo.com') {
          userRole = 'admin';
        } else if (profile.is_teacher) {
          userRole = 'teacher';
        } else if (profile.is_admin) {
          userRole = 'admin';
        }
        
        return {
          id: profile.id,
          name: fullName || email.split('@')[0] || 'Unknown User',
          email: email,
          phone: profile.phone || null,
          role: userRole,
          status: 'active' as const,
          joinedDate: profile.created_at || new Date().toISOString()
        };
      });
      
      console.log('Setting users from profiles:', mappedUsers.length);
      setUsers(mappedUsers);
    } catch (error: any) {
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

  useEffect(() => {
    console.log('AdminUsers component mounted, fetching users...');
    fetchUsers();
  }, []);

  const handleViewProfile = (user: AppUser) => {
    setSelectedUser(user);
    setIsViewProfileOpen(true);
  };

  const handleEditUser = (user: AppUser) => {
    setSelectedUser(user);
    setIsEditUserOpen(true);
  };

  const handleUpdateUser = async (userData: Partial<AppUser>) => {
    try {
      if (!userData.id) return;

      const nameParts = userData.name?.split(' ') || [];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Update profile information
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
        })
        .eq('id', userData.id);

      if (profileError) throw profileError;

      // Update user role if it has changed
      if (userData.role && selectedUser?.role !== userData.role) {
        const { error: roleError } = await supabase.auth.admin.updateUserById(
          userData.id,
          { user_metadata: { role: userData.role } }
        );
        
        if (roleError) throw roleError;
      }

      toast({
        title: "User updated",
        description: "User information has been successfully updated."
      });

      fetchUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update user. Please try again.'
      });
    }
  };

  const handleDeleteUser = (user: AppUser) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (selectedUser) {
      try {
        setIsLoading(true);
        
        // First try to delete the user from the auth system
        const { error: authError } = await supabase.auth.admin.deleteUser(
          selectedUser.id
        );

        if (authError) {
          console.error('Error deleting user from auth system:', authError);
          // If auth deletion fails, we'll still try to clean up the profile
        }

        // Then delete from profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', selectedUser.id);

        if (profileError && !authError) {
          // Only throw if we haven't already had an auth error
          console.error('Error deleting user profile:', profileError);
          throw profileError;
        }

        if (authError && profileError) {
          // Both operations failed
          throw new Error('Failed to delete user from both auth system and profiles');
        }

        toast({
          title: "User deleted",
          description: "User has been successfully deleted from the system."
        });

        // Remove user from local state to update UI immediately
        setUsers(prev => prev.filter(user => user.id !== selectedUser.id));
      } catch (error: any) {
        console.error('Error deleting user:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'Failed to delete user. Please try again.'
        });
      } finally {
        setIsLoading(false);
        setIsDeleteDialogOpen(false);
      }
    }
  };

  const handleStatusChange = async (userId: string, newStatus: 'active' | 'inactive') => {
    try {
      if (newStatus === 'inactive') {
        const { error } = await supabase.auth.admin.updateUserById(
          userId,
          { user_metadata: { banned: true } }
        );
        
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.admin.updateUserById(
          userId,
          { user_metadata: { banned: false } }
        );
        
        if (error) throw error;
      }
      
      setUsers(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, status: newStatus } 
            : user
        )
      );
      
      toast({
        title: 'Success',
        description: `User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error: any) {
      console.error('Error updating user status:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update user status',
      });
    }
  };

  const handleResetPassword = (user: AppUser) => {
    setSelectedUser(user);
    setIsResetPasswordOpen(true);
  };

  const handleAddMembership = (user: AppUser) => {
    setSelectedUser(user);
    setIsAddMembershipOpen(true);
  };

  const handleAddUser = () => {
    toast({
      title: "Add user",
      description: "This would open a form to add a new user."
    });
  };

  const handleViewBookings = (user: AppUser) => {
    setSelectedUser(user);
    setIsViewBookingsOpen(true);
  };

  const handleAddCredits = (user: AppUser) => {
    setSelectedUser(user);
    setIsAddCreditsOpen(true);
  };

  const handleViewCredits = (user: AppUser) => {
    setSelectedUser(user);
    setIsViewCreditsOpen(true);
  };

  const handleChangeRole = async (user: AppUser, newRole: 'admin' | 'user' | 'teacher') => {
    try {
      // Update user role in Supabase auth metadata
      const { error } = await supabase.auth.admin.updateUserById(
        user.id,
        { user_metadata: { role: newRole } }
      );
      
      if (error) throw error;
      
      // Update local state
      setUsers(prev => 
        prev.map(u => 
          u.id === user.id 
            ? { ...u, role: newRole } 
            : u
        )
      );
      
      toast({
        title: 'Success',
        description: `User role changed to ${newRole} successfully`,
      });
    } catch (error: any) {
      console.error('Error changing user role:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to change user role',
      });
    }
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
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            No users found
                          </TableCell>
                        </TableRow>
                      ) : (
                        users.map((user) => (
                          <TableRow 
                            key={user.id} 
                            className="hover:bg-yoga-light-yellow/20"
                          >
                            <TableCell>
                              <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-yoga-light-blue flex items-center justify-center text-yoga-blue font-medium mr-3">
                                  {user.name ? user.name[0].toUpperCase() : 'U'}
                                </div>
                                <span>{user.name || 'Unknown User'}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Mail size={16} className="mr-2 text-gray-600" />
                                {user.email || 'No email'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Phone size={16} className="mr-2 text-gray-600" />
                                {user.phone || 'Not provided'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.role === 'admin' ? 'bg-yoga-yellow text-gray-800' :
                                user.role === 'teacher' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {user.role}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {user.status}
                              </span>
                            </TableCell>
                            <TableCell>
                              {new Date(user.joinedDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical size={18} />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleViewProfile(user)}>View Profile</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEditUser(user)}>Edit User</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {user.role !== 'admin' && (
                                    <DropdownMenuItem onClick={() => handleChangeRole(user, 'admin')} className="text-blue-600">
                                      Make Admin
                                    </DropdownMenuItem>
                                  )}
                                  {user.role !== 'teacher' && (
                                    <DropdownMenuItem onClick={() => handleChangeRole(user, 'teacher')} className="text-green-600">
                                      Make Teacher
                                    </DropdownMenuItem>
                                  )}
                                  {user.role !== 'user' && (
                                    <DropdownMenuItem onClick={() => handleChangeRole(user, 'user')} className="text-gray-600">
                                      Make User
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleAddMembership(user)}>Add Membership</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleAddCredits(user)}>Add Credits</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleViewCredits(user)}>View Credits</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleViewBookings(user)}>View Bookings</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleResetPassword(user)}>
                                    <Lock className="mr-2 h-4 w-4" />
                                    Reset Password
                                  </DropdownMenuItem>
                                  {user.status === 'active' ? (
                                    <DropdownMenuItem onClick={() => handleStatusChange(user.id, 'inactive')} className="text-yellow-600">
                                      Suspend User
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem onClick={() => handleStatusChange(user.id, 'active')} className="text-green-600">
                                      Activate User
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleDeleteUser(user)} className="text-red-600">
                                    Delete User
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
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
