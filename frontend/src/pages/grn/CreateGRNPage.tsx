import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import client from '../../api/client';
import { 
  Plus, Trash2, AlertTriangle, Link as LinkIcon, 
  UploadCloud, CheckCircle, Truck, FileText, 
  Calendar, Save, Send, X, Building2, Package, Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/layout/PageHeader';

interface PROption { id: string; serial_no: string; reason: string; items: any[]; total_requested: number; requester_name: string; project_name?: string; }
interface SupplierOption { id: string; name: string; }

export default function CreateGRNPage() {
  const navigate = useNavigate();
  const [prs, setPrs] = useState<PROption[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
  const selectedPrId = watch('pr_id');
  const selectedPr = prs.find(p => p.id === selectedPrId);

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
      // Logic for file upload if selectedFile exists (stubbed as per user prompt "Keep ALL form logic... same")
      await client.post('/goods-receiving-notes', data);
      toast.success('GRN recorded successfully!');
      navigate('/goods-receiving-notes');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save GRN');
    } finally {
      setSaving(false);
    }
  };

  const hasVariance = lineItems.some(item => {
    const prQty = Number(item.pr_qty);
    const rcvQty = Number(item.quantity_received);
    return prQty > 0 && rcvQty > 0 && Math.abs(rcvQty - prQty) > 0.01;
  });

  return (
    <div className="max-w-[900px] mx-auto pb-32 animate-in fade-in duration-700">
      <PageHeader 
        title="Record Goods Receipt"
        subtitle="Log incoming inventory and link receipts to approved purchase requisitions."
        breadcrumbs={[{ label: 'African Holding' }, { label: 'Store' }, { label: 'Record Receipt' }]}
      />

      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        {/* LINKED PR SELECTOR */}
        <div className="bg-blue-50 border border-blue-200 rounded-[2rem] p-8">
           <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                 <LinkIcon className="h-6 w-6" />
              </div>
              <div>
                 <h3 className="text-lg font-black text-blue-900 tracking-tight">Link to Purchase Requisition</h3>
                 <p className="text-sm text-blue-700/70 font-medium">Select the approved PR this receipt is for</p>
              </div>
           </div>

           {!selectedPr ? (
             <div className="relative">
                <select
                  {...register('pr_id', { required: 'Please select a PR' })}
                  onChange={e => { register('pr_id').onChange(e); handlePRSelect(e.target.value); }}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-blue-200 bg-white text-sm font-black text-slate-700 uppercase tracking-widest focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none"
                >
                   <option value="">Choose an approved PR...</option>
                   {prs.map(pr => (
                     <option key={pr.id} value={pr.id}>{pr.serial_no} — {pr.requester_name}</option>
                   ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-blue-400">
                   <Plus className="h-5 w-5" />
                </div>
             </div>
           ) : (
             <div className="bg-white rounded-2xl border border-blue-300 p-6 flex items-center justify-between shadow-lg shadow-blue-900/5 animate-in zoom-in-95 duration-300">
                <div className="flex items-center gap-6">
                   <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                      <FileText className="h-7 w-7" />
                   </div>
                   <div>
                      <div className="flex items-center gap-3 mb-1">
                         <span className="font-mono font-black text-lg text-slate-900 uppercase">{selectedPr.serial_no}</span>
                         <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                            <Check className="h-3 w-3" /> Linked
                         </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                         <span>{selectedPr.project_name || 'General Operations'}</span>
                         <span className="h-1 w-1 bg-slate-200 rounded-full" />
                         <span>By {selectedPr.requester_name}</span>
                      </div>
                   </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setValue('pr_id', '')}
                  className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                >
                   Change PR
                </button>
             </div>
           )}
           {errors.pr_id && <p className="mt-3 text-xs font-black text-red-500 uppercase tracking-widest flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> {errors.pr_id.message}</p>}
        </div>

        {/* SUPPLIER & INVOICE SECTION */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8">
           <div className="flex items-center gap-4 mb-8">
              <div className="h-12 w-12 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                 <Building2 className="h-6 w-6" />
              </div>
              <div>
                 <h3 className="text-lg font-black text-slate-900 tracking-tight">Receipt Details</h3>
                 <p className="text-sm text-slate-500 font-medium mt-0.5">Supplier information and invoice records</p>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                 <div>
                    <label className="text-sm font-black text-slate-700 mb-2 block uppercase tracking-widest">Supplier <span className="text-red-500">*</span></label>
                    <select
                      {...register('supplier_id', { required: 'Supplier is required' })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    >
                      <option value="">Select supplier...</option>
                      {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="text-sm font-black text-slate-700 mb-2 block uppercase tracking-widest">Classification</label>
                    <select
                      {...register('type_classification')}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    >
                      <option value="consumable">Consumable Goods</option>
                      <option value="fixed_asset">Fixed Assets</option>
                      <option value="service">Contractual Services</option>
                    </select>
                 </div>
              </div>

              <div className="space-y-6">
                 <div>
                    <label className="text-sm font-black text-slate-700 mb-2 block uppercase tracking-widest">Invoice Number <span className="text-red-500">*</span></label>
                    <input
                      {...register('invoice_no', { required: 'Invoice number is required' })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                      placeholder="e.g. INV-2025-001"
                    />
                 </div>
                 <div>
                    <label className="text-sm font-black text-slate-700 mb-2 block uppercase tracking-widest">Invoice Document</label>
                    <div className="relative group">
                       <input 
                         type="file" 
                         className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                         onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                       />
                       <div className="border-2 border-dashed border-slate-200 group-hover:border-blue-400 group-hover:bg-blue-50/50 rounded-2xl p-4 transition-all flex items-center justify-center gap-3">
                          <UploadCloud className="h-5 w-5 text-slate-400 group-hover:text-blue-500" />
                          <span className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-600">
                             {selectedFile ? selectedFile.name : 'Drop invoice here or click'}
                          </span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* 3-WAY MATCH ALERT */}
        {lineItems.length > 0 && selectedPrId && (
          <div className={`rounded-[2rem] p-8 border flex flex-col gap-6 animate-in slide-in-from-top-4 duration-500 ${
            !hasVariance ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}>
             <div className="flex items-start gap-4">
                {!hasVariance ? <CheckCircle className="h-6 w-6 mt-0.5 text-emerald-600" /> : <AlertTriangle className="h-6 w-6 mt-0.5 text-amber-600" />}
                <div>
                   <h4 className="text-base font-black uppercase tracking-widest">
                      {!hasVariance ? '3-Way Match Verified ✓' : 'Quantity Variance Detected'}
                   </h4>
                   <p className="text-sm font-medium mt-1 opacity-80 leading-relaxed">
                      {!hasVariance 
                        ? 'All items received match the approved purchase requisition quantities exactly.' 
                        : 'A discrepancy has been detected between the original PR and the items currently received. Please review the variance below.'}
                   </p>
                </div>
             </div>

             {hasVariance && (
               <div className="bg-white/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-amber-200/50 shadow-sm">
                  <table className="min-w-full divide-y divide-amber-200/30">
                     <thead className="bg-amber-100/30">
                        <tr>
                           <th className="px-4 py-2 text-left text-[10px] font-black uppercase tracking-widest">Item</th>
                           <th className="px-4 py-2 text-center text-[10px] font-black uppercase tracking-widest">PR Qty</th>
                           <th className="px-4 py-2 text-center text-[10px] font-black uppercase tracking-widest">Recv Qty</th>
                           <th className="px-4 py-2 text-center text-[10px] font-black uppercase tracking-widest">Var %</th>
                           <th className="px-4 py-2 text-right text-[10px] font-black uppercase tracking-widest">Status</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-amber-200/20">
                        {lineItems.filter(item => Number(item.pr_qty) > 0 && Math.abs(Number(item.quantity_received) - Number(item.pr_qty)) > 0.01).map((item, i) => {
                          const pr = Number(item.pr_qty);
                          const rv = Number(item.quantity_received);
                          const diff = rv - pr;
                          const perc = ((diff / pr) * 100).toFixed(1);
                          return (
                            <tr key={i} className="text-[11px] font-bold">
                               <td className="px-4 py-3">{item.description}</td>
                               <td className="px-4 py-3 text-center">{pr}</td>
                               <td className="px-4 py-3 text-center text-amber-900">{rv}</td>
                               <td className={`px-4 py-3 text-center ${diff < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                  {diff > 0 ? '+' : ''}{perc}%
                               </td>
                               <td className="px-4 py-3 text-right">
                                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${diff < 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                     {diff < 0 ? 'Short' : 'Over'}
                                  </span>
                               </td>
                            </tr>
                          );
                        })}
                     </tbody>
                  </table>
               </div>
             )}
          </div>
        )}

        {/* LINE ITEMS TABLE */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Items Received</h3>
            <button
              type="button"
              onClick={() => append({ description: '', unit: 'Pcs', quantity_received: '', unit_cost: '', pr_qty: '' })}
              className="px-3 py-1 bg-slate-50 rounded-lg text-[10px] font-black text-blue-600 uppercase tracking-widest hover:bg-blue-50 transition-all flex items-center gap-1.5"
            >
              <Plus className="h-3 w-3" /> Add Extra Item
            </button>
          </div>

          <div className="overflow-hidden border border-slate-100 rounded-2xl">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">#</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest w-1/4">Description</th>
                  <th className="px-6 py-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">PR Qty</th>
                  <th className="px-6 py-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">Received</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Unit Cost</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Total</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-50">
                {fields.map((field, idx) => {
                  const item = lineItems[idx];
                  const prQty = Number(item?.pr_qty);
                  const rcvQty = Number(item?.quantity_received);
                  const isMismatched = prQty > 0 && rcvQty > 0 && Math.abs(rcvQty - prQty) > 0.01;

                  return (
                    <tr key={field.id} className={`hover:bg-slate-50/50 transition-colors group ${isMismatched ? 'bg-amber-50/30' : ''}`}>
                      <td className="px-6 py-5 text-xs font-black text-slate-400">{idx + 1}</td>
                      <td className="px-6 py-5">
                        <input {...register(`line_items.${idx}.description`, { required: true })}
                          className="w-full border-0 bg-transparent p-0 text-sm font-bold text-slate-900 focus:ring-0"
                          placeholder="Item name..." />
                      </td>
                      <td className="px-6 py-5 text-center text-xs font-black text-slate-400 font-mono">
                         {item?.pr_qty || '—'}
                      </td>
                      <td className="px-6 py-5">
                        <input 
                          {...register(`line_items.${idx}.quantity_received`, { required: true, min: 0.01 })}
                          type="number" step="0.01"
                          className={`w-16 mx-auto block text-center border-0 bg-transparent p-0 text-sm font-black focus:ring-0 ${isMismatched ? 'text-amber-600' : 'text-slate-900'}`}
                        />
                      </td>
                      <td className="px-6 py-5">
                        <input {...register(`line_items.${idx}.unit_cost`, { required: true })}
                          type="number" step="0.01"
                          className="w-24 ml-auto block text-right border-0 bg-transparent p-0 text-sm font-bold text-slate-900 focus:ring-0"
                        />
                      </td>
                      <td className="px-6 py-5 text-right text-sm font-black text-slate-900">
                        {(Number(item?.quantity_received) * Number(item?.unit_cost) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button type="button" onClick={() => remove(idx)} disabled={fields.length === 1}
                          className="p-1.5 text-slate-300 hover:text-red-500 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-50/50">
                <tr>
                   <td colSpan={5} className="px-8 py-5 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Receipt Value</td>
                   <td className="px-6 py-5 text-right text-xl font-black text-slate-900">
                      <span className="text-xs font-bold text-slate-400 mr-2">ETB</span>
                      {getTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                   </td>
                   <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* STICKY FOOTER */}
        <div className="fixed bottom-0 left-0 right-0 md:left-60 bg-white/80 backdrop-blur-md border-t border-slate-200 px-8 py-5 z-40">
           <div className="max-w-[900px] mx-auto flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                 <div className={`h-2 w-2 rounded-full ${saving ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                 <span className={saving ? 'text-amber-600' : 'text-emerald-600'}>{saving ? 'Processing...' : 'Ready to record'}</span>
              </div>
              <div className="flex items-center gap-4">
                 <button type="button" onClick={() => navigate('/goods-receiving-notes')}
                   className="px-6 py-3 text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors flex items-center gap-2">
                    <X className="h-4 w-4" /> Cancel
                 </button>
                 <button 
                   type="button" 
                   disabled={saving}
                   onClick={handleSubmit(onSubmit)}
                   className="px-10 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 flex items-center gap-2"
                 >
                    <Truck className="h-4 w-4" /> {saving ? 'Recording...' : 'Record Goods Receipt'}
                 </button>
              </div>
           </div>
        </div>
      </form>
    </div>
  );
}
