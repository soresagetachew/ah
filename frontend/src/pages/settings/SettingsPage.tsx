import { useState, useEffect, useMemo } from 'react';
import { 
  Shield, Building2, GitBranch, FolderOpen, Truck, 
  Users, GitMerge, FileText, PiggyBank, Hash, 
  Bell, Lock, ClipboardList, Database, AlertTriangle,
  ChevronRight, Search, Loader2, Save, Palette
} from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import { useAuthStore } from '../../store/authStore';
import { Navigate } from 'react-router-dom';
import GeneralSettings from './sections/GeneralSettings';
import UsersSettings from './sections/UsersSettings';
import WorkflowSettings from './sections/WorkflowSettings';
import OrgSettings from './sections/OrgSettings';
import SecuritySettings from './sections/SecuritySettings';
import DocumentSettings from './sections/DocumentSettings';
import NotificationSettings from './sections/NotificationSettings';
import AuditSettings from './sections/AuditSettings';
import DangerZone from './sections/DangerZone';
import BrandSettings from './sections/BrandSettings';

type NavItem = {
  id: string;
  label: string;
  icon: any;
  category?: string;
  danger?: boolean;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { settings, isLoading, fetchSettings, updateSetting } = useSettingsStore();
  const [activeSection, setActiveSection] = useState('general');

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  if (!user || user.role !== 'System Admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  const navGroups: NavGroup[] = [
    {
      title: "ORGANIZATION",
      items: [
        { id: 'general', label: 'General Settings', icon: Building2, category: 'general' },
        { id: 'departments', label: 'Departments & Units', icon: GitBranch },
        { id: 'projects', label: 'Projects', icon: FolderOpen },
        { id: 'suppliers', label: 'Suppliers', icon: Truck },
        { id: 'appearance', label: 'Brand & Appearance', icon: Palette },
      ]
    },
    {
      title: "PEOPLE & ACCESS",
      items: [
        { id: 'users', label: 'Users & Roles', icon: Users },
        { id: 'permissions', label: 'Role Permissions', icon: Shield },
        { id: 'workflows', label: 'Approval Workflows', icon: GitMerge },
      ]
    },
    {
      title: "DOCUMENTS",
      items: [
        { id: 'documents', label: 'Document Settings', icon: FileText, category: 'documents' },
        { id: 'budget', label: 'Budget Rules', icon: PiggyBank, category: 'workflow' },
        { id: 'serial', label: 'Serial Numbers', icon: Hash, category: 'documents' },
      ]
    },
    {
      title: "SYSTEM",
      items: [
        { id: 'notifications', label: 'Notifications', icon: Bell, category: 'notifications' },
        { id: 'security', label: 'Security', icon: Lock, category: 'security' },
        { id: 'audit', label: 'Audit Log', icon: ClipboardList },
        { id: 'backup', label: 'Backup & Data', icon: Database, category: 'system' },
        { id: 'danger', label: 'Danger Zone', icon: AlertTriangle, danger: true },
      ]
    }
  ];

  const { activeLabel, activeCategory } = useMemo(() => {
    let label = 'Settings';
    let category = null;
    for (const group of navGroups) {
      const item = group.items.find(i => i.id === activeSection);
      if (item) {
        label = item.label;
        category = item.category;
        break;
      }
    }
    return { activeLabel: label, activeCategory: category };
  }, [activeSection, navGroups]);

  return (
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-4 lg:gap-8 pb-20 animate-in fade-in duration-700 px-4 lg:px-0">
      {/* NAVIGATION: Sidebar on Desktop, Dropdown on Mobile */}
      <aside className="w-full lg:w-[260px] shrink-0">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block bg-white rounded-2xl border border-slate-100 shadow-sm sticky top-6 self-start overflow-hidden">
          <div className="px-5 pt-6 pb-4">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Settings</h2>
          </div>
          
          <div className="px-4 mb-6">
            <div className="bg-blue-50 text-blue-700 rounded-xl px-4 py-2.5 flex items-center gap-3">
               <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Shield className="h-4 w-4" />
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Role</p>
                  <p className="text-xs font-bold whitespace-nowrap">System Administrator</p>
               </div>
            </div>
          </div>

          <nav className="pb-6">
            {navGroups.map((group) => (
              <div key={group.title} className="mb-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-6 py-2">
                  {group.title}
                </h3>
                <div className="px-2 space-y-0.5">
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                        activeSection === item.id 
                        ? 'bg-blue-50 text-blue-700 font-bold' 
                        : item.danger 
                          ? 'text-red-500 hover:bg-red-50' 
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <item.icon className={`w-4 h-4 ${activeSection === item.id ? 'text-blue-600' : ''}`} />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Mobile Dropdown Selector */}
        <div className="lg:hidden">
          <select
            value={activeSection}
            onChange={e => setActiveSection(e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white text-sm font-black text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none appearance-none shadow-sm min-h-[48px]"
          >
            {navGroups.map(group => (
              <optgroup key={group.title} label={group.title}>
                {group.items.map(item => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </aside>

      {/* RIGHT CONTENT AREA */}
      <main className="flex-1 min-w-0">
        <div className="mb-4 lg:mb-6 flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
           <span className="hidden lg:inline">Settings</span>
           <ChevronRight className="h-3 w-3 hidden lg:inline" />
           <span className="text-slate-900 lg:text-slate-400">{activeLabel}</span>
        </div>

        <div key={activeSection} className="bg-white rounded-2xl lg:rounded-[2.5rem] border border-slate-100 shadow-sm min-h-[500px] lg:min-h-[600px] overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
           {isLoading ? (
             <div className="flex flex-col items-center justify-center h-[500px] lg:h-[600px] opacity-20">
                <Loader2 className="h-10 w-10 animate-spin mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">Syncing Config...</p>
             </div>
           ) : (
             <SectionRenderer 
               category={activeCategory} 
               section={activeSection}
               settings={settings}
               onUpdate={updateSetting}
             />
           )}
        </div>
      </main>
    </div>
  );
}

// Dynamic section renderer based on category/section ID
function SectionRenderer({ category, section, settings, onUpdate }: any) {
  const categoryData = category ? settings[category] || [] : [];

  if (section === 'general') {
    return <GeneralSettings />;
  }

  if (section === 'users' || section === 'permissions') {
    return <UsersSettings />;
  }

  if (section === 'workflows' || section === 'budget') {
    return <WorkflowSettings />;
  }

  if (section === 'departments' || section === 'projects') {
    return <OrgSettings />;
  }

  if (section === 'security') {
    return <SecuritySettings />;
  }

  if (section === 'documents' || section === 'serials') {
    return <DocumentSettings />;
  }

  if (section === 'notifications') {
    return <NotificationSettings />;
  }

  if (section === 'audit' || section === 'system') {
    return <AuditSettings />;
  }

  if (section === 'danger') {
    return <DangerZone />;
  }

  if (section === 'appearance') {
    return <BrandSettings />;
  }

  if (['suppliers'].includes(section)) {
    return (
      <div className="p-12 flex flex-col items-center justify-center h-[500px] text-center">
         <div className="h-20 w-20 rounded-[2rem] bg-slate-50 flex items-center justify-center text-slate-300 mb-6 border border-slate-100">
            <Settings className="h-10 w-10" />
         </div>
         <h3 className="text-xl font-black text-slate-900 tracking-tight">{section.toUpperCase()} Module</h3>
         <p className="text-sm text-slate-500 mt-2 max-w-sm">
            This module is being migrated to the new unified settings architecture. 
            Please check back shortly for full interactive capabilities.
         </p>
      </div>
    );
  }

  return (
    <div className="p-10 lg:p-12 space-y-10">
      <div className="flex items-start justify-between gap-6">
        <div>
           <h2 className="text-2xl font-black text-slate-900 tracking-tight capitalize">{section.replace('_', ' ')} Settings</h2>
           <p className="text-sm text-slate-500 mt-1">Configure global parameters for the {category || 'system'} module.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {categoryData.map((s: any) => (
          <div key={s.key} className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-3xl border border-slate-50 hover:bg-slate-50/50 transition-all group">
             <div className="flex-1 space-y-1">
                <label className="text-sm font-black text-slate-900">{s.label}</label>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">{s.description}</p>
             </div>
             
             <div className="w-full md:w-80 flex items-center gap-3">
                {s.data_type === 'boolean' ? (
                  <button 
                    onClick={() => onUpdate(s.key, s.value === 'true' ? 'false' : 'true')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${s.value === 'true' ? 'bg-blue-600' : 'bg-slate-200'}`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${s.value === 'true' ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                ) : (
                  <input 
                    type={s.data_type === 'number' ? 'number' : 'text'}
                    defaultValue={s.value}
                    onBlur={(e) => {
                      if (e.target.value !== s.value) {
                        onUpdate(s.key, e.target.value);
                      }
                    }}
                    placeholder={s.is_sensitive ? '••••••••' : ''}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                  />
                )}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Settings(props: any) {
  return (
    <div className="p-4 bg-slate-100 rounded-lg">
      Placeholder
    </div>
  );
}
