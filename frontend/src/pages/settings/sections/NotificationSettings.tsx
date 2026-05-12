import { useState, useEffect } from 'react';
import { Mail, MessageSquare, Bell, Settings, Send, Save, Loader2, CheckCircle2, ChevronDown, Edit3, Eye, Check, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import client from '../../../api/client';
import { Modal, Drawer } from '../../../components/ui/Modal';
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
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium uppercase tracking-widest transition-all ${activeTab === t.id ? 'bg-white text-blue-500 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
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
       <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
             <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
             <SectionTitle className="text-sm">Email Gateway Online</SectionTitle>
             <HelperText className="text-emerald-600">System is correctly connected to smtp.gmail.com:587</HelperText>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
             <div className="flex items-start gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0"><Settings className="h-5 w-5" /></div>
                <div>
                   <SectionTitle>SMTP Configuration</SectionTitle>
                   <HelperText>Configure parameters for the outgoing mail server.</HelperText>
                </div>
             </div>

             <SectionGroup>
                <FormGroup label="SMTP Host">
                   <Input defaultValue="smtp.gmail.com" />
                </FormGroup>
                <FieldRow>
                   <FormGroup label="Port">
                      <Input defaultValue={587} type="number" />
                   </FormGroup>
                   <FormGroup label="Encryption">
                      <Select>
                         <option>STARTTLS (TLS)</option>
                         <option>SSL</option>
                         <option>None</option>
                      </Select>
                   </FormGroup>
                </FieldRow>
                <FormGroup label="Username / Account">
                   <Input placeholder="notifications@africanholding.com" />
                </FormGroup>
                <FormGroup label="Gateway Password">
                   <Input type="password" value="••••••••••••" />
                </FormGroup>
             </SectionGroup>

             <Divider />

             <div className="flex gap-3">
                <Button
                  onClick={handleTest}
                  isLoading={testing}
                  variant="secondary"
                  className="flex-1"
                >
                   {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                   Test Node
                </Button>
                <Button className="flex-1">
                   <Save className="h-4 w-4" /> Save Link
                </Button>
             </div>
          </Card>

          <Card>
             <div className="flex items-start gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center shrink-0"><Mail className="h-5 w-5" /></div>
                <div>
                   <SectionTitle>Identity & Branding</SectionTitle>
                   <HelperText>Configure how emails appear to organizational users.</HelperText>
                </div>
             </div>

             <SectionGroup>
                <FormGroup label="Global Sender Name">
                   <Input defaultValue="African Holding Procurement" />
                </FormGroup>
                <FormGroup label="Reply-To Address">
                   <Input defaultValue="noreply@africanholding.com" />
                </FormGroup>

                <Divider />

                <div className="space-y-4">
                   <label className="flex items-center justify-between group cursor-pointer">
                      <div className="flex flex-col">
                         <span className="text-sm font-semibold text-slate-900">Admin Email Digest</span>
                         <span className="text-xs text-slate-500">Send daily summary of pending approvals</span>
                      </div>
                      <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-500">
                         <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                      </div>
                   </label>
                   <label className="flex items-center justify-between group cursor-pointer">
                      <div className="flex flex-col">
                         <span className="text-sm font-semibold text-slate-900">Branded Header</span>
                         <span className="text-xs text-slate-500">Include company logo in email templates</span>
                      </div>
                      <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-500">
                         <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                      </div>
                   </label>
                </div>
             </SectionGroup>
          </Card>
       </div>
    </div>
  );
}

// --- TAB 2: SMS SETUP ---

function SmsTab() {
  return (
    <div className="max-w-4xl space-y-4">
       <Card>
          <div className="flex items-start gap-4 mb-4">
             <div className="h-14 w-14 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0 border border-indigo-100">
                <MessageSquare className="h-7 w-7" />
             </div>
             <div>
                <SectionTitle>Mobile Alert Gateway</SectionTitle>
                <HelperText>Configure high-priority SMS notifications for critical approvals and security events.</HelperText>
             </div>
          </div>

          <SectionGroup>
             <FormGroup label="Service Provider">
                <div className="grid grid-cols-3 gap-3">
                   {['Twilio', 'EthioTelecom', 'Custom API'].map(p => (
                      <button key={p} className={`p-4 rounded-lg border-2 text-center transition-all ${p === 'Twilio' ? 'border-blue-500 bg-blue-50/30' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                         <p className="text-xs font-medium text-slate-900">{p}</p>
                         <p className="text-[9px] font-normal text-slate-400 uppercase mt-1">Integrated</p>
                      </button>
                   ))}
                </div>
             </FormGroup>

             <FieldRow>
                <FormGroup label="Account SID">
                   <Input placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
                </FormGroup>
                <FormGroup label="Auth Token">
                   <Input type="password" value="••••••••••••••••" />
                </FormGroup>
             </FieldRow>
          </SectionGroup>

          <Divider />

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
             <div className="flex items-center gap-3 bg-slate-100 rounded-lg p-2 pr-4 flex-1">
                <Input placeholder="Test number (+251...)" className="bg-transparent border-none px-4 py-2 text-xs font-medium text-slate-900 focus:ring-0" />
                <Button variant="secondary" className="bg-white text-slate-900">
                   Send Test SMS
                </Button>
             </div>
             <Button>
                Authorize Gateway
             </Button>
          </div>
       </Card>
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
          <div className="space-y-1">
             <SectionTitle>Event Routing Logic</SectionTitle>
             <HelperText>Define which organizational events trigger automated communication across channels.</HelperText>
          </div>
          <div className="flex items-center gap-4 px-4 py-2 bg-slate-100 rounded-lg">
             <div className="flex items-center gap-2"><Bell className="h-3.5 w-3.5 text-slate-400" /><span className="text-[9px] font-medium uppercase text-slate-500">In-App</span></div>
             <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-slate-400" /><span className="text-[9px] font-medium uppercase text-slate-500">Email</span></div>
             <div className="flex items-center gap-2"><Smartphone className="h-3.5 w-3.5 text-slate-400" /><span className="text-[9px] font-medium uppercase text-slate-500">SMS</span></div>
          </div>
       </div>

       <Card className="overflow-hidden">
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
                              <FieldLabel>Subscriber Groups</FieldLabel>
                              <div className="grid grid-cols-2 gap-3">
                                 {['GM', 'Finance', 'Checker', 'Storekeeper'].map(role => (
                                    <label key={role} className="flex items-center gap-3 cursor-pointer">
                                       <div className="h-5 w-5 rounded-md border-2 border-slate-200 flex items-center justify-center bg-white transition-all peer-checked:bg-blue-500 peer-checked:border-blue-500">
                                          <Check className="h-3 w-3 text-slate-200" />
                                       </div>
                                       <span className="text-xs font-medium text-slate-600">{role}</span>
                                    </label>
                                 ))}
                              </div>
                              <div className="pt-2 space-y-2">
                                 <label className="flex items-center justify-between cursor-pointer">
                                    <span className="text-xs font-medium text-slate-700">Notify Requester</span>
                                    <div className="h-5 w-9 bg-emerald-500 rounded-full relative">
                                       <div className="absolute top-1 right-1 h-3 w-3 bg-white rounded-full" />
                                    </div>
                                 </label>
                                 <label className="flex items-center justify-between cursor-pointer">
                                    <span className="text-xs font-medium text-slate-700">Notify Next Approver</span>
                                    <div className="h-5 w-9 bg-emerald-500 rounded-full relative">
                                       <div className="absolute top-1 right-1 h-3 w-3 bg-white rounded-full" />
                                    </div>
                                 </label>
                              </div>
                           </div>

                           <div className="space-y-4 flex flex-col justify-center border-l border-slate-200 pl-6">
                              <FieldLabel>Communication Logic</FieldLabel>
                              <Button
                                onClick={() => setTemplateModal({ open: true, event: rule })}
                                variant="secondary"
                                className="w-full"
                              >
                                 <Edit3 className="h-4 w-4 text-blue-500" />
                                 Customize Templates
                              </Button>
                              <Button variant="secondary" className="w-full">
                                 <Eye className="h-4 w-4 text-slate-400" />
                                 View Sample Payload
                              </Button>
                           </div>
                        </div>
                     </div>
                   )}
                </div>
             ))}
          </div>
       </Card>

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
             <FormGroup label="Email Subject Line">
                <Input {...register('email_subject_template')} />
             </FormGroup>
             <FormGroup label="Email Body Content">
                <Textarea rows={8} {...register('email_body_template')} />
             </FormGroup>
             <FormGroup label="SMS Message (160 Chars)">
                <Textarea rows={2} {...register('sms_template')} />
             </FormGroup>
          </div>

          <Card className="bg-slate-50 border-slate-100">
             <FieldLabel>Variable Reference</FieldLabel>
             <div className="space-y-3">
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
          </Card>
       </div>

       <div className="flex justify-end gap-3">
          <Button type="button" onClick={onClose} variant="secondary" className="text-slate-500">
             Discard
          </Button>
          <Button
            type="submit"
            isLoading={loading}
          >
             {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
             Save Templates
          </Button>
       </div>
    </form>
  );
}
