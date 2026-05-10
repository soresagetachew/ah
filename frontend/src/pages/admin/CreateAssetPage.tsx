import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import client from '../../api/client';
import type { Asset } from '../../types';
import toast from 'react-hot-toast';


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
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Register New Asset
          </h2>
        </div>
      </div>

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
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-opacity-90 focus:outline-none disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Register Asset'}
          </button>
        </div>
      </form>
    </div>
  );
}
