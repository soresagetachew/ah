import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import { Plus, Search, Truck, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

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
  const [sivs, setSivs] = useState<SIV[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    client.get('/store-issued-vouchers')
      .then(res => setSivs(res.data.data || res.data || []))
      .catch(() => toast.error('Failed to load SIVs'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = sivs.filter(s =>
    (s.serial_no || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.issued_to_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.cost_center || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Store Issued Vouchers</h2>
          <p className="mt-1 text-sm text-gray-500">Track all items issued from the store to departments.</p>
        </div>
        <Link
          to="/store-issued-vouchers/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-secondary"
        >
          <Plus className="h-4 w-4" /> New SIV
        </Link>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          className="block w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="Search by SIV number, issued to..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
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
                <tr><td colSpan={8} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-400">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    Loading...
                  </div>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-16 text-center">
                  <Truck className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                  <p className="text-gray-400 text-sm">No Store Issued Vouchers found.</p>
                  <Link to="/store-issued-vouchers/new" className="mt-3 inline-flex items-center gap-1 text-sm text-primary font-medium hover:underline">
                    <Plus className="h-4 w-4" /> Issue first voucher
                  </Link>
                </td></tr>
              ) : (
                filtered.map(siv => (
                  <tr key={siv.id} className="hover:bg-gray-50 transition-colors">
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
