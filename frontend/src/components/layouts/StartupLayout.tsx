// src/layouts/StartupLayout.tsx
import React from 'react';
import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import LegalChatbot from '../ui/LegalChatbot'; // ✅ Already added correctly
import {
  LayoutDashboard,
  Bell,
  Calendar,
  Settings,
  CalendarClock,
  LogOut,
  Rocket,
  Menu,
  X,
  UserCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStartupAuth } from '@/contexts/StartupAuthContext';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface StartupLayoutProps {
  children: React.ReactNode;
}

export const StartupLayout = ({ children }: StartupLayoutProps) => {
  const { startup, logout } = useStartupAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPageTitle, setCurrentPageTitle] = useState('Dashboard');

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/startup/login');
  };

  const navItems = [
    { path: '/startup/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { path: '/startup/announcements', label: 'Announcements', icon: <Bell size={18} /> },
    { path: '/startup/events', label: 'Upcoming Events', icon: <Calendar size={18} /> },
    { path: '/startup/schedules', label: 'Scheduled Meetings', icon: <CalendarClock size={18} /> },
    { path: '/startup/profile-setup', label: 'Profile Setup', icon: <Settings size={18} /> },
    { path: '/startup/matching', label: 'Find Incubator', icon: <Rocket size={18} /> },


  ];

  useEffect(() => {
    const currentItem = navItems.find(item => location.pathname.startsWith(item.path));
    if (currentItem) {
      setCurrentPageTitle(currentItem.label);
    }
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className={`bg-white border-r transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'}`}>
        <div className="flex items-center justify-between p-4 border-b">
          <span className={`font-bold text-lg transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
            Startup Panel
          </span>
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
        <nav className="flex flex-col p-2">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100 transition-colors',
                isActive && 'bg-gray-100 text-primary'
              )}
            >
              {item.icon}
              {sidebarOpen && item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-gray-50">
        <header className="flex items-center justify-between p-4 border-b bg-white">
          <h1 className="text-lg font-semibold">{currentPageTitle}</h1>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarImage src="" alt={startup?.name} />
                  <AvatarFallback>
                    {startup?.name?.charAt(0).toUpperCase() || 'S'}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {startup?.name || 'Startup'}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut size={16} className="mr-2" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <Separator />
        <div className="flex-1 p-6">{children}</div>
      </main>

      {/* ✅ Legal Chatbot - Added at the end */}
      <LegalChatbot />
    </div>
  );
};