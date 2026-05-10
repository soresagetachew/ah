import { useState, useEffect, useMemo } from 'react';
import { 
  Mail, MessageSquare, Bell, Settings, 
  Send, Save, Loader2, AlertTriangle, 
  CheckCircle2, XCircle, ChevronDown, 
  Edit3, Eye, Plus, Trash2, ShieldCheck,
  Check, X, Globe, Smartphone, Monitor
} from 'lucide-react';
import toast from 'react-hot-toast';
import client from '../../../api/client';
import { Modal, Drawer } from '../../../components/ui/Modal';
import { useForm } from 'react-hook-form';

type Tab = 'email' | 'sms' | 'rules';

export default function NotificationSettings() {
  const [activeTab, setActiveTab] = useState<Tab>('email');

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl w-fit mx-auto lg:mx-0">
        {[
          { id: 'email', label: 'Email Setup', icon: Mail },
          { id: 'sms', label: 'SMS Setup', icon: MessageSquare },
          { id: 'rules', label: 'Notification Rules', icon: Bell },
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

      {activeTab === 'email' && <EmailTab />}
      {activeTab === 'sms' && <SmsTab />}
      {activeTab === 'rules' && <RulesTab />}
    </div>
  );
}

// --- TAB 1: EMAIL SETUP ---

function EmailTab() {
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);

  const handleTest = async () => {
    setTesting(true);
    try {
      await client.post('/settings/notifications/test-smtp');
      toast.success('Test email dispatched!');
    } catch (e) { toast.error('Connection failed'); }
    finally { setTesting(false); }
  };

  return (
    <div className="space-y-10">
       <div className="bg-emerald-50 border border-emerald-100 rounded-[2rem] p-6 flex items-center gap-6">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
             <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
             <h4 className="text-sm font-black text-slate-900">Email Gateway Online</h4>
             <p className="text-xs text-emerald-700 font-medium">System is correctly connected to smtp.gmail.com:587</p>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 lg:p-12 space-y-10">
             <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><Settings className="h-5 w-5" /></div>
                <div>
                   <h3 className="text-lg font-black text-slate-900 tracking-tight">SMTP Configuration</h3>
                   <p className="text-xs text-slate-500 mt-1">Configure parameters for the outgoing mail server.</p>
                </div>
             </div>

             <div className="space-y-6">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SMTP Host</label>
                   <input defaultValue="smtp.gmail.com" className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 font-bold text-slate-900" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Port</label>
                      <input defaultValue={587} className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 font-bold text-slate-900" />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Encryption</label>
                      <select className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 bg-white font-bold text-slate-900 appearance-none">
                         <option>STARTTLS (TLS)</option>
                         <option>SSL</option>
                         <option>None</option>
                      </select>
                   </div>
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username / Account</label>
                   <input placeholder="notifications@africanholding.com" className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 font-bold text-slate-900" />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gateway Password</label>
                   <input type="password" value="••••••••••••" className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 font-bold text-slate-900" />
                </div>
             </div>

             <div className="pt-6 border-t border-slate-50 flex gap-4">
                <button 
                  onClick={handleTest}
                  disabled={testing}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all disabled:opacity-50"
                >
                   {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                   Test Node
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all">
                   <Save className="h-4 w-4" /> Save Link
                </button>
             </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 lg:p-12 space-y-10">
             <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0"><Mail className="h-5 w-5" /></div>
                <div>
                   <h3 className="text-lg font-black text-slate-900 tracking-tight">Identity & Branding</h3>
                   <p className="text-xs text-slate-500 mt-1">Configure how emails appear to organizational users.</p>
                </div>
             </div>

             <div className="space-y-8">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Global Sender Name</label>
                   <input defaultValue="African Holding Procurement" className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 font-bold text-slate-900" />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reply-To Address</label>
                   <input defaultValue="noreply@africanholding.com" className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 font-bold text-slate-900" />
                </div>
                
                <div className="pt-6 border-t border-slate-50 space-y-6">
                   <label className="flex items-center justify-between group cursor-pointer">
                      <div className="flex flex-col">
                         <span className="text-sm font-black text-slate-900">Admin Email Digest</span>
                         <span className="text-[10px] text-slate-500">Send daily summary of pending approvals</span>
                      </div>
                      <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                         <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                      </div>
                   </label>
                   <label className="flex items-center justify-between group cursor-pointer">
                      <div className="flex flex-col">
                         <span className="text-sm font-black text-slate-900">Branded Header</span>
                         <span className="text-[10px] text-slate-500">Include company logo in email templates</span>
                      </div>
                      <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                         <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                      </div>
                   </label>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}

// --- TAB 2: SMS SETUP ---

function SmsTab() {
  return (
    <div className="max-w-4xl space-y-10">
       <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 lg:p-14 space-y-12">
          <div className="flex items-start gap-6">
             <div className="h-14 w-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                <MessageSquare className="h-7 w-7" />
             </div>
             <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Mobile Alert Gateway</h3>
                <p className="text-sm text-slate-500 mt-1">Configure high-priority SMS notifications for critical approvals and security events.</p>
             </div>
          </div>

          <div className="space-y-8">
             <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Service Provider</label>
                <div className="grid grid-cols-3 gap-4">
                   {['Twilio', 'EthioTelecom', 'Custom API'].map(p => (
                      <button key={p} className={`p-6 rounded-[2rem] border-2 text-center transition-all ${p === 'Twilio' ? 'border-blue-500 bg-blue-50/30' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                         <p className="text-xs font-black text-slate-900">{p}</p>
                         <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Integrated</p>
                      </button>
                   ))}
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account SID</label>
                   <input placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" className="w-full px-5 py-4 rounded-2xl border border-slate-200 font-bold text-slate-900" />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Auth Token</label>
                   <input type="password" value="••••••••••••••••" className="w-full px-5 py-4 rounded-2xl border border-slate-200 font-bold text-slate-900" />
                </div>
             </div>
          </div>

          <div className="pt-10 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-8">
             <div className="flex items-center gap-4 bg-slate-100 rounded-2xl p-2 pr-6">
                <input placeholder="Test number (+251...)" className="bg-transparent border-none px-4 py-2 text-xs font-bold text-slate-900 focus:ring-0 w-48" />
                <button className="flex items-center gap-2 px-4 py-2 bg-white text-[10px] font-black uppercase tracking-widest text-slate-900 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                   Send Test SMS
                </button>
             </div>
             <button className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all">
                Authorize Gateway
             </button>
          </div>
       </div>
    </div>
  );
}

// --- TAB 3: NOTIFICATION RULES ---

function RulesTab() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [templateModal, setTemplateModal] = useState<{ open: boolean, event: any }>({ open: false, event: null });

  const fetchRules = async () => {
    try {
      setLoading(true);
      const res = await client.get('/settings/notifications/rules');
      setRules(res.data);
    } catch (e) { toast.error('Failed to load rules'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRules(); }, []);

  const handleToggle = async (rule: any, channel: string) => {
    const updated = { ...rule, [`${channel}_enabled`]: !rule[`${channel}_enabled`] };
    try {
      await client.put('/settings/notifications/rules', updated);
      toast.success('Routing policy updated');
      fetchRules();
    } catch (e) { toast.error('Failed to update'); }
  };

  return (
    <div className="space-y-10">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
             <h3 className="text-xl font-black text-slate-900 tracking-tight">Event Routing Logic</h3>
             <p className="text-sm text-slate-500">Define which organizational events trigger automated communication across channels.</p>
          </div>
          <div className="flex items-center gap-6 px-6 py-2 bg-slate-100 rounded-2xl">
             <div className="flex items-center gap-2"><Bell className="h-3.5 w-3.5 text-slate-400" /><span className="text-[9px] font-black uppercase text-slate-500">In-App</span></div>
             <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-slate-400" /><span className="text-[9px] font-black uppercase text-slate-500">Email</span></div>
             <div className="flex items-center gap-2"><Smartphone className="h-3.5 w-3.5 text-slate-400" /><span className="text-[9px] font-black uppercase text-slate-500">SMS</span></div>
          </div>
       </div>

       <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
             {loading ? (
               <div className="py-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto opacity-10" /></div>
             ) : rules.map(rule => (
                <div key={rule.id} className="group transition-all hover:bg-slate-50/50">
                   <div className="flex items-center gap-8 px-10 py-6">
                      <div className="flex-1">
                         <p className="text-sm font-black text-slate-900">{rule.label}</p>
                         <p className="text-[10px] text-slate-400 font-bold leading-tight">{rule.description}</p>
                      </div>
                      
                      <div className="flex items-center gap-10">
                         {['in_app', 'email', 'sms'].map(ch => (
                            <button 
                              key={ch}
                              onClick={() => handleToggle(rule, ch)}
                              className={`h-9 w-9 rounded-xl flex items-center justify-center transition-all border ${rule[`${ch}_enabled`] ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white border-slate-200 text-slate-300 hover:border-slate-300'}`}
                            >
                               {ch === 'in_app' ? <Bell className="h-4 w-4" /> : ch === 'email' ? <Mail className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
                            </button>
                         ))}
                      </div>

                      <button 
                        onClick={() => setExpandedRow(expandedRow === rule.id ? null : rule.id)}
                        className={`p-2 rounded-xl transition-all ${expandedRow === rule.id ? 'bg-slate-900 text-white' : 'text-slate-300 hover:text-slate-900 hover:bg-slate-100'}`}
                      >
                         <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${expandedRow === rule.id ? 'rotate-180' : ''}`} />
                      </button>
                   </div>

                   {expandedRow === rule.id && (
                     <div className="px-10 pb-8 animate-in slide-in-from-top-4 duration-300">
                        <div className="bg-slate-50 rounded-[2rem] p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                           <div className="space-y-6">
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subscriber Groups</h4>
                              <div className="grid grid-cols-2 gap-4">
                                 {['GM', 'Finance', 'Checker', 'Storekeeper'].map(role => (
                                    <label key={role} className="flex items-center gap-3 cursor-pointer">
                                       <div className="h-5 w-5 rounded-md border-2 border-slate-200 flex items-center justify-center bg-white transition-all peer-checked:bg-blue-600 peer-checked:border-blue-600">
                                          <Check className="h-3 w-3 text-slate-200" />
                                       </div>
                                       <span className="text-xs font-bold text-slate-600">{role}</span>
                                    </label>
                                 ))}
                              </div>
                              <div className="pt-4 space-y-3">
                                 <label className="flex items-center justify-between cursor-pointer">
                                    <span className="text-xs font-bold text-slate-700">Notify Requester</span>
                                    <div className="h-5 w-9 bg-emerald-500 rounded-full relative">
                                       <div className="absolute top-1 right-1 h-3 w-3 bg-white rounded-full" />
                                    </div>
                                 </label>
                                 <label className="flex items-center justify-between cursor-pointer">
                                    <span className="text-xs font-bold text-slate-700">Notify Next Approver</span>
                                    <div className="h-5 w-9 bg-emerald-500 rounded-full relative">
                                       <div className="absolute top-1 right-1 h-3 w-3 bg-white rounded-full" />
                                    </div>
                                 </label>
                              </div>
                           </div>

                           <div className="space-y-6 flex flex-col justify-center border-l border-slate-200 pl-10">
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Communication Logic</h4>
                              <button 
                                onClick={() => setTemplateModal({ open: true, event: rule })}
                                className="flex items-center justify-center gap-3 w-full py-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-100 transition-all shadow-sm"
                              >
                                 <Edit3 className="h-4 w-4 text-blue-600" />
                                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Customize Templates</span>
                              </button>
                              <button className="flex items-center justify-center gap-3 w-full py-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-100 transition-all shadow-sm">
                                 <Eye className="h-4 w-4 text-slate-400" />
                                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">View Sample Payload</span>
                              </button>
                           </div>
                        </div>
                     </div>
                   )}
                </div>
             ))}
          </div>
       </div>

       <Modal 
         isOpen={templateModal.open} 
         onClose={() => setTemplateModal({ open: false, event: null })} 
         title={`Template Customization: ${templateModal.event?.label}`}
         maxWidth="max-w-4xl"
       >
          <TemplateEditor eventType={templateModal.event?.event_type} onClose={() => setTemplateModal({ open: false, event: null })} />
       </Modal>
    </div>
  );
}

function TemplateEditor({ eventType, onClose }: any) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await client.put(`/settings/notifications/templates/${eventType}`, data);
      toast.success('Templates synchronized');
      onClose();
    } catch (e) { toast.error('Failed to save templates'); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Subject Line</label>
                <input {...register('email_subject_template')} className="w-full px-5 py-4 rounded-2xl border border-slate-200 font-bold text-slate-900" />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Body Content</label>
                <textarea rows={8} {...register('email_body_template')} className="w-full px-5 py-4 rounded-2xl border border-slate-200 font-bold text-slate-900 resize-none" />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SMS Message (160 Chars)</label>
                <textarea rows={2} {...register('sms_template')} className="w-full px-5 py-4 rounded-2xl border border-slate-200 font-bold text-slate-900 resize-none" />
             </div>
          </div>

          <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Variable Reference</h4>
             <div className="space-y-4">
                {[
                  { key: '{{requester_name}}', desc: 'Author name' },
                  { key: '{{document_number}}', desc: 'Serial (PR-001)' },
                  { key: '{{amount}}', desc: 'Formatted ETB' },
                  { key: '{{status}}', desc: 'Current state' },
                  { key: '{{action_url}}', desc: 'Direct Link' },
                ].map(v => (
                   <div key={v.key} className="p-3 bg-white rounded-xl border border-slate-200 group hover:border-blue-500 transition-all cursor-pointer">
                      <code className="text-[10px] font-black text-blue-600 block mb-1">{v.key}</code>
                      <span className="text-[9px] text-slate-400 font-bold uppercase">{v.desc}</span>
                   </div>
                ))}
             </div>
          </div>
       </div>

       <div className="flex justify-end gap-4">
          <button type="button" onClick={onClose} className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Discard</button>
          <button 
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all"
          >
             {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
             Save Templates
          </button>
       </div>
    </form>
  );
}
