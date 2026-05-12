import { useState, useEffect } from 'react';
import { Lock, Shield, Clock, ClipboardList, Save, Loader2, AlertTriangle, ShieldCheck, Monitor, Smartphone, Globe, RefreshCw, LogOut, Search, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import client from '../../../api/client';
import { Modal } from '../../../components/ui/Modal';
import {
  Card,
  SectionTitle,
  FieldLabel,
  HelperText,
  Input,
  Select,
  Button,
  Badge,
  Divider,
  Toggle,
  FormGroup,
  SectionGroup,
  FieldRow,
} from '../../../components/settings/SettingsComponents';

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
          <Card>
             <div className="flex items-start gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0"><Lock className="h-5 w-5" /></div>
                <div>
                   <SectionTitle>Password Requirements</SectionTitle>
                   <HelperText>Enforce complexity rules for all user credentials.</HelperText>
                </div>
             </div>

             <SectionGroup>
                {[
                  { label: 'Minimum Length', val: '12 chars', checked: true },
                  { label: 'Uppercase Letters (A-Z)', checked: true },
                  { label: 'Numeric Values (0-9)', checked: true },
                  { label: 'Special Characters (!@#)', checked: true },
                  { label: 'Password Expiry (90 days)', checked: false },
                ].map(item => (
                  <label key={item.label} className="flex items-center justify-between cursor-pointer group">
                     <span className="text-xs font-medium text-slate-700 group-hover:text-slate-900">{item.label}</span>
                     <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${item.checked ? 'bg-blue-500' : 'bg-slate-200'}`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${item.checked ? 'translate-x-6' : 'translate-x-1'}`} />
                     </div>
                  </label>
                ))}
             </SectionGroup>

             <Divider />

             <div>
                <FieldLabel>Strength Indicator Preview</FieldLabel>
                <div className="bg-slate-900 rounded-lg p-4 text-center font-mono">
                   <p className="text-emerald-400 text-lg font-semibold tracking-widest">Th!s-1s-S3cur3</p>
                   <div className="mt-4 flex gap-1 justify-center">
                      {[1,2,3,4,5].map(i => <div key={i} className="h-1 w-8 rounded-full bg-emerald-500" />)}
                   </div>
                   <p className="text-[9px] font-medium text-emerald-500 uppercase tracking-[0.2em] mt-2">Maximum Entropy Policy</p>
                </div>
             </div>
          </Card>

          {/* LOCKOUTS */}
          <Card>
             <div className="flex items-start gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0"><AlertTriangle className="h-5 w-5" /></div>
                <div>
                   <SectionTitle>Account Lockout</SectionTitle>
                   <HelperText>Manage users who have exceeded login attempt limits.</HelperText>
                </div>
             </div>

             <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                   <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Max Attempts</span>
                   <span className="text-xs font-semibold text-slate-900">5 Failed Logins</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                   <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Duration</span>
                   <span className="text-xs font-semibold text-slate-900">30 Minutes</span>
                </div>
             </div>

             <Divider />

             <div>
                <FieldLabel>Currently Locked</FieldLabel>
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin opacity-10 mx-auto" />
                ) : lockedAccounts.length === 0 ? (
                  <div className="flex flex-col items-center py-6 text-emerald-500">
                     <ShieldCheck className="h-10 w-10 mb-2 opacity-20" />
                     <p className="text-xs font-medium uppercase tracking-widest">No Locked Accounts</p>
                  </div>
                ) : (
                  <div className="space-y-3">
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
                           <Button
                             onClick={() => handleUnlock(u.id)}
                             variant="secondary"
                             className="text-red-500 hover:bg-red-500 hover:text-white"
                           >
                              Unlock
                           </Button>
                        </div>
                     ))}
                  </div>
                )}
             </div>
          </Card>
       </div>

       {/* NUCLEAR RESET */}
       <Card className="bg-amber-50 border-amber-200">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
             <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200 shadow-md shadow-amber-500/10">
                   <RefreshCw className="h-7 w-7" />
                </div>
                <div>
                   <SectionTitle>Mass Credential Reset</SectionTitle>
                   <HelperText>This operation will invalidate all current passwords and force every user in the system to establish new credentials on their next login attempt. Use only during major policy updates.</HelperText>
                </div>
             </div>
             <Button variant="secondary" className="bg-slate-900 hover:bg-black text-white">
             Force System-Wide Reset
             </Button>
          </div>
       </Card>
    </div>
  );
}

// --- TAB 2: SESSION CONTROL ---

