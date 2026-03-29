import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Settings, Globe, Mail, Phone, MapPin, Clock, DollarSign, Palette, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { colorThemes, getCurrentTheme, setCurrentTheme, applyTheme } from '../utils/themeColors';
import { settingsApi } from '../utils/api';

interface HospitalSettings {
  hospitalName: string;
  hospitalAddress: string;
  hospitalPhone: string;
  hospitalEmail: string;
  hospitalWebsite: string;
  currency: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  language: string;
  fiscalYearStart: string;
  taxRate: number;
  emergencyContact: string;
  licenseNumber: string;
  establishedYear: string;
  bedCapacity: number;
  departments: string[];
  workingHours: {
    start: string;
    end: string;
  };
  emergencyHours: {
    available: boolean;
    contact: string;
  };
}

interface SystemSettingsProps {
  session: any;
}

export function SystemSettings({ session }: SystemSettingsProps) {
  const [settings, setSettings] = useState<HospitalSettings>({
    hospitalName: 'SmartCare Hospital',
    hospitalAddress: '',
    hospitalPhone: '',
    hospitalEmail: '',
    hospitalWebsite: '',
    currency: 'USD',
    timezone: 'UTC',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24',
    language: 'English',
    fiscalYearStart: 'January',
    taxRate: 0,
    emergencyContact: '',
    licenseNumber: '',
    establishedYear: '',
    bedCapacity: 0,
    departments: [],
    workingHours: {
      start: '08:00',
      end: '18:00'
    },
    emergencyHours: {
      available: true,
      contact: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(() => {
    const current = getCurrentTheme();
    return colorThemes[current] || colorThemes.blue;
  });

  useEffect(() => {
    loadSettings();
    
    // Listen for theme changes from other components
    const handleThemeChangeEvent = (event: CustomEvent) => {
      const themeKey = event.detail.theme;
      const theme = colorThemes[themeKey];
      if (theme) {
        setSelectedTheme(theme);
      }
    };
    
    window.addEventListener('themeChanged', handleThemeChangeEvent as EventListener);
    
    return () => {
      window.removeEventListener('themeChanged', handleThemeChangeEvent as EventListener);
    };
  }, []);

  const loadSettings = async () => {
    try {
      const data = await settingsApi.get();
      if (data?.general) setSettings(prev => ({ ...prev, ...data }));
    } catch (error) {
      // keep defaults
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await settingsApi.save({ general: settings });
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = (themeKey: string) => {
    const theme = colorThemes[themeKey];
    if (theme) {
      setSelectedTheme(theme);
      setCurrentTheme(themeKey);
      applyTheme(theme);
      
      // Force immediate visual update
      requestAnimationFrame(() => {
        // Trigger a reflow to ensure styles are applied
        document.body.offsetHeight;
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: themeKey, themeData: theme } }));
      });
      
      toast.success(`Theme changed to ${theme.name}`);
    }
  };

  const currencies = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'JPY'];
  const timezones = ['UTC', 'EST', 'PST', 'GMT', 'IST', 'CET', 'JST'];
  const languages = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Arabic'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Settings className="size-6" />
            <h1 className="text-2xl font-bold">System Settings</h1>
          </div>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="size-4 mr-2" />
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Theme Customization */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="size-5" />
                Theme Customization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Select System Theme</Label>
                  <p className="text-sm text-muted-foreground">Choose a color theme that will be applied across the entire hospital management system.</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(colorThemes).map(([key, theme]) => (
                    <motion.div
                      key={key}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative cursor-pointer rounded-lg p-4 border-2 transition-all ${
                        selectedTheme.name === theme.name
                          ? 'border-2 shadow-lg'
                          : 'border-border hover:border-muted-foreground'
                      }`}
                      style={{
                        borderColor: selectedTheme.name === theme.name ? theme.primary : undefined,
                        backgroundColor: selectedTheme.name === theme.name ? `${theme.primary}10` : 'hsl(var(--card))'
                      }}
                      onClick={() => handleThemeChange(key)}
                    >
                      <div className="text-center">
                        <div className="w-8 h-8 rounded-full mx-auto mb-2" style={{ backgroundColor: theme.primary }} />
                        <h4 className="text-sm font-medium text-card-foreground mb-1">{theme.name}</h4>
                        <div className="flex justify-center gap-1">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.primary }} />
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.secondary }} />
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.accent }} />
                        </div>
                      </div>
                      {selectedTheme.name === theme.name && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: 'hsl(var(--card))' }}
                        >
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.primary }} />
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Current Theme:</strong> {selectedTheme.name}
                  </p>
                  <p className="text-xs text-primary mt-1">
                    Theme changes are applied immediately and saved automatically. The selected theme will affect all components including buttons, cards, charts, and navigation elements.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Hospital Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="size-5" />
                Hospital Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hospitalName">Hospital Name</Label>
                <Input
                  id="hospitalName"
                  value={settings.hospitalName}
                  onChange={(e) => setSettings({ ...settings, hospitalName: e.target.value })}
                  placeholder="Enter hospital name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hospitalAddress">Address</Label>
                <textarea
                  id="hospitalAddress"
                  value={settings.hospitalAddress}
                  onChange={(e) => setSettings({ ...settings, hospitalAddress: e.target.value })}
                  placeholder="Enter hospital address"
                  className="w-full px-3 py-2 border border-border rounded-md"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hospitalPhone">Phone</Label>
                  <Input
                    id="hospitalPhone"
                    value={settings.hospitalPhone}
                    onChange={(e) => setSettings({ ...settings, hospitalPhone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hospitalEmail">Email</Label>
                  <Input
                    id="hospitalEmail"
                    type="email"
                    value={settings.hospitalEmail}
                    onChange={(e) => setSettings({ ...settings, hospitalEmail: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hospitalWebsite">Website</Label>
                <Input
                  id="hospitalWebsite"
                  value={settings.hospitalWebsite}
                  onChange={(e) => setSettings({ ...settings, hospitalWebsite: e.target.value })}
                  placeholder="Enter website URL"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">License Number</Label>
                  <Input
                    id="licenseNumber"
                    value={settings.licenseNumber}
                    onChange={(e) => setSettings({ ...settings, licenseNumber: e.target.value })}
                    placeholder="Enter license number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="establishedYear">Established Year</Label>
                  <Input
                    id="establishedYear"
                    value={settings.establishedYear}
                    onChange={(e) => setSettings({ ...settings, establishedYear: e.target.value })}
                    placeholder="Enter year"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="size-5" />
                System Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <select
                    id="currency"
                    value={settings.currency}
                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md"
                  >
                    {currencies.map(currency => (
                      <option key={currency} value={currency}>{currency}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <select
                    id="timezone"
                    value={settings.timezone}
                    onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md"
                  >
                    {timezones.map(timezone => (
                      <option key={timezone} value={timezone}>{timezone}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <select
                    id="dateFormat"
                    value={settings.dateFormat}
                    onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeFormat">Time Format</Label>
                  <select
                    id="timeFormat"
                    value={settings.timeFormat}
                    onChange={(e) => setSettings({ ...settings, timeFormat: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md"
                  >
                    <option value="12">12 Hour</option>
                    <option value="24">24 Hour</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <select
                  id="language"
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md"
                >
                  {languages.map(language => (
                    <option key={language} value={language}>{language}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fiscalYearStart">Fiscal Year Start</Label>
                  <select
                    id="fiscalYearStart"
                    value={settings.fiscalYearStart}
                    onChange={(e) => setSettings({ ...settings, fiscalYearStart: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md"
                  >
                    {months.map(month => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    value={settings.taxRate}
                    onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) || 0 })}
                    placeholder="Enter tax rate"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Operational Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="size-5" />
                Operational Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bedCapacity">Bed Capacity</Label>
                <Input
                  id="bedCapacity"
                  type="number"
                  value={settings.bedCapacity}
                  onChange={(e) => setSettings({ ...settings, bedCapacity: parseInt(e.target.value) || 0 })}
                  placeholder="Enter total bed capacity"
                />
              </div>
              <div className="space-y-2">
                <Label>Working Hours</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="workingStart">Start Time</Label>
                    <Input
                      id="workingStart"
                      type="time"
                      value={settings.workingHours.start}
                      onChange={(e) => setSettings({ 
                        ...settings, 
                        workingHours: { ...settings.workingHours, start: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="workingEnd">End Time</Label>
                    <Input
                      id="workingEnd"
                      type="time"
                      value={settings.workingHours.end}
                      onChange={(e) => setSettings({ 
                        ...settings, 
                        workingHours: { ...settings.workingHours, end: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input
                  id="emergencyContact"
                  value={settings.emergencyContact}
                  onChange={(e) => setSettings({ ...settings, emergencyContact: e.target.value })}
                  placeholder="Enter emergency contact number"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="emergencyAvailable"
                  checked={settings.emergencyHours.available}
                  onChange={(e) => setSettings({
                    ...settings,
                    emergencyHours: { ...settings.emergencyHours, available: e.target.checked }
                  })}
                  className="rounded"
                />
                <Label htmlFor="emergencyAvailable">24/7 Emergency Services Available</Label>
              </div>
            </CardContent>
          </Card>

          {/* Backup & Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="size-5" />
                Backup & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <Button variant="outline" className="w-full">
                  <Save className="size-4 mr-2" />
                  Create Database Backup
                </Button>
                <Button variant="outline" className="w-full">
                  <Settings className="size-4 mr-2" />
                  Configure Auto Backup
                </Button>
                <Button variant="outline" className="w-full">
                  <Shield className="size-4 mr-2" />
                  Security Settings
                </Button>
                <Button variant="outline" className="w-full">
                  <Globe className="size-4 mr-2" />
                  System Logs
                </Button>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Regular backups are recommended to prevent data loss. 
                  Configure automatic backups for better data security.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}

