import { useState, useEffect } from 'react';
import client from '../../api/client';
import { Package, AlertTriangle } from 'lucide-react';

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInv = async () => {
      try {
        const res = await client.get('/store-issued-vouchers/inventory');
        setItems(res.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchInv();
  }, []);

  const getStatusBadge = (current: number, min: number) => {
    if (current <= 0) return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Out of Stock</span>;
    if (current <= min) return <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800">Low Stock</span>;
    return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">In Stock</span>;
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
        <button className="bg-primary text-white px-4 py-2 rounded shadow text-sm">Export to Excel</button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6 flex items-center">
          <div className="flex-shrink-0 bg-primary p-3 rounded-md"><Package className="h-6 w-6 text-white"/></div>
          <div className="ml-5 w-0 flex-1"><dt className="text-sm font-medium text-gray-500 truncate">Total Items</dt><dd className="text-2xl font-semibold text-gray-900">{items.length}</dd></div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6 flex items-center">
          <div className="flex-shrink-0 bg-red-500 p-3 rounded-md"><AlertTriangle className="h-6 w-6 text-white"/></div>
          <div className="ml-5 w-0 flex-1"><dt className="text-sm font-medium text-gray-500 truncate">Out of Stock</dt><dd className="text-2xl font-semibold text-gray-900">{items.filter(i => Number(i.current_stock) <= 0).length}</dd></div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6 flex items-center">
          <div className="flex-shrink-0 bg-amber-500 p-3 rounded-md"><AlertTriangle className="h-6 w-6 text-white"/></div>
          <div className="ml-5 w-0 flex-1"><dt className="text-sm font-medium text-gray-500 truncate">Low Stock</dt><dd className="text-2xl font-semibold text-gray-900">{items.filter(i => Number(i.current_stock) > 0 && Number(i.current_stock) <= Number(i.minimum_stock)).length}</dd></div>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost Center</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? <tr><td colSpan={6} className="text-center py-4">Loading...</td></tr> : items.map((item) => (
              <tr key={item.id} className={Number(item.current_stock) <= Number(item.minimum_stock) ? 'bg-red-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.item_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.unit}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{item.current_stock}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.minimum_stock}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.cost_center || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(Number(item.current_stock), Number(item.minimum_stock))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
