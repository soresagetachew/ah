// @ts-nocheck
import { useState, useEffect } from 'react';
import { FileText, Hash, Layout, Loader2, AlertTriangle, Eye, RefreshCw, Lock, ShieldAlert, FileSearch, Printer, ChevronRight } from 'lucide-react';
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

type Tab = 'serials' | 'templates' | 'rules';
type DocType = 'PR' | 'GRN' | 'SIV' | 'PRF';

export default function DocumentSettings() {
  const [activeTab, setActiveTab] = useState<Tab>('serials');

  return (
    <div className="p-5 space-y-4 animate-in fade-in duration-500">
      <div className="flex gap-1 p-1 bg-slate-100 rounded-lg w-fit mx-auto lg:mx-0">
        {[
          { id: 'serials', label: 'Serials', icon: Hash },
          { id: 'templates', label: 'Templates', icon: Layout },
          { id: 'rules', label: 'Rules', icon: FileSearch },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as Tab)}
            className={`flex items-center gap-2 px-4 h-9 rounded-lg text-xs font-medium uppercase tracking-widest transition-all ${activeTab === t.id ? 'bg-white text-blue-500 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            <t.icon className="h-3.5 w-3.5" /> <span className="hidden sm:inline">{t.label}</span><span className="sm:hidden">{t.label}</span>
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
    const paddingCount = Math.max(0, (seq.padding || 3) - 1);
    const pad = '0'.repeat(paddingCount) + '1';
    return `${seq.prefix}${seq.include_year ? '-' + year : ''}-${pad}`;
  };

  return (
    <div className="space-y-4">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
             <div className="col-span-full py-20 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto opacity-10" /></div>
          ) : sequences.map(seq => (
             <SettingsCard key={seq.document_type} className="hover:border-blue-300 transition-all">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-slate-900 text-white flex items-center justify-center font-semibold">
                         {seq.document_type}
                      </div>
                      <div>
                         <SettingsSectionHeader 
                           title={seq.document_type === 'PR' ? 'Purchase Requisition' : seq.document_type === 'GRN' ? 'Goods Receiving' : seq.document_type === 'SIV' ? 'Store Voucher' : 'Payment Request'}
                           description="Serial Master"
                         />
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <SettingsField label="Prefix">
                      <SettingsInput
                        defaultValue={seq.prefix}
                        onBlur={(e) => handleUpdate(seq.document_type, { prefix: e.target.value })}
                      />
                   </SettingsField>
                   <SettingsField label="Padding">
                      <SettingsSelect
                        defaultValue={seq.padding}
                        onChange={(e) => handleUpdate(seq.document_type, { padding: parseInt(e.target.value) })}
                        options={[
                          { value: '3', label: '3 Digits' },
                          { value: '4', label: '4 Digits' },
                          { value: '5', label: '5 Digits' }
                        ]}
                      />
                   </SettingsField>
                   <SettingsField label="Year">
                      <button
                        onClick={() => handleUpdate(seq.document_type, { include_year: !seq.include_year })}
                        className={`w-full h-9 rounded-lg text-xs font-medium transition-all ${seq.include_year ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'}`}
                      >
                         {seq.include_year ? 'Enabled' : 'Disabled'}
                      </button>
                   </SettingsField>
                </div>

                <div className="bg-slate-900 rounded-lg p-4 text-center font-mono relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-5"><Hash className="h-20 w-20 text-white" /></div>
                   <p className="text-[9px] font-medium text-slate-500 uppercase tracking-[0.2em] mb-2">Generated Preview</p>
                   <p className="text-base font-semibold text-white tracking-widest">{getPreview(seq)}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                   <div className="text-[10px] font-normal text-slate-400">
                      Last Value: <span className="text-slate-900 tabular-nums">{seq.last_number}</span>
                   </div>
                   <button
                     onClick={() => setResetModal({ open: true, type: seq.document_type })}
                     className="flex items-center gap-2 px-3 h-9 text-red-500 hover:bg-red-50 rounded-lg text-xs font-medium transition-all"
                   >
                      <RefreshCw className="h-3 w-3" /> Reset Counter
                   </button>
                </div>
             </SettingsCard>
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
       <SettingsAlert type="error" icon={ShieldAlert}>
          This action will reset the serial sequence for <strong>{type}</strong>.
          Use this only when starting a new fiscal year or during major system migrations.
       </SettingsAlert>
       <SettingsField label="New Starting Number" required>
          <SettingsInput type="number" {...register('resetTo', { required: true })} defaultValue={1} />
       </SettingsField>
       <SettingsField label="Admin Verification Password" required>
          <div className="relative">
             <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
             <SettingsInput type="password" {...register('password', { required: true })} className="pl-11" />
          </div>
       </SettingsField>
       <SettingsSaveBar
         onSave={handleSubmit(onSubmit)}
         isSaving={loading}
         saveLabel={loading ? 'Processing Reset...' : 'Authorize Counter Reset'}
         danger
       />
    </form>
  );
}

// --- TAB 2: PDF TEMPLATES ---

function TemplatesTab() {
  const [docType, setDocType] = useState<DocType>('PR');

  return (
    <div className="space-y-4">
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 space-y-4">
             <SettingsSectionHeader 
               title="PDF Aesthetics"
               description="Configure visual branding and output parameters."
             />

             <div className="flex flex-col gap-2">
                {['PR', 'GRN', 'SIV', 'PRF'].map(t => (
                  <button
                    key={t}
                    onClick={() => setDocType(t as DocType)}
                    className={`flex items-center justify-between px-4 h-9 rounded-lg border transition-all ${docType === t ? 'bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-500/20' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                  >
                     <span className="text-xs font-medium uppercase tracking-widest">{t} Template</span>
                     <ChevronRight className="h-4 w-4 opacity-50" />
                  </button>
                ))}
             </div>
          </div>

          <SettingsCard className="lg:col-span-2">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {[
                  { label: 'Show Company Logo', checked: true },
                  { label: 'Include QR Verification', checked: true },
                  { label: 'Show Digital Signatures', checked: true },
                  { label: 'Include TIN Number', checked: true },
                  { label: 'Show Footer Metadata', checked: false },
                  { label: 'High-Contrast Mode', checked: false },
                ].map(item => (
                  <SettingsToggleRow
                    key={item.label}
                    label={item.label}
                    checked={item.checked}
                    onChange={() => {}}
                  />
                ))}
             </div>

             <SettingsDivider />

             <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <SettingsField label="Header Theme">
                      <div className="flex items-center gap-3 px-4 h-9 rounded-lg border border-slate-200">
                         <div className="h-6 w-6 rounded-lg bg-slate-900 border border-white/20" />
                         <span className="text-xs font-medium text-slate-900">#0F172A (Slate)</span>
                      </div>
                   </SettingsField>
                   <SettingsField label="Page Format">
                      <SettingsSelect
                        options={[
                          { value: 'a4', label: 'A4 International' },
                          { value: 'letter', label: 'US Letter' }
                        ]}
                      />
                   </SettingsField>
                </div>

                <div className="bg-slate-50 rounded-lg p-6 border border-dashed border-slate-200 text-center">
                   <Printer className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                   <SettingsSectionHeader title="Live Template Synchronization" />
                   <p className="text-xs text-slate-500 mt-1 mb-4">Generate a sample {docType} with mock data to verify your branding and layout configurations.</p>
                   <button className="flex items-center gap-2 px-4 h-9 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200 transition-all mx-auto">
                      <Eye className="h-4 w-4" /> Preview Sample PDF
                   </button>
                </div>
             </div>
          </SettingsCard>
       </div>
    </div>
  );
}

// --- TAB 3: DOCUMENT RULES ---

function RulesTab() {
  return (
    <div className="space-y-4">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <SettingsCard key={card.title} icon={card.icon}>
               <SettingsSectionHeader title={card.title} />

               <div className="space-y-4">
                  {card.rules.map(rule => (
                    <div key={rule.label} className="flex items-center justify-between">
                       <span className="text-xs font-medium text-slate-700">{rule.label}</span>
                       {rule.val !== undefined ? (
                         <SettingsInput defaultValue={rule.val} className="w-16 text-center tabular-nums" />
                       ) : (
                         <SettingsToggle
                           checked={rule.checked}
                           onChange={() => {}}
                           disabled
                         />
                       )}
                    </div>
                  ))}
               </div>
            </SettingsCard>
          ))}
       </div>

       <SettingsSaveBar
         onSave={() => {}}
         isSaving={false}
         saveLabel="Commit System Rules"
       />
    </div>
  );
}
