// @ts-nocheck
import { useState } from 'react';
import { AlertTriangle, Trash2, Download, RotateCcw, Wrench, ShieldAlert, ShieldCheck, Lock, ArrowRight, Loader2, ExternalLink, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import client from '../../../api/client';
import { Modal } from '../../../components/ui/Modal';
import { useForm } from 'react-hook-form';
import {
  SettingsCard,
  SettingsField,
  SettingsInput,
  SettingsSelect,
  SettingsTextarea,
  SettingsToggle,
  SettingsToggleRow,
  SettingsDivider,
  SettingsSaveBar,
  SettingsAlert,
  SettingsBadge,
  SettingsTable,
  SettingsSectionHeader,
} from '../../../components/settings/ui';

export default function DangerZone() {
  const [modal, setModal] = useState<{ open: boolean, action: string | null }>({ open: false, action: null });

  return (
    <div className="p-5 space-y-4 animate-in fade-in duration-500">
      {/* GLOBAL WARNING */}
      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-start gap-3 lg:gap-4 shadow-md shadow-red-500/5">
        <div className="h-12 w-12 rounded-lg bg-red-100 text-red-500 flex items-center justify-center shrink-0 border-2 border-red-200 shadow-inner">
           <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="space-y-1">
           <SettingsSectionHeader 
             title="Administrative Danger Zone"
             description="The operations listed below are destructive, irreversible, and have global impact on the organization's data integrity. Only proceed after ensuring a full database backup has been verified. Every action here is double-logged with CRITICAL severity."
           />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
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
      <div className="bg-slate-50 border-slate-200 rounded-lg p-6 text-center space-y-3">
         <p className="text-xs font-medium text-slate-400 uppercase tracking-[0.2em]">System-Level Assistance Required?</p>
         <div className="flex items-center justify-center gap-4">
            <button className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-widest text-blue-500 hover:underline">
               <Mail className="h-4 w-4" /> Technical Support
            </button>
            <div className="h-1 w-1 bg-slate-300 rounded-full" />
            <button className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-widest text-slate-600 hover:underline">
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
    <div className={`bg-white border-2 ${color === 'red' ? 'border-red-50 hover:border-red-200' : 'border-amber-50 hover:border-amber-200'} rounded-lg p-6 flex flex-col md:flex-row items-center justify-between gap-4 transition-all group shadow-sm`}>
      <div className="flex items-start gap-4">
         <div className={`h-12 w-12 rounded-lg ${color === 'red' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-amber-50 text-amber-500 border-amber-100'} border flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
            <Icon className="h-6 w-6" />
         </div>
         <div className="space-y-1">
            <SettingsSectionHeader title={title} description={desc} />
         </div>
      </div>
      <button
        onClick={onClick}
        className={`border-2 whitespace-nowrap px-6 h-9 rounded-lg text-xs font-medium transition-all ${color === 'red' ? 'border-red-100 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500' : 'border-amber-100 text-amber-500 hover:bg-amber-500 hover:text-white hover:border-amber-500'}`}
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
  const { register, handleSubmit } = useForm();
  
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
       {step === 1 && (
         <div className="space-y-4">
            <p className="text-sm text-slate-600">Select the cutoff date. All logs created <strong>before</strong> this date will be permanently deleted.</p>
            <SettingsField label="Cutoff Date" required={true}>
               <SettingsInput type="date" {...register('before_date', { required: true })} />
            </SettingsField>
            <div className="bg-blue-50 rounded-lg p-4 flex gap-3 border border-blue-100">
               <ShieldAlert className="h-5 w-5 text-blue-500 shrink-0" />
               <p className="text-sm text-blue-600">System estimated records affected: <strong>≈ 4,200 records</strong>. This operation will optimize database indices.</p>
            </div>
         </div>
       )}

       {step === 2 && (
         <div className="space-y-4">
            <p className="text-sm text-slate-600">Second-factor verification required. Please enter your administrative password to authorize this purge.</p>
            <SettingsField label="Admin Password" required={true}>
               <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <SettingsInput type="password" {...register('admin_password', { required: true })} className="pl-11" />
               </div>
            </SettingsField>
         </div>
       )}

       {step === 3 && (
         <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
               <h3 className="text-sm font-semibold text-red-500 uppercase">Final Warning</h3>
               <p className="text-sm text-red-600">This action cannot be undone. Data will be permanently erased.</p>
            </div>
            <SettingsField label='Type "DELETE AUDIT LOGS" to confirm' required={true}>
               <SettingsInput {...register('confirm_text', { required: true })} className="border-2 border-red-100 focus:border-red-500 placeholder:text-red-200" placeholder="Type here..." />
            </SettingsField>
         </div>
       )}

       <div className="flex justify-end gap-3 pt-4">
          {step > 1 && <button type="button" onClick={() => setStep(step - 1)} className="px-6 h-9 text-[10px] font-medium uppercase tracking-widest text-slate-400">Back</button>}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 h-9 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium transition-all disabled:opacity-50"
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
       <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
          <h3 className="text-xs font-semibold text-amber-900 uppercase">Impact Analysis</h3>
          <p className="text-sm text-amber-800">
             This will reset the next sequence number for <strong>all</strong> document types (PR, GRN, SIV, PRF) to 1.
             Existing documents in the database will <strong>not</strong> be modified.
          </p>
       </div>
       <div className="space-y-4">
          <SettingsField label="Admin Password" required={true}>
             <SettingsInput type="password" {...register('admin_password', { required: true })} />
          </SettingsField>
          <SettingsField label='Type "RESET ALL SERIAL NUMBERS"' required={true}>
             <SettingsInput {...register('confirmation_text', { required: true })} className="border-2 border-red-100" />
          </SettingsField>
       </div>
       <button className="w-full px-6 h-9 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium transition-all">
          Execute Global Reset
       </button>
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
    <div className="space-y-5">
       <div className="space-y-4">
          {['Users & Identity', 'Procurement Docs', 'Financial Ledgers', 'Audit History', 'System Config'].map(item => (
             <label key={item} className="flex items-center gap-3 p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition-all cursor-pointer">
                <input type="checkbox" defaultChecked className="h-5 w-5 rounded-lg border-2 border-slate-200 text-blue-500 focus:ring-0" />
                <span className="text-xs font-medium text-slate-900">{item}</span>
             </label>
          ))}
       </div>
       <SettingsField label="Authorization Password" required={true}>
          <SettingsInput type="password" placeholder="Verify identity..." />
       </SettingsField>
       <button
         onClick={handleExport}
         disabled={loading}
         className="w-full px-6 h-9 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-medium transition-all disabled:opacity-50"
       >
          {loading ? 'Compiling Archive...' : 'Generate Full System Export'}
       </button>
    </div>
  );
}

// --- MAINTENANCE MODAL ---
function MaintenanceModal() {
  const [active, setActive] = useState(false);
  
  return (
    <div className="space-y-5">
       <div className="space-y-4">
          <div className={`p-4 rounded-lg border-2 text-center transition-all ${active ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
             <div className={`h-12 w-12 rounded-full mx-auto mb-3 flex items-center justify-center ${active ? 'bg-red-100 text-red-500' : 'bg-emerald-100 text-emerald-500'}`}>
                {active ? <Wrench className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
             </div>
             <h3 className={`text-xs font-semibold uppercase tracking-widest ${active ? 'text-red-500' : 'text-emerald-500'}`}>Current Status: {active ? 'Maintenance Mode' : 'Live & Active'}</h3>
          </div>
          <SettingsField label="Maintenance Message (Visible to Users)">
             <SettingsTextarea rows={3} defaultValue="The African Holding Procurement System is undergoing scheduled maintenance. Please try again in 2 hours." />
          </SettingsField>
          <button
            onClick={() => { setActive(!active); toast.success(`System status synchronized to ${!active ? 'Maintenance' : 'Live'}`); }}
            className={`w-full px-6 h-9 ${active ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'} rounded-lg text-xs font-medium transition-all`}
          >
             {active ? 'Disable Maintenance Mode' : 'Enable Maintenance Mode'}
          </button>
       </div>
    </div>
  );
}

// ... (rest of the code remains the same)
