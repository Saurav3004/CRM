import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  Megaphone, 
  Settings, 
  User, 
  Bell, 
  Search, 
  Menu,
  X,
  ChevronRight,
  Home,
  Activity,
  TrendingUp,
  Mail,
  Calendar,
  HelpCircle,
  LogOut,
  Droplet
} from 'lucide-react';
import { useState } from 'react';

export default function MainLayout() {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  const isActive = (path) => location.pathname.startsWith(path);

  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3, description: 'Overview & Analytics' },
    { path: '/audience', label: 'Audience', icon: Users, description: 'Manage Contacts' },
    { path: '/campaign', label: 'Campaign', icon: Megaphone, description: 'Marketing Campaigns' },
    {path: '/drops',label: 'Drop',icon:Droplet,description:"Your all drops"}
  ];

  const secondaryItems = [
    { path: '/analytics', label: 'Analytics', icon: TrendingUp, description: 'Detailed Reports' },
    { path: '/calendar', label: 'Calendar', icon: Calendar, description: 'Schedule Events' },
    { path: '/messages', label: 'Messages', icon: Mail, description: 'Communication' },
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const getCurrentPageTitle = () => {
    const currentItem = [...navigationItems, ...secondaryItems].find(item => 
      location.pathname.startsWith(item.path)
    );
    return currentItem?.label || 'Dashboard';
  };

  return (
    <div className="flex min-h-screen bg-gray-50 ">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-80' : 'w-20'} bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 ease-linear sticky top-0 h-screen overflow-hidden shadow-2xl`}>
        
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className={`flex items-center space-x-3 ${!isSidebarOpen && 'justify-center'}`}>
              {/* <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Activity className="text-white" size={24} />
              </div> */}
              {isSidebarOpen && (
                <div>
                  <h2 className="text-xl font-bold">CRM Panel</h2>
                  <p className="text-xs text-gray-400">Manage your business</p>
                </div>
              )}
            </div>
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              {isSidebarOpen ? <X size={18} /> : <Menu size={18} /> }
            </button>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="p-4 space-y-2">
          {isSidebarOpen && (
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">
              Main Menu
            </div>
          )}
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                  active 
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg' 
                    : 'hover:bg-gray-700 hover:shadow-md'
                }`}
              >
                <Icon size={20} className={`${active ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                {isSidebarOpen && (
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium ${active ? 'text-white' : 'text-gray-300'}`}>
                      {item.label}
                    </div>
                    <div className={`text-xs ${active ? 'text-purple-100' : 'text-gray-500'}`}>
                      {item.description}
                    </div>
                  </div>
                )}
                {isSidebarOpen && active && (
                  <ChevronRight size={16} className="text-white" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Secondary Navigation */}
        {/* <nav className="p-4 space-y-2 border-t border-gray-700">
          {isSidebarOpen && (
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">
              Tools
            </div>
          )}
          {secondaryItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
                  active 
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg' 
                    : 'hover:bg-gray-700'
                }`}
              >
                <Icon size={18} className={`${active ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                {isSidebarOpen && (
                  <span className={`font-medium ${active ? 'text-white' : 'text-gray-300'}`}>
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav> */}

        {/* User Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
          <div className={`flex items-center space-x-3 ${!isSidebarOpen && 'justify-center'}`}>
            <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <User size={20} className="text-white" />
            </div>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white">John Doe</div>
                <div className="text-xs text-gray-400">Administrator</div>
              </div>
            )}
            {isSidebarOpen && (
              <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                <Settings size={16} className="text-gray-400" />
              </button>
            )}
          </div>
          {isSidebarOpen && (
            <div className="mt-3 space-y-1">
              <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                <HelpCircle size={16} />
                <span>Help & Support</span>
              </button>
              <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{getCurrentPageTitle()}</h1>
                <p className="text-sm text-gray-500">Welcome back! Here's what's happening with your business today.</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
                >
                  <Bell size={20} className="text-gray-600" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <h3 className="font-medium text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">New campaign created</p>
                            <p className="text-xs text-gray-500">2 minutes ago</p>
                          </div>
                        </div>
                      </div>
                      <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">50 new contacts added</p>
                            <p className="text-xs text-gray-500">1 hour ago</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* User Avatar */}
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center cursor-pointer hover:shadow-lg transition-shadow">
                <User size={20} className="text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 bg-gray-50 p-6 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}