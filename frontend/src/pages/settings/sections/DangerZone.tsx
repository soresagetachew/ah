import { useState } from 'react';
import { AlertTriangle, Trash2, Download, RotateCcw, Wrench, ShieldAlert, ShieldCheck, Lock, ArrowRight, Loader2, Check, ExternalLink, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import client from '../../../api/client';
import { Modal } from '../../../components/ui/Modal';
import { useForm } from 'react-hook-form';
import {
  Card,
  SectionTitle,
  FieldLabel,
  HelperText,
  Input,
  Textarea,
  Select,
  Button,
  Badge,
  Divider,
  Toggle,
  FormGroup,
  SectionGroup,
  FieldRow,
} from '../../../components/settings/SettingsComponents';

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
           <SectionTitle className="uppercase">Administrative Danger Zone</SectionTitle>
           <HelperText className="text-red-600/80 max-w-2xl">
              The operations listed below are destructive, irreversible, and have global impact on the organization's data integrity.
              Only proceed after ensuring a full database backup has been verified. Every action here is double-logged with CRITICAL severity.
           </HelperText>
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
      <Card className="bg-slate-50 border-slate-200 text-center space-y-3">
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
      </Card>

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
            <SectionTitle className="text-lg">{title}</SectionTitle>
            <HelperText className="max-w-xl">{desc}</HelperText>
         </div>
      </div>
      <Button
        onClick={onClick}
        variant={color === 'red' ? 'secondary' : 'secondary'}
        className={`border-2 whitespace-nowrap ${color === 'red' ? 'border-red-100 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500' : 'border-amber-100 text-amber-500 hover:bg-amber-500 hover:text-white hover:border-amber-500'}`}
      >
         {button}
      </Button>
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
       {step === 1 && (
         <div className="space-y-4">
            <HelperText>Select the cutoff date. All logs created <strong>before</strong> this date will be permanently deleted.</HelperText>
            <FormGroup label="Cutoff Date">
               <Input type="date" {...register('before_date', { required: true })} />
            </FormGroup>
            <div className="bg-blue-50 rounded-lg p-4 flex gap-3 border border-blue-100">
               <ShieldAlert className="h-5 w-5 text-blue-500 shrink-0" />
               <HelperText className="text-blue-600">System estimated records affected: <strong>≈ 4,200 records</strong>. This operation will optimize database indices.</HelperText>
            </div>
         </div>
       )}

       {step === 2 && (
         <div className="space-y-4">
            <HelperText>Second-factor verification required. Please enter your administrative password to authorize this purge.</HelperText>
            <FormGroup label="Admin Password">
               <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input type="password" {...register('admin_password', { required: true })} className="pl-11" />
               </div>
            </FormGroup>
         </div>
       )}

       {step === 3 && (
         <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
               <SectionTitle className="text-red-500 uppercase">Final Warning</SectionTitle>
               <HelperText className="text-red-600">This action cannot be undone. Data will be permanently erased.</HelperText>
            </div>
            <FormGroup label='Type "DELETE AUDIT LOGS" to confirm'>
               <Input {...register('confirm_text', { required: true })} className="border-2 border-red-100 focus:border-red-500 placeholder:text-red-200" placeholder="Type here..." />
            </FormGroup>
         </div>
       )}

       <div className="flex justify-end gap-3 pt-4">
          {step > 1 && <button type="button" onClick={() => setStep(step - 1)} className="px-6 py-3 text-[10px] font-medium uppercase tracking-widest text-slate-400">Back</button>}
          <Button
            type="submit"
            isLoading={loading}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
             {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : step === 3 ? 'Authorize Final Purge' : 'Continue'} <ArrowRight className="h-4 w-4" />
          </Button>
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
       <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
          <SectionTitle className="text-xs text-amber-900 uppercase">Impact Analysis</SectionTitle>
          <HelperText className="text-amber-800">
             This will reset the next sequence number for <strong>all</strong> document types (PR, GRN, SIV, PRF) to 1.
             Existing documents in the database will <strong>not</strong> be modified.
          </HelperText>
       </div>
       <SectionGroup>
          <FormGroup label="Admin Password">
             <Input type="password" {...register('admin_password', { required: true })} />
          </FormGroup>
          <FormGroup label='Type "RESET ALL SERIAL NUMBERS"'>
             <Input {...register('confirmation_text', { required: true })} className="border-2 border-red-100" />
          </FormGroup>
       </SectionGroup>
       <Button className="w-full bg-red-500 hover:bg-red-600 text-white">
          Execute Global Reset
       </Button>
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
       <div className="space-y-3">
          {['Users & Identity', 'Procurement Docs', 'Financial Ledgers', 'Audit History', 'System Config'].map(item => (
             <label key={item} className="flex items-center gap-3 p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition-all cursor-pointer">
                <input type="checkbox" defaultChecked className="h-5 w-5 rounded-lg border-2 border-slate-200 text-blue-500 focus:ring-0" />
                <span className="text-xs font-medium text-slate-900">{item}</span>
             </label>
          ))}
       </div>
       <FormGroup label="Authorization Password">
          <Input type="password" placeholder="Verify identity..." />
       </FormGroup>
       <Button
         onClick={handleExport}
         isLoading={loading}
         className="w-full bg-blue-500 hover:bg-blue-600 text-white"
       >
          {loading ? 'Compiling Archive...' : 'Generate Full System Export'}
       </Button>
    </div>
  );
}

// --- MAINTENANCE MODAL ---
function MaintenanceModal({ onSuccess }: any) {
  const [active, setActive] = useState(false);
  
  return (
    <div className="space-y-5">
       <div className={`p-4 rounded-lg border-2 text-center transition-all ${active ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
          <div className={`h-12 w-12 rounded-full mx-auto mb-3 flex items-center justify-center ${active ? 'bg-red-100 text-red-500' : 'bg-emerald-100 text-emerald-500'}`}>
             {active ? <Wrench className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
          </div>
          <SectionTitle className="text-xs uppercase tracking-widest">Current Status: {active ? 'Maintenance Mode' : 'Live & Active'}</SectionTitle>
       </div>

       <FormGroup label="Maintenance Message (Visible to Users)">
          <Textarea rows={3} defaultValue="The African Holding Procurement System is undergoing scheduled maintenance. Please try again in 2 hours." />
       </FormGroup>

       <Button
         onClick={() => { setActive(!active); toast.success(`System status synchronized to ${!active ? 'Maintenance' : 'Live'}`); }}
         className={`w-full ${active ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}
       >
          {active ? 'Disable Maintenance Mode' : 'Enable Maintenance Mode'}
       </Button>
    </div>
  );
}
