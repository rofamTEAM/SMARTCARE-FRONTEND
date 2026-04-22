import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Building2,
  Bell,
  Mail,
  Phone,
  CreditCard,
  Globe,
  Shield,
  Users,
  Database,
  Languages,
  Grid3X3,
  Save,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { superAdminService } from '../services/superadmin.service';

interface GeneralSettings {
  hospitalName: string;
  address: string;
  phone: string;
  email: string;
  hospitalCode: string;
  language: string;
  isRtl: boolean;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  currency: string;
  currencySymbol: string;
  creditLimit: number;
  doctorRestriction: boolean;
  superadminVisibility: boolean;
}

export function SuperAdminSettingsConnected() {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    hospitalName: 'ROFAM TECH SERVICES',
    address: 'Your Hospital Address',
    phone: 'Your Hospital Phone',
    email: 'Your Hospital Email',
    hospitalCode: 'Your Hospital Code',
    language: 'English',
    isRtl: false,
    timezone: 'UTC',
    dateFormat: 'dd-mm-yyyy',
    timeFormat: '12',
    currency: 'KES',
    currencySymbol: 'kSH',
    creditLimit: 20000,
    doctorRestriction: false,
    superadminVisibility: true
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: false,
    appointmentReminders: true,
    paymentReminders: true,
    systemAlerts: true,
    emergencyAlerts: true,
    maintenanceNotifications: false,
  });

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' }
  ];

  const timezones = [
    'UTC', 'EST', 'PST', 'GMT', 'IST', 'CET', 'JST', 'AEST'
  ];

  const currencies = [
    { code: 'USD', symbol: '$' },
    { code: 'EUR', symbol: '€' },
    { code: 'GBP', symbol: '£' },
    { code: 'KES', symbol: 'kSH' },
    { code: 'INR', symbol: '₹' },
    { code: 'JPY', symbol: '¥' }
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setInitialLoading(true);
      const settings = await superAdminService.getSystemSettings();
      
      if (settings) {
        // Map backend settings to frontend state
        if (settings.general) {
          setGeneralSettings(prev => ({ ...prev, ...settings.general }));
        }
        if (settings.notifications) {
          setNotificationSettings(prev => ({ ...prev, ...settings.notifications }));
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSaveGeneralSettings = async () => {
    setLoading(true);
    try {
      await superAdminService.updateSystemSettings({
        general: generalSettings
      });
      toast.success('General settings saved successfully');
    } catch (error) {
      toast.error('Failed to save general settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotificationSettings = async () => {
    setLoading(true);
    try {
      await superAdminService.updateSystemSettings({
        notifications: notificationSettings
      });
      toast.success('Notification settings saved successfully');
    } catch (error) {
      toast.error('Failed to save notification settings');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Settings className="size-8 text-primary" />
              Super Admin Settings
            </h1>
            <p className="text-muted-foreground mt-1">Configure system-wide settings and preferences</p>
          </div>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Building2 className="size-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="size-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="size-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Database className="size-4" />
            <span className="hidden sm:inline">System</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings Tab */}
        <TabsContent value="general" className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle>Hospital Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hospitalName">Hospital Name</Label>
                    <Input
                      id="hospitalName"
                      value={generalSettings.hospitalName}
                      onChange={(e) =>
                        setGeneralSettings({ ...generalSettings, hospitalName: e.target.value })
                      }
                      placeholder="Enter hospital name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hospitalCode">Hospital Code</Label>
                    <Input
                      id="hospitalCode"
                      value={generalSettings.hospitalCode}
                      onChange={(e) =>
                        setGeneralSettings({ ...generalSettings, hospitalCode: e.target.value })
                      }
                      placeholder="Enter hospital code"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={generalSettings.address}
                    onChange={(e) =>
                      setGeneralSettings({ ...generalSettings, address: e.target.value })
                    }
                    placeholder="Enter hospital address"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={generalSettings.phone}
                      onChange={(e) =>
                        setGeneralSettings({ ...generalSettings, phone: e.target.value })
                      }
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={generalSettings.email}
                      onChange={(e) =>
                        setGeneralSettings({ ...generalSettings, email: e.target.value })
                      }
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader>
                <CardTitle>Localization & Format</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select value={generalSettings.language} onValueChange={(value) =>
                      setGeneralSettings({ ...generalSettings, language: value })
                    }>
                      <SelectTrigger id="language">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.code} value={lang.name}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={generalSettings.timezone} onValueChange={(value) =>
                      setGeneralSettings({ ...generalSettings, timezone: value })
                    }>
                      <SelectTrigger id="timezone">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timezones.map((tz) => (
                          <SelectItem key={tz} value={tz}>
                            {tz}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <Select value={generalSettings.dateFormat} onValueChange={(value) =>
                      setGeneralSettings({ ...generalSettings, dateFormat: value })
                    }>
                      <SelectTrigger id="dateFormat">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dd-mm-yyyy">DD-MM-YYYY</SelectItem>
                        <SelectItem value="mm-dd-yyyy">MM-DD-YYYY</SelectItem>
                        <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={generalSettings.currency} onValueChange={(value) => {
                      const curr = currencies.find(c => c.code === value);
                      setGeneralSettings({
                        ...generalSettings,
                        currency: value,
                        currencySymbol: curr?.symbol || value
                      });
                    }}>
                      <SelectTrigger id="currency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((curr) => (
                          <SelectItem key={curr.code} value={curr.code}>
                            {curr.code} ({curr.symbol})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="rtl">Right-to-Left Layout</Label>
                    <Switch
                      id="rtl"
                      checked={generalSettings.isRtl}
                      onCheckedChange={(checked) =>
                        setGeneralSettings({ ...generalSettings, isRtl: checked })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader>
                <CardTitle>Financial Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="creditLimit">Credit Limit (KES)</Label>
                  <Input
                    id="creditLimit"
                    type="number"
                    value={generalSettings.creditLimit}
                    onChange={(e) =>
                      setGeneralSettings({ ...generalSettings, creditLimit: parseInt(e.target.value) })
                    }
                    placeholder="Enter credit limit"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="doctorRestriction">Doctor Restriction Mode</Label>
                    <Switch
                      id="doctorRestriction"
                      checked={generalSettings.doctorRestriction}
                      onCheckedChange={(checked) =>
                        setGeneralSettings({ ...generalSettings, doctorRestriction: checked })
                      }
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Restrict doctors from accessing certain features
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <Button
            onClick={handleSaveGeneralSettings}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            <Save className="size-4 mr-2" />
            Save General Settings
          </Button>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {Object.entries(notificationSettings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 rounded-lg border">
                      <Label className="capitalize cursor-pointer">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                      <Switch
                        checked={value}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            [key]: checked
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <Button
            onClick={handleSaveNotificationSettings}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            <Save className="size-4 mr-2" />
            Save Notification Settings
          </Button>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-yellow-900 flex items-center gap-2">
                  <AlertCircle className="size-5" />
                  Security Notice
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-yellow-800">
                  Security settings are managed through the RBAC system. Use the User Management section to configure role-based access control and permissions.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-900 flex items-center gap-2">
                  <Database className="size-5" />
                  System Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-blue-800">API Version:</span>
                  <Badge variant="outline">1.0.0</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-800">Database:</span>
                  <Badge variant="outline">PostgreSQL</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-800">Status:</span>
                  <Badge className="bg-green-100 text-green-800">Operational</Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
