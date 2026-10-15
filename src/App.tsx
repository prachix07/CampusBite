import { useState } from 'react';
import { 
  CheckCircle2, 
  ShieldCheck, 
  RefreshCw, 
  AlertCircle,
  Terminal,
  Check,
  ShoppingCart,
  Clock,
  Layers,
  Lock,
  Receipt,
  Utensils,
  Eye,
  Calendar,
  LayoutDashboard,
  UtensilsCrossed,
  UserCheck
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { HomePage } from './pages/HomePage';
import { MenuPage } from './pages/MenuPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { MyOrdersPage } from './pages/MyOrdersPage';
import { OrderDetailsPage } from './pages/OrderDetailsPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminMenuManagementPage } from './pages/admin/AdminMenuManagementPage';
import { AdminOrderManagementPage } from './pages/admin/AdminOrderManagementPage';
import { CartDrawer } from './components/cart/CartDrawer';
import { FoodItem } from './types';
import { checkBackendHealth, API_BASE_URL, OrderResponseData } from './services/api';

function MainApp() {
  const [currentView, setCurrentView] = useState<
    | 'home' 
    | 'menu' 
    | 'cart' 
    | 'checkout' 
    | 'confirmation' 
    | 'login' 
    | 'register' 
    | 'diagnostics' 
    | 'orders' 
    | 'order-details'
    | 'admin-dashboard'
    | 'admin-menu'
    | 'admin-orders'
  >('home');

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<OrderResponseData | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponseData | null>(null);
  const [adminSelectedOrderNumber, setAdminSelectedOrderNumber] = useState<string | undefined>(undefined);

  const { addToCart, items } = useCart();
  const { user, isAdmin, login } = useAuth();

  // Diagnostics Tab State
  const [diagTab, setDiagTab] = useState<'admin' | 'architecture' | 'test'>('admin');
  const [healthStatus, setHealthStatus] = useState<{
    loading: boolean;
    result?: unknown;
    error?: string;
    checked: boolean;
  }>({
    loading: false,
    checked: false,
  });

  const cartItemCounts = items.reduce<Record<number, number>>((acc, item) => {
    acc[item.foodItem.id] = item.quantity;
    return acc;
  }, {});

  const handleAddToCart = (food: FoodItem) => {
    addToCart(food, 1);
    setToastMessage(`Added "${food.name}" to cart!`);
    setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  };

  const handleOrderSuccess = (order: OrderResponseData) => {
    setPlacedOrder(order);
    setSelectedOrder(order);
    setCurrentView('confirmation');
  };

  const handleAdminNavigate = (view: string, data?: any) => {
    if (data?.selectedOrderNumber) {
      setAdminSelectedOrderNumber(data.selectedOrderNumber);
    }
    setCurrentView(view as any);
  };

  const handleTestConnection = async () => {
    setHealthStatus({ loading: true, checked: false });
    try {
      const res = await checkBackendHealth();
      if (res.success && res.data) {
        setHealthStatus({
          loading: false,
          result: res.data,
          checked: true,
        });
      } else {
        setHealthStatus({
          loading: false,
          error: res.error || 'Backend unreachable.',
          checked: true,
        });
      }
    } catch (err: unknown) {
      setHealthStatus({
        loading: false,
        error: err instanceof Error ? err.message : 'Connection failed.',
        checked: true,
      });
    }
  };

  return (
    <div className="min-h-screen bg-stone-50/60 text-stone-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-4 py-3 rounded-xl shadow-lg border border-stone-800 flex items-center space-x-2 text-xs animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Cart Drawer Overlay */}
      <CartDrawer
        onNavigateToCart={() => setCurrentView('cart')}
        onNavigateToCheckout={() => setCurrentView('checkout')}
        onExploreMenu={() => setCurrentView('menu')}
      />

      {/* Top Banner: Navigation between Public, Student & Admin Portals */}
      <div className="bg-stone-950 text-stone-300 text-[11px] py-1.5 px-4 border-b border-stone-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-medium text-stone-200">CampusBite System</span>
            <span className="text-stone-500">•</span>
            <span className="text-stone-400">Phase 12: Admin Dashboard | Phase 13: Menu Management | Phase 14: Order Management</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setCurrentView('admin-dashboard')}
              className={`hover:text-amber-400 font-semibold transition-colors flex items-center space-x-1 ${
                currentView === 'admin-dashboard' || currentView === 'admin-menu' || currentView === 'admin-orders'
                  ? 'text-amber-400 font-bold'
                  : 'text-stone-300'
              }`}
            >
              <LayoutDashboard className="w-3 h-3 text-amber-500" />
              <span>Admin Portal</span>
            </button>
            <span className="text-stone-600">|</span>
            <button
              onClick={() => setCurrentView('diagnostics')}
              className={`hover:text-amber-400 font-medium transition-colors ${
                currentView === 'diagnostics' ? 'text-amber-400 font-bold' : 'text-stone-400'
              }`}
            >
              Engineering Hub
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view as any)}
      />

      {/* Main Body Routing */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomePage
            onNavigate={(view) => setCurrentView(view as any)}
            onAddToCart={handleAddToCart}
          />
        )}

        {currentView === 'menu' && (
          <MenuPage
            onAddToCart={handleAddToCart}
            cartItemCounts={cartItemCounts}
          />
        )}

        {currentView === 'orders' && (
          <MyOrdersPage
            onNavigate={(view) => setCurrentView(view as any)}
            onSelectOrder={(order) => {
              setSelectedOrder(order);
              setCurrentView('order-details');
            }}
          />
        )}

        {currentView === 'order-details' && (
          <OrderDetailsPage
            initialOrder={selectedOrder || placedOrder}
            orderNumber={(selectedOrder || placedOrder)?.orderNumber}
            orderId={(selectedOrder || placedOrder)?.id}
            onNavigate={(view) => setCurrentView(view as any)}
          />
        )}

        {/* Phase 12: Admin Dashboard */}
        {currentView === 'admin-dashboard' && (
          <AdminDashboardPage
            onNavigate={handleAdminNavigate}
          />
        )}

        {/* Phase 13: Admin Menu Management */}
        {currentView === 'admin-menu' && (
          <AdminMenuManagementPage
            onNavigate={handleAdminNavigate}
          />
        )}

        {/* Phase 14: Admin Order Management */}
        {currentView === 'admin-orders' && (
          <AdminOrderManagementPage
            onNavigate={handleAdminNavigate}
            initialSelectedOrderNumber={adminSelectedOrderNumber}
          />
        )}

        {currentView === 'cart' && (
          <CartPage
            onNavigate={(view) => setCurrentView(view as any)}
          />
        )}

        {currentView === 'checkout' && (
          <CheckoutPage
            onNavigate={(view) => setCurrentView(view as any)}
            onOrderSuccess={handleOrderSuccess}
          />
        )}

        {currentView === 'confirmation' && (
          <OrderConfirmationPage
            orderNumber={placedOrder?.orderNumber || 'CB-2026-00124'}
            initialOrder={placedOrder}
            onNavigate={(view) => setCurrentView(view as any)}
          />
        )}

        {currentView === 'login' && (
          <LoginPage
            onNavigate={(view) => setCurrentView(view as any)}
            onLoginSuccess={() => setCurrentView('menu')}
          />
        )}

        {currentView === 'register' && (
          <RegisterPage
            onNavigate={(view) => setCurrentView(view as any)}
            onRegisterSuccess={() => setCurrentView('menu')}
          />
        )}

        {/* Phase Diagnostics View */}
        {currentView === 'diagnostics' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="bg-linear-to-r from-amber-600 to-orange-600 rounded-2xl p-6 text-white shadow-sm">
              <span className="text-amber-200 text-xs font-bold uppercase tracking-wider">
                Canteen Administration & Operations Architecture
              </span>
              <h2 className="text-2xl font-extrabold mt-1">Phases 12, 13 & 14: Canteen Admin Suite</h2>
              <p className="text-sm text-stone-100 mt-1">
                Phase 12: Real-time Dashboard with MySQL aggregations • Phase 13: Menu & Category CRUD • Phase 14: Kitchen Order Queue & Status Lifecycle.
              </p>
            </div>

            {/* Diagnostic Tabs */}
            <div className="flex border-b border-stone-200 overflow-x-auto">
              <button
                onClick={() => setDiagTab('admin')}
                className={`py-2.5 px-4 font-semibold text-xs border-b-2 whitespace-nowrap ${
                  diagTab === 'admin' ? 'border-amber-600 text-amber-700 bg-amber-50/50' : 'border-transparent text-stone-500'
                }`}
              >
                Admin Suite Verification (Phases 12-14)
              </button>
              <button
                onClick={() => setDiagTab('architecture')}
                className={`py-2.5 px-4 font-semibold text-xs border-b-2 whitespace-nowrap ${
                  diagTab === 'architecture' ? 'border-amber-600 text-amber-700 bg-amber-50/50' : 'border-transparent text-stone-500'
                }`}
              >
                Role-Based Security & REST APIs
              </button>
              <button
                onClick={() => setDiagTab('test')}
                className={`py-2.5 px-4 font-semibold text-xs border-b-2 whitespace-nowrap ${
                  diagTab === 'test' ? 'border-amber-600 text-amber-700 bg-amber-50/50' : 'border-transparent text-stone-500'
                }`}
              >
                Backend Health & Connectivity
              </button>
            </div>

            {/* Admin Suite Tab */}
            {diagTab === 'admin' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Phase 12 Card */}
                  <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center space-x-2 text-amber-700 text-xs font-bold uppercase mb-2">
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Phase 12</span>
                      </div>
                      <h4 className="font-bold text-stone-900 text-sm mb-1">Admin Dashboard</h4>
                      <p className="text-xs text-stone-600 mb-4 leading-relaxed">
                        Calculates real-time figures from database records: Today's Orders, Pending, Preparing, Ready, and Today's Revenue.
                      </p>
                    </div>
                    <button
                      onClick={() => setCurrentView('admin-dashboard')}
                      className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition shadow-2xs"
                    >
                      Open Admin Dashboard
                    </button>
                  </div>

                  {/* Phase 13 Card */}
                  <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center space-x-2 text-indigo-700 text-xs font-bold uppercase mb-2">
                        <Utensils className="w-4 h-4" />
                        <span>Phase 13</span>
                      </div>
                      <h4 className="font-bold text-stone-900 text-sm mb-1">Menu Management</h4>
                      <p className="text-xs text-stone-600 mb-4 leading-relaxed">
                        Add food, edit food, delete food, toggle instant availability (Live in MySQL catalog), and manage categories.
                      </p>
                    </div>
                    <button
                      onClick={() => setCurrentView('admin-menu')}
                      className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-2xs"
                    >
                      Open Menu Catalog
                    </button>
                  </div>

                  {/* Phase 14 Card */}
                  <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center space-x-2 text-emerald-700 text-xs font-bold uppercase mb-2">
                        <Layers className="w-4 h-4" />
                        <span>Phase 14</span>
                      </div>
                      <h4 className="font-bold text-stone-900 text-sm mb-1">Order Management</h4>
                      <p className="text-xs text-stone-600 mb-4 leading-relaxed">
                        View all orders, search and filter by status/slot, open order details, Accept, Reject, Mark Preparing, Mark Ready, and Mark Collected.
                      </p>
                    </div>
                    <button
                      onClick={() => setCurrentView('admin-orders')}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition shadow-2xs"
                    >
                      Open Order Queue
                    </button>
                  </div>
                </div>

                {/* Quick Role Switcher for Testing */}
                <div className="bg-stone-100 p-5 rounded-2xl border border-stone-200 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="font-bold text-stone-800 text-sm block">Quick Authentication Tester</span>
                      <span className="text-stone-500">
                        Current User: {user ? <strong>{user.fullName} ({user.role})</strong> : <em>Guest (Not logged in)</em>}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => login('admin@campusbite.com', 'adminPassword123')}
                        className="px-3.5 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold transition flex items-center space-x-1.5"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Sign In as Admin</span>
                      </button>

                      <button
                        onClick={() => login('aarav.sharma@college.edu', 'studentSecret123')}
                        className="px-3.5 py-1.5 rounded-xl bg-stone-700 hover:bg-stone-800 text-white font-bold transition flex items-center space-x-1.5"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Sign In as Student</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Architecture Tab */}
            {diagTab === 'architecture' && (
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4 text-xs">
                <h3 className="font-bold text-stone-900 text-sm">Security & Role Protection Matrix</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-stone-50 border-b border-stone-200 text-[10px] font-bold uppercase text-stone-600">
                      <tr>
                        <th className="py-2.5 px-3">Method</th>
                        <th className="py-2.5 px-3">Endpoint</th>
                        <th className="py-2.5 px-3">Role Required</th>
                        <th className="py-2.5 px-3">Purpose</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-mono text-[11px]">
                      <tr>
                        <td className="py-2 px-3 text-emerald-600 font-bold">GET</td>
                        <td className="py-2 px-3">/api/orders/dashboard-stats</td>
                        <td className="py-2 px-3 text-purple-700 font-bold">ROLE_ADMIN</td>
                        <td className="py-2 px-3 font-sans text-stone-600">Phase 12: Live aggregated dashboard statistics</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 text-blue-600 font-bold">POST</td>
                        <td className="py-2 px-3">/api/foods</td>
                        <td className="py-2 px-3 text-purple-700 font-bold">ROLE_ADMIN</td>
                        <td className="py-2 px-3 font-sans text-stone-600">Phase 13: Create new food item</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 text-amber-600 font-bold">PUT</td>
                        <td className="py-2 px-3">/api/foods/{'{id}'}</td>
                        <td className="py-2 px-3 text-purple-700 font-bold">ROLE_ADMIN</td>
                        <td className="py-2 px-3 font-sans text-stone-600">Phase 13: Update food price, prep time, name</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 text-rose-600 font-bold">DELETE</td>
                        <td className="py-2 px-3">/api/foods/{'{id}'}</td>
                        <td className="py-2 px-3 text-purple-700 font-bold">ROLE_ADMIN</td>
                        <td className="py-2 px-3 font-sans text-stone-600">Phase 13: Delete food item</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 text-indigo-600 font-bold">PATCH</td>
                        <td className="py-2 px-3">/api/foods/{'{id}'}/availability</td>
                        <td className="py-2 px-3 text-purple-700 font-bold">ROLE_ADMIN</td>
                        <td className="py-2 px-3 font-sans text-stone-600">Phase 13: Toggle food availability</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 text-emerald-600 font-bold">GET</td>
                        <td className="py-2 px-3">/api/orders</td>
                        <td className="py-2 px-3 text-purple-700 font-bold">ROLE_ADMIN</td>
                        <td className="py-2 px-3 font-sans text-stone-600">Phase 14: View all canteen orders</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 text-indigo-600 font-bold">PATCH</td>
                        <td className="py-2 px-3">/api/orders/{'{id}'}/status</td>
                        <td className="py-2 px-3 text-purple-700 font-bold">ROLE_ADMIN</td>
                        <td className="py-2 px-3 font-sans text-stone-600">Phase 14: Update order lifecycle status</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Test Tab */}
            {diagTab === 'test' && (
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                <h3 className="font-bold text-stone-900 text-base flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-amber-600" />
                  <span>Spring Boot Live Connection Diagnostic</span>
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Sends an asynchronous GET request to <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-800 font-mono">{API_BASE_URL}/api/health</code>.
                </p>

                <button
                  onClick={handleTestConnection}
                  disabled={healthStatus.loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center justify-center space-x-2 shadow-xs"
                >
                  {healthStatus.loading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending Request...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Execute Backend Health Check</span>
                    </>
                  )}
                </button>

                {healthStatus.checked && (
                  <div className="mt-3">
                    {healthStatus.result ? (
                      <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                        <p className="font-bold text-emerald-800 flex items-center space-x-1 mb-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>HTTP 200 OK — Connected</span>
                        </p>
                        <pre className="bg-white p-2.5 rounded border border-emerald-100 text-emerald-900 font-mono text-[11px] overflow-x-auto">
                          {JSON.stringify(healthStatus.result, null, 2)}
                        </pre>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                        <p className="font-bold flex items-center space-x-1 text-amber-800">
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                          <span>Local Spring Boot Server Notice</span>
                        </p>
                        <p className="text-[11px] text-stone-600">
                          The frontend communicates with <code className="font-mono bg-white px-1 rounded">{API_BASE_URL}</code>.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={(view) => setCurrentView(view as any)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </AuthProvider>
  );
}
