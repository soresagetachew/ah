import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Building2, Globe, Palette, Upload, 
  Save, Loader2, Mail, Phone, MapPin, 
  Check, AlertCircle, Shield
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useSettingsStore } from '../../../store/settingsStore';
import client from '../../../api/client';

export default function GeneralSettings() {
  const { settings, bulkUpdateSettings } = useSettingsStore();
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

    setSavingLogo(true);
    try {
      const res = await client.post('/settings/logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Logo updated successfully');
      // Re-fetch settings handled by store normally, or manually here
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
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* CARD 1: COMPANY INFORMATION */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 lg:p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
               <Building2 className="h-6 w-6" />
            </div>
            <div>
               <h3 className="text-xl font-black text-slate-900 tracking-tight">Company Information</h3>
               <p className="text-sm text-slate-500 mt-1">Basic details shown on all generated documents and PDFs</p>
            </div>
          </div>
          {dirtyCompany && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-full border border-amber-100 animate-pulse">
               <AlertCircle className="h-3 w-3" />
               <span className="text-[10px] font-black uppercase tracking-widest">Unsaved Changes</span>
            </div>
          )}
        </div>

        <form onSubmit={handleCompany((data) => onSaveSection(data, setSavingCompany))} className="p-8 lg:p-10 space-y-8">
           <div className="flex flex-col lg:flex-row gap-12">
              {/* Logo Section */}
              <div className="flex flex-col items-center gap-4 shrink-0">
                 <div className="relative group">
                    <div className="h-24 w-24 rounded-full bg-slate-100 border-4 border-white shadow-xl flex items-center justify-center text-slate-400 font-black text-2xl overflow-hidden ring-1 ring-slate-100">
                       {getVal('company_logo') ? (
                         <img src={getVal('company_logo')} alt="Logo" className="w-full h-full object-cover" />
                       ) : (
                         getVal('company_name')?.substring(0, 2).toUpperCase() || 'AH'
                       )}
                       {savingLogo && (
                         <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center">
                            <Loader2 className="h-6 w-6 text-white animate-spin" />
                         </div>
                       )}
                    </div>
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 h-8 w-8 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:scale-110 transition-transform active:scale-95"
                    >
                       <Upload className="h-3.5 w-3.5" />
                    </button>
                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={onLogoUpload} />
                 </div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Org Branding</p>
              </div>

              {/* Form Grid */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Company Name</label>
                    <input {...regCompany('company_name', { required: true })} className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900" />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">TIN Number</label>
                    <input {...regCompany('company_tin', { required: true })} className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900" />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Primary Phone</label>
                    <div className="relative">
                       <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                       <input {...regCompany('company_phone')} className="w-full pl-12 pr-5 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900" />
                    </div>
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secondary Phone</label>
                    <input {...regCompany('company_phone_secondary')} className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900" />
                 </div>
                 <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Company Address</label>
                    <textarea rows={3} {...regCompany('company_address')} className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900 resize-none" />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Company Email</label>
                    <div className="relative">
                       <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                       <input type="email" {...regCompany('company_email')} className="w-full pl-12 pr-5 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900" />
                    </div>
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fiscal Year Start</label>
                    <select {...regCompany('fiscal_year_start')} className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900 appearance-none">
                       {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(m => (
                         <option key={m} value={m}>
                           {new Date(2025, parseInt(m)-1, 1).toLocaleString('default', { month: 'long' })} ({m})
                         </option>
                       ))}
                    </select>
                    <p className="text-[9px] text-slate-400 ml-1 italic font-medium">Ethiopian fiscal year starts in July (Month 07)</p>
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Default Currency</label>
                    <select {...regCompany('default_currency')} className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900 appearance-none">
                       <option value="ETB">ETB - Ethiopian Birr</option>
                       <option value="USD">USD - US Dollar</option>
                       <option value="EUR">EUR - Euro</option>
                    </select>
                 </div>
              </div>
           </div>

           <div className="pt-8 border-t border-slate-50 flex justify-end">
              <button 
                type="submit" 
                disabled={savingCompany}
                className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                 {savingCompany ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                 Save Company Info
              </button>
           </div>
        </form>
      </div>

      {/* CARD 2: LOCALIZATION */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 lg:p-10 border-b border-slate-50">
          <div className="flex items-start gap-5">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
               <Globe className="h-6 w-6" />
            </div>
            <div>
               <h3 className="text-xl font-black text-slate-900 tracking-tight">Localization & Display</h3>
               <p className="text-sm text-slate-500 mt-1">Language, timezone, and number formatting</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleLoc((data) => onSaveSection(data, setSavingLocalization))} className="p-8 lg:p-10 space-y-10">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Default Language</label>
                 <select {...regLoc('default_language')} className="w-full px-5 py-3 rounded-2xl border border-slate-200 bg-white font-bold text-slate-900">
                    <option value="en">English (US)</option>
                    <option value="am">Amharic (Ethiopia)</option>
                 </select>
              </div>
              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">System Timezone</label>
                 <select {...regLoc('timezone')} className="w-full px-5 py-3 rounded-2xl border border-slate-200 bg-white font-bold text-slate-900">
                    <option value="Africa/Addis_Ababa">Africa/Addis_Ababa (UTC+3)</option>
                    <option value="UTC">UTC (Universal Coordinated Time)</option>
                    <option value="Europe/London">Europe/London (UTC+0)</option>
                 </select>
              </div>

              <div className="md:col-span-2 space-y-4">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date Format Preference</label>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'].map(fmt => (
                       <label key={fmt} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${watchLoc('date_format') === fmt ? 'border-blue-500 bg-blue-50/30' : 'border-slate-100 hover:border-slate-200'}`}>
                          <div className="flex flex-col">
                             <span className="text-sm font-black text-slate-900">{fmt}</span>
                             <span className="text-[10px] font-medium text-slate-500">e.g., 15/03/2025</span>
                          </div>
                          <input type="radio" value={fmt} {...regLoc('date_format')} className="hidden" />
                          {watchLoc('date_format') === fmt && <Check className="h-4 w-4 text-blue-600" />}
                       </label>
                    ))}
                 </div>
              </div>

              <div className="space-y-4">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Number Formatting</label>
                 <div className="space-y-3">
                    {[
                      { id: 'en', label: '1,000,000.00 (English)' },
                      { id: 'eu', label: '1.000.000,00 (European)' }
                    ].map(opt => (
                       <label key={opt.id} className="flex items-center gap-3 p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all cursor-pointer group">
                          <input type="radio" value={opt.id} {...regLoc('number_format')} className="h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-500" />
                          <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900">{opt.label}</span>
                       </label>
                    ))}
                 </div>
              </div>

              <div className="space-y-4">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Currency Symbol Position</label>
                 <div className="space-y-3">
                    {[
                      { id: 'prefix', label: 'ETB 1,000 (Prefix)' },
                      { id: 'suffix', label: '1,000 ETB (Suffix)' }
                    ].map(opt => (
                       <label key={opt.id} className="flex items-center gap-3 p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all cursor-pointer group">
                          <input type="radio" value={opt.id} {...regLoc('currency_position')} className="h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-500" />
                          <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900">{opt.label}</span>
                       </label>
                    ))}
                 </div>
              </div>
           </div>

           <div className="pt-8 border-t border-slate-50 flex justify-end">
              <button 
                type="submit" 
                disabled={savingLocalization}
                className="flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                 {savingLocalization ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                 Save Localization
              </button>
           </div>
        </form>
      </div>

      {/* CARD 3: APPEARANCE */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 lg:p-10 border-b border-slate-50">
          <div className="flex items-start gap-5">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
               <Palette className="h-6 w-6" />
            </div>
            <div>
               <h3 className="text-xl font-black text-slate-900 tracking-tight">System Appearance</h3>
               <p className="text-sm text-slate-500 mt-1">Customize how the system looks for all users</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleApp((data) => onSaveSection(data, setSavingAppearance))} className="p-8 lg:p-10 space-y-10">
           <div className="space-y-6">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sidebar Color Theme</label>
              <div className="flex flex-wrap gap-4">
                 {themes.map(t => (
                    <button
                      key={t.color}
                      type="button"
                      onClick={() => setAppVal('sidebar_theme', t.color)}
                      title={t.name}
                      className={`h-12 w-12 rounded-full ring-offset-4 transition-all duration-300 ${currentTheme === t.color ? 'ring-2 ring-blue-500 scale-110 shadow-lg' : 'hover:scale-105'}`}
                      style={{ backgroundColor: t.color }}
                    >
                       {currentTheme === t.color && <Check className="h-5 w-5 text-white mx-auto" />}
                    </button>
                 ))}
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Items Per Page</label>
                 <select {...regApp('items_per_page')} className="w-full px-5 py-3 rounded-2xl border border-slate-200 bg-white font-bold text-slate-900 appearance-none">
                    <option value="10">10 Rows</option>
                    <option value="20">20 Rows (Default)</option>
                    <option value="50">50 Rows</option>
                    <option value="100">100 Rows</option>
                 </select>
                 <p className="text-[9px] text-slate-400 ml-1 italic font-medium">Default number of rows shown in all tables</p>
              </div>

              <div className="space-y-6">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">PDF Export Preferences</label>
                 <div className="space-y-4">
                    <label className="flex items-center justify-between group cursor-pointer">
                       <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900">Show Company Logo on PDF</span>
                       <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${watchApp('show_logo_pdf') ? 'bg-blue-600' : 'bg-slate-200'}`}>
                          <input type="checkbox" {...regApp('show_logo_pdf')} className="hidden" />
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${watchApp('show_logo_pdf') ? 'translate-x-6' : 'translate-x-1'}`} />
                       </div>
                    </label>
                    <label className="flex items-center justify-between group cursor-pointer">
                       <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900">Show Approval Timestamps on PDF</span>
                       <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${watchApp('show_timestamps_pdf') ? 'bg-blue-600' : 'bg-slate-200'}`}>
                          <input type="checkbox" {...regApp('show_timestamps_pdf')} className="hidden" />
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${watchApp('show_timestamps_pdf') ? 'translate-x-6' : 'translate-x-1'}`} />
                       </div>
                    </label>
                 </div>
              </div>
           </div>

           <div className="pt-8 border-t border-slate-50 flex justify-end">
              <button 
                type="submit" 
                disabled={savingAppearance}
                className="flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                 {savingAppearance ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                 Save Appearance
              </button>
           </div>
        </form>
      </div>
    </div>
  );
}
