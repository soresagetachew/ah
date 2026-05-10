import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { Plus, Search, Truck, Eye, X, ChevronRight, Box, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/layout/PageHeader';
import { SkeletonTable, ErrorState } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { ThemedCard, ThemedButton, ThemedTableRow } from '../../components/ui/themed';
import { MobileSIVCard } from '../../components/mobile/MobileSIVCard';

interface SIV {
  id: string;
  serial_no: string;
  grn_serial_no?: string;
  issued_to_name?: string;
  cost_center?: string;
  status: string;
  total_cost?: number;
  created_at: string;
}

const statusStyles: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  issued: 'bg-blue-100 text-blue-800',
};

export default function SIVListPage() {
  const navigate = useNavigate();
  const [sivs, setSivs] = useState<SIV[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchSIVs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await client.get('/store-issued-vouchers');
      setSivs(res.data.data || res.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to synchronize store issuance records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSIVs();
  }, []);

  const filtered = sivs.filter(s =>
    (s.serial_no || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.issued_to_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.cost_center || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
      <PageHeader 
        title="Store Issued Vouchers"
        subtitle="Track and manage all warehouse disbursements and department issuances (SIV)."
        breadcrumbs={[{ label: 'African Holding' }, { label: 'Store' }, { label: 'Issuance' }]}
        actions={
          <ThemedButton
            variant="accent"
            onClick={() => navigate('/store-issued-vouchers/new')}
          >
            <Plus className="h-4 w-4 mr-2 inline" /> New SIV
          </ThemedButton>
        }
      />

      <ThemedCard className="!p-5 flex flex-col lg:flex-row gap-4">
        
        {/* Search input — full width on mobile */}
        <div className="relative w-full lg:w-96 flex-shrink-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by SIV number or issued to..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 lg:py-2.5 bg-page-bg border-transparent rounded-xl text-sm font-bold text-text-primary focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all min-h-[44px]"
          />
        </div>

        {/* Filter Actions — scroll horizontally on mobile */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 w-full scrollbar-none justify-between lg:justify-start">
          <div className="flex items-center gap-2 flex-shrink-0">
            { search && (
              <button 
                onClick={() => setSearch('')}
                className="px-3 py-3 lg:py-2.5 text-[10px] font-black text-accent uppercase tracking-widest hover:bg-accent/10 transition-colors flex items-center gap-1.5 rounded-xl min-h-[44px]"
              >
                <X className="h-3.5 w-3.5" /> Clear
              </button>
            )}
          </div>

          <div className="text-[10px] font-black text-text-muted uppercase tracking-widest flex-shrink-0 px-2">
             {filtered.length} Vouchers Found
          </div>
        </div>
      </ThemedCard>

      <ThemedCard className="!p-0">
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr className="bg-page-bg/50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase">SIV #</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase">Linked GRN</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase">Issued To</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase">Cost Center</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase">Total Value</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase">Date</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-text-muted uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr><td colSpan={8} className="p-8"><SkeletonTable rows={6} /></td></tr>
              ) : error ? (
                <tr><td colSpan={8} className="py-20"><ErrorState message={error} onRetry={fetchSIVs} /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-10">
                   <EmptyState 
                     icon={Truck}
                     title="No store vouchers found"
                     description="Monitor your inventory disbursements by creating your first store issued voucher (SIV)."
                     action={{
                       label: "Issue First Voucher",
                       onClick: () => navigate('/store-issued-vouchers/new')
                     }}
                   />
                </td></tr>
              ) : (
                filtered.map((siv, index) => (
                  <ThemedTableRow 
                    key={siv.id} 
                    onClick={() => navigate(`/store-issued-vouchers/${siv.id}`)}
                    className="cursor-pointer animate-fade-in"
                    style={{ animationDelay: `${Math.min(index * 50, 250)}ms` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm font-semibold text-accent">{siv.serial_no}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{siv.grn_serial_no || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary font-medium">{siv.issued_to_name || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{siv.cost_center || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-text-primary">
                      {siv.total_cost ? `ETB ${Number(siv.total_cost).toLocaleString('en-ET', { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${statusStyles[siv.status] || 'bg-page-bg text-text-muted'}`}>
                        {siv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
                      {new Date(siv.created_at).toLocaleDateString('en-ET')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <ThemedButton variant="ghost" className="!p-2">
                        <Eye className="h-4 w-4 mr-1 inline" /> View
                      </ThemedButton>
                    </td>
                  </ThemedTableRow>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List View */}
        <div className="lg:hidden p-4 space-y-3 bg-slate-50/30">
          {filtered.map((siv) => (
            <MobileSIVCard 
              key={siv.id} 
              item={{
                ...siv,
                total_amount: siv.total_cost
              }} 
              onClick={() => navigate(`/store-issued-vouchers/${siv.id}`)} 
            />
          ))}
        </div>

        {/* PAGINATION UI */}
        <div className="px-4 lg:px-8 py-4 lg:py-6 bg-page-bg/50 border-t border-border">
           <div className="flex items-center justify-between">
              <button disabled className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-white text-xs font-black uppercase tracking-widest text-slate-400 disabled:opacity-50 min-h-[44px]">
                 <ChevronLeft className="w-4 h-4" /> Prev
              </button>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Page 1 / 1</span>
              <button disabled className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-white text-xs font-black uppercase tracking-widest text-slate-400 disabled:opacity-50 min-h-[44px]">
                 Next <ChevronRight className="w-4 h-4" />
              </button>
           </div>
        </div>
      </ThemedCard>
    </div>
  );
}
