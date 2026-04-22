'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { colorThemes, getCurrentTheme, applyTheme } from '../utils/themeColors';

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'hospital-ui-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Theme is kept in memory only - no localStorage persistence
    return defaultTheme;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const root = window.document.documentElement;

    root.classList.remove('light', 'dark');

    let effectiveTheme: 'light' | 'dark';
    
    if (theme === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light';
    } else {
      effectiveTheme = theme;
    }

    root.classList.add(effectiveTheme);
    
    // Apply current color theme after mode change
    setTimeout(() => {
      const currentColorTheme = getCurrentTheme();
      const colorTheme = colorThemes[currentColorTheme];
      if (colorTheme) {
        applyTheme(colorTheme);
      }
    }, 10);
  }, [theme]);

  // Initialize color theme on mount and listen for changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentColorTheme = getCurrentTheme();
      const colorTheme = colorThemes[currentColorTheme];
      if (colorTheme) {
        applyTheme(colorTheme);
      }
      
      // Listen for theme changes
      const handleThemeChange = (event: CustomEvent) => {
        const themeKey = event.detail.theme;
        const themeData = event.detail.themeData;
        if (themeData) {
          applyTheme(themeData);
        }
      };
      
      window.addEventListener('themeChanged', handleThemeChange as EventListener);
      
      return () => {
        window.removeEventListener('themeChanged', handleThemeChange as EventListener);
      };
    }
  }, []);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      // Theme is kept in memory only - no localStorage persistence
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};
