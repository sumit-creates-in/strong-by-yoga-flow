
import React from 'react';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreditPackageManager from '@/components/CreditPackageManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTeachers } from '@/contexts/TeacherContext';
import { ArrowUp, Coins, TrendingDown } from 'lucide-react';

const AdminCredits = () => {
  const { creditTransactions, userCredits } = useTeachers();
  
  // Calculate some basic statistics
  const totalPurchased = creditTransactions
    .filter(t => t.type === 'purchase')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalUsed = Math.abs(creditTransactions
    .filter(t => t.type === 'usage')
    .reduce((sum, t) => sum + t.amount, 0));
    
  const averageTransactionSize = totalPurchased / 
    creditTransactions.filter(t => t.type === 'purchase').length || 0;
  
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold mb-6">Credits Management</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Credits Purchased</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <ArrowUp className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-2xl font-bold">{totalPurchased}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Credits Used</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <TrendingDown className="h-5 w-5 text-amber-500 mr-2" />
                <span className="text-2xl font-bold">{totalUsed}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Avg. Purchase Size</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Coins className="h-5 w-5 text-indigo-500 mr-2" />
                <span className="text-2xl font-bold">{averageTransactionSize.toFixed(0)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="packages">
          <TabsList>
            <TabsTrigger value="packages">Credit Packages</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="packages" className="pt-6">
            <CreditPackageManager />
          </TabsContent>
          
          <TabsContent value="transactions">
            <div className="pt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Transaction analysis will be implemented in future updates.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="settings">
            <div className="pt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Credit System Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Credit system settings will be implemented in future updates.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminCredits;
