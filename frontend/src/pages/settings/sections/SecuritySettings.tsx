// @ts-nocheck
import { useState, useEffect } from 'react';
import { Lock, Shield, Clock, ClipboardList, Loader2, AlertTriangle, ShieldCheck, Monitor, Smartphone, Globe, RefreshCw, LogOut, Search, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import client from '../../../api/client';
import { Modal } from '../../../components/ui/Modal';
import {
  SettingsCard,
  SettingsField,
  SettingsInput,
  SettingsSelect,
  SettingsTextarea,
  SettingsToggle,
  SettingsToggleRow,
  SettingsDivider,
  SettingsSaveBar,
  SettingsAlert,
  SettingsBadge,
  SettingsTable,
  SettingsSectionHeader,
} from '../../../components/settings/ui';

type Tab = 'password' | 'timeout' | 'sessions' | 'log';

export default function SecuritySettings() {
  const [activeTab, setActiveTab] = useState<Tab>('password');

  return (
    <div className="p-5 space-y-4 animate-in fade-in duration-500">
      <div className="flex gap-1 p-1 bg-slate-100 rounded-lg w-fit mx-auto lg:mx-0">
        {[
          { id: 'password', label: 'Password', icon: Lock },
          { id: 'timeout', label: 'Session', icon: Clock },
          { id: 'sessions', label: 'Sessions', icon: Monitor },
          { id: 'log', label: 'Log', icon: ClipboardList },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as Tab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium uppercase tracking-widest transition-all ${activeTab === t.id ? 'bg-white text-blue-500 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            <t.icon className="h-3.5 w-3.5" /> <span className="hidden sm:inline">{t.label}</span><span className="sm:hidden">{t.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'password' && <PasswordTab />}
      {activeTab === 'timeout' && <SessionControlTab />}
      {activeTab === 'sessions' && <ActiveSessionsTab />}
      {activeTab === 'log' && <SecurityLogTab />}
    </div>
  );
}

// --- TAB 1: PASSWORD POLICY ---

function PasswordTab() {
  const [lockedAccounts, setLockedAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLocked = async () => {
    try {
      setLoading(true);
      const res = await client.get('/settings/security/locked-accounts');
      setLockedAccounts(res.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchLocked(); }, []);

  const handleUnlock = async (id: string) => {
    try {
      await client.post(`/settings/security/unlock/${id}`);
      toast.success('Account unlocked');
      fetchLocked();
    } catch (e) { toast.error('Unlock failed'); }
  };

  return (
    <div className="space-y-4">
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* REQUIREMENTS */}
          <SettingsCard
            title="Password Requirements"
            description="Enforce complexity rules for all user credentials."
            icon={Lock}
          >
             <div className="space-y-4">
                {[
                  { label: 'Minimum Length', val: '12 chars', checked: true },
                  { label: 'Uppercase Letters (A-Z)', checked: true },
                  { label: 'Numeric Values (0-9)', checked: true },
                  { label: 'Special Characters (!@#)', checked: true },
                  { label: 'Password Expiry (90 days)', checked: false },
                ].map(item => (
                  <SettingsToggleRow
                    key={item.label}
                    label={item.label}
                    checked={item.checked}
                    onChange={() => {}}
                  />
                ))}
             </div>

             <SettingsDivider />

             <div>
                <SettingsSectionHeader title="Strength Indicator Preview" />
                <div className="bg-slate-900 rounded-lg p-4 text-center font-mono">
                   <p className="text-emerald-400 text-base font-semibold tracking-widest">Th!s-1s-S3cur3</p>
                   <div className="mt-4 flex gap-1 justify-center">
                      {[1,2,3,4,5].map(i => <div key={i} className="h-1 w-8 rounded-full bg-emerald-500" />)}
                   </div>
                   <p className="text-[9px] font-medium text-emerald-500 uppercase tracking-[0.2em] mt-2">Maximum Entropy Policy</p>
                </div>
             </div>
          </SettingsCard>

          {/* LOCKOUTS */}
          <SettingsCard
            title="Account Lockout"
            description="Manage users who have exceeded login attempt limits."
            icon={AlertTriangle}
          >
             <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                   <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Max Attempts</span>
                   <span className="text-xs font-semibold text-slate-900">5 Failed Logins</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                   <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Duration</span>
                   <span className="text-xs font-semibold text-slate-900">30 Minutes</span>
                </div>
             </div>

             <SettingsDivider />

             <div>
                <SettingsSectionHeader title="Currently Locked" />
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin opacity-10 mx-auto" />
                ) : lockedAccounts.length === 0 ? (
                  <div className="flex flex-col items-center py-6 text-emerald-500">
                     <ShieldCheck className="h-10 w-10 mb-2 opacity-20" />
                     <p className="text-xs font-medium uppercase tracking-widest">No Locked Accounts</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                     {lockedAccounts.map(u => (
                        <div key={u.id} className="flex items-center justify-between p-3 border border-red-100 bg-red-50/30 rounded-lg">
                           <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-red-100 text-red-500 flex items-center justify-center font-semibold text-[10px]">
                                 {u.full_name.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                 <p className="text-xs font-semibold text-slate-900">{u.full_name}</p>
                                 <p className="text-[9px] font-normal text-red-400 uppercase tracking-widest">Locked out</p>
                              </div>
                           </div>
                           <button
                             onClick={() => handleUnlock(u.id)}
                             className="px-3 h-9 text-red-500 hover:bg-red-500 hover:text-white rounded-lg text-xs font-medium transition-all"
                           >
                              Unlock
                           </button>
                        </div>
                     ))}
                  </div>
                )}
             </div>
          </SettingsCard>
       </div>

       {/* NUCLEAR RESET */}
       <SettingsAlert type="warning" icon={RefreshCw}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
             <div className="flex-1">
                <SettingsSectionHeader 
                  title="Mass Credential Reset"
                  description="This operation will invalidate all current passwords and force every user in the system to establish new credentials on their next login attempt. Use only during major policy updates."
                />
             </div>
             <button className="px-6 h-9 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-medium transition-all">
             Force System-Wide Reset
             </button>
          </div>
       </SettingsAlert>
    </div>
  );
}

// --- TAB 2: SESSION CONTROL ---

function SessionControlTab() {
  return (
    <div className="max-w-4xl space-y-4">
       <SettingsCard
         title="Session Lifecycle"
         description="Configure automated logout behaviors and session concurrency limits."
         icon={Clock}
       >
          <div className="space-y-4">
             <div className="space-y-4">
                <div className="flex items-center justify-between mb-5">
                   <SettingsSectionHeader title="Inactivity Timeout" />
                   <span className="text-xs font-medium text-blue-500 bg-blue-50 px-3 py-1 rounded-full">30 Minutes</span>
                </div>
                <input type="range" min="5" max="480" defaultValue="30" className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                <div className="flex justify-between text-[9px] font-medium text-slate-300 uppercase tracking-widest">
                   <span>5 min</span>
                   <span>8 hours</span>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SettingsField label="Max Concurrent Sessions" description="Limit active sessions per user (0 = unlimited)">
                   <SettingsInput type="number" defaultValue={2} />
                </SettingsField>
                <SettingsField label="Remember Me Duration">
                   <SettingsSelect
                     options={[
                       { value: '7', label: '7 Days' },
                       { value: '14', label: '14 Days' },
                       { value: '30', label: '30 Days' },
                       { value: 'disabled', label: 'Disabled' }
                     ]}
                   />
                </SettingsField>
             </div>

             <SettingsDivider />

             <div className="space-y-4">
                <SettingsToggleRow
                  label="Detect New Device Login"
                  description="Notify users via email when a login occurs from an unrecognized device"
                  checked={true}
                  onChange={() => {}}
                />
                <SettingsToggleRow
                  label="Device Fingerprinting"
                  description="Collect browser and hardware metadata to prevent session hijacking"
                  checked={false}
                  onChange={() => {}}
                />
             </div>
          </div>

          <SettingsSaveBar
            onSave={() => {}}
            isSaving={false}
            saveLabel="Save Session Policy"
          />
       </SettingsCard>
    </div>
  );
}

// --- TAB 3: ACTIVE SESSIONS ---

function ActiveSessionsTab() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await client.get('/settings/security/sessions');
      setSessions(res.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchSessions(); }, []);

  const handleTerminate = async (id: string) => {
    try {
      await client.delete(`/settings/security/sessions/${id}`);
      toast.success('Session invalidated');
      fetchSessions();
    } catch (e) { toast.error('Termination failed'); }
  };

  return (
    <div className="space-y-4">
       <div className="flex items-center justify-between">
          <SettingsSectionHeader 
            title="Active Identity Nodes"
            description="Monitor and manage all live connections across the organization."
          />
          <button
            onClick={fetchSessions}
            className="flex items-center gap-2 px-4 h-9 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200 transition-all"
          >
             <RefreshCw className="h-3.5 w-3.5" /> Synchronize
          </button>
       </div>

       <SettingsTable
         columns={[
           {
             key: 'user',
             header: 'User / Identity',
             render: (s: any) => (
               <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-semibold text-xs border border-slate-200">
                     {s.full_name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                     <p className="text-sm font-semibold text-slate-900">{s.full_name}</p>
                     <SettingsBadge color="blue">{s.role}</SettingsBadge>
                  </div>
               </div>
             )
           },
           {
             key: 'device',
             header: 'Device & Browser',
             render: (s: any) => (
               <div className="flex items-center gap-3">
                  {s.device_type === 'mobile' ? <Smartphone className="h-4 w-4 text-slate-400" /> : <Monitor className="h-4 w-4 text-slate-400" />}
                  <div>
                     <p className="text-xs font-semibold text-slate-700">{s.user_agent?.split(' ')[0] || 'Unknown Agent'}</p>
                     <p className="text-[9px] text-slate-400 font-normal uppercase tracking-widest">{s.device_type || 'Desktop Terminal'}</p>
                  </div>
               </div>
             )
           },
           {
             key: 'location',
             header: 'Location / IP',
             render: (s: any) => (
               <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-slate-400" />
                  <div>
                     <p className="text-xs font-semibold text-slate-700">{s.location || 'Addis Ababa, ET'}</p>
                     <p className="text-[9px] text-slate-400 font-normal tabular-nums">{s.ip_address}</p>
                  </div>
               </div>
             )
           },
           {
             key: 'activity',
             header: 'Last Activity',
             render: (s: any) => (
               <div>
                  <p className="text-xs font-semibold text-slate-900">{new Date(s.last_active).toLocaleTimeString()}</p>
                  <p className="text-[9px] text-emerald-500 font-medium uppercase tracking-widest">Active Node</p>
               </div>
             )
           },
           {
             key: 'actions',
             header: 'Actions',
             render: (s: any) => (
               <button
                 onClick={() => handleTerminate(s.id)}
                 className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                 title="Kill Session"
               >
                  <LogOut className="h-4 w-4" />
               </button>
             )
           }
         ]}
         data={sessions}
         keyExtractor={(s: any) => s.id}
         isLoading={loading}
         emptyState="No active sessions detected."
         onRowClick={() => {}}
       />

       {/* NUCLEAR LOGOUT */}
       <SettingsAlert type="error" icon={AlertCircle}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
             <div className="flex-1">
                <SettingsSectionHeader 
                  title="Global Session Invalidation"
                  description="This Nuclear Option will immediately terminate every active session in the system across all business units. Only your current administrative connection will remain intact."
                />
             </div>
             <button className="px-6 h-9 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium shadow-md shadow-red-500/20 transition-all">
             Logout Everyone
             </button>
          </div>
       </SettingsAlert>
    </div>
  );
}

// --- TAB 4: SECURITY LOG ---

function SecurityLogTab() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await client.get('/settings/security/events');
      setEvents(res.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchEvents(); }, []);

  return (
    <div className="space-y-4">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <SettingsSectionHeader 
            title="System Security Log"
            description="Real-time audit trail of authentication events and critical security actions."
          />
          <div className="flex gap-3">
             <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <SettingsInput placeholder="Filter events..." className="pl-11 w-64" />
             </div>
             <button className="px-6 h-9 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-medium transition-all">
             Export Log
             </button>
          </div>
       </div>

       <SettingsCard>
          {loading ? (
             <div className="py-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto opacity-10" /></div>
          ) : events.length === 0 ? (
             <div className="py-20 text-center text-slate-400">No security events recorded in the current cycle.</div>
          ) : (
            <div className="space-y-4">
               {events.map((e, i) => (
                  <div key={e.id} className="flex gap-4 group">
                     <div className="flex flex-col items-center shrink-0">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center border ${e.severity === 'critical' ? 'bg-red-50 border-red-100 text-red-500' : e.severity === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-500' : 'bg-blue-50 border-blue-100 text-blue-500'}`}>
                           <Shield className="h-5 w-5" />
                        </div>
                        {i < events.length - 1 && <div className="w-px h-full bg-slate-50 my-2" />}
                     </div>
                     <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between mb-2">
                           <span className="text-sm font-semibold text-slate-900 capitalize">{e.event_type.replace('_', ' ')}</span>
                           <span className="text-[10px] font-medium text-slate-300 tabular-nums">{new Date(e.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-slate-500 font-normal leading-relaxed">{e.description || `Security event triggered by ${e.full_name || 'System'}`}</p>
                        <div className="flex items-center gap-4 mt-3">
                           <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">{e.ip_address}</span>
                           <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">{e.user_agent?.split(' ')[0]}</span>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
          )}
       </SettingsCard>
    </div>
  );
}
