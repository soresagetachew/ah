import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import { Plus, Search, CreditCard, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

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
  const [prfs, setPrfs] = useState<PRF[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    client.get(`/payment-requests?${params}`)
      .then(res => setPrfs(res.data.data || res.data || []))
      .catch(() => toast.error('Failed to load payment requests'))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  const filtered = prfs.filter(p =>
    (p.serial_no || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.purpose || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.requester_name || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalAmount = filtered.reduce((sum, p) => sum + Number(p.amount_figure || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payment Requests</h2>
          <p className="mt-1 text-sm text-gray-500">Manage all payment request forms (PRF).</p>
        </div>
        <Link
          to="/payment-requests/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-secondary"
        >
          <Plus className="h-4 w-4" /> New Payment Request
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            className="block w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Search by number, purpose..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
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
      </div>

      {/* Summary card */}
      {filtered.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-center justify-between">
          <span className="text-sm text-gray-600">{filtered.length} payment request{filtered.length !== 1 ? 's' : ''} shown</span>
          <span className="text-sm font-bold text-gray-900">Total: ETB {totalAmount.toLocaleString('en-ET', { minimumFractionDigits: 2 })}</span>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">PRF #</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Requested By</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Purpose</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Mode</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Amount (ETB)</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading ? (
                <tr><td colSpan={9} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-400">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    Loading...
                  </div>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-6 py-16 text-center">
                  <CreditCard className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                  <p className="text-gray-400 text-sm">No payment requests found.</p>
                  <Link to="/payment-requests/new" className="mt-3 inline-flex items-center gap-1 text-sm text-primary font-medium hover:underline">
                    <Plus className="h-4 w-4" /> Create first request
                  </Link>
                </td></tr>
              ) : (
                filtered.map(prf => (
                  <tr key={prf.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm font-semibold text-primary">{prf.serial_no}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{prf.requester_name || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{prf.department_name || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">{prf.purpose}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded ${prf.mode === 'cash' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                        {prf.mode === 'cash' ? '💵' : '📝'} {prf.mode}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {Number(prf.amount_figure).toLocaleString('en-ET', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${statusStyles[prf.status] || 'bg-gray-100 text-gray-600'}`}>
                        {prf.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(prf.created_at).toLocaleDateString('en-ET')}
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
            Showing {filtered.length} of {prfs.length} records
          </div>
        )}
      </div>
    </div>
  );
}
