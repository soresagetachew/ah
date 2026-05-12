import { useState, useEffect, useMemo } from 'react';
import { 
  Building2, GitBranch, FolderOpen, Truck, 
  Users, Shield, GitMerge, FileText, PiggyBank, Hash, 
  Bell, Lock, ClipboardList, Database, AlertTriangle,
  Palette
} from 'lucide-react';
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
import { SettingsSelect } from '../../components/settings/ui';

type NavItem = {
  id: string;
  label: string;
  icon: any;
  category?: string;
  danger?: boolean;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [activeSection, setActiveSection] = useState('general');

  if (!user || user.role !== 'System Admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  const navGroups: NavGroup[] = [
    {
      label: "ORGANIZATION",
      items: [
        { id: 'general', label: 'General Settings', icon: Building2 },
        { id: 'departments', label: 'Departments & Units', icon: GitBranch },
        { id: 'projects', label: 'Projects', icon: FolderOpen },
        { id: 'suppliers', label: 'Suppliers', icon: Truck },
        { id: 'appearance', label: 'Brand & Appearance', icon: Palette },
      ]
    },
    {
      label: "PEOPLE & ACCESS",
      items: [
        { id: 'users', label: 'Users & Roles', icon: Users },
        { id: 'permissions', label: 'Role Permissions', icon: Shield },
        { id: 'workflows', label: 'Approval Workflows', icon: GitMerge },
      ]
    },
    {
      label: "DOCUMENTS",
      items: [
        { id: 'documents', label: 'Document Settings', icon: FileText },
        { id: 'budget', label: 'Budget Rules', icon: PiggyBank },
        { id: 'serial', label: 'Serial Numbers', icon: Hash },
      ]
    },
    {
      label: "SYSTEM",
      items: [
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'audit', label: 'Audit Log', icon: ClipboardList },
        { id: 'backup', label: 'Backup & Data', icon: Database },
        { id: 'danger', label: 'Danger Zone', icon: AlertTriangle, danger: true },
      ]
    }
  ];

  const allSections = useMemo(() => {
    const sections: NavItem[] = [];
    navGroups.forEach(group => {
      group.items.forEach(item => sections.push(item));
    });
    return sections;
  }, [navGroups]);

  const renderSection = (sectionId: string) => {
    if (sectionId === 'general') return <GeneralSettings />;
    if (sectionId === 'users' || sectionId === 'permissions') return <UsersSettings />;
    if (sectionId === 'workflows' || sectionId === 'budget') return <WorkflowSettings />;
    if (sectionId === 'departments' || sectionId === 'projects') return <OrgSettings />;
    if (sectionId === 'security') return <SecuritySettings />;
    if (sectionId === 'documents' || sectionId === 'serial') return <DocumentSettings />;
    if (sectionId === 'notifications') return <NotificationSettings />;
    if (sectionId === 'audit' || sectionId === 'backup') return <AuditSettings />;
    if (sectionId === 'danger') return <DangerZone />;
    if (sectionId === 'appearance') return <BrandSettings />;
    if (sectionId === 'suppliers') {
      return (
        <div className="p-12 flex flex-col items-center justify-center h-[500px] text-center">
           <div className="h-20 w-20 rounded-[2rem] bg-slate-50 flex items-center justify-center text-slate-300 mb-6 border border-slate-100">
              <Palette className="h-10 w-10" />
           </div>
           <h3 className="text-xl font-black text-slate-900 tracking-tight">Suppliers Module</h3>
           <p className="text-sm text-slate-500 mt-2 max-w-sm">
              This module is being migrated to the new unified settings architecture. 
              Please check back shortly for full interactive capabilities.
           </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* PAGE HEADER */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              Settings
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage your organization settings and preferences
            </p>
          </div>
          {/* Health check status badge */}
          <div className="hidden sm:flex items-center gap-2 text-xs
                          text-emerald-600 bg-emerald-50 border border-emerald-200
                          rounded-full px-3 py-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500
                           inline-block" />
            All systems normal
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-6">
          {/* SIDEBAR NAV */}
          <aside className="hidden lg:block w-[220px] flex-shrink-0">
            <nav className="bg-white border border-slate-200 rounded-xl
                            overflow-hidden sticky top-6">
              {navGroups.map(group => (
                <div key={group.label}>
                  {/* Group header */}
                  <div className="px-4 pt-4 pb-1.5">
                    <span className="text-[10px] font-bold text-slate-400
                                     uppercase tracking-widest">
                      {group.label}
                    </span>
                  </div>
                  {/* Nav items */}
                  {group.items.map(item => (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`
                        w-full flex items-center gap-2.5 px-4 py-2 text-left
                        text-xs font-medium transition-colors duration-100
                        ${activeSection === item.id
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }
                      `}
                    >
                      <item.icon className={`w-3.5 h-3.5 flex-shrink-0 ${
                        activeSection === item.id ? 'text-blue-500' : 'text-slate-400'
                      }`} />
                      {item.label}
                    </button>
                  ))}
                  {/* Divider between groups */}
                  <div className="border-t border-slate-100 mx-4 my-1" />
                </div>
              ))}
            </nav>
          </aside>

          {/* MAIN CONTENT */}
          <main className="flex-1 min-w-0">
            {/* Mobile section picker */}
            <div className="lg:hidden mb-4">
              <SettingsSelect
                value={activeSection}
                onChange={e => setActiveSection(e.target.value)}
                options={allSections.map(s => ({ value: s.id, label: s.label }))}
              />
            </div>

            {/* Active section renders here */}
            <div className="space-y-4">
              {renderSection(activeSection)}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
