import { Clock, Plus, AlertCircle, Check } from 'lucide-react';
import { FoodItem } from '../../types';

interface FoodCardProps {
  food: FoodItem;
  onAddToCart?: (food: FoodItem) => void;
  onClickDetails?: (food: FoodItem) => void;
  cartQuantity?: number;
}

export function FoodCard({ food, onAddToCart, onClickDetails, cartQuantity = 0 }: FoodCardProps) {
  const isAvailable = food.available;
  const categoryName = typeof food.category === 'object' ? food.category.name : food.category || 'General';

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col overflow-hidden shadow-xs hover:shadow-md ${
      isAvailable ? 'border-stone-200 hover:border-amber-300' : 'border-stone-200/60 opacity-80'
    }`}>
      {/* Image Container with Badges */}
      <div 
        className="relative h-44 w-full bg-stone-100 overflow-hidden cursor-pointer group"
        onClick={() => onClickDetails && onClickDetails(food)}
      >
        <img
          src={food.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500'}
          alt={food.name}
          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
            !isAvailable ? 'grayscale-50 contrast-75' : ''
          }`}
          loading="lazy"
        />

        {/* Category Pill */}
        <span className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-xs text-stone-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs border border-white/40">
          {categoryName}
        </span>

        {/* Preparation Time */}
        <div className="absolute bottom-2.5 left-2.5 bg-stone-900/80 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-0.5 rounded-md flex items-center space-x-1">
          <Clock className="w-3 h-3 text-amber-400" />
          <span>{food.preparationTime} mins</span>
        </div>

        {/* Availability Badge */}
        <div className="absolute top-2.5 right-2.5">
          {isAvailable ? (
            <span className="bg-emerald-500/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
              Available
            </span>
          ) : (
            <span className="bg-rose-500/95 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center space-x-1">
              <AlertCircle className="w-3 h-3" />
              <span>Unavailable</span>
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 
            onClick={() => onClickDetails && onClickDetails(food)}
            className="font-bold text-stone-900 text-base leading-snug cursor-pointer hover:text-amber-600 transition-colors line-clamp-1"
          >
            {food.name}
          </h3>
          <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
            {food.description || 'Freshly prepared at the campus canteen with hygienic ingredients.'}
          </p>
        </div>

        {/* Price & Add to Cart Footer */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400 block -mb-0.5">Price</span>
            <span className="text-lg font-extrabold text-stone-900">
              ₹{Number(food.price).toFixed(2)}
            </span>
          </div>

          <div>
            {isAvailable ? (
              <button
                onClick={() => onAddToCart && onAddToCart(food)}
                className="py-1.5 px-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-semibold text-xs transition-all flex items-center space-x-1.5 shadow-xs hover:shadow"
              >
                {cartQuantity > 0 ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-amber-200" />
                    <span>Added ({cartQuantity})</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
            ) : (
              <span className="py-1 px-2.5 rounded-lg bg-stone-100 text-stone-400 text-xs font-medium cursor-not-allowed border border-stone-200">
                Currently Unavailable
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
