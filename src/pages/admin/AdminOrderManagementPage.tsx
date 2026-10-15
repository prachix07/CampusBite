import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Search, 
  RefreshCw, 
  Filter, 
  Clock, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  Utensils, 
  ArrowLeft, 
  ChefHat, 
  BellRing, 
  PackageCheck, 
  XCircle, 
  Ban, 
  Eye, 
  X, 
  IndianRupee, 
  Layers, 
  ShieldAlert, 
  Lock, 
  UserCheck,
  ChevronRight,
  Printer,
  SlidersHorizontal,
  Mail,
  User as UserIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getAllOrders, updateOrderStatus, OrderResponseData } from '../../services/api';
import { OrderStatusBadge } from '../../components/orders/OrderStatusBadge';
import { OrderStatusTracker } from '../../components/orders/OrderStatusTracker';
import { OrderStatus } from '../../types';

interface AdminOrderManagementPageProps {
  onNavigate: (view: string, data?: any) => void;
  initialSelectedOrderNumber?: string;
}

export function AdminOrderManagementPage({
  onNavigate,
  initialSelectedOrderNumber,
}: AdminOrderManagementPageProps) {
  const { user, isAdmin, login } = useAuth();

  const [orders, setOrders] = useState<OrderResponseData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>(initialSelectedOrderNumber || '');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<'today' | 'all'>('today');
  const [slotFilter, setSlotFilter] = useState<string>('ALL');

  // Selected Order for Details Modal
  const [selectedOrder, setSelectedOrder] = useState<OrderResponseData | null>(null);

  // Admin switch state
  const [switchingAdmin, setSwitchingAdmin] = useState<boolean>(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllOrders();
      if (res.success && res.data) {
        setOrders(res.data);

        // If an initial order was requested, open its details
        if (initialSelectedOrderNumber) {
          const match = res.data.find((o) => o.orderNumber === initialSelectedOrderNumber);
          if (match) setSelectedOrder(match);
        }
      } else {
        setError(res.error || 'Failed to load canteen orders.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Network error loading orders.');
    } finally {
      setLoading(false);
    }
  }, [initialSelectedOrderNumber]);

  useEffect(() => {
    if (isAdmin) {
      fetchOrders();
    }
  }, [isAdmin, fetchOrders]);

  const showNotification = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  const handleAdminQuickSwitch = async () => {
    setSwitchingAdmin(true);
    try {
      await login('admin@campusbite.com', 'adminPassword123');
    } catch (e) {
      console.error(e);
    } finally {
      setSwitchingAdmin(false);
    }
  };

  // Status Lifecycle Update Handler (Accept, Reject, Preparing, Ready, Collected)
  const handleUpdateStatus = async (orderId: number, nextStatus: OrderStatus) => {
    setActionLoadingId(orderId);
    try {
      const res = await updateOrderStatus(orderId, nextStatus);
      if (res.success && res.data) {
        showNotification(`Order #${res.data.orderNumber} updated to ${nextStatus}.`);

        // Update local list
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
        );

        // If open in modal, update modal state
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: nextStatus });
        }
      } else {
        setError(res.error || `Failed to update order status to ${nextStatus}.`);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error updating status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Distinct Pickup Slots for filtering
  const availableSlots = useMemo(() => {
    const slots = new Set<string>();
    orders.forEach((o) => {
      if (o.pickupSlot) slots.add(o.pickupSlot);
    });
    return Array.from(slots);
  }, [orders]);

  // Filtered Orders List
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // 1. Date Filter
    if (dateFilter === 'today') {
      result = result.filter(
        (o) => o.pickupDate === todayStr || o.createdAt?.startsWith(todayStr)
      );
    }

    // 2. Status Filter
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'ACTIVE') {
        result = result.filter((o) =>
          ['PLACED', 'ACCEPTED', 'PREPARING', 'READY'].includes(o.status)
        );
      } else {
        result = result.filter((o) => o.status === statusFilter);
      }
    }

    // 3. Slot Filter
    if (slotFilter !== 'ALL') {
      result = result.filter((o) => o.pickupSlot === slotFilter);
    }

    // 4. Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          (o.studentName && o.studentName.toLowerCase().includes(q)) ||
          (o.studentEmail && o.studentEmail.toLowerCase().includes(q)) ||
          o.items?.some((it) => it.foodName.toLowerCase().includes(q))
      );
    }

    return result;
  }, [orders, dateFilter, todayStr, statusFilter, slotFilter, searchQuery]);

  // Quick Counts
  const counts = useMemo(() => {
    return {
      all: orders.length,
      placed: orders.filter((o) => o.status === 'PLACED').length,
      accepted: orders.filter((o) => o.status === 'ACCEPTED').length,
      preparing: orders.filter((o) => o.status === 'PREPARING').length,
      ready: orders.filter((o) => o.status === 'READY').length,
      collected: orders.filter((o) => o.status === 'COLLECTED').length,
    };
  }, [orders]);

  // Access Control Guard
  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-8 text-center max-w-lg mx-auto shadow-sm">
          <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-700">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-stone-900 mb-2">Admin Access Required</h2>
          <p className="text-sm text-stone-600 mb-6">
            Only authorized Canteen Staff and Administrators can manage order fulfillment and status transitions.
          </p>
          <div className="space-y-3">
            <button
              onClick={handleAdminQuickSwitch}
              disabled={switchingAdmin}
              className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 disabled:bg-stone-300 text-white rounded-xl text-sm font-bold transition flex items-center justify-center space-x-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>{switchingAdmin ? 'Signing in as Admin...' : 'Sign In as Canteen Administrator'}</span>
            </button>
            <button
              onClick={() => onNavigate('menu')}
              className="w-full py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-sm font-semibold transition"
            >
              Back to Public Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <button
            onClick={() => onNavigate('admin-dashboard')}
            className="inline-flex items-center space-x-1.5 text-xs text-stone-500 hover:text-stone-800 mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Admin Dashboard</span>
          </button>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
              Kitchen & Order Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
              {filteredOrders.length} {filteredOrders.length === 1 ? 'Order' : 'Orders'}
            </span>
          </div>
          <p className="text-sm text-stone-500 mt-0.5">
            Phase 14: Process canteen pre-orders from Placed to Collected with real-time status actions.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold transition shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Queue</span>
          </button>
          <button
            onClick={() => onNavigate('admin-menu')}
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold transition shadow-xs"
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Menu Catalog</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{actionSuccess}</span>
        </div>
      )}

      {/* Error Alert Banner */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-600 hover:text-rose-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Status Pipeline Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none text-xs">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition flex items-center space-x-1.5 ${
            statusFilter === 'ALL'
              ? 'bg-stone-900 text-white'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          <span>All Orders</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
            {counts.all}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter('PLACED')}
          className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition flex items-center space-x-1.5 ${
            statusFilter === 'PLACED'
              ? 'bg-amber-600 text-white'
              : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Placed (New)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-800 text-white">
            {counts.placed}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter('ACCEPTED')}
          className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition flex items-center space-x-1.5 ${
            statusFilter === 'ACCEPTED'
              ? 'bg-blue-600 text-white'
              : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Accepted</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-800 text-white">
            {counts.accepted}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter('PREPARING')}
          className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition flex items-center space-x-1.5 ${
            statusFilter === 'PREPARING'
              ? 'bg-indigo-600 text-white'
              : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100'
          }`}
        >
          <ChefHat className="w-3.5 h-3.5" />
          <span>Preparing</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-800 text-white">
            {counts.preparing}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter('READY')}
          className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition flex items-center space-x-1.5 ${
            statusFilter === 'READY'
              ? 'bg-emerald-600 text-white'
              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
          }`}
        >
          <BellRing className="w-3.5 h-3.5" />
          <span>Ready for Pickup</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-800 text-white">
            {counts.ready}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter('COLLECTED')}
          className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition flex items-center space-x-1.5 ${
            statusFilter === 'COLLECTED'
              ? 'bg-stone-700 text-white'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          <PackageCheck className="w-3.5 h-3.5" />
          <span>Collected</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-stone-200 text-stone-800">
            {counts.collected}
          </span>
        </button>
      </div>

      {/* Search & Secondary Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Order #, student name, dish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-stone-200 bg-white text-stone-700 font-medium"
          >
            <option value="today">Today's Orders ({todayStr})</option>
            <option value="all">All Dates</option>
          </select>

          {/* Slot Filter */}
          <select
            value={slotFilter}
            onChange={(e) => setSlotFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-stone-200 bg-white text-stone-700 font-medium"
          >
            <option value="ALL">All Pickup Slots</option>
            {availableSlots.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {(searchQuery || statusFilter !== 'ALL' || dateFilter !== 'today' || slotFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
                setDateFilter('today');
                setSlotFilter('ALL');
              }}
              className="px-3 py-2 text-stone-500 hover:text-stone-800 underline font-medium"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        {loading && orders.length === 0 ? (
          <div className="p-16 text-center text-xs text-stone-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-stone-400" />
            <span>Fetching live canteen orders...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 text-center text-xs text-stone-500">
            <Utensils className="w-8 h-8 mx-auto mb-2 text-stone-300" />
            <p className="font-semibold text-stone-700">No orders found matching the filter criteria.</p>
            <p className="text-stone-400 mt-1">Try switching tabs or resetting filters above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 border-b border-stone-200 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Order Number</th>
                  <th className="py-3 px-4">Student Details</th>
                  <th className="py-3 px-4">Pickup Date & Slot</th>
                  <th className="py-3 px-4">Items Summary</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Lifecycle Actions</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredOrders.map((ord) => {
                  const isBusy = actionLoadingId === ord.id;

                  return (
                    <tr key={ord.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                        {ord.orderNumber}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-stone-900">{ord.studentName || 'Student'}</div>
                        <div className="text-[11px] text-stone-500 flex items-center space-x-1">
                          <Mail className="w-3 h-3 text-stone-400" />
                          <span>{ord.studentEmail}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-stone-800">{ord.pickupSlot}</div>
                        <div className="text-[10px] text-stone-400">{ord.pickupDate}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-stone-700">
                          {ord.items && ord.items.length > 0 ? (
                            <span>
                              {ord.items[0].foodName} ({ord.items[0].quantity}x)
                              {ord.items.length > 1 ? ` +${ord.items.length - 1} more` : ''}
                            </span>
                          ) : (
                            <span>Canteen Item</span>
                          )}
                        </div>
                        {ord.specialInstructions && (
                          <div className="text-[10px] text-amber-700 italic truncate max-w-xs">
                            Note: "{ord.specialInstructions}"
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-stone-900 text-sm">
                        ₹{ord.totalAmount}
                      </td>

                      <td className="py-3.5 px-4">
                        <OrderStatusBadge status={ord.status} />
                      </td>

                      {/* Primary Lifecycle Action Buttons */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          {/* If PLACED: Accept or Reject */}
                          {ord.status === 'PLACED' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(ord.id, 'ACCEPTED')}
                                disabled={isBusy}
                                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-bold text-[11px] transition shadow-2xs flex items-center space-x-1"
                                title="Accept Order"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Accept</span>
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(ord.id, 'REJECTED')}
                                disabled={isBusy}
                                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold text-[11px] transition flex items-center space-x-1"
                                title="Reject Order"
                              >
                                <Ban className="w-3 h-3" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}

                          {/* If ACCEPTED: Mark Preparing */}
                          {ord.status === 'ACCEPTED' && (
                            <button
                              onClick={() => handleUpdateStatus(ord.id, 'PREPARING')}
                              disabled={isBusy}
                              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-bold text-[11px] transition shadow-2xs flex items-center space-x-1"
                              title="Send to kitchen & begin cooking"
                            >
                              <ChefHat className="w-3 h-3" />
                              <span>Mark Preparing</span>
                            </button>
                          )}

                          {/* If PREPARING: Mark Ready */}
                          {ord.status === 'PREPARING' && (
                            <button
                              onClick={() => handleUpdateStatus(ord.id, 'READY')}
                              disabled={isBusy}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-bold text-[11px] transition shadow-2xs flex items-center space-x-1"
                              title="Order is packed & ready on pickup counter"
                            >
                              <BellRing className="w-3 h-3" />
                              <span>Mark Ready</span>
                            </button>
                          )}

                          {/* If READY: Mark Collected */}
                          {ord.status === 'READY' && (
                            <button
                              onClick={() => handleUpdateStatus(ord.id, 'COLLECTED')}
                              disabled={isBusy}
                              className="px-3 py-1 bg-stone-900 hover:bg-black disabled:opacity-50 text-white rounded-lg font-bold text-[11px] transition shadow-2xs flex items-center space-x-1"
                              title="Student has received their order"
                            >
                              <PackageCheck className="w-3 h-3" />
                              <span>Mark Collected</span>
                            </button>
                          )}

                          {/* If Final state (COLLECTED, CANCELLED, REJECTED) */}
                          {['COLLECTED', 'CANCELLED', 'REJECTED'].includes(ord.status) && (
                            <span className="text-[11px] text-stone-400 italic">
                              Completed ({ord.status.toLowerCase()})
                            </span>
                          )}
                        </div>
                      </td>

                      {/* View Details Button */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-700 transition"
                          title="Open Order Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal (Phase 14 Core Requirement) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-stone-200 max-w-2xl w-full p-6 shadow-2xl my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-200 pb-4 mb-5">
              <div>
                <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                  Canteen Order Inspection
                </div>
                <h3 className="text-xl font-extrabold text-stone-900 flex items-center space-x-2">
                  <span>{selectedOrder.orderNumber}</span>
                  <OrderStatusBadge status={selectedOrder.status} />
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-stone-400 hover:text-stone-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Visual Lifecycle Tracker */}
            <div className="mb-6 p-4 bg-stone-50 rounded-xl border border-stone-200/80">
              <div className="text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-2">
                Order Lifecycle Progression
              </div>
              <OrderStatusTracker status={selectedOrder.status} />
            </div>

            {/* Student & Pickup Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-6">
              <div className="p-3.5 rounded-xl border border-stone-200 bg-white">
                <div className="font-bold text-stone-700 mb-2 flex items-center space-x-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-stone-400" />
                  <span>Student Information</span>
                </div>
                <div className="space-y-1 text-stone-600">
                  <div>Name: <strong className="text-stone-900">{selectedOrder.studentName || 'Student'}</strong></div>
                  <div>Email: <strong className="text-stone-900">{selectedOrder.studentEmail}</strong></div>
                  <div>Student ID: #{selectedOrder.studentId}</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-stone-200 bg-white">
                <div className="font-bold text-stone-700 mb-2 flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  <span>Pickup Slot & Timing</span>
                </div>
                <div className="space-y-1 text-stone-600">
                  <div>Date: <strong className="text-stone-900">{selectedOrder.pickupDate}</strong></div>
                  <div>Slot: <strong className="text-stone-900">{selectedOrder.pickupSlot}</strong></div>
                  <div>Payment: <span className="font-semibold text-emerald-700">{selectedOrder.paymentMethod}</span></div>
                </div>
              </div>
            </div>

            {/* Special Instructions (if any) */}
            {selectedOrder.specialInstructions && (
              <div className="mb-6 p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
                <span className="font-bold">Student Note: </span>
                <span>"{selectedOrder.specialInstructions}"</span>
              </div>
            )}

            {/* Ordered Items Table */}
            <div className="mb-6">
              <div className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                Itemized Order Details
              </div>
              <div className="border border-stone-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-600 uppercase text-[10px] font-semibold border-b border-stone-200">
                    <tr>
                      <th className="py-2.5 px-3">Item</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Price</th>
                      <th className="py-2.5 px-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {selectedOrder.items?.map((it) => (
                      <tr key={it.id}>
                        <td className="py-2.5 px-3 font-semibold text-stone-900">
                          {it.foodName}
                        </td>
                        <td className="py-2.5 px-3 text-center text-stone-700">
                          {it.quantity}
                        </td>
                        <td className="py-2.5 px-3 text-right text-stone-600">
                          ₹{it.priceAtPurchase}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-stone-900">
                          ₹{it.subtotal}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-stone-50 border-t border-stone-200 font-bold">
                    <tr>
                      <td colSpan={3} className="py-2.5 px-3 text-stone-800">
                        Total Amount:
                      </td>
                      <td className="py-2.5 px-3 text-right text-sm text-stone-900">
                        ₹{selectedOrder.totalAmount}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Order Management Actions Row */}
            <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-stone-500 font-medium">Quick Transition:</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value as OrderStatus)}
                  className="px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white font-semibold text-stone-800"
                >
                  <option value="PLACED">PLACED</option>
                  <option value="ACCEPTED">ACCEPTED</option>
                  <option value="PREPARING">PREPARING</option>
                  <option value="READY">READY</option>
                  <option value="COLLECTED">COLLECTED</option>
                  <option value="REJECTED">REJECTED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                {selectedOrder.status === 'PLACED' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'ACCEPTED')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs flex items-center space-x-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Accept Order</span>
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'REJECTED')}
                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-semibold"
                    >
                      Reject
                    </button>
                  </>
                )}

                {selectedOrder.status === 'ACCEPTED' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'PREPARING')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs flex items-center space-x-1"
                  >
                    <ChefHat className="w-3.5 h-3.5" />
                    <span>Start Preparing</span>
                  </button>
                )}

                {selectedOrder.status === 'PREPARING' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'READY')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs flex items-center space-x-1"
                  >
                    <BellRing className="w-3.5 h-3.5" />
                    <span>Mark Ready for Pickup</span>
                  </button>
                )}

                {selectedOrder.status === 'READY' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'COLLECTED')}
                    className="px-4 py-2 bg-stone-900 hover:bg-black text-white rounded-xl font-bold shadow-xs flex items-center space-x-1"
                  >
                    <PackageCheck className="w-3.5 h-3.5" />
                    <span>Mark Collected</span>
                  </button>
                )}

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 font-semibold hover:bg-stone-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
