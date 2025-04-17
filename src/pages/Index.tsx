import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user } = useAuth();
  
  // If user is already logged in, redirect to dashboard
  // Otherwise redirect to login
  return <Navigate to={user ? "/dashboard" : "/login"} replace />;
};

export default Index;
