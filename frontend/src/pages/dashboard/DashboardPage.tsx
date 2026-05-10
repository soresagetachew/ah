import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import client from '../../api/client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, PieChart, Pie, AreaChart, Area
} from 'recharts';
import {
  FileText, DollarSign, Clock, XCircle, Send,
  Package, AlertTriangle, CheckCircle, TrendingUp, Calendar,
  ArrowRight, ChevronRight, Activity, CreditCard, ArrowUpCircle, AlertCircle, PieChart as PieIcon, Download,
  Truck, ArrowRightCircle, User as UserIcon
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { themeEngine } from '../../engine/ThemeEngine';
import StatusBadge from '../../components/ui/StatusBadge';
import { ThemedCard, ThemedButton } from '../../components/ui/themed';
import StatCard from '../../components/ui/StatCard';
import PageHeader from '../../components/layout/PageHeader';
import { Skeleton, StatCardSkeleton, ErrorState } from '../../components/ui/Skeleton';

const COLORS = [
  themeEngine.getVar('--color-accent'), 
  themeEngine.getVar('--color-success'), 
  themeEngine.getVar('--color-warning'), 
  themeEngine.getVar('--color-danger'), 
  themeEngine.getVar('--color-primary'), 
  '#EC4899'
];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [charts, setCharts] = useState<any>({ spend: [], budget: [], pending: [], movement: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, spendRes, budgetRes, pendingRes] = await Promise.allSettled([
        client.get('/dashboard/stats'),
        client.get('/reports/spend_by_dept?days=180'),
        client.get('/reports/budget_vs_actual'),
        client.get('/reports/pending_aging')
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      
      const mockMovement = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
        in: Math.floor(Math.random() * 50) + 10,
        out: Math.floor(Math.random() * 40) + 5
      }));

      setCharts({
        spend: spendRes.status === 'fulfilled' ? spendRes.value.data.chart : [],
        budget: budgetRes.status === 'fulfilled' ? budgetRes.value.data.chart : [],
        pending: pendingRes.status === 'fulfilled' ? pendingRes.value.data.items : [],
        movement: mockMovement
      });
    } catch (e: any) {
      setError('Failed to synchronize dashboard intelligence');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const renderGM = () => {
    const data = stats?.gm || { totalPRs: 0, totalSpend: 0, pendingApprovals: 0, rejectedCount: 0 };
    const pendingList = charts.pending.slice(0, 5);
    const overdueList = charts.pending.filter((item: any) => item.days > 5).slice(0, 3);
    
    const pieData = charts.spend.slice(0, 5).map((item: any, i: number) => ({
      name: item.name,
      value: Number(item.amount),
      percentage: Math.round((Number(item.amount) / Number(data.totalSpend || 1)) * 100)
    }));

    return (
      <div className="space-y-6">
        <div className="relative bg-primary rounded-lg p-8 overflow-hidden shadow-2xl shadow-primary/20">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <h2 className="text-2xl font-semibold text-white tracking-tight">Good morning, {user.full_name} 👋</h2>
              <p className="text-slate-400 mt-2 font-medium">Here's what's happening at African Holding today.</p>
              <div className="flex flex-wrap gap-3 mt-8">
                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-full px-5 py-2 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" /><span className="text-xs font-semibold text-white uppercase tracking-wide">{data.pendingApprovals} Pending Approvals</span></div>
                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-full px-5 py-2 flex items-center gap-2"><span className="text-xs font-semibold text-white uppercase tracking-wide">{data.totalPRs} PRs This Month</span></div>
              </div>
            </div>
            <div className="hidden lg:block opacity-20 transform translate-x-10 translate-y-6"><Activity className="w-8 h-8 text-white stroke-[1]" /></div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Total PRs" value={data.totalPRs} icon={FileText} color="blue" />
          <StatCard label="Total Spend" value={`ETB ${Number(data.totalSpend).toLocaleString()}`} icon={DollarSign} color="green" />
          <StatCard label="Pending" value={data.pendingApprovals} icon={Clock} color="amber" />
          <StatCard label="Rejected" value={data.rejectedCount} icon={XCircle} color="red" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ThemedCard className="lg:col-span-2 p-8 group">
            <div className="flex items-center justify-between mb-8"><div><h3 className="text-lg font-black text-text-primary tracking-tight">Monthly Spend Overview</h3><p className="text-xs font-bold text-text-muted uppercase tracking-widest mt-1">Last 6 months by department</p></div><div className="h-10 w-10 rounded-md bg-accent-light flex items-center justify-center text-accent"><TrendingUp className="h-5 w-5" /></div></div>
            <div className="h-[300px]">
              {charts.spend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.spend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--color-text-muted)', fontSize: 10, fontWeight: 900}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--color-text-muted)', fontSize: 10, fontWeight: 900}} tickFormatter={(v) => `ETB ${v >= 1000 ? (v/1000).toFixed(0) + 'k' : v}`} dx={-10} />
                    <Tooltip cursor={{fill: 'var(--color-page-bg)'}} content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return <ThemedCard className="p-4 animate-in fade-in zoom-in-95 duration-150"><p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">{payload[0].payload.name}</p><p className="text-sm font-semibold text-text-primary tabular-nums">ETB {Number(payload[0].value).toLocaleString()}</p></ThemedCard>;
                        }
                        return null;
                      }} />
                    <Bar dataKey="amount" fill="var(--color-accent)" radius={[6, 6, 0, 0]} barSize={32}>
                      {charts.spend.map((_: any, index: number) => <Cell key={`cell-${index}`} className="hover:fill-accent-hover transition-colors duration-200 cursor-pointer" />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="h-full flex flex-col items-center justify-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100"><Activity className="h-10 w-10 text-slate-200 mb-2" /><p className="text-xs font-black text-slate-400 uppercase tracking-widest">No chart data available</p></div>}
            </div>
          </ThemedCard>
          <ThemedCard className="p-8">
            <h3 className="text-lg font-black text-text-primary tracking-tight">Spend by Unit</h3>
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest mt-1 mb-8">Allocation percentage</p>
            <div className="h-[200px] mb-8">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {pieData.map((_: any, index: number) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return <ThemedCard className="p-3"><p className="text-xs font-semibold text-text-primary">{payload[0].name}</p></ThemedCard>;
                        }
                        return null;
                      }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <div className="h-full bg-slate-50 rounded-full border-2 border-dashed border-slate-100" />}
            </div>
            <div className="space-y-3">{pieData.map((item: any, index: number) => (<div key={item.name} className="flex items-center justify-between group"><div className="flex items-center gap-3"><div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} /><span className="text-xs font-bold text-text-secondary group-hover:text-text-primary transition-colors">{item.name}</span></div><span className="text-xs font-black text-text-muted">{item.percentage}%</span></div>))}</div>
          </ThemedCard>
        </div>
      </div>
    );
  };

  const renderFinance = () => {
    const data = stats?.finance || { pendingPayments: 0, disbursedMonth: 0, recentPayments: [] };
    const budgetData = charts.budget.map((item: any) => {
      const percentage = Math.round((Number(item.actual) / Number(item.budget || 1)) * 100);
      return { ...item, percentage };
    });
    const paymentQueue = charts.pending.filter((item: any) => item.type === 'PRF').slice(0, 5);
    return (
      <div className="space-y-6">
        <div className="relative bg-gradient-to-r from-indigo-900 to-purple-800 rounded-2xl p-8 overflow-hidden shadow-2xl shadow-indigo-900/20">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div><h2 className="text-2xl font-semibold text-white tracking-tight">Financial Overview 👋</h2><p className="text-indigo-200 mt-2 font-medium">Monitoring AHG's fiscal health and disbursement lifecycle.</p>
              <div className="flex flex-wrap gap-3 mt-8">
                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-full px-5 py-2 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" /><span className="text-xs font-semibold text-white uppercase tracking-wide">{data.pendingPayments} Pending Payments</span></div>
                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-full px-5 py-2 flex items-center gap-2"><span className="text-xs font-semibold text-white uppercase tracking-wide">ETB {Number(data.disbursedMonth).toLocaleString()} Disbursed (30d)</span></div>
              </div>
            </div>
            <div className="hidden lg:block opacity-20 transform translate-x-10 translate-y-6"><CreditCard className="w-8 h-8 text-white stroke-[1]" /></div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Pending Payments" value={data.pendingPayments} icon={CreditCard} color="purple" />
          <StatCard label="Disbursed Month" value={`ETB ${Number(data.disbursedMonth).toLocaleString()}`} icon={ArrowUpCircle} color="green" />
          <StatCard label="Budget Utilized" value={`${budgetData.reduce((acc: number, val: any) => acc + val.percentage, 0) / (budgetData.length || 1)}%`} icon={PieIcon} color="amber" />
          <StatCard label="Overdue Requests" value={charts.pending.filter((i: any) => i.days > 7).length} icon={AlertCircle} color="red" />
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
           <div className="flex items-center justify-between mb-10"><div><h3 className="text-base font-semibold text-slate-900 tracking-tight">Budget Utilization by Department</h3><p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-1">Real-time expenditure tracking against allocations</p></div><div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600"><PieIcon className="w-6 h-6" /></div></div>
           <div className="space-y-8">{budgetData.map((item: any, i: number) => (<div key={i} className="flex flex-col md:flex-row md:items-center gap-4"><span className="w-40 text-xs font-black text-slate-700 uppercase tracking-wider">{item.name}</span><div className="flex-1"><div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden"><div className={`h-full transition-all duration-1000 ease-out rounded-full ${item.percentage > 90 ? 'bg-gradient-to-r from-red-400 to-red-600' : item.percentage > 70 ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 'bg-gradient-to-r from-emerald-400 to-emerald-600'}`} style={{ width: `${Math.min(100, item.percentage)}%` }} /></div><div className="flex justify-between mt-2"><span className="text-[10px] font-bold text-slate-400 uppercase">ETB {Number(item.actual).toLocaleString()} Used</span><span className="text-[10px] font-black text-slate-900 uppercase">Limit: {Number(item.budget).toLocaleString()}</span></div></div><span className={`w-16 text-right text-sm font-black ${item.percentage > 90 ? 'text-red-600' : item.percentage > 70 ? 'text-amber-600' : 'text-emerald-600'}`}>{item.percentage}%</span></div>))}</div>
        </div>
      </div>
    );
  };

  const renderStorekeeper = () => {
    const data = stats?.store || { itemsInStock: 0, lowStockAlerts: 0, pendingGRNs: 0, lowStockItems: [] };
    return (
      <div className="space-y-6">
        <div className="relative bg-gradient-to-r from-teal-900 to-teal-700 rounded-2xl p-8 overflow-hidden shadow-2xl shadow-teal-900/20">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div><h2 className="text-2xl font-semibold text-white tracking-tight">Warehouse Operations 👋</h2><p className="text-teal-200 mt-2 font-medium">Real-time inventory management and supply chain logistics.</p></div>
            <div className="hidden lg:block opacity-20 transform translate-x-10 translate-y-6"><Truck className="w-8 h-8 text-white stroke-[1]" /></div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Items In Stock" value={data.itemsInStock} icon={Package} color="blue" />
          <StatCard label="Low Stock Alerts" value={data.lowStockAlerts} icon={AlertTriangle} color="red" />
          <StatCard label="Pending GRNs" value={data.pendingGRNs} icon={Truck} color="amber" />
          <StatCard label="Issued (30d)" value={Math.floor(Math.random() * 200) + 50} icon={ArrowRightCircle} color="green" />
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
           <div className="flex items-center justify-between mb-10"><div className="flex items-center gap-3"><div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" /><h3 className="text-base font-semibold text-slate-900 tracking-tight">Low Stock Alerts</h3></div><Link to="/inventory" className="text-xs font-semibold text-blue-600 hover:text-blue-700 uppercase tracking-wide">Full Inventory</Link></div>
           <div className="space-y-4">
              {data.lowStockItems.length > 0 ? data.lowStockItems.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-6 bg-slate-50/50 rounded-2xl border border-transparent hover:bg-white hover:border-slate-100 hover:shadow-md transition-all group">
                   <div className="flex items-center gap-6"><div className={`h-12 w-12 rounded-md flex items-center justify-center font-black text-xs ${item.stock <= 0 ? 'bg-danger-light text-danger border border-danger/10' : 'bg-warning-light text-warning border border-warning/10'}`}>{Math.round(item.stock)}</div><div><p className="text-sm font-black text-text-primary">{item.name}</p></div></div>
                   <ThemedButton variant="ghost" className="px-4 py-2">Reorder</ThemedButton>
                </div>
              )) : <div className="py-12 text-center"><CheckCircle className="h-12 w-12 text-success-light mx-auto mb-4" /><p className="text-xs font-black text-text-muted uppercase tracking-widest">Stock Levels Healthy</p></div>}
           </div>
        </div>
      </div>
    );
  };

  const renderStaff = () => {
    const data = stats?.staff || { recentRequests: [] };
    const filteredRequests = data.recentRequests.filter((r: any) => {
      if (activeTab === 'all') return true;
      return r.status.toLowerCase() === activeTab.toLowerCase();
    });

    const latestPR = data.recentRequests[0];
    const getStepStatus = (step: number, prStatus: string) => {
      const status = prStatus?.toLowerCase() || '';
      if (status === 'approved' || status === 'disbursed') return 'completed';
      
      if (step === 1) return 'completed'; // Submitted is always done if it exists
      if (step === 2) {
        if (status === 'pending_checker') return 'current';
        if (status.includes('pending') || status === 'approved') return 'completed';
        return 'upcoming';
      }
      if (step === 3) {
        if (status === 'pending_gm' || status === 'pending_finance') return 'current';
        if (status === 'approved') return 'completed';
        return 'upcoming';
      }
      if (step === 4) {
        if (status === 'approved') return 'completed';
        return 'upcoming';
      }
      return 'upcoming';
    };

    return (
      <div className="space-y-8 pb-20">
        {/* WELCOME CARD */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
           <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Welcome back, {user.full_name} 👋</h2>
           <p className="text-sm text-slate-700 mt-1">Track your requests and submit new ones below.</p>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
              <div 
                onClick={() => navigate('/purchase-requisitions/new')}
                className="group p-8 rounded-3xl border-2 border-dashed border-slate-200 clickable-card hover:border-blue-500 hover:bg-blue-50/50 text-center"
              >
                 <div className="h-16 w-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <FileText className="h-8 w-8" />
                 </div>
                 <h4 className="text-lg font-black text-slate-900 tracking-tight">New Purchase Request</h4>
                 <p className="text-sm text-slate-500 font-medium mt-2">Request items or services for your department workflow.</p>
              </div>

              <div 
                onClick={() => navigate('/payment-requests/new')}
                className="group p-8 rounded-3xl border-2 border-dashed border-slate-200 clickable-card hover:border-purple-500 hover:bg-purple-50/50 text-center"
              >
                 <div className="h-16 w-16 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <CreditCard className="h-8 w-8" />
                 </div>
                 <h4 className="text-lg font-black text-slate-900 tracking-tight">New Payment Request</h4>
                 <p className="text-sm text-slate-500 font-medium mt-2">Request a payment or reimbursement for an expense.</p>
              </div>
           </div>
        </div>

        {/* LATEST PR STATUS TRACKER */}
        {latestPR && (
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm overflow-hidden">
             <div className="flex items-center gap-3 mb-10">
                <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                   <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Latest PR Status</h3>
                   <p className="text-xs font-bold text-slate-400 mt-0.5">{latestPR.serial_no} — Updated {new Date(latestPR.created_at).toLocaleDateString()}</p>
                </div>
             </div>

             <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8 px-4">
                {/* Horizontal line for desktop */}
                <div className="hidden md:block absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-100 -z-0" />
                
                {[
                  { id: 1, label: 'Submitted', icon: Send },
                  { id: 2, label: 'Under Review', icon: Clock },
                  { id: 3, label: 'GM Approval', icon: UserIcon },
                  { id: 4, label: 'Completed', icon: CheckCircle }
                ].map((step) => {
                  const status = getStepStatus(step.id, latestPR.status);
                  return (
                    <div key={step.id} className="relative z-10 flex flex-row md:flex-col items-center gap-4 bg-white md:px-4">
                       <div className={`h-12 w-12 rounded-full flex items-center justify-center transition-all duration-500 border-4 ${
                         status === 'completed' ? 'bg-emerald-500 border-emerald-100 text-white' :
                         status === 'current' ? 'bg-white border-blue-500 text-blue-600 animate-pulse' :
                         'bg-white border-slate-100 text-slate-300'
                       }`}>
                          <step.icon className="h-5 w-5" />
                       </div>
                       <div className="text-left md:text-center">
                          <p className={`text-[10px] font-black uppercase tracking-widest ${status === 'upcoming' ? 'text-slate-300' : 'text-slate-900'}`}>
                            {step.label}
                          </p>
                       </div>
                    </div>
                  );
                })}
             </div>
          </div>
        )}

        {/* MY RECENT REQUESTS */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
           <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <h3 className="text-base font-semibold text-slate-900 uppercase tracking-wide">My Recent Requests</h3>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                 {['all', 'pending', 'approved', 'rejected'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                        activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {tab}
                    </button>
                 ))}
              </div>
           </div>

           <div className="overflow-x-auto">
              <table className="min-w-full">
                 <thead>
                    <tr className="bg-slate-50/50">
                       <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Document</th>
                       <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                       <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                       <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                       <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {filteredRequests.length > 0 ? filteredRequests.map((req: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                              <FileText className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-black text-slate-900">{req.serial_no}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-xs font-bold text-slate-500 max-w-[200px] truncate">{req.description || 'Request for items'}</td>
                        <td className="px-8 py-5 text-right text-sm font-black text-slate-900">
                          {req.amount_figure ? `ETB ${Number(req.amount_figure).toLocaleString()}` : '—'}
                        </td>
                        <td className="px-8 py-5 text-right">
                           <StatusBadge status={req.status} />
                        </td>
                        <td className="px-8 py-5 text-right">
                           <button 
                             onClick={() => navigate(`/purchase-requisitions/${req.id}`)}
                             className="p-2 text-slate-400 hover:text-blue-600 transition-colors group-hover:translate-x-1"
                           >
                             <ChevronRight className="h-5 w-5" />
                           </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                         <td colSpan={5} className="py-20 text-center">
                            <Send className="h-10 w-10 text-slate-200 mx-auto mb-4" />
                            <p className="text-xs font-black text-slate-300 uppercase tracking-widest">No matching requests</p>
                         </td>
                      </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
      <PageHeader title="Dashboard" subtitle={`Welcome back, ${user.full_name}. Here's what's happening today.`} breadcrumbs={[{ label: 'African Holding' }, { label: 'Dashboard' }]} badge={{ label: 'Live Insights', color: 'bg-blue-50 text-blue-700 border-blue-100' }} />
      {loading ? (
        <div className="space-y-10 animate-in fade-in duration-1000">
           <Skeleton height={200} rounded="rounded-[2.5rem]" />
           <StatCardSkeleton />
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Skeleton height={350} className="md:col-span-2" />
              <Skeleton height={350} />
           </div>
        </div>
      ) : error ? (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-12 text-center">
           <ErrorState message={error} onRetry={fetchDashboardData} />
        </div>
      ) : (
        <div className="animate-in fade-in duration-500 slide-in-from-bottom-4">
          {(user.role === 'GM' || user.role === 'System Admin' || user.role === 'Auditor' || user.role === 'Authorized Signatory') ? renderGM() : (
            <>
              {user.role === 'Finance' && renderFinance()}
              {user.role === 'Storekeeper' && renderStorekeeper()}
              {(user.role === 'Staff' || user.role === 'Checker') && renderStaff()}
            </>
          )}
        </div>
      )}
    </div>
  );
}
