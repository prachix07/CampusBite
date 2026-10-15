import { useState, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, 
  Receipt, 
  Clock, 
  Calendar, 
  MapPin, 
  CreditCard, 
  RefreshCw, 
  Copy, 
  Check, 
  Printer, 
  RotateCcw, 
  XCircle, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle,
  ChefHat,
  ChevronRight,
  User,
  Utensils
} from 'lucide-react';
import { OrderResponseData, getOrderByNumber, getOrderById, updateOrderStatus, cancelOrder } from '../services/api';
import { OrderStatusBadge } from '../components/orders/OrderStatusBadge';
import { OrderStatusTracker } from '../components/orders/OrderStatusTracker';
import { OrderStatus } from '../types';
import { useCart } from '../context/CartContext';

interface OrderDetailsPageProps {
  orderNumber?: string;
  orderId?: number;
  initialOrder?: OrderResponseData | null;
  onNavigate: (view: string) => void;
}

export function OrderDetailsPage({
  orderNumber,
  orderId,
  initialOrder,
  onNavigate,
}: OrderDetailsPageProps) {
  const { addToCart } = useCart();

  const [order, setOrder] = useState<OrderResponseData | null>(initialOrder || null);
  const [loading, setLoading] = useState<boolean>(!initialOrder);
  const [refreshing, setRefreshing] = useState(false);
  const [autoPoll, setAutoPoll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Load from backend
  const fetchOrderDetails = useCallback(async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    setError(null);

    try {
      let res;
      if (orderId) {
        res = await getOrderById(orderId);
      } else if (orderNumber) {
        res = await getOrderByNumber(orderNumber);
      } else if (initialOrder?.orderNumber) {
        res = await getOrderByNumber(initialOrder.orderNumber);
      }

      if (res && res.success && res.data) {
        setOrder(res.data);
      } else if (!order) {
        setError(res?.error || 'Unable to retrieve order details from server.');
      }
    } catch (err: unknown) {
      if (!order) {
        setError(err instanceof Error ? err.message : 'Error retrieving order.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orderId, orderNumber, initialOrder, order]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  // Live Auto-Polling (every 6 seconds if enabled)
  useEffect(() => {
    if (!autoPoll) return;
    const interval = setInterval(() => {
      fetchOrderDetails(true);
    }, 6000);
    return () => clearInterval(interval);
  }, [autoPoll, fetchOrderDetails]);

  // Copy order number
  const handleCopyOrderNumber = () => {
    if (order?.orderNumber) {
      navigator.clipboard.writeText(order.orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Status simulation / admin test transition
  const handleSimulateStatus = async (targetStatus: OrderStatus) => {
    if (!order) return;
    setRefreshing(true);
    try {
      const res = await updateOrderStatus(order.id, targetStatus);
      if (res.success && res.data) {
        setOrder(res.data);
        setActionNotice(`Order status updated to: ${targetStatus}`);
        setTimeout(() => setActionNotice(null), 3000);
      } else {
        alert(res.error || 'Failed to update status.');
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error updating status');
    } finally {
      setRefreshing(false);
    }
  };

  // Cancel order
  const handleCancelOrder = async () => {
    if (!order) return;
    if (!window.confirm(`Are you sure you want to cancel order #${order.orderNumber}?`)) {
      return;
    }

    try {
      const res = await cancelOrder(order.id);
      if (res.success && res.data) {
        setOrder(res.data);
        setActionNotice(`Order #${order.orderNumber} has been cancelled.`);
        setTimeout(() => setActionNotice(null), 3000);
      } else {
        alert(res.error || 'Failed to cancel order.');
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error cancelling order');
    }
  };

  // Reorder items
  const handleReorder = () => {
    if (!order) return;
    let count = 0;
    order.items.forEach((it) => {
      addToCart(
        {
          id: it.foodItemId,
          name: it.foodName,
          description: '',
          price: it.priceAtPurchase,
          category: 'Canteen Item',
          imageUrl: '',
          available: true,
          preparationTime: 10,
        },
        it.quantity
      );
      count += it.quantity;
    });
    setActionNotice(`Added ${count} items to cart!`);
    setTimeout(() => {
      setActionNotice(null);
      onNavigate('cart');
    }, 1000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin text-amber-600 mx-auto" />
        <p className="text-sm text-stone-500 font-medium">Fetching live order details from backend...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-stone-900">Order Not Found</h2>
        <p className="text-xs text-stone-500">{error || 'Could not locate the requested order.'}</p>
        <div className="pt-2 flex justify-center space-x-3">
          <button
            onClick={() => onNavigate('orders')}
            className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold"
          >
            Back to My Orders
          </button>
          <button
            onClick={() => fetchOrderDetails()}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const isCancellable = order.status === 'PLACED';
  const orderFormattedDate = order.createdAt
    ? new Date(order.createdAt).toLocaleString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Recently';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-200">
      {/* Toast Notice */}
      {actionNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2 text-xs font-medium border border-stone-700 animate-in fade-in slide-in-from-bottom-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Top Breadcrumb & Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 print:hidden">
        <button
          onClick={() => onNavigate('orders')}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Orders</span>
        </button>

        <div className="flex items-center space-x-2.5 self-end sm:self-auto text-xs">
          {/* Auto Poll Toggle */}
          <button
            onClick={() => setAutoPoll(!autoPoll)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all flex items-center space-x-1.5 ${
              autoPoll
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
            title="Automatically poll backend every 6 seconds for status changes"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${autoPoll ? 'bg-amber-600 animate-pulse' : 'bg-stone-300'}`} />
            <span>Live Auto-Poll: {autoPoll ? 'ON' : 'OFF'}</span>
          </button>

          {/* Manual Refresh */}
          <button
            onClick={() => fetchOrderDetails()}
            disabled={refreshing}
            className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors"
            title="Refresh from backend"
          >
            <RefreshCw className={`w-4 h-4 text-amber-600 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* Print Token */}
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>

      {/* Main Order Header Banner */}
      <div className="bg-stone-900 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase font-bold tracking-wider text-amber-400">
                Canteen Order Token
              </span>
              <span className="text-stone-500">·</span>
              <span className="text-xs text-stone-300 font-mono">DB ID #{order.id}</span>
            </div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl sm:text-3xl font-black font-mono tracking-wider">
                {order.orderNumber}
              </h1>
              <button
                onClick={handleCopyOrderNumber}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Copy Order Number"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-stone-400">
              Placed on <strong className="text-white">{orderFormattedDate}</strong>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="bg-stone-800/90 border border-stone-700 px-4 py-2.5 rounded-2xl">
              <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-semibold">
                Current Status
              </span>
              <div className="mt-0.5">
                <OrderStatusBadge status={order.status} size="lg" />
              </div>
            </div>

            <div className="bg-stone-800/90 border border-stone-700 px-4 py-2.5 rounded-2xl">
              <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-semibold">
                Bill Total
              </span>
              <span className="text-lg font-mono font-bold text-amber-400 tabular-nums">
                ₹{Number(order.totalAmount).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Status Tracker Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold text-stone-900">Order Status Tracker</h2>
          </div>
          <span className="text-xs text-stone-500 font-mono">
            {order.status === 'COLLECTED' ? 'Order Fulfilled' : 'Live Status'}
          </span>
        </div>

        {/* Component: Visual Progression PLACED -> ACCEPTED -> PREPARING -> READY -> COLLECTED */}
        <OrderStatusTracker
          status={order.status}
          pickupSlot={order.pickupSlot}
          orderNumber={order.orderNumber}
          createdAt={order.createdAt}
        />

        {/* Status Transition Simulator (for evaluation & canteen kitchen testing) */}
        <div className="mt-6 pt-5 border-t border-stone-100 space-y-2.5 print:hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-700 flex items-center space-x-1.5">
              <ChefHat className="w-3.5 h-3.5 text-amber-600" />
              <span>Canteen Kitchen Simulator (Live Testing Controls)</span>
            </span>
            <span className="text-[11px] text-stone-400">
              Click to advance order state in real backend
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {(['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'COLLECTED', 'CANCELLED', 'REJECTED'] as OrderStatus[]).map(
              (st) => (
                <button
                  key={st}
                  onClick={() => handleSimulateStatus(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    order.status === st
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                  }`}
                >
                  {st}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Two Column Layout: Pickup Token Info & Itemized Bill */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Scheduled Pickup Pass */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Pickup Information</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-amber-600" />
                  <span>Scheduled Pickup Slot</span>
                </span>
                <p className="text-sm font-extrabold text-stone-900 font-mono">
                  {order.pickupSlot}
                </p>
                <p className="text-[11px] text-amber-900/80">
                  Capacity spot was locked in MySQL database
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center space-x-1">
                  <Calendar className="w-3 h-3 text-stone-400" />
                  <span>Pickup Date</span>
                </span>
                <p className="text-sm font-extrabold text-stone-900 font-mono">
                  {order.pickupDate}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-stone-400" />
                  <span>Pickup Location</span>
                </span>
                <p className="text-sm font-extrabold text-stone-900">
                  Counter 2 — Express Order Tray
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center space-x-1">
                  <CreditCard className="w-3 h-3 text-stone-400" />
                  <span>Payment Mode</span>
                </span>
                <p className="text-sm font-extrabold text-amber-800">
                  Pay at Canteen (Cash / UPI at Counter)
                </p>
              </div>

              {/* Student Details */}
              <div className="pt-2 border-t border-stone-100 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                  Student Account
                </span>
                <div className="flex items-center space-x-2 text-stone-700">
                  <User className="w-3.5 h-3.5 text-stone-400" />
                  <span className="font-semibold">{order.studentName || 'Student User'}</span>
                </div>
                <p className="text-[11px] text-stone-400 truncate">{order.studentEmail}</p>
              </div>

              {/* Special Instructions */}
              {order.specialInstructions && (
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                    Special Preparation Notes
                  </span>
                  <p className="text-xs text-stone-700 italic font-mono">
                    {order.specialInstructions}
                  </p>
                </div>
              )}
            </div>

            {/* Cancel Action if PLACED */}
            {isCancellable && (
              <div className="pt-3 border-t border-stone-100">
                <button
                  onClick={handleCancelOrder}
                  className="w-full py-2.5 px-3 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-700 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Cancel Order</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Itemized Receipt & Pricing Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-2xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center space-x-2">
                <Receipt className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-stone-900">Itemized Bill Breakdown</h3>
              </div>
              <span className="text-xs text-stone-500 font-mono">
                {order.items.length} unique items
              </span>
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 font-bold">Item Description</th>
                    <th className="py-2.5 text-center font-bold">Qty</th>
                    <th className="py-2.5 text-right font-bold">Unit Price</th>
                    <th className="py-2.5 text-right font-bold">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {order.items.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-3 font-semibold text-stone-900">
                        {item.foodName}
                        <span className="block text-[10px] text-stone-400 font-mono">
                          ID #{item.foodItemId}
                        </span>
                      </td>
                      <td className="py-3 text-center font-mono font-bold text-stone-700">
                        {item.quantity}
                      </td>
                      <td className="py-3 text-right font-mono text-stone-600 tabular-nums">
                        ₹{Number(item.priceAtPurchase).toFixed(2)}
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-stone-900 tabular-nums">
                        ₹{Number(item.subtotal).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bill Summary Calculations */}
            <div className="pt-4 border-t border-stone-200 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Items Subtotal</span>
                <span className="font-mono tabular-nums">₹{Number(order.totalAmount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Canteen Packaging & Pickup Fee</span>
                <span className="font-mono text-emerald-700 font-bold">FREE</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Taxes & Canteen Surcharge</span>
                <span className="font-mono text-stone-400">Included in price</span>
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-extrabold text-stone-900 block">Total Due</span>
                  <span className="text-[11px] text-stone-400">To be settled at Counter 2</span>
                </div>
                <span className="text-2xl font-black font-mono text-stone-900 tabular-nums">
                  ₹{Number(order.totalAmount).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 print:hidden">
              <button
                onClick={() => onNavigate('menu')}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>Explore Full Menu</span>
              </button>

              <button
                onClick={handleReorder}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reorder Items</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
