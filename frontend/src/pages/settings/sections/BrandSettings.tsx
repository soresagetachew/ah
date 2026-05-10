import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Palette, 
  Type, 
  Flag, 
  Layout, 
  Check, 
  Plus, 
  Trash2, 
  Upload, 
  Image as ImageIcon, 
  Monitor, 
  Smartphone, 
  Globe, 
  CheckCircle2, 
  RotateCcw,
  Save,
  ArrowRight,
  Maximize2,
  X,
  FileText,
  Search,
  Settings,
  Bell,
  Menu,
  ChevronLeft,
  ChevronRight,
  Lock,
  Sparkles
} from 'lucide-react';
import client from '../../../api/client';
import toast from 'react-hot-toast';
import { useTheme } from '../../../context/ThemeContext';

// --- Types ---
interface ThemePreset {
  id: string;
  name: string;
  label: string;
  description: string;
  is_builtin: boolean;
  is_active: boolean;
  preview_colors: any;
  settings: any;
}

// --- Inline Color Picker Component ---
const ColorPicker = ({ label, value, onChange }: { label: string; value: string; onChange: (val: string) => void }) => {
  const [show, setShow] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setShow(false);
    };
    if (show) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [show]);

  const presets = ['#0F172A', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#64748B', '#FFFFFF', '#000000'];

  return (
    <div className="flex items-center justify-between py-2 group">
      <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">{label}</span>
      <div className="relative">
        <button 
          onClick={() => setShow(!show)}
          className="flex items-center gap-2 p-1.5 pr-3 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-all shadow-sm active:scale-95"
        >
          <div className="h-6 w-6 rounded-md border border-slate-200 shadow-inner" style={{ backgroundColor: value }} />
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-tighter">{value}</span>
        </button>

        {show && (
          <div ref={pickerRef} className="absolute right-0 top-12 z-50 bg-white p-4 rounded-2xl shadow-2xl border border-slate-100 w-64 animate-in zoom-in-95 duration-200 origin-top-right">
            <div className="flex flex-col gap-4">
              <input 
                type="color" 
                value={value.startsWith('#') ? value : '#000000'} 
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-10 rounded-lg cursor-pointer border-none p-0 bg-transparent"
              />
              <div className="grid grid-cols-5 gap-2">
                {presets.map(c => (
                  <button 
                    key={c}
                    onClick={() => { onChange(c); setShow(false); }}
                    className="h-8 w-8 rounded-lg border border-slate-100 hover:scale-110 transition-transform shadow-sm"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hex</span>
                <input 
                  type="text" 
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-mono font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Mini App Preview SVG ---
const MiniAppPreview = ({ colors }: { colors: any }) => (
  <svg viewBox="0 0 160 100" className="w-full h-24 rounded-xl shadow-inner border border-white/10" style={{ backgroundColor: colors.page_bg || '#F8FAFC' }}>
    {/* Sidebar */}
    <rect x="0" y="0" width="40" height="100" fill={colors.sidebar || colors.primary || '#0F172A'} />
    <rect x="5" y="8" width="30" height="4" rx="2" fill="white" fillOpacity="0.2" />
    <rect x="5" y="20" width="10" height="10" rx="3" fill={colors.accent || '#3B82F6'} />
    <rect x="18" y="23" width="17" height="4" rx="2" fill="white" fillOpacity="0.1" />
    <rect x="5" y="35" width="30" height="4" rx="2" fill="white" fillOpacity="0.1" />
    <rect x="5" y="45" width="30" height="4" rx="2" fill="white" fillOpacity="0.1" />
    
    {/* Content Area */}
    <rect x="50" y="10" width="100" height="8" rx="2" fill={colors.primary || '#0F172A'} fillOpacity="0.05" />
    <rect x="50" y="25" width="40" height="40" rx="8" fill="white" stroke="#000" strokeOpacity="0.05" />
    <rect x="100" y="25" width="50" height="40" rx="8" fill="white" stroke="#000" strokeOpacity="0.05" />
    
    {/* Header */}
    <rect x="50" y="5" width="30" height="3" rx="1.5" fill={colors.text_primary || '#0F172A'} fillOpacity="0.8" />
    
    {/* Button */}
    <rect x="60" y="75" width="30" height="10" rx="4" fill={colors.accent || '#3B82F6'} />
  </svg>
);

export default function BrandSettings() {
  const [activeTab, setActiveTab] = useState<'presets' | 'colors' | 'brand' | 'login'>('presets');
  const [presets, setPresets] = useState<ThemePreset[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [newPreset, setNewPreset] = useState({ name: '', label: '', description: '' });
  const { refreshTheme } = useTheme();

  // Color & UI State (Local Preview)
  const [localSettings, setLocalSettings] = useState<Record<string, string>>({});
  const [initialSettings, setInitialSettings] = useState<Record<string, string>>({});
  const [changedCount, setChangedCount] = useState(0);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [presetsRes, settingsRes] = await Promise.all([
        client.get('/theme/presets'),
        client.get('/settings')
      ]);
      setPresets(presetsRes.data);
      
      const themeSettings: Record<string, string> = {};
      Object.values(settingsRes.data).flat().forEach((s: any) => {
        if (s.key.startsWith('theme_') || s.key.startsWith('brand_')) {
          themeSettings[s.key] = s.value;
        }
      });
      setLocalSettings(themeSettings);
      setInitialSettings(themeSettings);
    } catch (error) {
      toast.error('Failed to load theme data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const diff = Object.keys(localSettings).filter(k => localSettings[k] !== initialSettings[k]);
    setChangedCount(diff.length);
    
    // Inject variables to document root for real-time preview
    // Note: We use a prefix '--preview-' to not overwrite actual theme until saved
    // But user asked to "inject CSS variables into :root" for preview
    // We'll use the real variables but only locally.
    Object.entries(localSettings).forEach(([key, value]) => {
      const cssVar = key.replace('theme_color_', '--color-').replace('theme_', '--').replace(/_/g, '-');
      document.documentElement.style.setProperty(cssVar, value);
      // Also handle radius and font specifically if needed
      if (key.includes('radius')) document.documentElement.style.setProperty(cssVar, value + 'px');
    });

    return () => {
      // Revert to real theme on unmount or tab change if needed? 
      // Better: ThemeEngine will overwrite these next time it runs or we refresh.
    };
  }, [localSettings]);

  const handleApplyPreset = async (name: string) => {
    try {
      setLoading(true);
      await client.post(`/theme/presets/apply/${name}`);
      toast.success(`Theme ${name} applied!`);
      await fetchData();
      refreshTheme();
    } catch (error) {
      toast.error('Failed to apply preset');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBulk = async () => {
    try {
      setLoading(true);
      const changes = Object.keys(localSettings)
        .filter(k => localSettings[k] !== initialSettings[k])
        .map(k => ({ key: k, value: localSettings[k] }));
      
      await client.post('/settings/bulk', { settings: changes });
      toast.success('Theme updated for all users!');
      setInitialSettings(localSettings);
      refreshTheme();
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreset = async () => {
    try {
      await client.post('/theme/presets', newPreset);
      toast.success('Preset saved!');
      setSaveModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to save preset');
    }
  };

  const updateSetting = (key: string, value: string) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading && presets.length === 0) return <div className="p-8 text-center text-slate-400">Loading appearance engine...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Brand & Appearance</h2>
          <p className="text-slate-500 font-medium mt-1">Customize the visual identity and user experience of the platform.</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200">
          {[
            { id: 'presets', icon: Palette, label: 'Presets' },
            { id: 'colors', icon: Type, label: 'Colors & Fonts' },
            { id: 'brand', icon: Flag, label: 'Identity' },
            { id: 'login', icon: Layout, label: 'Login Page' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id 
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200' 
                : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-blue-600' : ''}`} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-8">
          
          {/* TAB 1: PRESETS */}
          {activeTab === 'presets' && (
            <div className="space-y-6">
              <div className="bg-blue-600 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-blue-500/20 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-110 transition-transform duration-1000" />
                 <h3 className="text-2xl font-black mb-2 flex items-center gap-3">
                   <Sparkles className="h-6 w-6" /> Theme Presets
                 </h3>
                 <p className="text-blue-100 font-medium text-sm leading-relaxed max-w-md">
                   Apply a complete theme in one click. Presets update colors, fonts, and layout across the entire app instantly for all users.
                 </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {presets.map(preset => {
                  const isActive = localSettings['theme_active_preset'] === preset.name;
                  const preview = typeof preset.preview_colors === 'string' ? JSON.parse(preset.preview_colors) : preset.preview_colors;
                  
                  return (
                    <div 
                      key={preset.id}
                      className={`group relative bg-white p-5 rounded-[2rem] border-2 transition-all duration-300 hover:shadow-xl ${
                        isActive ? 'border-blue-600 ring-4 ring-blue-500/5' : 'border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute top-4 right-4 bg-blue-600 text-white p-1.5 rounded-xl shadow-lg shadow-blue-500/20 animate-in zoom-in">
                          <Check className="h-4 w-4 stroke-[3]" />
                        </div>
                      )}
                      
                      <div className="mb-4">
                        <MiniAppPreview colors={preview} />
                      </div>

                      <div className="flex items-center gap-2 mb-4">
                        {Object.values(preview).slice(0, 4).map((c: any, i) => (
                          <div key={i} className="h-3 w-3 rounded-full border border-black/5" style={{ backgroundColor: c }} />
                        ))}
                      </div>

                      <div className="space-y-1 mb-6">
                        <h4 className="font-black text-slate-900 tracking-tight">{preset.label}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight line-clamp-1">{preset.description}</p>
                      </div>

                      <button
                        onClick={() => handleApplyPreset(preset.name)}
                        disabled={isActive || loading}
                        className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                          isActive 
                          ? 'bg-slate-50 text-slate-400 cursor-default' 
                          : 'bg-slate-900 text-white hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95'
                        }`}
                      >
                        {loading ? 'Applying...' : isActive ? 'Currently Active' : 'Apply Preset'}
                      </button>
                    </div>
                  );
                })}

                {/* Save Custom Theme Trigger */}
                <button 
                  onClick={() => setSaveModalOpen(true)}
                  className="flex flex-col items-center justify-center p-8 rounded-[2rem] border-2 border-dashed border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all group gap-4"
                >
                  <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center group-hover:bg-blue-100 group-hover:scale-110 transition-all">
                    <Plus className="h-6 w-6 text-slate-400 group-hover:text-blue-600" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black text-slate-900 uppercase tracking-tighter">Save Custom Theme</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Capture current adjustments</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: COLORS & FONTS */}
          {activeTab === 'colors' && (
            <div className="space-y-8 pb-32">
              {/* Sidebar Section */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center gap-4 mb-2">
                  <div className="h-12 w-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-900/20">
                    <Layout className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Navigation Sidebar</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Colors and layout for the main nav</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                  <ColorPicker label="Sidebar Background" value={localSettings['theme_color_sidebar_bg'] || '#0F172A'} onChange={c => updateSetting('theme_color_sidebar_bg', c)} />
                  <ColorPicker label="Default Text" value={localSettings['theme_color_sidebar_text'] || '#94A3B8'} onChange={c => updateSetting('theme_color_sidebar_text', c)} />
                  <ColorPicker label="Active Item Background" value={localSettings['theme_color_sidebar_active_bg'] || 'rgba(59, 130, 246, 0.1)'} onChange={c => updateSetting('theme_color_sidebar_active_bg', c)} />
                  <ColorPicker label="Active Item Text" value={localSettings['theme_color_sidebar_active_text'] || '#3B82F6'} onChange={c => updateSetting('theme_color_sidebar_active_text', c)} />
                </div>
              </div>

              {/* Brand Colors */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center gap-4 mb-2">
                  <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Palette className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Core Brand Palette</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global primary and accent colors</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                  <ColorPicker label="Primary Color" value={localSettings['theme_color_primary'] || '#0F172A'} onChange={c => updateSetting('theme_color_primary', c)} />
                  <ColorPicker label="Primary Hover" value={localSettings['theme_color_primary_hover'] || '#1E293B'} onChange={c => updateSetting('theme_color_primary_hover', c)} />
                  <ColorPicker label="Accent Color" value={localSettings['theme_color_accent'] || '#3B82F6'} onChange={c => updateSetting('theme_color_accent', c)} />
                  <ColorPicker label="Accent Hover" value={localSettings['theme_color_accent_hover'] || '#2563EB'} onChange={c => updateSetting('theme_color_accent_hover', c)} />
                </div>
              </div>

              {/* Status Colors */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                 <div className="flex items-center gap-4 mb-2">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">System Statuses</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Colors for workflow states</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <ColorPicker label="Success" value={localSettings['theme_color_success'] || '#10B981'} onChange={c => updateSetting('theme_color_success', c)} />
                  <ColorPicker label="Warning" value={localSettings['theme_color_warning'] || '#F59E0B'} onChange={c => updateSetting('theme_color_warning', c)} />
                  <ColorPicker label="Danger" value={localSettings['theme_color_danger'] || '#EF4444'} onChange={c => updateSetting('theme_color_danger', c)} />
                </div>
              </div>

               {/* Background & Text */}
               <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center gap-4 mb-2">
                  <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                    <Layout className="h-6 w-6 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Canvas & Typography</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Base colors for pages and text</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                  <ColorPicker label="Page Background" value={localSettings['theme_color_page_bg'] || '#F8FAFC'} onChange={c => updateSetting('theme_color_page_bg', c)} />
                  <ColorPicker label="Card Background" value={localSettings['theme_color_card_bg'] || '#FFFFFF'} onChange={c => updateSetting('theme_color_card_bg', c)} />
                  <ColorPicker label="Primary Text" value={localSettings['theme_color_text_primary'] || '#0F172A'} onChange={c => updateSetting('theme_color_text_primary', c)} />
                  <ColorPicker label="Secondary Text" value={localSettings['theme_color_text_secondary'] || '#64748B'} onChange={c => updateSetting('theme_color_text_secondary', c)} />
                </div>
              </div>

              {/* Typography Section */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center gap-4 mb-2">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Type className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Typography</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Font families and sizing</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Font Family</label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {['Inter', 'Roboto', 'Poppins', 'Nunito', 'DM Sans'].map(font => (
                      <button
                        key={font}
                        onClick={() => updateSetting('theme_font_family', font)}
                        className={`p-4 rounded-2xl border-2 transition-all text-left ${
                          localSettings['theme_font_family'] === font 
                          ? 'border-blue-600 bg-blue-50/50' 
                          : 'border-slate-100 hover:border-slate-200'
                        }`}
                        style={{ fontFamily: font }}
                      >
                        <p className="text-xs font-black text-slate-900">{font}</p>
                        <p className="text-lg mt-1">Aa</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BRAND IDENTITY */}
          {activeTab === 'brand' && (
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-slate-900 flex items-center justify-center">
                    <Flag className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Corporate Identity</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Logo management and company info</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Company Name</label>
                    <input 
                      type="text" 
                      value={localSettings['brand_company_name'] || ''}
                      onChange={e => updateSetting('brand_company_name', e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tagline</label>
                    <input 
                      type="text" 
                      value={localSettings['brand_company_tagline'] || ''}
                      onChange={e => updateSetting('brand_company_tagline', e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Logo Uploaders - (Simplified for MVP) */}
                  {[
                    { label: 'Primary Logo', key: 'brand_logo_url', desc: 'For light backgrounds' },
                    { label: 'Dark Logo', key: 'brand_logo_dark_url', desc: 'For dark sidebars' },
                    { label: 'Favicon', key: 'brand_favicon_url', desc: 'Browser tab icon' }
                  ].map(logo => (
                    <div key={logo.key} className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{logo.label}</label>
                      <div className="aspect-square rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center p-6 text-center group hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer">
                         {localSettings[logo.key] ? (
                           <img src={localSettings[logo.key]} alt={logo.label} className="max-h-full max-w-full object-contain mb-4" />
                         ) : (
                           <ImageIcon className="h-8 w-8 text-slate-300 group-hover:text-blue-400 transition-colors mb-2" />
                         )}
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{logo.desc}</p>
                         <button className="mt-4 px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-200 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors">Change</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LOGIN PAGE */}
          {activeTab === 'login' && (
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-slate-900 flex items-center justify-center">
                    <Lock className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Login Portal Design</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Customize the entry experience</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Background Type</label>
                    <div className="grid grid-cols-3 gap-4">
                      {['solid', 'gradient', 'image'].map(type => (
                        <button
                          key={type}
                          onClick={() => updateSetting('brand_login_bg_type', type)}
                          className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                            localSettings['brand_login_bg_type'] === type 
                            ? 'border-blue-600 bg-blue-50/50' 
                            : 'border-slate-100 hover:border-slate-200'
                          }`}
                        >
                          {type === 'solid' && <div className="h-8 w-8 rounded-lg bg-blue-600" />}
                          {type === 'gradient' && <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-900" />}
                          {type === 'image' && <ImageIcon className="h-8 w-8 text-slate-400" />}
                          <span className="text-[10px] font-black uppercase tracking-widest">{type}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                    <ColorPicker label="Background Color / Start" value={localSettings['brand_login_bg_color'] || '#0F172A'} onChange={c => updateSetting('brand_login_bg_color', c)} />
                    {localSettings['brand_login_bg_type'] === 'gradient' && (
                      <ColorPicker label="Gradient End Color" value={localSettings['brand_login_bg_color_end'] || '#1E3A5F'} onChange={c => updateSetting('brand_login_bg_color_end', c)} />
                    )}
                  </div>
                  
                  <div className="pt-4 space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Card Position</label>
                    <div className="grid grid-cols-3 gap-4">
                       {['left', 'center', 'right'].map(pos => (
                         <button 
                           key={pos}
                           onClick={() => updateSetting('brand_login_card_position', pos)}
                           className={`h-24 rounded-2xl border-2 transition-all relative overflow-hidden ${
                             localSettings['brand_login_card_position'] === pos ? 'border-blue-600' : 'border-slate-100 hover:border-slate-200'
                           }`}
                         >
                            <div className="absolute inset-0 bg-slate-50" />
                            <div className={`absolute top-1/2 -translate-y-1/2 w-1/3 h-2/3 bg-white border border-slate-200 shadow-sm rounded-lg transition-all ${
                              pos === 'left' ? 'left-2' : pos === 'right' ? 'right-2' : 'left-1/2 -translate-x-1/2'
                            }`} />
                         </button>
                       ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* --- STICKY LIVE PREVIEW PANEL --- */}
        <div className="lg:col-span-4 space-y-6 sticky top-24">
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-900/10 overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Live Preview</h3>
              <div className="flex gap-1">
                <div className="h-2 w-2 rounded-full bg-red-400" />
                <div className="h-2 w-2 rounded-full bg-amber-400" />
                <div className="h-2 w-2 rounded-full bg-emerald-400" />
              </div>
            </div>

            {/* Scaled App Mockup */}
            <div className="aspect-[3/4] bg-page rounded-2xl border border-border shadow-inner relative overflow-hidden text-[8px]" style={{ fontFamily: localSettings['theme_font_family'] }}>
               {/* Sidebar */}
               <div className="absolute inset-y-0 left-0 w-1/4 bg-sidebar-bg border-r border-white/5 flex flex-col p-2 gap-2">
                  <div className="h-4 w-12 rounded bg-brand-primary/20" />
                  <div className="h-4 w-full rounded bg-sidebar-active-bg text-sidebar-active-text flex items-center px-1 font-bold">Dashboard</div>
                  <div className="h-4 w-full rounded text-sidebar-text flex items-center px-1">Projects</div>
                  <div className="h-4 w-full rounded text-sidebar-text flex items-center px-1">Procurement</div>
               </div>
               {/* Content Area */}
               <div className="absolute inset-0 left-1/4 p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <div className="h-3 w-16 bg-text-primary rounded" />
                      <div className="h-2 w-24 bg-text-secondary rounded" />
                    </div>
                    <div className="h-6 w-6 rounded-full bg-brand-primary" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                     <div className="bg-card p-3 rounded-md border border-border shadow-card space-y-2">
                        <div className="h-2 w-8 bg-text-muted rounded" />
                        <div className="h-3 w-12 bg-text-primary rounded" />
                     </div>
                     <div className="bg-card p-3 rounded-md border border-border shadow-card space-y-2">
                        <div className="h-2 w-8 bg-text-muted rounded" />
                        <div className="h-3 w-12 bg-text-primary rounded" />
                     </div>
                  </div>

                  <div className="bg-card p-3 rounded-md border border-border shadow-card space-y-3">
                     <div className="h-2 w-24 bg-text-primary rounded" />
                     <div className="h-2 w-full bg-text-secondary rounded" />
                     <div className="h-2 w-2/3 bg-text-secondary rounded" />
                     <div className="flex gap-2">
                        <div className="h-5 px-3 bg-brand-primary text-white rounded-brand flex items-center justify-center font-bold">Primary Action</div>
                        <div className="h-5 px-3 bg-accent text-white rounded-brand flex items-center justify-center font-bold">Accent</div>
                     </div>
                  </div>

                  <div className="flex items-center gap-2">
                     <span className="px-2 py-0.5 bg-success/20 text-success rounded-full font-bold">Approved</span>
                     <span className="px-2 py-0.5 bg-warning/20 text-warning rounded-full font-bold">Pending</span>
                  </div>
               </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">
                <span>Unsaved Changes</span>
                <span className={changedCount > 0 ? 'text-blue-600' : ''}>{changedCount} total</span>
              </div>
              
              <button 
                onClick={handleSaveBulk}
                disabled={changedCount === 0 || loading}
                className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-black uppercase tracking-widest transition-all ${
                  changedCount > 0 
                  ? 'bg-slate-900 text-white hover:bg-blue-600 shadow-xl shadow-blue-500/10' 
                  : 'bg-slate-100 text-slate-400 cursor-default'
                }`}
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Apply Changes Live
                  </>
                )}
              </button>

              <button 
                onClick={() => { setLocalSettings(initialSettings); toast('Reverted to current theme'); }}
                disabled={changedCount === 0 || loading}
                className="w-full py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center gap-2 disabled:opacity-0"
              >
                <RotateCcw className="h-3 w-3" /> Revert Adjustments
              </button>
            </div>
          </div>
          
          <div className="bg-slate-900 p-6 rounded-[2.5rem] text-white">
             <div className="flex items-center gap-3 mb-4">
                <Globe className="h-5 w-5 text-blue-500" />
                <h4 className="text-xs font-black uppercase tracking-widest">Global Reach</h4>
             </div>
             <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
               Applying changes will immediately update the visual design for all connected users worldwide via Server-Sent Events (SSE). No page refresh is required.
             </p>
          </div>
        </div>
      </div>

      {/* --- SAVE PRESET MODAL --- */}
      {saveModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300 relative">
              <button onClick={() => setSaveModalOpen(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
                <X className="h-5 w-5" />
              </button>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Save Theme Preset</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Capture your current design</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Name (ID)</label>
                   <input 
                      type="text" 
                      placeholder="e.g. holiday_theme"
                      value={newPreset.name}
                      onChange={e => setNewPreset({...newPreset, name: e.target.value.toLowerCase().replace(/ /g, '_')})}
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Display Label</label>
                   <input 
                      type="text" 
                      placeholder="e.g. Holiday Season 2024"
                      value={newPreset.label}
                      onChange={e => setNewPreset({...newPreset, label: e.target.value})}
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                   <textarea 
                      placeholder="Briefly describe this theme's purpose..."
                      value={newPreset.description}
                      onChange={e => setNewPreset({...newPreset, description: e.target.value})}
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[80px]"
                   />
                </div>

                <button 
                  onClick={handleSavePreset}
                  disabled={!newPreset.name || !newPreset.label}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-blue-600 shadow-xl shadow-blue-500/10 transition-all disabled:opacity-50 disabled:bg-slate-400"
                >
                  Create Theme Preset
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
