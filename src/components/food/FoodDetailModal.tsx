import { X, Clock, Plus, AlertCircle } from 'lucide-react';
import { FoodItem } from '../../types';

interface FoodDetailModalProps {
  food: FoodItem | null;
  onClose: () => void;
  onAddToCart: (food: FoodItem) => void;
}

export function FoodDetailModal({ food, onClose, onAddToCart }: FoodDetailModalProps) {
  if (!food) return null;

  const categoryName = typeof food.category === 'object' ? food.category.name : food.category || 'General';

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Image */}
        <div className="relative h-60 w-full bg-stone-100">
          <img
            src={food.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'}
            alt={food.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-stone-900/60 text-white flex items-center justify-center hover:bg-stone-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <span className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs text-stone-800 text-xs font-bold px-3 py-1 rounded-full shadow-xs">
            {categoryName}
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-stone-900">{food.name}</h2>
              <div className="flex items-center space-x-3 mt-1.5 text-xs text-stone-500">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Prep Time: {food.preparationTime} minutes</span>
                </span>
                <span>•</span>
                <span className={food.available ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>
                  {food.available ? 'Ready to Order' : 'Currently Unavailable'}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-2xl font-extrabold text-stone-900">
                ₹{Number(food.price).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-stone-100">
            <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">Description & Ingredients</h4>
            <p className="text-stone-600 text-sm leading-relaxed">
              {food.description || 'Prepared fresh at the campus canteen with locally sourced ingredients.'}
            </p>
          </div>

          {/* Action Footer */}
          <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-stone-200 text-stone-600 font-medium text-xs hover:bg-stone-50"
            >
              Close
            </button>

            {food.available ? (
              <button
                onClick={() => {
                  onAddToCart(food);
                  onClose();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm transition-all flex items-center justify-center space-x-2 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add to Cart • ₹{Number(food.price).toFixed(2)}</span>
              </button>
            ) : (
              <div className="flex-1 py-2.5 px-4 rounded-xl bg-stone-100 text-stone-400 font-semibold text-xs text-center flex items-center justify-center space-x-1.5 border border-stone-200">
                <AlertCircle className="w-4 h-4" />
                <span>Item is Out of Stock</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
