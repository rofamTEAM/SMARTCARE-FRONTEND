import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Trash2, Edit, Plus, Search, Package, Store, Truck } from 'lucide-react';
import { inventoryApi } from '../../utils/api';

interface ItemCategory {
  id: string;
  itemCategory: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

interface ItemStore {
  id: string;
  itemStore: string;
  code: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

interface ItemSupplier {
  id: string;
  itemSupplier: string;
  phone: string;
  email?: string;
  address: string;
  contactPersonName: string;
  contactPersonPhone: string;
  contactPersonEmail?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export default function InventorySetup() {
  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [stores, setStores] = useState<ItemStore[]>([]);
  const [suppliers, setSuppliers] = useState<ItemSupplier[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('categories');

  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isStoreDialogOpen, setIsStoreDialogOpen] = useState(false);
  const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false);

  const [editingCategory, setEditingCategory] = useState<ItemCategory | null>(null);
  const [editingStore, setEditingStore] = useState<ItemStore | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<ItemSupplier | null>(null);

  const [categoryForm, setCategoryForm] = useState({ itemCategory: '', description: '' });
  const [storeForm, setStoreForm] = useState({ itemStore: '', code: '', description: '' });
  const [supplierForm, setSupplierForm] = useState({
    itemSupplier: '', phone: '', email: '', address: '', contactPersonName: '',
    contactPersonPhone: '', contactPersonEmail: '', description: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [catsData, storesData, suppliersData] = await Promise.allSettled([
        inventoryApi.getCategories(),
        inventoryApi.getStores(),
        inventoryApi.getSuppliers(),
      ]);
      if (catsData.status === 'fulfilled' && catsData.value?.length) setCategories(catsData.value);
      else setCategories([
        { id: '1', itemCategory: 'Medical Equipment', description: 'Medical devices and equipment', isActive: true, createdAt: new Date().toISOString() },
        { id: '2', itemCategory: 'Office Supplies', description: 'General office supplies', isActive: true, createdAt: new Date().toISOString() },
        { id: '3', itemCategory: 'Cleaning Supplies', description: 'Cleaning and maintenance supplies', isActive: true, createdAt: new Date().toISOString() },
        { id: '4', itemCategory: 'IT Equipment', description: 'Computer and IT related equipment', isActive: true, createdAt: new Date().toISOString() },
      ]);
      if (storesData.status === 'fulfilled' && storesData.value?.length) setStores(storesData.value);
      else setStores([
        { id: '1', itemStore: 'Main Store', code: 'MS001', description: 'Primary storage facility', isActive: true, createdAt: new Date().toISOString() },
        { id: '2', itemStore: 'Medical Store', code: 'MED001', description: 'Medical equipment storage', isActive: true, createdAt: new Date().toISOString() },
      ]);
      if (suppliersData.status === 'fulfilled' && suppliersData.value?.length) setSuppliers(suppliersData.value);
      else setSuppliers([]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.itemCategory.trim()) return;

    const categoryData: ItemCategory = {
      id: editingCategory?.id || Date.now().toString(),
      itemCategory: categoryForm.itemCategory.trim(),
      description: categoryForm.description.trim(),
      isActive: true,
      createdAt: editingCategory?.createdAt || new Date().toISOString()
    };

    const newCategories = editingCategory
      ? categories.map(c => c.id === editingCategory.id ? categoryData : c)
      : [...categories, categoryData];
    setCategories(newCategories);
    if (editingCategory) { inventoryApi.update(editingCategory.id, categoryData).catch(() => {}); }
    else { inventoryApi.create(categoryData).catch(() => {}); }
    resetCategoryForm();
    setIsCategoryDialogOpen(false);
  };

  const handleStoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeForm.itemStore.trim() || !storeForm.code.trim()) return;

    const storeData: ItemStore = {
      id: editingStore?.id || Date.now().toString(),
      itemStore: storeForm.itemStore.trim(),
      code: storeForm.code.trim(),
      description: storeForm.description.trim(),
      isActive: true,
      createdAt: editingStore?.createdAt || new Date().toISOString()
    };

