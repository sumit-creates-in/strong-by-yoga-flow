import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const AdminRoleDebugger: React.FC = () => {
  const { user } = useAuth();
  
  useEffect(() => {
    console.log('AdminRoleDebugger - Current user:', user);
    console.log('AdminRoleDebugger - User email:', user?.email);
    console.log('AdminRoleDebugger - User role:', user?.role);
    console.log('AdminRoleDebugger - Is admin?', user?.email === 'sumit_204@yahoo.com' || user?.email === 'admin@strongbyyoga.com');
    
    // Fix the admin role if needed
    if ((user?.email === 'sumit_204@yahoo.com' || user?.email === 'admin@strongbyyoga.com') && user?.role !== 'admin') {
      console.log('AdminRoleDebugger - Fixing admin role for:', user?.email);
      // Attempt to fix the role locally - this is a temporary fix
      if (user) {
        (user as any).role = 'admin';
      }
    }
  }, [user]);
  
  // This component doesn't render anything
  return null;
};

export default AdminRoleDebugger; 