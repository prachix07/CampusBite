import { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  X, 
  SlidersHorizontal, 
  AlertCircle, 
  ShoppingBag,
  ArrowUpDown,
  RefreshCw
} from 'lucide-react';
import { FoodItem, Category } from '../types';
import { getFoods, getCategories } from '../services/api';
import { FoodCard } from '../components/food/FoodCard';
import { CategoryFilter } from '../components/food/CategoryFilter';
import { FoodDetailModal } from '../components/food/FoodDetailModal';

interface MenuPageProps {
  onAddToCart?: (food: FoodItem) => void;
  cartItemCounts?: Record<number, number>;
}

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'prep-time';

export function MenuPage({ onAddToCart, cartItemCounts = {} }: MenuPageProps) {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [availableOnly, setAvailableOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortOption>('default');

  // Modal Detail State
  const [selectedFoodForModal, setSelectedFoodForModal] = useState<FoodItem | null>(null);

  // Initial Load from real Spring Boot REST API
  const fetchMenuData = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch categories
      const catRes = await getCategories();
      if (catRes.success && catRes.data) {
        setCategories(catRes.data);
      }

      // 2. Fetch food items
      const foodRes = await getFoods();
      if (foodRes.success && foodRes.data) {
        setFoods(foodRes.data as FoodItem[]);
      } else {
        setError(foodRes.error || 'Failed to load menu items from Spring Boot backend.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Network error connecting to backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuData();
  }, []);

  // Filter & Sort Logic
  const filteredAndSortedFoods = useMemo(() => {
    let result = [...foods];

    // 1. Filter by Category
    if (selectedCategoryId !== null) {
      result = result.filter((item) => {
        const itemCatId = typeof item.category === 'object' ? item.category.id : item.categoryId;
        return itemCatId === selectedCategoryId;
      });
    }

    // 2. Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q))
      );
    }

    // 3. Filter by Availability
    if (availableOnly) {
      result = result.filter((item) => item.available);
    }

    // 4. Sort
    if (sortBy === 'price-asc') {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === 'prep-time') {
      result.sort((a, b) => a.preparationTime - b.preparationTime);
    }

    return result;
  }, [foods, selectedCategoryId, searchQuery, availableOnly, sortBy]);

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title & Subtitle */}
      <div>
        <span className="text-amber-700 font-bold text-xs uppercase tracking-wider">
          College Canteen Catalog
        </span>
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight mt-0.5">
          Campus Menu & Live Availability
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          Browse daily freshly prepared meals, snacks, and beverages. Select items to pre-order for your chosen slot.
        </p>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        {/* Row 1: Search Bar & Sort Dropdown */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search foods by name (e.g. Samosa, Dosa, Cold Coffee, Thali)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm text-stone-800 placeholder-stone-400"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center space-x-2 shrink-0">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label="Sort food items"
                className="appearance-none bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 pr-8 text-xs sm:text-sm font-medium text-stone-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
              >
                <option value="default">Sort: Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="prep-time">Prep Time: Quickest</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchMenuData}
              title="Refresh menu from backend"
              className="p-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-500 hover:text-stone-800 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Row 2: Category Filter Pills & Available-Only Checkbox */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3 border-t border-stone-100">
          <CategoryFilter
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
          />

          <label className="flex items-center space-x-2 text-xs font-semibold text-stone-700 cursor-pointer shrink-0 select-none">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 border-stone-300"
            />
            <span>Show Available Only</span>
          </label>
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start space-x-3">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Backend Connection Notice</p>
            <p className="mt-0.5 text-amber-800 leading-relaxed">{error}</p>
            <p className="mt-2 text-amber-700">
              Run <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">mvn spring-boot:run</code> inside the <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">backend/</code> directory.
            </p>
          </div>
        </div>
      )}

      {/* Menu Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="bg-white rounded-2xl p-4 border border-stone-200 animate-pulse space-y-3">
              <div className="h-44 bg-stone-200 rounded-xl"></div>
              <div className="h-4 bg-stone-200 rounded w-3/4"></div>
              <div className="h-3 bg-stone-200 rounded w-full"></div>
              <div className="h-3 bg-stone-200 rounded w-1/2"></div>
              <div className="h-9 bg-stone-200 rounded mt-4"></div>
            </div>
          ))}
        </div>
      ) : filteredAndSortedFoods.length > 0 ? (
        <div>
          <div className="flex items-center justify-between text-xs text-stone-500 mb-4 px-1">
            <span>Showing <strong>{filteredAndSortedFoods.length}</strong> items</span>
            {searchQuery && (
              <span>Matching "<strong>{searchQuery}</strong>"</span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedFoods.map((food) => (
              <FoodCard
                key={food.id}
                food={food}
                onAddToCart={onAddToCart}
                onClickDetails={setSelectedFoodForModal}
                cartQuantity={cartItemCounts[food.id] || 0}
              />
            ))}
          </div>
        </div>
      ) : (
        /* Empty Search / Filter State */
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-md mx-auto space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-stone-900 text-lg">No Food Items Found</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            We couldn't find any items matching your active search or filters. Try clearing your search or switching categories.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategoryId(null);
                setAvailableOnly(false);
              }}
              className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      )}

      {/* Food Detail Modal */}
      <FoodDetailModal
        food={selectedFoodForModal}
        onClose={() => setSelectedFoodForModal(null)}
        onAddToCart={(food) => {
          if (onAddToCart) onAddToCart(food);
          setSelectedFoodForModal(null);
        }}
      />
    </div>
  );
}