function SessionControlTab() {
  return (
    <div className="max-w-4xl space-y-4">
       <Card>
          <div className="flex items-start gap-4 mb-4">
             <div className="h-14 w-14 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 border border-blue-100 shadow-md shadow-blue-500/10">
                <Clock className="h-7 w-7" />
             </div>
             <div>
                <SectionTitle>Session Lifecycle</SectionTitle>
                <HelperText>Configure automated logout behaviors and session concurrency limits.</HelperText>
             </div>
          </div>

          <SectionGroup>
             <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                   <FieldLabel>Inactivity Timeout</FieldLabel>
                   <span className="text-xs font-medium text-blue-500 bg-blue-50 px-3 py-1 rounded-full">30 Minutes</span>
                </div>
                <input type="range" min="5" max="480" defaultValue="30" className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                <div className="flex justify-between text-[9px] font-medium text-slate-300 uppercase tracking-widest">
                   <span>5 min</span>
                   <span>8 hours</span>
                </div>
             </div>

             <FieldRow>
                <FormGroup label="Max Concurrent Sessions" helper="Limit active sessions per user (0 = unlimited)">
                   <Input type="number" defaultValue={2} />
                </FormGroup>
                <FormGroup label="Remember Me Duration">
                   <Select>
                      <option>7 Days</option>
                      <option>14 Days</option>
                      <option>30 Days</option>
                      <option>Disabled</option>
                   </Select>
                </FormGroup>
             </FieldRow>

             <Divider />

             <div className="space-y-4">
                <label className="flex items-center justify-between group cursor-pointer">
                   <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-900">Detect New Device Login</span>
                      <span className="text-xs text-slate-500">Notify users via email when a login occurs from an unrecognized device</span>
                   </div>
                   <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-500">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                   </div>
                </label>
                <label className="flex items-center justify-between group cursor-pointer">
                   <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-900">Device Fingerprinting</span>
                      <span className="text-xs text-slate-500">Collect browser and hardware metadata to prevent session hijacking</span>
                   </div>
                   <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
                   </div>
                </label>
             </div>
          </SectionGroup>

          <div className="pt-4 flex justify-end">
             <Button>
                <Save className="h-4 w-4" /> Save Session Policy
             </Button>
          </div>
       </Card>
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
          <div className="space-y-1">
             <SectionTitle>Active Identity Nodes</SectionTitle>
             <HelperText>Monitor and manage all live connections across the organization.</HelperText>
          </div>
          <Button
            onClick={fetchSessions}
            variant="secondary"
          >
             <RefreshCw className="h-3.5 w-3.5" /> Synchronize
          </Button>
       </div>

       <Card className="overflow-hidden">
          <table className="min-w-full divide-y divide-slate-100">
             <thead className="bg-slate-50/50">
                <tr>
                   <th className="px-5 py-4 text-left text-[10px] font-medium text-slate-400 uppercase tracking-widest">User / Identity</th>
                   <th className="px-5 py-4 text-left text-[10px] font-medium text-slate-400 uppercase tracking-widest">Device & Browser</th>
                   <th className="px-5 py-4 text-left text-[10px] font-medium text-slate-400 uppercase tracking-widest">Location / IP</th>
                   <th className="px-5 py-4 text-left text-[10px] font-medium text-slate-400 uppercase tracking-widest">Last Activity</th>
                   <th className="px-5 py-4 text-right text-[10px] font-medium text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={5} className="p-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto opacity-10" /></td></tr>
                ) : sessions.length === 0 ? (
                  <tr><td colSpan={5} className="p-20 text-center text-slate-400">No active sessions detected.</td></tr>
                ) : sessions.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                     <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                           <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-semibold text-xs border border-slate-200">
                              {s.full_name.substring(0, 2).toUpperCase()}
                           </div>
                           <div>
                              <p className="text-sm font-semibold text-slate-900">{s.full_name}</p>
                              <span className="px-1.5 py-0.5 bg-blue-50 text-blue-500 rounded text-[9px] font-medium uppercase tracking-widest">{s.role}</span>
                           </div>
                        </div>
                     </td>
                     <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                           {s.device_type === 'mobile' ? <Smartphone className="h-4 w-4 text-slate-400" /> : <Monitor className="h-4 w-4 text-slate-400" />}
                           <div>
                              <p className="text-xs font-semibold text-slate-700">{s.user_agent?.split(' ')[0] || 'Unknown Agent'}</p>
                              <p className="text-[9px] text-slate-400 font-normal uppercase tracking-widest">{s.device_type || 'Desktop Terminal'}</p>
                           </div>
                        </div>
                     </td>
                     <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                           <Globe className="h-4 w-4 text-slate-400" />
                           <div>
                              <p className="text-xs font-semibold text-slate-700">{s.location || 'Addis Ababa, ET'}</p>
                              <p className="text-[9px] text-slate-400 font-normal tabular-nums">{s.ip_address}</p>
                           </div>
                        </div>
                     </td>
                     <td className="px-5 py-4">
                        <p className="text-xs font-semibold text-slate-900">{new Date(s.last_active).toLocaleTimeString()}</p>
                        <p className="text-[9px] text-emerald-500 font-medium uppercase tracking-widest">Active Node</p>
                     </td>
                     <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleTerminate(s.id)}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Kill Session"
                        >
                           <LogOut className="h-4 w-4" />
                        </button>
                     </td>
                  </tr>
                ))}
             </tbody>
          </table>
       </Card>

       {/* NUCLEAR LOGOUT */}
       <Card className="bg-red-50 border-red-200">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
             <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0 border border-red-200 shadow-md shadow-red-500/10">
                   <AlertCircle className="h-7 w-7" />
                </div>
                <div>
                   <SectionTitle>Global Session Invalidation</SectionTitle>
                   <HelperText>This "Nuclear Option" will immediately terminate every active session in the system across all business units. Only your current administrative connection will remain intact.</HelperText>
                </div>
             </div>
             <Button variant="secondary" className="bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/20">
             Logout Everyone
             </Button>
          </div>
       </Card>
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
          <div className="space-y-1">
             <SectionTitle>System Security Log</SectionTitle>
             <HelperText>Real-time audit trail of authentication events and critical security actions.</HelperText>
          </div>
          <div className="flex gap-3">
             <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input placeholder="Filter events..." className="pl-11 w-64" />
             </div>
             <Button variant="secondary" className="bg-slate-900 hover:bg-black text-white">
             Export Log
             </Button>
          </div>
       </div>

       <Card>
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
                        <div className="flex items-center justify-between mb-1.5">
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
       </Card>
    </div>
  );
}
