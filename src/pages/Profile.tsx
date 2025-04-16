import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Save, Coins, History, Calendar, CalendarPlus } from 'lucide-react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import MembershipManager from '@/components/MembershipManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTeachers } from '@/contexts/TeacherContext';
import CreditHistoryModal from '@/components/CreditHistoryModal';

const Profile = () => {
  const { user, logout, updateProfile } = useAuth();
  const { toast } = useToast();
  const { userCredits } = useTeachers();
  const navigate = useNavigate();
  
  const [editMode, setEditMode] = useState(false);
  const [firstName, setFirstName] = useState(user?.profile?.first_name || '');
  const [lastName, setLastName] = useState(user?.profile?.last_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isCreditHistoryOpen, setIsCreditHistoryOpen] = useState(false);
  
  const handleSaveProfile = async () => {
    // Update profile in Supabase
    await updateProfile({
      first_name: firstName,
      last_name: lastName,
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
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Card className="flex-1 p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                <Coins className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Credit Balance</h3>
                <p className="text-2xl font-bold">{userCredits}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsCreditHistoryOpen(true)}
              className="flex items-center"
            >
              <History className="h-3.5 w-3.5 mr-1" />
              History
            </Button>
          </Card>
          
          <Card className="flex-1 p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-yoga-light-blue flex items-center justify-center mr-3">
                <Calendar className="h-5 w-5 text-yoga-blue" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Upcoming Sessions</h3>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/teachers')}
              className="flex items-center"
            >
              <CalendarPlus className="h-3.5 w-3.5 mr-1" />
              Book
            </Button>
          </Card>
        </div>
        
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="personal">Personal Information</TabsTrigger>
            <TabsTrigger value="membership">Membership</TabsTrigger>
            <TabsTrigger value="settings">Account Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="personal" className="space-y-6">
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
                    <label htmlFor="firstName" className="flex items-center text-gray-700">
                      <User size={18} className="mr-2" />
                      First Name
                    </label>
                    {editMode ? (
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="yoga-input"
                      />
                    ) : (
                      <p className="text-lg">{user?.profile?.first_name || 'Not provided'}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="lastName" className="flex items-center text-gray-700">
                      <User size={18} className="mr-2" />
                      Last Name
                    </label>
                    {editMode ? (
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="yoga-input"
                      />
                    ) : (
                      <p className="text-lg">{user?.profile?.last_name || 'Not provided'}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="email" className="flex items-center text-gray-700">
                      <Mail size={18} className="mr-2" />
                      Email
                    </label>
                    <p className="text-lg">{user?.email}</p>
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
                          setFirstName(user?.profile?.first_name || '');
                          setLastName(user?.profile?.last_name || '');
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
          </TabsContent>
          
          <TabsContent value="membership">
            <Card className="yoga-card">
              <CardContent className="pt-6">
                <MembershipManager />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6">
            <Card className="yoga-card">
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
                    <h3 className="text-lg font-medium text-destructive mb-2">Danger Zone</h3>
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
            
            <Card className="yoga-card">
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-yoga-light-blue flex items-center justify-center">
                  <span className="text-4xl text-yoga-blue font-bold">
                    {user?.profile?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>
                <h2 className="text-xl font-medium mt-4">{user?.profile?.first_name} {user?.profile?.last_name}</h2>
                <p className="text-gray-600 mb-6">{user?.role === 'admin' ? 'Administrator' : 'Member'}</p>
                
                <Button
                  onClick={() => logout()}
                  className="w-full bg-yoga-yellow text-gray-800 hover:bg-yoga-yellow/90"
                >
                  Log Out
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Credit History Modal */}
      <CreditHistoryModal
        open={isCreditHistoryOpen}
        onOpenChange={setIsCreditHistoryOpen}
      />
    </Layout>
  );
};

export default Profile;
