import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import client from '../../api/client';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

interface GRNOption { id: string; serial_no: string; }
interface UserOption { id: string; full_name: string; department_name?: string; }

export default function CreateSIVPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [grns, setGrns] = useState<GRNOption[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [saving, setSaving] = useState(false);

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      grn_id: '',
      issued_to_id: '',
      cost_center: '',
      line_items: [{ description: '', unit: 'Pcs', qty_issued: '', unit_cost: '', available_stock: '' }]
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'line_items' });
  const lineItems = watch('line_items');

  useEffect(() => {
    client.get('/goods-receiving-notes?status=completed').then(res => setGrns(res.data.data || [])).catch(() => {});
    client.get('/users').then(res => setUsers(res.data.data || [])).catch(() => {});
  }, []);

  const getTotal = () => lineItems.reduce((sum, item) => sum + (Number(item.qty_issued) * Number(item.unit_cost) || 0), 0);

  const onSubmit = async (data: any) => {
    try {
      setSaving(true);
      await client.post('/store-issued-vouchers', data);
      toast.success('SIV created successfully!');
      navigate('/store-issued-vouchers');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create SIV');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Issue Store Voucher</h2>
        <p className="mt-1 text-sm text-gray-500">Issue goods from store to a department or individual.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Issuance Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Issued By</label>
              <input readOnly value={user?.full_name || ''} className="block w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input readOnly value={new Date().toLocaleDateString('en-ET')} className="block w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Linked GRN</label>
              <select {...register('grn_id')} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                <option value="">Select GRN (optional)</option>
                {grns.map(g => <option key={g.id} value={g.id}>{g.serial_no}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Issued To <span className="text-red-500">*</span></label>
              <select {...register('issued_to_id', { required: 'Recipient is required' })} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                <option value="">Select recipient...</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.full_name} {u.department_name ? `(${u.department_name})` : ''}</option>)}
              </select>
              {errors.issued_to_id && <p className="mt-1 text-xs text-red-500">{errors.issued_to_id.message as string}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cost Center</label>
              <input {...register('cost_center')} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. HO-Finance, Construction" />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">Items to Issue</h3>
            <button type="button" onClick={() => append({ description: '', unit: 'Pcs', qty_issued: '', unit_cost: '', available_stock: '' })}
              className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline">
              <Plus className="h-4 w-4" /> Add Item
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 text-left text-xs font-semibold text-gray-500 uppercase pr-3">#</th>
                  <th className="pb-3 text-left text-xs font-semibold text-gray-500 uppercase pr-3">Description</th>
                  <th className="pb-3 text-left text-xs font-semibold text-gray-500 uppercase pr-3">Unit</th>
                  <th className="pb-3 text-left text-xs font-semibold text-gray-500 uppercase pr-3">Available</th>
                  <th className="pb-3 text-left text-xs font-semibold text-gray-500 uppercase pr-3">Qty Issued</th>
                  <th className="pb-3 text-left text-xs font-semibold text-gray-500 uppercase pr-3">Unit Cost (ETB)</th>
                  <th className="pb-3 text-left text-xs font-semibold text-gray-500 uppercase pr-3">Total</th>
                  <th className="pb-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fields.map((field, idx) => {
                  const item = lineItems[idx];
                  const total = (Number(item?.qty_issued) * Number(item?.unit_cost)) || 0;
                  const available = Number(item?.available_stock);
                  const issued = Number(item?.qty_issued);
                  const overStock = available > 0 && issued > available;

                  return (
                    <tr key={field.id} className="py-2">
                      <td className="py-2 pr-3 text-sm text-gray-500">{idx + 1}</td>
                      <td className="py-2 pr-3">
                        <input {...register(`line_items.${idx}.description`, { required: true })}
                          className="block w-44 rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
                          placeholder="Item description" />
                      </td>
                      <td className="py-2 pr-3">
                        <select {...register(`line_items.${idx}.unit`)} className="block rounded border border-gray-300 px-2 py-1.5 text-sm">
                          {['Pcs', 'Box', 'Kg', 'Ltr', 'Set', 'Mtr', 'Other'].map(u => <option key={u}>{u}</option>)}
                        </select>
                      </td>
                      <td className="py-2 pr-3">
                        <input {...register(`line_items.${idx}.available_stock`)} type="number" step="0.01"
                          className="block w-20 rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-sm text-gray-500" placeholder="Stock" />
                      </td>
                      <td className="py-2 pr-3">
                        <div className="flex flex-col">
                          <input {...register(`line_items.${idx}.qty_issued`, { required: true, min: 0.01 })} type="number" step="0.01" min="0"
                            className={`block w-24 rounded border px-2 py-1.5 text-sm focus:outline-none ${overStock ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-primary'}`}
                            placeholder="0" />
                          {overStock && (
                            <span className="flex items-center gap-1 text-xs text-red-600 mt-1">
                              <AlertTriangle className="h-3 w-3" /> Insufficient stock (available: {available})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2 pr-3">
                        <input {...register(`line_items.${idx}.unit_cost`, { required: true, min: 0 })} type="number" step="0.01" min="0"
                          className="block w-28 rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none" placeholder="0.00" />
                      </td>
                      <td className="py-2 pr-3 text-sm font-semibold text-gray-800 whitespace-nowrap">
                        ETB {total.toLocaleString('en-ET', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2">
                        <button type="button" onClick={() => fields.length > 1 && remove(idx)}
                          className="text-red-400 hover:text-red-600" disabled={fields.length === 1}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200">
                  <td colSpan={6} className="pt-3 text-right text-sm font-semibold text-gray-700 pr-3">Total:</td>
                  <td className="pt-3 text-sm font-bold text-gray-900">ETB {getTotal().toLocaleString('en-ET', { minimumFractionDigits: 2 })}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Acknowledgment */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800 font-medium">Receiver Acknowledgment</p>
          <p className="text-xs text-amber-600 mt-1">By submitting, you confirm that all listed items will be physically handed over to the designated recipient for their signature.</p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={() => navigate('/store-issued-vouchers')}
            className="rounded-md border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" disabled={saving}
            className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-secondary disabled:opacity-50">
            {saving ? 'Issuing...' : 'Issue Voucher'}
          </button>
        </div>
      </form>
    </div>
  );
}
