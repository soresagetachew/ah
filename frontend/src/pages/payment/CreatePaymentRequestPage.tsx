import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { 
  Building2, Briefcase, HardHat, Factory, GraduationCap, 
  Waves, TreePine, Banknote, CreditCard, PieChart, 
  Bell, Save, Send, X, FileText, CheckCircle, Info, Loader2
} from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import { ConfirmationModal } from '../../components/ui/Modal';

const businessUnits = [
  { id: 'HO', name: 'HO', icon: Building2 },
  { id: 'Directorate', name: 'Directorate', icon: Briefcase },
  { id: 'Construction', name: 'Construction', icon: HardHat },
  { id: 'Kodeko', name: 'Kodeko', icon: Factory },
  { id: 'School', name: 'School', icon: GraduationCap },
  { id: 'Ocean', name: 'Ocean', icon: Waves },
  { id: 'Eucalyptus', name: 'Eucalyptus', icon: TreePine },
];

export default function CreatePaymentRequestPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [amountWords, setAmountWords] = useState('Zero Birr Only');
  const [confirmModal, setConfirmModal] = useState(false);
  const [formData, setFormData] = useState<any>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      business_unit: '',
      project_site: '',
      id_no: '',
      mode: 'cash',
      amount_figure: 0,
      purpose: '',
    }
  });

  const selectedMode = watch('mode');
  const amountFigure = watch('amount_figure');
  const selectedBU = watch('business_unit');
  const purpose = watch('purpose');

  useEffect(() => {
    if (amountFigure > 0) {
      // Basic approximation for words - real conversion usually happens on backend
      setAmountWords(`${Number(amountFigure).toLocaleString()} Birr Only`);
    } else {
      setAmountWords('Zero Birr Only');
    }
  }, [amountFigure]);

  const onSubmit = async (data: any, isSubmit: boolean) => {
    try {
      setSaving(true);
      await client.post('/payment-requests', data);
      toast.success(isSubmit ? 'Payment Request submitted successfully' : 'Payment Request saved as draft');
      navigate('/payment-requests');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save Payment Request');
    } finally {
      setSaving(false);
      setConfirmModal(false);
    }
  };

  return (
    <div className="max-w-[900px] mx-auto pb-32 animate-in fade-in duration-700">
      <PageHeader 
        title="New Payment Request"
        subtitle="Request funds or reimbursement for business expenses and services."
        breadcrumbs={[{ label: 'African Holding' }, { label: 'Finance' }, { label: 'Payment Request' }]}
      />

      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        {/* BUSINESS UNIT SELECTOR */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8">
           <div className="flex items-center gap-4 mb-8">
              <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                 <Building2 className="h-6 w-6" />
              </div>
              <div>
                 <h3 className="text-lg font-black text-slate-900 tracking-tight">Business Unit</h3>
                 <p className="text-sm text-slate-500 font-medium mt-0.5">Which unit or team is this payment for?</p>
              </div>
           </div>

           <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 lg:gap-3">
              {businessUnits.map(unit => {
                const Icon = unit.icon;
                const isSelected = selectedBU === unit.id;
                return (
                  <button
                    key={unit.id}
                    type="button"
                    onClick={() => setValue('business_unit', unit.id)}
                    className={`
                      flex flex-col items-center justify-center gap-2 p-3 lg:p-4
                      rounded-xl border-2 text-center
                      min-h-[80px] lg:min-h-[120px] transition-all duration-150
                      active:scale-[0.97]
                      ${isSelected
                        ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                        : 'border-slate-100 bg-white text-slate-500 hover:border-blue-400/50'
                      }
                    `}
                  >
                    <Icon className={`w-6 h-6 lg:w-8 lg:h-8 ${isSelected ? 'text-white' : 'text-blue-500'}`} />
                    <span className={`text-[10px] font-black uppercase tracking-widest leading-tight ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                      {unit.name}
                    </span>
                  </button>
                );
              })}
           </div>
           {errors.business_unit && <p className="mt-4 text-xs font-black text-red-500 uppercase tracking-widest">Please select a business unit</p>}
           <input type="hidden" {...register('business_unit', { required: true })} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="md:col-span-2 space-y-6">
              {/* MODE OF PAYMENT */}
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 sm:p-8 mx-4 sm:mx-0">
                 <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Mode of Payment</h3>
                 <div className="flex gap-4">
                    <button 
                      type="button" 
                      onClick={() => setValue('mode', 'cash')} 
                      className={`flex-1 py-4 lg:py-6 px-4 border-2 rounded-2xl flex flex-col items-center gap-3 transition-all min-h-[100px] lg:min-h-[120px] ${
                        selectedMode === 'cash' 
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-lg shadow-emerald-900/5' 
                        : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                       <Banknote className="h-8 w-8" />
                       <span className="text-xs font-black uppercase tracking-widest">In Cash</span>
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setValue('mode', 'cheque')} 
                      className={`flex-1 py-4 lg:py-6 px-4 border-2 rounded-2xl flex flex-col items-center gap-3 transition-all min-h-[100px] lg:min-h-[120px] ${
                        selectedMode === 'cheque' 
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-lg shadow-emerald-900/5' 
                        : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                       <CreditCard className="h-8 w-8" />
                       <span className="text-xs font-black uppercase tracking-widest">By Cheque</span>
                    </button>
                 </div>
              </div>

              {/* PURPOSE SECTION */}
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 sm:p-8 mx-4 sm:mx-0">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Purpose of Payment</h3>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       {purpose?.length || 0} / 500
                    </span>
                 </div>
                 <textarea 
                   {...register('purpose', { required: true, maxLength: 500 })} 
                   rows={4} 
                   placeholder="Describe what this payment is for..."
                   className="w-full px-3.5 py-3 lg:py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-slate-900 text-sm min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 resize-none"
                 />
              </div>
           </div>

           <div className="space-y-6 mx-4 sm:mx-0">
              {/* BUDGET METER */}
              <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 relative overflow-hidden group">
                 <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                       <h4 className="text-[10px] font-black text-amber-700 uppercase tracking-widest flex items-center gap-2">
                          <PieChart className="h-3.5 w-3.5" /> Dept Budget
                       </h4>
                       <div className="h-2 w-2 bg-amber-500 rounded-full animate-pulse" />
                    </div>
                    <div className="flex items-end justify-between mb-2">
                       <span className="text-2xl font-black text-amber-900 tracking-tight">84%</span>
                       <span className="text-[10px] font-black text-amber-600 uppercase">Utilized</span>
                    </div>
                    <div className="h-2 w-full bg-amber-200 rounded-full overflow-hidden">
                       <div className="h-full bg-amber-500 w-[84%] transition-all duration-1000 ease-out" />
                    </div>
                 </div>
                 <div className="absolute -right-8 -bottom-8 text-amber-100/50 group-hover:scale-110 transition-transform duration-500">
                    <PieChart className="h-32 w-32" />
                 </div>
              </div>

              {/* PROJECT / ID FIELDS */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Project / Site</label>
                    <input type="text" {...register('project_site')} className="w-full px-3.5 py-3 lg:py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-slate-900 text-sm min-h-[48px] lg:min-h-[42px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">ID Number</label>
                    <input type="text" {...register('id_no')} className="w-full px-3.5 py-3 lg:py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-slate-900 text-sm min-h-[48px] lg:min-h-[42px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150" />
                 </div>
              </div>
           </div>
        </div>

        {/* AMOUNT SECTION */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-700 rounded-[2.5rem] p-6 sm:p-10 text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden group mx-4 sm:mx-0">
           <div className="relative z-10">
              <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 sm:mb-8 block">Amount in Figures</label>
              <div className="flex items-baseline gap-4 mb-6">
                 <span className="text-xl sm:text-2xl font-black text-slate-500">ETB</span>
                 <input 
                   type="number" 
                   step="0.01" 
                   {...register('amount_figure', { required: true, min: 1 })} 
                   className="flex-1 bg-transparent border-0 border-b-2 border-white/20 focus:border-white focus:ring-0 text-4xl sm:text-6xl font-black text-white p-0 pb-2 placeholder:text-white/10"
                   placeholder="0.00"
                 />
              </div>
              <div className="h-px bg-white/10 w-full mb-6" />
              <div className="flex items-start gap-3">
                 <Info className="h-4 w-4 text-slate-500 mt-0.5" />
                 <div>
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Amount in Words</p>
                    <p className="text-base sm:text-lg font-bold text-slate-300 italic">"{amountWords}"</p>
                 </div>
              </div>
           </div>
           <div className="absolute right-0 top-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
              <Wallet className="h-40 w-40" />
           </div>
        </div>

        {/* DISBURSEMENT SECTION (Finance Only Visual) */}
        <div className="mt-8 pt-8 sm:mt-12 sm:pt-12 border-t-4 border-dashed border-slate-100 px-4 sm:px-0">
           <div className="bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 p-6 sm:p-10">
              <div className="flex justify-center mb-8">
                 <div className="px-5 py-2 bg-slate-200 rounded-full text-[9px] sm:text-[10px] font-black text-slate-600 uppercase tracking-[0.1em] sm:tracking-[0.2em] shadow-sm text-center">
                    Finance Section Only
                 </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
                 <div className="text-center">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-white border border-slate-200 mx-auto flex items-center justify-center text-slate-300 mb-4">
                       <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Checked</p>
                 </div>
                 <div className="text-center">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-white border border-slate-200 mx-auto flex items-center justify-center text-slate-300 mb-4">
                       <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Approved By</p>
                 </div>
                 <div className="text-center">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-white border border-slate-200 mx-auto flex items-center justify-center text-slate-300 mb-4">
                       <PieChart className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Budget Approved</p>
                 </div>
              </div>
           </div>
        </div>

        {/* STICKY FOOTER */}
        <div className="
          fixed bottom-0 left-0 right-0 z-40
          lg:static lg:mt-6
          bg-white/90 backdrop-blur-md lg:bg-transparent lg:backdrop-blur-none
          border-t border-slate-200 lg:border-none shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)] lg:shadow-none
          px-4 py-4 lg:px-0 lg:py-0
        ">
           <div className="max-w-[900px] mx-auto flex flex-col-reverse lg:flex-row items-center lg:justify-end gap-3 lg:gap-4">
              <div className="hidden lg:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mr-auto">
                 <div className={`h-2 w-2 rounded-full ${saving ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                 <span className={saving ? 'text-amber-600' : 'text-emerald-600'}>{saving ? 'Syncing...' : 'All changes saved'}</span>
              </div>
              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-4 w-full lg:w-auto">
                 <button type="button" onClick={() => navigate('/payment-requests')}
                   className="w-full lg:w-auto px-6 py-3 lg:py-2.5 rounded-xl border border-slate-200 bg-white text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 min-h-[48px] transition-all flex items-center justify-center gap-2">
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
                   onClick={handleSubmit((data) => { setFormData(data); setConfirmModal(true); })}
                   className="w-full lg:w-auto px-10 py-3 lg:py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 min-h-[48px] transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 disabled:opacity-50"
                 >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Submit Request
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
        title="Authorize Payment Request?"
        message="This request will be sent to the Finance department for budget verification and approval. Please ensure all details are correct before submitting."
        type="approve"
        confirmText="Yes, Submit Request"
      />
    </div>
  );
}

// Missing Icon import
const Wallet = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
);
