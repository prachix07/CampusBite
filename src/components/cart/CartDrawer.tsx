import { X, ShoppingCart, ArrowRight, Trash2, Clock, ShieldAlert } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { CartItemRow } from './CartItemRow';

interface CartDrawerProps {
  onNavigateToCart: () => void;
  onNavigateToCheckout: () => void;
  onExploreMenu: () => void;
}

export function CartDrawer({
  onNavigateToCart,
  onNavigateToCheckout,
  onExploreMenu,
}: CartDrawerProps) {
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    clearCart,
    subtotal,
    totalCount,
    estimatedPrepTime,
    isCartEmpty,
  } = useCart();

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-stone-50 h-full shadow-2xl flex flex-col border-l border-stone-200 animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="bg-white px-5 py-4 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">Your Canteen Tray</h3>
              <p className="text-[11px] text-stone-500">
                {totalCount} {totalCount === 1 ? 'item' : 'items'} selected
              </p>
            </div>
          </div>

          <button
            onClick={closeDrawer}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isCartEmpty ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mb-1">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-stone-900 text-base">Your Cart is Empty</h4>
              <p className="text-xs text-stone-500 max-w-xs leading-relaxed">
                Add delicious campus meals, crispy snacks, or refreshing beverages from the canteen menu.
              </p>
              <button
                onClick={() => {
                  closeDrawer();
                  onExploreMenu();
                }}
                className="mt-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <>
              {/* Preparation Time Notice */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Est. Kitchen Prep Time:</span>
                </div>
                <span className="font-extrabold text-amber-800 font-mono">
                  ~{estimatedPrepTime} mins
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-2.5">
                {items.map((item) => (
                  <CartItemRow key={item.foodItem.id} item={item} compact={true} />
                ))}
              </div>

              {/* Clear Cart Button */}
              <div className="pt-2 text-right">
                <button
                  onClick={clearCart}
                  className="text-[11px] text-stone-400 hover:text-rose-600 font-medium inline-flex items-center space-x-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Empty Cart</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Drawer Footer with Calculations */}
        {!isCartEmpty && (
          <div className="bg-white p-5 border-t border-stone-200 shadow-lg space-y-3">
            <div className="space-y-1.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-stone-900">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Canteen Service Fee</span>
                <span className="text-emerald-600 font-medium">FREE (Campus subsidized)</span>
              </div>
              <div className="pt-2 border-t border-stone-100 flex justify-between text-sm font-extrabold text-stone-900">
                <span>Total Amount</span>
                <span className="text-base text-amber-700">₹{subtotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => {
                  closeDrawer();
                  onNavigateToCart();
                }}
                className="py-2.5 px-3 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 font-semibold text-xs text-center transition-colors"
              >
                View Full Cart
              </button>
              <button
                onClick={() => {
                  closeDrawer();
                  onNavigateToCheckout();
                }}
                className="py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-xs transition-all"
              >
                <span>Select Slot</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[10px] text-stone-400 text-center pt-1">
              Payment mode: <strong>Pay at Canteen Counter</strong> upon pickup
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
