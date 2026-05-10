import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import client from '../../api/client';
import toast from 'react-hot-toast';

export default function CreatePRPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  
  const { register, control, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      reason: '',
      cheque_no: '',
      project_id: '',
      items: [{ description: '', unit: 'Pcs', quantity: 1, unit_price: 0 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const items = watch('items');
  const totalAmount = items.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.unit_price || 0)), 0);

  const onSubmit = async (data: any, isSubmit: boolean) => {
    try {
      setSaving(true);
      const res = await client.post('/purchase-requisitions', data);
      
      if (isSubmit) {
        await client.post(`/purchase-requisitions/${res.data.data.id}/submit`);
        toast.success('PR created and submitted successfully');
      } else {
        toast.success('PR saved as draft');
      }
      navigate('/purchase-requisitions');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save PR');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">New Purchase Requisition</h2>
      </div>

      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <form className="space-y-8">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">PR Number</label>
              <div className="mt-1">
                <span className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-500 bg-gray-50 w-full">
                  Auto-generated on save
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <div className="mt-1">
                <span className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-500 bg-gray-50 w-full">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Requested By</label>
              <div className="mt-1">
                <span className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-500 bg-gray-50 w-full">
                  {user?.full_name}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Department</label>
              <div className="mt-1">
                <span className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-500 bg-gray-50 w-full">
                  {user?.business_unit} (ID: {user?.department_id})
                </span>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Reason for Purchase <span className="text-red-500">*</span></label>
              <div className="mt-1">
                <textarea
                  {...register('reason', { required: 'Reason is required', maxLength: 500 })}
                  rows={3}
                  className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                />
                {errors.reason && <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>}
              </div>
            </div>
            
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Cheque No (Optional)</label>
              <div className="mt-1">
                <input
                  type="text"
                  {...register('cheque_no')}
                  className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Line Items</h3>
              <button
                type="button"
                onClick={() => append({ description: '', unit: 'Pcs', quantity: 1, unit_price: 0 })}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-primary bg-primary bg-opacity-10 hover:bg-opacity-20"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Item
              </button>
            </div>
            
            <div className="overflow-x-auto border border-gray-200 rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-1/2">Description</th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th scope="col" className="px-3 py-3"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {fields.map((field, index) => (
                    <tr key={field.id}>
                      <td className="px-3 py-2 text-sm text-gray-500">{index + 1}</td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          {...register(`items.${index}.description`, { required: true })}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-1 border"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <select
                          {...register(`items.${index}.unit`)}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-1 border"
                        >
                          <option>Pcs</option><option>Box</option><option>Kg</option>
                          <option>Ltr</option><option>Set</option><option>Other</option>
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="1"
                          {...register(`items.${index}.quantity`, { required: true, min: 1 })}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-1 border"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          {...register(`items.${index}.unit_price`, { required: true, min: 0 })}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-1 border"
                        />
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-900 font-medium">
                        ETB {(Number(items[index]?.quantity || 0) * Number(items[index]?.unit_price || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                          className="text-red-500 hover:text-red-700 disabled:opacity-50"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 border-t border-gray-200">
                    <td colSpan={5} className="px-3 py-3 text-right text-sm font-bold text-gray-900">Total:</td>
                    <td className="px-3 py-3 text-sm font-bold text-gray-900">
                      ETB {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="pt-5 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/purchase-requisitions')}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleSubmit((data) => onSubmit(data, false))}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Save as Draft
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleSubmit((data) => {
                if (window.confirm('Are you sure you want to submit this PR for approval?')) {
                  onSubmit(data, true);
                }
              })}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              Submit for Approval
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
