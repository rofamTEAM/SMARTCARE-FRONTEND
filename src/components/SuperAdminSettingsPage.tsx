'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, Globe, Bell, MessageSquare, Mail, CreditCard, 
  Layout, Shield, Database, Languages, Users, Package,
  Save, Eye, EyeOff, Plus, Trash2, Edit, Download, Upload,
  TestTube, Check, X, AlertCircle
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import { 
  GeneralSettings, NotificationSettings, SMSSettings, EmailSettings,
  PaymentMethod, FrontCMSSettings, Role, Permission, BackupSettings,
  Language, User, SystemModule, SystemSettings
} from '../types/settings';
import { SettingsService } from '../utils/settingsService';

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
  roles: [
    {
      id: '1',
      name: 'Super Admin',
      description: 'Full system access',
      permissions: ['*'],
      isSystem: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      name: 'Doctor',
      description: 'Medical staff access',
      permissions: ['patients.read', 'patients.write', 'appointments.read'],
      isSystem: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  permissions: [
    {
      id: '1',
      name: 'Patient Management',
      description: 'Manage patient records',
      module: 'patients',
      actions: ['create', 'read', 'update', 'delete']
    }
  ],
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
    { code: 'en', name: 'English', nativeName: 'English', rtl: false, enabled: true, translations: {} },
    { code: 'es', name: 'Spanish', nativeName: 'Español', rtl: false, enabled: false, translations: {} },
    { code: 'fr', name: 'French', nativeName: 'Français', rtl: false, enabled: false, translations: {} }
  ],
  users: [],
  modules: [
    {
      id: '1',
      name: 'Patient Management',
      description: 'Core patient management functionality',
      version: '1.0.0',
      enabled: true,
      dependencies: [],
      configuration: {},
      permissions: ['patients.*']
    }
  ]
};

