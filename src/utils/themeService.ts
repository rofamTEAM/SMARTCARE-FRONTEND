interface ThemeColor {
  name: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  accent: string;
  muted: string;
  border: string;
  ring: string;
  gradient: string;
}

export const themeColors: ThemeColor[] = [
  {
    name: 'Sky Blue (Default)',
    primary: '199 89% 48%',
    primaryForeground: '0 0% 100%',
    secondary: '204 100% 97%',
    accent: '199 89% 48%',
    muted: '210 40% 98%',
    border: '199 89% 48%',
    ring: '199 89% 48%',
    gradient: 'linear-gradient(135deg, hsl(199 89% 48%) 0%, hsl(200 98% 39%) 100%)'
  },
  {
    name: 'Emerald Green',
    primary: '160 84% 39%',
    primaryForeground: '0 0% 100%',
    secondary: '151 81% 96%',
    accent: '160 84% 39%',
    muted: '138 76% 97%',
    border: '160 84% 39%',
    ring: '160 84% 39%',
    gradient: 'linear-gradient(135deg, hsl(160 84% 39%) 0%, hsl(158 64% 52%) 100%)'
  },
  {
    name: 'Royal Purple',
    primary: '262 83% 58%',
    primaryForeground: '0 0% 100%',
    secondary: '270 100% 98%',
    accent: '262 83% 58%',
    muted: '270 100% 98%',
    border: '262 83% 58%',
    ring: '262 83% 58%',
    gradient: 'linear-gradient(135deg, hsl(262 83% 58%) 0%, hsl(263 70% 50%) 100%)'
  },
  {
    name: 'Rose Pink',
    primary: '346 77% 60%',
    primaryForeground: '0 0% 100%',
    secondary: '355 100% 97%',
    accent: '346 77% 60%',
    muted: '355 100% 97%',
    border: '346 77% 60%',
    ring: '346 77% 60%',
    gradient: 'linear-gradient(135deg, hsl(346 77% 60%) 0%, hsl(347 77% 50%) 100%)'
  },
  {
    name: 'Orange Sunset',
    primary: '24 95% 53%',
    primaryForeground: '0 0% 100%',
    secondary: '33 100% 96%',
    accent: '24 95% 53%',
    muted: '48 100% 96%',
    border: '24 95% 53%',
    ring: '24 95% 53%',
    gradient: 'linear-gradient(135deg, hsl(24 95% 53%) 0%, hsl(20 91% 48%) 100%)'
  },
  {
    name: 'Teal Ocean',
    primary: '173 80% 40%',
    primaryForeground: '0 0% 100%',
    secondary: '166 76% 97%',
    accent: '173 80% 40%',
    muted: '152 81% 96%',
    border: '173 80% 40%',
    ring: '173 80% 40%',
    gradient: 'linear-gradient(135deg, hsl(173 80% 40%) 0%, hsl(172 66% 50%) 100%)'
  },
  {
    name: 'Indigo Night',
    primary: '238 75% 65%',
    primaryForeground: '0 0% 100%',
    secondary: '204 100% 97%',
    accent: '238 75% 65%',
    muted: '210 40% 98%',
    border: '238 75% 65%',
    ring: '238 75% 65%',
    gradient: 'linear-gradient(135deg, hsl(238 75% 65%) 0%, hsl(243 75% 59%) 100%)'
  },
  {
    name: 'Crimson Red',
    primary: '0 84% 60%',
    primaryForeground: '0 0% 100%',
    secondary: '0 86% 97%',
    accent: '0 84% 60%',
    muted: '0 86% 97%',
    border: '0 84% 60%',
    ring: '0 84% 60%',
    gradient: 'linear-gradient(135deg, hsl(0 84% 60%) 0%, hsl(0 84% 55%) 100%)'
  }
];

class ThemeService {
  private currentTheme: ThemeColor;
  private isClient: boolean;

  constructor() {
    this.isClient = typeof window !== 'undefined';
    this.currentTheme = this.loadTheme();
    if (this.isClient) {
      this.applyTheme(this.currentTheme);
    }
  }

