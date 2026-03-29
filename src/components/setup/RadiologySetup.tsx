import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Trash2, Edit, Plus, Search, Zap } from 'lucide-react';
import { radiologyApi } from '../../utils/api';

interface RadiologyCategory {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export default function RadiologySetup() {
  const [categories, setCategories] = useState<RadiologyCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<RadiologyCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await radiologyApi.getCategories();
      if (data?.length) { setCategories(data); return; }
    } catch {}
    setCategories([
      { id: '1', name: 'X-Ray', description: 'Plain radiography examinations', isActive: true, createdAt: new Date().toISOString() },
      { id: '2', name: 'CT Scan', description: 'Computed Tomography scans', isActive: true, createdAt: new Date().toISOString() },
      { id: '3', name: 'MRI', description: 'Magnetic Resonance Imaging', isActive: true, createdAt: new Date().toISOString() },
      { id: '4', name: 'Ultrasound', description: 'Ultrasonography examinations', isActive: true, createdAt: new Date().toISOString() },
      { id: '5', name: 'Mammography', description: 'Breast imaging examinations', isActive: true, createdAt: new Date().toISOString() },
      { id: '6', name: 'Fluoroscopy', description: 'Real-time X-ray imaging', isActive: true, createdAt: new Date().toISOString() },
    ]);
  };

  const saveCategories = (newCategories: RadiologyCategory[]) => { setCategories(newCategories); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter category name');
      return;
    }

    const categoryData: RadiologyCategory = {
      id: editingCategory?.id || Date.now().toString(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      isActive: true,
      createdAt: editingCategory?.createdAt || new Date().toISOString()
    };

    const newCategories = editingCategory
      ? categories.map(c => c.id === editingCategory.id ? categoryData : c)
      : [...categories, categoryData];

    saveCategories(newCategories);
    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (category: RadiologyCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this radiology category?')) {
      const newCategories = categories.filter(c => c.id !== id);
      saveCategories(newCategories);
    }
  };

  const toggleStatus = (id: string) => {
    const newCategories = categories.map(c =>
      c.id === id ? { ...c, isActive: !c.isActive } : c
    );
    saveCategories(newCategories);
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setEditingCategory(null);
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const activeCategories = filteredCategories.filter(c => c.isActive);
  const inactiveCategories = filteredCategories.filter(c => !c.isActive);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Radiology Setup</h2>
          <p className="text-gray-600">Manage radiology test categories</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Add Radiology Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? 'Edit Radiology Category' : 'Add Radiology Category'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="categoryName">Category Name *</Label>
                  <Input
                    id="categoryName"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter radiology category name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="categoryDescription">Description</Label>
                  <Textarea
                    id="categoryDescription"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter category description"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
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
      </div>

      <div className="grid gap-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="flex items-center p-6">
              <Zap className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Categories</p>
                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-green-600 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Categories</p>
                <p className="text-2xl font-bold text-green-600">{activeCategories.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-red-600 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inactive Categories</p>
                <p className="text-2xl font-bold text-red-600">{inactiveCategories.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Categories */}
        {activeCategories.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Active Categories ({activeCategories.length})</h3>
            <div className="grid gap-4">
              {activeCategories.map(category => (
                <Card key={category.id} className="border-l-4 border-l-green-500">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Zap className="w-5 h-5 text-purple-600" />
                        <span>{category.name}</span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Active
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleStatus(category.id)}
                          className="text-orange-600 hover:text-orange-700"
                        >
                          Disable
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(category.id)}
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
                      <div className="mt-2 text-xs text-gray-500">
                        Created: {new Date(category.createdAt).toLocaleDateString()}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Inactive Categories */}
        {inactiveCategories.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Inactive Categories ({inactiveCategories.length})</h3>
            <div className="grid gap-4">
              {inactiveCategories.map(category => (
                <Card key={category.id} className="border-l-4 border-l-red-500 opacity-75">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Zap className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-600">{category.name}</span>
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                          Inactive
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleStatus(category.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          Enable
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(category.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  {category.description && (
                    <CardContent>
                      <p className="text-sm text-gray-500">{category.description}</p>
                      <div className="mt-2 text-xs text-gray-400">
                        Created: {new Date(category.createdAt).toLocaleDateString()}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {filteredCategories.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? 'No categories found matching your search.' : 'No radiology categories found.'}
              </p>
              {!searchTerm && (
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  className="mt-4"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Category
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
