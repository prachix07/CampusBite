import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Receipt, 
  Search, 
  RefreshCw, 
  Clock, 
  Calendar, 
  AlertCircle, 
  ArrowRight, 
  Utensils, 
  Eye, 
  RotateCcw, 
  XCircle,
  Filter,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getMyOrders, cancelOrder, OrderResponseData } from '../services/api';
import { OrderStatusBadge } from '../components/orders/OrderStatusBadge';
import { OrderStatusTracker } from '../components/orders/OrderStatusTracker';
import { OrderStatus } from '../types';

interface MyOrdersPageProps {
  onNavigate: (view: string) => void;
  onSelectOrder: (order: OrderResponseData) => void;
}

type FilterTab = 'ALL' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export function MyOrdersPage({ onNavigate, onSelectOrder }: MyOrdersPageProps) {
  const { isAuthenticated, user } = useAuth();
  const { addToCart } = useCart();

  const [orders, setOrders] = useState<OrderResponseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Load orders from backend
  const fetchOrders = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await getMyOrders();
      if (res.success && res.data) {
        setOrders(res.data);
      } else {
        setError(res.error || 'Failed to load your orders.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Network error loading orders.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Handle Order Cancellation
  const handleCancelOrder = async (orderId: number, orderNum: string) => {
    if (!window.confirm(`Are you sure you want to cancel order #${orderNum}?`)) {
      return;
    }

    try {
      const res = await cancelOrder(orderId);
      if (res.success && res.data) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: 'CANCELLED' as OrderStatus } : o))
        );
        setActionMessage(`Order #${orderNum} has been cancelled.`);
        setTimeout(() => setActionMessage(null), 3000);
      } else {
        alert(res.error || 'Failed to cancel order.');
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error cancelling order');
    }
  };

  // Reorder: add items back to cart
  const handleReorder = (order: OrderResponseData) => {
    let count = 0;
    order.items.forEach((item) => {
      // Re-create FoodItem structure for Cart
      addToCart(
        {
          id: item.foodItemId,
          name: item.foodName,
          description: '',
          price: item.priceAtPurchase,
          category: 'Canteen Item',
          imageUrl: '',
          available: true,
          preparationTime: 10,
        },
        item.quantity
      );
      count += item.quantity;
    });

    setActionMessage(`Added ${count} items from order #${order.orderNumber} to your cart!`);
    setTimeout(() => {
      setActionMessage(null);
      onNavigate('cart');
    }, 1200);
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Tab Filtering
      if (activeTab === 'ACTIVE') {
        const activeStatuses: OrderStatus[] = ['PLACED', 'ACCEPTED', 'PREPARING', 'READY'];
        if (!activeStatuses.includes(order.status)) return false;
      } else if (activeTab === 'COMPLETED') {
        if (order.status !== 'COLLECTED') return false;
      } else if (activeTab === 'CANCELLED') {
        if (order.status !== 'CANCELLED' && order.status !== 'REJECTED') return false;
      }

      // Search Filtering
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesNumber = order.orderNumber.toLowerCase().includes(query);
        const matchesId = String(order.id).includes(query);
        const matchesItem = order.items.some((item) =>
          item.foodName.toLowerCase().includes(query)
        );
        if (!matchesNumber && !matchesId && !matchesItem) return false;
      }

      return true;
    });
  }, [orders, activeTab, searchQuery]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Action Notification Toast */}
      {actionMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2 text-xs font-medium border border-stone-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center space-x-2 text-xs text-stone-500 font-medium">
            <span>Student Dashboard</span>
            <span>/</span>
            <span className="text-stone-900">Order History</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1 flex items-center space-x-3">
            <Receipt className="w-7 h-7 text-amber-600" />
            <span>My Orders & Live Tracking</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Real-time status updates, pickup slot details, and itemized receipts from the canteen.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchOrders(true)}
            disabled={refreshing || loading}
            className="px-4 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center space-x-2 shadow-2xs transition-colors"
            title="Refresh order history from backend"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-600 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Updating...' : 'Refresh Live Status'}</span>
          </button>

          <button
            onClick={() => onNavigate('menu')}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors"
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Order Food</span>
          </button>
        </div>
      </div>

      {/* Non-Authenticated Student Notice */}
      {!isAuthenticated && (
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center space-x-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              You are currently viewing orders in guest preview mode. Sign in to link orders to your student roll number.
            </span>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => onNavigate('login')}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
            >
              Sign In
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Filter Tabs */}
        <div className="flex items-center bg-stone-100 p-1 rounded-xl text-xs font-medium text-stone-600">
          {(
            [
              { id: 'ALL', label: 'All Orders', count: orders.length },
              {
                id: 'ACTIVE',
                label: 'Active Live',
                count: orders.filter((o) =>
                  ['PLACED', 'ACCEPTED', 'PREPARING', 'READY'].includes(o.status)
                ).length,
              },
              {
                id: 'COMPLETED',
                label: 'Completed',
                count: orders.filter((o) => o.status === 'COLLECTED').length,
              },
              {
                id: 'CANCELLED',
                label: 'Cancelled / Rejected',
                count: orders.filter((o) => o.status === 'CANCELLED' || o.status === 'REJECTED')
                  .length,
              },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
                activeTab === tab.id
                  ? 'bg-white text-stone-900 font-bold shadow-xs'
                  : 'hover:text-stone-900'
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] text-stone-400 font-mono">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search by Order # or food item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-stone-200 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 placeholder:text-stone-400"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white rounded-2xl p-6 border border-stone-200 animate-pulse space-y-4"
            >
              <div className="h-4 bg-stone-200 rounded-md w-1/4"></div>
              <div className="h-6 bg-stone-100 rounded-md w-3/4"></div>
              <div className="h-10 bg-stone-100 rounded-md w-full"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <h3 className="text-base font-bold text-stone-900">Failed to Retrieve Orders</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">{error}</p>
          <button
            onClick={() => fetchOrders(true)}
            className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : filteredOrders.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-4 shadow-2xs">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-amber-600">
            <Receipt className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-900">
              {searchQuery ? 'No matching orders found' : 'No Orders Placed Yet'}
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 leading-relaxed">
              {searchQuery
                ? 'Try clearing your search query or switching filter tabs.'
                : 'You have not placed any orders yet. Choose your favorite meal from the menu and book your pickup slot!'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('menu')}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-all"
          >
            <Utensils className="w-4 h-4" />
            <span>Explore Canteen Menu</span>
          </button>
        </div>
      ) : (
        /* Order Cards List */
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isCancellable = order.status === 'PLACED';
            const formattedDate = order.createdAt
              ? new Date(order.createdAt).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Recently placed';

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-2xs hover:shadow-sm transition-all space-y-5"
              >
                {/* Order Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-base font-extrabold text-stone-900">
                        {order.orderNumber}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        (DB ID #{order.id})
                      </span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-stone-500">
                      <span>Ordered on:</span>
                      <strong className="text-stone-700">{formattedDate}</strong>
                    </div>
                  </div>

                  {/* Pickup Slot & Date Indicator */}
                  <div className="flex items-center space-x-3 bg-stone-50 px-3.5 py-2 rounded-xl border border-stone-200/80 text-xs">
                    <div className="flex items-center space-x-1.5 text-stone-700">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      <span className="font-medium">{order.pickupDate}</span>
                    </div>
                    <span className="text-stone-300">|</span>
                    <div className="flex items-center space-x-1.5 text-amber-800 font-bold">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>{order.pickupSlot}</span>
                    </div>
                  </div>
                </div>

                {/* Compact 5-Step Visual Status Tracker */}
                <div className="py-1">
                  <OrderStatusTracker
                    status={order.status}
                    orderNumber={order.orderNumber}
                    pickupSlot={order.pickupSlot}
                    compact={true}
                  />
                </div>

                {/* Items Summary & Total Strip */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
                  <div className="space-y-1 max-w-xl">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                      Ordered Items ({order.items.reduce((s, it) => s + it.quantity, 0)} total)
                    </span>
                    <div className="flex flex-wrap gap-2 text-xs text-stone-700">
                      {order.items.map((it) => (
                        <span
                          key={it.id || it.foodItemId}
                          className="bg-stone-50 px-2.5 py-1 rounded-md border border-stone-200/80"
                        >
                          <strong className="text-stone-900">{it.quantity}x</strong> {it.foodName}{' '}
                          <span className="text-stone-400 font-mono">
                            (₹{it.priceAtPurchase})
                          </span>
                        </span>
                      ))}
                    </div>
                    {order.specialInstructions && (
                      <p className="text-[11px] text-stone-500 italic">
                        Note: &quot;{order.specialInstructions}&quot;
                      </p>
                    )}
                  </div>

                  {/* Total and Actions */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-medium">
                        Total Amount
                      </span>
                      <span className="text-lg font-black font-mono text-stone-900 tabular-nums">
                        ₹{Number(order.totalAmount).toFixed(2)}
                      </span>
                      <span className="block text-[10px] text-amber-700 font-medium">
                        Pay at Canteen
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {isCancellable && (
                        <button
                          onClick={() => handleCancelOrder(order.id, order.orderNumber)}
                          className="px-3 py-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-semibold transition-colors"
                          title="Cancel this order before kitchen starts preparation"
                        >
                          Cancel
                        </button>
                      )}

                      <button
                        onClick={() => handleReorder(order)}
                        className="px-3 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                        title="Add these items to your cart"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reorder</span>
                      </button>

                      <button
                        onClick={() => {
                          onSelectOrder(order);
                          onNavigate('order-details');
                        }}
                        className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center space-x-1 shadow-2xs transition-all"
                      >
                        <span>Track Order</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
