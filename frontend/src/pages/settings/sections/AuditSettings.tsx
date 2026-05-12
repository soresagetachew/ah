import { useState, useEffect } from 'react';
import { ClipboardList, Activity, Search, Download, RefreshCw, User, Database, Server, HardDrive, Bell, AlertTriangle, Clock, ShieldCheck, Box, FileText, CreditCard, Layout, Loader2, Play } from 'lucide-react';
import toast from 'react-hot-toast';
import client from '../../../api/client';
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

type Tab = 'audit' | 'health';

export default function AuditSettings() {
  const [activeTab, setActiveTab] = useState<Tab>('audit');

  return (
    <div className="p-5 space-y-4 animate-in fade-in duration-500">
      <div className="flex gap-1 p-1 bg-slate-100 rounded-lg w-fit mx-auto lg:mx-0">
        {[
          { id: 'audit', label: 'Audit', icon: ClipboardList },
          { id: 'health', label: 'Health', icon: Activity },
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
    <div className="space-y-4">
       {/* STATS CHIPS */}
       <div className="flex flex-wrap gap-3">
          {[
            { label: 'Total Entries', val: stats?.totals.total || '0', icon: ClipboardList, color: 'bg-slate-900' },
            { label: 'Events Today', val: stats?.totals.today || '0', icon: Clock, color: 'bg-blue-500' },
            { label: 'Top Contributor', val: stats?.topUser?.full_name || 'N/A', icon: User, color: 'bg-emerald-500' }
          ].map(s => (
             <div key={s.label} className={`${s.color} text-white px-4 py-2 rounded-lg flex items-center gap-3 shadow-md shadow-black/5`}>
                <s.icon className="h-4 w-4 opacity-50" />
                <div className="flex flex-col">
                   <span className="text-[9px] font-medium uppercase tracking-widest opacity-60">{s.label}</span>
                   <span className="text-xs font-semibold tracking-tight">{s.val}</span>
                </div>
             </div>
          ))}
          <Button
            onClick={handleExport}
            variant="secondary"
            className="ml-auto"
          >
             <Download className="h-4 w-4" /> Export CSV
          </Button>
       </div>

       {/* FILTER BAR */}
       <Card>
          <div className="flex flex-wrap items-end gap-4">
             <FormGroup label="Universal Search" className="flex-1 min-w-[240px]">
                <div className="relative">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                   <Input placeholder="Search actor, entity, or action..." className="pl-11" />
                </div>
             </FormGroup>
             <FormGroup label="Entity Class" className="w-48">
                <Select>
                   <option>All Entities</option>
                   <option>Procurement (PR)</option>
                   <option>Finance (PRF)</option>
                   <option>Inventory (SIV)</option>
                   <option>Identity (Users)</option>
                </Select>
             </FormGroup>
             <FormGroup label="Action Type" className="w-48">
                <Select>
                   <option>All Actions</option>
                   <option>CREATE</option>
                   <option>UPDATE</option>
                   <option>DELETE</option>
                   <option>APPROVE</option>
                </Select>
             </FormGroup>
             <Button>Apply Filter</Button>
          </div>
       </Card>

       {/* AUDIT TABLE */}
       <Card className="overflow-hidden">
          <div className="overflow-x-auto -mx-4 lg:mx-0">
             <div className="min-w-[800px] lg:min-w-0 px-4 lg:px-0">
                <table className="min-w-full divide-y divide-slate-100">
                   <thead className="bg-slate-50/50">
                      <tr>
                         <th className="px-5 py-4 text-left text-[10px] font-medium text-slate-400 uppercase tracking-widest">Actor</th>
                         <th className="px-5 py-4 text-left text-[10px] font-medium text-slate-400 uppercase tracking-widest">Operation</th>
                         <th className="px-5 py-4 text-left text-[10px] font-medium text-slate-400 uppercase tracking-widest">Entity Target</th>
                         <th className="px-5 py-4 text-left text-[10px] font-medium text-slate-400 uppercase tracking-widest">Descriptor</th>
                         <th className="px-5 py-4 text-right text-[10px] font-medium text-slate-400 uppercase tracking-widest">Timestamp</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {loading ? (
                         <tr><td colSpan={5} className="p-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto opacity-10" /></td></tr>
                      ) : logs.map(l => (
                        <tr key={l.id} onClick={() => setExpandedRow(expandedRow === l.id ? null : l.id)} className="hover:bg-slate-50/50 transition-colors cursor-pointer group">
                           <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                 <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-semibold text-[10px]">
                                    {l.user_name?.substring(0,2).toUpperCase()}
                                 </div>
                                 <p className="text-xs font-semibold text-slate-900">{l.user_name}</p>
                              </div>
                           </td>
                           <td className="px-5 py-4">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-medium uppercase tracking-widest ${l.action === 'CREATE' ? 'bg-emerald-50 text-emerald-500' : l.action === 'UPDATE' ? 'bg-blue-50 text-blue-500' : l.action === 'DELETE' ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-600'}`}>
                                 {l.action}
                              </span>
                           </td>
                           <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                 <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{l.entity_type}</span>
                                 <span className="text-[10px] font-mono font-semibold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">{l.entity_id?.substring(0,8)}</span>
                              </div>
                           </td>
                           <td className="px-5 py-4 max-w-xs truncate">
                              <p className="text-xs text-slate-500 font-normal">{l.description}</p>
                           </td>
                           <td className="px-5 py-4 text-right">
                              <p className="text-xs font-semibold text-slate-900 tabular-nums">{new Date(l.created_at).toLocaleString()}</p>
                              <p className="text-[9px] font-normal text-slate-400 uppercase tracking-widest">{l.ip_address}</p>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
       </Card>
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
    <div className="space-y-4">
       <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="h-3 w-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
             <SectionTitle>System Core Monitoring</SectionTitle>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-medium uppercase tracking-widest text-slate-400">
             <RefreshCw className="h-3.5 w-3.5 animate-spin-slow" />
             Auto-refreshes in <span className="text-slate-900 tabular-nums">{countdown}s</span>
          </div>
       </div>

       {loading ? (
          <div className="py-20 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto opacity-10" /></div>
       ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

            <Card>
               <FieldLabel>Real-time Entity Analytics</FieldLabel>
               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
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
                    <div key={s.label} className="bg-slate-50 rounded-lg p-4 text-center group hover:bg-slate-900 transition-all duration-300">
                       <s.icon className="h-5 w-5 text-slate-400 mx-auto mb-3 group-hover:text-white transition-colors" />
                       <p className="text-lg font-semibold text-slate-900 group-hover:text-white transition-colors tabular-nums">{s.val}</p>
                       <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest group-hover:text-slate-500 transition-colors mt-1">{s.label}</p>
                    </div>
                  ))}
               </div>
            </Card>

            <Card className="bg-red-50 border-red-100">
               <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                     <AlertTriangle className="h-5 w-5 text-red-500" />
                     <SectionTitle className="text-lg">Critical Exception Log</SectionTitle>
                  </div>
                  <Button variant="secondary" className="text-red-500 text-[10px] font-medium">
                     Flush Logs
                  </Button>
               </div>
               <div className="space-y-3">
                  {errors.length === 0 ? (
                    <div className="bg-white/50 rounded-lg p-4 text-center text-emerald-500 font-medium text-[10px] uppercase tracking-widest">No exceptions detected in the current cycle.</div>
                  ) : errors.map(e => (
                    <div key={e.id} className="bg-white rounded-lg p-3 flex items-center justify-between group shadow-sm border border-red-100/50">
                       <div className="flex items-center gap-3">
                          <div className="h-2 w-2 bg-red-500 rounded-full" />
                          <div>
                             <p className="text-[10px] font-medium text-slate-900 max-w-xl truncate">{e.message}</p>
                             <p className="text-[9px] font-normal text-slate-400 uppercase tracking-widest">{e.path} • {new Date(e.created_at).toLocaleTimeString()}</p>
                          </div>
                       </div>
                       <button className="h-8 w-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all"><Play className="h-4 w-4" /></button>
                    </div>
                  ))}
               </div>
            </Card>
          </>
       )}
    </div>
  );
}

function HealthCard({ title, icon: Icon, status, stats, progress, uptime }: any) {
  return (
    <Card className="group hover:border-blue-300 transition-all">
       <div className="flex items-center justify-between">
          <div className="h-10 w-10 rounded-lg bg-slate-50 text-slate-900 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
             <Icon className="h-5 w-5" />
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium uppercase tracking-widest ${status === 'Online' || status === 'Running' || status === 'Normal' || status === 'Working' || status === 'Synchronized' ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'}`}>
             {status}
          </span>
       </div>
       <div>
          <SectionTitle className="text-lg">{title}</SectionTitle>
          {uptime && <HelperText className="text-[9px] uppercase tracking-widest">{uptime}</HelperText>}
       </div>
       <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
             {stats.map((s: any) => (
                <div key={s.label}>
                   <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">{s.label}</p>
                   <p className={`text-xs font-semibold tracking-tight ${s.color || 'text-slate-900'}`}>{s.val}</p>
                </div>
             ))}
          </div>
          {progress !== undefined && (
             <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-1000 ${progress > 80 ? 'bg-red-500' : progress > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${progress}%` }} />
             </div>
          )}
       </div>
    </Card>
  );
}
