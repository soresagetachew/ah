import { useState, useEffect, useMemo } from 'react';
import { 
  FileText, Hash, Layout, Settings, 
  Plus, Save, Loader2, AlertTriangle, 
  Eye, Download, RefreshCw, Lock, 
  Palette, Type, Check, X, ShieldAlert,
  FileSearch, Printer, ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import client from '../../../api/client';
import { Modal } from '../../../components/ui/Modal';
import { useForm } from 'react-hook-form';

type Tab = 'serials' | 'templates' | 'rules';
type DocType = 'PR' | 'GRN' | 'SIV' | 'PRF';

export default function DocumentSettings() {
  const [activeTab, setActiveTab] = useState<Tab>('serials');

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl w-fit mx-auto lg:mx-0">
        {[
          { id: 'serials', label: 'Serial Numbers', icon: Hash },
          { id: 'templates', label: 'PDF Templates', icon: Layout },
          { id: 'rules', label: 'Document Rules', icon: FileSearch },
        ].map(t => (
          <button 
            key={t.id}
            onClick={() => setActiveTab(t.id as Tab)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === t.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'serials' && <SerialsTab />}
      {activeTab === 'templates' && <TemplatesTab />}
      {activeTab === 'rules' && <RulesTab />}
    </div>
  );
}

// --- TAB 1: SERIAL NUMBERS ---

function SerialsTab() {
  const [sequences, setSequences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetModal, setResetModal] = useState<{ open: boolean, type: string }>({ open: false, type: '' });

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await client.get('/settings/documents/config');
      setSequences(res.data.sequences);
    } catch (e) { toast.error('Failed to load sequences'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchConfig(); }, []);

  const handleUpdate = async (type: string, data: any) => {
    try {
      await client.put('/settings/documents/sequence', { document_type: type, ...data });
      toast.success('Format synchronized');
      fetchConfig();
    } catch (e) { toast.error('Update failed'); }
  };

  const getPreview = (seq: any) => {
    const year = new Date().getFullYear();
    const pad = '0'.repeat(seq.padding - 1) + '1';
    return `${seq.prefix}${seq.include_year ? '-' + year : ''}-${pad}`;
  };

  return (
    <div className="space-y-8">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {loading ? (
             <div className="col-span-full py-20 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto opacity-10" /></div>
          ) : sequences.map(seq => (
             <div key={seq.document_type} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 space-y-8 group hover:border-blue-200 transition-all">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black">
                         {seq.document_type}
                      </div>
                      <div>
                         <h3 className="text-lg font-black text-slate-900 tracking-tight">
                            {seq.document_type === 'PR' ? 'Purchase Requisition' : seq.document_type === 'GRN' ? 'Goods Receiving' : seq.document_type === 'SIV' ? 'Store Voucher' : 'Payment Request'}
                         </h3>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Serial Master</p>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Prefix</label>
                      <input 
                        defaultValue={seq.prefix} 
                        onBlur={(e) => handleUpdate(seq.document_type, { prefix: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10" 
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Padding</label>
                      <select 
                        defaultValue={seq.padding}
                        onChange={(e) => handleUpdate(seq.document_type, { padding: parseInt(e.target.value) })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 appearance-none"
                      >
                         <option value="3">3 Digits</option>
                         <option value="4">4 Digits</option>
                         <option value="5">5 Digits</option>
                      </select>
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Year</label>
                      <button 
                        onClick={() => handleUpdate(seq.document_type, { include_year: !seq.include_year })}
                        className={`w-full py-2.5 rounded-xl border font-black text-[10px] uppercase tracking-widest transition-all ${seq.include_year ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                      >
                         {seq.include_year ? 'Enabled' : 'Disabled'}
                      </button>
                   </div>
                </div>

                <div className="bg-slate-900 rounded-[2rem] p-6 text-center font-mono relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-5"><Hash className="h-20 w-20 text-white" /></div>
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Generated Preview</p>
                   <p className="text-xl font-bold text-white tracking-widest">{getPreview(seq)}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                   <div className="text-[10px] font-bold text-slate-400">
                      Last Value: <span className="text-slate-900 tabular-nums">{seq.last_number}</span>
                   </div>
                   <button 
                     onClick={() => setResetModal({ open: true, type: seq.document_type })}
                     className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                   >
                      <RefreshCw className="h-3 w-3" /> Reset Counter
                   </button>
                </div>
             </div>
          ))}
       </div>

       <Modal isOpen={resetModal.open} onClose={() => setResetModal({ open: false, type: '' })} title="Reset Serial Counter">
          <ResetForm type={resetModal.type} onSuccess={() => { setResetModal({ open: false, type: '' }); fetchConfig(); }} />
       </Modal>
    </div>
  );
}

function ResetForm({ type, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await client.post(`/settings/documents/reset-serial/${type}`, data);
      toast.success(`${type} counter reset successful`);
      onSuccess();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Reset failed'); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
       <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex gap-4">
          <ShieldAlert className="h-6 w-6 text-red-600 shrink-0" />
          <p className="text-xs text-red-800 leading-relaxed">
             This action will reset the serial sequence for <strong>{type}</strong>. 
             Use this only when starting a new fiscal year or during major system migrations.
          </p>
       </div>
       <div className="space-y-6">
          <div className="space-y-1.5">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Starting Number</label>
             <input type="number" {...register('resetTo', { required: true })} defaultValue={1} className="w-full px-5 py-4 rounded-2xl border border-slate-200 font-bold text-slate-900" />
          </div>
          <div className="space-y-1.5">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Admin Verification Password</label>
             <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type="password" {...register('password', { required: true })} className="w-full pl-11 pr-5 py-4 rounded-2xl border border-slate-200 font-bold text-slate-900" />
             </div>
          </div>
       </div>
       <button 
         disabled={loading}
         className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-500/20 active:scale-95 transition-all disabled:opacity-50"
       >
          {loading ? 'Processing Reset...' : 'Authorize Counter Reset'}
       </button>
    </form>
  );
}

// --- TAB 2: PDF TEMPLATES ---

function TemplatesTab() {
  const [docType, setDocType] = useState<DocType>('PR');

  return (
    <div className="space-y-10">
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1 space-y-8">
             <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">PDF Aesthetics</h3>
                <p className="text-sm text-slate-500">Configure visual branding and output parameters.</p>
             </div>
             
             <div className="flex flex-col gap-2">
                {['PR', 'GRN', 'SIV', 'PRF'].map(t => (
                  <button 
                    key={t}
                    onClick={() => setDocType(t as DocType)}
                    className={`flex items-center justify-between px-6 py-4 rounded-2xl border transition-all ${docType === t ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/20' : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'}`}
                  >
                     <span className="text-xs font-black uppercase tracking-widest">{t} Template</span>
                     <ChevronRight className="h-4 w-4 opacity-50" />
                  </button>
                ))}
             </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10 lg:p-14 space-y-12">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                {[
                  { label: 'Show Company Logo', checked: true },
                  { label: 'Include QR Verification', checked: true },
                  { label: 'Show Digital Signatures', checked: true },
                  { label: 'Include TIN Number', checked: true },
                  { label: 'Show Footer Metadata', checked: false },
                  { label: 'High-Contrast Mode', checked: false },
                ].map(item => (
                  <label key={item.label} className="flex items-center justify-between cursor-pointer group">
                     <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900">{item.label}</span>
                     <div className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${item.checked ? 'bg-blue-600' : 'bg-slate-200'}`}>
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${item.checked ? 'translate-x-6' : 'translate-x-1'}`} />
                     </div>
                  </label>
                ))}
             </div>

             <div className="pt-10 border-t border-slate-50 space-y-10">
                <div className="grid grid-cols-2 gap-8">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Header Theme</label>
                      <div className="flex items-center gap-4 px-5 py-3 rounded-2xl border border-slate-200">
                         <div className="h-6 w-6 rounded-lg bg-slate-900 border border-white/20" />
                         <span className="text-xs font-black text-slate-900">#0F172A (Slate)</span>
                      </div>
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Page Format</label>
                      <select className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white font-bold text-slate-900 appearance-none">
                         <option>A4 International</option>
                         <option>US Letter</option>
                      </select>
                   </div>
                </div>

                <div className="bg-slate-50 rounded-[2.5rem] p-10 border border-dashed border-slate-200 text-center">
                   <Printer className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                   <h4 className="text-sm font-black text-slate-900">Live Template Synchronization</h4>
                   <p className="text-xs text-slate-500 mt-1 mb-8 max-w-sm mx-auto">Generate a sample {docType} with mock data to verify your branding and layout configurations.</p>
                   <button className="flex items-center gap-2 px-10 py-4 bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-900 rounded-2xl hover:bg-slate-50 transition-all shadow-sm mx-auto">
                      <Eye className="h-4 w-4" /> Preview Sample PDF
                   </button>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}

// --- TAB 3: DOCUMENT RULES ---

function RulesTab() {
  return (
    <div className="space-y-10">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { 
              title: 'Purchase Requisition', 
              icon: FileText,
              rules: [
                { label: 'Min items per document', val: '1' },
                { label: 'Max items per document', val: '50' },
                { label: 'Require project code', checked: true },
                { label: 'Allow draft without items', checked: true }
              ]
            },
            { 
              title: 'Goods Receiving', 
              icon: Layout,
              rules: [
                { label: 'Require invoice attachment', checked: true },
                { label: 'Max variance allowed (%)', val: '5' },
                { label: 'Block if variance > limit', checked: true },
                { label: 'Auto-match to source PR', checked: true }
              ]
            }
          ].map(card => (
            <div key={card.title} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 space-y-8">
               <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                     <card.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">{card.title}</h3>
               </div>
               
               <div className="space-y-6">
                  {card.rules.map(rule => (
                    <div key={rule.label} className="flex items-center justify-between">
                       <span className="text-xs font-bold text-slate-700">{rule.label}</span>
                       {rule.val !== undefined ? (
                         <input defaultValue={rule.val} className="w-16 px-3 py-1.5 rounded-lg border border-slate-200 text-center text-xs font-black tabular-nums" />
                       ) : (
                         <div className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${rule.checked ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${rule.checked ? 'translate-x-6' : 'translate-x-1'}`} />
                         </div>
                       )}
                    </div>
                  ))}
               </div>
            </div>
          ))}
       </div>

       <div className="flex justify-end">
          <button className="flex items-center gap-2 px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all">
             <Save className="h-4 w-4" /> Commit System Rules
          </button>
       </div>
    </div>
  );
}
