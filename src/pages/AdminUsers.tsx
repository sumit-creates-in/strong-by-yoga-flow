
import React from 'react';
import { User, MoreVertical, Mail, Phone } from 'lucide-react';
import Layout from '@/components/Layout';
import AdminGuard from '@/components/AdminGuard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

const AdminUsers = () => {
  return (
    <AdminGuard>
      <Layout>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h1 className="text-3xl font-bold">Manage Users</h1>
            <Button className="mt-4 md:mt-0 yoga-button">Add New User</Button>
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
                    {mockUsers.map((user) => (
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
                              <DropdownMenuItem>View Profile</DropdownMenuItem>
                              <DropdownMenuItem>Edit User</DropdownMenuItem>
                              {user.status === 'active' ? (
                                <DropdownMenuItem className="text-yellow-600">
                                  Suspend User
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem className="text-green-600">
                                  Activate User
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
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
      </Layout>
    </AdminGuard>
  );
};

export default AdminUsers;
