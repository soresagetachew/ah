import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import client from '../api/client';

interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string;
  brandName: string;
  fontFamily: string;
  borderRadius: string;
  sidebarBg: string;
  sidebarText: string;
  sidebarActiveBg: string;
  sidebarActiveText: string;
}

interface ThemeContextType {
  theme: ThemeConfig | null;
  refreshTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeConfig | null>(null);

  const applyTheme = useCallback((config: ThemeConfig) => {
    const root = document.documentElement;
    root.style.setProperty('--brand-primary', config.primaryColor);
    root.style.setProperty('--brand-secondary', config.secondaryColor);
    root.style.setProperty('--brand-accent', config.accentColor);
    root.style.setProperty('--brand-font', config.fontFamily);
    root.style.setProperty('--brand-radius', config.borderRadius);
    root.style.setProperty('--brand-sidebar-bg', config.sidebarBg);
    root.style.setProperty('--brand-sidebar-text', config.sidebarText);
    root.style.setProperty('--brand-sidebar-active-bg', config.sidebarActiveBg);
    root.style.setProperty('--brand-sidebar-active-text', config.sidebarActiveText);
    
    // Update body font
    document.body.style.fontFamily = config.fontFamily;
  }, []);

  const refreshTheme = useCallback(async () => {
    try {
      const res = await client.get('/theme/config');
      setTheme(res.data);
      applyTheme(res.data);
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  }, [applyTheme]);

  useEffect(() => {
    refreshTheme();

    // SSE Listener for real-time updates
    const eventSource = new EventSource(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/events`);
    
    eventSource.addEventListener('theme_updated', () => {
      console.log('✨ Theme update received via SSE');
      refreshTheme();
    });

    eventSource.onerror = () => {
      console.error('SSE Connection failed');
    };

    return () => {
      eventSource.close();
    };
  }, [refreshTheme]);

  return (
    <ThemeContext.Provider value={{ theme, refreshTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
