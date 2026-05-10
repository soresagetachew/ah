import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import client from '../../api/client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';
import {
  FileText, DollarSign, Clock, XCircle, Send,
  Package, AlertTriangle, CheckCircle, TrendingUp, Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [charts, setCharts] = useState<any>({ spend: [], budget: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, spendRes, budgetRes] = await Promise.allSettled([
        client.get('/dashboard/stats'),
        client.get('/reports/spend_by_dept?days=30'),
        client.get('/reports/budget_vs_actual')
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      
      setCharts({
        spend: spendRes.status === 'fulfilled' ? spendRes.value.data.chart : [],
        budget: budgetRes.status === 'fulfilled' ? budgetRes.value.data.chart : []
      });
    } catch (e) {
      console.error('Failed to fetch dashboard data', e);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const StatCard = ({ title, value, icon: Icon, color, bg }: any) => (
    <div className="bg-white overflow-hidden shadow-sm rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center">
        <div className={`flex-shrink-0 rounded-lg p-3 ${bg}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</dt>
          <dd className="text-2xl font-bold text-gray-900 mt-1">{value}</dd>
        </div>
      </div>
    </div>
  );

  const renderGM = () => {
    const data = stats?.gm || { totalPRs: 0, totalSpend: 0, pendingApprovals: 0, rejectedCount: 0 };
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total PRs" value={data.totalPRs} icon={FileText} color="text-indigo-600" bg="bg-indigo-50" />
          <StatCard title="Total Spend" value={`ETB ${Number(data.totalSpend).toLocaleString()}`} icon={DollarSign} color="text-emerald-600" bg="bg-emerald-50" />
          <StatCard title="Pending" value={data.pendingApprovals} icon={Clock} color="text-amber-600" bg="bg-amber-50" />
          <StatCard title="Rejected" value={data.rejectedCount} icon={XCircle} color="text-rose-600" bg="bg-rose-50" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Spend by Department (30 Days)</h3>
            <div className="h-80">
              {charts.spend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.spend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                    <Tooltip cursor={{fill: '#f9fafb'}} />
                    <Bar dataKey="amount" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-lg">
                  <TrendingUp className="h-12 w-12 mb-2 opacity-20" />
                  <p>No spend data recorded yet.</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Budget vs Actual</h3>
            <div className="h-80">
              {charts.budget.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.budget}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                    <Tooltip />
                    <Legend iconType="circle" />
                    <Bar dataKey="budget" name="Budget" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="actual" name="Actual" fill="#e11d48" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-lg">
                  <DollarSign className="h-12 w-12 mb-2 opacity-20" />
                  <p>No budget data available.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFinance = () => {
    const data = stats?.finance || { pendingPayments: 0, disbursedMonth: 0, recentPayments: [] };
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <StatCard title="Awaiting Payment" value={data.pendingPayments} icon={Clock} color="text-amber-600" bg="bg-amber-50" />
          <StatCard title="Disbursed (30d)" value={`ETB ${Number(data.disbursedMonth).toLocaleString()}`} icon={CheckCircle} color="text-emerald-600" bg="bg-emerald-50" />
          <StatCard title="Efficiency" value="High" icon={TrendingUp} color="text-indigo-600" bg="bg-indigo-50" />
        </div>
        <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Disbursements</h3>
          {data.recentPayments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Serial No</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Department</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.recentPayments.map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 text-sm font-bold text-indigo-600">{row.serial_no}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">{row.department_name}</td>
                      <td className="px-4 py-4 text-sm font-bold text-gray-900">ETB {Number(row.amount_figure).toLocaleString()}</td>
                      <td className="px-4 py-4 text-sm text-gray-400 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(row.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <DollarSign className="mx-auto h-12 w-12 opacity-10 mb-2" />
              <p>No recent disbursements found.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderStorekeeper = () => {
    const data = stats?.store || { itemsInStock: 0, lowStockAlerts: 0, pendingGRNs: 0, lowStockItems: [] };
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <StatCard title="Inventory Items" value={data.itemsInStock} icon={Package} color="text-indigo-600" bg="bg-indigo-50" />
          <StatCard title="Low Stock" value={data.lowStockAlerts} icon={AlertTriangle} color="text-rose-600" bg="bg-rose-50" />
          <StatCard title="Pending GRNs" value={data.pendingGRNs} icon={FileText} color="text-amber-600" bg="bg-amber-50" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
              <AlertTriangle className="h-5 w-5 text-rose-500 mr-2" />
              Low Stock Alerts
            </h3>
            {data.lowStockItems.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {data.lowStockItems.map((item: any, i: number) => (
                  <li key={i} className="py-4 flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded bg-rose-50 flex items-center justify-center text-rose-500 mr-3 text-xs font-bold">
                        {item.stock}
                      </div>
                      <span className="text-sm font-medium text-gray-700">{item.name}</span>
                    </div>
                    <span className="text-xs font-bold px-2 py-1 bg-gray-100 rounded text-gray-500">Min: {item.min}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-12 text-center text-gray-400">
                <CheckCircle className="mx-auto h-12 w-12 opacity-10 mb-2" />
                <p>All stock levels are healthy.</p>
              </div>
            )}
            <Link to="/inventory" className="mt-6 block text-center text-sm font-bold text-indigo-600 hover:text-indigo-700">Manage Inventory</Link>
          </div>
          <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-100 flex flex-col items-center justify-center text-center">
            <Package className="h-16 w-16 text-gray-100 mb-4" />
            <h4 className="text-lg font-bold text-gray-900">Store Management</h4>
            <p className="text-sm text-gray-500 mt-2 max-w-xs">Efficiently track goods receiving and issuance across all subsidiaries.</p>
            <div className="mt-6 grid grid-cols-2 gap-4 w-full">
              <Link to="/goods-receiving-notes/new" className="p-3 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors">New GRN</Link>
              <Link to="/store-issued-vouchers/new" className="p-3 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors">New SIV</Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStaff = () => {
    const data = stats?.staff || { recentRequests: [] };
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Link to="/purchase-requisitions/new" className="group bg-indigo-600 p-8 rounded-2xl shadow-lg shadow-indigo-200 flex flex-col justify-between hover:bg-indigo-700 transition-all transform hover:-translate-y-1">
            <FileText className="h-10 w-10 text-indigo-200 mb-8" />
            <div>
              <h3 className="text-xl font-bold text-white">Create Purchase Requisition</h3>
              <p className="text-indigo-200 text-sm mt-2">Request items or services for your department.</p>
            </div>
          </Link>
          <Link to="/payment-requests/new" className="group bg-white p-8 rounded-2xl border-2 border-indigo-50 flex flex-col justify-between hover:border-indigo-600 transition-all transform hover:-translate-y-1">
            <DollarSign className="h-10 w-10 text-indigo-600 mb-8" />
            <div>
              <h3 className="text-xl font-bold text-gray-900">New Payment Request</h3>
              <p className="text-gray-500 text-sm mt-2">Submit invoices or expense claims for reimbursement.</p>
            </div>
          </Link>
        </div>

        <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-gray-900">My Recent Requests</h3>
            <Link to="/purchase-requisitions" className="text-sm font-bold text-indigo-600 hover:underline">View all history</Link>
          </div>
          {data.recentRequests.length > 0 ? (
            <div className="space-y-4">
              {data.recentRequests.map((req: any, i: number) => (
                <Link key={i} to={`/purchase-requisitions/${req.id}`} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-indigo-50 transition-colors group">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-indigo-600 border border-indigo-100 mr-4">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 group-hover:text-indigo-700">{req.serial_no}</p>
                      <p className="text-xs text-gray-400">{new Date(req.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    req.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                    req.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {req.status}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
              <Send className="mx-auto h-12 w-12 text-gray-200 mb-4" />
              <p className="text-gray-400 font-medium">You haven't submitted any requests yet.</p>
              <p className="text-xs text-gray-300 mt-1">Submit your first PR to see it tracked here.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">System Dashboard</h2>
          <div className="flex items-center mt-2 text-gray-500 text-sm font-medium">
            <span className="flex items-center px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md mr-3">
              <TrendingUp className="h-3 w-3 mr-1" />
              Live Updates
            </span>
            <span>{user.role} Dashboard</span>
            <span className="mx-2 opacity-30">•</span>
            <span>{user.business_unit || 'AHG HO'}</span>
          </div>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-sm font-bold text-gray-900">{new Date().toLocaleDateString('en-ET', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          <p className="text-xs text-gray-400 mt-1">African Holding Procurement Platform v2.0</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          {user.role === 'GM' && renderGM()}
          {user.role === 'Finance' && renderFinance()}
          {user.role === 'Storekeeper' && renderStorekeeper()}
          {(user.role === 'Staff' || user.role === 'Checker') && renderStaff()}
          {(user.role === 'System Admin' || user.role === 'Auditor' || user.role === 'Authorized Signatory') && renderGM()}
        </>
      )}
    </div>
  );
}
