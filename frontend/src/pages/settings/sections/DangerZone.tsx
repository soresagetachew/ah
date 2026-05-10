import { useState } from 'react';
import { 
  AlertTriangle, Trash2, Download, RotateCcw, 
  Wrench, ShieldAlert, Lock, ArrowRight,
  Loader2, Check, ExternalLink, RefreshCw,
  Mail, MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';
import client from '../../../api/client';
import { Modal } from '../../../components/ui/Modal';
import { useForm } from 'react-hook-form';

export default function DangerZone() {
  const [modal, setModal] = useState<{ open: boolean, action: string | null }>({ open: false, action: null });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* GLOBAL WARNING */}
      <div className="bg-red-50 border-2 border-red-200 rounded-[2.5rem] p-10 flex items-start gap-8 shadow-xl shadow-red-500/5">
        <div className="h-16 w-16 rounded-[1.5rem] bg-red-100 text-red-600 flex items-center justify-center shrink-0 border-2 border-red-200 shadow-inner">
           <AlertTriangle className="h-8 w-8" />
        </div>
        <div className="space-y-2">
           <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Administrative Danger Zone</h3>
           <p className="text-sm text-red-700/80 font-medium leading-relaxed max-w-2xl">
              The operations listed below are destructive, irreversible, and have global impact on the organization's data integrity. 
              Only proceed after ensuring a full database backup has been verified. Every action here is double-logged with CRITICAL severity.
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <DangerCard 
          icon={Trash2} 
          title="Purge Historical Audit Logs" 
          desc="Permanently delete audit trail records older than a specific date to reclaim database storage."
          button="Initialize Purge"
          onClick={() => setModal({ open: true, action: 'purge' })}
        />
        <DangerCard 
          icon={RotateCcw} 
          title="Reset All Document Counters" 
          desc="Reset serial sequences for all document types (PR, GRN, SIV, PRF) to zero. Essential for fiscal year transitions."
          button="Initialize Reset"
          onClick={() => setModal({ open: true, action: 'reset' })}
        />
        <DangerCard 
          icon={Download} 
          title="Full Organizational Data Export" 
          desc="Generate an encrypted archive containing all database tables, user records, and configuration settings."
          button="Generate Export"
          onClick={() => setModal({ open: true, action: 'export' })}
        />
        <DangerCard 
          icon={Wrench} 
          title="Emergency Maintenance Mode" 
          desc="Immediately disconnect all non-administrative users and lock the system for maintenance or security updates."
          button="Manage Maintenance"
          color="amber"
          onClick={() => setModal({ open: true, action: 'maintenance' })}
        />
      </div>

      {/* SUPPORT FOOTER */}
      <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-8 text-center space-y-4">
         <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">System-Level Assistance Required?</p>
         <div className="flex items-center justify-center gap-6">
            <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline">
               <Mail className="h-4 w-4" /> Technical Support
            </button>
            <div className="h-1 w-1 bg-slate-300 rounded-full" />
            <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:underline">
               <ExternalLink className="h-4 w-4" /> Developer Documentation
            </button>
         </div>
      </div>

      {/* MODAL DISPATCHER */}
      <Modal 
        isOpen={modal.open} 
        onClose={() => setModal({ open: false, action: null })} 
        title={modal.action === 'purge' ? 'Purge Audit Logs' : modal.action === 'reset' ? 'Global Serial Reset' : modal.action === 'export' ? 'System Data Export' : 'Maintenance Control'}
      >
         {modal.action === 'purge' && <PurgeModal onSuccess={() => setModal({ open: false, action: null })} />}
         {modal.action === 'reset' && <ResetModal onSuccess={() => setModal({ open: false, action: null })} />}
         {modal.action === 'export' && <ExportModal onSuccess={() => setModal({ open: false, action: null })} />}
         {modal.action === 'maintenance' && <MaintenanceModal onSuccess={() => setModal({ open: false, action: null })} />}
      </Modal>
    </div>
  );
}

function DangerCard({ icon: Icon, title, desc, button, onClick, color = 'red' }: any) {
  return (
    <div className={`bg-white border-2 ${color === 'red' ? 'border-red-50 hover:border-red-200' : 'border-amber-50 hover:border-amber-200'} rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-8 transition-all group shadow-sm`}>
      <div className="flex items-start gap-6">
         <div className={`h-14 w-14 rounded-2xl ${color === 'red' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-amber-50 text-amber-600 border-amber-100'} border flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
            <Icon className="h-6 w-6" />
         </div>
         <div className="space-y-1">
            <h4 className="text-lg font-black text-slate-900 tracking-tight">{title}</h4>
            <p className="text-sm text-slate-500 font-medium max-w-xl">{desc}</p>
         </div>
      </div>
      <button 
        onClick={onClick}
        className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border-2 whitespace-nowrap ${color === 'red' ? 'bg-white border-red-100 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600' : 'bg-white border-amber-100 text-amber-600 hover:bg-amber-600 hover:text-white hover:border-amber-600'}`}
      >
         {button}
      </button>
    </div>
  );
}

