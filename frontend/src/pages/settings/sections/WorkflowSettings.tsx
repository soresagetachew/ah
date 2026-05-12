// @ts-nocheck
import { useState, useEffect } from 'react';
import { GitMerge, PiggyBank, History, Plus, Trash2, GripVertical, AlertTriangle, Loader2, FileText, Package, CreditCard, Box, User, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import client from '../../../api/client';
import { Modal, Drawer } from '../../../components/ui/Modal';
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
  SettingsNumberInput,
} from '../../../components/settings/ui';

type Tab = 'chains' | 'thresholds' | 'escalation';
type DocType = 'PR' | 'GRN' | 'SIV' | 'PRF';

export default function WorkflowSettings() {
  const [activeTab, setActiveTab] = useState<Tab>('chains');

  return (
    <div className="p-5 space-y-4 animate-in fade-in duration-500">
      <div className="flex gap-1 p-1 bg-slate-100 rounded-lg w-fit mx-auto lg:mx-0">
        <button
          onClick={() => setActiveTab('chains')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium uppercase tracking-widest transition-all ${activeTab === 'chains' ? 'bg-white text-blue-500 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <GitMerge className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Approval Chains</span><span className="sm:hidden">Chains</span>
        </button>
        <button
          onClick={() => setActiveTab('thresholds')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium uppercase tracking-widest transition-all ${activeTab === 'thresholds' ? 'bg-white text-blue-500 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <PiggyBank className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Thresholds</span><span className="sm:hidden">Limits</span>
        </button>
        <button
          onClick={() => setActiveTab('escalation')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium uppercase tracking-widest transition-all ${activeTab === 'escalation' ? 'bg-white text-blue-500 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <History className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Escalation</span><span className="sm:hidden">Rules</span>
        </button>
      </div>

      {activeTab === 'chains' && <ChainsTab />}
      {activeTab === 'thresholds' && <ThresholdsTab />}
      {activeTab === 'escalation' && <EscalationTab />}
    </div>
  );
}

// --- TAB 1: APPROVAL CHAINS ---

function ChainsTab() {
  const [docType, setDocType] = useState<DocType>('PR');
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const res = await client.get(`/settings/workflows/rules?documentType=${docType}`);
      setRules(res.data);
    } catch (e) {
      toast.error('Failed to load rules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, [docType]);

  const docTypes: { id: DocType, label: string, icon: any }[] = [
    { id: 'PR', label: 'Purchase Requisition', icon: FileText },
    { id: 'GRN', label: 'Goods Receiving', icon: Package },
    { id: 'SIV', label: 'Store Voucher', icon: Box },
    { id: 'PRF', label: 'Payment Request', icon: CreditCard }
  ];

  const handleReorder = async (orderedIds: string[]) => {
    try {
      await client.put('/settings/workflows/rules/reorder', { documentType: docType, orderedIds });
      toast.success('Sequence updated');
      fetchRules();
    } catch (e) {
      toast.error('Reorder failed');
    }
  };

  // Simple drag-drop simulation
  const onDragStart = (id: string) => setDraggedId(id);
  const onDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedId === id) return;
    const overItemIdx = rules.findIndex(r => r.id === id);
    const draggedItemIdx = rules.findIndex(r => r.id === draggedId);
    
    const newRules = [...rules];
    const [draggedItem] = newRules.splice(draggedItemIdx, 1);
    newRules.splice(overItemIdx, 0, draggedItem);
    setRules(newRules);
  };
  const onDrop = () => {
    handleReorder(rules.map(r => r.id));
    setDraggedId(null);
  };

  return (
    <div className="space-y-4">
      {/* DOC SELECTOR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {docTypes.map(t => (
          <button
            key={t.id}
            onClick={() => setDocType(t.id)}
            className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center text-center gap-3 ${docType === t.id ? 'border-blue-500 bg-blue-50/30' : 'border-slate-200 bg-white hover:border-slate-300'}`}
          >
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${docType === t.id ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
               <t.icon className="h-5 w-5" />
            </div>
            <div>
               <p className="text-sm font-semibold text-slate-900">{t.label}</p>
               <span className="text-[10px] font-medium uppercase tracking-widest text-blue-500 mt-1 block">Active Workflow</span>
            </div>
          </button>
        ))}
      </div>

      {/* CHAIN BUILDER */}
      <SettingsCard
        title="Sequence of Authorization"
        description={`Configure the multi-step approval lifecycle for ${docType} documents.`}
      >
        <div className="flex items-center justify-between mb-5">
           <button className="flex items-center gap-2 px-4 h-9 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-all">
              <Plus className="h-4 w-4" /> Add Approval Step
           </button>
        </div>

        {loading ? (
          <div className="py-20 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto opacity-10" /></div>
        ) : (
          <div className="space-y-4">
            {rules.map((rule, idx) => (
              <div key={rule.id} className="relative">
                <div
                  draggable
                  onDragStart={() => onDragStart(rule.id)}
                  onDragOver={(e) => onDragOver(e, rule.id)}
                  onDrop={onDrop}
                  className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${draggedId === rule.id ? 'opacity-40 scale-95 border-blue-500 shadow-inner' : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md'}`}
                >
                   <div className="flex items-center gap-3">
                      <GripVertical className="h-5 w-5 text-slate-300 cursor-grab active:cursor-grabbing" />
                      <div className="h-10 w-10 rounded-lg bg-slate-900 text-white flex items-center justify-center font-semibold text-xs">
                         {idx + 1}
                      </div>
                   </div>
                   <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                         <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-1">Authorization Point</p>
                         <p className="text-sm font-semibold text-slate-900">{rule.rule_name}</p>
                      </div>
                      <div>
                         <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-1">Required Actor</p>
                         <div className="flex items-center gap-2">
                            <User className="h-3 w-3 text-blue-500" />
                            <span className="text-xs font-medium text-slate-700">{rule.required_role} ({rule.scope})</span>
                         </div>
                      </div>
                      <div>
                         <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-1">Escalation Policy</p>
                         <p className="text-xs text-slate-500 font-normal">After {rule.escalate_after_days} days → {rule.escalate_to_role || 'No escalation'}</p>
                      </div>
                   </div>
                   <div className="flex gap-2">
                      <button className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"><Plus className="h-4 w-4" /></button>
                      <button className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="h-4 w-4" /></button>
                   </div>
                </div>
                {idx < rules.length - 1 && (
                  <div className="h-8 flex justify-center py-1">
                     <div className="w-px h-full bg-slate-200" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <SettingsAlert type="info" icon={AlertTriangle}>
           Drag and drop steps to reorder the approval sequence. Any changes to the chain will only affect new documents created after the update.
        </SettingsAlert>
      </SettingsCard>
    </div>
  );
}

// --- TAB 2: AMOUNT THRESHOLDS ---

function ThresholdsTab() {
  const [docType, setDocType] = useState<DocType>('PR');
  const [thresholds, setThresholds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchThresholds = async () => {
    try {
      setLoading(true);
      const res = await client.get(`/settings/workflows/thresholds?documentType=${docType}`);
      setThresholds(res.data);
    } catch (e) {
      toast.error('Failed to load thresholds');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThresholds();
  }, [docType]);

  const handleUpdate = async (id: string, data: any) => {
    try {
      await client.put(`/settings/workflows/thresholds/${id}`, data);
      toast.success('Threshold policy updated');
      fetchThresholds();
    } catch (e) {
      toast.error('Failed to update policy');
    }
  };

  return (
    <div className="space-y-4">
      <SettingsSectionHeader 
        title="Financial Authorization Limits"
        description="Define how approval requirements scale based on transaction value."
      />

      <div className="flex gap-3 p-1 bg-slate-100 rounded-lg w-fit">
         {['PR', 'PRF'].map(t => (
           <button
             key={t}
             onClick={() => setDocType(t as DocType)}
             className={`px-4 h-9 rounded-lg text-xs font-medium uppercase tracking-widest transition-all ${docType === t ? 'bg-white text-blue-500 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
           >
              {t === 'PR' ? 'Purchase Request' : 'Payment Request'}
           </button>
         ))}
      </div>

      <SettingsCard>
         {loading ? (
           <div className="py-20 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto opacity-10" /></div>
         ) : (
           <>
             <div className="space-y-4">
                {thresholds.map(th => (
                  <div key={th.id} className="group flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-lg border border-slate-200 hover:bg-slate-50/50 transition-all">
                     <div className="flex-1 space-y-1">
                        <SettingsInput
                          defaultValue={th.label}
                          onBlur={(e) => handleUpdate(th.id, { label: e.target.value })}
                          className="bg-transparent border-none p-0 text-sm font-semibold text-slate-900 focus:ring-0"
                        />
                        <div className="flex items-center gap-2 text-xs font-normal text-slate-400">
                           <span className="tabular-nums">{Number(th.min_amount).toLocaleString()}</span>
                           <span>→</span>
                           <span className="tabular-nums">{th.max_amount ? Number(th.max_amount).toLocaleString() : '∞'}</span>
                           <span className="ml-1 uppercase tracking-widest text-[9px] font-medium text-slate-300">ETB Range</span>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4 shrink-0">
                        <SettingsField label="Min Steps">
                           <SettingsSelect
                             defaultValue={th.required_approvals}
                             onChange={(e) => handleUpdate(th.id, { required_approvals: parseInt(e.target.value) })}
                             options={[1,2,3,4,5].map(v => ({ value: String(v), label: `${v} Approvals` }))}
                           />
                        </SettingsField>
                        <SettingsField label="GM Required">
                           <button
                             onClick={() => handleUpdate(th.id, { requires_gm: !th.requires_gm })}
                             className={`h-9 w-full flex items-center justify-center rounded-lg border transition-all ${th.requires_gm ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-400'}`}
                           >
                              {th.requires_gm ? <Check className="h-4 w-4" /> : <div className="h-1 w-4 bg-slate-200 rounded-full" />}
                           </button>
                        </SettingsField>
                     </div>
                  </div>
                ))}
             </div>

             <SettingsDivider />

             <div>
                <SettingsSectionHeader title="Threshold Distribution" />
                <div className="flex h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                   {thresholds.map((th, i) => (
                     <div
                       key={th.id}
                       className={`h-full transition-all border-r border-white/20 ${['bg-blue-500', 'bg-emerald-500', 'bg-indigo-500', 'bg-amber-500'][i % 4]}`}
                       style={{ flex: th.max_amount ? (th.max_amount - th.min_amount) : 1000000 }}
                       title={th.label}
                     />
                   ))}
                </div>
                <div className="flex justify-between mt-2 px-1">
                   {thresholds.map(th => (
                     <span key={th.id} className="text-[9px] font-medium text-slate-400 uppercase tabular-nums">
                        {th.min_amount >= 1000 ? `${(th.min_amount/1000).toFixed(0)}k` : th.min_amount}
                     </span>
                   ))}
                   <span className="text-[9px] font-medium text-slate-400 uppercase">∞</span>
                </div>
             </div>
           </>
         )}
      </SettingsCard>
    </div>
  );
}

// --- TAB 3: ESCALATION RULES ---

function EscalationTab() {
  return (
    <div className="space-y-4 animate-in fade-in duration-500">
       <SettingsCard
         title="Global Escalation Policies"
         description="Automatic actions taken when documents remain in pending status for extended periods."
         icon={AlertTriangle}
       >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {[
               { title: 'Purchase Requisition', key: 'PR' },
               { title: 'Payment Request', key: 'PRF' }
             ].map(type => (
                <div key={type.key} className="p-4 rounded-lg border border-slate-200 bg-slate-50/30 space-y-4">
                   <SettingsSectionHeader title={`${type.title} Defaults`} />

                   <div className="space-y-4">
                      <SettingsField label="Auto-escalate after">
                         <SettingsNumberInput
                           value={3}
                           onChange={() => {}}
                           suffix="days"
                         />
                      </SettingsField>
                      <SettingsField label="Escalate to Role">
                         <SettingsSelect
                           options={[
                             { value: 'gm', label: 'General Manager' },
                             { value: 'finance', label: 'Finance Director' }
                           ]}
                         />
                      </SettingsField>
                      <SettingsDivider />
                      <SettingsToggleRow
                        label="Spam Prevention Lock"
                        description="Block users with >3 pending PRs"
                        checked={false}
                        onChange={() => {}}
                      />
                   </div>

                   <button className="w-full h-9 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200 transition-all">
                      Save {type.key} Policy
                   </button>
                </div>
             ))}
          </div>
       </SettingsCard>
    </div>
  );
}
