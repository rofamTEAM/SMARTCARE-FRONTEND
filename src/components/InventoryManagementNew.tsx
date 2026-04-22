import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Eye, Package, AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { AIInsightPanel } from './AIInsightPanel';
import { VoiceAgent } from './VoiceAgent';

interface InventoryItem {
  id: string;
  item_name: string;
  category: 'medication' | 'equipment' | 'supplies' | 'consumables';
  sku: string;
  current_stock: number;
  minimum_stock: number;
  maximum_stock: number;
  unit_price: number;
  supplier: string;
  expiry_date?: string;
  location: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired';
  last_updated: string;
}

interface InventoryManagementProps {
  session: any;
}

export function InventoryManagement({ session }: InventoryManagementProps) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddItem, setShowAddItem] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  useEffect(() => {
    // Mock data
    setItems([
      {
        id: '1',
        item_name: 'Paracetamol 500mg',
        category: 'medication',
        sku: 'MED001',
        current_stock: 50,
        minimum_stock: 100,
        maximum_stock: 500,
        unit_price: 0.25,
        supplier: 'PharmaCorp',
        expiry_date: '2024-12-31',
        location: 'Pharmacy Store A',
        status: 'low_stock',
        last_updated: '2024-01-20'
      },
      {
        id: '2',
        item_name: 'Surgical Gloves (Box)',
        category: 'supplies',
        sku: 'SUP001',
        current_stock: 200,
        minimum_stock: 50,
        maximum_stock: 300,
        unit_price: 15.00,
        supplier: 'MedSupply Inc',
        location: 'Supply Room B',
        status: 'in_stock',
        last_updated: '2024-01-19'
      },
      {
        id: '3',
        item_name: 'Blood Pressure Monitor',
        category: 'equipment',
        sku: 'EQP001',
        current_stock: 5,
        minimum_stock: 3,
        maximum_stock: 10,
        unit_price: 250.00,
        supplier: 'MedTech Solutions',
        location: 'Equipment Room',
        status: 'in_stock',
        last_updated: '2024-01-18'
      },
      {
        id: '4',
        item_name: 'Insulin Syringes',
        category: 'consumables',
        sku: 'CON001',
        current_stock: 0,
        minimum_stock: 100,
        maximum_stock: 500,
        unit_price: 0.50,
        supplier: 'DiabetesCare Ltd',
        location: 'Pharmacy Store B',
        status: 'out_of_stock',
        last_updated: '2024-01-17'
      }
    ]);
  }, []);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'bg-green-100 text-green-800';
      case 'low_stock': return 'bg-yellow-100 text-yellow-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-muted text-gray-800';
      default: return 'bg-muted text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'medication': return 'bg-blue-100 text-blue-800';
      case 'equipment': return 'bg-purple-100 text-purple-800';
      case 'supplies': return 'bg-green-100 text-green-800';
      case 'consumables': return 'bg-orange-100 text-orange-800';
      default: return 'bg-muted text-gray-800';
    }
  };

  const getStockLevel = (item: InventoryItem) => {
    const percentage = (item.current_stock / item.maximum_stock) * 100;
    if (percentage <= 20) return 'critical';
    if (percentage <= 40) return 'low';
    if (percentage <= 70) return 'medium';
    return 'high';
  };

  const InventoryCard = ({ item }: { item: InventoryItem }) => {
    const stockLevel = getStockLevel(item);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-lg border p-4 hover:shadow-md transition-shadow"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Package className="size-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{item.item_name}</h3>
              <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Badge className={getStatusColor(item.status)}>
              {item.status.replace('_', ' ')}
            </Badge>
            <Badge className={getCategoryColor(item.category)}>
              {item.category}
            </Badge>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Current Stock:</span>
            <div className="flex items-center gap-2">
              <span className={`font-medium ${
                stockLevel === 'critical' ? 'text-destructive' :
                stockLevel === 'low' ? 'text-yellow-600' :
                stockLevel === 'medium' ? 'text-primary' : 'text-primary'
              }`}>
                {item.current_stock}
              </span>
              {stockLevel === 'critical' && <AlertTriangle className="size-4 text-destructive" />}
            </div>
          </div>

          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                stockLevel === 'critical' ? 'bg-destructive' :
                stockLevel === 'low' ? 'bg-yellow-500' :
                stockLevel === 'medium' ? 'bg-primary' : 'bg-primary'
              }`}
              style={{ width: `${Math.min((item.current_stock / item.maximum_stock) * 100, 100)}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
            <div>Min: {item.minimum_stock}</div>
            <div>Max: {item.maximum_stock}</div>
            <div>Price: ${item.unit_price}</div>
            <div>Location: {item.location}</div>
          </div>

          {item.expiry_date && (
            <div className="text-sm text-muted-foreground">
              Expires: {new Date(item.expiry_date).toLocaleDateString()}
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            Supplier: {item.supplier}
          </div>
        </div>

        <div className="flex gap-2 mt-4 pt-3 border-t">
          <Button variant="outline" size="sm" onClick={() => setSelectedItem(item)}>
            <Eye className="size-4 mr-2" />
            View
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="size-4 mr-2" />
            Edit
          </Button>
          {item.status === 'low_stock' || item.status === 'out_of_stock' ? (
            <Button size="sm">
              Reorder
            </Button>
          ) : null}
        </div>
      </motion.div>
    );
  };

  const inventoryStats = {
    total: items.length,
    in_stock: items.filter(i => i.status === 'in_stock').length,
    low_stock: items.filter(i => i.status === 'low_stock').length,
    out_of_stock: items.filter(i => i.status === 'out_of_stock').length,
    expired: items.filter(i => i.status === 'expired').length,
    total_value: items.reduce((sum, item) => sum + (item.current_stock * item.unit_price), 0)
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-muted-foreground">Track medical supplies, equipment, and medications</p>
        </div>
        <div className="flex items-center gap-2">
          <VoiceAgent department="inventory" userRole={session?.role || 'admin'} />
          <Button onClick={() => setShowAddItem(true)}>
            <Plus className="size-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{inventoryStats.total}</div>
            <div className="text-sm text-muted-foreground">Total Items</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{inventoryStats.in_stock}</div>
            <div className="text-sm text-muted-foreground">In Stock</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{inventoryStats.low_stock}</div>
            <div className="text-sm text-muted-foreground">Low Stock</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-destructive">{inventoryStats.out_of_stock}</div>
            <div className="text-sm text-muted-foreground">Out of Stock</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">${inventoryStats.total_value.toFixed(0)}</div>
            <div className="text-sm text-muted-foreground">Total Value</div>
          </CardContent>
        </Card>
      </div>

      {/* AI Inventory Insights */}
      <AIInsightPanel
        title="AI Inventory Insights"
        compact
        prompt={`Analyze hospital inventory: Total items: ${inventoryStats.total}, In stock: ${inventoryStats.in_stock}, Low stock: ${inventoryStats.low_stock}, Out of stock: ${inventoryStats.out_of_stock}, Expired: ${inventoryStats.expired}, Total value: $${inventoryStats.total_value.toFixed(0)}.
Provide: 1) Critical reorder recommendations, 2) Expiry risk items to address, 3) Cost optimization suggestions. Be concise and actionable.`}
      />

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
          <Input
            placeholder="Search inventory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="medication">Medication</SelectItem>
            <SelectItem value="equipment">Equipment</SelectItem>
            <SelectItem value="supplies">Supplies</SelectItem>
            <SelectItem value="consumables">Consumables</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="in_stock">In Stock</SelectItem>
            <SelectItem value="low_stock">Low Stock</SelectItem>
            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <InventoryCard key={item.id} item={item} />
        ))}
      </div>

      {/* Add Item Modal */}
      <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Inventory Item</DialogTitle>
          </DialogHeader>
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="item_name">Item Name</Label>
                <Input id="item_name" placeholder="Enter item name" />
              </div>
              <div>
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" placeholder="Enter SKU" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medication">Medication</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="supplies">Supplies</SelectItem>
                    <SelectItem value="consumables">Consumables</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="supplier">Supplier</Label>
                <Input id="supplier" placeholder="Enter supplier name" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="current_stock">Current Stock</Label>
                <Input id="current_stock" type="number" placeholder="0" />
              </div>
              <div>
                <Label htmlFor="minimum_stock">Minimum Stock</Label>
                <Input id="minimum_stock" type="number" placeholder="0" />
              </div>
              <div>
                <Label htmlFor="maximum_stock">Maximum Stock</Label>
                <Input id="maximum_stock" type="number" placeholder="0" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="unit_price">Unit Price ($)</Label>
                <Input id="unit_price" type="number" step="0.01" placeholder="0.00" />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="Enter storage location" />
              </div>
            </div>
            <div>
              <Label htmlFor="expiry_date">Expiry Date (Optional)</Label>
              <Input id="expiry_date" type="date" />
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">Add Item</Button>
              <Button type="button" variant="outline" onClick={() => setShowAddItem(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Item Details Modal */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Inventory Item Details</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Item Name</Label>
                  <p className="font-medium">{selectedItem.item_name}</p>
                </div>
                <div>
                  <Label>SKU</Label>
                  <p className="font-medium">{selectedItem.sku}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Badge className={getCategoryColor(selectedItem.category)}>
                    {selectedItem.category}
                  </Badge>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge className={getStatusColor(selectedItem.status)}>
                    {selectedItem.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Current Stock</Label>
                  <p className="font-medium text-lg">{selectedItem.current_stock}</p>
                </div>
                <div>
                  <Label>Minimum Stock</Label>
                  <p className="font-medium">{selectedItem.minimum_stock}</p>
                </div>
                <div>
                  <Label>Maximum Stock</Label>
                  <p className="font-medium">{selectedItem.maximum_stock}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Unit Price</Label>
                  <p className="font-medium">${selectedItem.unit_price}</p>
                </div>
                <div>
                  <Label>Total Value</Label>
                  <p className="font-medium">${(selectedItem.current_stock * selectedItem.unit_price).toFixed(2)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Supplier</Label>
                  <p>{selectedItem.supplier}</p>
                </div>
                <div>
                  <Label>Location</Label>
                  <p>{selectedItem.location}</p>
                </div>
              </div>
              {selectedItem.expiry_date && (
                <div>
                  <Label>Expiry Date</Label>
                  <p>{new Date(selectedItem.expiry_date).toLocaleDateString()}</p>
                </div>
              )}
              <div>
                <Label>Last Updated</Label>
                <p>{new Date(selectedItem.last_updated).toLocaleDateString()}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

