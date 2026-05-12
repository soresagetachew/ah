import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Building2, Globe, Palette, Upload, Save, Loader2, Mail, Phone, Check, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSettingsStore } from '../../../store/settingsStore';
import { useTheme } from '../../../context/ThemeContext';
import client from '../../../api/client';
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

export default function GeneralSettings() {
  const { settings, bulkUpdateSettings, fetchSettings } = useSettingsStore();
  const { refreshTheme } = useTheme();
  const [savingLogo, setSavingLogo] = useState(false);
  const [savingCompany, setSavingCompany] = useState(false);
  const [savingLocalization, setSavingLocalization] = useState(false);
  const [savingAppearance, setSavingAppearance] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Flatten general category settings for the form
  const generalSettings = settings.general || [];
  const getVal = (key: string) => generalSettings.find((s: any) => s.key === key)?.value || '';

  const { register: regCompany, handleSubmit: handleCompany, formState: { isDirty: dirtyCompany } } = useForm({
    defaultValues: {
      company_name: getVal('company_name'),
      company_tin: getVal('company_tin'),
      company_phone: getVal('company_phone'),
      company_phone_secondary: getVal('company_phone_secondary'),
      company_address: getVal('company_address'),
      company_email: getVal('company_email'),
      fiscal_year_start: getVal('fiscal_year_start'),
      default_currency: getVal('default_currency'),
    }
  });

  const { register: regLoc, handleSubmit: handleLoc, watch: watchLoc } = useForm({
    defaultValues: {
      default_language: getVal('default_language') || 'en',
      timezone: getVal('timezone') || 'Africa/Addis_Ababa',
      date_format: getVal('date_format') || 'DD/MM/YYYY',
      number_format: getVal('number_format') || 'en',
      currency_position: getVal('currency_position') || 'prefix',
    }
  });

  const { register: regApp, handleSubmit: handleApp, watch: watchApp, setValue: setAppVal } = useForm({
    defaultValues: {
      sidebar_theme: getVal('sidebar_theme') || '#0F172A',
      items_per_page: getVal('items_per_page') || '20',
      show_logo_pdf: getVal('show_logo_pdf') === 'true',
      show_timestamps_pdf: getVal('show_timestamps_pdf') === 'true',
    }
  });

  const onSaveSection = async (data: any, setSaving: (v: boolean) => void) => {
    setSaving(true);
    try {
      const changes = Object.entries(data).map(([key, value]) => ({ key, value: String(value) }));
      await bulkUpdateSettings(changes);
      await fetchSettings();
      refreshTheme();
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const onLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File too large (max 2MB)');
      return;
    }

    const formData = new FormData();
    formData.append('logo', file);
    formData.append('logoType', 'brand_logo_url');

    setSavingLogo(true);
    try {
      const res = await client.post('/settings/logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Logo updated successfully');
      await fetchSettings();
      refreshTheme();
    } catch (e) {
      toast.error('Failed to upload logo');
    } finally {
      setSavingLogo(false);
    }
  };

  const themes = [
    { name: 'Midnight Navy', color: '#0F172A' },
    { name: 'Slate Gray', color: '#334155' },
    { name: 'Forest Green', color: '#064E3B' },
    { name: 'Deep Purple', color: '#3B0764' },
    { name: 'Crimson', color: '#7F1D1D' },
  ];

  const currentTheme = watchApp('sidebar_theme');

  return (
    <div className="p-5 space-y-4 animate-in fade-in duration-500">
      {/* CARD 1: COMPANY INFORMATION */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
               <Building2 className="h-5 w-5" />
            </div>
            <div>
               <SectionTitle>Company Information</SectionTitle>
               <HelperText>Basic details shown on all generated documents and PDFs</HelperText>
            </div>
          </div>
          {dirtyCompany && (
            <Badge variant="warning" className="animate-pulse">
               <AlertCircle className="h-3 w-3 mr-1" />
               Unsaved Changes
            </Badge>
          )}
        </div>

        <form onSubmit={handleCompany((data) => onSaveSection(data, setSavingCompany))} className="space-y-5">
           <div className="flex flex-col lg:flex-row gap-4">
              {/* Logo Section */}
              <div className="flex flex-col items-center gap-3 shrink-0">
                 <div className="relative group">
                    <div className="h-20 w-20 rounded-full bg-slate-100 border-4 border-white shadow-lg flex items-center justify-center text-slate-400 font-black text-xl overflow-hidden">
                       {getVal('brand_logo_url') ? (
                         <img src={getVal('brand_logo_url')} alt="Logo" className="w-full h-full object-cover" />
                       ) : (
                         getVal('company_name')?.substring(0, 2).toUpperCase() || 'AH'
                       )}
                       {savingLogo && (
                         <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center">
                            <Loader2 className="h-5 w-5 text-white animate-spin" />
                         </div>
                       )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 h-7 w-7 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-md border-2 border-white hover:scale-110 transition-transform active:scale-95"
                    >
                       <Upload className="h-3 w-3" />
                    </button>
                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={onLogoUpload} />
                 </div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Org Branding</p>
              </div>

              {/* Form Grid */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                 <FormGroup label="Company Name">
                    <Input {...regCompany('company_name', { required: true })} />
                 </FormGroup>
                 <FormGroup label="TIN Number">
                    <Input {...regCompany('company_tin', { required: true })} />
                 </FormGroup>
                 <FormGroup label="Primary Phone">
                    <div className="relative">
                       <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                       <Input {...regCompany('company_phone')} className="pl-10" />
                    </div>
                 </FormGroup>
                 <FormGroup label="Secondary Phone">
                    <Input {...regCompany('company_phone_secondary')} />
                 </FormGroup>
                 <FormGroup label="Company Address" className="sm:col-span-2">
                    <Textarea {...regCompany('company_address')} />
                 </FormGroup>
                 <FormGroup label="Company Email">
                    <div className="relative">
                       <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                       <Input type="email" {...regCompany('company_email')} className="pl-10" />
                    </div>
                 </FormGroup>
                 <FormGroup label="Fiscal Year Start" helper="Ethiopian fiscal year starts in July (Month 07)">
                    <Select {...regCompany('fiscal_year_start')}>
                       {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(m => (
                         <option key={m} value={m}>
                           {new Date(2025, parseInt(m)-1, 1).toLocaleString('default', { month: 'long' })} ({m})
                         </option>
                       ))}
                    </Select>
                 </FormGroup>
                 <FormGroup label="Default Currency">
                    <Select {...regCompany('default_currency')}>
                       <option value="ETB">ETB - Ethiopian Birr</option>
                       <option value="USD">USD - US Dollar</option>
                       <option value="EUR">EUR - Euro</option>
                    </Select>
                 </FormGroup>
              </div>
           </div>

           <Divider />

           <div className="flex justify-end">
              <Button
                type="submit"
                isLoading={savingCompany}
              >
                 {savingCompany ? <Loader2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                 Save Company Info
              </Button>
           </div>
        </form>
      </Card>

      {/* CARD 2: LOCALIZATION */}
      <Card>
        <div className="flex items-start gap-3 pb-4 border-b border-slate-100">
          <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
             <Globe className="h-5 w-5" />
          </div>
          <div>
             <SectionTitle>Localization & Display</SectionTitle>
             <HelperText>Language, timezone, and number formatting</HelperText>
          </div>
        </div>

        <form onSubmit={handleLoc((data) => onSaveSection(data, setSavingLocalization))} className="space-y-5">
           <FieldRow>
              <FormGroup label="Default Language">
                 <Select {...regLoc('default_language')}>
                    <option value="en">English (US)</option>
                    <option value="am">Amharic (Ethiopia)</option>
                 </Select>
              </FormGroup>
              <FormGroup label="System Timezone">
                 <Select {...regLoc('timezone')}>
                    <option value="Africa/Addis_Ababa">Africa/Addis_Ababa (UTC+3)</option>
                    <option value="UTC">UTC (Universal Coordinated Time)</option>
                    <option value="Europe/London">Europe/London (UTC+0)</option>
                 </Select>
              </FormGroup>
           </FieldRow>

           <SectionGroup title="Date Format Preference">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                 {['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'].map(fmt => (
                    <label key={fmt} className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all cursor-pointer ${watchLoc('date_format') === fmt ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                       <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-900">{fmt}</span>
                          <span className="text-xs font-normal text-slate-400">e.g., 15/03/2025</span>
                       </div>
                       <input type="radio" value={fmt} {...regLoc('date_format')} className="hidden" />
                       {watchLoc('date_format') === fmt && <Check className="h-4 w-4 text-blue-500" />}
                    </label>
                 ))}
              </div>
           </SectionGroup>

           <FieldRow>
              <SectionGroup title="Number Formatting">
                 <div className="space-y-2">
                    {[
                      { id: 'en', label: '1,000,000.00 (English)' },
                      { id: 'eu', label: '1.000.000,00 (European)' }
                    ].map(opt => (
                       <label key={opt.id} className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer group">
                          <input type="radio" value={opt.id} {...regLoc('number_format')} className="h-4 w-4 text-blue-500 border-slate-300" />
                          <span className="text-xs font-medium text-slate-700 group-hover:text-slate-900">{opt.label}</span>
                       </label>
                    ))}
                 </div>
              </SectionGroup>

              <SectionGroup title="Currency Symbol Position">
                 <div className="space-y-2">
                    {[
                      { id: 'prefix', label: 'ETB 1,000 (Prefix)' },
                      { id: 'suffix', label: '1,000 ETB (Suffix)' }
                    ].map(opt => (
                       <label key={opt.id} className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer group">
                          <input type="radio" value={opt.id} {...regLoc('currency_position')} className="h-4 w-4 text-blue-500 border-slate-300" />
                          <span className="text-xs font-medium text-slate-700 group-hover:text-slate-900">{opt.label}</span>
                       </label>
                    ))}
                 </div>
              </SectionGroup>
           </FieldRow>

           <Divider />

           <div className="flex justify-end">
              <Button
                type="submit"
                isLoading={savingLocalization}
              >
                 {savingLocalization ? <Loader2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                 Save Localization
              </Button>
           </div>
        </form>
      </Card>

      {/* CARD 3: APPEARANCE */}
      <Card>
        <div className="flex items-start gap-3 pb-4 border-b border-slate-100">
          <div className="h-10 w-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
             <Palette className="h-5 w-5" />
          </div>
          <div>
             <SectionTitle>System Appearance</SectionTitle>
             <HelperText>Customize how the system looks for all users</HelperText>
          </div>
        </div>

        <form onSubmit={handleApp((data) => onSaveSection(data, setSavingAppearance))} className="space-y-5">
           <SectionGroup title="Sidebar Color Theme">
              <div className="flex flex-wrap gap-3">
                 {themes.map(t => (
                    <button
                      key={t.color}
                      type="button"
                      onClick={() => setAppVal('sidebar_theme', t.color)}
                      title={t.name}
                      className={`h-10 w-10 rounded-full ring-offset-2 transition-all duration-300 ${currentTheme === t.color ? 'ring-2 ring-blue-500 scale-110 shadow-md' : 'hover:scale-105'}`}
                      style={{ backgroundColor: t.color }}
                    >
                       {currentTheme === t.color && <Check className="h-4 w-4 text-white mx-auto" />}
                    </button>
                 ))}
              </div>
           </SectionGroup>

           <FieldRow>
              <FormGroup label="Items Per Page" helper="Default number of rows shown in all tables">
                 <Select {...regApp('items_per_page')}>
                    <option value="10">10 Rows</option>
                    <option value="20">20 Rows (Default)</option>
                    <option value="50">50 Rows</option>
                    <option value="100">100 Rows</option>
                 </Select>
              </FormGroup>

              <SectionGroup title="PDF Export Preferences">
                 <div className="space-y-3">
                    <Toggle
                      checked={watchApp('show_logo_pdf')}
                      onChange={(checked) => setAppVal('show_logo_pdf', checked)}
                      label="Show Company Logo on PDF"
                    />
                    <Toggle
                      checked={watchApp('show_timestamps_pdf')}
                      onChange={(checked) => setAppVal('show_timestamps_pdf', checked)}
                      label="Show Approval Timestamps on PDF"
                    />
                 </div>
              </SectionGroup>
           </FieldRow>

           <Divider />

           <div className="flex justify-end">
              <Button
                type="submit"
                isLoading={savingAppearance}
              >
                 {savingAppearance ? <Loader2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                 Save Appearance
              </Button>
           </div>
        </form>
      </Card>
    </div>
  );
}
