
import React, { useState } from 'react';
import { User, Mail, Phone, Save } from 'lucide-react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

const Profile = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  
  const handleSaveProfile = () => {
    // In a real app, this would update the user profile on the server
    toast({
      title: 'Profile updated',
      description: 'Your profile information has been updated successfully.',
    });
    
    setEditMode(false);
  };
  
  // Format phone number as user types
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strip non-digits
    let input = e.target.value.replace(/\D/g, '');
    
    // Format with dashes
    if (input.length > 0) {
      if (input.length <= 3) {
        setPhone(input);
      } else if (input.length <= 6) {
        setPhone(`${input.slice(0, 3)}-${input.slice(3)}`);
      } else {
        setPhone(`${input.slice(0, 3)}-${input.slice(3, 6)}-${input.slice(6, 10)}`);
      }
    } else {
      setPhone('');
    }
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Your Profile</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="yoga-card">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold">Personal Information</h2>
                  {!editMode && (
                    <Button
                      onClick={() => setEditMode(true)}
                      variant="outline"
                      className="text-yoga-blue border-yoga-blue hover:bg-yoga-blue hover:text-white"
                    >
                      Edit Profile
                    </Button>
                  )}
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="flex items-center text-gray-700">
                      <User size={18} className="mr-2" />
                      Full Name
                    </label>
                    {editMode ? (
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="yoga-input"
                      />
                    ) : (
                      <p className="text-lg">{user?.name}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="email" className="flex items-center text-gray-700">
                      <Mail size={18} className="mr-2" />
                      Email
                    </label>
                    {editMode ? (
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="yoga-input"
                      />
                    ) : (
                      <p className="text-lg">{user?.email}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="phone" className="flex items-center text-gray-700">
                      <Phone size={18} className="mr-2" />
                      Phone Number
                    </label>
                    {editMode ? (
                      <Input
                        id="phone"
                        value={phone}
                        onChange={handlePhoneChange}
                        placeholder="123-456-7890"
                        className="yoga-input"
                      />
                    ) : (
                      <p className="text-lg">{user?.phone || 'Not provided'}</p>
                    )}
                  </div>
                  
                  {editMode && (
                    <div className="flex gap-2 pt-4">
                      <Button 
                        onClick={handleSaveProfile} 
                        className="yoga-button"
                      >
                        <Save size={18} className="mr-2" />
                        Save Changes
                      </Button>
                      <Button 
                        onClick={() => {
                          setEditMode(false);
                          setName(user?.name || '');
                          setEmail(user?.email || '');
                          setPhone(user?.phone || '');
                        }} 
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="yoga-card mt-6">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-semibold mb-6">Account Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Change Password</h3>
                    <Button variant="outline">Update Password</Button>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Notifications</h3>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="email-notifications"
                        defaultChecked
                        className="h-4 w-4 rounded border-gray-300 text-yoga-blue focus:ring-yoga-blue"
                      />
                      <label htmlFor="email-notifications" className="ml-2 block text-gray-700">
                        Email notifications for upcoming classes
                      </label>
                    </div>
                    <div className="flex items-center mt-2">
                      <input
                        type="checkbox"
                        id="sms-notifications"
                        defaultChecked
                        className="h-4 w-4 rounded border-gray-300 text-yoga-blue focus:ring-yoga-blue"
                      />
                      <label htmlFor="sms-notifications" className="ml-2 block text-gray-700">
                        SMS reminders before class starts
                      </label>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-yoga-light-blue">
                    <h3 className="text-lg font-medium text-destructive">Danger Zone</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <Button 
                      variant="destructive" 
                      size="sm"
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card className="yoga-card sticky top-6">
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-yoga-light-blue mx-auto flex items-center justify-center">
                    <span className="text-4xl text-yoga-blue font-bold">
                      {user?.name.charAt(0)}
                    </span>
                  </div>
                  <h2 className="text-xl font-medium mt-4">{user?.name}</h2>
                  <p className="text-gray-600">{user?.role === 'admin' ? 'Administrator' : 'Member'}</p>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-yoga-yellow/30 p-4 rounded-lg">
                    <h3 className="font-medium mb-1">Membership Status</h3>
                    <p className="text-gray-700">Active</p>
                  </div>
                  
                  <div className="bg-yoga-light-blue/30 p-4 rounded-lg">
                    <h3 className="font-medium mb-1">Classes Attended</h3>
                    <p className="text-gray-700">12 classes</p>
                  </div>
                  
                  <div className="p-4 border border-yoga-light-blue rounded-lg">
                    <h3 className="font-medium mb-1">Member Since</h3>
                    <p className="text-gray-700">January 2025</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button
                    onClick={logout}
                    className="w-full bg-yoga-yellow text-gray-800 hover:bg-yoga-yellow/90"
                  >
                    Log Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
