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
import { CompanyLogo } from '../brand/CompanyLogo';
import DarkModeToggle from '../ui/DarkModeToggle';
import { Clock } from 'lucide-react';

export default function AppLayout() {
  const { user, logout, passwordExpiryWarning } = useAuthStore();
  const { showWarning, countdown, keepAlive, handleLogout: timeoutLogout } = useSessionTimeout();
  const { theme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
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
    localStorage.setItem('sidebar_collapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Close drawer when route changes (user tapped a nav link)
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

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

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

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
    { name: 'Settings', path: '/settings', icon: Settings, roles: ['System Admin'], section: 'ADMIN' },
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

  const SidebarNav = ({ mobile = false }) => {
    return (
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
        {/* Dashboard Item (Top Level) */}
        <div className="space-y-1">
          {filteredNavItems.filter(i => !i.section).map(item => {
            const Icon = item.icon || FileText;
            const isActive = location.pathname === item.path;
            const collapsed = !mobile && sidebarCollapsed;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`group relative flex items-center h-12 md:h-10 px-3 rounded-xl transition-all duration-200 ease-in-out ${
                  isActive ? 'bg-brand-primary/10 text-brand-primary' : 'text-sidebar-text hover:bg-white/5 hover:text-white'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.name : ''}
              >
                {isActive && <div className="absolute left-0 top-2 bottom-2 w-1 bg-brand-primary rounded-r-full" />}
                <Icon className={`h-5 w-5 min-w-[20px] transition-all duration-200 ${collapsed ? '' : 'mr-3'}`} />
                {!collapsed && <span className="text-sm font-semibold whitespace-nowrap opacity-100 transition-opacity duration-200">{item.name}</span>}
                {collapsed && <span className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-[10px] font-bold tracking-wider rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[100] pointer-events-none shadow-lg">{item.name}</span>}
              </Link>
            );
          })}
        </div>

        {/* Sections */}
        {sections.map(section => {
          const items = filteredNavItems.filter(i => i.section === section);
          if (items.length === 0) return null;
          return (
            <div key={section} className="space-y-1 pt-2">
              {!(!mobile && sidebarCollapsed) && (
                <h3 className="px-3 text-[10px] font-black text-sidebar-text/50 uppercase tracking-[0.2em] mb-3">{section}</h3>
              )}
              {items.map(item => {
                const Icon = item.icon || FileText;
                const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                const collapsed = !mobile && sidebarCollapsed;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`group relative flex items-center h-12 md:h-10 px-3 rounded-xl transition-all duration-200 ease-in-out ${
                      isActive ? 'bg-brand-primary/10 text-brand-primary' : 'text-sidebar-text hover:bg-white/5 hover:text-white'
                    } ${collapsed ? 'justify-center' : ''}`}
                    title={collapsed ? item.name : ''}
                  >
                    {isActive && <div className="absolute left-0 top-2 bottom-2 w-1 bg-brand-primary rounded-r-full" />}
                    <Icon className={`h-5 w-5 min-w-[20px] transition-all duration-200 ${collapsed ? '' : 'mr-3'}`} />
                    {!collapsed && <span className="text-sm font-semibold whitespace-nowrap opacity-100 transition-opacity duration-200">{item.name}</span>}
                    {collapsed && <span className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-[10px] font-bold tracking-wider rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[100] pointer-events-none shadow-lg">{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>
    );
  };

  return (
    <div className="h-screen bg-page-bg flex overflow-hidden font-sans">
      {/* Desktop sidebar — hidden on mobile */}
      <aside className={`
        hidden lg:flex lg:flex-col
        fixed top-0 left-0 h-full z-30
        transition-all duration-300
        ${sidebarCollapsed ? 'w-16' : 'w-60'}
        bg-sidebar-bg border-r border-sidebar-border
      `}>
        {/* Top: Logo Area */}
        <div className={`flex items-center h-14 px-4 border-b border-white/5 overflow-hidden transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-3">
            <CompanyLogo variant={sidebarCollapsed ? 'icon' : 'full'} size="md" />
          </div>
          {!sidebarCollapsed && (
            <button onClick={toggleSidebar} className="text-sidebar-text hover:text-white p-1 rounded-md transition-all duration-200 hover:bg-white/5">
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          {sidebarCollapsed && (
            <button onClick={toggleSidebar} className="absolute left-[54px] top-4 bg-sidebar-bg border border-white/10 rounded-full p-0.5 text-sidebar-text hover:text-white z-50 hover:scale-110 transition-all">
              <ChevronRight className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* User Info */}
        {!sidebarCollapsed && user && (
          <div className="px-4 py-4 border-b border-white/5 animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 min-w-[36px] rounded-full bg-brand-primary flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-brand-primary/20">
                {user.full_name.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user.full_name}</p>
                <span className="text-[10px] text-sidebar-text font-black uppercase tracking-widest">{user.role}</span>
              </div>
            </div>
          </div>
        )}

        <SidebarNav />

        {/* Bottom Section */}
        <div className="p-2 border-t border-white/5 space-y-1">
          <button
            onClick={toggleLanguage}
            className={`w-full flex items-center h-10 px-3 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-all ${sidebarCollapsed ? 'justify-center' : ''}`}
          >
            <div className="h-5 w-5 min-w-[20px] flex items-center justify-center text-[10px] font-black border border-slate-700 rounded bg-slate-800">
              {i18n.language === 'en' ? 'EN' : 'AM'}
            </div>
            {!sidebarCollapsed && <span className="ml-3 text-sm font-medium">Switch Language</span>}
          </button>

          <button
            onClick={handleLogout}
            className={`w-full flex items-center h-10 px-3 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all ${sidebarCollapsed ? 'justify-center' : ''}`}
          >
            <LogOut className="h-5 w-5 min-w-[20px]" />
            {!sidebarCollapsed && <span className="ml-3 text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile slide-out drawer */}
      <aside className={`
        fixed top-0 left-0 h-full z-50 w-72
        bg-sidebar-bg
        transform transition-transform duration-300 ease-out
        lg:hidden
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col
        shadow-2xl
      `}>
        <div className="flex items-center justify-between px-4 py-4 border-b border-sidebar-border">
          <CompanyLogo variant="full" size="md" />
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-xl text-sidebar-text hover:bg-white/10 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 py-3 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-white font-semibold text-sm">
              {user?.full_name?.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.full_name}</p>
              <p className="text-xs text-sidebar-text truncate font-black uppercase tracking-widest">{user?.role}</p>
            </div>
          </div>
        </div>

        <SidebarNav mobile />

        <div className="px-4 py-4 border-t border-sidebar-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-sidebar-text hover:text-white transition-colors w-full min-h-[44px] px-3 rounded-xl hover:bg-white/10"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-y-auto">
        <header className={`
          fixed top-0 right-0 z-20
          h-14 bg-surface border-b border-border
          flex items-center px-4 gap-3
          ${sidebarCollapsed ? 'lg:left-16' : 'lg:left-60'} left-0
          transition-all duration-300
        `}>
          <button
            className="lg:hidden p-2 rounded-xl hover:bg-background min-w-[44px] min-h-[44px] flex items-center justify-center text-text-secondary transition-colors"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-text-primary truncate lg:text-base">
              {getBreadcrumbs()[getBreadcrumbs().length - 1].name.charAt(0).toUpperCase() + getBreadcrumbs()[getBreadcrumbs().length - 1].name.slice(1)}
            </h1>
            <nav className="hidden lg:flex items-center gap-2 text-xs font-medium text-text-muted">
              <span>African Holding</span>
              {getBreadcrumbs().map((bc) => (
                <div key={bc.path} className="flex items-center gap-2">
                  <ChevronRight className="h-3 w-3" />
                  <span>{bc.name.charAt(0).toUpperCase() + bc.name.slice(1)}</span>
                </div>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-1">
             <div className="hidden lg:flex">
                <DarkModeToggle />
             </div>
             <NotificationPanel />
             <button className="w-8 h-8 rounded-full bg-accent text-white font-semibold text-sm flex items-center justify-center min-w-[44px] min-h-[44px]">
               {user?.full_name?.charAt(0)}
             </button>
          </div>
        </header>

        {/* Main Content Area with Dynamic Padding */}
        <main className={`
          pt-14 min-h-screen
          ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-60'} pl-0
          bg-background
          transition-all duration-300
        `}>
          {/* PASSWORD EXPIRY WARNING */}
          {passwordExpiryWarning && (
            <div className="mx-4 sm:mx-6 mt-4 p-4 bg-warning-light border border-warning/20 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-warning/10 rounded-md flex items-center justify-center">
                   <Clock className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm font-bold text-text-primary">{passwordExpiryWarning}</p>
                  <p className="text-xs font-medium text-text-secondary">Update your password soon.</p>
                </div>
              </div>
              <Link 
                to="/profile/change-password"
                className="px-4 py-2 bg-warning text-white text-[10px] font-black uppercase tracking-widest rounded-md hover:opacity-90 transition-all"
              >
                Update
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

          <div className="p-4 lg:p-6 xl:p-8 max-w-[1400px] mx-auto">
            <Outlet />
          </div>

          {/* Bottom nav — mobile only */}
          <nav className="
            fixed bottom-0 left-0 right-0 z-20
            bg-surface border-t border-border
            lg:hidden
            safe-area-inset-bottom
          ">
            <div className="flex items-center justify-around px-2 py-2">
              {[
                { href: '/', icon: LayoutDashboard, label: 'Home' },
                { href: '/purchase-requisitions', icon: FileText, label: 'PRs' },
                { href: '/approvals', icon: CheckSquare, label: 'Approvals' },
                { href: '/inventory', icon: Package, label: 'Stock' },
                { href: '/reports', icon: BarChart2, label: 'Reports' },
              ]
              .map(item => {
                const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="flex flex-col items-center gap-0.5 px-3 py-1 min-w-[44px] min-h-[44px] justify-center relative"
                  >
                    <div className={`relative p-1.5 rounded-xl transition-colors ${isActive ? 'bg-accent/10' : ''}`}>
                      <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-accent' : 'text-text-muted'}`} />
                    </div>
                    <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-accent' : 'text-text-muted'}`}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>
          {/* Bottom padding */}
          <div className="h-16 lg:hidden" />
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