  private loadTheme(): ThemeColor {
    if (!this.isClient) {
      return themeColors[0];
    }
    
    // Theme is kept in memory only - no localStorage persistence
    // For persistent theme storage, use backend API
    return themeColors[0];
  }

  public initializeTheme(): void {
    if (!this.isClient) return;
    
    // Apply the current theme on initialization
    this.applyTheme(this.currentTheme);
  }

  public setTheme(theme: ThemeColor): void {
    this.currentTheme = theme;
    if (this.isClient) {
      this.applyTheme(theme);
      
      // Dispatch theme change event for components to react
      window.dispatchEvent(new CustomEvent('themeChanged', { 
        detail: { theme, timestamp: Date.now() } 
      }));
    }
  }

  private applyTheme(theme: ThemeColor): void {
    if (!this.isClient) return;
    
    const root = document.documentElement;
    const isDark = root.classList.contains('dark');
    
    // Core theme variables
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--primary-foreground', theme.primaryForeground);
    root.style.setProperty('--ring', theme.primary);
    root.style.setProperty('--chart-1', theme.primary);
    root.style.setProperty('--chart-2', theme.accent);
    root.style.setProperty('--chart-3', theme.primary);
    root.style.setProperty('--chart-4', theme.accent);
    root.style.setProperty('--chart-5', theme.primary);
    
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
      root.style.setProperty('--border', '217.2 32.6% 17.5%');
      root.style.setProperty('--input', '217.2 32.6% 17.5%');
      root.style.setProperty('--accent', '217.2 32.6% 17.5%');
      root.style.setProperty('--accent-foreground', '210 40% 98%');
      root.style.setProperty('--sidebar', '222.2 84% 4.9%');
      root.style.setProperty('--sidebar-accent', '217.2 32.6% 17.5%');
      root.style.setProperty('--sidebar-border', '217.2 32.6% 17.5%');
    } else {
      // Light mode colors
      root.style.setProperty('--background', '0 0% 100%');
      root.style.setProperty('--foreground', '222.2 84% 4.9%');
      root.style.setProperty('--card', '0 0% 100%');
      root.style.setProperty('--card-foreground', '222.2 84% 4.9%');
      root.style.setProperty('--secondary', theme.secondary);
      root.style.setProperty('--secondary-foreground', '222.2 84% 4.9%');
      root.style.setProperty('--muted', theme.muted);
      root.style.setProperty('--muted-foreground', '215.4 16.3% 46.9%');
      root.style.setProperty('--border', '214.3 31.8% 91.4%');
      root.style.setProperty('--input', '214.3 31.8% 91.4%');
      root.style.setProperty('--accent', theme.accent);
      root.style.setProperty('--accent-foreground', '222.2 84% 4.9%');
      root.style.setProperty('--sidebar', theme.primary);
      root.style.setProperty('--sidebar-accent', theme.secondary);
      root.style.setProperty('--sidebar-border', '214.3 31.8% 91.4%');
    }
    
    // Common sidebar variables
    root.style.setProperty('--sidebar-foreground', theme.primaryForeground);
  }

  private saveTheme(theme: ThemeColor): void {
    // Theme is kept in memory only - no localStorage persistence
    // For persistent theme storage, use backend API
  }

  public getCurrentTheme(): ThemeColor {
    return this.currentTheme;
  }

  public getThemeByName(name: string): ThemeColor | undefined {
    return themeColors.find(theme => theme.name === name);
  }

  public getAllThemes(): ThemeColor[] {
    return themeColors;
  }
}

// Lazy singleton — never instantiated at module load time (safe for SSR)
let _instance: ThemeService | null = null;
const getInstance = (): ThemeService => {
  if (!_instance) _instance = new ThemeService();
  return _instance;
};

export const themeService = {
  setTheme: (theme: ThemeColor) => getInstance().setTheme(theme),
  getCurrentTheme: () => getInstance().getCurrentTheme(),
  getThemeByName: (name: string) => getInstance().getThemeByName(name),
  getAllThemes: () => getInstance().getAllThemes(),
  initializeTheme: () => getInstance().initializeTheme(),
};