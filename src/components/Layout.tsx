import React, { useState } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ModeToggle } from './ModeToggle';
import { Link } from 'react-router-dom';
import { useTeachers } from '@/contexts/TeacherContext';
import { useYogaClasses } from '@/contexts/YogaClassContext';
import { AlignJustify, Book, Calendar, CheckCircle2, CircleUserRound, Coins, CreditCard, LayoutDashboard, ListChecks, LucideIcon, MessageSquare, Settings, User2, Users2, Zoom } from 'lucide-react';

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, href }) => (
  <li>
    <Link to={href} className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  </li>
);

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const session = useSession();
  const supabase = useSupabaseClient();
  const router = useRouter();
  const { userCredits } = useTeachers();
  const { userMembership } = useYogaClasses();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const isAdmin = session?.user?.email === 'admin@example.com';

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50">
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <AlignJustify className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:w-64">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
            <SheetDescription>
              Navigate through the application.
            </SheetDescription>
          </SheetHeader>
          <nav className="mt-4">
            <ul className="space-y-2">
              <NavItem icon={LayoutDashboard} label="Dashboard" href="/dashboard" />
              <NavItem icon={CircleUserRound} label="Profile" href="/profile" />
              <NavItem icon={Calendar} label="Bookings" href="/bookings" />
              <NavItem icon={Book} label="Classes" href="/classes" />
              <NavItem icon={CreditCard} label="Pricing" href="/pricing" />
              <NavItem icon={MessageSquare} label="Contact" href="/contact" />
              {isAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <li><DropdownMenuLabel>Admin</DropdownMenuLabel></li>
                  <NavItem icon={Coins} label="Credits" href="/admin/credits" />
                  <NavItem icon={ListChecks} label="Bookings" href="/admin/bookings" />
                  <NavItem icon={Book} label="Classes" href="/admin/classes" />
                  <NavItem icon={MessageSquare} label="Notifications" href="/admin/notifications" />
                  <NavItem icon={User2} label="Teachers" href="/admin/teachers" />
                  <NavItem icon={Users2} label="Users" href="/admin/users" />
                  <NavItem icon={Zoom} label="Zoom Settings" href="/admin/zoom-settings" />
                </>
              )}
            </ul>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700">
          <Link to="/" className="text-lg font-semibold">
            Lovable
          </Link>
        </div>
        <nav className="flex-grow p-4">
          <ul className="space-y-2">
            <NavItem icon={LayoutDashboard} label="Dashboard" href="/dashboard" />
            <NavItem icon={CircleUserRound} label="Profile" href="/profile" />
            <NavItem icon={Calendar} label="Bookings" href="/bookings" />
            <NavItem icon={Book} label="Classes" href="/classes" />
            <NavItem icon={CreditCard} label="Pricing" href="/pricing" />
            <NavItem icon={MessageSquare} label="Contact" href="/contact" />
            {isAdmin && (
              <>
                <DropdownMenuSeparator />
                <li><DropdownMenuLabel>Admin</DropdownMenuLabel></li>
                <NavItem icon={Coins} label="Credits" href="/admin/credits" />
                <NavItem icon={ListChecks} label="Bookings" href="/admin/bookings" />
                <NavItem icon={Book} label="Classes" href="/admin/classes" />
                <NavItem icon={MessageSquare} label="Notifications" href="/admin/notifications" />
                <NavItem icon={User2} label="Teachers" href="/admin/teachers" />
                <NavItem icon={Users2} label="Users" href="/admin/users" />
                <NavItem icon={Zoom} label="Zoom Settings" href="/admin/zoom-settings" />
              </>
            )}
          </ul>
        </nav>
      </aside>

      <div className="flex flex-col flex-1">
        <header className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <ModeToggle />
          </div>
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user?.user_metadata?.avatar_url as string} alt={session.user?.email as string} />
                    <AvatarFallback>{session.user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel>
                  {session.user?.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/pricing">
                    {userCredits} Credits
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/pricing">
                    {userMembership?.active ? 'Membership Active' : 'Buy Membership'}
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/admin/credits">Admin Dashboard</Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div>
              <Link to="/login" className="mr-4">Login</Link>
              <Link to="/signup">Sign Up</Link>
            </div>
          )}
        </header>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
