import { useState, useEffect, useMemo } from 'react';
import { 
  GitMerge, PiggyBank, History, Plus, 
  Trash2, ChevronRight, GripVertical, 
  AlertTriangle, Loader2, Save, FileText, 
  Package, CreditCard, Box, User, Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import client from '../../../api/client';
import { Modal, Drawer } from '../../../components/ui/Modal';

type Tab = 'chains' | 'thresholds' | 'escalation';
type DocType = 'PR' | 'GRN' | 'SIV' | 'PRF';

export default function WorkflowSettings() {
  const [activeTab, setActiveTab] = useState<Tab>('chains');

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl w-fit mx-auto lg:mx-0">
        <button 
          onClick={() => setActiveTab('chains')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'chains' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <GitMerge className="h-4 w-4" /> Approval Chains
        </button>
        <button 
          onClick={() => setActiveTab('thresholds')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'thresholds' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <PiggyBank className="h-4 w-4" /> Amount Thresholds
        </button>
        <button 
          onClick={() => setActiveTab('escalation')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'escalation' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <History className="h-4 w-4" /> Escalation Rules
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
    <div className="space-y-8">
      {/* DOC SELECTOR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {docTypes.map(t => (
          <button 
            key={t.id}
            onClick={() => setDocType(t.id)}
            className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center text-center gap-4 ${docType === t.id ? 'border-blue-500 bg-blue-50/30' : 'border-slate-100 bg-white hover:border-slate-200'}`}
          >
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${docType === t.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
               <t.icon className="h-6 w-6" />
            </div>
            <div>
               <p className="text-sm font-black text-slate-900 tracking-tight">{t.label}</p>
               <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 mt-1 block">Active Workflow</span>
            </div>
          </button>
        ))}
      </div>

      {/* CHAIN BUILDER */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10 lg:p-14 space-y-10 relative">
        <div className="flex items-center justify-between">
           <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Sequence of Authorization</h3>
              <p className="text-sm text-slate-500 mt-1">Configure the multi-step approval lifecycle for {docType} documents.</p>
           </div>
           <button className="flex items-center gap-2 px-6 py-3 bg-blue-50 text-blue-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all">
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
                  className={`flex items-center gap-6 p-6 rounded-3xl border transition-all ${draggedId === rule.id ? 'opacity-40 scale-95 border-blue-500 shadow-inner' : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-lg'}`}
                >
                   <div className="flex items-center gap-4">
                      <GripVertical className="h-5 w-5 text-slate-300 cursor-grab active:cursor-grabbing" />
                      <div className="h-10 w-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xs">
                         {idx + 1}
                      </div>
                   </div>
                   <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Authorization Point</p>
                         <p className="text-sm font-black text-slate-900">{rule.rule_name}</p>
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Required Actor</p>
                         <div className="flex items-center gap-2">
                            <User className="h-3 w-3 text-blue-500" />
                            <span className="text-xs font-bold text-slate-700">{rule.required_role} ({rule.scope})</span>
                         </div>
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Escalation Policy</p>
                         <p className="text-xs text-slate-500 font-medium">After {rule.escalate_after_days} days → {rule.escalate_to_role || 'No escalation'}</p>
                      </div>
                   </div>
                   <div className="flex gap-2">
                      <button className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Plus className="h-4 w-4" /></button>
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

        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex items-center gap-4">
           <AlertTriangle className="h-5 w-5 text-slate-400 shrink-0" />
           <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Drag and drop steps to reorder the approval sequence. Any changes to the chain will only affect new documents created after the update.
           </p>
        </div>
      </div>
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
    <div className="space-y-10">
      <div className="space-y-2">
        <h3 className="text-xl font-black text-slate-900 tracking-tight">Financial Authorization Limits</h3>
        <p className="text-sm text-slate-500">Define how approval requirements scale based on transaction value.</p>
      </div>

      <div className="flex gap-4 p-1 bg-slate-100 rounded-2xl w-fit">
         {['PR', 'PRF'].map(t => (
           <button 
             key={t}
             onClick={() => setDocType(t as DocType)}
             className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${docType === t ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
           >
              {t === 'PR' ? 'Purchase Request' : 'Payment Request'}
           </button>
         ))}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-10 lg:p-12 space-y-10">
         {loading ? (
           <div className="py-20 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto opacity-10" /></div>
         ) : (
           <>
             <div className="space-y-4">
                {thresholds.map(th => (
                  <div key={th.id} className="group flex flex-col md:flex-row md:items-center gap-8 p-6 rounded-[2rem] border border-slate-100 hover:bg-slate-50/50 transition-all">
                     <div className="flex-1 space-y-1">
                        <input 
                          defaultValue={th.label} 
                          onBlur={(e) => handleUpdate(th.id, { label: e.target.value })}
                          className="bg-transparent border-none p-0 text-sm font-black text-slate-900 focus:ring-0 w-full" 
                        />
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                           <span className="tabular-nums">{Number(th.min_amount).toLocaleString()}</span>
                           <span>→</span>
                           <span className="tabular-nums">{th.max_amount ? Number(th.max_amount).toLocaleString() : '∞'}</span>
                           <span className="ml-1 uppercase tracking-widest text-[9px] font-black text-slate-300">ETB Range</span>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-8 shrink-0">
                        <div className="space-y-1.5">
                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Min Steps</label>
                           <select 
                             defaultValue={th.required_approvals}
                             onChange={(e) => handleUpdate(th.id, { required_approvals: parseInt(e.target.value) })}
                             className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-black appearance-none"
                           >
                              {[1,2,3,4,5].map(v => <option key={v} value={v}>{v} Approvals</option>)}
                           </select>
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">GM Required</label>
                           <button 
                             onClick={() => handleUpdate(th.id, { requires_gm: !th.requires_gm })}
                             className={`flex items-center justify-center h-8 w-full rounded-xl border transition-all ${th.requires_gm ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}`}
                           >
                              {th.requires_gm ? <Check className="h-4 w-4" /> : <div className="h-1 w-4 bg-slate-200 rounded-full" />}
                           </button>
                        </div>
                     </div>
                  </div>
                ))}
             </div>

             {/* VISUAL CHART */}
             <div className="pt-10 border-t border-slate-50">
                <div className="flex items-center justify-between mb-4">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Threshold Distribution</h4>
                </div>
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
                <div className="flex justify-between mt-3 px-1">
                   {thresholds.map(th => (
                     <span key={th.id} className="text-[9px] font-black text-slate-400 uppercase tabular-nums">
                        {th.min_amount >= 1000 ? `${(th.min_amount/1000).toFixed(0)}k` : th.min_amount}
                     </span>
                   ))}
                   <span className="text-[9px] font-black text-slate-400 uppercase">∞</span>
                </div>
             </div>
           </>
         )}
      </div>
    </div>
  );
}

// --- TAB 3: ESCALATION RULES ---

function EscalationTab() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
       <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 lg:p-14 space-y-10">
          <div className="flex items-start gap-6">
             <div className="h-14 w-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                <AlertTriangle className="h-7 w-7" />
             </div>
             <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Global Escalation Policies</h3>
                <p className="text-sm text-slate-500 mt-1">Automatic actions taken when documents remain in pending status for extended periods.</p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {[
               { title: 'Purchase Requisition', key: 'PR' },
               { title: 'Payment Request', key: 'PRF' }
             ].map(type => (
                <div key={type.key} className="p-8 rounded-[2rem] border border-slate-100 bg-slate-50/30 space-y-8">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{type.title} Defaults</h4>
                   
                   <div className="space-y-4">
                      <div className="space-y-1.5">
                         <label className="text-xs font-bold text-slate-700 ml-1">Auto-escalate after</label>
                         <div className="flex items-center gap-3">
                            <input type="number" defaultValue={3} className="w-24 px-4 py-3 rounded-xl border border-slate-200 font-bold text-slate-900" />
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Days</span>
                         </div>
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-xs font-bold text-slate-700 ml-1">Escalate to Role</label>
                         <select className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 appearance-none">
                            <option>General Manager</option>
                            <option>Finance Director</option>
                         </select>
                      </div>
                      <div className="pt-4 border-t border-slate-100">
                         <label className="flex items-center justify-between cursor-pointer group">
                            <div className="flex flex-col">
                               <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900">Spam Prevention Lock</span>
                               <span className="text-[9px] text-slate-400">Block users with {'>'}3 pending PRs</span>
                            </div>
                            <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200">
                               <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
                            </div>
                         </label>
                      </div>
                   </div>
                   
                   <button className="w-full py-3 bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-900 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
                      Save {type.key} Policy
                   </button>
                </div>
             ))}
          </div>
       </div>
    </div>
  );
}
