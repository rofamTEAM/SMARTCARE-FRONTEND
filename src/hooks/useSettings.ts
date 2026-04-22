import { useState, useEffect, useCallback } from 'react';
import { SystemSettings } from '../types/settings';
import { SettingsService } from '../utils/settingsService';
import { toast } from 'sonner';

const defaultSettings: SystemSettings = {
  general: {
    hospitalName: 'ROFAM TECH SERVICES',
    address: 'Your Hospital Address',
    phone: 'Your Hospital Phone',
    email: 'Your Hospital Email',
    hospitalCode: 'Your Hospital Code',
    language: 'English',
    languageRTL: false,
    timezone: 'UTC',
    dateFormat: 'dd-mm-yyyy',
    timeFormat: '12',
    currency: 'KES',
    currencySymbol: 'kSH',
    creditLimit: 20000,
    doctorRestrictionMode: false,
    superadminVisibility: true
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: false,
    appointmentReminders: true,
    paymentReminders: true,
    systemAlerts: true,
    emergencyAlerts: true,
    maintenanceNotifications: false
  },
  sms: {
    provider: 'twilio',
    apiKey: '',
    apiSecret: '',
    senderName: 'Hospital',
    enabled: false,
    templates: {
      appointmentReminder: 'Your appointment is scheduled for {date} at {time}',
      paymentDue: 'Payment of {amount} is due on {date}',
      labResults: 'Your lab results are ready for collection',
      emergencyAlert: 'Emergency alert: {message}'
    }
  },
  email: {
    smtpHost: '',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '',
    smtpEncryption: 'tls',
    fromEmail: '',
    fromName: 'Hospital Management System',
    enabled: false,
    templates: {
      welcome: 'Welcome to our hospital management system',
      appointmentConfirmation: 'Your appointment has been confirmed',
      passwordReset: 'Password reset instructions',
      invoiceGenerated: 'Your invoice has been generated'
    }
  },
  paymentMethods: [
    { id: '1', name: 'Cash', type: 'cash', enabled: true, configuration: {} },
    { id: '2', name: 'Credit Card', type: 'card', enabled: true, configuration: {} },
    { id: '3', name: 'Bank Transfer', type: 'bank_transfer', enabled: false, configuration: {} },
    { id: '4', name: 'Insurance', type: 'insurance', enabled: true, configuration: {} }
  ],
  frontCMS: {
    siteName: 'Hospital Management System',
    siteDescription: 'Modern healthcare management solution',
    logo: '',
    favicon: '',
    primaryColor: '#3b82f6',
    secondaryColor: '#64748b',
    headerContent: '',
    footerContent: '',
    contactInfo: {
      address: '',
      phone: '',
      email: '',
      workingHours: '24/7'
    },
    socialMedia: {},
    seoSettings: {
      metaTitle: 'Hospital Management System',
      metaDescription: 'Comprehensive healthcare management platform',
      keywords: ['hospital', 'healthcare', 'management']
    }
  },
  roles: [],
  permissions: [],
  backup: {
    autoBackup: true,
    frequency: 'daily',
    time: '02:00',
    retentionDays: 30,
    includeFiles: true,
    compressionEnabled: true,
    encryptionEnabled: true,
    storageLocation: 'local'
  },
  languages: [
    { code: 'en', name: 'English', nativeName: 'English', rtl: false, enabled: true, translations: {} }
  ],
  users: [],
  modules: []
};

export function useSettings() {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load settings from API only
  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load from API only - no localStorage fallback
      const apiSettings = await SettingsService.getSettings();
      setSettings({ ...defaultSettings, ...apiSettings });
    } catch (apiError) {
      console.error('Failed to load settings from API:', apiError);
      setError('Failed to load settings');
      // Use default settings if API fails
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save settings to API only
  const saveSettings = useCallback(async (newSettings?: Partial<SystemSettings>) => {
    setSaving(true);
    setError(null);
    
    const settingsToSave = newSettings || settings;
    
    try {
      // Save to API only - no localStorage backup
      await SettingsService.saveSettings(settingsToSave);
      
      if (newSettings) {
        setSettings(prev => ({ ...prev, ...newSettings }));
      }
      
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      setError('Failed to save settings');
      toast.error('Failed to save settings');
      throw error;
    } finally {
      setSaving(false);
    }
  }, [settings]);

  // Update specific setting sections
  const updateGeneralSettings = useCallback((updates: Partial<SystemSettings['general']>) => {
    setSettings(prev => ({
      ...prev,
      general: { ...prev.general, ...updates }
    }));
  }, []);

  const updateNotificationSettings = useCallback((updates: Partial<SystemSettings['notifications']>) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, ...updates }
    }));
  }, []);

  const updateSMSSettings = useCallback((updates: Partial<SystemSettings['sms']>) => {
    setSettings(prev => ({
      ...prev,
      sms: { ...prev.sms, ...updates }
    }));
  }, []);

  const updateEmailSettings = useCallback((updates: Partial<SystemSettings['email']>) => {
    setSettings(prev => ({
      ...prev,
      email: { ...prev.email, ...updates }
    }));
  }, []);

  const updateBackupSettings = useCallback((updates: Partial<SystemSettings['backup']>) => {
    setSettings(prev => ({
      ...prev,
      backup: { ...prev.backup, ...updates }
    }));
  }, []);

  // Toggle payment method
  const togglePaymentMethod = useCallback((id: string) => {
    setSettings(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.map(method =>
        method.id === id ? { ...method, enabled: !method.enabled } : method
      )
    }));
  }, []);

  // Test configurations
  const testEmailConfig = useCallback(async () => {
    try {
      const success = await SettingsService.testEmailConfig(settings.email);
      if (success) {
        toast.success('Email configuration test successful!');
      } else {
        toast.error('Email configuration test failed');
      }
      return success;
    } catch (error) {
      toast.error('Failed to test email configuration');
      return false;
    }
  }, [settings.email]);

  const testSMSConfig = useCallback(async () => {
    try {
      const success = await SettingsService.testSMSConfig(settings.sms);
      if (success) {
        toast.success('SMS configuration test successful!');
      } else {
        toast.error('SMS configuration test failed');
      }
      return success;
    } catch (error) {
      toast.error('Failed to test SMS configuration');
      return false;
    }
  }, [settings.sms]);

  // Backup operations
  const createBackup = useCallback(async () => {
    try {
      const backup = await SettingsService.createBackup();
      const url = URL.createObjectURL(backup);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hospital-backup-${new Date().toISOString().split('T')[0]}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Backup created successfully!');
    } catch (error) {
      toast.error('Failed to create backup');
      throw error;
    }
  }, []);

  const restoreBackup = useCallback(async (file: File) => {
    try {
      await SettingsService.restoreBackup(file);
      toast.success('Backup restored successfully!');
      // Reload settings after restore
      await loadSettings();
    } catch (error) {
      toast.error('Failed to restore backup');
      throw error;
    }
  }, [loadSettings]);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    loading,
    saving,
    error,
    loadSettings,
    saveSettings,
    updateGeneralSettings,
    updateNotificationSettings,
    updateSMSSettings,
    updateEmailSettings,
    updateBackupSettings,
    togglePaymentMethod,
    testEmailConfig,
    testSMSConfig,
    createBackup,
    restoreBackup
  };
}