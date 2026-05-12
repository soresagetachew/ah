import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Search, Tag, Box, Trash2 } from 'lucide-react';
import client from '../../api/client';
import type { Asset } from '../../types';
import toast from 'react-hot-toast';
import { ConfirmationModal } from '../../components/ui/Modal';
import PageHeader from '../../components/layout/PageHeader';
import { SkeletonTable, ErrorState } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { SPACING } from '../../components/shared/DesignTokens';

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchAssets = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await client.get('/assets', { params: { search: searchTerm } });
      setAssets(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to synchronize asset inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [searchTerm]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await client.delete(`/assets/${deleteId}`);
      toast.success('Asset deleted');
      fetchAssets();
    } catch (err) {
      toast.error('Failed to delete asset');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className={`max-w-7xl mx-auto ${SPACING.cardGap} pb-20 animate-in fade-in duration-700`}>
      <PageHeader 
        title="Asset Management"
        subtitle="Manage and track company assets, equipment lifecycle, and department allocations."
        breadcrumbs={[{ label: 'African Holding' }, { label: 'Admin' }, { label: 'Assets' }]}
        actions={
          <button
            onClick={() => navigate('/assets/new')}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-slate-900/30 hover:bg-slate-800 transition-all"
          >
            <Plus className="h-4 w-4" />
            Add New Asset
          </button>
        }
      />

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-900/5 overflow-hidden">
        <div className="p-5 lg:p-8 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest hidden md:block">Asset Inventory</h3>
           <div className="relative w-full md:w-80 flex-shrink-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search assets by name or serial..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[44px]"
              />
           </div>
        </div>

        {loading ? (
          <div className="p-8"><SkeletonTable rows={8} /></div>
        ) : error ? (
          <div className="p-8"><ErrorState message={error} onRetry={fetchAssets} /></div>
                ) : assets.length === 0 ? (
          <div className="p-12">
            <EmptyState 
              icon={Box}
              title="No assets found"
              description="Your asset inventory is currently empty. Start tracking your equipment by registering your first asset."
              action={{
                label: "Register First Asset",
                onClick: () => navigate('/assets/new')
              }}
            />
          </div>
        ) : (
          <div>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial/Tag</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assets.map((asset, index) => (
                    <tr 
                      key={asset.id} 
                      className="hover:bg-gray-50 animate-fade-in"
                      style={{ animationDelay: `${Math.min(index * 50, 250)}ms` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-100 text-primary">
                            <Tag className="h-5 w-5" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                            <div className="text-sm text-gray-500">{asset.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {asset.serial_number || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {asset.department_name || 'Unassigned'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          asset.status === 'active' ? 'bg-green-100 text-green-800' : 
                          asset.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {asset.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {asset.purchase_date ? new Date(asset.purchase_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setDeleteId(asset.id)}
                          className="text-red-600 hover:text-red-900 ml-4 p-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="lg:hidden divide-y divide-slate-100 px-4">
              {assets.map((asset) => (
                <div key={asset.id} className="py-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full bg-slate-100 text-slate-600">
                        <Tag className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{asset.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{asset.category}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setDeleteId(asset.id)}
                      className="p-2 text-red-500 bg-red-50 rounded-lg hover:bg-red-100 active:scale-95 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4 bg-slate-50 rounded-xl p-4">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Serial/Tag</p>
                      <p className="text-xs font-bold text-slate-700">{asset.serial_number || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Department</p>
                      <p className="text-xs font-bold text-slate-700">{asset.department_name || 'Unassigned'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                      <span className={`px-2 py-0.5 inline-flex text-[9px] font-black rounded-full uppercase tracking-widest ${
                        asset.status === 'active' ? 'bg-green-100 text-green-700' : 
                        asset.status === 'maintenance' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {asset.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Purchased</p>
                      <p className="text-xs font-bold text-slate-700">{asset.purchase_date ? new Date(asset.purchase_date).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
}
      </div>

      <ConfirmationModal 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Permanently Delete Asset?"
        message="This action cannot be undone. All historical data and tracking associated with this asset will be permanently removed from the system."
        type="delete"
        confirmText="Yes, Delete Asset"
      />
    </div>
  );
}
