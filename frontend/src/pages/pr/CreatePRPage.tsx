import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, FileText, AlertCircle, Check, Save, Send, X, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import client from '../../api/client';
import toast from 'react-hot-toast';
import { ConfirmationModal } from '../../components/ui/Modal';

export default function CreatePRPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [confirmModal, setConfirmModal] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  
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

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await client.get('/departments'); // Reusing departments as projects for now if project route is missing
        setProjects(res.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchProjects();
  }, []);

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
      setConfirmModal(false);
    }
  };

  const currentStep = 1; // Logic for progress indicator

  return (
    <div className="max-w-[900px] mx-auto pb-32 animate-in fade-in duration-700">
      {/* PROGRESS INDICATOR */}
      <div className="mb-10 px-4">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-100 -z-0" />
          {[
            { id: 1, label: 'Details' },
            { id: 2, label: 'Items' },
            { id: 3, label: 'Submit' }
          ].map((step) => (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-500 border-4 ${
                currentStep > step.id ? 'bg-emerald-500 border-emerald-100 text-white' :
                currentStep === step.id ? 'bg-blue-600 border-blue-100 text-white shadow-lg shadow-blue-200' :
                'bg-white border-slate-100 text-slate-400'
              }`}>
                {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
              </div>
              <span className={`mt-2 text-[10px] font-black uppercase tracking-widest hidden sm:block ${
                currentStep === step.id ? 'text-blue-600' : 'text-slate-400'
              }`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        {/* SECTION 1 - REQUEST DETAILS */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 mx-4 sm:mx-0">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Request Details</h3>
              <p className="text-sm text-slate-500 font-medium mt-0.5">Fill in the basic information for this request</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="text-sm font-black text-slate-700 mb-2 block uppercase tracking-widest">PR Number</label>
                <div className="w-full px-3.5 py-3 lg:py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-xs font-black text-slate-400 uppercase tracking-widest cursor-not-allowed min-h-[48px] lg:min-h-[42px] flex items-center">
                  Auto-generated on save
                </div>
              </div>
              <div>
                <label className="text-sm font-black text-slate-700 mb-2 block uppercase tracking-widest">Date</label>
                <div className="w-full px-3.5 py-3 lg:py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-sm font-bold text-slate-500 cursor-not-allowed min-h-[48px] lg:min-h-[42px] flex items-center">
                  {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-sm font-black text-slate-700 mb-2 block uppercase tracking-widest">Requested By</label>
                <div className="flex items-center gap-3 px-3.5 py-3 lg:py-2.5 bg-slate-50 rounded-xl border border-slate-100 min-h-[48px] lg:min-h-[42px]">
                   <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center text-[10px] font-black text-white">
                      {user?.full_name?.split(' ').map(n => n[0]).join('')}
                   </div>
                   <span className="text-sm font-bold text-slate-600">{user?.full_name}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-black text-slate-700 mb-2 block uppercase tracking-widest">Department</label>
                <div className="w-full px-3.5 py-3 lg:py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-sm font-bold text-slate-500 cursor-not-allowed min-h-[48px] lg:min-h-[42px] flex items-center">
                  {user?.business_unit || 'General'}
                </div>
              </div>
            </div>

            <div className="sm:col-span-2 space-y-6 pt-4 border-t border-slate-50">
              <div>
                <label className="text-sm font-black text-slate-700 mb-2 block uppercase tracking-widest">
                  Project / Business Unit <span className="text-red-500 ml-0.5">*</span>
                </label>
                <select 
                  {...register('project_id', { required: 'Project is required' })}
                  className={`w-full px-3.5 py-3 lg:py-2.5 rounded-xl border bg-surface text-text-primary text-sm min-h-[48px] lg:min-h-[42px] focus:outline-none focus:ring-2 transition-all duration-150 ${
                    errors.project_id ? 'border-red-400 focus:ring-red-400/20' : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
                  }`}
                >
                  <option value="">Select Project</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                {errors.project_id && (
                  <p className="mt-2 text-xs font-black text-red-500 flex items-center gap-1 uppercase tracking-widest">
                    <AlertCircle className="h-3 w-3" /> {errors.project_id.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-black text-slate-700 mb-2 block uppercase tracking-widest">
                  Reason for Purchase <span className="text-red-500 ml-0.5">*</span>
                </label>
                <textarea
                  {...register('reason', { required: 'Reason is required', maxLength: 500 })}
                  rows={3}
                  placeholder="Explain why these items are needed..."
                  className={`w-full px-3.5 py-3 lg:py-2.5 rounded-xl border bg-surface text-text-primary text-sm min-h-[48px] lg:min-h-[42px] focus:outline-none focus:ring-2 transition-all duration-150 resize-none ${
                    errors.reason ? 'border-red-400 focus:ring-red-400/20' : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
                  }`}
                />
                {errors.reason && (
                  <p className="mt-2 text-xs font-black text-red-500 flex items-center gap-1 uppercase tracking-widest">
                    <AlertCircle className="h-3 w-3" /> {errors.reason.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-black text-slate-700 mb-2 block uppercase tracking-widest">Cheque No (Optional)</label>
                <input
                  type="text"
                  placeholder="Reference number if applicable"
                  {...register('cheque_no')}
                  className="w-full px-3.5 py-3 lg:py-2.5 rounded-xl border border-slate-200 bg-surface text-text-primary text-sm min-h-[48px] lg:min-h-[42px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 placeholder:text-text-muted"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2 - LINE ITEMS */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 mx-4 sm:mx-0">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase tracking-widest">Line Items</h3>
            <div className="px-3 py-1 bg-slate-50 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {fields.length} Items Added
            </div>
          </div>

          <div>
            {/* ── DESKTOP TABLE ── */}
            <div className="hidden lg:block overflow-hidden border border-slate-100 rounded-2xl">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">#</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest w-1/3">Description</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Unit</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Qty</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Unit Price</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Amount</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-50">
                  {fields.map((field, index) => (
                    <tr key={field.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-4 text-xs font-black text-slate-400">{index + 1}</td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          {...register(`items.${index}.description`, { required: true })}
                          className="w-full border-0 bg-transparent py-2 px-0 text-sm font-bold text-slate-900 focus:ring-0 placeholder:text-slate-300"
                          placeholder="Item name..."
                        />
                      </td>
                      <td className="px-6 py-4">
                        <select
                          {...register(`items.${index}.unit`)}
                          className="w-full border-0 bg-transparent py-2 px-0 text-xs font-black text-slate-500 uppercase focus:ring-0 cursor-pointer"
                        >
                          <option>Pcs</option><option>Box</option><option>Kg</option>
                          <option>Ltr</option><option>Set</option><option>Other</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          min="1"
                          {...register(`items.${index}.quantity`, { required: true, min: 1 })}
                          className="w-16 border-0 bg-transparent py-2 px-0 text-sm font-bold text-slate-900 focus:ring-0"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          {...register(`items.${index}.unit_price`, { required: true, min: 0 })}
                          className="w-24 border-0 bg-transparent py-2 px-0 text-sm font-bold text-slate-900 focus:ring-0"
                        />
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-black text-slate-900">
                        {(Number(items[index]?.quantity || 0) * Number(items[index]?.unit_price || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                          className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Desktop Add Item Footer */}
              <div className="bg-slate-50/30 p-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => append({ description: '', unit: 'Pcs', quantity: 1, unit_price: 0 })}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black text-blue-600 uppercase tracking-widest hover:bg-blue-50 transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  Add Another Item
                </button>
              </div>
            </div>


            {/* ── MOBILE LINE ITEM CARDS ── */}
            <div className="lg:hidden space-y-3">
              {fields.map((field, index) => (
                <div key={field.id}
                  className="bg-slate-50 rounded-xl border border-slate-100 p-4">

                  {/* Card header: item number + delete */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600
                                     bg-blue-50 rounded-full px-2.5 py-1">
                      Item {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-500
                                 hover:bg-red-50 transition-colors disabled:opacity-30
                                 min-w-[36px] min-h-[36px] flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Description field */}
                  <div className="mb-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block">
                      Description *
                    </label>
                    <input
                      {...register(`items.${index}.description`, { required: true })}
                      placeholder="Item description"
                      className="w-full px-3 py-3 rounded-xl border border-slate-200
                                 text-sm font-bold min-h-[48px] bg-white focus:ring-2
                                 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    />
                  </div>

                  {/* Unit + Qty row */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block">
                        Unit
                      </label>
                      <select
                        {...register(`items.${index}.unit`)}
                        className="w-full px-3 py-3 rounded-xl border border-slate-200
                                   text-sm font-bold min-h-[48px] bg-white outline-none appearance-none"
                      >
                        <option>Pcs</option>
                        <option>Box</option>
                        <option>Kg</option>
                        <option>Ltr</option>
                        <option>Set</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block">
                        Quantity
                      </label>
                      <input
                        type="number"
                        {...register(`items.${index}.quantity`, { required: true, min: 1 })}
                        placeholder="0"
                        className="w-full px-3 py-3 rounded-xl border border-slate-200
                                   text-sm font-bold min-h-[48px] bg-white focus:ring-2
                                   focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Unit price + computed amount */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block">
                        Unit Price (ETB)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        {...register(`items.${index}.unit_price`, { required: true, min: 0 })}
                        placeholder="0.00"
                        className="w-full px-3 py-3 rounded-xl border border-slate-200
                                   text-sm font-bold min-h-[48px] bg-white focus:ring-2
                                   focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block">
                        Subtotal
                      </label>
                      <div className="flex items-center h-[48px] px-3 rounded-xl
                                      bg-white border border-slate-200">
                        <span className="text-sm font-black text-slate-900 tabular-nums">
                          ETB {(Number(items[index]?.quantity || 0) * Number(items[index]?.unit_price || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add item button */}
              <button
                type="button"
                onClick={() => append({ description: '', unit: 'Pcs', quantity: 1, unit_price: 0 })}
                className="w-full py-3.5 rounded-xl border-2 border-dashed border-slate-200
                           text-[10px] font-black text-slate-400 uppercase tracking-widest
                           hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50/5
                           min-h-[52px] flex items-center justify-center gap-2
                           transition-all duration-150 active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                Add Item to Request
              </button>
            </div>

            {/* Total row — always visible */}
            <div className="flex items-center justify-between mt-6 pt-6
                            border-t border-slate-100">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Total Requested Amount
              </span>
              <span className="text-xl font-black text-slate-900 tabular-nums">
                <span className="text-xs font-bold text-slate-400 mr-2 uppercase">ETB</span>
                {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* STICKY FORM ACTION BAR */}
        <div className="
          fixed bottom-0 left-0 right-0 z-40
          lg:static lg:mt-6
          bg-white/90 backdrop-blur-md lg:bg-transparent lg:backdrop-blur-none
          border-t border-slate-200 lg:border-none shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)] lg:shadow-none
          px-4 py-4 lg:px-0 lg:py-0
        ">
           <div className="max-w-[900px] mx-auto flex flex-col-reverse lg:flex-row items-center lg:justify-end gap-3 lg:gap-4">
              {/* Desktop-only status indicator */}
              <div className="hidden lg:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mr-auto">
                 <div className={`h-2 w-2 rounded-full ${saving ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                 <span className={saving ? 'text-amber-600' : 'text-emerald-600'}>
                    {saving ? 'Syncing...' : 'All changes saved'}
                 </span>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-4 w-full lg:w-auto">
                 <button
                   type="button"
                   onClick={() => navigate('/purchase-requisitions')}
                   className="w-full lg:w-auto px-6 py-3 lg:py-2.5 rounded-xl border border-slate-200 bg-white text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 min-h-[48px] transition-all flex items-center justify-center gap-2"
                 >
                    <X className="h-4 w-4" /> Cancel
                 </button>
                 
                 <button
                   type="button"
                   disabled={saving}
                   onClick={handleSubmit((data) => onSubmit(data, false))}
                   className="w-full lg:w-auto px-6 py-3 lg:py-2.5 rounded-xl border border-slate-200 bg-white text-[10px] font-black text-slate-600 uppercase tracking-widest hover:bg-slate-50 min-h-[48px] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                 >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Draft
                 </button>

                 <button
                   type="button"
                   disabled={saving}
                   onClick={handleSubmit((data) => {
                     setFormData(data);
                     setConfirmModal(true);
                   })}
                   className="w-full lg:w-auto px-10 py-3 lg:py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 min-h-[48px] transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 disabled:opacity-50"
                 >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Submit PR
                 </button>
              </div>
           </div>
        </div>

        {/* Spacer so content isn't hidden behind sticky bar on mobile */}
        <div className="h-32 lg:hidden" />
      </form>

      <ConfirmationModal 
        isOpen={confirmModal}
        onClose={() => setConfirmModal(false)}
        onConfirm={() => onSubmit(formData, true)}
        title="Submit PR for Approval?"
        message="Once submitted, this requisition will be routed to your department head for initial review. You will receive a notification once the status changes."
        type="approve"
        confirmText="Yes, Submit PR"
      />
    </div>
  );
}
