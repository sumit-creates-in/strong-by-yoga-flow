
import React, { useState } from 'react';
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

const mockUsers = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@strongbyyoga.com',
    phone: '123-456-7890',
    role: 'admin',
    status: 'active',
    joinedDate: '2024-12-15',
  },
  {
    id: '2',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '987-654-3210',
    role: 'user',
    status: 'active',
    joinedDate: '2025-01-10',
  },
  {
    id: '3',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '555-123-4567',
    role: 'user',
    status: 'active',
    joinedDate: '2025-01-15',
  },
  {
    id: '4',
    name: 'Robert Johnson',
    email: 'robert@example.com',
    phone: '222-333-4444',
    role: 'user',
    status: 'inactive',
    joinedDate: '2025-02-05',
  },
  {
    id: '5',
    name: 'Emily Wilson',
    email: 'emily@example.com',
    phone: '111-222-3333',
    role: 'user',
    status: 'active',
    joinedDate: '2025-02-20',
  },
];

interface UserDialogProps {
  user: typeof mockUsers[0] | null;
  isOpen: boolean;
  onClose: () => void;
  mode: 'view' | 'edit';
}

const UserDialog: React.FC<UserDialogProps> = ({ user, isOpen, onClose, mode }) => {
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
        phone: user.phone,
        role: user.role
      });
    }
  }, [user]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSave = () => {
    // In a real app, this would update the user data in the database
    toast({
      title: "User updated",
      description: "User information has been successfully updated."
    });
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
  
  const handleResetPassword = () => {
    // In a real app, this would call an API to reset the password
    toast({
      title: "Password reset",
      description: "The user's password has been reset successfully."
    });
    onClose();
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
  const [membershipType, setMembershipType] = useState('');
  const [duration, setDuration] = useState('1');
  const { toast } = useToast();
  
  const handleAddMembership = () => {
    toast({
      title: "Membership added",
      description: `${membershipType} membership has been added to the user.`
    });
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Membership</DialogTitle>
          <DialogDescription>
            Add a group class membership to this user
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="membershipType">Membership Type</Label>
            <select
              id="membershipType"
              className="w-full p-2 border border-gray-300 rounded"
              value={membershipType}
              onChange={(e) => setMembershipType(e.target.value)}
            >
              <option value="">Select a membership</option>
              <option value="Basic">Basic (2 classes/week)</option>
              <option value="Standard">Standard (4 classes/week)</option>
              <option value="Premium">Premium (Unlimited classes)</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (months)</Label>
            <select
              id="duration"
              className="w-full p-2 border border-gray-300 rounded"
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

const AdminUsers = () => {
  const [users, setUsers] = useState(mockUsers);
  const [selectedUser, setSelectedUser] = useState<typeof mockUsers[0] | null>(null);
  const [isViewProfileOpen, setIsViewProfileOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [isAddMembershipOpen, setIsAddMembershipOpen] = useState(false);
  const { toast } = useToast();
  
  const handleViewProfile = (user: typeof mockUsers[0]) => {
    setSelectedUser(user);
    setIsViewProfileOpen(true);
  };
  
  const handleEditUser = (user: typeof mockUsers[0]) => {
    setSelectedUser(user);
    setIsEditUserOpen(true);
  };
  
  const handleDeleteUser = (user: typeof mockUsers[0]) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDeleteUser = () => {
    if (selectedUser) {
      setUsers(users.filter(user => user.id !== selectedUser.id));
      toast({
        title: "User deleted",
        description: "User has been successfully deleted."
      });
      setIsDeleteDialogOpen(false);
    }
  };
  
  const handleToggleStatus = (user: typeof mockUsers[0]) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    setUsers(users.map(u => 
      u.id === user.id ? { ...u, status: newStatus } : u
    ));
    
    toast({
      title: `User ${newStatus === 'active' ? 'activated' : 'suspended'}`,
      description: `The user account has been ${newStatus === 'active' ? 'activated' : 'suspended'}.`
    });
  };
  
  const handleResetPassword = (user: typeof mockUsers[0]) => {
    setSelectedUser(user);
    setIsResetPasswordOpen(true);
  };
  
  const handleAddMembership = (user: typeof mockUsers[0]) => {
    setSelectedUser(user);
    setIsAddMembershipOpen(true);
  };
  
  const handleAddUser = () => {
    // In a real app, this would open a form to add a new user
    toast({
      title: "Add user",
      description: "This would open a form to add a new user."
    });
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
                              {user.name[0]}
                            </div>
                            <span>{user.name}</span>
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
                            {user.phone}
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
      </Layout>
    </AdminGuard>
  );
};

export default AdminUsers;
