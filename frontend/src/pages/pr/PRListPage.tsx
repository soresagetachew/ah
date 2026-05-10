import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import type { PurchaseRequisition } from '../../types';
import { 
  Plus, Search, Eye, FileSearch, File, 
  ChevronUp, ChevronDown, Filter, X, 
  Calendar, MoreHorizontal, FileText 
} from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import { SkeletonTable, ErrorState } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { Loader2 } from 'lucide-react';

export default function PRListPage() {
  const navigate = useNavigate();
  const [prs, setPrs] = useState<PurchaseRequisition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => {
    fetchPRs();
  }, []);

  const fetchPRs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await client.get('/purchase-requisitions');
      setPrs(res.data.data);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to synchronize requisition ledger');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredPrs = prs
    .filter(pr => 
      (pr.serial_no?.toLowerCase().includes(search.toLowerCase()) || 
       pr.requester_name?.toLowerCase().includes(search.toLowerCase())) &&
      (statusFilter === '' || pr.status === statusFilter)
    )
    .sort((a: any, b: any) => {
      if (!sortConfig) return 0;
      const { key, direction } = sortConfig;
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });

  const getRelativeTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };


  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-in fade-in duration-700">
      <PageHeader 
        title="Purchase Requisitions"
        subtitle="Manage and track all purchase requests across the organization."
        breadcrumbs={[{ label: 'African Holding' }, { label: 'Procurement' }, { label: 'Requisitions' }]}
        actions={
          <button
            onClick={() => navigate('/purchase-requisitions/new')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-semibold uppercase tracking-wide hover:bg-blue-600 transition-all shadow-md"
          >
            <Plus className="w-4 h-4" /> New Requisition
          </button>
        }
      />

      {/* FILTERS BAR */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by ID or requester..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-64 bg-slate-50 border-transparent rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border-transparent rounded-xl text-sm font-semibold text-slate-500 uppercase tracking-wide focus:ring-2 focus:ring-blue-500/20 transition-all"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            { (search || statusFilter) && (
              <button 
                onClick={() => { setSearch(''); setStatusFilter(''); }}
                className="text-xs font-semibold text-blue-600 uppercase tracking-wide hover:text-blue-700 transition-colors flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Clear Filters
              </button>
            )}
          </div>
        </div>

        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
           Showing {filteredPrs.length} of {prs.length} results
        </div>
      </div>

      {loading ? <SkeletonTable /> : error ? <ErrorState message={error} onRetry={fetchPRs} /> : filteredPrs.length === 0 ? (
        <EmptyState 
          icon={FileText}
          title="No purchase requisitions yet"
          description="Create your first purchase request to get started and track your procurement workflow."
          action={{
            label: "New Purchase Request",
            onClick: () => navigate('/purchase-requisitions/new')
          }}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/50">
                <tr>
                  <th 
                    onClick={() => handleSort('serial_no')}
                    className="px-8 py-5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                       PR Number
                       {sortConfig?.key === 'serial_no' ? (
                         sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-blue-500" /> : <ChevronDown className="w-3 h-3 text-blue-500" />
                       ) : <ChevronUp className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-all" />}
                    </div>
                  </th>
                  <th className="px-8 py-5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Requested By</th>
                  <th className="px-8 py-5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Department</th>
                  <th 
                    onClick={() => handleSort('total_requested')}
                    className="px-8 py-5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer group"
                  >
                    <div className="flex items-center justify-end gap-2">
                       Amount
                       {sortConfig?.key === 'total_requested' ? (
                         sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-blue-500" /> : <ChevronDown className="w-3 h-3 text-blue-500" />
                       ) : <ChevronUp className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-all" />}
                    </div>
                  </th>
                  <th className="px-8 py-5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                  <th className="px-8 py-5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="px-8 py-5"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-50">
                {filteredPrs.map((pr: any, index: number) => (
                  <tr 
                    key={pr.id} 
                    onClick={() => navigate(`/purchase-requisitions/${pr.id}`)}
                    className="hover:bg-blue-50/40 transition-all duration-150 cursor-pointer group animate-fade-in"
                    style={{ animationDelay: `${Math.min(index * 50, 250)}ms` }}
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                         <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <File className="w-4 h-4" />
                         </div>
                         <span className="font-mono text-sm font-medium text-slate-900">{pr.serial_no}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                         <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-500 border border-slate-200">
                            {pr.requester_name?.split(' ').map((n: string) => n[0]).join('')}
                         </div>
                         <span className="text-sm text-slate-700">{pr.requester_name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm font-medium text-slate-500 uppercase tracking-tight">{pr.department_name}</td>
                    <td className="px-8 py-5 text-right font-semibold tabular-nums text-slate-900 text-sm">
                      <span className="text-xs text-slate-500 mr-1.5">ETB</span>
                      {Number(pr.total_requested).toLocaleString()}
                    </td>
                    <td className="px-8 py-5">
                      <div>
                        <p className="text-sm text-slate-900">{new Date(pr.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{getRelativeTime(pr.created_at)}</p>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <StatusBadge status={pr.status} />
                    </td>
                    <td className="px-8 py-5 text-right">
                       <button className="p-2 text-slate-300 hover:text-blue-600 transition-colors group-hover:translate-x-1">
                          <Eye className="h-5 w-5" />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION UI */}
          <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
             <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Page 1 of 1
             </div>
             <div className="flex items-center gap-2">
                <button disabled className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold uppercase tracking-wide text-slate-400 cursor-not-allowed">
                  Previous
                </button>
                {[1].map(p => (
                   <button key={p} className="h-9 w-9 rounded-xl bg-blue-500 text-white text-xs font-semibold">
                    {p}
                  </button>
                ))}
                <button disabled className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold uppercase tracking-wide text-slate-400 cursor-not-allowed">
                  Next
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
