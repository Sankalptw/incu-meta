import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Bell, 
  Rocket, 
  FileEdit, 
  Calendar, 
  CalendarClock, 
  HelpCircle, 
  LogOut, 
  Menu, 
  X, 
  UserCircle,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
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
import LegalChatbot from '../ui/LegalChatbot'; // ✅ ADD THIS IMPORT

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPageTitle, setCurrentPageTitle] = useState('Dashboard');

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { path: '/admin/announcements', label: 'Announcements', icon: <Bell size={18} /> },
    { path: '/admin/startups', label: 'Incubated Startups', icon: <Rocket size={18} /> },
    { path: '/admin/record-mom', label: 'Record MOM', icon: <FileEdit size={18} /> },
    { path: '/admin/events', label: 'Upcoming Events', icon: <Calendar size={18} /> },
    { path: '/admin/schedules', label: 'Scheduled Meetings', icon: <CalendarClock size={18} /> },
    { path: '/admin/requests', label: 'Requests', icon: <HelpCircle size={18} /> },
    { path: '/admin/matching-requests', label: 'Startup Requests', icon: <Bell size={18} /> }
  ];

  // Update page title based on current path
  useEffect(() => {
    const currentItem = navItems.find(item => item.path === location.pathname);
    if (currentItem) {
      setCurrentPageTitle(currentItem.label);
    }
  }, [location.pathname]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile sidebar toggle */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
          className="rounded-full h-10 w-10 bg-white shadow-md border-0"
        >
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "bg-white fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out shadow-md flex flex-col",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0" // Always visible on desktop
        )}
      >
        {/* Logo */}
        <NavLink to="/" className="flex items-center px-6 h-16 border-b border-gray-100">
          <svg width="157.95" height="26.69058063026668" viewBox="0 0 370.2136752136752 74.7863247863248" class="looka-1j8o68f"><defs id="SvgjsDefs1819"></defs><g id="SvgjsG1820" featurekey="symbolFeature-0" transform="matrix(0.8309591642924977,0,0,0.8309591642924977,-4.154795821462488,-4.279439775352804)" fill="#545454"><path xmlns="http://www.w3.org/2000/svg" d="M50,8.75c22.827,0,41.4,18.573,41.4,41.4c0,22.829-18.573,41.4-41.4,41.4S8.6,72.979,8.6,50.15  C8.6,27.323,27.173,8.75,50,8.75 M50,5.15c-24.852,0-45,20.148-45,45c0,24.854,20.148,45,45,45s45-20.146,45-45  C95,25.298,74.852,5.15,50,5.15"></path><path xmlns="http://www.w3.org/2000/svg" d="M44.907,45.062L33.452,61.604l-11.454,16.55l33.093-22.913L78,22.148L44.907,45.062z M36.414,63.654l11.083-16.006  l5.006,5.008L36.229,63.921L36.414,63.654z"></path></g><g id="SvgjsG1821" featurekey="nameFeature-0" transform="matrix(1.6109437599568333,0,0,1.6109437599568333,88.49178727122703,-3.462630603742582)" fill="#545454"><path d="M4.04 40 l0 -29.16 l3.08 0 l0 29.16 l-3.08 0 z M31.68 40 l-2.92 0 l0 -11.56 c0 -1.84 -0.44 -3.28 -1.4 -4.4 c-0.92 -1.08 -2.28 -1.64 -4.08 -1.64 c-1.72 0 -3.16 0.6 -4.28 1.8 c-1.08 1.2 -1.64 2.68 -1.64 4.48 l0 11.32 l-2.92 0 l0 -19.88 l2.84 0 l0 3.64 c1.6 -2.68 3.88 -4 6.88 -4 c2.36 0 4.2 0.72 5.56 2.16 c1.28 1.48 1.96 3.4 1.96 5.8 l0 12.28 z M39.519999999999996 29.96 c0 2.8 1.16 5.24 3.36 6.68 c1.12 0.76 2.4 1.12 3.84 1.12 c1.68 0 3.16 -0.56 4.08 -1.24 c0.44 -0.32 0.84 -0.72 1.24 -1.2 c0.72 -0.96 1.04 -1.6 1.32 -2.32 l2.68 0.88 c-0.44 1.56 -1.52 3.08 -3.04 4.32 c-1.52 1.28 -3.84 2.16 -6.32 2.16 c-5.68 0.08 -10.2 -4.36 -10.12 -10.24 c0 -1.96 0.48 -3.72 1.4 -5.32 s2.16 -2.84 3.72 -3.72 s3.24 -1.32 5.12 -1.32 c2.24 0 4.24 0.64 5.92 1.84 c1.72 1.28 2.8 2.76 3.2 4.52 l-2.64 0.88 c-0.44 -1.6 -2.48 -4.64 -6.56 -4.64 c-2.08 0 -3.8 0.72 -5.16 2.2 s-2.04 3.28 -2.04 5.4 z M60.63999999999999 20.12 l2.88 0 l0 11.56 c0 1.84 0.48 3.32 1.44 4.4 c0.92 1.12 2.28 1.64 4.08 1.64 c1.72 0 3.12 -0.6 4.24 -1.8 s1.68 -2.68 1.68 -4.48 l0 -11.32 l2.88 0 l0 19.88 l-2.84 0 l0 -3.64 c-1.6 2.68 -3.84 4.04 -6.84 4.04 c-2.36 0 -4.2 -0.76 -5.56 -2.2 c-1.32 -1.48 -1.96 -3.4 -1.96 -5.8 l0 -12.28 z M111.19999999999999 10.84 l4.4 0 l0 29.16 l-3.04 0 l0 -25 l0 0 l-10.84 25 l-2.76 0 l-10.76 -24.8 l0 0 l0 24.8 l-3.04 0 l0 -29.16 l4.36 0 l10.88 25 z M140.51999999999998 30.96 l-16.08 0 c0.12 1.96 0.84 3.56 2.2 4.84 c1.36 1.32 3 1.96 4.92 1.96 c3 0 5.24 -1.48 6.16 -4.24 l2.56 0.8 c-0.56 1.88 -1.64 3.36 -3.24 4.44 c-1.6 1.04 -3.4 1.6 -5.44 1.6 c-1.88 0 -3.6 -0.48 -5.16 -1.4 s-2.76 -2.16 -3.6 -3.76 c-0.88 -1.56 -1.32 -3.28 -1.32 -5.16 c0 -1.8 0.4 -3.48 1.24 -5.04 c0.8 -1.6 1.96 -2.84 3.48 -3.8 c1.48 -0.96 3.16 -1.44 4.96 -1.44 c1.96 0 3.68 0.44 5.12 1.36 c1.44 0.88 2.52 2.12 3.2 3.64 c0.72 1.52 1.04 3.24 1.04 5.24 c0 0.2 0 0.52 -0.04 0.96 z M124.47999999999999 28.48 l13.16 0 c-0.2 -1.84 -0.88 -3.32 -2 -4.48 c-1.12 -1.12 -2.6 -1.68 -4.44 -1.68 c-1.72 0 -3.16 0.6 -4.44 1.8 c-1.28 1.24 -2.04 2.68 -2.28 4.36 z M152.52 40.16 c-4.32 0 -5.64 -2.4 -5.64 -5.32 l0 -12.16 l-3.68 0 l0 -2.56 l3.68 0 l0 -5.72 l2.88 0 l0 5.72 l5.04 0 l0 2.56 l-5.04 0 l0 12.12 c0 1.84 1.08 2.8 3.24 2.8 c0.68 0 1.28 -0.08 1.8 -0.16 l0 2.4 c-0.64 0.2 -1.4 0.32 -2.28 0.32 z M166.2 28.52 l5.52 0 l0 -1.32 c0 -3.2 -1.76 -4.84 -5.08 -4.84 c-1.6 0 -2.96 0.52 -3.76 1.32 s-1.28 1.72 -1.44 2.72 l-2.8 -0.6 c0.04 -1 1 -2.96 2.8 -4.4 c1.2 -0.92 3.12 -1.64 5.28 -1.64 c3.64 0 6.04 1.36 7.24 4.12 c0.4 0.92 0.6 2 0.6 3.28 l0 5.6 c0 3.32 0.12 5.76 0.32 7.24 l-2.88 0 c-0.16 -0.88 -0.28 -2.04 -0.28 -3.48 l0 0 c-1.68 2.56 -3.88 3.84 -6.72 3.84 c-1.96 0 -3.6 -0.56 -4.8 -1.68 c-1.24 -1.08 -1.88 -2.48 -1.88 -4.2 l0 -0.2 c0 -4.32 4.32 -5.76 7.88 -5.76 z M171.72 31.6 l0 -0.68 l-5.56 0 c-1.16 0 -2.24 0.2 -3.24 0.68 c-1 0.44 -1.68 1.4 -1.68 2.64 c0 1.12 0.4 1.96 1.24 2.6 c0.8 0.64 1.8 0.96 3.04 0.96 c1.76 0 3.24 -0.6 4.44 -1.76 c1.16 -1.12 1.76 -2.64 1.76 -4.44 z"></path></g></svg>
        </NavLink>

        {/* Navigation Items */}
        <nav className="px-3 py-6 space-y-1.5 flex-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-blue-50 text-blue-700" 
                    : "text-gray-700 hover:bg-gray-100"
                )
              }
            >
              <span className="mr-3 text-blue-600">{item.icon}</span>
              <span>{item.label}</span>
              {location.pathname === item.path && (
                <ChevronRight size={16} className="ml-auto text-blue-600" />
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="px-3 py-2 rounded-lg bg-blue-50">
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src={admin?.avatar} />
                <AvatarFallback className="bg-blue-200 text-blue-700">
                  {admin?.name ? getInitials(admin.name) : 'AU'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {admin?.name || 'Admin User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {admin?.email || 'admin@incumeta.com'}
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              onClick={handleLogout}
              className="mt-2 w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 px-2 py-1.5 h-auto text-sm"
            >
              <LogOut size={16} className="mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={cn(
        "flex flex-col flex-1 transition-all duration-300",
        sidebarOpen ? "md:ml-64" : "ml-0"
      )}>
        {/* Header */}
        <header className="bg-white h-16 border-b border-gray-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold text-gray-800">{currentPageTitle}</h2>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full relative">
              <Bell size={18} />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-2 hover:bg-gray-100 rounded-full pr-4 pl-3 py-2"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={admin?.avatar} />
                    <AvatarFallback className="bg-blue-100 text-blue-700">
                      {admin?.name ? getInitials(admin.name) : 'AU'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline font-medium text-gray-700">
                    {admin?.name || 'Admin User'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  Preferences
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* ✅ LEGAL CHATBOT - ADD THIS */}
      <LegalChatbot />
    </div>
  );
};