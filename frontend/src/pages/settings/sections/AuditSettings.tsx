import { useState, useEffect, useMemo } from 'react';
import { 
  ClipboardList, Activity, Search, Filter, 
  Download, RefreshCw, ChevronDown, User,
  Database, Server, HardDrive, Bell,
  CheckCircle2, AlertTriangle, XCircle,
  Clock, ShieldCheck, Box, FileText,
  CreditCard, Layout, Loader2, Play
} from 'lucide-react';
import toast from 'react-hot-toast';
import client from '../../../api/client';

type Tab = 'audit' | 'health';

export default function AuditSettings() {
  const [activeTab, setActiveTab] = useState<Tab>('audit');

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl w-fit mx-auto lg:mx-0">
        {[
          { id: 'audit', label: 'Audit Log', icon: ClipboardList },
          { id: 'health', label: 'System Health', icon: Activity },
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

      {activeTab === 'audit' && <AuditLogTab />}
      {activeTab === 'health' && <SystemHealthTab />}
    </div>
  );
}

// --- TAB 1: AUDIT LOG ---

function AuditLogTab() {
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const [lRes, sRes] = await Promise.all([
        client.get('/settings/audit-logs/list'),
        client.get('/settings/audit-logs/stats')
      ]);
      setLogs(lRes.data);
      setStats(sRes.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchLogs(); }, []);

  const handleExport = async () => {
    toast.promise(client.get('/settings/audit-logs/export'), {
      loading: 'Preparing export...',
      success: 'Audit log exported to CSV ✓',
      error: 'Export failed'
    });
  };

  return (
    <div className="space-y-8">
       {/* STATS CHIPS */}
       <div className="flex flex-wrap gap-4">
          {[
            { label: 'Total Entries', val: stats?.totals.total || '0', icon: ClipboardList, color: 'bg-slate-900' },
            { label: 'Events Today', val: stats?.totals.today || '0', icon: Clock, color: 'bg-blue-600' },
            { label: 'Top Contributor', val: stats?.topUser?.full_name || 'N/A', icon: User, color: 'bg-emerald-600' }
          ].map(s => (
             <div key={s.label} className={`${s.color} text-white px-6 py-3 rounded-2xl flex items-center gap-4 shadow-xl shadow-black/5`}>
                <s.icon className="h-4 w-4 opacity-50" />
                <div className="flex flex-col">
                   <span className="text-[9px] font-black uppercase tracking-widest opacity-60">{s.label}</span>
                   <span className="text-xs font-black tracking-tight">{s.val}</span>
                </div>
             </div>
          ))}
          <button 
            onClick={handleExport}
            className="ml-auto flex items-center gap-2 px-8 py-3 bg-white border border-slate-200 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
          >
             <Download className="h-4 w-4" /> Export CSV
          </button>
       </div>

       {/* FILTER BAR */}
       <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 flex flex-wrap items-end gap-6">
          <div className="flex-1 min-w-[240px] space-y-1.5">
             <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Universal Search</label>
             <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                <input placeholder="Search actor, entity, or action..." className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-xs font-bold focus:ring-4 focus:ring-blue-500/10" />
             </div>
          </div>
          <div className="w-48 space-y-1.5">
             <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Entity Class</label>
             <select className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-xs font-bold appearance-none">
                <option>All Entities</option>
                <option>Procurement (PR)</option>
                <option>Finance (PRF)</option>
                <option>Inventory (SIV)</option>
                <option>Identity (Users)</option>
             </select>
          </div>
          <div className="w-48 space-y-1.5">
             <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Action Type</label>
             <select className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-xs font-bold appearance-none">
                <option>All Actions</option>
                <option>CREATE</option>
                <option>UPDATE</option>
                <option>DELETE</option>
                <option>APPROVE</option>
             </select>
          </div>
          <button className="px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">Apply Filter</button>
       </div>

       {/* AUDIT TABLE */}
       <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto -mx-4 lg:mx-0">
             <div className="min-w-[800px] lg:min-w-0 px-4 lg:px-0">
                <table className="min-w-full divide-y divide-slate-100">
                   <thead className="bg-slate-50/50">
                      <tr>
                         <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Actor</th>
                         <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Operation</th>
                         <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Entity Target</th>
                         <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Descriptor</th>
                         <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {loading ? (
                         <tr><td colSpan={5} className="p-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto opacity-10" /></td></tr>
                      ) : logs.map(l => (
                        <tr key={l.id} onClick={() => setExpandedRow(expandedRow === l.id ? null : l.id)} className="hover:bg-slate-50/50 transition-colors cursor-pointer group">
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                 <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-[10px]">
                                    {l.user_name?.substring(0,2).toUpperCase()}
                                 </div>
                                 <p className="text-xs font-black text-slate-900">{l.user_name}</p>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${l.action === 'CREATE' ? 'bg-emerald-50 text-emerald-600' : l.action === 'UPDATE' ? 'bg-blue-50 text-blue-600' : l.action === 'DELETE' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                                 {l.action}
                              </span>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-2">
                                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{l.entity_type}</span>
                                 <span className="text-[10px] font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">{l.entity_id?.substring(0,8)}</span>
                              </div>
                           </td>
                           <td className="px-8 py-6 max-w-xs truncate">
                              <p className="text-xs text-slate-500 font-medium">{l.description}</p>
                           </td>
                           <td className="px-8 py-6 text-right">
                              <p className="text-xs font-black text-slate-900 tabular-nums">{new Date(l.created_at).toLocaleString()}</p>
                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{l.ip_address}</p>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
       </div>
    </div>
  );
}

// --- TAB 2: SYSTEM HEALTH ---

function SystemHealthTab() {
  const [health, setHealth] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [errors, setErrors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(30);

  const fetchData = async () => {
    try {
      const [hRes, sRes, eRes] = await Promise.all([
        client.get('/settings/system/health'),
        client.get('/settings/system/stats'),
        client.get('/settings/system/errors')
      ]);
      setHealth(hRes.data);
      setStats(sRes.data);
      setErrors(eRes.data);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          fetchData();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-10">
       <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="h-3 w-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
             <h3 className="text-xl font-black text-slate-900 tracking-tight">System Core Monitoring</h3>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
             <RefreshCw className="h-3.5 w-3.5 animate-spin-slow" />
             Auto-refreshes in <span className="text-slate-900 tabular-nums">{countdown}s</span>
          </div>
       </div>

       {loading ? (
          <div className="py-20 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto opacity-10" /></div>
       ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               {/* DB CARD */}
               <HealthCard 
                 title="Database" 
                 icon={Database} 
                 status={health?.database.status}
                 stats={[
                   { label: 'Latency', val: `${health?.database.response_time_ms} ms`, color: 'text-emerald-500' },
                   { label: 'Connections', val: `${health?.database.connections_used} / ${health?.database.connections_max}` }
                 ]}
                 progress={health?.database.connections_used / health?.database.connections_max * 100}
               />
               {/* API CARD */}
               <HealthCard 
                 title="API Node" 
                 icon={Server} 
                 status={health?.api.status}
                 stats={[
                   { label: 'Requests/min', val: health?.api.requests_per_minute },
                   { label: 'Error Rate', val: `${health?.api.error_rate_pct}%`, color: health?.api.error_rate_pct > 1 ? 'text-red-500' : 'text-emerald-500' }
                 ]}
                 uptime={`Uptime: ${Math.floor(health?.api.uptime_seconds / 3600)}h ${Math.floor((health?.api.uptime_seconds % 3600) / 60)}m`}
               />
               {/* STORAGE CARD */}
               <HealthCard 
                 title="Storage" 
                 icon={HardDrive} 
                 status="Normal"
                 stats={[
                   { label: 'Used', val: `${health?.storage.used_gb} GB` },
                   { label: 'Capacity', val: `${health?.storage.total_gb} GB` }
                 ]}
                 progress={health?.storage.usage_pct}
               />
               {/* NOTIFICATIONS CARD */}
               <HealthCard 
                 title="Gateways" 
                 icon={Bell} 
                 status="Synchronized"
                 stats={[
                   { label: 'Email', val: health?.email.status, color: 'text-emerald-500' },
                   { label: 'SMS', val: 'Active', color: 'text-emerald-500' }
                 ]}
               />
            </div>

            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10 lg:p-14 space-y-10">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Real-time Entity Analytics</h4>
               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
                  {[
                    { label: 'Users', val: stats?.total_users, icon: User },
                    { label: 'PRs', val: stats?.total_prs, icon: FileText },
                    { label: 'GRNs', val: stats?.total_grns, icon: Box },
                    { label: 'SIVs', val: stats?.total_sivs, icon: Layout },
                    { label: 'PRF', val: stats?.total_prfs, icon: CreditCard },
                    { label: 'Pending', val: '14', icon: Clock },
                    { label: 'Backups', val: '28', icon: ShieldCheck },
                    { label: 'Storage', val: '4.2G', icon: HardDrive },
                  ].map(s => (
                    <div key={s.label} className="bg-slate-50 rounded-2xl p-5 text-center group hover:bg-slate-900 transition-all duration-300">
                       <s.icon className="h-5 w-5 text-slate-400 mx-auto mb-3 group-hover:text-white transition-colors" />
                       <p className="text-xl font-black text-slate-900 group-hover:text-white transition-colors tabular-nums">{s.val}</p>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-500 transition-colors mt-1">{s.label}</p>
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-red-50 border border-red-100 rounded-[2.5rem] p-10 lg:p-12 space-y-8">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <AlertTriangle className="h-6 w-6 text-red-600" />
                     <h4 className="text-lg font-black text-slate-900">Critical Exception Log</h4>
                  </div>
                  <button className="text-[10px] font-black uppercase tracking-widest text-red-600 hover:underline">Flush Logs</button>
               </div>
               <div className="space-y-3">
                  {errors.length === 0 ? (
                    <div className="bg-white/50 rounded-2xl p-6 text-center text-emerald-600 font-black text-[10px] uppercase tracking-widest">No exceptions detected in the current cycle.</div>
                  ) : errors.map(e => (
                    <div key={e.id} className="bg-white rounded-2xl p-4 flex items-center justify-between group shadow-sm border border-red-100/50">
                       <div className="flex items-center gap-4">
                          <div className="h-2 w-2 bg-red-500 rounded-full" />
                          <div>
                             <p className="text-[10px] font-black text-slate-900 max-w-xl truncate">{e.message}</p>
                             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{e.path} • {new Date(e.created_at).toLocaleTimeString()}</p>
                          </div>
                       </div>
                       <button className="h-8 w-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all"><Play className="h-4 w-4" /></button>
                    </div>
                  ))}
               </div>
            </div>
          </>
       )}
    </div>
  );
}

function HealthCard({ title, icon: Icon, status, stats, progress, uptime }: any) {
  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-6 group hover:border-blue-200 transition-all">
       <div className="flex items-center justify-between">
          <div className="h-10 w-10 rounded-xl bg-slate-50 text-slate-900 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
             <Icon className="h-5 w-5" />
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${status === 'Online' || status === 'Running' || status === 'Normal' || status === 'Working' || status === 'Synchronized' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
             {status}
          </span>
       </div>
       <div>
          <h4 className="text-lg font-black text-slate-900 tracking-tight">{title}</h4>
          {uptime && <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{uptime}</p>}
       </div>
       <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
             {stats.map((s: any) => (
                <div key={s.label}>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                   <p className={`text-xs font-black tracking-tight ${s.color || 'text-slate-900'}`}>{s.val}</p>
                </div>
             ))}
          </div>
          {progress !== undefined && (
             <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-1000 ${progress > 80 ? 'bg-red-500' : progress > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${progress}%` }} />
             </div>
          )}
       </div>
    </div>
  );
}
