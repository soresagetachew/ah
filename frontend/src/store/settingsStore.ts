import { create } from 'zustand';
import client from '../api/client';
import toast from 'react-hot-toast';

interface SettingsState {
  settings: Record<string, any>;
  isLoading: boolean;
  fetchSettings: () => Promise<void>;
  updateSetting: (key: string, value: any) => Promise<void>;
  bulkUpdateSettings: (changes: { key: string, value: any }[]) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: {},
  isLoading: false,

  fetchSettings: async () => {
    set({ isLoading: true });
    try {
      const res = await client.get('/settings');
      set({ settings: res.data });
    } catch (error) {
      toast.error('Failed to synchronize system settings');
    } finally {
      set({ isLoading: false });
    }
  },

  updateSetting: async (key: string, value: any) => {
    // Optimistic update
    const prevSettings = get().settings;
    
    try {
      await client.put('/settings', { key, value });
      toast.success('Configuration updated');
      await get().fetchSettings(); // Refresh from server to get clean state
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  },

  bulkUpdateSettings: async (settings: { key: string, value: any }[]) => {
    set({ isLoading: true });
    try {
      await client.put('/settings/bulk', { settings });
      toast.success('System configuration synchronized successfully');
      await get().fetchSettings();
    } catch (error) {
      toast.error('Bulk update failed');
    } finally {
      set({ isLoading: false });
    }
  }
}));
