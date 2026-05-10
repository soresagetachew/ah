import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import client from '../../api/client';
import type { Asset } from '../../types';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';


export default function CreateAssetPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      category: 'Electronics',
      description: '',
      serial_number: '',
      purchase_date: new Date().toISOString().split('T')[0],
      purchase_price: 0,
      department_id: ''
    }
  });

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await client.get('/departments');
        setDepartments(res.data);
      } catch (err) {
        console.error('Failed to fetch departments');
      }
    };
    fetchDepartments();
  }, []);

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      await client.post('/assets', data);
      toast.success('Asset created successfully');
      navigate('/assets');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create asset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
      <PageHeader 
        title="Register New Asset"
        subtitle="Initialize a new physical asset record for tracking and lifecycle management."
        breadcrumbs={[{ label: 'African Holding' }, { label: 'Admin' }, { label: 'Assets' }, { label: 'New' }]}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 shadow rounded-lg border border-gray-100">
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-4">
            <label className="block text-sm font-medium text-gray-700">Asset Name</label>
            <input
              type="text"
              {...register('name', { required: 'Asset name is required' })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2 border"
              placeholder="e.g. MacBook Pro M3"
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>

          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              {...register('category')}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2 border"
            >
              <option>Electronics</option>
              <option>Furniture</option>
              <option>Vehicles</option>
              <option>Office Supplies</option>
              <option>Machinery</option>
              <option>Other</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700">Serial Number</label>
            <input
              type="text"
              {...register('serial_number')}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2 border"
              placeholder="Unique Serial/Tag ID"
            />
          </div>

          <div className="sm:col-span-6">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              rows={3}
              {...register('description')}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2 border"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700">Purchase Date</label>
            <input
              type="date"
              {...register('purchase_date')}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2 border"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700">Purchase Price (ETB)</label>
            <input
              type="number"
              step="0.01"
              {...register('purchase_price')}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2 border"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-sm font-medium text-gray-700">Assign to Department</label>
            <select
              {...register('department_id', { required: 'Please select a department' })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2 border"
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
            {errors.department_id && <p className="mt-1 text-xs text-red-600">{errors.department_id.message}</p>}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate('/assets')}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Registering...
              </>
            ) : 'Register Asset'}
          </button>
        </div>
      </form>
    </div>
  );
}
