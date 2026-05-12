// @ts-nocheck
import { useState, useEffect } from 'react';
import { Mail, MessageSquare, Bell, Settings, Send, Loader2, CheckCircle2, ChevronDown, Edit3, Eye, Check, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import client from '../../../api/client';
import { Modal, Drawer } from '../../../components/ui/Modal';
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

type Tab = 'email' | 'sms' | 'rules';

export default function NotificationSettings() {
  const [activeTab, setActiveTab] = useState<Tab>('email');

  return (
    <div className="p-5 space-y-4 animate-in fade-in duration-500">
      <div className="flex gap-1 p-1 bg-slate-100 rounded-lg w-fit mx-auto lg:mx-0">
        {[
          { id: 'email', label: 'Email', icon: Mail },
          { id: 'sms', label: 'SMS', icon: MessageSquare },
          { id: 'rules', label: 'Rules', icon: Bell },
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
    <div className="space-y-4">
       <SettingsAlert type="success" icon={CheckCircle2}>
          <SettingsSectionHeader 
            title="Email Gateway Online"
            description="System is correctly connected to smtp.gmail.com:587"
          />
       </SettingsAlert>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SettingsCard
            title="SMTP Configuration"
            description="Configure parameters for the outgoing mail server."
            icon={Settings}
          >
             <SettingsField label="SMTP Host">
                <SettingsInput defaultValue="smtp.gmail.com" />
             </SettingsField>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SettingsField label="Port">
                   <SettingsInput defaultValue={587} type="number" />
                </SettingsField>
                <SettingsField label="Encryption">
                   <SettingsSelect
                     options={[
                       { value: 'starttls', label: 'STARTTLS (TLS)' },
                       { value: 'ssl', label: 'SSL' },
                       { value: 'none', label: 'None' }
                     ]}
                   />
                </SettingsField>
             </div>
             <SettingsField label="Username / Account">
                <SettingsInput placeholder="notifications@africanholding.com" />
             </SettingsField>
             <SettingsField label="Gateway Password">
                <SettingsInput type="password" value="••••••••••••" />
             </SettingsField>

             <SettingsDivider />

             <div className="flex gap-3">
                <button
                  onClick={handleTest}
                  className="flex-1 flex items-center justify-center gap-2 px-4 h-9 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200 transition-all"
                >
                   {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                   Test Node
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-4 h-9 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600 transition-all">
                   Save Link
                </button>
             </div>
          </SettingsCard>

          <SettingsCard
            title="Identity & Branding"
            description="Configure how emails appear to organizational users."
            icon={Mail}
          >
             <SettingsField label="Global Sender Name">
                <SettingsInput defaultValue="African Holding Procurement" />
             </SettingsField>
             <SettingsField label="Reply-To Address">
                <SettingsInput defaultValue="noreply@africanholding.com" />
             </SettingsField>

             <SettingsDivider />

             <div className="space-y-4">
                <SettingsToggleRow
                  label="Admin Email Digest"
                  description="Send daily summary of pending approvals"
                  checked={true}
                  onChange={() => {}}
                />
                <SettingsToggleRow
                  label="Branded Header"
                  description="Include company logo in email templates"
                  checked={true}
                  onChange={() => {}}
                />
             </div>
          </SettingsCard>
       </div>
    </div>
  );
}

// --- TAB 2: SMS SETUP ---

function SmsTab() {
  return (
    <div className="max-w-4xl space-y-4">
       <SettingsCard
         title="Mobile Alert Gateway"
         description="Configure high-priority SMS notifications for critical approvals and security events."
         icon={MessageSquare}
       >
          <SettingsField label="Service Provider">
             <div className="grid grid-cols-3 gap-3">
                {['Twilio', 'EthioTelecom', 'Custom API'].map(p => (
                   <button key={p} className={`p-4 rounded-lg border-2 text-center transition-all ${p === 'Twilio' ? 'border-blue-500 bg-blue-50/30' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                      <p className="text-xs font-medium text-slate-900">{p}</p>
                      <p className="text-[9px] font-normal text-slate-400 uppercase mt-1">Integrated</p>
                   </button>
                ))}
             </div>
          </SettingsField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <SettingsField label="Account SID">
                <SettingsInput placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
             </SettingsField>
             <SettingsField label="Auth Token">
                <SettingsInput type="password" value="••••••••••••••••" />
             </SettingsField>
          </div>

          <SettingsDivider />

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
             <div className="flex items-center gap-3 bg-slate-100 rounded-lg p-2 pr-4 flex-1">
                <SettingsInput placeholder="Test number (+251...)" className="bg-transparent border-none px-4 py-2 text-xs font-medium text-slate-900 focus:ring-0" />
                <button className="px-4 h-9 bg-white text-slate-900 rounded-lg text-xs font-medium hover:bg-slate-50 transition-all">
                   Send Test SMS
                </button>
             </div>
             <button className="px-6 h-9 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600 transition-all">
                Authorize Gateway
             </button>
          </div>
       </SettingsCard>
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
    <div className="space-y-4">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <SettingsSectionHeader 
            title="Event Routing Logic"
            description="Define which organizational events trigger automated communication across channels."
          />
          <div className="flex items-center gap-4 px-4 h-9 bg-slate-100 rounded-lg">
             <div className="flex items-center gap-2"><Bell className="h-3.5 w-3.5 text-slate-400" /><span className="text-[9px] font-medium uppercase text-slate-500">In-App</span></div>
             <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-slate-400" /><span className="text-[9px] font-medium uppercase text-slate-500">Email</span></div>
             <div className="flex items-center gap-2"><Smartphone className="h-3.5 w-3.5 text-slate-400" /><span className="text-[9px] font-medium uppercase text-slate-500">SMS</span></div>
          </div>
       </div>

       <SettingsCard>
          <div className="divide-y divide-slate-100">
             {loading ? (
               <div className="py-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto opacity-10" /></div>
             ) : rules.map(rule => (
                <div key={rule.id} className="group transition-all hover:bg-slate-50/50">
                   <div className="flex items-center gap-6 px-5 py-4">
                      <div className="flex-1">
                         <p className="text-sm font-semibold text-slate-900">{rule.label}</p>
                         <p className="text-[10px] text-slate-400 font-normal leading-tight">{rule.description}</p>
                      </div>

                      <div className="flex items-center gap-6">
                         {['in_app', 'email', 'sms'].map(ch => (
                            <button
                              key={ch}
                              onClick={() => handleToggle(rule, ch)}
                              className={`h-9 w-9 rounded-lg flex items-center justify-center transition-all border ${rule[`${ch}_enabled`] ? 'bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-500/20' : 'bg-white border-slate-200 text-slate-300 hover:border-slate-300'}`}
                            >
                               {ch === 'in_app' ? <Bell className="h-4 w-4" /> : ch === 'email' ? <Mail className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
                            </button>
                         ))}
                      </div>

                      <button
                        onClick={() => setExpandedRow(expandedRow === rule.id ? null : rule.id)}
                        className={`p-2 rounded-lg transition-all ${expandedRow === rule.id ? 'bg-slate-900 text-white' : 'text-slate-300 hover:text-slate-900 hover:bg-slate-100'}`}
                      >
                         <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${expandedRow === rule.id ? 'rotate-180' : ''}`} />
                      </button>
                   </div>

                   {expandedRow === rule.id && (
                     <div className="px-5 pb-6 animate-in slide-in-from-top-4 duration-300">
                        <div className="bg-slate-50 rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-4">
                              <SettingsSectionHeader title="Subscriber Groups" />
                              <div className="grid grid-cols-2 gap-4">
                                 {['GM', 'Finance', 'Checker', 'Storekeeper'].map(role => (
                                    <label key={role} className="flex items-center gap-3 cursor-pointer">
                                       <div className="h-5 w-5 rounded-md border-2 border-slate-200 flex items-center justify-center bg-white transition-all peer-checked:bg-blue-500 peer-checked:border-blue-500">
                                          <Check className="h-3 w-3 text-slate-200" />
                                       </div>
                                       <span className="text-xs font-medium text-slate-600">{role}</span>
                                    </label>
                                 ))}
                              </div>
                              <div className="pt-2 space-y-4">
                                 <SettingsToggleRow
                                   label="Notify Requester"
                                   checked={true}
                                   onChange={() => {}}
                                 />
                                 <SettingsToggleRow
                                   label="Notify Next Approver"
                                   checked={true}
                                   onChange={() => {}}
                                 />
                              </div>
                           </div>

                           <div className="space-y-4 flex flex-col justify-center border-l border-slate-200 pl-6">
                              <SettingsSectionHeader title="Communication Logic" />
                              <button
                                onClick={() => setTemplateModal({ open: true, event: rule })}
                                className="w-full flex items-center justify-center gap-2 px-4 h-9 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200 transition-all"
                              >
                                 <Edit3 className="h-4 w-4 text-blue-500" />
                                 Customize Templates
                              </button>
                              <button className="w-full flex items-center justify-center gap-2 px-4 h-9 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200 transition-all">
                                 <Eye className="h-4 w-4 text-slate-400" />
                                 View Sample Payload
                              </button>
                           </div>
                        </div>
                     </div>
                   )}
                </div>
             ))}
          </div>
       </SettingsCard>

       <Modal
         isOpen={templateModal.open}
         onClose={() => setTemplateModal({ open: false, event: null })}
         title={`Template Customization: ${templateModal.event?.label}`}
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
             <SettingsField label="Email Subject Line">
                <SettingsInput {...register('email_subject_template')} />
             </SettingsField>
             <SettingsField label="Email Body Content">
                <SettingsTextarea rows={8} {...register('email_body_template')} />
             </SettingsField>
             <SettingsField label="SMS Message (160 Chars)">
                <SettingsTextarea rows={2} {...register('sms_template')} />
             </SettingsField>
          </div>

          <SettingsCard className="bg-slate-50 border-slate-100">
             <SettingsSectionHeader title="Variable Reference" />
             <div className="space-y-4">
                {[
                  { key: '{{requester_name}}', desc: 'Author name' },
                  { key: '{{document_number}}', desc: 'Serial (PR-001)' },
                  { key: '{{amount}}', desc: 'Formatted ETB' },
                  { key: '{{status}}', desc: 'Current state' },
                  { key: '{{action_url}}', desc: 'Direct Link' },
                ].map(v => (
                   <div key={v.key} className="p-3 bg-white rounded-lg border border-slate-200 group hover:border-blue-500 transition-all cursor-pointer">
                      <code className="text-[10px] font-medium text-blue-500 block mb-1">{v.key}</code>
                      <span className="text-[9px] font-normal text-slate-400 uppercase">{v.desc}</span>
                   </div>
                ))}
             </div>
          </SettingsCard>
       </div>

       <SettingsSaveBar
         onSave={handleSubmit(onSubmit)}
         isSaving={loading}
         onCancel={onClose}
         saveLabel="Save Templates"
       />
    </form>
  );
}
