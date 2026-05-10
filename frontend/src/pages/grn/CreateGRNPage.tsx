import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import client from '../../api/client';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

interface PROption { id: string; serial_no: string; reason: string; items: any[]; }
interface SupplierOption { id: string; name: string; }

export default function CreateGRNPage() {
  const navigate = useNavigate();
  const [prs, setPrs] = useState<PROption[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
  const [saving, setSaving] = useState(false);

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      pr_id: '',
      supplier_id: '',
      invoice_no: '',
      type_classification: 'consumable',
      line_items: [{ description: '', unit: 'Pcs', quantity_received: '', unit_cost: '', pr_qty: '' }]
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'line_items' });
  const lineItems = watch('line_items');

  useEffect(() => {
    client.get('/purchase-requisitions?status=approved').then(res => {
      setPrs(res.data.data || []);
    }).catch(() => {});
    client.get('/suppliers').then(res => {
      setSuppliers(res.data.data || res.data || []);
    }).catch(() => {});
  }, []);

  const handlePRSelect = (prId: string) => {
    const pr = prs.find(p => p.id === prId);
    if (pr && pr.items?.length) {
      setValue('line_items', pr.items.map((item: any) => ({
        description: item.description,
        unit: item.unit,
        quantity_received: '',
        unit_cost: item.unit_price || '',
        pr_qty: item.quantity
      })));
    }
  };

  const getTotal = () => lineItems.reduce((sum, item) => {
    return sum + (Number(item.quantity_received) * Number(item.unit_cost) || 0);
  }, 0);

  const onSubmit = async (data: any) => {
    try {
      setSaving(true);
      await client.post('/goods-receiving-notes', data);
      toast.success('GRN recorded successfully!');
      navigate('/goods-receiving-notes');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save GRN');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Record Goods Receipt</h2>
        <p className="mt-1 text-sm text-gray-500">Create a new Goods Receiving Note (GRN) linked to an approved PR.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Header Info */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Document Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Linked Purchase Requisition</label>
              <select
                {...register('pr_id', { required: 'Please select a PR' })}
                onChange={e => { register('pr_id').onChange(e); handlePRSelect(e.target.value); }}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Select approved PR...</option>
                {prs.map(pr => (
                  <option key={pr.id} value={pr.id}>{pr.serial_no} — {pr.reason?.slice(0, 40)}</option>
                ))}
              </select>
              {errors.pr_id && <p className="mt-1 text-xs text-red-500">{errors.pr_id.message as string}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supplier <span className="text-red-500">*</span></label>
              <select
                {...register('supplier_id', { required: 'Supplier is required' })}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Select supplier...</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                {suppliers.length === 0 && <option value="manual">Supplier (manually recorded)</option>}
              </select>
              {errors.supplier_id && <p className="mt-1 text-xs text-red-500">{errors.supplier_id.message as string}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number <span className="text-red-500">*</span></label>
              <input
                {...register('invoice_no', { required: 'Invoice number is required' })}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g. INV-2025-001"
              />
              {errors.invoice_no && <p className="mt-1 text-xs text-red-500">{errors.invoice_no.message as string}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type Classification</label>
              <select
                {...register('type_classification')}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="consumable">Consumable</option>
                <option value="fixed_asset">Fixed Asset</option>
                <option value="service">Service</option>
              </select>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">Items Received</h3>
            <button
              type="button"
              onClick={() => append({ description: '', unit: 'Pcs', quantity_received: '', unit_cost: '', pr_qty: '' })}
              className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
            >
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
                  <th className="pb-3 text-left text-xs font-semibold text-gray-500 uppercase pr-3">PR Qty</th>
                  <th className="pb-3 text-left text-xs font-semibold text-gray-500 uppercase pr-3">Qty Received</th>
                  <th className="pb-3 text-left text-xs font-semibold text-gray-500 uppercase pr-3">Unit Cost (ETB)</th>
                  <th className="pb-3 text-left text-xs font-semibold text-gray-500 uppercase pr-3">Total</th>
                  <th className="pb-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fields.map((field, idx) => {
                  const item = lineItems[idx];
                  const total = (Number(item?.quantity_received) * Number(item?.unit_cost)) || 0;
                  const prQty = Number(item?.pr_qty);
                  const rcvQty = Number(item?.quantity_received);
                  const hasMismatch = prQty > 0 && rcvQty > 0 && Math.abs((rcvQty - prQty) / prQty) > 0.05;

                  return (
                    <tr key={field.id} className="py-2">
                      <td className="py-2 pr-3 text-sm text-gray-500">{idx + 1}</td>
                      <td className="py-2 pr-3">
                        <input {...register(`line_items.${idx}.description`, { required: true })}
                          className="block w-48 rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
                          placeholder="Item description" />
                      </td>
                      <td className="py-2 pr-3">
                        <select {...register(`line_items.${idx}.unit`)}
                          className="block rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none">
                          {['Pcs', 'Box', 'Kg', 'Ltr', 'Set', 'Mtr', 'Other'].map(u => <option key={u}>{u}</option>)}
                        </select>
                      </td>
                      <td className="py-2 pr-3">
                        <span className="text-sm text-gray-400 font-mono">{item?.pr_qty || '—'}</span>
                      </td>
                      <td className="py-2 pr-3">
                        <div className="flex flex-col">
                          <input {...register(`line_items.${idx}.quantity_received`, { required: true, min: 0.01 })}
                            type="number" step="0.01" min="0"
                            className="block w-24 rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
                            placeholder="0" />
                          {hasMismatch && (
                            <span className="flex items-center gap-1 text-xs text-amber-600 mt-1">
                              <AlertTriangle className="h-3 w-3" /> Qty differs from PR
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2 pr-3">
                        <input {...register(`line_items.${idx}.unit_cost`, { required: true, min: 0.01 })}
                          type="number" step="0.01" min="0"
                          className="block w-28 rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
                          placeholder="0.00" />
                      </td>
                      <td className="py-2 pr-3 text-sm font-semibold text-gray-800 whitespace-nowrap">
                        ETB {total.toLocaleString('en-ET', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2">
                        <button type="button" onClick={() => fields.length > 1 && remove(idx)}
                          className="text-red-400 hover:text-red-600 disabled:opacity-30" disabled={fields.length === 1}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200">
                  <td colSpan={6} className="pt-3 text-right text-sm font-semibold text-gray-700 pr-3">Total Value:</td>
                  <td className="pt-3 text-sm font-bold text-gray-900">
                    ETB {getTotal().toLocaleString('en-ET', { minimumFractionDigits: 2 })}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={() => navigate('/goods-receiving-notes')}
            className="rounded-md border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" disabled={saving}
            className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-secondary disabled:opacity-50">
            {saving ? 'Saving...' : 'Record Goods Receipt'}
          </button>
        </div>
      </form>
    </div>
  );
}
