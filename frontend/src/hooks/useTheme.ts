import { useState, useEffect } from 'react';
import { themeEngine } from '../engine/ThemeEngine';

export const useTheme = () => {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    // Re-render when theme updates
    const unsubscribe = themeEngine.onUpdate(() => {
      setVersion(v => v + 1);
    });
    return unsubscribe;
  }, []);

  return {
    getVar: (variable: string) => themeEngine.getVar(variable),
    setDarkMode: (enabled: boolean) => themeEngine.setDarkMode(enabled),
    version, // include in keys for components that need forced re-render
  };
};
