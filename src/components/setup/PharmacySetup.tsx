import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Trash2, Edit, Plus, Search } from 'lucide-react';
import { pharmacyApi } from '../../utils/api';

interface MedicineCategory {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

interface Supplier {
  id: string;
  name: string;
  contact: string;
  email?: string;
  address: string;
  contactPersonName: string;
  contactPersonPhone: string;
  contactPersonEmail?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

interface MedicineDosage {
  id: string;
  categoryId: string;
  categoryName: string;
  dosageForm: string;
  dosage: string;
  isActive: boolean;
  createdAt: string;
}

export default function PharmacySetup() {
  const [categories, setCategories] = useState<MedicineCategory[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [dosages, setDosages] = useState<MedicineDosage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('categories');

  // Dialog states
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false);
  const [isDosageDialogOpen, setIsDosageDialogOpen] = useState(false);

  // Form states
  const [editingCategory, setEditingCategory] = useState<MedicineCategory | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [editingDosage, setEditingDosage] = useState<MedicineDosage | null>(null);

  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const [supplierForm, setSupplierForm] = useState({
    name: '', contact: '', email: '', address: '', contactPersonName: '',
    contactPersonPhone: '', contactPersonEmail: '', description: ''
  });
  const [dosageForm, setDosageForm] = useState({
    categoryId: '', dosageForm: '', dosage: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await pharmacyApi.getMedicines();
      if (data?.length) setCategories(data);
    } catch {}
  };

  // Category functions
  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) return;

    const categoryData: MedicineCategory = {
      id: editingCategory?.id || Date.now().toString(),
      name: categoryForm.name,
      description: categoryForm.description,
      isActive: true,
      createdAt: editingCategory?.createdAt || new Date().toISOString()
    };

    const newCategories = editingCategory
      ? categories.map(c => c.id === editingCategory.id ? categoryData : c)
      : [...categories, categoryData];
    setCategories(newCategories);
    if (editingCategory) { pharmacyApi.updateMedicine(editingCategory.id, categoryData).catch(() => {}); }
    else { pharmacyApi.createMedicine(categoryData).catch(() => {}); }
    resetCategoryForm();
    setIsCategoryDialogOpen(false);
  };

