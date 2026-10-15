import { ShoppingCart, ArrowRight, Trash2, ArrowLeft, Clock, ShieldCheck, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { CartItemRow } from '../components/cart/CartItemRow';

interface CartPageProps {
  onNavigate: (view: string) => void;
}

export function CartPage({ onNavigate }: CartPageProps) {
  const {
    items,
    clearCart,
    subtotal,
    total,
    totalCount,
    estimatedPrepTime,
    isCartEmpty,
  } = useCart();

  if (isCartEmpty) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-20 h-20 rounded-3xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto shadow-xs">
          <ShoppingCart className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">Your Cart is Currently Empty</h2>
        <p className="text-stone-500 text-sm max-w-md mx-auto leading-relaxed">
          Looks like you haven't added anything to your canteen tray yet. Browse through our breakfast, lunch meals, snacks, and beverages to get started!
        </p>
        <div className="pt-4">
          <button
            onClick={() => onNavigate('menu')}
            className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-xs transition-all inline-flex items-center space-x-2"
          >
            <span>Browse Canteen Menu</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <button
            onClick={() => onNavigate('menu')}
            className="inline-flex items-center space-x-1.5 text-xs text-stone-500 hover:text-amber-700 font-semibold mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Adding Food</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Review Your Order Tray
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            You have {totalCount} {totalCount === 1 ? 'item' : 'items'} in your cart. Review quantities before reserving your pickup slot.
          </p>
        </div>

        <button
          onClick={clearCart}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-rose-50 hover:border-rose-200 text-stone-500 hover:text-rose-600 text-xs font-semibold transition-colors self-start sm:self-auto"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Empty Cart</span>
        </button>
      </div>

      {/* Main Grid: Cart Items (Left 2 cols) & Summary Box (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Items List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="space-y-3">
            {items.map((item) => (
              <CartItemRow key={item.foodItem.id} item={item} />
            ))}
          </div>

          {/* Canteen Kitchen Notice */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1.5">
            <div className="flex items-center space-x-2 font-bold text-amber-800">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Canteen Preparation Estimate: ~{estimatedPrepTime} minutes</span>
            </div>
            <p className="text-amber-700 leading-relaxed text-[11px]">
              Our canteen chefs will batch prepare your order so it's steaming hot at the beginning of your selected pickup slot.
            </p>
          </div>
        </div>

        {/* Right Column: Order Summary Card */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-5">
            <h3 className="font-extrabold text-stone-900 text-base pb-3 border-b border-stone-100">
              Order Summary
            </h3>

            {/* Calculations Breakdown */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Items Subtotal ({totalCount} items)</span>
                <span className="font-semibold text-stone-900 font-mono">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Campus Canteen Subsidy</span>
                <span className="text-emerald-600 font-medium font-mono">₹0.00</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Estimated Taxes (GST)</span>
                <span className="text-stone-500 font-mono">Included in price</span>
              </div>

              {/* Total Row */}
              <div className="pt-3 border-t border-stone-100 flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-extrabold text-stone-900 block">Total Amount</span>
                  <span className="text-[10px] text-stone-400">Pay at canteen pickup counter</span>
                </div>
                <span className="text-2xl font-black text-amber-700 font-mono">
                  ₹{total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Next Step Call to Action */}
            <div className="pt-2">
              <button
                onClick={() => onNavigate('checkout')}
                className="w-full py-3.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-98 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center space-x-2"
              >
                <span>Proceed to Select Pickup Slot</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Security Guarantee Notice */}
            <div className="pt-3 border-t border-stone-100 flex items-start space-x-2 text-[11px] text-stone-500 leading-snug">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Backend Price Protection: Actual totals are securely validated against the MySQL database during pre-order placement.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
