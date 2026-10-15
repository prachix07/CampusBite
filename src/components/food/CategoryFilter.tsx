import { Category } from '../../types';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (categoryId: number | null) => void;
}

export function CategoryFilter({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
      {/* "All" Button */}
      <button
        onClick={() => onSelectCategory(null)}
        className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
          selectedCategoryId === null
            ? 'bg-amber-600 text-white shadow-xs'
            : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 hover:border-stone-300'
        }`}
      >
        All Categories
      </button>

      {/* Dynamic Categories */}
      {categories.map((cat) => {
        const isSelected = selectedCategoryId === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              isSelected
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 hover:border-stone-300'
            }`}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
