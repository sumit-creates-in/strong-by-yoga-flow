import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  User, 
  Menu, 
  Calendar, 
  LogOut, 
  BookOpen, 
  Settings, 
  Users, 
  CreditCard,
  Bell,
  Video,
  BookOpen as ClassIcon,
  Calendar as BookingIcon
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const isActive = (path: string) => location.pathname === path;
  const isActivePrefix = (prefix: string) => location.pathname.startsWith(prefix);
  
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
      name: 'Upcoming Sessions',
      path: '/upcoming-sessions',
      icon: <BookingIcon size={20} />,
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: <User size={20} />,
    },
  ];
  
  // Admin page items
  const adminItems = [
    {
      name: 'Classes',
      path: '/admin/classes',
      icon: <ClassIcon size={20} />,
    },
    {
      name: 'Users',
      path: '/admin/users',
      icon: <Users size={20} />,
    },
    {
      name: 'Teachers',
      path: '/admin/teachers',
      icon: <User size={20} />,
    },
    {
      name: 'Bookings',
      path: '/admin/bookings',
      icon: <BookingIcon size={20} />,
    },
    {
      name: 'Credits',
      path: '/admin/credits',
      icon: <CreditCard size={20} />,
    },
    {
      name: 'Zoom Settings',
      path: '/admin/zoom-settings',
      icon: <Video size={20} />,
    },
    {
      name: 'Notifications',
      path: '/admin/notifications',
      icon: <Bell size={20} />,
    },
  ];

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
            {navItems.map((item) => (
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
            
            {/* Admin Dropdown Menu for Desktop */}
            {user?.role === 'admin' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant={isActivePrefix('/admin') ? "secondary" : "ghost"} 
                    className={`flex items-center px-4 py-2 ${
                      isActivePrefix('/admin') ? 'bg-yoga-yellow' : ''
                    }`}
                  >
                    <span className="mr-2"><Settings size={20} /></span>
                    Admin
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Admin Panel</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {adminItems.map((item) => (
                    <DropdownMenuItem 
                      key={item.path} 
                      className={`flex items-center cursor-pointer ${isActive(item.path) ? 'bg-secondary/50' : ''}`}
                      onClick={() => navigate(item.path)}
                    >
                      <span className="mr-2">{item.icon}</span>
                      {item.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
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
          {navItems.map((item) => (
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
          
          {/* Admin Section for Mobile */}
          {user?.role === 'admin' && (
            <>
              <div className="py-2 px-3 text-sm font-medium text-gray-500 mt-2 mb-1">
                Admin Panel
              </div>
              {adminItems.map((item) => (
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
            </>
          )}
          
          <Button 
            variant="ghost" 
            className="flex items-center text-destructive hover:text-destructive justify-start mt-2"
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
