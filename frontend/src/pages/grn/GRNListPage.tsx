import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { 
  Plus, Search, Package, Eye, Truck, 
  FileText, ChevronUp, ChevronDown, X, 
  Calendar, Building2, Hash,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import toast from 'react-hot-toast';
import { SkeletonTable, ErrorState } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { MobileGRNCard } from '../../components/mobile/MobileGRNCard';

interface GRN {
  id: string;
  serial_no: string;
  pr_serial_no?: string;
  supplier_name?: string;
  invoice_no?: string;
  type_classification: string;
  status: string;
  received_by_name?: string;
  created_at: string;
}

export default function GRNListPage() {
  const navigate = useNavigate();
  const [grns, setGrns] = useState<GRN[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => {
    fetchGRNs();
  }, []);

  const fetchGRNs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await client.get('/goods-receiving-notes');
      setGrns(res.data.data || res.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to synchronize warehouse receipts');
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

  const filtered = grns
    .filter(g =>
      ((g.serial_no || '').toLowerCase().includes(search.toLowerCase()) ||
       (g.supplier_name || '').toLowerCase().includes(search.toLowerCase()) ||
       (g.invoice_no || '').toLowerCase().includes(search.toLowerCase())) &&
      (statusFilter === '' || g.status === statusFilter)
    )
    .sort((a: any, b: any) => {
      if (!sortConfig) return 0;
      const { key, direction } = sortConfig;
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });


  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-in fade-in duration-700">
      <PageHeader 
        title="Goods Receiving Notes"
        subtitle="Monitor and track all inventory deliveries and supplier fulfillments."
        breadcrumbs={[{ label: 'African Holding' }, { label: 'Store' }, { label: 'Receipts' }]}
        actions={
          <button
            onClick={() => navigate('/goods-receiving-notes/new')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
          >
            <Plus className="h-4 w-4" /> Record New Receipt
          </button>
        }
      />

      {/* FILTERS BAR */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5 flex flex-col lg:flex-row gap-4">
        
        {/* Search input — full width on mobile */}
        <div className="relative w-full lg:w-96 flex-shrink-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by GRN, supplier or invoice..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 lg:py-2.5 bg-slate-50 border-transparent rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[44px]"
          />
        </div>
        
        {/* Filter dropdowns & Actions — scroll horizontally on mobile */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 w-full scrollbar-none justify-between lg:justify-start">
          <div className="flex items-center gap-2 flex-shrink-0">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 lg:py-2.5 bg-slate-50 border-transparent rounded-xl text-xs font-black text-slate-500 uppercase tracking-widest focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[44px] cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="completed">Completed</option>
            </select>

            { (search || statusFilter) && (
              <button 
                onClick={() => { setSearch(''); setStatusFilter(''); }}
                className="px-3 py-3 lg:py-2.5 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:bg-blue-50 transition-colors flex items-center gap-1.5 rounded-xl min-h-[44px]"
              >
                <X className="h-3.5 w-3.5" /> Clear
              </button>
            )}
          </div>
          
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex-shrink-0 px-2">
             {filtered.length} Records Found
          </div>
        </div>
      </div>

      {loading ? <SkeletonTable /> : error ? <ErrorState message={error} onRetry={fetchGRNs} /> : filtered.length === 0 ? (
        <EmptyState 
          icon={Truck}
          title="No goods receipts found"
          description="Track your warehouse inflow by recording new goods receiving notes for approved purchase orders."
          action={{
            label: "Record First Receipt",
            onClick: () => navigate('/goods-receiving-notes/new')
          }}
        />
      ) : (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          {/* Desktop View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/50">
                <tr>
                  <th onClick={() => handleSort('serial_no')} className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest cursor-pointer group">
                    <div className="flex items-center gap-2">
                       GRN #
                       {sortConfig?.key === 'serial_no' ? (
                         sortConfig.direction === 'asc' ? <ChevronUp className="h-3 w-3 text-blue-500" /> : <ChevronDown className="h-3 w-3 text-blue-500" />
                       ) : <ChevronUp className="h-3 w-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-all" />}
                    </div>
                  </th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Supplier</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Invoice No</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">PR Reference</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                  <th className="px-8 py-5 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-50">
                {filtered.map((grn, index) => (
                  <tr 
                    key={grn.id} 
                    onClick={() => navigate(`/goods-receiving-notes/${grn.id}`)} 
                    className="hover:bg-slate-50/50 transition-all duration-150 cursor-pointer group animate-fade-in"
                    style={{ animationDelay: `${Math.min(index * 50, 250)}ms` }}
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                         <div className="h-9 w-9 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Truck className="h-4 w-4" />
                         </div>
                         <span className="font-mono font-bold text-sm text-slate-900">{grn.serial_no}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-2">
                          <Building2 className="h-3.5 w-3.5 text-slate-300" />
                          <span className="text-sm font-bold text-slate-700">{grn.supplier_name || '—'}</span>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-2">
                          <Hash className="h-3.5 w-3.5 text-slate-300" />
                          <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{grn.invoice_no || '—'}</span>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-2">
                          <FileText className="h-3.5 w-3.5 text-blue-400" />
                          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">{grn.pr_serial_no || 'Manual'}</span>
                       </div>
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-slate-500">
                       {new Date(grn.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-8 py-5 text-center">
                       <StatusBadge status={grn.status === 'completed' ? 'approved' : grn.status} />
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

          {/* Mobile View */}
          <div className="lg:hidden p-4 space-y-3 bg-slate-50/30">
            {filtered.map((grn) => (
              <MobileGRNCard 
                key={grn.id} 
                item={grn} 
                onClick={() => navigate(`/goods-receiving-notes/${grn.id}`)} 
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
      )}
    </div>
  );
}
