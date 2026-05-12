import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Building2, ShieldCheck, Bell, Settings, 
  History, Save, Loader2, Globe, DollarSign, 
  Percent, Clock, Lock, Key, Mail, CheckCircle, 
  AlertCircle, ChevronRight, Briefcase
} from 'lucide-react';
import toast from 'react-hot-toast';
import client from '../../api/client';
import PageHeader from '../../components/layout/PageHeader';
import { useAuthStore } from '../../store/authStore';
import { Navigate } from 'react-router-dom';
import { SPACING } from '../../components/shared/DesignTokens';

type Section = 'organization' | 'procurement' | 'notifications' | 'security' | 'audit';

export default function AdminSettingsPage() {
  const { user } = useAuthStore();
  const [activeSection, setActiveSection] = useState<Section>('organization');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>({});
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Authorization check
  if (!user || user.role !== 'System Admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await client.get('/settings');
      setSettings(res.data);
    } catch (e) {
      toast.error('Failed to load system settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await client.get('/settings/audit');
      setAuditLogs(res.data);
    } catch (e) {
      toast.error('Failed to load audit logs');
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (activeSection === 'audit') {
      fetchAuditLogs();
    }
  }, [activeSection]);

  const handleSave = async (data: any, group: string) => {
    try {
      setSaving(true);
      
      // Prepare the update payload
      // The backend expects { settings: { key: value } }
      // We also include old/new values for audit logging in req.body
      const oldValues = settings[group] || {};
      const newValues = { ...oldValues, ...data };

      await client.post('/settings', { 
        settings: data,
        group,
        oldValues,
        newValues,
        id: group // For audit entity_id
      });
      
      toast.success('Configuration saved successfully');
      fetchSettings(); // Refresh local state
    } catch (e) {
      toast.error('Failed to update configuration');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`max-w-7xl mx-auto ${SPACING.cardGap} pb-20 animate-in fade-in duration-700`}>
      <PageHeader 
        title="Admin Settings"
        subtitle="Global system configuration, procurement rules, and security policies."
        breadcrumbs={[{ label: 'African Holding' }, { label: 'Administration' }, { label: 'Settings' }]}
      />

      <div className="flex flex-col lg:flex-row gap-8">
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-full lg:w-72 shrink-0">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden sticky top-24">
            <nav className="p-2 space-y-1">
              {[
                { id: 'organization', label: 'Organization', icon: Building2, desc: 'Profile and Localization' },
                { id: 'procurement', label: 'Procurement Rules', icon: Briefcase, desc: 'Thresholds and Limits' },
                { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'System Alerts and Mail' },
                { id: 'security', label: 'Security & Access', icon: Lock, desc: 'Policies and Tokens' },
                { id: 'audit', label: 'Audit Trail', icon: History, desc: 'System Change Logs' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id as Section)}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all group ${
                    activeSection === item.id 
                    ? 'bg-blue-50 text-blue-600 shadow-sm border-transparent' 
                    : 'text-slate-500 hover:bg-slate-50 border-transparent'
                  }`}
                >
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center transition-colors ${
                    activeSection === item.id ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-slate-600'
                  }`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold tracking-tight">{item.label}</p>
                    <p className="text-[10px] font-medium opacity-60 uppercase tracking-widest mt-0.5">{item.desc}</p>
                  </div>
                  {activeSection === item.id && <ChevronRight className="h-4 w-4 ml-auto" />}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 min-w-0">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm min-h-[600px] flex flex-col">
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-10 w-10 text-blue-500 animate-spin opacity-20" />
              </div>
            ) : (
              <div className="p-10">
                {activeSection === 'organization' && (
                  <OrganizationSection 
                    data={settings.organization || {}} 
                    onSave={(data) => handleSave(data, 'organization')} 
                    saving={saving} 
                  />
                )}
                {activeSection === 'procurement' && (
                  <ProcurementSection 
                    data={settings.procurement || {}} 
                    onSave={(data) => handleSave(data, 'procurement')} 
                    saving={saving} 
                  />
                )}
                {activeSection === 'notifications' && (
                  <NotificationSection 
                    data={settings.notifications || {}} 
                    onSave={(data) => handleSave(data, 'notifications')} 
                    saving={saving} 
                  />
                )}
                {activeSection === 'security' && (
                  <SecuritySection 
                    data={settings.security || {}} 
                    onSave={(data) => handleSave(data, 'security')} 
                    saving={saving} 
                  />
                )}
                {activeSection === 'audit' && (
                  <AuditSection logs={auditLogs} />
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// SUB-COMPONENTS FOR SECTIONS

function OrganizationSection({ data, onSave, saving }: any) {
  const { register, handleSubmit } = useForm({ defaultValues: data });
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div>
        <h3 className="text-xl font-black text-slate-900 tracking-tight">Organization Profile</h3>
        <p className="text-sm text-slate-500 mt-1">Configure your corporate identity and localization settings.</p>
      </div>

      <form onSubmit={handleSubmit(onSave)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Company Name</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input {...register('ORG_NAME')} className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-900" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Primary Currency</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <select {...register('CURRENCY')} className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-900 appearance-none">
                <option value="ETB">Ethiopian Birr (ETB)</option>
                <option value="USD">US Dollar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">VAT / Tax Rate (%)</label>
            <div className="relative">
              <Percent className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="number" {...register('TAX_RATE')} className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-900" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Regional Locale</label>
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input {...register('LOCALE')} placeholder="en-ET" className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-900" />
            </div>
          </div>
        </div>
        <div className="pt-6 border-t border-slate-50 flex justify-end">
          <button type="submit" disabled={saving} className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Profile Changes
          </button>
        </div>
      </form>
    </div>
  );
}

function ProcurementSection({ data, onSave, saving }: any) {
  const { register, handleSubmit } = useForm({ defaultValues: data });
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div>
        <h3 className="text-xl font-black text-slate-900 tracking-tight">Procurement Rules</h3>
        <p className="text-sm text-slate-500 mt-1">Set approval thresholds and financial constraints for requisitions.</p>
      </div>

      <form onSubmit={handleSubmit(onSave)} className="space-y-6">
        <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100 flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-blue-500 shrink-0" />
          <p className="text-xs text-blue-700 font-medium leading-relaxed">
            These thresholds determine which role is required to authorize documents. 
            Changing these values will affect the routing of all new requisitions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Requisition Limits</h4>
             <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 ml-1">Checker Review Threshold (ETB)</label>
                <input type="number" {...register('PR_THRESHOLD_CHECKER')} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-900" />
                <p className="text-[10px] text-slate-400 ml-1 italic">PRs above this amount require a department Checker review.</p>
             </div>
             <div className="space-y-2 pt-2">
                <label className="text-xs font-black text-slate-700 ml-1">GM Approval Threshold (ETB)</label>
                <input type="number" {...register('PR_THRESHOLD_GM')} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-900" />
                <p className="text-[10px] text-slate-400 ml-1 italic">PRs above this amount require General Manager authorization.</p>
             </div>
          </div>

          <div className="space-y-4">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Financial Policies</h4>
             <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 ml-1">Max PRF Daily Limit (ETB)</label>
                <input type="number" {...register('PRF_DAILY_LIMIT')} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-900" />
             </div>
             <div className="space-y-2 pt-2">
                <label className="text-xs font-black text-slate-700 ml-1">Default Payment Term (Days)</label>
                <input type="number" {...register('DEFAULT_PAYMENT_TERM')} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-900" />
             </div>
          </div>
        </div>
        <div className="pt-6 border-t border-slate-50 flex justify-end">
          <button type="submit" disabled={saving} className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Workflow Rules
          </button>
        </div>
      </form>
    </div>
  );
}

function NotificationSection({ data, onSave, saving }: any) {
  const { register, handleSubmit } = useForm({ defaultValues: data });
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div>
        <h3 className="text-xl font-black text-slate-900 tracking-tight">Notification Channels</h3>
        <p className="text-sm text-slate-500 mt-1">Manage how users are notified of workflow changes.</p>
      </div>

      <form onSubmit={handleSubmit(onSave)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-6">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">SMTP Configuration</h4>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 ml-1">SMTP Host</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input {...register('SMTP_HOST')} className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-900" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 ml-1">Sender Email</label>
                <input {...register('SENDER_EMAIL')} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-900" />
              </div>
           </div>

           <div className="space-y-6">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Event Subscriptions</h4>
              <div className="space-y-4">
                 {[
                   { key: 'NOTIFY_PR_SUBMITTED', label: 'PR Submissions' },
                   { key: 'NOTIFY_PR_APPROVED', label: 'PR Approvals' },
                   { key: 'NOTIFY_LOW_STOCK', label: 'Low Stock Alerts' },
                   { key: 'NOTIFY_GRN_CREATED', label: 'GRN Receipts' }
                 ].map(opt => (
                    <label key={opt.key} className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl hover:bg-slate-50/50 transition-all cursor-pointer group">
                       <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">{opt.label}</span>
                       <input type="checkbox" {...register(opt.key)} className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    </label>
                 ))}
              </div>
           </div>
        </div>
        <div className="pt-6 border-t border-slate-50 flex justify-end">
          <button type="submit" disabled={saving} className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Update Channels
          </button>
        </div>
      </form>
    </div>
  );
}

function SecuritySection({ data, onSave, saving }: any) {
  const { register, handleSubmit } = useForm({ defaultValues: data });
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div>
        <h3 className="text-xl font-black text-slate-900 tracking-tight">Security & Access Control</h3>
        <p className="text-sm text-slate-500 mt-1">Configure system-wide security policies and session management.</p>
      </div>

      <form onSubmit={handleSubmit(onSave)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Password Policy</h4>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 ml-1">Minimum Length</label>
                <div className="relative">
                   <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                   <input type="number" {...register('PASSWORD_MIN_LENGTH')} className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-900" />
                </div>
              </div>
              <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer">
                 <input type="checkbox" {...register('REQUIRE_SPECIAL_CHAR')} className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                 <span className="text-xs font-black text-slate-700 uppercase tracking-wide">Require Special Characters</span>
              </label>
           </div>

           <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Session Management</h4>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 ml-1">Idle Timeout (Minutes)</label>
                <div className="relative">
                   <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                   <input type="number" {...register('SESSION_TIMEOUT')} className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-900" />
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <label className="text-xs font-black text-slate-700 ml-1">System Secret Key</label>
                <div className="relative">
                   <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                   <input type="password" value="••••••••••••••••" disabled className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed" />
                </div>
                <p className="text-[9px] text-amber-600 font-bold uppercase ml-1 italic tracking-widest">Managed via Environment Variables</p>
              </div>
           </div>
        </div>
        <div className="pt-6 border-t border-slate-50 flex justify-end">
          <button type="submit" disabled={saving} className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Update Policies
          </button>
        </div>
      </form>
    </div>
  );
}

function AuditSection({ logs }: { logs: any[] }) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div>
        <h3 className="text-xl font-black text-slate-900 tracking-tight">System Audit Trail</h3>
        <p className="text-sm text-slate-500 mt-1">Review the historical log of all administrative actions and configuration changes.</p>
      </div>

      <div className="rounded-2xl border border-slate-100 overflow-hidden">
         <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
               <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Entity</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">IP Address</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
               {logs.map((log) => (
                 <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                       <span className="text-sm font-bold text-slate-900">{log.user_name}</span>
                    </td>
                    <td className="px-6 py-4">
                       <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100">
                          {log.action.replace('_', ' ')}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{log.entity_type} {log.entity_id && `(${log.entity_id})`}</span>
                    </td>
                    <td className="px-6 py-4">
                       <p className="text-xs font-bold text-slate-900">{new Date(log.created_at).toLocaleDateString()}</p>
                       <p className="text-[9px] text-slate-400 font-bold uppercase">{new Date(log.created_at).toLocaleTimeString()}</p>
                    </td>
                    <td className="px-6 py-4 font-mono text-[10px] text-slate-400">{log.ip_address}</td>
                 </tr>
               ))}
            </tbody>
         </table>
      </div>
    </div>
  );
}
