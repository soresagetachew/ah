import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import type { PurchaseRequisition } from '../../types';
import { TYPOGRAPHY, SPACING, RADIUS, HEIGHTS, COLORS } from '../../components/shared/DesignTokens';
import { 
  Plus, Search, Eye, FileSearch, File, 
  ChevronUp, ChevronDown, Filter, X, 
  Calendar, MoreHorizontal, FileText,
  Loader2, ChevronLeft, ChevronRight
} from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import { SkeletonTable, ErrorState } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { ThemedCard, ThemedButton, ThemedTableRow } from '../../components/ui/themed';
import { MobilePRCard } from '../../components/mobile/MobilePRCard';

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
    <div className={`max-w-7xl mx-auto ${SPACING.cardGap} pb-20 animate-in fade-in duration-700`}>
      <PageHeader 
        title="Purchase Requisitions"
        subtitle="Manage and track all purchase requests across the organization."
        breadcrumbs={[{ label: 'African Holding' }, { label: 'Procurement' }, { label: 'Requisitions' }]}
        actions={
          <ThemedButton
            variant="accent"
            onClick={() => navigate('/purchase-requisitions/new')}
          >
            <Plus className="w-4 h-4 mr-2 inline" /> New Requisition
          </ThemedButton>
        }
      />

      {/* FILTERS BAR */}
      <ThemedCard className={`!p-4 flex flex-col lg:flex-row gap-4`}>
        
        {/* Search input — full width on mobile */}
        <div className="relative w-full lg:w-96 flex-shrink-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by ID or requester..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 lg:py-2.5 bg-page-bg border-transparent ${RADIUS.card} ${TYPOGRAPHY.inputValue} font-medium text-slate-900 focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all min-h-[44px]`}
          />
        </div>
        
        {/* Filter dropdowns & Actions — scroll horizontally on mobile */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 w-full scrollbar-none justify-between lg:justify-start">
          <div className="flex items-center gap-2 flex-shrink-0">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-4 py-3 lg:py-2.5 bg-page-bg border-transparent ${RADIUS.card} ${TYPOGRAPHY.badgeText} font-black text-slate-500 uppercase tracking-widest focus:ring-2 focus:ring-accent/20 transition-all min-h-[44px] cursor-pointer`}
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
                className={`px-3 py-3 lg:py-2.5 ${TYPOGRAPHY.badgeText} font-black text-accent uppercase tracking-widest hover:bg-accent/10 transition-colors flex items-center gap-1.5 ${RADIUS.card} min-h-[44px]`}
              >
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>
          
          <div className={`${TYPOGRAPHY.badgeText} font-black text-slate-400 uppercase tracking-widest flex-shrink-0 px-2`}>
             {filteredPrs.length} / {prs.length}
          </div>
        </div>
      </ThemedCard>

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
        <ThemedCard className="!p-0">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr className="bg-page-bg/50">
                  <th 
                    onClick={() => handleSort('serial_no')}
                    className="px-8 py-5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                       PR Number
                       {sortConfig?.key === 'serial_no' ? (
                         sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-accent" /> : <ChevronDown className="w-3 h-3 text-accent" />
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
                         sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-accent" /> : <ChevronDown className="w-3 h-3 text-accent" />
                       ) : <ChevronUp className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-all" />}
                    </div>
                  </th>
                  <th className="px-8 py-5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                  <th className="px-8 py-5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="px-8 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredPrs.map((pr: any, index: number) => (
                  <ThemedTableRow 
                    key={pr.id} 
                    onClick={() => navigate(`/purchase-requisitions/${pr.id}`)}
                    className="cursor-pointer group animate-fade-in"
                    style={{ animationDelay: `${Math.min(index * 50, 250)}ms` }}
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                         <div className="h-9 w-9 rounded-xl bg-accent-light text-accent flex items-center justify-center group-hover:scale-110 transition-transform">
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
                       <button className="p-2 text-slate-300 hover:text-accent transition-colors group-hover:translate-x-1">
                          <Eye className="h-5 w-5" />
                       </button>
                    </td>
                  </ThemedTableRow>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden space-y-3 p-4 bg-page-bg/30">
            {filteredPrs.map((pr: any) => (
              <MobilePRCard 
                key={pr.id} 
                item={pr} 
                onClick={() => navigate(`/purchase-requisitions/${pr.id}`)} 
              />
            ))}
          </div>

          {/* PAGINATION UI */}
          <div className="px-4 lg:px-8 py-4 lg:py-6 bg-page-bg/50 border-t border-border">
             {/* Desktop Pagination */}
             <div className="hidden lg:flex items-center justify-between">
                <div className={`${TYPOGRAPHY.badgeText} font-semibold text-slate-500 uppercase tracking-wide`}>
                   Page 1 of 1
                </div>
                <div className="flex items-center gap-2">
                   <ThemedButton disabled variant="outline" className={`px-4 py-2 ${HEIGHTS.button} !font-semibold`}>
                     Previous
                   </ThemedButton>
                   {[1].map(p => (
                      <ThemedButton key={p} className={`h-9 w-9 !p-0 !font-semibold ${HEIGHTS.button}`}>
                       {p}
                     </ThemedButton>
                   ))}
                   <ThemedButton disabled variant="outline" className={`px-4 py-2 ${HEIGHTS.button} !font-semibold`}>
                     Next
                   </ThemedButton>
                </div>
             </div>

             {/* Mobile Pagination */}
             <div className="flex lg:hidden items-center justify-between w-full">
                <button
                  disabled
                  className={`flex items-center gap-2 px-4 py-2 ${RADIUS.card} border border-border bg-white ${TYPOGRAPHY.badgeText} font-black uppercase tracking-widest text-slate-400 disabled:opacity-50 min-h-[44px]`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Prev
                </button>

                <span className={`${TYPOGRAPHY.badgeText} font-black uppercase tracking-widest text-slate-500`}>
                  Page 1 / 1
                </span>

                <button
                  disabled
                  className={`flex items-center gap-2 px-4 py-2 ${RADIUS.card} border border-border bg-white ${TYPOGRAPHY.badgeText} font-black uppercase tracking-widest text-slate-400 disabled:opacity-50 min-h-[44px]`}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
             </div>
          </div>
        </ThemedCard>
      )}
    </div>
  );
}
