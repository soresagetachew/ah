// @ts-nocheck
import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Building2, Globe, Palette, Upload, Phone, Mail, Check, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSettingsStore } from '../../../store/settingsStore';
import { useTheme } from '../../../context/ThemeContext';
import client from '../../../api/client';
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
  SettingsSectionHeader,
} from '../../../components/settings/ui';

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
      <SettingsCard
        title="Company Information"
        description="Basic details shown on all generated documents and PDFs"
        icon={Building2}
        footer={
          <SettingsSaveBar
            onSave={handleCompany((data) => onSaveSection(data, setSavingCompany))}
            isSaving={savingCompany}
            isDirty={dirtyCompany}
            saveLabel="Save Company Info"
          />
        }
      >
        {/* Logo Section */}
        <div className="flex flex-col items-center gap-3 mb-5">
           <div className="relative group">
              <div className="h-20 w-20 rounded-full bg-slate-100 border-4 border-white shadow-lg flex items-center justify-center text-slate-400 font-semibold text-base overflow-hidden">
                 {getVal('brand_logo_url') ? (
                   <img src={getVal('brand_logo_url')} alt="Logo" className="w-full h-full object-cover" />
                 ) : (
                   <span className="text-base font-semibold text-slate-400">{getVal('company_name')?.substring(0, 2).toUpperCase() || 'AH'}</span>
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
           <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest text-center">Org Branding</p>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
           <SettingsField label="Company Name" required>
              <SettingsInput {...regCompany('company_name', { required: true })} />
           </SettingsField>
           <SettingsField label="TIN Number" required>
              <SettingsInput {...regCompany('company_tin', { required: true })} />
           </SettingsField>
           <SettingsField label="Primary Phone">
              <SettingsInput {...regCompany('company_phone')} leftIcon={Phone} />
           </SettingsField>
           <SettingsField label="Secondary Phone">
              <SettingsInput {...regCompany('company_phone_secondary')} />
           </SettingsField>
           <SettingsField label="Company Address" className="sm:col-span-2">
              <SettingsTextarea {...regCompany('company_address')} />
           </SettingsField>
           <SettingsField label="Company Email">
              <SettingsInput type="email" {...regCompany('company_email')} leftIcon={Mail} />
           </SettingsField>
           <SettingsField label="Fiscal Year Start" description="Ethiopian fiscal year starts in July (Month 07)">
              <SettingsSelect
                {...regCompany('fiscal_year_start')}
                options={['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(m => ({
                  value: m,
                  label: `${new Date(2025, parseInt(m)-1, 1).toLocaleString('default', { month: 'long' })} (${m})`
                }))}
              />
           </SettingsField>
           <SettingsField label="Default Currency">
              <SettingsSelect
                {...regCompany('default_currency')}
                options={[
                  { value: 'ETB', label: 'ETB - Ethiopian Birr' },
                  { value: 'USD', label: 'USD - US Dollar' },
                  { value: 'EUR', label: 'EUR - Euro' }
                ]}
              />
           </SettingsField>
        </div>
      </SettingsCard>

      {/* CARD 2: LOCALIZATION */}
      <SettingsCard
        title="Localization & Display"
        description="Language, timezone, and number formatting"
        icon={Globe}
        footer={
          <SettingsSaveBar
            onSave={handleLoc((data) => onSaveSection(data, setSavingLocalization))}
            isSaving={savingLocalization}
            saveLabel="Save Localization"
          />
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
           <SettingsField label="Default Language">
              <SettingsSelect
                {...regLoc('default_language')}
                options={[
                  { value: 'en', label: 'English (US)' },
                  { value: 'am', label: 'Amharic (Ethiopia)' }
                ]}
              />
           </SettingsField>
           <SettingsField label="System Timezone">
              <SettingsSelect
                {...regLoc('timezone')}
                options={[
                  { value: 'Africa/Addis_Ababa', label: 'Africa/Addis_Ababa (UTC+3)' },
                  { value: 'UTC', label: 'UTC (Universal Coordinated Time)' },
                  { value: 'Europe/London', label: 'Europe/London (UTC+0)' }
                ]}
              />
           </SettingsField>
        </div>

        <SettingsDivider />

        <SettingsSectionHeader title="Date Format Preference" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

        <SettingsDivider />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
           <div>
              <SettingsSectionHeader title="Number Formatting" />
              <div className="space-y-4">
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
           </div>

           <div>
              <SettingsSectionHeader title="Currency Symbol Position" />
              <div className="space-y-4">
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
           </div>
        </div>
      </SettingsCard>

      {/* CARD 3: APPEARANCE */}
      <SettingsCard
        title="System Appearance"
        description="Customize how the system looks for all users"
        icon={Palette}
        footer={
          <SettingsSaveBar
            onSave={handleApp((data) => onSaveSection(data, setSavingAppearance))}
            isSaving={savingAppearance}
            saveLabel="Save Appearance"
          />
        }
      >
        <SettingsSectionHeader title="Sidebar Color Theme" />
        <div className="flex flex-wrap gap-4 mb-5">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
           <SettingsField label="Items Per Page" description="Default number of rows shown in all tables">
              <SettingsSelect
                {...regApp('items_per_page')}
                options={[
                  { value: '10', label: '10 Rows' },
                  { value: '20', label: '20 Rows (Default)' },
                  { value: '50', label: '50 Rows' },
                  { value: '100', label: '100 Rows' }
                ]}
              />
           </SettingsField>

           <div>
              <SettingsSectionHeader title="PDF Export Preferences" />
              <div className="space-y-4">
                 <SettingsToggleRow
                   label="Show Company Logo on PDF"
                   checked={watchApp('show_logo_pdf')}
                   onChange={(checked) => setAppVal('show_logo_pdf', checked)}
                 />
                 <SettingsToggleRow
                   label="Show Approval Timestamps on PDF"
                   checked={watchApp('show_timestamps_pdf')}
                   onChange={(checked) => setAppVal('show_timestamps_pdf', checked)}
                 />
              </div>
           </div>
        </div>
      </SettingsCard>
    </div>
  );
}
