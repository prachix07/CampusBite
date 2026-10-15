import { Plus, Minus, Trash2 } from 'lucide-react';
import { CartItem } from '../../types';
import { useCart } from '../../context/CartContext';

interface CartItemRowProps {
  item: CartItem;
  compact?: boolean;
}

export function CartItemRow({ item, compact = false }: CartItemRowProps) {
  const { increaseQuantity, decreaseQuantity, removeFromCart } = useCart();
  const { foodItem, quantity } = item;

  const unitPrice = Number(foodItem.price) || 0;
  const itemSubtotal = unitPrice * quantity;
  const categoryName = typeof foodItem.category === 'object' ? foodItem.category.name : foodItem.category || 'General';

  return (
    <div className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl bg-white border border-stone-200/80 transition-all ${
      compact ? 'py-3' : 'hover:border-stone-300'
    }`}>
      {/* Thumbnail */}
      <div className={`relative rounded-xl overflow-hidden bg-stone-100 shrink-0 ${
        compact ? 'w-14 h-14' : 'w-16 h-16 sm:w-20 sm:h-20'
      }`}>
        <img
          src={foodItem.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300'}
          alt={foodItem.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1">
          <div>
            <h4 className="font-bold text-stone-900 text-xs sm:text-sm truncate leading-snug">
              {foodItem.name}
            </h4>
            <span className="text-[10px] text-stone-400 font-medium">
              {categoryName}
            </span>
          </div>

          {/* Remove Button */}
          <button
            onClick={() => removeFromCart(foodItem.id)}
            title="Remove item"
            className="text-stone-400 hover:text-rose-600 p-1 rounded-md transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Pricing & Quantity Controls */}
        <div className="flex items-center justify-between mt-2 pt-1 border-t border-stone-50">
          <div className="text-xs">
            <span className="text-stone-400 text-[10px]">₹{unitPrice.toFixed(2)} ea</span>
            <span className="font-extrabold text-stone-900 block text-xs sm:text-sm">
              ₹{itemSubtotal.toFixed(2)}
            </span>
          </div>

          {/* Stepper */}
          <div className="flex items-center space-x-1.5 bg-stone-100 rounded-lg p-0.5 border border-stone-200">
            <button
              onClick={() => decreaseQuantity(foodItem.id)}
              className="w-6 h-6 rounded-md bg-white hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors shadow-2xs"
              title="Decrease quantity"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-6 text-center text-xs font-bold text-stone-900 font-mono">
              {quantity}
            </span>
            <button
              onClick={() => increaseQuantity(foodItem.id)}
              className="w-6 h-6 rounded-md bg-white hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors shadow-2xs"
              title="Increase quantity"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
