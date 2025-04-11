
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Menu, Calendar, LogOut, BookOpen, Settings, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const isActive = (path: string) => location.pathname === path;
  
  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <BookOpen size={20} />,
    },
    {
      name: 'Classes',
      path: '/classes',
      icon: <Calendar size={20} />,
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: <User size={20} />,
    },
  ];
  
  // Additional items for admin users
  const adminItems = [
    {
      name: 'Manage Classes',
      path: '/admin/classes',
      icon: <Settings size={20} />,
    },
    {
      name: 'Manage Users',
      path: '/admin/users',
      icon: <Users size={20} />,
    },
  ];
  
  // Combine items based on user role
  const menuItems = user?.role === 'admin' ? [...navItems, ...adminItems] : navItems;

  return (
    <div className="min-h-screen bg-yoga-light-yellow flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-yoga-light-blue p-4 flex items-center justify-between">
        <div className="flex items-center">
          <h1 
            onClick={() => navigate('/dashboard')} 
            className="text-2xl font-bold text-yoga-blue cursor-pointer flex items-center"
          >
            <span className="text-3xl mr-2">🧘</span>
            Strong By Yoga
          </h1>
        </div>
        
        {/* Mobile Menu Button */}
        {isMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => document.getElementById('mobile-menu')?.classList.toggle('hidden')}
          >
            <Menu />
          </Button>
        )}
        
        {/* Desktop Navigation */}
        {!isMobile && (
          <nav className="hidden md:flex items-center space-x-1">
            {menuItems.map((item) => (
              <Button
                key={item.path}
                variant={isActive(item.path) ? "secondary" : "ghost"}
                className={`flex items-center px-4 py-2 ${
                  isActive(item.path) ? 'bg-yoga-yellow' : ''
                }`}
                onClick={() => navigate(item.path)}
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </Button>
            ))}
            
            <Button 
              variant="ghost" 
              className="flex items-center text-destructive hover:text-destructive"
              onClick={logout}
            >
              <LogOut className="mr-2" size={20} />
              Logout
            </Button>
          </nav>
        )}
      </header>
      
      {/* Mobile Menu (Hidden by default) */}
      <div
        id="mobile-menu"
        className="md:hidden hidden bg-white border-b border-yoga-light-blue"
      >
        <nav className="flex flex-col p-4">
          {menuItems.map((item) => (
            <Button
              key={item.path}
              variant={isActive(item.path) ? "secondary" : "ghost"}
              className={`flex items-center justify-start mb-2 ${
                isActive(item.path) ? 'bg-yoga-yellow' : ''
              }`}
              onClick={() => {
                navigate(item.path);
                document.getElementById('mobile-menu')?.classList.add('hidden');
              }}
            >
              <span className="mr-2">{item.icon}</span>
              {item.name}
            </Button>
          ))}
          
          <Button 
            variant="ghost" 
            className="flex items-center text-destructive hover:text-destructive justify-start"
            onClick={logout}
          >
            <LogOut className="mr-2" size={20} />
            Logout
          </Button>
        </nav>
      </div>
      
      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-yoga-light-blue p-4 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} Strong By Yoga. All rights reserved.</p>
      </footer>
    </div>
  );
}