export function SuperAdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [showPasswords, setShowPasswords] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testingSMS, setTestingSMS] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const loadedSettings = await SettingsService.getSettings();
      setSettings({ ...defaultSettings, ...loadedSettings });
    } catch (error) {
      // keep defaults
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      await SettingsService.saveSettings(settings);
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const testEmailConfiguration = async () => {
    setTestingEmail(true);
    try {
      const success = await SettingsService.testEmailConfig(settings.email);
      if (success) {
        toast.success('Email configuration test successful!');
      } else {
        toast.error('Email configuration test failed');
      }
    } catch (error) {
      toast.error('Failed to test email configuration');
    } finally {
      setTestingEmail(false);
    }
  };

  const testSMSConfiguration = async () => {
    setTestingSMS(true);
    try {
      const success = await SettingsService.testSMSConfig(settings.sms);
      if (success) {
        toast.success('SMS configuration test successful!');
      } else {
        toast.error('SMS configuration test failed');
      }
    } catch (error) {
      toast.error('Failed to test SMS configuration');
    } finally {
      setTestingSMS(false);
    }
  };

  const createBackup = async () => {
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
    }
  };

  const updateGeneralSettings = (updates: Partial<GeneralSettings>) => {
    setSettings(prev => ({ ...prev, general: { ...prev.general, ...updates } }));
  };

  const updateNotificationSettings = (updates: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, notifications: { ...prev.notifications, ...updates } }));
  };

  const updateSMSSettings = (updates: Partial<SMSSettings>) => {
    setSettings(prev => ({ ...prev, sms: { ...prev.sms, ...updates } }));
  };

  const updateEmailSettings = (updates: Partial<EmailSettings>) => {
    setSettings(prev => ({ ...prev, email: { ...prev.email, ...updates } }));
  };

  const updateBackupSettings = (updates: Partial<BackupSettings>) => {
    setSettings(prev => ({ ...prev, backup: { ...prev.backup, ...updates } }));
  };

  const togglePaymentMethod = (id: string) => {
    setSettings(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.map(method =>
        method.id === id ? { ...method, enabled: !method.enabled } : method
      )
    }));
  };

  return (
    <div className="space-y-6 p-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Settings className="size-6 text-primary" />
            <h1 className="text-3xl font-bold">Super Admin Settings</h1>
          </div>
          <Button onClick={saveSettings} disabled={loading} className="bg-primary">
            <Save className="size-4 mr-2" />
            {loading ? 'Saving...' : 'Save All Settings'}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-6 lg:grid-cols-11 w-full">
            <TabsTrigger value="general">
              <Globe className="size-4 mr-1" />
              General
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="size-4 mr-1" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="sms">
              <MessageSquare className="size-4 mr-1" />
              SMS
            </TabsTrigger>
            <TabsTrigger value="email">
              <Mail className="size-4 mr-1" />
              Email
            </TabsTrigger>
            <TabsTrigger value="payments">
              <CreditCard className="size-4 mr-1" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="cms">
              <Layout className="size-4 mr-1" />
              CMS
            </TabsTrigger>
            <TabsTrigger value="roles">
              <Shield className="size-4 mr-1" />
              Roles
            </TabsTrigger>
            <TabsTrigger value="backup">
              <Database className="size-4 mr-1" />
              Backup
            </TabsTrigger>
            <TabsTrigger value="languages">
              <Languages className="size-4 mr-1" />
              Languages
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="size-4 mr-1" />
              Users
            </TabsTrigger>
            <TabsTrigger value="modules">
              <Package className="size-4 mr-1" />
              Modules
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="size-5" />
                  General Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Hospital Name</Label>
                    <Input
                      value={settings.general.hospitalName}
                      onChange={(e) => updateGeneralSettings({ hospitalName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hospital Code</Label>
                    <Input
                      value={settings.general.hospitalCode}
                      onChange={(e) => updateGeneralSettings({ hospitalCode: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Address</Label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-md"
                    rows={3}
                    value={settings.general.address}
                    onChange={(e) => updateGeneralSettings({ address: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={settings.general.phone}
                      onChange={(e) => updateGeneralSettings({ phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={settings.general.email}
                      onChange={(e) => updateGeneralSettings({ email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <select
                      className="w-full px-3 py-2 border rounded-md"
                      value={settings.general.language}
                      onChange={(e) => updateGeneralSettings({ language: e.target.value })}
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <select
                      className="w-full px-3 py-2 border rounded-md"
                      value={settings.general.timezone}
                      onChange={(e) => updateGeneralSettings({ timezone: e.target.value })}
                    >
                      <option value="UTC">UTC</option>
                      <option value="EST">EST</option>
                      <option value="PST">PST</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date Format</Label>
                    <select
                      className="w-full px-3 py-2 border rounded-md"
                      value={settings.general.dateFormat}
                      onChange={(e) => updateGeneralSettings({ dateFormat: e.target.value })}
                    >
                      <option value="dd-mm-yyyy">DD-MM-YYYY</option>
                      <option value="mm-dd-yyyy">MM-DD-YYYY</option>
                      <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Time Format</Label>
                    <select
                      className="w-full px-3 py-2 border rounded-md"
                      value={settings.general.timeFormat}
                      onChange={(e) => updateGeneralSettings({ timeFormat: e.target.value as '12' | '24' })}
                    >
                      <option value="12">12 Hour</option>
                      <option value="24">24 Hour</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Input
                      value={settings.general.currency}
                      onChange={(e) => updateGeneralSettings({ currency: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Currency Symbol</Label>
                    <Input
                      value={settings.general.currencySymbol}
                      onChange={(e) => updateGeneralSettings({ currencySymbol: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Credit Limit</Label>
                    <Input
                      type="number"
                      value={settings.general.creditLimit}
                      onChange={(e) => updateGeneralSettings({ creditLimit: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-semibold">System Options</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Language RTL Text Mode</Label>
                        <p className="text-sm text-muted-foreground">Enable right-to-left text direction</p>
                      </div>
                      <Switch
                        checked={settings.general.languageRTL}
                        onCheckedChange={(checked) => updateGeneralSettings({ languageRTL: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Doctor Restriction Mode</Label>
                        <p className="text-sm text-muted-foreground">Restrict doctor access to assigned patients only</p>
                      </div>
                      <Switch
                        checked={settings.general.doctorRestrictionMode}
                        onCheckedChange={(checked) => updateGeneralSettings({ doctorRestrictionMode: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Superadmin Visibility</Label>
                        <p className="text-sm text-muted-foreground">Show superadmin in user lists and reports</p>
                      </div>
                      <Switch
                        checked={settings.general.superadminVisibility}
                        onCheckedChange={(checked) => updateGeneralSettings({ superadminVisibility: checked })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SMS Settings */}
          <TabsContent value="sms">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="size-5" />
                  SMS Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label>SMS Service Enabled</Label>
                    <p className="text-sm text-muted-foreground">Enable SMS notifications and alerts</p>
                  </div>
                  <Switch
                    checked={settings.sms.enabled}
                    onCheckedChange={(checked) => updateSMSSettings({ enabled: checked })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Provider</Label>
                    <select
                      className="w-full px-3 py-2 border rounded-md"
                      value={settings.sms.provider}
                      onChange={(e) => updateSMSSettings({ provider: e.target.value as any })}
                    >
                      <option value="twilio">Twilio</option>
                      <option value="nexmo">Nexmo</option>
                      <option value="aws-sns">AWS SNS</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Sender Name</Label>
                    <Input
                      value={settings.sms.senderName}
                      onChange={(e) => updateSMSSettings({ senderName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>API Key</Label>
                    <div className="relative">
                      <Input
                        type={showPasswords ? 'text' : 'password'}
                        value={settings.sms.apiKey}
                        onChange={(e) => updateSMSSettings({ apiKey: e.target.value })}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() => setShowPasswords(!showPasswords)}
                      >
                        {showPasswords ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>API Secret</Label>
                    <Input
                      type={showPasswords ? 'text' : 'password'}
                      value={settings.sms.apiSecret}
                      onChange={(e) => updateSMSSettings({ apiSecret: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={testSMSConfiguration}
                    disabled={testingSMS || !settings.sms.enabled}
                  >
                    <TestTube className="size-4 mr-2" />
                    {testingSMS ? 'Testing...' : 'Test Configuration'}
                  </Button>
                </div>

                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-semibold">SMS Templates</h3>
                  {Object.entries(settings.sms.templates).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
                      <textarea
                        className="w-full px-3 py-2 border rounded-md"
                        rows={2}
                        value={value}
                        onChange={(e) => updateSMSSettings({
                          templates: { ...settings.sms.templates, [key]: e.target.value }
                        })}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Settings */}
          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="size-5" />
                  Email Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label>Email Service Enabled</Label>
                    <p className="text-sm text-muted-foreground">Enable email notifications and communications</p>
                  </div>
                  <Switch
                    checked={settings.email.enabled}
                    onCheckedChange={(checked) => updateEmailSettings({ enabled: checked })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>SMTP Host</Label>
                    <Input
                      value={settings.email.smtpHost}
                      onChange={(e) => updateEmailSettings({ smtpHost: e.target.value })}
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>SMTP Port</Label>
                    <Input
                      type="number"
                      value={settings.email.smtpPort}
                      onChange={(e) => updateEmailSettings({ smtpPort: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Username</Label>
                    <Input
                      value={settings.email.smtpUsername}
                      onChange={(e) => updateEmailSettings({ smtpUsername: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input
                      type={showPasswords ? 'text' : 'password'}
                      value={settings.email.smtpPassword}
                      onChange={(e) => updateEmailSettings({ smtpPassword: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Encryption</Label>
                    <select
                      className="w-full px-3 py-2 border rounded-md"
                      value={settings.email.smtpEncryption}
                      onChange={(e) => updateEmailSettings({ smtpEncryption: e.target.value as any })}
                    >
                      <option value="tls">TLS</option>
                      <option value="ssl">SSL</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>From Email</Label>
                    <Input
                      type="email"
                      value={settings.email.fromEmail}
                      onChange={(e) => updateEmailSettings({ fromEmail: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>From Name</Label>
                    <Input
                      value={settings.email.fromName}
                      onChange={(e) => updateEmailSettings({ fromName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={testEmailConfiguration}
                    disabled={testingEmail || !settings.email.enabled}
                  >
                    <TestTube className="size-4 mr-2" />
                    {testingEmail ? 'Testing...' : 'Test Configuration'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Methods */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="size-5" />
                  Payment Methods
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {settings.paymentMethods.map((method) => (
                    <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${method.enabled ? 'bg-primary' : 'bg-gray-300'}`} />
                        <div>
                          <h4 className="font-medium">{method.name}</h4>
                          <p className="text-sm text-muted-foreground capitalize">{method.type.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <Switch 
                        checked={method.enabled} 
                        onCheckedChange={() => togglePaymentMethod(method.id)}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Backup Settings */}
          <TabsContent value="backup">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="size-5" />
                  Backup & Restore
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto Backup</Label>
                    <p className="text-sm text-muted-foreground">Automatically create system backups</p>
                  </div>
                  <Switch
                    checked={settings.backup.autoBackup}
                    onCheckedChange={(checked) => updateBackupSettings({ autoBackup: checked })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Frequency</Label>
                    <select
                      className="w-full px-3 py-2 border rounded-md"
                      value={settings.backup.frequency}
                      onChange={(e) => updateBackupSettings({ frequency: e.target.value as any })}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Backup Time</Label>
                    <Input
                      type="time"
                      value={settings.backup.time}
                      onChange={(e) => updateBackupSettings({ time: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Retention (Days)</Label>
                    <Input
                      type="number"
                      value={settings.backup.retentionDays}
                      onChange={(e) => updateBackupSettings({ retentionDays: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Include Files</Label>
                    <Switch
                      checked={settings.backup.includeFiles}
                      onCheckedChange={(checked) => updateBackupSettings({ includeFiles: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Compression</Label>
                    <Switch
                      checked={settings.backup.compressionEnabled}
                      onCheckedChange={(checked) => updateBackupSettings({ compressionEnabled: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Encryption</Label>
                    <Switch
                      checked={settings.backup.encryptionEnabled}
                      onCheckedChange={(checked) => updateBackupSettings({ encryptionEnabled: checked })}
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t">
                  <Button variant="outline" onClick={createBackup}>
                    <Download className="size-4 mr-2" />
                    Create Backup Now
                  </Button>
                  <Button variant="outline">
                    <Upload className="size-4 mr-2" />
                    Restore Backup
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Placeholder tabs */}
          {['notifications', 'cms', 'roles', 'languages', 'users', 'modules'].map((tab) => (
            <TabsContent key={tab} value={tab}>
              <Card>
                <CardHeader>
                  <CardTitle className="capitalize">{tab} Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg">
                    <AlertCircle className="size-5 text-primary" />
                    <p className="text-blue-800">
                      {tab.charAt(0).toUpperCase() + tab.slice(1)} management interface will be implemented here.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </motion.div>
    </div>
  );
}

