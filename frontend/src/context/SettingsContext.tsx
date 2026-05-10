import React, { createContext, useContext, useState, useEffect } from 'react';
import client from '../api/client';
import { useAuthStore } from '../store/authStore';

interface SettingsContextType {
  settings: Record<string, string>;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();

  const fetchSettings = async () => {
    try {
      const res = await client.get('/settings/public');
      setSettings(res.data);
    } catch (error) {
      console.error('Failed to fetch public settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchSettings();
      const interval = setInterval(fetchSettings, 60000); // Poll every 60s
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const useSetting = (key: string, defaultValue: string = '') => {
  const { settings } = useSettings();
  return settings[key] || defaultValue;
};

export const useFeatureEnabled = (key: string) => {
  const { settings } = useSettings();
  return settings[key] === 'true' || settings[key] === '1';
};