    const newStores = editingStore
      ? stores.map(s => s.id === editingStore.id ? storeData : s)
      : [...stores, storeData];
    setStores(newStores);
    if (editingStore) { inventoryApi.update(editingStore.id, storeData).catch(() => {}); }
    else { inventoryApi.create(storeData).catch(() => {}); }
    resetStoreForm();
    setIsStoreDialogOpen(false);
  };

  const handleSupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierForm.itemSupplier.trim() || !supplierForm.phone.trim()) return;

    const supplierData: ItemSupplier = {
      id: editingSupplier?.id || Date.now().toString(),
      ...supplierForm,
      itemSupplier: supplierForm.itemSupplier.trim(),
      isActive: true,
      createdAt: editingSupplier?.createdAt || new Date().toISOString()
    };

    const newSuppliers = editingSupplier
      ? suppliers.map(s => s.id === editingSupplier.id ? supplierData : s)
      : [...suppliers, supplierData];
    setSuppliers(newSuppliers);
    if (editingSupplier) { inventoryApi.update(editingSupplier.id, supplierData).catch(() => {}); }
    else { inventoryApi.create(supplierData).catch(() => {}); }
    resetSupplierForm();
    setIsSupplierDialogOpen(false);
  };

  const resetCategoryForm = () => {
    setCategoryForm({ itemCategory: '', description: '' });
    setEditingCategory(null);
  };

  const resetStoreForm = () => {
    setStoreForm({ itemStore: '', code: '', description: '' });
    setEditingStore(null);
  };

  const resetSupplierForm = () => {
    setSupplierForm({
      itemSupplier: '', phone: '', email: '', address: '', contactPersonName: '',
      contactPersonPhone: '', contactPersonEmail: '', description: ''
    });
    setEditingSupplier(null);
  };

  const filteredCategories = categories.filter(c =>
    c.itemCategory.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStores = stores.filter(s =>
    s.itemStore.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSuppliers = suppliers.filter(s =>
    s.itemSupplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.contactPersonName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Inventory Setup</h2>
          <p className="text-gray-600">Manage item categories, stores, and suppliers</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <Package className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Item Categories</p>
              <p className="text-2xl font-bold">{categories.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <Store className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Item Stores</p>
              <p className="text-2xl font-bold">{stores.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <Truck className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Item Suppliers</p>
              <p className="text-2xl font-bold">{suppliers.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="categories">Item Categories</TabsTrigger>
          <TabsTrigger value="stores">Item Stores</TabsTrigger>
          <TabsTrigger value="suppliers">Item Suppliers</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Item Categories ({filteredCategories.length})</h3>
            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetCategoryForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? 'Edit Category' : 'Add Item Category'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCategorySubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="itemCategory">Item Category *</Label>
                    <Input
                      id="itemCategory"
                      value={categoryForm.itemCategory}
                      onChange={(e) => setCategoryForm(prev => ({ ...prev, itemCategory: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="categoryDescription">Description</Label>
                    <Textarea
                      id="categoryDescription"
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingCategory ? 'Update' : 'Save'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {filteredCategories.map(category => (
              <Card key={category.id}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Package className="w-5 h-5 text-blue-600" />
                      <span>{category.itemCategory}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingCategory(category);
                          setCategoryForm({ itemCategory: category.itemCategory, description: category.description || '' });
                          setIsCategoryDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirm('Are you sure?')) {
                            inventoryApi.delete(category.id).catch(() => {});
                            setCategories(prev => prev.filter(c => c.id !== category.id));
                          }
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                {category.description && (
                  <CardContent>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="stores" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Item Stores ({filteredStores.length})</h3>
            <Dialog open={isStoreDialogOpen} onOpenChange={setIsStoreDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetStoreForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item Store
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingStore ? 'Edit Store' : 'Add Item Store'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleStoreSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="itemStore">Item Store Name *</Label>
                      <Input
                        id="itemStore"
                        value={storeForm.itemStore}
                        onChange={(e) => setStoreForm(prev => ({ ...prev, itemStore: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="storeCode">Item Store Code *</Label>
                      <Input
                        id="storeCode"
                        value={storeForm.code}
                        onChange={(e) => setStoreForm(prev => ({ ...prev, code: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="storeDescription">Description</Label>
                    <Textarea
                      id="storeDescription"
                      value={storeForm.description}
                      onChange={(e) => setStoreForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsStoreDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingStore ? 'Update' : 'Save'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {filteredStores.map(store => (
              <Card key={store.id}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Store className="w-5 h-5 text-green-600" />
                      <span>{store.itemStore}</span>
                      <span className="text-sm text-gray-500">({store.code})</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingStore(store);
                          setStoreForm({ itemStore: store.itemStore, code: store.code, description: store.description || '' });
                          setIsStoreDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirm('Are you sure?')) {
                            inventoryApi.delete(store.id).catch(() => {});
                            setStores(prev => prev.filter(s => s.id !== store.id));
                          }
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                {store.description && (
                  <CardContent>
                    <p className="text-sm text-gray-600">{store.description}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Item Suppliers ({filteredSuppliers.length})</h3>
            <Dialog open={isSupplierDialogOpen} onOpenChange={setIsSupplierDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetSupplierForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item Supplier
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingSupplier ? 'Edit Supplier' : 'Add Item Supplier'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSupplierSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="supplierName">Item Supplier Name *</Label>
                      <Input
                        id="supplierName"
                        value={supplierForm.itemSupplier}
                        onChange={(e) => setSupplierForm(prev => ({ ...prev, itemSupplier: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="supplierPhone">Phone *</Label>
                      <Input
                        id="supplierPhone"
                        value={supplierForm.phone}
                        onChange={(e) => setSupplierForm(prev => ({ ...prev, phone: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="supplierEmail">Email</Label>
                      <Input
                        id="supplierEmail"
                        type="email"
                        value={supplierForm.email}
                        onChange={(e) => setSupplierForm(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactPersonName">Contact Person Name *</Label>
                      <Input
                        id="contactPersonName"
                        value={supplierForm.contactPersonName}
                        onChange={(e) => setSupplierForm(prev => ({ ...prev, contactPersonName: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contactPersonPhone">Contact Person Phone *</Label>
                      <Input
                        id="contactPersonPhone"
                        value={supplierForm.contactPersonPhone}
                        onChange={(e) => setSupplierForm(prev => ({ ...prev, contactPersonPhone: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactPersonEmail">Contact Person Email</Label>
                      <Input
                        id="contactPersonEmail"
                        type="email"
                        value={supplierForm.contactPersonEmail}
                        onChange={(e) => setSupplierForm(prev => ({ ...prev, contactPersonEmail: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="supplierAddress">Address *</Label>
                    <Textarea
                      id="supplierAddress"
                      value={supplierForm.address}
                      onChange={(e) => setSupplierForm(prev => ({ ...prev, address: e.target.value }))}
                      required
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="supplierDescription">Description</Label>
                    <Textarea
                      id="supplierDescription"
                      value={supplierForm.description}
                      onChange={(e) => setSupplierForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={2}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsSupplierDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingSupplier ? 'Update' : 'Save'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {filteredSuppliers.map(supplier => (
              <Card key={supplier.id}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Truck className="w-5 h-5 text-orange-600" />
                      <span>{supplier.itemSupplier}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingSupplier(supplier);
                          setSupplierForm({
                            itemSupplier: supplier.itemSupplier,
                            phone: supplier.phone,
                            email: supplier.email || '',
                            address: supplier.address,
                            contactPersonName: supplier.contactPersonName,
                            contactPersonPhone: supplier.contactPersonPhone,
                            contactPersonEmail: supplier.contactPersonEmail || '',
                            description: supplier.description || ''
                          });
                          setIsSupplierDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirm('Are you sure?')) {
                            inventoryApi.delete(supplier.id).catch(() => {});
                            setSuppliers(prev => prev.filter(s => s.id !== supplier.id));
                          }
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Phone:</span> {supplier.phone}
                    </div>
                    <div>
                      <span className="font-medium">Contact Person:</span> {supplier.contactPersonName}
                    </div>
                    <div>
                      <span className="font-medium">Contact Phone:</span> {supplier.contactPersonPhone}
                    </div>
                    {supplier.email && (
                      <div>
                        <span className="font-medium">Email:</span> {supplier.email}
                      </div>
                    )}
                  </div>
                  <div className="mt-2 text-sm">
                    <span className="font-medium">Address:</span> {supplier.address}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
