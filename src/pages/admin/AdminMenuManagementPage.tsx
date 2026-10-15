import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  AlertCircle, 
  RefreshCw, 
  Layers, 
  Utensils, 
  Clock, 
  IndianRupee, 
  Tag, 
  ArrowLeft,
  Lock,
  UserCheck,
  CheckCircle2,
  SlidersHorizontal,
  FolderPlus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { 
  getFoods, 
  getCategories, 
  createFood, 
  updateFood, 
  deleteFood, 
  toggleFoodAvailability,
  createCategory,
  updateCategory,
  deleteCategory
} from '../../services/api';
import { FoodItem, Category } from '../../types';

interface AdminMenuManagementPageProps {
  onNavigate: (view: string, data?: any) => void;
}

export function AdminMenuManagementPage({ onNavigate }: AdminMenuManagementPageProps) {
  const { user, isAdmin, login } = useAuth();

  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'unavailable'>('all');

  // Active Tab
  const [activeTab, setActiveTab] = useState<'foods' | 'categories'>('foods');

  // Food Modal State
  const [isFoodModalOpen, setIsFoodModalOpen] = useState<boolean>(false);
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null);
  const [foodForm, setFoodForm] = useState({
    name: '',
    description: '',
    price: 50,
    categoryId: 1,
    imageUrl: '',
    available: true,
    preparationTime: 10,
  });

  // Category Modal State
  const [isCatModalOpen, setIsCatModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    displayOrder: 1,
  });

  // Delete Confirm Modal State
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'food' | 'category'; id: number; name: string } | null>(null);

  // Submitting indicator
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [switchingAdmin, setSwitchingAdmin] = useState<boolean>(false);

  // Fetch Foods and Categories
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [foodRes, catRes] = await Promise.all([
        getFoods(),
        getCategories(),
      ]);

      if (catRes.success && catRes.data) {
        setCategories(catRes.data as Category[]);
        if (!foodForm.categoryId && catRes.data.length > 0) {
          setFoodForm((prev) => ({ ...prev, categoryId: catRes.data![0].id }));
        }
      }

      if (foodRes.success && foodRes.data) {
        setFoods(foodRes.data as FoodItem[]);
      } else {
        setError(foodRes.error || 'Failed to load foods.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Network error loading menu data.');
    } finally {
      setLoading(false);
    }
  }, [foodForm.categoryId]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin, fetchData]);

  const handleAdminQuickSwitch = async () => {
    setSwitchingAdmin(true);
    try {
      await login('admin@campusbite.com', 'adminPassword123');
    } catch (e) {
      console.error(e);
    } finally {
      setSwitchingAdmin(false);
    }
  };

  const showNotification = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  // 1. Food Item Actions
  const handleOpenAddFood = () => {
    setEditingFood(null);
    setFoodForm({
      name: '',
      description: '',
      price: 60,
      categoryId: categories.length > 0 ? categories[0].id : 1,
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      available: true,
      preparationTime: 10,
    });
    setIsFoodModalOpen(true);
  };

  const handleOpenEditFood = (food: FoodItem) => {
    setEditingFood(food);
    const catId = typeof food.category === 'object' ? food.category.id : food.categoryId || 1;
    setFoodForm({
      name: food.name,
      description: food.description || '',
      price: food.price,
      categoryId: catId,
      imageUrl: food.imageUrl || '',
      available: food.available,
      preparationTime: food.preparationTime || 10,
    });
    setIsFoodModalOpen(true);
  };

  const handleSaveFood = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!foodForm.name.trim()) {
      setError('Food item name is required.');
      return;
    }

    if (!foodForm.price || foodForm.price <= 0) {
      setError('Food price must be greater than ₹0.00.');
      return;
    }

    if (!foodForm.categoryId) {
      setError('Please select a category for this food item.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingFood) {
        const res = await updateFood(editingFood.id, foodForm);
        if (res.success) {
          showNotification(`"${foodForm.name}" updated successfully.`);
          setIsFoodModalOpen(false);
          fetchData();
        } else {
          setError(res.error || 'Failed to update food item.');
        }
      } else {
        const res = await createFood(foodForm);
        if (res.success) {
          showNotification(`"${foodForm.name}" added to canteen menu.`);
          setIsFoodModalOpen(false);
          fetchData();
        } else {
          setError(res.error || 'Failed to create food item.');
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error saving food.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleAvailability = async (food: FoodItem) => {
    const nextVal = !food.available;
    // Optimistic UI update
    setFoods((prev) =>
      prev.map((f) => (f.id === food.id ? { ...f, available: nextVal } : f))
    );

    try {
      const res = await toggleFoodAvailability(food.id, nextVal);
      if (res.success) {
        showNotification(`${food.name} is now ${nextVal ? 'Available' : 'Unavailable'}.`);
      } else {
        fetchData(); // Rollback on failure
      }
    } catch (e) {
      fetchData();
    }
  };

  // 2. Category Actions
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      description: '',
      displayOrder: categories.length + 1,
    });
    setIsCatModalOpen(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name,
      description: cat.description || '',
      displayOrder: cat.displayOrder || 1,
    });
    setIsCatModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!categoryForm.name.trim()) {
      setError('Category name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCategory) {
        const res = await updateCategory(editingCategory.id, categoryForm);
        if (res.success) {
          showNotification(`Category "${categoryForm.name}" updated.`);
          setIsCatModalOpen(false);
          fetchData();
        } else {
          setError(res.error || 'Failed to update category.');
        }
      } else {
        const res = await createCategory(categoryForm);
        if (res.success) {
          showNotification(`Category "${categoryForm.name}" created.`);
          setIsCatModalOpen(false);
          fetchData();
        } else {
          setError(res.error || 'Failed to create category.');
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error saving category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Delete Confirmed
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);

    try {
      if (deleteTarget.type === 'food') {
        const res = await deleteFood(deleteTarget.id);
        if (res.success) {
          showNotification(`"${deleteTarget.name}" deleted from menu.`);
          setDeleteTarget(null);
          fetchData();
        } else {
          setError(res.error || 'Failed to delete food item.');
        }
      } else {
        const res = await deleteCategory(deleteTarget.id);
        if (res.success) {
          showNotification(`Category "${deleteTarget.name}" removed.`);
          setDeleteTarget(null);
          fetchData();
        } else {
          setError(res.error || 'Failed to delete category (ensure no food items are linked).');
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error during deletion.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter Foods
  const filteredFoods = useMemo(() => {
    let result = [...foods];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (f) => f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q)
      );
    }

    if (selectedCatId !== null) {
      result = result.filter((f) => {
        const catId = typeof f.category === 'object' ? f.category.id : f.categoryId;
        return catId === selectedCatId;
      });
    }

    if (availabilityFilter === 'available') {
      result = result.filter((f) => f.available);
    } else if (availabilityFilter === 'unavailable') {
      result = result.filter((f) => !f.available);
    }

    return result;
  }, [foods, searchQuery, selectedCatId, availabilityFilter]);

  // Access Control Guard
  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-8 text-center max-w-lg mx-auto shadow-sm">
          <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-700">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-stone-900 mb-2">Admin Access Required</h2>
          <p className="text-sm text-stone-600 mb-6">
            Menu catalog management is restricted to authorized Canteen Administrators.
          </p>
          <div className="space-y-3">
            <button
              onClick={handleAdminQuickSwitch}
              disabled={switchingAdmin}
              className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 disabled:bg-stone-300 text-white rounded-xl text-sm font-bold transition flex items-center justify-center space-x-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>{switchingAdmin ? 'Signing in as Admin...' : 'Sign In as Canteen Administrator'}</span>
            </button>
            <button
              onClick={() => onNavigate('menu')}
              className="w-full py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-sm font-semibold transition"
            >
              Back to Public Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <button
            onClick={() => onNavigate('admin-dashboard')}
            className="inline-flex items-center space-x-1.5 text-xs text-stone-500 hover:text-stone-800 mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Admin Dashboard</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
            Menu Catalog Management
          </h1>
          <p className="text-sm text-stone-500 mt-0.5">
            Phase 13: Add, edit, delete food items, toggle availability, and configure categories.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 transition"
            title="Refresh Catalog"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {activeTab === 'foods' ? (
            <button
              onClick={handleOpenAddFood}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Food</span>
            </button>
          ) : (
            <button
              onClick={handleOpenAddCategory}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Notification Banner */}
      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{actionSuccess}</span>
        </div>
      )}

      {/* Error Alert Banner */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-600 hover:text-rose-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tab Navigation: Food Items vs Categories */}
      <div className="flex items-center space-x-2 border-b border-stone-200 pb-2">
        <button
          onClick={() => setActiveTab('foods')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
            activeTab === 'foods'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Utensils className="w-3.5 h-3.5" />
          <span>Food Items ({foods.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
            activeTab === 'categories'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Categories ({categories.length})</span>
        </button>
      </div>

      {/* Tab 1: Food Items Management */}
      {activeTab === 'foods' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search food name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Category Filter */}
              <select
                value={selectedCatId ?? ''}
                onChange={(e) => setSelectedCatId(e.target.value ? Number(e.target.value) : null)}
                className="px-3 py-2 rounded-xl border border-stone-200 bg-white text-stone-700 font-medium"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Availability Filter */}
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value as any)}
                className="px-3 py-2 rounded-xl border border-stone-200 bg-white text-stone-700 font-medium"
              >
                <option value="all">All Status</option>
                <option value="available">Available Only</option>
                <option value="unavailable">Unavailable Only</option>
              </select>

              {(searchQuery || selectedCatId !== null || availabilityFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCatId(null);
                    setAvailabilityFilter('all');
                  }}
                  className="px-3 py-2 text-stone-500 hover:text-stone-800 underline font-medium"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Foods Table */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
            {loading && foods.length === 0 ? (
              <div className="p-16 text-center text-xs text-stone-500">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-stone-400" />
                <span>Loading food catalog...</span>
              </div>
            ) : filteredFoods.length === 0 ? (
              <div className="p-16 text-center text-xs text-stone-500">
                <Utensils className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                <p className="font-semibold text-stone-700">No food items found matching your filters.</p>
                <button
                  onClick={handleOpenAddFood}
                  className="mt-3 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold"
                >
                  Add Your First Food Item
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-600 border-b border-stone-200 uppercase font-semibold text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Food Item</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Prep Time</th>
                      <th className="py-3 px-4 text-center">Availability (Live)</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredFoods.map((food) => {
                      const catName =
                        typeof food.category === 'object'
                          ? food.category.name
                          : food.categoryName || 'General';

                      return (
                        <tr key={food.id} className="hover:bg-stone-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-3">
                              {food.imageUrl ? (
                                <img
                                  src={food.imageUrl}
                                  alt={food.name}
                                  className="w-10 h-10 rounded-xl object-cover border border-stone-200 shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-400 shrink-0">
                                  <Utensils className="w-5 h-5" />
                                </div>
                              )}
                              <div>
                                <div className="font-bold text-stone-900">{food.name}</div>
                                <div className="text-[11px] text-stone-500 line-clamp-1 max-w-xs">
                                  {food.description}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 font-semibold text-[11px]">
                              {catName}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 font-bold text-stone-900 text-sm">
                            ₹{food.price}
                          </td>

                          <td className="py-3.5 px-4 text-stone-600">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3.5 h-3.5 text-stone-400" />
                              <span>{food.preparationTime || 10} mins</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => handleToggleAvailability(food)}
                              className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition shadow-2xs ${
                                food.available
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                              }`}
                              title="Click to toggle availability in MySQL catalog"
                            >
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  food.available ? 'bg-emerald-600' : 'bg-rose-600'
                                }`}
                              />
                              <span>{food.available ? 'Available' : 'Unavailable'}</span>
                            </button>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleOpenEditFood(food)}
                                className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-600 transition"
                                title="Edit Item"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteTarget({ type: 'food', id: food.id, name: food.name })
                                }
                                className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 transition"
                                title="Delete Item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Category Management */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-stone-500">
              Manage food categories to organize the student menu and checkout filters.
            </p>
            <button
              onClick={handleOpenAddCategory}
              className="inline-flex items-center space-x-2 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Category</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      Order #{cat.displayOrder || 1}
                    </span>
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleOpenEditCategory(cat)}
                        className="p-1 rounded hover:bg-stone-100 text-stone-500 hover:text-stone-800"
                        title="Edit Category"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteTarget({ type: 'category', id: cat.id, name: cat.name })
                        }
                        className="p-1 rounded hover:bg-rose-50 text-rose-500 hover:text-rose-700"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-stone-900">{cat.name}</h3>
                  <p className="text-xs text-stone-500 mt-1">
                    {cat.description || 'No description provided.'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                  <span>
                    Items in category:{' '}
                    <strong>
                      {
                        foods.filter((f) => {
                          const cId = typeof f.category === 'object' ? f.category.id : f.categoryId;
                          return cId === cat.id;
                        }).length
                      }
                    </strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Food Modal */}
      {isFoodModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-stone-200 max-w-lg w-full p-6 shadow-xl my-8">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-4">
              <h3 className="text-lg font-bold text-stone-900">
                {editingFood ? 'Edit Food Item' : 'Add New Food Item'}
              </h3>
              <button
                onClick={() => setIsFoodModalOpen(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFood} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Food Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Masala Uttapam"
                  value={foodForm.name}
                  onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Price (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    required
                    value={foodForm.price}
                    onChange={(e) => setFoodForm({ ...foodForm, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Prep Time (mins)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={foodForm.preparationTime}
                    onChange={(e) =>
                      setFoodForm({ ...foodForm, preparationTime: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={foodForm.categoryId}
                  onChange={(e) => setFoodForm({ ...foodForm, categoryId: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-stone-900 bg-white"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Ingredients, taste, serving details..."
                  value={foodForm.description}
                  onChange={(e) => setFoodForm({ ...foodForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-stone-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Food Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={foodForm.imageUrl}
                  onChange={(e) => setFoodForm({ ...foodForm, imageUrl: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-stone-900"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="availToggle"
                  checked={foodForm.available}
                  onChange={(e) => setFoodForm({ ...foodForm, available: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300"
                />
                <label htmlFor="availToggle" className="text-stone-700 font-semibold cursor-pointer">
                  Available for Student Orders immediately
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsFoodModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 font-semibold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:bg-stone-300 text-white font-bold transition shadow-xs flex items-center space-x-1.5"
                >
                  {isSubmitting ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingFood ? 'Save Changes' : 'Create Food Item'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-4">
              <h3 className="text-lg font-bold text-stone-900">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                onClick={() => setIsCatModalOpen(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. South Indian Specials"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-stone-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  min="1"
                  value={categoryForm.displayOrder}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, displayOrder: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-stone-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief description for category..."
                  value={categoryForm.description}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-stone-900"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 font-semibold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:bg-stone-300 text-white font-bold transition shadow-xs flex items-center space-x-1.5"
                >
                  {isSubmitting ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingCategory ? 'Update' : 'Save Category'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 max-w-sm w-full p-6 shadow-xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900 mb-1">
              Delete {deleteTarget.type === 'food' ? 'Food Item' : 'Category'}?
            </h3>
            <p className="text-xs text-stone-500 mb-5">
              Are you sure you want to permanently delete <strong>"{deleteTarget.name}"</strong>? This action cannot be undone.
            </p>

            <div className="flex items-center justify-center space-x-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 font-semibold text-xs hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:bg-stone-300 text-white font-bold text-xs transition shadow-xs"
              >
                {isSubmitting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
