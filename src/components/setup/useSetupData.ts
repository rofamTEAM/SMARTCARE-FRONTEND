import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export interface BaseSetupItem {
  id: string;
  isActive: boolean;
  createdAt: string;
}

export interface SetupConfig<T extends BaseSetupItem> {
  fetchFn: () => Promise<T[]>;
  createFn: (data: Omit<T, 'id' | 'isActive' | 'createdAt'>) => Promise<T>;
  updateFn: (id: string, data: Partial<T>) => Promise<T>;
  deleteFn: (id: string) => Promise<void>;
  searchFields: (keyof T)[];
  // kept for backward compat but ignored
  storageKey?: string;
  defaultItems?: T[];
}

export function useSetupData<T extends BaseSetupItem>(config: SetupConfig<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const data = await config.fetchFn();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading setup data:', error);
      setItems([]);
    }
  }, [config.fetchFn]);

  useEffect(() => { loadData(); }, [loadData]);

  const addItem = async (item: Omit<T, 'id' | 'isActive' | 'createdAt'>) => {
    setLoading(true);
    try {
      const created = await config.createFn(item);
      setItems(prev => [...prev, created]);
      toast.success('Added successfully!');
      return created;
    } catch (error: any) {
      toast.error(error?.message || 'Failed to add item.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (id: string, updates: Partial<T>) => {
    setLoading(true);
    try {
      const updated = await config.updateFn(id, updates);
      setItems(prev => prev.map(item => item.id === id ? updated : item));
      toast.success('Updated successfully!');
      return updated;
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update item.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    setLoading(true);
    try {
      await config.deleteFn(id);
      setItems(prev => prev.filter(item => item.id !== id));
      toast.success('Deleted successfully!');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete item.');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (item) await updateItem(id, { isActive: !item.isActive } as Partial<T>);
  };

  const filteredItems = items.filter(item =>
    config.searchFields.some(field => {
      const value = item[field];
      return typeof value === 'string' &&
        value.toLowerCase().includes(searchTerm.toLowerCase());
    })
  );

  return {
    items,
    filteredItems,
    searchTerm,
    setSearchTerm,
    isDialogOpen,
    setIsDialogOpen,
    editingItem,
    setEditingItem,
    addItem,
    updateItem,
    deleteItem,
    toggleStatus,
    loading,
    reload: loadData,
  };
}
