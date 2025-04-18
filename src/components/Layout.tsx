
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Settings, 
  ChevronDown, 
  Bookmark,
  Calendar,
  Home,
  BookOpen,
  Users,
  CalendarDays
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { currentUser, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleSignOut = () => {
    signOut();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-yoga-blue">
              Strong By Yoga
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={toggleMenu}
              className="md:hidden text-gray-700 focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                to="/"
                className={`font-medium ${
                  isActive('/') ? 'text-yoga-blue' : 'text-gray-600 hover:text-yoga-blue'
                }`}
              >
                Home
              </Link>
              <Link
                to="/classes"
                className={`font-medium ${
                  isActive('/classes') ? 'text-yoga-blue' : 'text-gray-600 hover:text-yoga-blue'
                }`}
              >
                Classes
              </Link>
              <Link
                to="/teachers"
                className={`font-medium ${
                  isActive('/teachers') ? 'text-yoga-blue' : 'text-gray-600 hover:text-yoga-blue'
                }`}
              >
                1-on-1 with Teachers
              </Link>
              <Link
                to="/pricing"
                className={`font-medium ${
                  isActive('/pricing') ? 'text-yoga-blue' : 'text-gray-600 hover:text-yoga-blue'
                }`}
              >
                Pricing
              </Link>
            </nav>

            {/* User menu */}
            <div className="hidden md:block">
              {currentUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-2 focus:outline-none">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={currentUser.photoURL || ''} alt="User" />
                        <AvatarFallback>
                          {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-gray-700">{currentUser.displayName || 'User'}</span>
                      <ChevronDown size={16} className="text-gray-500" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                      <Home size={16} className="mr-2" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/my-bookings')}>
                      <CalendarDays size={16} className="mr-2" />
                      My Bookings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User size={16} className="mr-2" />
                      Profile
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate('/admin/teachers')}>
                          <Settings size={16} className="mr-2" />
                          Admin Panel
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut size={16} className="mr-2" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/login')}
                    className="text-gray-700 hover:text-yoga-blue"
                  >
                    Log in
                  </Button>
                  <Button
                    onClick={() => navigate('/signup')}
                    className="bg-yoga-blue hover:bg-yoga-blue/90 text-white"
                  >
                    Sign up
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4 space-y-3">
            <Link
              to="/"
              onClick={closeMenu}
              className={`block font-medium ${
                isActive('/') ? 'text-yoga-blue' : 'text-gray-600'
              }`}
            >
              Home
            </Link>
            <Link
              to="/classes"
              onClick={closeMenu}
              className={`block font-medium ${
                isActive('/classes') ? 'text-yoga-blue' : 'text-gray-600'
              }`}
            >
              Classes
            </Link>
            <Link
              to="/teachers"
              onClick={closeMenu}
              className={`block font-medium ${
                isActive('/teachers') ? 'text-yoga-blue' : 'text-gray-600'
              }`}
            >
              1-on-1 with Teachers
            </Link>
            <Link
              to="/pricing"
              onClick={closeMenu}
              className={`block font-medium ${
                isActive('/pricing') ? 'text-yoga-blue' : 'text-gray-600'
              }`}
            >
              Pricing
            </Link>

            {currentUser ? (
              <>
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center space-x-2 mb-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={currentUser.photoURL || ''} alt="User" />
                      <AvatarFallback>
                        {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-gray-700 font-medium">
                      {currentUser.displayName || 'User'}
                    </span>
                    {isAdmin && (
                      <Badge variant="secondary" className="ml-1">
                        Admin
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Link
                      to="/dashboard"
                      onClick={closeMenu}
                      className="flex items-center text-gray-600 hover:text-yoga-blue"
                    >
                      <Home size={16} className="mr-2" />
                      Dashboard
                    </Link>
                    <Link
                      to="/my-bookings"
                      onClick={closeMenu}
                      className="flex items-center text-gray-600 hover:text-yoga-blue"
                    >
                      <CalendarDays size={16} className="mr-2" />
                      My Bookings
                    </Link>
                    <Link
                      to="/profile"
                      onClick={closeMenu}
                      className="flex items-center text-gray-600 hover:text-yoga-blue"
                    >
                      <User size={16} className="mr-2" />
                      Profile
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin/teachers"
                        onClick={closeMenu}
                        className="flex items-center text-gray-600 hover:text-yoga-blue"
                      >
                        <Settings size={16} className="mr-2" />
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="flex items-center text-gray-600 hover:text-yoga-blue w-full text-left"
                    >
                      <LogOut size={16} className="mr-2" />
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="pt-2 border-t border-gray-100 flex flex-col space-y-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    navigate('/login');
                    closeMenu();
                  }}
                  className="justify-start px-0"
                >
                  Log in
                </Button>
                <Button
                  onClick={() => {
                    navigate('/signup');
                    closeMenu();
                  }}
                >
                  Sign up
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      <main className="flex-1 container mx-auto px-4 py-6">{children}</main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Strong By Yoga</h3>
              <p className="text-gray-300">
                Empowering your yoga journey with expert guidance and personalized sessions.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-gray-300 hover:text-white">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/classes" className="text-gray-300 hover:text-white">
                    Classes
                  </Link>
                </li>
                <li>
                  <Link to="/teachers" className="text-gray-300 hover:text-white">
                    1-on-1 with Teachers
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="text-gray-300 hover:text-white">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Contact Us</h3>
              <p className="text-gray-300">
                123 Yoga Street<br />
                Zen City, ZN 12345<br />
                support@strongbyyoga.com<br />
                +1 (555) 123-4567
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Strong By Yoga. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