  const handleEditCategory = (category: MedicineCategory) => {
    setEditingCategory(category);
    setCategoryForm({ name: category.name, description: category.description || '' });
    setIsCategoryDialogOpen(true);
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      pharmacyApi.deleteMedicine(id).catch(() => {});
      setCategories(prev => prev.filter(c => c.id !== id));
    }
  };

  const resetCategoryForm = () => {
    setCategoryForm({ name: '', description: '' });
    setEditingCategory(null);
  };

  // Supplier functions
  const handleSupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierForm.name.trim() || !supplierForm.contact.trim()) return;

    const supplierData: Supplier = {
      id: editingSupplier?.id || Date.now().toString(),
      ...supplierForm,
      isActive: true,
      createdAt: editingSupplier?.createdAt || new Date().toISOString()
    };

    const newSuppliers = editingSupplier
      ? suppliers.map(s => s.id === editingSupplier.id ? supplierData : s)
      : [...suppliers, supplierData];
    setSuppliers(newSuppliers);
    resetSupplierForm();
    setIsSupplierDialogOpen(false);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setSupplierForm({
      name: supplier.name,
      contact: supplier.contact,
      email: supplier.email || '',
      address: supplier.address,
      contactPersonName: supplier.contactPersonName,
      contactPersonPhone: supplier.contactPersonPhone,
      contactPersonEmail: supplier.contactPersonEmail || '',
      description: supplier.description || ''
    });
    setIsSupplierDialogOpen(true);
  };

  const handleDeleteSupplier = (id: string) => {
    if (confirm('Are you sure you want to delete this supplier?')) {
      setSuppliers(prev => prev.filter(s => s.id !== id));
    }
  };

  const resetSupplierForm = () => {
    setSupplierForm({
      name: '', contact: '', email: '', address: '', contactPersonName: '',
      contactPersonPhone: '', contactPersonEmail: '', description: ''
    });
    setEditingSupplier(null);
  };

  // Dosage functions
  const handleDosageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dosageForm.categoryId || !dosageForm.dosage.trim()) return;

    const category = categories.find(c => c.id === dosageForm.categoryId);
    const dosageData: MedicineDosage = {
      id: editingDosage?.id || Date.now().toString(),
      categoryId: dosageForm.categoryId,
      categoryName: category?.name || '',
      dosageForm: dosageForm.dosageForm,
      dosage: dosageForm.dosage,
      isActive: true,
      createdAt: editingDosage?.createdAt || new Date().toISOString()
    };

    const newDosages = editingDosage
      ? dosages.map(d => d.id === editingDosage.id ? dosageData : d)
      : [...dosages, dosageData];
    setDosages(newDosages);
    resetDosageForm();
    setIsDosageDialogOpen(false);
  };

  const handleEditDosage = (dosage: MedicineDosage) => {
    setEditingDosage(dosage);
    setDosageForm({
      categoryId: dosage.categoryId,
      dosageForm: dosage.dosageForm,
      dosage: dosage.dosage
    });
    setIsDosageDialogOpen(true);
  };

  const handleDeleteDosage = (id: string) => {
    if (confirm('Are you sure you want to delete this dosage?')) {
      setDosages(prev => prev.filter(d => d.id !== id));
    }
  };

  const resetDosageForm = () => {
    setDosageForm({ categoryId: '', dosageForm: '', dosage: '' });
    setEditingDosage(null);
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.contactPersonName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDosages = dosages.filter(d =>
    d.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.dosage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Pharmacy Setup</h2>
          <p className="text-gray-600">Manage medicine categories, suppliers, and dosages</p>
        </div>
        <div className="flex items-center space-x-2">
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
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="categories">Medicine Categories</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="dosages">Medicine Dosages</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Medicine Categories ({filteredCategories.length})</h3>
            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetCategoryForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Medicine Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? 'Edit Category' : 'Add Medicine Category'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCategorySubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="categoryName">Category Name *</Label>
                    <Input
                      id="categoryName"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter category name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="categoryDescription">Description</Label>
                    <Textarea
                      id="categoryDescription"
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter description"
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
                    <span>{category.name}</span>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCategory(category)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id)}
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

        <TabsContent value="suppliers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Suppliers ({filteredSuppliers.length})</h3>
            <Dialog open={isSupplierDialogOpen} onOpenChange={setIsSupplierDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetSupplierForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Supplier
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingSupplier ? 'Edit Supplier' : 'Add Supplier'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSupplierSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="supplierName">Supplier Name *</Label>
                      <Input
                        id="supplierName"
                        value={supplierForm.name}
                        onChange={(e) => setSupplierForm(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="supplierContact">Contact *</Label>
                      <Input
                        id="supplierContact"
                        value={supplierForm.contact}
                        onChange={(e) => setSupplierForm(prev => ({ ...prev, contact: e.target.value }))}
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
                    <span>{supplier.name}</span>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditSupplier(supplier)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteSupplier(supplier.id)}
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
                      <span className="font-medium">Contact:</span> {supplier.contact}
                    </div>
                    <div>
                      <span className="font-medium">Contact Person:</span> {supplier.contactPersonName}
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span> {supplier.contactPersonPhone}
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

        <TabsContent value="dosages" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Medicine Dosages ({filteredDosages.length})</h3>
            <Dialog open={isDosageDialogOpen} onOpenChange={setIsDosageDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetDosageForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Medicine Dosage
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingDosage ? 'Edit Dosage' : 'Add Medicine Dosage'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleDosageSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="dosageCategory">Medicine Category *</Label>
                    <Select
                      value={dosageForm.categoryId}
                      onValueChange={(value) => setDosageForm(prev => ({ ...prev, categoryId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dosageForm">Dosage Form</Label>
                    <Input
                      id="dosageForm"
                      value={dosageForm.dosageForm}
                      onChange={(e) => setDosageForm(prev => ({ ...prev, dosageForm: e.target.value }))}
                      placeholder="e.g., Tablet, Capsule, Syrup"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dosage">Dosage *</Label>
                    <Input
                      id="dosage"
                      value={dosageForm.dosage}
                      onChange={(e) => setDosageForm(prev => ({ ...prev, dosage: e.target.value }))}
                      placeholder="e.g., 500mg, 10ml"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsDosageDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingDosage ? 'Update' : 'Save'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {filteredDosages.map(dosage => (
              <Card key={dosage.id}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>{dosage.categoryName} - {dosage.dosage}</span>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditDosage(dosage)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteDosage(dosage.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                {dosage.dosageForm && (
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Form:</span> {dosage.dosageForm}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
