import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from 'react-i18next';
import { 
  Globe, LayoutDashboard, FileText, Package, CheckSquare, 
  Users, BarChart2, LogOut, Menu, X, User as UserIcon, WifiOff, Download, Tag,
  ChevronRight, ChevronLeft, Search, HelpCircle, Settings, Bell, 
  FileBox, PieChart
} from 'lucide-react';
import toast from 'react-hot-toast';
import NotificationPanel from './NotificationPanel';
import { useSessionTimeout } from '../../hooks/useSessionTimeout';
import { useTheme } from '../../context/ThemeContext';
import DarkModeToggle from '../ui/DarkModeToggle';
import { Clock } from 'lucide-react';

export default function AppLayout() {
  const { user, logout, passwordExpiryWarning } = useAuthStore();
  const { showWarning, countdown, keepAlive, handleLogout: timeoutLogout } = useSessionTimeout();
  const { theme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar_collapsed');
    if (saved !== null) return JSON.parse(saved);
    return window.innerWidth >= 768 && window.innerWidth <= 1024;
  });
  
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

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

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

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
    { name: t('app.dashboard'), path: '/', icon: LayoutDashboard, roles: ['System Admin', 'GM', 'Finance', 'Storekeeper', 'Checker', 'Staff', 'Auditor', 'Authorized Signatory'], section: '' },
    
    // PROCUREMENT
    { name: t('nav.pr'), path: '/purchase-requisitions', icon: FileText, roles: ['System Admin', 'GM', 'Checker', 'Staff', 'Finance'], section: 'PROCUREMENT' },
    { name: t('nav.grn'), path: '/goods-receiving-notes', icon: Package, roles: ['System Admin', 'GM', 'Storekeeper', 'Finance'], section: 'PROCUREMENT' },
    { name: t('nav.siv'), path: '/store-issued-vouchers', icon: Package, roles: ['System Admin', 'GM', 'Storekeeper'], section: 'PROCUREMENT' },
    { name: t('nav.approvals'), path: '/approvals', icon: CheckSquare, roles: ['System Admin', 'GM', 'Checker', 'Finance'], section: 'PROCUREMENT' },
    
    // FINANCE
    { name: t('nav.prf'), path: '/payment-requests', icon: FileText, roles: ['System Admin', 'GM', 'Finance', 'Checker', 'Staff'], section: 'FINANCE' },
    { name: t('app.reports'), path: '/reports', icon: BarChart2, roles: ['System Admin', 'GM', 'Finance', 'Auditor'], section: 'FINANCE' },
    
    // INVENTORY
    { name: t('nav.inventory'), path: '/inventory', icon: Package, roles: ['System Admin', 'Storekeeper', 'GM'], section: 'INVENTORY' },
    { name: t('nav.assets'), path: '/assets', icon: Tag, roles: ['System Admin', 'Storekeeper'], section: 'INVENTORY' },

    // ADMIN
    { name: t('nav.admin'), path: '/admin/users', icon: Users, roles: ['System Admin'], section: 'ADMIN' },
    { name: 'Audit Logs', path: '/reports', icon: FileText, roles: ['System Admin'], section: 'ADMIN' },
  ];

  const filteredNavItems = navItems.filter(item => user && item.roles.includes(user.role));
  
  const sections = ['PROCUREMENT', 'FINANCE', 'INVENTORY', 'ADMIN'];

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(p => p);
    if (paths.length === 0) return [{ name: 'Dashboard', path: '/' }];
    return paths.map((p, i) => ({
      name: p.replace(/-/g, ' '),
      path: '/' + paths.slice(0, i + 1).join('/')
    }));
  };

  const SidebarContent = ({ mobile = false }) => {
    const collapsed = !mobile && isCollapsed;
    
    return (
      <div className={`flex flex-col h-full bg-sidebar-bg transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
        {/* Top: Logo Area */}
        <div className={`flex items-center h-14 px-4 border-b border-white/5 overflow-hidden transition-all duration-300 ease-in-out ${collapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 min-w-[32px] items-center justify-center rounded-lg bg-brand-primary transition-all duration-300">
              {theme?.logoUrl ? (
                <img src={theme.logoUrl} alt="Logo" className="h-5 w-5 object-contain" />
              ) : (
                <Globe className="h-5 w-5 text-white" />
              )}
            </div>
            {!collapsed && (
              <span className="text-sm font-bold tracking-tight text-white whitespace-nowrap animate-in fade-in duration-300">
                {theme?.brandName || 'African Holding'}
              </span>
            )}
          </div>
          {!collapsed && !mobile && (
            <button onClick={toggleSidebar} className="text-sidebar-text hover:text-white p-1 rounded-md transition-all duration-200 hover:bg-white/5">
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          {collapsed && (
            <button onClick={toggleSidebar} className="absolute left-[54px] top-4 bg-sidebar-bg border border-white/10 rounded-full p-0.5 text-sidebar-text hover:text-white z-50 hover:scale-110 transition-all">
              <ChevronRight className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* User Info */}
        {!collapsed && user && (
          <div className="px-4 py-4 border-b border-white/5 animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 min-w-[36px] rounded-full bg-brand-primary flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-brand-primary/20">
                {user.full_name.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user.full_name}</p>
                <span className={`inline-flex mt-1 px-2 py-0.5 rounded-brand text-[10px] font-black uppercase tracking-wider ${
                  user.role === 'System Admin' ? 'bg-red-500/20 text-red-400' :
                  user.role === 'GM' ? 'bg-purple-500/20 text-purple-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-2 py-4 space-y-6">
          {/* Dashboard Item (Top Level) */}
          <div className="space-y-1">
            {filteredNavItems.filter(i => !i.section).map(item => {
              const Icon = item.icon || FileText;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`group relative flex items-center h-10 px-3 rounded-lg transition-all duration-300 ease-in-out ${
                    isActive ? 'bg-sidebar-active-bg text-sidebar-active-text' : 'text-sidebar-text hover:bg-white/10 hover:text-white'
                  } ${collapsed ? 'justify-center' : ''}`}
                  title={collapsed ? item.name : ''}
                >
                  {isActive && <div className="absolute left-0 top-2 bottom-2 w-[3px] bg-brand-primary rounded-r-full" />}
                  <Icon className={`h-5 w-5 min-w-[20px] transition-all duration-300 ${collapsed ? '' : 'mr-3'}`} />
                  {!collapsed && <span className="text-sm font-medium whitespace-nowrap opacity-100 transition-opacity duration-300">{item.name}</span>}
                  {collapsed && <span className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[100] pointer-events-none">{item.name}</span>}
                </Link>
              );
            })}
          </div>

          {/* Sections */}
          {sections.map(section => {
            const items = filteredNavItems.filter(i => i.section === section);
            if (items.length === 0) return null;
            return (
              <div key={section} className="space-y-1">
                {!collapsed && (
                  <h3 className="px-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">{section}</h3>
                )}
                {items.map(item => {
                  const Icon = item.icon || FileText;
                  const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`group relative flex items-center h-10 px-3 rounded-lg transition-all duration-300 ease-in-out ${
                        isActive ? 'bg-sidebar-active-bg text-sidebar-active-text' : 'text-sidebar-text hover:bg-white/10 hover:text-white'
                      } ${collapsed ? 'justify-center' : ''}`}
                      title={collapsed ? item.name : ''}
                    >
                      {isActive && <div className="absolute left-0 top-2 bottom-2 w-[3px] bg-brand-primary rounded-r-full" />}
                      <Icon className={`h-5 w-5 min-w-[20px] transition-all duration-300 ${collapsed ? '' : 'mr-3'}`} />
                      {!collapsed && <span className="text-sm font-medium whitespace-nowrap opacity-100 transition-opacity duration-300">{item.name}</span>}
                      {collapsed && <span className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[100] pointer-events-none">{item.name}</span>}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Bottom Section */}
        <div className="p-2 border-t border-white/5 space-y-1">
          {user?.role === 'System Admin' && (
            <Link
              to="/settings"
              className={`flex items-center h-10 px-3 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-all ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? 'Settings' : ''}
            >
              <Settings className="h-5 w-5 min-w-[20px]" />
              {!collapsed && <span className="ml-3 text-sm font-medium">Settings</span>}
            </Link>
          )}

          <button
            onClick={toggleLanguage}
            className={`w-full flex items-center h-10 px-3 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-all ${collapsed ? 'justify-center' : ''}`}
          >
            <div className="h-5 w-5 min-w-[20px] flex items-center justify-center text-[10px] font-black border border-slate-700 rounded bg-slate-800">
              {i18n.language === 'en' ? 'EN' : 'AM'}
            </div>
            {!collapsed && <span className="ml-3 text-sm font-medium">Switch Language</span>}
          </button>

          <button
            onClick={handleLogout}
            className={`w-full flex items-center h-10 px-3 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? 'Logout' : ''}
          >
            <LogOut className="h-5 w-5 min-w-[20px]" />
            {!collapsed && <span className="ml-3 text-sm font-medium">Logout</span>}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen bg-page-bg flex overflow-hidden font-sans">
      {/* Sidebar for Desktop/Tablet */}
      <div className="hidden md:flex flex-shrink-0">
        <SidebarContent />
      </div>

      {/* Slide-out drawer for Mobile */}
      <div className={`fixed inset-0 z-50 md:hidden ${sidebarOpen ? 'visible' : 'invisible pointer-events-none'}`}>
        <div className={`absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setSidebarOpen(false)}></div>
        <div className={`absolute left-0 top-0 bottom-0 w-64 bg-[#0F172A] transform transition-transform duration-300 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <SidebarContent mobile />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header Redesign */}
        <header className="h-14 bg-card-bg border-b border-border flex items-center px-4 justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              className="p-2 -ml-2 text-slate-500 hover:text-slate-900 md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumbs */}
            <nav className="hidden sm:flex items-center gap-2 text-xs font-medium">
              <span className="text-text-muted">African Holding</span>
              {getBreadcrumbs().map((bc, i) => (
                <div key={bc.path} className="flex items-center gap-2">
                  <ChevronRight className="h-3 w-3 text-text-muted" />
                  <span className={i === getBreadcrumbs().length - 1 ? 'text-text-primary font-bold' : 'text-text-muted'}>
                    {bc.name.charAt(0).toUpperCase() + bc.name.slice(1)}
                  </span>
                </div>
              ))}
            </nav>
          </div>

          {/* Center: Cosmetic Search Bar */}
          <div className="hidden lg:flex flex-1 justify-center px-8">
            <div className="relative w-full max-w-[280px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
              <input 
                type="text" 
                placeholder="Search documents..." 
                className="w-full h-8 pl-9 pr-10 bg-page-bg border-none rounded-full text-xs font-medium focus:ring-2 focus:ring-accent/20 transition-all"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 tracking-tighter">
                ⌘K
              </div>
            </div>
          </div>

          {/* Right side row */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            <button className="p-2 text-text-muted hover:text-text-secondary hover:bg-page-bg rounded-lg transition-colors">
              <HelpCircle className="h-5 w-5" />
            </button>
            
            <DarkModeToggle />
            <NotificationPanel />

            <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>

            <div className="flex items-center gap-3">
               <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-bold text-text-primary">{user?.full_name}</span>
                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest leading-none">{user?.role}</span>
              </div>
              <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-white font-black text-xs shadow-lg shadow-accent/20">
                {user?.full_name.split(' ').map((n: string) => n[0]).join('')}
              </div>
            </div>
          </div>
        </header>

        {/* PASSWORD EXPIRY WARNING */}
        {passwordExpiryWarning && (
          <div className="mx-6 mt-4 p-4 bg-warning-light border border-warning/20 rounded-lg flex items-center justify-between animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-warning/10 rounded-md flex items-center justify-center">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm font-bold text-text-primary">{passwordExpiryWarning}</p>
                <p className="text-xs font-medium text-text-secondary">Update your password now to avoid being locked out.</p>
              </div>
            </div>
            <Link 
              to="/profile/change-password"
              className="px-4 py-2 bg-warning text-white text-[10px] font-black uppercase tracking-widest rounded-md hover:opacity-90 transition-all shadow-lg shadow-warning/20"
            >
              Change Now
            </Link>
          </div>
        )}

        {/* Offline Banner */}
        {isOffline && (
          <div className="bg-red-600 text-white px-4 py-1 text-[10px] font-black text-center flex items-center justify-center uppercase tracking-[0.2em] z-20">
            <WifiOff className="h-3 w-3 mr-2" />
            Offline Mode
          </div>
        )}

        {/* Scrollable Main View */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 animate-fade-in">
          <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* SESSION EXPIRE WARNING MODAL */}
      {showWarning && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl shadow-black/20 border border-slate-100 animate-in zoom-in-95 duration-300">
              <div className="flex flex-col items-center text-center">
                 <div className="h-20 w-20 bg-amber-50 rounded-full flex items-center justify-center mb-6 border border-amber-100 shadow-inner">
                    <Clock className="h-10 w-10 text-amber-500 animate-pulse" />
                 </div>
                 <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2 uppercase">Session Expiring Soon</h2>
                 <p className="text-slate-500 text-sm font-medium mb-8">
                    You will be logged out in <span className="font-black text-slate-900 underline">{countdown} seconds</span> due to inactivity.
                 </p>

                 {/* Countdown Number */}
                 <div className="text-7xl font-black text-amber-500 tracking-tighter tabular-nums mb-8 drop-shadow-sm">
                    {countdown}
                 </div>

                 {/* Progress Bar */}
                 <div className="w-full h-2 bg-slate-100 rounded-full mb-10 overflow-hidden">
                    <div 
                      className="h-full bg-red-500 transition-all duration-1000 ease-linear"
                      style={{ width: `${(countdown / 60) * 100}%` }}
                    />
                 </div>

                 <div className="flex flex-col w-full gap-3">
                    <button 
                      onClick={keepAlive}
                      className="w-full py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95"
                    >
                       Keep Me Logged In
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full py-4 bg-slate-50 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95"
                    >
                       Log Out Now
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
