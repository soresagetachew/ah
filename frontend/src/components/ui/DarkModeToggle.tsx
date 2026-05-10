import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { themeEngine } from '../../engine/ThemeEngine';
import client from '../../api/client';
import toast from 'react-hot-toast';

export default function DarkModeToggle() {
  const { user, refreshUser } = useAuthStore();

  if (!user || !user.theme_dark_mode_enabled) return null;

  const modes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system'];
  const currentMode = user.theme_mode || 'light';

  const handleToggle = async () => {
    const currentIndex = modes.indexOf(currentMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];

    try {
      // 1. Apply locally immediately
      const isDark = nextMode === 'dark' || 
                    (nextMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      themeEngine.setDarkMode(isDark);
      
      // 2. Persist to backend
      await client.patch('/auth/preferences', { themeMode: nextMode });
      
      // 3. Update global store
      refreshUser({ ...user, theme_mode: nextMode });
      
      toast.success(`Theme set to ${nextMode}`, { id: 'theme-toggle' });
    } catch (error) {
      toast.error('Failed to save theme preference');
    }
  };

  const getIcon = () => {
    if (currentMode === 'light') return <Sun className="h-4 w-4 text-amber-500" />;
    if (currentMode === 'dark') return <Moon className="h-4 w-4 text-blue-400" />;
    return <Monitor className="h-4 w-4 text-slate-400" />;
  };

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all flex items-center gap-2 group shadow-sm active:scale-95"
      title={`Current mode: ${currentMode}. Click to cycle.`}
    >
      <div className="flex items-center justify-center">
        {getIcon()}
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-900 transition-colors pr-1">
        {currentMode}
      </span>
    </button>
  );
}
