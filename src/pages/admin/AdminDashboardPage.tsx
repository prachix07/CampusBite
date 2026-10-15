import { useState, useEffect, useCallback } from 'react';
import { 
  ShoppingBag, 
  Clock, 
  ChefHat, 
  BellRing, 
  IndianRupee, 
  RefreshCw, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  ShieldAlert, 
  Layers, 
  UtensilsCrossed, 
  ExternalLink,
  Lock,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getAdminDashboardStats, DashboardStatsData } from '../../services/api';
import { OrderStatusBadge } from '../../components/orders/OrderStatusBadge';

interface AdminDashboardPageProps {
  onNavigate: (view: string, data?: any) => void;
}

export function AdminDashboardPage({ onNavigate }: AdminDashboardPageProps) {
  const { user, isAdmin, login } = useAuth();
  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [switchingAdmin, setSwitchingAdmin] = useState<boolean>(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminDashboardStats();
      if (res.success && res.data) {
        setStats(res.data);
        setLastRefreshed(new Date());
      } else {
        setError(res.error || 'Failed to fetch live admin statistics.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error loading dashboard statistics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin, fetchStats]);

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

  // RBAC Access Control Guard
  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-8 text-center max-w-lg mx-auto shadow-sm">
          <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-700">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-stone-900 mb-2">Admin Access Required</h2>
          <p className="text-sm text-stone-600 mb-6">
            The Canteen Administration Portal (Dashboard, Menu Management, and Live Order Control) is restricted to authenticated Canteen Staff and Managers.
          </p>

          {user ? (
            <div className="bg-white p-4 rounded-xl border border-stone-200 text-left mb-6 text-xs text-stone-600 space-y-1">
              <div>Currently signed in as: <strong className="text-stone-900">{user.fullName}</strong></div>
              <div>Email: <strong className="text-stone-900">{user.email}</strong></div>
              <div>Current Role: <span className="px-2 py-0.5 rounded bg-stone-100 font-semibold text-stone-700">{user.role}</span></div>
            </div>
          ) : null}

          <div className="space-y-3">
            <button
              onClick={handleAdminQuickSwitch}
              disabled={switchingAdmin}
              className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 disabled:bg-stone-300 text-white rounded-xl text-sm font-bold transition flex items-center justify-center space-x-2 shadow-xs"
            >
              <UserCheck className="w-4 h-4" />
              <span>{switchingAdmin ? 'Signing in as Admin...' : 'Sign In as Canteen Administrator'}</span>
            </button>
            <button
              onClick={() => onNavigate('login')}
              className="w-full py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-sm font-semibold transition"
            >
              Go to Login Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Real-time Canteen Operations Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
            Admin Dashboard
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Live canteen metrics calculated from MySQL database orders.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs text-stone-500 hidden sm:inline">
            Updated: {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          <button
            onClick={fetchStats}
            disabled={loading}
            className="inline-flex items-center space-x-2 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
          <button
            onClick={() => onNavigate('admin-orders')}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            <Layers className="w-4 h-4" />
            <span>Live Kitchen Board</span>
          </button>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchStats}
            className="text-xs font-bold text-rose-700 underline hover:text-rose-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* Five Primary Metrics Cards (Phase 12 Core Requirement) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Today's Orders */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between hover:border-amber-400 transition-colors">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Today's Orders</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-stone-900 tracking-tight">
              {loading && !stats ? '...' : (stats?.todayOrders ?? 0)}
            </div>
            <div className="text-[11px] text-stone-500 mt-1 flex items-center space-x-1">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              <span>Booked for today</span>
            </div>
          </div>
        </div>

        {/* Card 2: Pending Orders */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between hover:border-amber-400 transition-colors">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Orders</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-amber-600 tracking-tight">
              {loading && !stats ? '...' : (stats?.pendingOrders ?? 0)}
            </div>
            <div className="text-[11px] text-stone-500 mt-1">
              Awaiting prep confirmation
            </div>
          </div>
        </div>

        {/* Card 3: Preparing Orders */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between hover:border-indigo-400 transition-colors">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Preparing Orders</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ChefHat className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-indigo-600 tracking-tight">
              {loading && !stats ? '...' : (stats?.preparingOrders ?? 0)}
            </div>
            <div className="text-[11px] text-stone-500 mt-1">
              Active in the kitchen
            </div>
          </div>
        </div>

        {/* Card 4: Ready Orders */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between hover:border-emerald-400 transition-colors">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Ready Orders</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <BellRing className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-emerald-600 tracking-tight">
              {loading && !stats ? '...' : (stats?.readyOrders ?? 0)}
            </div>
            <div className="text-[11px] text-stone-500 mt-1">
              Waiting for student pickup
            </div>
          </div>
        </div>

        {/* Card 5: Today's Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between hover:border-stone-400 transition-colors sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Today's Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-stone-900 tracking-tight">
              ₹{loading && !stats ? '...' : Number(stats?.todayRevenue || 0).toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-stone-500 mt-1">
              Excludes cancellations
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Panels (Phase 13 & 14 Direct Jump) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-linear-to-br from-amber-50 to-orange-50/40 p-6 rounded-2xl border border-amber-200/80 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center mb-3">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-stone-900 mb-1">
              Phase 13: Menu & Category Management
            </h3>
            <p className="text-xs text-stone-600 mb-4">
              Add new dishes, update prices & preparation times, delete old menu items, toggle instant availability, and organize food categories.
            </p>
          </div>
          <button
            onClick={() => onNavigate('admin-menu')}
            className="inline-flex items-center justify-between w-full px-4 py-2.5 bg-white hover:bg-stone-50 text-stone-800 border border-amber-300 rounded-xl text-xs font-bold transition shadow-2xs"
          >
            <span>Open Menu Catalog Manager</span>
            <ArrowRight className="w-4 h-4 text-amber-600" />
          </button>
        </div>

        <div className="bg-linear-to-br from-indigo-50 to-blue-50/40 p-6 rounded-2xl border border-indigo-200/80 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-3">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-stone-900 mb-1">
              Phase 14: Live Order Management
            </h3>
            <p className="text-xs text-stone-600 mb-4">
              Process active orders through the complete canteen lifecycle: Accept, Reject, Mark Preparing, Mark Ready for Pickup, and Mark Collected.
            </p>
          </div>
          <button
            onClick={() => onNavigate('admin-orders')}
            className="inline-flex items-center justify-between w-full px-4 py-2.5 bg-white hover:bg-stone-50 text-stone-800 border border-indigo-300 rounded-xl text-xs font-bold transition shadow-2xs"
          >
            <span>Open Order Management Queue</span>
            <ArrowRight className="w-4 h-4 text-indigo-600" />
          </button>
        </div>
      </div>

      {/* Recent Orders Section (Real backend data table) */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-stone-900">Recent Canteen Orders</h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Real-time feed of latest incoming student orders.
            </p>
          </div>
          <button
            onClick={() => onNavigate('admin-orders')}
            className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center space-x-1"
          >
            <span>View All ({stats?.totalOrders ?? 0}) Orders</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading && !stats ? (
          <div className="p-12 text-center text-xs text-stone-500">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-stone-400" />
            <span>Loading orders from backend...</span>
          </div>
        ) : !stats?.recentOrders || stats.recentOrders.length === 0 ? (
          <div className="p-12 text-center text-xs text-stone-500">
            <span>No orders recorded yet today.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 border-b border-stone-200 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Slot</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {stats.recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-stone-800">
                      {ord.orderNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-stone-900">{ord.studentName || 'Student'}</div>
                      <div className="text-[11px] text-stone-500">{ord.studentEmail}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-stone-700">{ord.pickupSlot}</div>
                      <div className="text-[10px] text-stone-400">{ord.pickupDate}</div>
                    </td>
                    <td className="py-3.5 px-4 text-stone-600">
                      {ord.items?.length || 0} items
                    </td>
                    <td className="py-3.5 px-4 font-bold text-stone-900">
                      ₹{ord.totalAmount}
                    </td>
                    <td className="py-3.5 px-4">
                      <OrderStatusBadge status={ord.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onNavigate('admin-orders', { selectedOrderNumber: ord.orderNumber })}
                        className="px-2.5 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-[11px] transition"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
