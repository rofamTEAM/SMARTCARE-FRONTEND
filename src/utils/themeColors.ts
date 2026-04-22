export interface ColorTheme {
  name: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  card: string;
  cardForeground: string;
  border: string;
  input: string;
  ring: string;
}

export const colorThemes: Record<string, ColorTheme> = {
  blue: {
    name: 'Ocean Blue',
    primary: '#3b82f6',
    primaryForeground: 'hsl(var(--card))',
    secondary: '#f1f5f9',
    accent: '#e2e8f0',
    background: 'hsl(var(--card))',
    foreground: '#0f172a',
    muted: '#f8fafc',
    mutedForeground: '#64748b',
    card: 'hsl(var(--card))',
    cardForeground: '#0f172a',
    border: '#e2e8f0',
    input: '#f8fafc',
    ring: '#3b82f6',
  },
  green: {
    name: 'Medical Green',
    primary: '#10b981',
    primaryForeground: 'hsl(var(--card))',
    secondary: '#f0fdf4',
    accent: '#dcfce7',
    background: 'hsl(var(--card))',
    foreground: '#064e3b',
    muted: '#f7fee7',
    mutedForeground: '#65a30d',
    card: 'hsl(var(--card))',
    cardForeground: '#064e3b',
    border: '#bbf7d0',
    input: '#f0fdf4',
    ring: '#10b981',
  },
  purple: {
    name: 'Royal Purple',
    primary: '#8b5cf6',
    primaryForeground: 'hsl(var(--card))',
    secondary: '#faf5ff',
    accent: '#f3e8ff',
    background: 'hsl(var(--card))',
    foreground: '#581c87',
    muted: '#fdf4ff',
    mutedForeground: '#a855f7',
    card: 'hsl(var(--card))',
    cardForeground: '#581c87',
    border: '#e9d5ff',
    input: '#faf5ff',
    ring: '#8b5cf6',
  },
  red: {
    name: 'Emergency Red',
    primary: '#ef4444',
    primaryForeground: 'hsl(var(--card))',
    secondary: '#fef2f2',
    accent: '#fee2e2',
    background: 'hsl(var(--card))',
    foreground: '#7f1d1d',
    muted: '#fef7f7',
    mutedForeground: '#dc2626',
    card: 'hsl(var(--card))',
    cardForeground: '#7f1d1d',
    border: '#fecaca',
    input: '#fef2f2',
    ring: '#ef4444',
  },
  orange: {
    name: 'Warm Orange',
    primary: '#f97316',
    primaryForeground: 'hsl(var(--card))',
    secondary: '#fff7ed',
    accent: '#fed7aa',
    background: 'hsl(var(--card))',
    foreground: '#9a3412',
    muted: '#fffbeb',
    mutedForeground: '#ea580c',
    card: 'hsl(var(--card))',
    cardForeground: '#9a3412',
    border: '#fdba74',
    input: '#fff7ed',
    ring: '#f97316',
  },
  teal: {
    name: 'Healthcare Teal',
    primary: '#14b8a6',
    primaryForeground: 'hsl(var(--card))',
    secondary: '#f0fdfa',
    accent: '#ccfbf1',
    background: 'hsl(var(--card))',
    foreground: '#134e4a',
    muted: '#f7fffe',
    mutedForeground: '#0f766e',
    card: 'hsl(var(--card))',
    cardForeground: '#134e4a',
    border: '#99f6e4',
    input: '#f0fdfa',
    ring: '#14b8a6',
  },
};

export const applyTheme = (theme: ColorTheme) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  
  // Convert hex to HSL for CSS variables
  const hexToHsl = (hex: string) => {
    if (hex.startsWith('hsl(')) return hex;
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };
  
  const primaryHsl = hexToHsl(theme.primary);
  const secondaryHsl = hexToHsl(theme.secondary);
  const accentHsl = hexToHsl(theme.accent);
  
  // Check if we're in dark mode
  const isDark = root.classList.contains('dark');
  
  // Apply theme colors to CSS variables
  root.style.setProperty('--primary', primaryHsl);
  root.style.setProperty('--primary-foreground', '210 40% 98%');
  root.style.setProperty('--ring', primaryHsl);
  root.style.setProperty('--chart-1', primaryHsl);
  root.style.setProperty('--chart-2', accentHsl);
  root.style.setProperty('--chart-3', primaryHsl);
  root.style.setProperty('--chart-4', accentHsl);
  root.style.setProperty('--chart-5', primaryHsl);
  
  // Apply mode-specific colors
  if (isDark) {
    // Dark mode colors
    root.style.setProperty('--background', '222.2 84% 4.9%');
    root.style.setProperty('--foreground', '210 40% 98%');
    root.style.setProperty('--card', '222.2 84% 4.9%');
    root.style.setProperty('--card-foreground', '210 40% 98%');
    root.style.setProperty('--secondary', '217.2 32.6% 17.5%');
    root.style.setProperty('--secondary-foreground', '210 40% 98%');
    root.style.setProperty('--muted', '217.2 32.6% 17.5%');
    root.style.setProperty('--muted-foreground', '215 20.2% 65.1%');
    root.style.setProperty('--accent', '217.2 32.6% 17.5%');
    root.style.setProperty('--accent-foreground', '210 40% 98%');
    root.style.setProperty('--border', '217.2 32.6% 17.5%');
    root.style.setProperty('--input', '217.2 32.6% 17.5%');
    root.style.setProperty('--sidebar', '222.2 84% 4.9%');
    root.style.setProperty('--sidebar-foreground', '210 40% 98%');
    root.style.setProperty('--sidebar-accent', '217.2 32.6% 17.5%');
    root.style.setProperty('--sidebar-border', '217.2 32.6% 17.5%');
  } else {
    // Light mode colors
    root.style.setProperty('--background', '0 0% 100%');
    root.style.setProperty('--foreground', '222.2 84% 4.9%');
    root.style.setProperty('--card', '0 0% 100%');
    root.style.setProperty('--card-foreground', '222.2 84% 4.9%');
    root.style.setProperty('--secondary', secondaryHsl);
    root.style.setProperty('--secondary-foreground', '222.2 84% 4.9%');
    root.style.setProperty('--muted', '210 40% 96%');
    root.style.setProperty('--muted-foreground', '215.4 16.3% 46.9%');
    root.style.setProperty('--accent', accentHsl);
    root.style.setProperty('--accent-foreground', '222.2 84% 4.9%');
    root.style.setProperty('--border', '214.3 31.8% 91.4%');
    root.style.setProperty('--input', '214.3 31.8% 91.4%');
    root.style.setProperty('--sidebar', primaryHsl);
    root.style.setProperty('--sidebar-foreground', '210 40% 98%');
    root.style.setProperty('--sidebar-accent', secondaryHsl);
    root.style.setProperty('--sidebar-border', '214.3 31.8% 91.4%');
  }
  
  // Force style recalculation
  root.style.setProperty('--theme-timestamp', Date.now().toString());
  
  // Trigger reflow to ensure immediate application
  if (typeof document !== 'undefined') document.body.offsetHeight;
};

export const getCurrentTheme = (): string => {
  // Theme is kept in memory only - default to 'blue'
  // For persistent theme storage, use backend API
  return 'blue';
};

export const setCurrentTheme = (themeKey: string) => {
  if (typeof window !== 'undefined') {
    const theme = colorThemes[themeKey];
    if (theme) {
      applyTheme(theme);
      
      // Dispatch theme change event
      window.dispatchEvent(new CustomEvent('themeChanged', { 
        detail: { theme: themeKey, themeData: theme } 
      }));
    }
  }
};