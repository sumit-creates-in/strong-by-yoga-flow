
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, RefreshCw, Check, X, UserPlus, Download, Upload } from 'lucide-react';
import { useTeachers } from '@/contexts/TeacherContext';
import ZoomSetupCard from '@/components/ZoomSetupCard';

const AdminZoomSettings = () => {
  const { teachers, connectZoomAccount, disconnectZoomAccount } = useTeachers();
  const { toast } = useToast();
  
  const [isConnected, setIsConnected] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Count connected teachers
  const connectedTeachers = teachers.filter(teacher => teacher.zoomAccount).length;
  
  const handleConnectZoom = (email: string) => {
    setIsConnected(true);
    setAdminEmail(email);
    
    toast({
      title: 'Zoom Connected',
      description: 'Your Zoom admin account has been successfully connected.',
    });
  };
  
  const handleDisconnectZoom = () => {
    setIsConnected(false);
    setAdminEmail('');
    
    toast({
      title: 'Zoom Disconnected',
      description: 'Your Zoom admin account has been disconnected.',
      variant: 'destructive',
    });
  };
  
  const handleSyncAccounts = () => {
    setIsSyncing(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSyncing(false);
      
      toast({
        title: 'Accounts Synced',
        description: 'All teacher accounts have been synced with Zoom.',
      });
    }, 2000);
  };
  
  const handleImportTeachers = () => {
    toast({
      title: 'Import Started',
      description: 'Importing teachers from Zoom. This may take a few moments.',
    });
  };
  
  return (
    <Layout>
      <div className="container mx-auto p-6 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">Zoom Integration Settings</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="teachers">
              <TabsList className="grid grid-cols-2 w-full mb-6">
                <TabsTrigger value="teachers">Teacher Accounts</TabsTrigger>
                <TabsTrigger value="meetings">Meeting Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="teachers" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Linked Teacher Accounts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Teacher</TableHead>
                          <TableHead>Zoom Email</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {teachers.map(teacher => (
                          <TableRow key={teacher.id}>
                            <TableCell className="font-medium">{teacher.name}</TableCell>
                            <TableCell>
                              {teacher.zoomAccount ? teacher.zoomAccount.email : '—'}
                            </TableCell>
                            <TableCell>
                              {teacher.zoomAccount ? (
                                <Badge className="bg-green-500">Connected</Badge>
                              ) : (
                                <Badge variant="outline" className="text-gray-500">Not Connected</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {teacher.zoomAccount ? (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => {
                                    disconnectZoomAccount(teacher.id);
                                    toast({
                                      title: 'Account Disconnected',
                                      description: `${teacher.name}'s Zoom account has been disconnected.`,
                                    });
                                  }}
                                >
                                  <X size={16} className="mr-1" /> Disconnect
                                </Button>
                              ) : (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-blue-500 hover:text-blue-700"
                                  onClick={() => {
                                    // Create a dummy Zoom account
                                    const zoomAccount = {
                                      id: `zoom-${Date.now()}`,
                                      email: `${teacher.name.toLowerCase().replace(/ /g, '.')}@example.com`,
                                      connected: true,
                                      accountName: teacher.name
                                    };
                                    
                                    connectZoomAccount(teacher.id, zoomAccount);
                                    
                                    toast({
                                      title: 'Account Connected',
                                      description: `${teacher.name}'s Zoom account has been successfully connected.`,
                                    });
                                  }}
                                >
                                  <UserPlus size={16} className="mr-1" /> Connect
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                        
                        {teachers.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                              No teachers found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={handleSyncAccounts}
                    disabled={!isConnected || isSyncing}
                  >
                    {isSyncing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    Sync Teacher Accounts
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={handleImportTeachers}
                    disabled={!isConnected}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Import Teachers from Zoom
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="meetings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Meeting Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border rounded-md p-4">
                        <h3 className="font-medium mb-4">Default Meeting Settings</h3>
                        <ul className="space-y-3">
                          <li className="flex items-center text-sm">
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                            <span>Enable waiting room</span>
                          </li>
                          <li className="flex items-center text-sm">
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                            <span>Start video for host</span>
                          </li>
                          <li className="flex items-center text-sm">
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                            <span>Start video for participants</span>
                          </li>
                          <li className="flex items-center text-sm">
                            <X className="h-4 w-4 text-red-500 mr-2" />
                            <span>Allow join before host</span>
                          </li>
                          <li className="flex items-center text-sm">
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                            <span>Mute participants upon entry</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="border rounded-md p-4">
                        <h3 className="font-medium mb-4">Automation</h3>
                        <ul className="space-y-3">
                          <li className="flex items-center text-sm">
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                            <span>Auto-create meetings on booking</span>
                          </li>
                          <li className="flex items-center text-sm">
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                            <span>Send email notifications to teacher</span>
                          </li>
                          <li className="flex items-center text-sm">
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                            <span>Add to teacher's calendar</span>
                          </li>
                          <li className="flex items-center text-sm">
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                            <span>Include meeting link in booking confirmations</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <Button disabled={!isConnected}>
                      <Upload className="mr-2 h-4 w-4" />
                      Update Meeting Settings
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="space-y-6">
            <ZoomSetupCard 
              isConnected={isConnected}
              adminEmail={adminEmail}
              onConnect={handleConnectZoom}
              onDisconnect={handleDisconnectZoom}
            />
            
            <Card>
              <CardHeader>
                <CardTitle>Account Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-gray-600">Connected Admin Account</span>
                  <span className="font-medium">{isConnected ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-gray-600">Connected Teachers</span>
                  <span className="font-medium">{connectedTeachers} of {teachers.length}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-gray-600">Last Synced</span>
                  <span className="font-medium">{isConnected ? 'Just now' : '—'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminZoomSettings;
