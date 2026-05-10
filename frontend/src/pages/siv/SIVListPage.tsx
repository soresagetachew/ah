import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { Plus, Search, Truck, Eye, X, ChevronRight, Box } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/layout/PageHeader';
import { SkeletonTable, ErrorState } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';

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
          <Link
            to="/store-issued-vouchers/new"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-slate-900/30 hover:bg-slate-800 transition-all"
          >
            <Plus className="h-4 w-4" /> New SIV
          </Link>
        }
      />

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by SIV number or issued to..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-80 bg-slate-50 border-transparent rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          { search && (
            <button 
              onClick={() => setSearch('')}
              className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors flex items-center gap-1"
            >
              <X className="h-3 w-3" /> Clear Filters
            </button>
          )}
        </div>

        <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
           {filtered.length} Vouchers Found
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">SIV #</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Linked GRN</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Issued To</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Cost Center</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Total Value</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
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
                  <tr 
                    key={siv.id} 
                    onClick={() => navigate(`/store-issued-vouchers/${siv.id}`)}
                    className="hover:bg-gray-50 transition-colors animate-fade-in"
                    style={{ animationDelay: `${Math.min(index * 50, 250)}ms` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm font-semibold text-primary">{siv.serial_no}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{siv.grn_serial_no || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">{siv.issued_to_name || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{siv.cost_center || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                      {siv.total_cost ? `ETB ${Number(siv.total_cost).toLocaleString('en-ET', { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${statusStyles[siv.status] || 'bg-gray-100 text-gray-600'}`}>
                        {siv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(siv.created_at).toLocaleDateString('en-ET')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline">
                        <Eye className="h-3.5 w-3.5" /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length > 0 && (
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 text-xs text-gray-500">
            Showing {filtered.length} of {sivs.length} records
          </div>
        )}
      </div>
    </div>
  );
}
