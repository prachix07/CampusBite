import { useState } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  ShoppingCart, 
  Clock, 
  ShieldCheck, 
  AlertCircle,
  CreditCard,
  Building,
  UserCheck,
  CheckCircle2,
  RefreshCw,
  MessageSquare
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { PickupSlotSelector } from '../components/slot/PickupSlotSelector';
import { placeOrder, OrderResponseData } from '../services/api';

interface CheckoutPageProps {
  onNavigate: (view: string) => void;
  onOrderSuccess?: (order: OrderResponseData) => void;
}

export function CheckoutPage({ onNavigate, onOrderSuccess }: CheckoutPageProps) {
  const {
    items,
    total,
    totalCount,
    estimatedPrepTime,
    isCartEmpty,
    selectedDate,
    selectedSlot,
    setSelectedDate,
    setSelectedSlot,
    clearCart,
  } = useCart();

  const { user, isAuthenticated } = useAuth();
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  if (isCartEmpty) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-20 h-20 rounded-3xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto shadow-xs">
          <ShoppingCart className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">Your Tray is Empty</h2>
        <p className="text-stone-500 text-sm max-w-md mx-auto leading-relaxed">
          Please add delicious items from the campus canteen menu to your cart before proceeding to checkout.
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

  const handlePlaceOrder = async () => {
    setOrderError(null);

    // 1. Validate cart is not empty
    if (!items || items.length === 0) {
      setOrderError('Your tray is empty. Please add items from the menu before placing an order.');
      return;
    }

    // 2. Validate food availability in tray
    const unavailableItems = items.filter((it) => it.foodItem.available === false);
    if (unavailableItems.length > 0) {
      setOrderError(
        `The following items in your tray are currently unavailable or out of stock: ${unavailableItems
          .map((u) => u.foodItem.name)
          .join(', ')}. Please remove them before checkout.`
      );
      return;
    }

    // 3. Validate positive quantities
    const invalidQty = items.filter((it) => !it.quantity || it.quantity < 1);
    if (invalidQty.length > 0) {
      setOrderError('Quantity for all items must be at least 1.');
      return;
    }

    // 4. Validate pickup date is not in past
    const todayStr = new Date().toISOString().split('T')[0];
    if (selectedDate < todayStr) {
      setOrderError('Pickup date cannot be in the past. Please select today or a future date.');
      return;
    }

    // 5. Validate slot selection
    if (!selectedSlot) {
      setOrderError('Please select an available 15-minute pickup slot before confirming your order.');
      return;
    }

    // 6. Validate student authentication
    if (!isAuthenticated) {
      setOrderError('Please sign in with your student account to place your pre-order.');
      return;
    }

    setPlacingOrder(true);

    try {
      const payload = {
        items: items.map((it) => ({
          foodItemId: it.foodItem.id,
          quantity: it.quantity,
        })),
        pickupDate: selectedDate,
        pickupSlot: selectedSlot,
        specialInstructions: specialInstructions.trim() || undefined,
        paymentMethod: 'PAY_AT_CANTEEN',
      };

      const res = await placeOrder(payload);

      if (res.success && res.data) {
        clearCart();
        if (onOrderSuccess) {
          onOrderSuccess(res.data);
        } else {
          onNavigate('confirmation');
        }
      } else {
        setOrderError(res.error || 'Failed to place order. Please try again.');
      }
    } catch (err: unknown) {
      setOrderError(err instanceof Error ? err.message : 'Network error placing order');
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <button
            onClick={() => onNavigate('cart')}
            className="inline-flex items-center space-x-1.5 text-xs text-stone-500 hover:text-amber-700 font-semibold mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Cart Tray</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Checkout & Pickup Window
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Phase 10: Server-side database price calculation, capacity lock, and order creation.
          </p>
        </div>

        {/* Phase 10 Active Badge */}
        <div className="self-start sm:self-auto flex items-center space-x-2 bg-emerald-50 border border-emerald-200 text-emerald-900 px-3.5 py-1.5 rounded-2xl text-xs font-bold shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Phase 10: Order Placement Active</span>
        </div>
      </div>

      {/* Error Alert */}
      {orderError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-xs font-medium text-rose-950 flex items-start space-x-3 animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="font-bold">Unable to Place Order</p>
            <p className="text-[11px] leading-relaxed">{orderError}</p>
            {!isAuthenticated && (
              <button
                onClick={() => onNavigate('login')}
                className="mt-2 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold inline-flex items-center space-x-1"
              >
                <span>Go to Student Login</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Grid: Slot Selector & Special Instructions (Left 2 cols) & Summary Tray (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Interactive Slot Selector & Notes */}
        <div className="lg:col-span-2 space-y-6">
          <PickupSlotSelector
            selectedDate={selectedDate}
            selectedSlot={selectedSlot}
            onSelectDate={(d) => {
              setSelectedDate(d);
              setOrderError(null);
            }}
            onSelectSlot={(s) => {
              setSelectedSlot(s);
              setOrderError(null);
            }}
          />

          {/* Kitchen Special Instructions Box */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-3">
            <h3 className="text-base font-extrabold text-stone-900 flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-amber-600" />
              <span>Kitchen Special Instructions (Optional)</span>
            </h3>
            <p className="text-xs text-stone-500">
              Add custom requests for the chefs (e.g. &ldquo;Extra chutney&rdquo;, &ldquo;Less spicy&rdquo;, &ldquo;No onions&rdquo;).
            </p>
            <textarea
              rows={2}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Please pack coffee without excessive sugar, extra tissue..."
              maxLength={255}
              className="w-full p-3 rounded-2xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs text-stone-800 placeholder-stone-400 bg-stone-50/50"
            />
            <div className="text-right text-[10px] text-stone-400">
              {specialInstructions.length}/255 characters
            </div>
          </div>
        </div>

        {/* Right Column: Checkout Summary & Payment Card */}
        <div className="space-y-5">
          {/* Student Identity Card */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-3">
            <h3 className="font-extrabold text-stone-900 text-sm flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-amber-600" />
              <span>Ordering Student</span>
            </h3>

            {isAuthenticated && user ? (
              <div className="space-y-1 text-xs text-stone-600 p-3.5 rounded-2xl bg-stone-50 border border-stone-100">
                <p className="font-bold text-stone-900">{user.fullName}</p>
                <p className="text-stone-500 font-mono text-[11px]">{user.email}</p>
                <div className="flex items-center space-x-1.5 mt-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    {user.role}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-medium">✓ Verified Session</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-xs p-3 rounded-2xl bg-amber-50/60 border border-amber-200">
                <p className="text-amber-900 font-medium text-[11px]">
                  You must be logged in as a student to place an order.
                </p>
                <button
                  onClick={() => onNavigate('login')}
                  className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors shadow-xs"
                >
                  Sign In with Student Account
                </button>
              </div>
            )}
          </div>

          {/* Payment Method Card (Pay at Canteen) */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-3">
            <h3 className="font-extrabold text-stone-900 text-sm flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-amber-600" />
              <span>Payment Option</span>
            </h3>

            <div className="p-4 rounded-2xl border-2 border-amber-500 bg-amber-50/50 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900 text-xs">Pay at Canteen</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                  Selected
                </span>
              </div>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Pay in cash or campus UPI QR code directly at Express Counter 2 when collecting your warm pre-order.
              </p>
            </div>
          </div>

          {/* Tray Summary Box */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-5">
            <h3 className="font-extrabold text-stone-900 text-base pb-3 border-b border-stone-100 flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs font-normal text-stone-500">{totalCount} items</span>
            </h3>

            {/* Compact Item List */}
            <div className="max-h-52 overflow-y-auto space-y-2.5 pr-1 divide-y divide-stone-50 text-xs">
              {items.map((item) => (
                <div key={item.foodItem.id} className="pt-2 flex justify-between items-center text-xs">
                  <div className="pr-2">
                    <span className="font-semibold text-stone-800 block">
                      {item.foodItem.name}
                    </span>
                    <span className="text-stone-400 text-[11px]">
                      {item.quantity} × ₹{Number(item.foodItem.price).toFixed(2)}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-stone-800 shrink-0">
                    ₹{(item.quantity * Number(item.foodItem.price)).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Timing & Counter */}
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100 space-y-2 text-xs text-stone-600">
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Kitchen Prep Time:</span>
                </span>
                <span className="font-bold text-stone-800 font-mono">~{estimatedPrepTime} mins</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-1.5">
                  <Building className="w-3.5 h-3.5 text-stone-400" />
                  <span>Express Collection:</span>
                </span>
                <span className="font-medium text-stone-700">Counter 2 (Pre-Order)</span>
              </div>
            </div>

            {/* Total Row */}
            <div className="pt-3 border-t border-stone-100 flex justify-between items-baseline">
              <div>
                <span className="text-sm font-extrabold text-stone-900 block">Total Due</span>
                <span className="text-[10px] text-stone-400">Database calculated price</span>
              </div>
              <span className="text-2xl font-black text-amber-700 font-mono">
                ₹{total.toFixed(2)}
              </span>
            </div>

            {/* Submit Order Button (Phase 10) */}
            <div className="pt-2">
              <button
                onClick={handlePlaceOrder}
                disabled={placingOrder || !selectedSlot}
                className={`w-full py-4 px-4 rounded-2xl text-white font-extrabold text-sm transition-all shadow-md flex items-center justify-center space-x-2 ${
                  placingOrder
                    ? 'bg-amber-400 cursor-wait'
                    : selectedSlot
                    ? 'bg-amber-600 hover:bg-amber-700 active:scale-98 cursor-pointer'
                    : 'bg-stone-300 cursor-not-allowed text-stone-500'
                }`}
              >
                {placingOrder ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Executing 11-Step Order Placement...</span>
                  </>
                ) : (
                  <>
                    <span>Place Order (Pay at Canteen)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Price & Concurrency Notice */}
            <div className="pt-3 border-t border-stone-100 flex items-start space-x-2 text-[11px] text-stone-500 leading-snug">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Phase 10: Spring Boot validates availability, locks slot capacity, calculates prices via MySQL, and generates a unique order number.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
