import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Profile = Database['public']['Tables']['profiles']['Row'];

interface EditUserFormData {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  initial_credits: number | null;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [formData, setFormData] = useState<EditUserFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    initial_credits: 0
  });
  const { toast } = useToast();
  
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Get all profiles with email included
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profileError) {
        console.error('Error fetching profiles:', profileError);
        throw profileError;
      }

      if (!profiles) {
        throw new Error('No profiles returned from database');
      }

      // Get auth data for any missing emails
      const { data } = await supabase.auth.admin.listUsers();
      const authUsers = data?.users || [];
      
      // Combine profile data with auth emails where missing
      const updatedProfiles = profiles.map(profile => {
        if (!profile.email) {
          const authUser = authUsers.find(u => u.id === profile.id);
          if (authUser?.email) {
            // Also update the profile in the database
            supabase
              .from('profiles')
              .update({ email: authUser.email })
              .eq('id', profile.id)
              .then(() => console.log('Updated email for user:', profile.id));
            
            return { ...profile, email: authUser.email };
          }
        }
        return profile;
      });

      console.log('Fetched profiles:', updatedProfiles);
      setUsers(updatedProfiles);
    } catch (error) {
      console.error('Error in fetchUsers:', error);
      toast({
        title: 'Error fetching users',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: Profile) => {
    setEditingUser(user);
    setFormData({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone,
      initial_credits: user.initial_credits
    });
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Ensure credits is included and is a number
      const credits = typeof formData.credits === 'number' ? formData.credits : 0;
      
      const updateData: ProfileUpdate = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        credits: credits, // Always include credits
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', formData.id);

      if (error) throw error;

      // Refresh the users list
      fetchUsers();
      toast({
        title: 'User updated successfully',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: 'Error updating user',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });

      fetchUsers(); // Refresh the users list
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.email?.toLowerCase().includes(searchLower) ||
      user.first_name?.toLowerCase().includes(searchLower) ||
      user.last_name?.toLowerCase().includes(searchLower) ||
      user.phone?.toLowerCase().includes(searchLower) ||
      user.id.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="bg-white shadow-sm">
          <CardHeader className="border-b border-gray-200 bg-white px-6 py-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-semibold text-gray-900">Users Management</CardTitle>
              <div className="w-72">
                <Input
                  placeholder="Search users..."
                  className="max-w-xs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-6 py-4">
            {loading ? (
              <div className="flex justify-center items-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900">No users found</h3>
                <p className="mt-2 text-sm text-gray-500">Start by adding some users to your platform.</p>
              </div>
            ) : (
              <div className="mt-4 flex flex-col">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle">
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">ID</TableHead>
                            <TableHead className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</TableHead>
                            <TableHead className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Name</TableHead>
                            <TableHead className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Phone</TableHead>
                            <TableHead className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Created At</TableHead>
                            <TableHead className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Credits</TableHead>
                            <TableHead className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                              <span className="sr-only">Actions</span>
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredUsers.map((user, userIdx) => (
                            <TableRow 
                              key={user.id}
                              className={userIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                            >
                              <TableCell className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-mono text-gray-900">{user.id}</TableCell>
                              <TableCell className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{user.email || '-'}</TableCell>
                              <TableCell className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                                {user.first_name || user.last_name
                                  ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                                  : '-'}
                              </TableCell>
                              <TableCell className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{user.phone || '-'}</TableCell>
                              <TableCell className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                                {new Date(user.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{user.initial_credits || 0}</TableCell>
                              <TableCell className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                <div className="flex gap-2 justify-end">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEditUser(user)}
                                        className="text-primary hover:text-primary/80"
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                      <DialogHeader>
                                        <DialogTitle>Edit User Details</DialogTitle>
                                      </DialogHeader>
                                      <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                          <Label htmlFor="first_name" className="text-right">First Name</Label>
                                          <Input
                                            id="first_name"
                                            className="col-span-3"
                                            value={formData.first_name || ''}
                                            onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                                          />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                          <Label htmlFor="last_name" className="text-right">Last Name</Label>
                                          <Input
                                            id="last_name"
                                            className="col-span-3"
                                            value={formData.last_name || ''}
                                            onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                                          />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                          <Label htmlFor="email" className="text-right">Email</Label>
                                          <Input
                                            id="email"
                                            className="col-span-3"
                                            value={formData.email || ''}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                          />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                          <Label htmlFor="phone" className="text-right">Phone</Label>
                                          <Input
                                            id="phone"
                                            className="col-span-3"
                                            value={formData.phone || ''}
                                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                          />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                          <Label htmlFor="credits" className="text-right">Credits</Label>
                                          <Input
                                            id="credits"
                                            type="number"
                                            className="col-span-3"
                                            value={formData.initial_credits || 0}
                                            onChange={(e) => setFormData({...formData, initial_credits: parseInt(e.target.value)})}
                                          />
                                        </div>
                                      </div>
                                      <div className="flex justify-end gap-3">
                                        <Button variant="outline" onClick={() => setEditingUser(null)}>
                                          Cancel
                                        </Button>
                                        <Button onClick={handleUpdateUser} className="bg-primary text-white hover:bg-primary/90">
                                          Save Changes
                                        </Button>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