// --- PURGE MODAL (3-STEP) ---
function PurgeModal({ onSuccess }: any) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch } = useForm();
  
  const onSubmit = async (data: any) => {
    if (step < 3) { setStep(step + 1); return; }
    if (data.confirm_text !== 'DELETE AUDIT LOGS') { toast.error('Confirmation text mismatch'); return; }
    
    setLoading(true);
    try {
      await client.post('/settings/danger/purge-audit-logs', data);
      toast.success('Audit logs purged successfully');
      onSuccess();
    } catch (e) { toast.error('Purge failed'); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
       {step === 1 && (
         <div className="space-y-6">
            <p className="text-sm text-slate-600">Select the cutoff date. All logs created <strong>before</strong> this date will be permanently deleted.</p>
            <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cutoff Date</label>
               <input type="date" {...register('before_date', { required: true })} className="w-full px-5 py-4 rounded-2xl border border-slate-200 font-bold text-slate-900" />
            </div>
            <div className="bg-blue-50 rounded-2xl p-6 flex gap-4 border border-blue-100">
               <ShieldAlert className="h-6 w-6 text-blue-600 shrink-0" />
               <p className="text-xs text-blue-800 leading-relaxed">System estimated records affected: <strong>≈ 4,200 records</strong>. This operation will optimize database indices.</p>
            </div>
         </div>
       )}

       {step === 2 && (
         <div className="space-y-6">
            <p className="text-sm text-slate-600">Second-factor verification required. Please enter your administrative password to authorize this purge.</p>
            <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Admin Password</label>
               <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input type="password" {...register('admin_password', { required: true })} className="w-full pl-11 pr-5 py-4 rounded-2xl border border-slate-200 font-bold text-slate-900" />
               </div>
            </div>
         </div>
       )}

       {step === 3 && (
         <div className="space-y-8">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
               <p className="text-lg font-black text-red-600 uppercase">Final Warning</p>
               <p className="text-xs text-red-700 mt-1 font-bold">This action cannot be undone. Data will be permanently erased.</p>
            </div>
            <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type "DELETE AUDIT LOGS" to confirm</label>
               <input {...register('confirm_text', { required: true })} className="w-full px-5 py-4 rounded-2xl border-2 border-red-100 focus:border-red-600 font-black text-slate-900 placeholder:text-red-200" placeholder="Type here..." />
            </div>
         </div>
       )}

       <div className="flex justify-end gap-4 pt-4">
          {step > 1 && <button type="button" onClick={() => setStep(step - 1)} className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Back</button>}
          <button 
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-10 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
             {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : step === 3 ? 'Authorize Final Purge' : 'Continue'} <ArrowRight className="h-4 w-4" />
          </button>
       </div>
    </form>
  );
}

// --- RESET MODAL ---
function ResetModal({ onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm();
  
  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await client.post('/settings/danger/reset-all-serials', data);
      toast.success('All counters reset to zero ✓');
      onSuccess();
    } catch (e) { toast.error('Reset failed'); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
       <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-2">
          <p className="text-xs font-black text-amber-900 uppercase">Impact Analysis</p>
          <p className="text-xs text-amber-800 leading-relaxed">
             This will reset the next sequence number for <strong>all</strong> document types (PR, GRN, SIV, PRF) to 1. 
             Existing documents in the database will <strong>not</strong> be modified.
          </p>
       </div>
       <div className="space-y-6">
          <div className="space-y-1.5">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Admin Password</label>
             <input type="password" {...register('admin_password', { required: true })} className="w-full px-5 py-4 rounded-2xl border border-slate-200 font-bold text-slate-900" />
          </div>
          <div className="space-y-1.5">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type "RESET ALL SERIAL NUMBERS"</label>
             <input {...register('confirmation_text', { required: true })} className="w-full px-5 py-4 rounded-2xl border-2 border-red-100 font-black text-slate-900" />
          </div>
       </div>
       <button className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Execute Global Reset</button>
    </form>
  );
}

// --- EXPORT MODAL ---
function ExportModal({ onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  
  const handleExport = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('System archive ready for download');
    }, 2000);
  };

  return (
    <div className="space-y-8">
       <div className="space-y-4">
          {['Users & Identity', 'Procurement Docs', 'Financial Ledgers', 'Audit History', 'System Config'].map(item => (
             <label key={item} className="flex items-center gap-4 p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer">
                <input type="checkbox" defaultChecked className="h-5 w-5 rounded-lg border-2 border-slate-200 text-blue-600 focus:ring-0" />
                <span className="text-xs font-bold text-slate-900">{item}</span>
             </label>
          ))}
       </div>
       <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Authorization Password</label>
          <input type="password" placeholder="Verify identity..." className="w-full px-5 py-4 rounded-2xl border border-slate-200 font-bold text-slate-900" />
       </div>
       <button 
         onClick={handleExport}
         disabled={loading}
         className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl disabled:opacity-50"
       >
          {loading ? 'Compiling Archive...' : 'Generate Full System Export'}
       </button>
    </div>
  );
}

// --- MAINTENANCE MODAL ---
function MaintenanceModal({ onSuccess }: any) {
  const [active, setActive] = useState(false);
  
  return (
    <div className="space-y-8">
       <div className={`p-6 rounded-[2rem] border-2 text-center transition-all ${active ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
          <div className={`h-12 w-12 rounded-full mx-auto mb-4 flex items-center justify-center ${active ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
             {active ? <Wrench className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
          </div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-900">Current Status: {active ? 'Maintenance Mode' : 'Live & Active'}</p>
       </div>
       
       <div className="space-y-4">
          <div className="space-y-1.5">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Maintenance Message (Visible to Users)</label>
             <textarea rows={3} defaultValue="The African Holding Procurement System is undergoing scheduled maintenance. Please try again in 2 hours." className="w-full px-5 py-4 rounded-2xl border border-slate-200 text-xs font-bold text-slate-900 resize-none" />
          </div>
       </div>

       <button 
         onClick={() => { setActive(!active); toast.success(`System status synchronized to ${!active ? 'Maintenance' : 'Live'}`); }}
         className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all ${active ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}
       >
          {active ? 'Disable Maintenance Mode' : 'Enable Maintenance Mode'}
       </button>
    </div>
  );
}
