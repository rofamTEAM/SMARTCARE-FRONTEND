import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Pill,
  Package,
  ShoppingCart,
  AlertTriangle,
  AlertCircle,
  TrendingDown,
  Search,
  Plus,
  Edit,
  Trash2,
  FileText,
  DollarSign,
  Calendar,
  User,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { toast } from 'sonner';
import { TodoListWidget } from './TodoListWidget';
import { DrugInteractionChecker } from './DrugInteractionChecker';
import { AIInsightPanel } from './AIInsightPanel';
import { VoiceAgent } from './VoiceAgent';
import { useErrorHandler } from '../hooks/useErrorHandler';

interface Medication {
  id: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  price: number;
  expiryDate: string;
  manufacturer: string;
  batchNumber: string;
}

interface Prescription {
  id: string;
  patientName: string;
  doctorName: string;
  medications: string[];
  date: string;
  status: 'pending' | 'dispensed' | 'completed';
}

export function PharmacyManagement() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Medication>>({});
  const { handleFetchError, handleSubmitError } = useErrorHandler();

  useEffect(() => {
    fetchPharmacyData();
  }, []);

  const fetchPharmacyData = async () => {
    try {
      setLoading(true);
      setError(null);
      const { pharmacyApi } = await import('../utils/api');
      const medData = await pharmacyApi.getMedicines();
      const formattedMeds: Medication[] = (medData || []).map((med: any) => ({
        id: med.id,
        name: med.name || med.medicine_name,
        category: med.category || med.medicine_category || 'General',
        stock: med.stock || med.quantity || 0,
        minStock: med.minStock || med.min_stock || 100,
        price: med.price || med.sale_rate || 0,
        expiryDate: med.expiryDate?.split('T')[0] || med.expiry_date || '2025-12-31',
        manufacturer: med.manufacturer || 'Unknown',
        batchNumber: med.batchNumber || med.batch_no || 'N/A'
      }));
      setMedications(formattedMeds.length > 0 ? formattedMeds : []);
    } catch (error) {
      const message = handleFetchError(error, 'pharmacy medications');
      setError(message);
      setMedications([]);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      label: 'Total Medications',
      value: medications.length.toString(),
      icon: Pill,
      color: 'bg-primary',
    },
    {
      label: 'Low Stock Items',
      value: medications.filter((m) => m.stock < m.minStock).length.toString(),
      icon: AlertTriangle,
      color: 'bg-destructive',
    },
    {
      label: 'Pending Prescriptions',
      value: prescriptions.filter((p) => p.status === 'pending').length.toString(),
      icon: FileText,
      color: 'bg-amber-500',
    },
    {
      label: 'Today\'s Revenue',
      value: '$2,450',
      icon: DollarSign,
      color: 'bg-primary',
    },
  ];

  const filteredMedications = medications.filter(
    (med) =>
      med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockMeds = medications.filter((m) => m.stock < m.minStock);

  const handleAddMedication = async () => {
    if (!formData.name || !formData.category) {
      toast.error('Please fill in required fields');
      return;
    }
    try {
      setError(null);
      const { pharmacyApi } = await import('../utils/api');
      const newMed = await pharmacyApi.createMedicine({
        name: formData.name,
        category: formData.category,
        stock: formData.stock || 0,
        minStock: formData.minStock || 0,
        price: formData.price || 0,
        expiryDate: formData.expiryDate || '',
        manufacturer: formData.manufacturer || '',
        batchNumber: formData.batchNumber || '',
      });
      setMedications([...medications, newMed]);
      setFormData({});
      setIsAddModalOpen(false);
      toast.success('Medication added successfully!');
    } catch (err) {
      const message = handleSubmitError(err, 'add medication');
      setError(message);
    }
  };

  const handleDispensePrescription = (id: string) => {
    setPrescriptions(
      prescriptions.map((p) =>
        p.id === id ? { ...p, status: 'dispensed' as const } : p
      )
    );
  };

  return (
    <div className="p-6 space-y-6">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-3"
        >
          <AlertCircle className="size-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-destructive">Error Loading Data</p>
            <p className="text-sm text-destructive/80 mt-1">{error}</p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={fetchPharmacyData}
            className="text-destructive hover:text-destructive"
          >
            Retry
          </Button>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-gray-900">Pharmacy Management</h1>
          <p className="text-muted-foreground">Manage medications, prescriptions, and inventory</p>
        </div>
        <VoiceAgent department="pharmacy" userRole="pharmacist" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl mt-2">{stat.value}</p>
                    </div>
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <Icon className="size-6 text-card-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Tabs defaultValue="inventory" className="space-y-4">
            <TabsList>
              <TabsTrigger value="inventory">Medication Inventory</TabsTrigger>
              <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
              <TabsTrigger value="low-stock">Low Stock Alerts</TabsTrigger>
            </TabsList>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Medication Inventory</CardTitle>
                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setFormData({})}>
                      <Plus className="size-4 mr-2" />
                      Add Medication
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add New Medication</DialogTitle>
                      <DialogDescription>
                        Add a new medication to the inventory.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Medication Name</Label>
                        <Input
                          id="name"
                          value={formData.name || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          placeholder="Enter medication name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) =>
                            setFormData({ ...formData, category: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Antibiotic">Antibiotic</SelectItem>
                            <SelectItem value="Pain Relief">Pain Relief</SelectItem>
                            <SelectItem value="Diabetes">Diabetes</SelectItem>
                            <SelectItem value="Cardiovascular">Cardiovascular</SelectItem>
                            <SelectItem value="Respiratory">Respiratory</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="stock">Stock Quantity</Label>
                        <Input
                          id="stock"
                          type="number"
                          value={formData.stock || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, stock: Number(e.target.value) })
                          }
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="minStock">Minimum Stock</Label>
                        <Input
                          id="minStock"
                          type="number"
                          value={formData.minStock || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, minStock: Number(e.target.value) })
                          }
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price">Price ($)</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={formData.price || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, price: Number(e.target.value) })
                          }
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <Input
                          id="expiryDate"
                          type="date"
                          value={formData.expiryDate || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, expiryDate: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="manufacturer">Manufacturer</Label>
                        <Input
                          id="manufacturer"
                          value={formData.manufacturer || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, manufacturer: e.target.value })
                          }
                          placeholder="Enter manufacturer"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="batchNumber">Batch Number</Label>
                        <Input
                          id="batchNumber"
                          value={formData.batchNumber || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, batchNumber: e.target.value })
                          }
                          placeholder="Enter batch number"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddMedication}>Add Medication</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                <Input
                  placeholder="Search medications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 text-sm text-muted-foreground">Medication</th>
                      <th className="text-left p-3 text-sm text-muted-foreground">Category</th>
                      <th className="text-left p-3 text-sm text-muted-foreground">Stock</th>
                      <th className="text-left p-3 text-sm text-muted-foreground">Price</th>
                      <th className="text-left p-3 text-sm text-muted-foreground">Expiry Date</th>
                      <th className="text-left p-3 text-sm text-muted-foreground">Batch</th>
                      <th className="text-right p-3 text-sm text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMedications.map((med) => (
                      <motion.tr
                        key={med.id}
                        whileHover={{ backgroundColor: '#f9fafb' }}
                        className="border-b"
                      >
                        <td className="p-3">
                          <div>
                            <p className="text-gray-900">{med.name}</p>
                            <p className="text-xs text-muted-foreground">{med.manufacturer}</p>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline">{med.category}</Badge>
                        </td>
                        <td className="p-3">
                          <span
                            className={
                              med.stock < med.minStock
                                ? 'text-destructive'
                                : 'text-gray-900'
                            }
                          >
                            {med.stock}
                          </span>
                          <span className="text-xs text-muted-foreground"> / {med.minStock}</span>
                        </td>
                        <td className="p-3">${med.price.toFixed(2)}</td>
                        <td className="p-3 text-sm text-muted-foreground">{med.expiryDate}</td>
                        <td className="p-3 text-sm text-muted-foreground">{med.batchNumber}</td>
                        <td className="p-3">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline">
                              <Edit className="size-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="size-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prescriptions Tab */}
        <TabsContent value="prescriptions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Prescription Queue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {prescriptions.map((prescription) => (
                  <motion.div
                    key={prescription.id}
                    whileHover={{ scale: 1.01 }}
                    className="p-4 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-card-foreground">
                          <User className="size-5" />
                        </div>
                        <div>
                          <p className="text-gray-900">{prescription.patientName}</p>
                          <p className="text-sm text-muted-foreground">{prescription.doctorName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            prescription.status === 'pending'
                              ? 'default'
                              : prescription.status === 'dispensed'
                              ? 'secondary'
                              : 'outline'
                          }
                          className={
                            prescription.status === 'pending'
                              ? 'bg-amber-100 text-amber-700'
                              : prescription.status === 'dispensed'
                              ? 'bg-blue-100 text-primary'
                              : 'bg-green-100 text-primary'
                          }
                        >
                          {prescription.status}
                        </Badge>
                        {prescription.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => handleDispensePrescription(prescription.id)}
                          >
                            Dispense
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Medications:</p>
                      {prescription.medications.map((med, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-sm text-gray-900"
                        >
                          <Pill className="size-4 text-primary" />
                          {med}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <Calendar className="size-3" />
                      {prescription.date}
                    </p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
            </div>
            <div className="space-y-4">
              <DrugInteractionChecker />
              <AIInsightPanel
                title="Pharmacy AI Insights"
                compact
                prompt="Analyze pharmacy data: 2 medications below minimum stock (Paracetamol 500mg: 120 units, min 300; Ibuprofen 400mg: 80 units, min 150). 3 pending prescriptions. Provide: reorder recommendations, potential drug interaction risks to watch, and inventory optimization tips."
              />
            </div>
          </div>
        </TabsContent>
        {/* Low Stock Tab */}
        <TabsContent value="low-stock" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="size-5 text-destructive" />
                Low Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lowStockMeds.map((med) => (
                  <motion.div
                    key={med.id}
                    whileHover={{ scale: 1.01 }}
                    className="p-4 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-900">{med.name}</p>
                        <p className="text-sm text-muted-foreground">{med.category}</p>
                        <p className="text-sm text-destructive mt-1">
                          Current Stock: {med.stock} / Min: {med.minStock}
                        </p>
                      </div>
                      <Button>
                        <ShoppingCart className="size-4 mr-2" />
                        Reorder
                      </Button>
                    </div>
                  </motion.div>
                ))}
                {lowStockMeds.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    All medications are adequately stocked
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Todo List Widget */}
          <TodoListWidget maxItems={4} />

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Value</span>
                <span className="text-sm text-gray-900">$45,230</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Expired Items</span>
                <span className="text-sm text-destructive">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Categories</span>
                <span className="text-sm text-gray-900">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Suppliers</span>
                <span className="text-sm text-gray-900">8</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

