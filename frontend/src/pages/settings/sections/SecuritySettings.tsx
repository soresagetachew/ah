import { useState, useEffect, useMemo } from 'react';
import { 
  Lock, Shield, Clock, ClipboardList, 
  Save, Loader2, AlertTriangle, ShieldCheck, 
  Monitor, Smartphone, Tablet, Globe, 
  RefreshCw, LogOut, Search, Filter, 
  Check, X, AlertCircle, Trash2
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import client from '../../../api/client';
import { Modal } from '../../../components/ui/Modal';

type Tab = 'password' | 'timeout' | 'sessions' | 'log';

export default function SecuritySettings() {
  const [activeTab, setActiveTab] = useState<Tab>('password');

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl w-fit mx-auto lg:mx-0">
        {[
          { id: 'password', label: 'Password Policy', icon: Lock },
          { id: 'timeout', label: 'Session Control', icon: Clock },
          { id: 'sessions', label: 'Active Sessions', icon: Monitor },
          { id: 'log', label: 'Security Log', icon: ClipboardList },
        ].map(t => (
          <button 
            key={t.id}
            onClick={() => setActiveTab(t.id as Tab)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === t.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            <t.icon className="h-4 w-4" /> {t.label}
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
    <div className="space-y-8">
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* REQUIREMENTS */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 lg:p-12 space-y-10">
             <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><Lock className="h-5 w-5" /></div>
                <div>
                   <h3 className="text-lg font-black text-slate-900 tracking-tight">Password Requirements</h3>
                   <p className="text-xs text-slate-500 mt-1">Enforce complexity rules for all user credentials.</p>
                </div>
             </div>

             <div className="space-y-6">
                {[
                  { label: 'Minimum Length', val: '12 chars', checked: true },
                  { label: 'Uppercase Letters (A-Z)', checked: true },
                  { label: 'Numeric Values (0-9)', checked: true },
                  { label: 'Special Characters (!@#)', checked: true },
                  { label: 'Password Expiry (90 days)', checked: false },
                ].map(item => (
                  <label key={item.label} className="flex items-center justify-between cursor-pointer group">
                     <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900">{item.label}</span>
                     <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${item.checked ? 'bg-blue-600' : 'bg-slate-200'}`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${item.checked ? 'translate-x-6' : 'translate-x-1'}`} />
                     </div>
                  </label>
                ))}
             </div>

             <div className="pt-6 border-t border-slate-50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Strength Indicator Preview</p>
                <div className="bg-slate-900 rounded-2xl p-6 text-center font-mono">
                   <p className="text-emerald-400 text-lg font-bold tracking-widest">Th!s-1s-S3cur3</p>
                   <div className="mt-4 flex gap-1 justify-center">
                      {[1,2,3,4,5].map(i => <div key={i} className="h-1 w-8 rounded-full bg-emerald-500" />)}
                   </div>
                   <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] mt-2">Maximum Entropy Policy</p>
                </div>
             </div>
          </div>

          {/* LOCKOUTS */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 lg:p-12 space-y-10">
             <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0"><AlertTriangle className="h-5 w-5" /></div>
                <div>
                   <h3 className="text-lg font-black text-slate-900 tracking-tight">Account Lockout</h3>
                   <p className="text-xs text-slate-500 mt-1">Manage users who have exceeded login attempt limits.</p>
                </div>
             </div>

             <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Max Attempts</span>
                   <span className="text-xs font-black text-slate-900">5 Failed Logins</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</span>
                   <span className="text-xs font-black text-slate-900">30 Minutes</span>
                </div>
             </div>

             <div className="pt-6 border-t border-slate-50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Currently Locked</p>
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin opacity-10 mx-auto" />
                ) : lockedAccounts.length === 0 ? (
                  <div className="flex flex-col items-center py-6 text-emerald-500">
                     <ShieldCheck className="h-10 w-10 mb-2 opacity-20" />
                     <p className="text-xs font-black uppercase tracking-widest">No Locked Accounts</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                     {lockedAccounts.map(u => (
                        <div key={u.id} className="flex items-center justify-between p-4 border border-red-100 bg-red-50/30 rounded-2xl">
                           <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-black text-[10px]">
                                 {u.full_name.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                 <p className="text-xs font-black text-slate-900">{u.full_name}</p>
                                 <p className="text-[9px] font-bold text-red-400 uppercase tracking-widest">Locked out</p>
                              </div>
                           </div>
                           <button 
                             onClick={() => handleUnlock(u.id)}
                             className="px-4 py-1.5 bg-white border border-red-200 text-red-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm"
                           >
                              Unlock
                           </button>
                        </div>
                     ))}
                  </div>
                )}
             </div>
          </div>
       </div>

       {/* NUCLEAR RESET */}
       <div className="bg-amber-50 border border-amber-200 rounded-[2.5rem] p-10 lg:p-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex items-start gap-6">
             <div className="h-14 w-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200 shadow-lg shadow-amber-500/10">
                <RefreshCw className="h-7 w-7" />
             </div>
             <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Mass Credential Reset</h3>
                <p className="text-sm text-slate-600 mt-1 max-w-xl">
                   This operation will invalidate all current passwords and force every user in the system 
                   to establish new credentials on their next login attempt. Use only during major policy updates.
                </p>
             </div>
          </div>
          <button className="px-8 py-4 bg-slate-900 hover:bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 shrink-0">
             Force System-Wide Reset
          </button>
       </div>
    </div>
  );
}

// --- TAB 2: SESSION CONTROL ---

function SessionControlTab() {
  return (
    <div className="max-w-4xl space-y-10">
       <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 lg:p-14 space-y-12">
          <div className="flex items-start gap-6">
             <div className="h-14 w-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 shadow-lg shadow-blue-500/10">
                <Clock className="h-7 w-7" />
             </div>
             <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Session Lifecycle</h3>
                <p className="text-sm text-slate-500 mt-1">Configure automated logout behaviors and session concurrency limits.</p>
             </div>
          </div>

          <div className="space-y-10">
             <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inactivity Timeout</label>
                   <span className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full">30 Minutes</span>
                </div>
                <input type="range" min="5" max="480" defaultValue="30" className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                <div className="flex justify-between text-[9px] font-black text-slate-300 uppercase tracking-widest">
                   <span>5 min</span>
                   <span>8 hours</span>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Max Concurrent Sessions</label>
                   <input type="number" defaultValue={2} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900" />
                   <p className="text-[9px] text-slate-400 font-medium ml-1">Limit active sessions per user (0 = unlimited)</p>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Remember Me Duration</label>
                   <select className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white font-bold text-slate-900 appearance-none">
                      <option>7 Days</option>
                      <option>14 Days</option>
                      <option>30 Days</option>
                      <option>Disabled</option>
                   </select>
                </div>
             </div>

             <div className="pt-6 border-t border-slate-50 space-y-6">
                <label className="flex items-center justify-between group cursor-pointer">
                   <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-900">Detect New Device Login</span>
                      <span className="text-xs text-slate-500">Notify users via email when a login occurs from an unrecognized device</span>
                   </div>
                   <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                   </div>
                </label>
                <label className="flex items-center justify-between group cursor-pointer">
                   <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-900">Device Fingerprinting</span>
                      <span className="text-xs text-slate-500">Collect browser and hardware metadata to prevent session hijacking</span>
                   </div>
                   <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
                   </div>
                </label>
             </div>
          </div>

          <div className="pt-4 flex justify-end">
             <button className="flex items-center gap-2 px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all">
                <Save className="h-4 w-4" /> Save Session Policy
             </button>
          </div>
       </div>
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
    <div className="space-y-8">
       <div className="flex items-center justify-between">
          <div className="space-y-1">
             <h3 className="text-xl font-black text-slate-900 tracking-tight">Active Identity Nodes</h3>
             <p className="text-sm text-slate-500">Monitor and manage all live connections across the organization.</p>
          </div>
          <button 
            onClick={fetchSessions}
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
          >
             <RefreshCw className="h-3.5 w-3.5" /> Synchronize
          </button>
       </div>

       <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-slate-100">
             <thead className="bg-slate-50/50">
                <tr>
                   <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">User / Identity</th>
                   <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Device & Browser</th>
                   <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Location / IP</th>
                   <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Activity</th>
                   <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={5} className="p-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto opacity-10" /></td></tr>
                ) : sessions.length === 0 ? (
                  <tr><td colSpan={5} className="p-20 text-center text-slate-400">No active sessions detected.</td></tr>
                ) : sessions.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                     <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                           <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-xs border border-slate-200">
                              {s.full_name.substring(0, 2).toUpperCase()}
                           </div>
                           <div>
                              <p className="text-sm font-black text-slate-900">{s.full_name}</p>
                              <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-black uppercase tracking-widest">{s.role}</span>
                           </div>
                        </div>
                     </td>
                     <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                           {s.device_type === 'mobile' ? <Smartphone className="h-4 w-4 text-slate-400" /> : <Monitor className="h-4 w-4 text-slate-400" />}
                           <div>
                              <p className="text-xs font-black text-slate-700">{s.user_agent?.split(' ')[0] || 'Unknown Agent'}</p>
                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{s.device_type || 'Desktop Terminal'}</p>
                           </div>
                        </div>
                     </td>
                     <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                           <Globe className="h-4 w-4 text-slate-400" />
                           <div>
                              <p className="text-xs font-black text-slate-700">{s.location || 'Addis Ababa, ET'}</p>
                              <p className="text-[9px] text-slate-400 font-bold tabular-nums">{s.ip_address}</p>
                           </div>
                        </div>
                     </td>
                     <td className="px-8 py-6">
                        <p className="text-xs font-black text-slate-900">{new Date(s.last_active).toLocaleTimeString()}</p>
                        <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">Active Node</p>
                     </td>
                     <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => handleTerminate(s.id)}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          title="Kill Session"
                        >
                           <LogOut className="h-4 w-4" />
                        </button>
                     </td>
                  </tr>
                ))}
             </tbody>
          </table>
       </div>

       {/* NUCLEAR LOGOUT */}
       <div className="bg-red-50 border border-red-200 rounded-[2.5rem] p-10 lg:p-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex items-start gap-6">
             <div className="h-14 w-14 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center shrink-0 border border-red-200 shadow-lg shadow-red-500/10">
                <AlertCircle className="h-7 w-7" />
             </div>
             <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Global Session Invalidation</h3>
                <p className="text-sm text-red-700/80 mt-1 max-w-xl">
                   This "Nuclear Option" will immediately terminate every active session in the system across all business units. 
                   Only your current administrative connection will remain intact.
                </p>
             </div>
          </div>
          <button className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-500/20 transition-all active:scale-95 shrink-0">
             Logout Everyone
          </button>
       </div>
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
    <div className="space-y-8">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
             <h3 className="text-xl font-black text-slate-900 tracking-tight">System Security Log</h3>
             <p className="text-sm text-slate-500">Real-time audit trail of authentication events and critical security actions.</p>
          </div>
          <div className="flex gap-4">
             <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input placeholder="Filter events..." className="pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold w-64" />
             </div>
             <button className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">Export Log</button>
          </div>
       </div>

       <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10 lg:p-14 space-y-8">
          {loading ? (
             <div className="py-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto opacity-10" /></div>
          ) : events.length === 0 ? (
             <div className="py-20 text-center text-slate-400">No security events recorded in the current cycle.</div>
          ) : (
            <div className="space-y-6">
               {events.map((e, i) => (
                  <div key={e.id} className="flex gap-6 group">
                     <div className="flex flex-col items-center shrink-0">
                        <div className={`h-10 w-10 rounded-2xl flex items-center justify-center border ${e.severity === 'critical' ? 'bg-red-50 border-red-100 text-red-600' : e.severity === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
                           <Shield className="h-5 w-5" />
                        </div>
                        {i < events.length - 1 && <div className="w-px h-full bg-slate-50 my-2" />}
                     </div>
                     <div className="flex-1 pb-6">
                        <div className="flex items-center justify-between mb-1.5">
                           <span className="text-sm font-black text-slate-900 capitalize">{e.event_type.replace('_', ' ')}</span>
                           <span className="text-[10px] font-black text-slate-300 tabular-nums">{new Date(e.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">{e.description || `Security event triggered by ${e.full_name || 'System'}`}</p>
                        <div className="flex items-center gap-4 mt-3">
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{e.ip_address}</span>
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{e.user_agent?.split(' ')[0]}</span>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
          )}
       </div>
    </div>
  );
}
