import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import client from '../api/client';

interface ThemeConfig {
  cssVariables: Record<string, string>;
  brand: {
    companyName: string;
    tagline: string;
    logoUrl: string;
    logoDarkUrl: string;
    faviconUrl: string;
    logoWidth: number;
    loginBgType: string;
    loginBgColor: string;
    loginBgColorEnd: string;
    loginBgImageUrl: string;
    loginCardPosition: string;
  };
  styles: {
    card: string;
    button: string;
    table: string;
    density: string;
  };
  features: {
    darkModeEnabled: boolean;
    defaultMode: string;
  };
  activePreset: string;
  version: string;
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
    
    // Apply CSS Variables
    Object.entries(config.cssVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    
    // Specifically handle font family for body
    if (config.cssVariables['--font-family']) {
      document.body.style.fontFamily = config.cssVariables['--font-family'];
    }
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
