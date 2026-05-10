import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from 'react-i18next';
import { 
  Globe, LayoutDashboard, FileText, Package, CheckSquare, 
  Users, BarChart2, LogOut, Menu, X, User as UserIcon, WifiOff, Download, Tag
} from 'lucide-react';
import toast from 'react-hot-toast';
import NotificationPanel from './NotificationPanel';

export default function AppLayout() {
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'am' : 'en';
    i18n.changeLanguage(newLang);
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navItems = [
    { name: t('app.dashboard'), path: '/', icon: LayoutDashboard, roles: ['System Admin', 'GM', 'Finance', 'Storekeeper', 'Checker', 'Staff', 'Auditor'] },
    { name: t('nav.pr'), path: '/purchase-requisitions', icon: FileText, roles: ['System Admin', 'GM', 'Checker', 'Staff', 'Finance'] },
    { name: t('nav.grn'), path: '/goods-receiving-notes', icon: Package, roles: ['System Admin', 'GM', 'Storekeeper', 'Finance'] },
    { name: t('nav.siv'), path: '/store-issued-vouchers', icon: Package, roles: ['System Admin', 'GM', 'Storekeeper'] },
    { name: t('nav.prf'), path: '/payment-requests', icon: FileText, roles: ['System Admin', 'GM', 'Finance', 'Checker', 'Staff'] },
    { name: t('nav.approvals'), path: '/approvals', icon: CheckSquare, roles: ['System Admin', 'GM', 'Checker', 'Finance'] },
    { name: t('nav.inventory'), path: '/inventory', icon: Package, roles: ['System Admin', 'Storekeeper', 'GM'] },
    { name: t('app.reports'), path: '/reports', icon: BarChart2, roles: ['System Admin', 'GM', 'Finance', 'Auditor'] },
    { name: t('nav.assets'), path: '/assets', icon: Tag, roles: ['System Admin', 'Storekeeper'] },
    { name: t('nav.admin'), path: '/admin/users', icon: Users, roles: ['System Admin'] },
  ];


  const filteredNavItems = navItems.filter(item => user && item.roles.includes(user.role));

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Offline Banner */}
      {isOffline && (
        <div className="bg-red-500 text-white px-4 py-2 text-sm text-center flex items-center justify-center sticky top-0 z-50">
          <WifiOff className="h-4 w-4 mr-2" />
          {t('pwa.offline_banner')}
        </div>
      )}

      <div className="flex flex-1 h-0 overflow-hidden">
        {/* Mobile sidebar */}
        <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-primary h-full">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex-shrink-0 flex items-center px-4 text-white">
              <Globe className="h-8 w-8 mr-2" />
              <span className="text-xl font-bold">African Holding</span>
            </div>
            <div className="mt-5 flex-1 h-0 overflow-y-auto">
              <nav className="px-2 space-y-1">
                {filteredNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`${
                        isActive ? 'bg-secondary text-white' : 'text-gray-300 hover:bg-secondary hover:text-white'
                      } group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon className="mr-4 h-6 w-6" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Desktop sidebar */}
        <div className="hidden lg:flex lg:flex-shrink-0 h-full">
          <div className="flex flex-col w-64 h-full">
            <div className="flex flex-col h-full bg-primary pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4 text-white">
                <Globe className="h-8 w-8 mr-2" />
                <span className="text-xl font-bold">African Holding</span>
              </div>
              <div className="mt-8 flex-1 flex flex-col">
                <nav className="flex-1 px-2 space-y-1 bg-primary">
                  {filteredNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        className={`${
                          isActive ? 'bg-secondary text-white' : 'text-gray-300 hover:bg-secondary hover:text-white'
                        } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors`}
                      >
                        <Icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow-sm border-b border-gray-200">
            <button
              className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex-1 px-4 flex justify-between">
              <div className="flex-1 flex items-center">
                <h1 className="text-xl font-semibold text-gray-900 capitalize">
                  {location.pathname === '/' ? t('app.dashboard') : location.pathname.split('/')[1].replace(/-/g, ' ')}
                </h1>
              </div>
              <div className="ml-4 flex items-center md:ml-6 space-x-4">
                {/* Language Toggle */}
                <button onClick={toggleLanguage} className="flex items-center px-2 py-1 border rounded text-sm text-gray-700 hover:bg-gray-50">
                  {i18n.language === 'en' ? '🇪🇹 AM' : '🇬🇧 EN'}
                </button>

                <NotificationPanel />
                
                <div className="flex items-center space-x-3 pr-2">
                  <div className="hidden md:flex flex-col text-right">
                    <span className="text-sm font-medium text-gray-700">{user?.full_name}</span>
                    <span className="text-xs text-gray-500">{user?.role}</span>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                    <UserIcon className="h-5 w-5" />
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1 rounded-full text-gray-400 hover:text-gray-500 transition-colors"
                    title={t('app.logout')}
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <main className="flex-1 overflow-y-auto focus:outline-none">
            <div className="py-6">
              <div className="max-w-full px-4 sm:px-6 md:px-8">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* PWA Install Prompt */}
      {deferredPrompt && (
        <div className="fixed bottom-0 inset-x-0 pb-2 sm:pb-5 z-50">
          <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
            <div className="p-2 rounded-lg bg-primary shadow-lg sm:p-3">
              <div className="flex items-center justify-between flex-wrap">
                <div className="w-0 flex-1 flex items-center">
                  <span className="flex p-2 rounded-lg bg-secondary">
                    <Download className="h-6 w-6 text-white" aria-hidden="true" />
                  </span>
                  <p className="ml-3 font-medium text-white truncate">
                    <span className="md:hidden">Get the AHG app!</span>
                    <span className="hidden md:inline">Install the African Holding App for offline access.</span>
                  </p>
                </div>
                <div className="order-3 mt-2 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto">
                  <button
                    onClick={handleInstallApp}
                    className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary bg-white hover:bg-gray-50"
                  >
                    {t('pwa.install')}
                  </button>
                </div>
                <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-2">
                  <button
                    type="button"
                    onClick={() => setDeferredPrompt(null)}
                    className="-mr-1 flex p-2 rounded-md hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-white sm:-mr-2"
                  >
                    <X className="h-5 w-5 text-white" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
