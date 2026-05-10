import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import { Plus, Search, Package, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

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

const statusStyles: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  completed: 'bg-green-100 text-green-800',
};

export default function GRNListPage() {
  const [grns, setGrns] = useState<GRN[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    client.get('/goods-receiving-notes')
      .then(res => setGrns(res.data.data || res.data || []))
      .catch(() => toast.error('Failed to load GRNs'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = grns.filter(g =>
    (g.serial_no || '').toLowerCase().includes(search.toLowerCase()) ||
    (g.supplier_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (g.invoice_no || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Goods Receiving Notes</h2>
          <p className="mt-1 text-sm text-gray-500">Track all goods received from suppliers.</p>
        </div>
        <Link
          to="/goods-receiving-notes/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-secondary"
        >
          <Plus className="h-4 w-4" /> New GRN
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          className="block w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="Search by GRN number, supplier..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">GRN #</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Linked PR</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Invoice No</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
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
                  <Package className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                  <p className="text-gray-400 text-sm">No Goods Receiving Notes found.</p>
                  <Link to="/goods-receiving-notes/new" className="mt-3 inline-flex items-center gap-1 text-sm text-primary font-medium hover:underline">
                    <Plus className="h-4 w-4" /> Create first GRN
                  </Link>
                </td></tr>
              ) : (
                filtered.map(grn => (
                  <tr key={grn.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm font-semibold text-primary">{grn.serial_no}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{grn.pr_serial_no || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">{grn.supplier_name || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{grn.invoice_no || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full capitalize">{grn.type_classification?.replace('_', ' ')}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${statusStyles[grn.status] || 'bg-gray-100 text-gray-600'}`}>
                        {grn.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(grn.created_at).toLocaleDateString('en-ET')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Link to={`/goods-receiving-notes/${grn.id}`} className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline">
                        <Eye className="h-3.5 w-3.5" /> View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length > 0 && (
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 text-xs text-gray-500">
            Showing {filtered.length} of {grns.length} records
          </div>
        )}
      </div>
    </div>
  );
}
