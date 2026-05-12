import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { SPACING } from '../../components/shared/DesignTokens';
import { Plus, Search, CreditCard, Eye, X, ChevronRight, FileText, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/layout/PageHeader';
import { SkeletonTable, ErrorState } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { MobilePaymentCard } from '../../components/mobile/MobilePaymentCard';

interface PRF {
  id: string;
  serial_no: string;
  requester_name?: string;
  department_name?: string;
  mode: string;
  amount_figure: number;
  purpose: string;
  status: string;
  created_at: string;
}

const statusStyles: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  submitted: 'bg-blue-100 text-blue-800',
  checked: 'bg-amber-100 text-amber-800',
  authorized: 'bg-purple-100 text-purple-800',
  disbursed: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  returned: 'bg-orange-100 text-orange-800',
};

export default function PRFListPage() {
  const router = useNavigate();
  const [prfs, setPrfs] = useState<PRF[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchPRFs = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      const res = await client.get(`/payment-requests?${params}`);
      setPrfs(res.data.data || res.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to synchronize payment request ledger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPRFs();
  }, [statusFilter]);

  const filtered = prfs.filter(p =>
    (p.serial_no || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.purpose || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.requester_name || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalAmount = filtered.reduce((sum, p) => sum + Number(p.amount_figure || 0), 0);

  return (
    <div className={`max-w-7xl mx-auto ${SPACING.cardGap} pb-20 animate-in fade-in duration-700`}>
      <PageHeader 
        title="Payment Requests"
        subtitle="Manage and track all payment request forms (PRF) organization-wide."
        breadcrumbs={[{ label: 'African Holding' }, { label: 'Finance' }, { label: 'Payments' }]}
        actions={
          <button
            onClick={() => router('/payment-requests/new')}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-6 py-2.5 text-sm font-semibold uppercase tracking-wide text-white shadow-md hover:bg-blue-600 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Payment Request
          </button>
        }
      />

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col lg:flex-row gap-4">
        
        {/* Search input — full width on mobile */}
        <div className="relative w-full lg:w-96 flex-shrink-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by number or purpose..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 lg:py-2.5 bg-slate-50 border-transparent rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[44px]"
          />
        </div>
        
        {/* Filter dropdowns & Actions — scroll horizontally on mobile */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 w-full scrollbar-none justify-between lg:justify-start">
          <div className="flex items-center gap-2 flex-shrink-0">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 lg:py-2.5 bg-slate-50 border-transparent rounded-xl text-xs font-semibold text-slate-500 uppercase tracking-wide focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[44px] cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="checked">Checked</option>
              <option value="authorized">Authorized</option>
              <option value="disbursed">Disbursed</option>
              <option value="rejected">Rejected</option>
              <option value="returned">Returned</option>
            </select>

            { (search || statusFilter) && (
              <button 
                onClick={() => { setSearch(''); setStatusFilter(''); }}
                className="px-3 py-3 lg:py-2.5 text-[10px] font-semibold text-blue-500 uppercase tracking-wide hover:bg-blue-50 transition-colors flex items-center gap-1.5 rounded-xl min-h-[44px]"
              >
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>
          
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide flex-shrink-0 px-2">
             {filtered.length} Requests Found
          </div>
        </div>
      </div>

      {/* Summary card */}
      {filtered.length > 0 && (
        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex items-center justify-between">
          <span className="text-sm text-slate-600">{filtered.length} payment request{filtered.length !== 1 ? 's' : ''} shown</span>
          <span className="text-sm font-semibold text-slate-900 tabular-nums">Total: ETB {totalAmount.toLocaleString('en-ET', { minimumFractionDigits: 2 })}</span>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        {/* Desktop View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">PRF #</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Requested By</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Department</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Purpose</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Mode</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount (ETB)</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr><td colSpan={9} className="p-8"><SkeletonTable rows={8} /></td></tr>
              ) : error ? (
                <tr><td colSpan={9} className="py-20"><ErrorState message={error} onRetry={fetchPRFs} /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-6 py-10">
                   <EmptyState 
                     icon={CreditCard}
                     title="No payment requests found"
                     description="Manage your financial obligations by creating your first payment request form (PRF)."
                     action={{
                       label: "Create First Request",
                       onClick: () => router('/payment-requests/new')
                     }}
                   />
                </td></tr>
              ) : (
                filtered.map((prf, index) => (
                  <tr 
                    key={prf.id} 
                    onClick={() => router(`/payment-requests/${prf.id}`)}
                    className="hover:bg-slate-50/50 transition-colors animate-fade-in group cursor-pointer"
                    style={{ animationDelay: `${Math.min(index * 50, 250)}ms` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm font-medium text-slate-900">{prf.serial_no}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{prf.requester_name || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{prf.department_name || '—'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{prf.purpose}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${prf.mode === 'cash' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>
                        {prf.mode}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900 tabular-nums">
                      {Number(prf.amount_figure).toLocaleString('en-ET', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${statusStyles[prf.status] || 'bg-slate-100 text-slate-600'}`}>
                        {prf.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(prf.created_at).toLocaleDateString('en-ET')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                       <button className="p-2 text-slate-400 group-hover:text-blue-600 transition-colors">
                          <Eye className="w-4 h-4" />
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="lg:hidden p-4 space-y-3 bg-slate-50/30">
          {filtered.map((prf) => (
            <MobilePaymentCard 
              key={prf.id} 
              item={{
                ...prf,
                payment_mode: prf.mode
              }} 
              onClick={() => router(`/payment-requests/${prf.id}`)} 
            />
          ))}
        </div>

        {/* Pagination */}
        <div className="px-4 lg:px-8 py-4 bg-slate-50 border-t border-slate-100">
           <div className="flex items-center justify-between">
              <button disabled className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-[10px] font-black uppercase tracking-widest text-slate-400 disabled:opacity-50 min-h-[44px]">
                 <ChevronLeft className="w-4 h-4" /> Prev
              </button>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Page 1 / 1</span>
              <button disabled className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-[10px] font-black uppercase tracking-widest text-slate-400 disabled:opacity-50 min-h-[44px]">
                 Next <ChevronRight className="w-4 h-4" />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
