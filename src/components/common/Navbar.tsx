import { useState } from 'react';
import { 
  UtensilsCrossed, 
  ShoppingCart, 
  User as UserIcon, 
  LogOut, 
  Menu as MenuIcon, 
  X, 
  Search,
  ShieldAlert,
  ChevronDown,
  Receipt,
  LayoutDashboard,
  Utensils,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  cartCount?: number;
}

export function Navbar({ currentView, onNavigate, cartCount }: NavbarProps) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalCount, toggleDrawer } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const displayCount = cartCount !== undefined ? cartCount : totalCount;

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'menu', label: 'Menu' },
    { id: 'orders', label: 'My Orders' },
    ...(isAdmin
      ? [
          { id: 'admin-dashboard', label: 'Dashboard' },
          { id: 'admin-menu', label: 'Menu Manager' },
          { id: 'admin-orders', label: 'Live Orders' },
        ]
      : [
          { id: 'how-it-works', label: 'How It Works' },
          { id: 'admin-dashboard', label: 'Admin Portal' },
        ]),
  ];

  const handleNavClick = (viewId: string) => {
    onNavigate(viewId);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center space-x-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-xl text-stone-900 tracking-tight">CampusBite</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-amber-100 text-amber-800 border border-amber-200">
                  Canteen
                </span>
              </div>
              <p className="text-[11px] text-stone-500 hidden sm:block">Pre-Order & Pickup</p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentView === link.id
                    ? 'text-amber-700 bg-amber-50/80 font-semibold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => handleNavClick('menu')}
              className="px-3 py-2 text-stone-400 hover:text-stone-700 transition-colors"
              title="Search menu"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Cart Trigger */}
            <button
              onClick={toggleDrawer}
              className="relative p-2 rounded-lg text-stone-600 hover:text-amber-600 hover:bg-amber-50 transition-colors"
              title="View Cart Drawer"
            >
              <ShoppingCart className="w-5 h-5" />
              {displayCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-600 text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                  {displayCount}
                </span>
              )}
            </button>

            {/* User State */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 pl-3 pr-2 py-1.5 rounded-lg border border-stone-200 hover:border-stone-300 text-stone-700 bg-stone-50 text-sm font-medium transition-all"
                >
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate">{user.fullName.split(' ')[0]}</span>
                  {isAdmin && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-bold border border-purple-200">
                      Admin
                    </span>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-stone-200 shadow-lg py-1.5 z-50 text-xs">
                    <div className="px-3.5 py-2 border-b border-stone-100">
                      <p className="font-semibold text-stone-900 truncate">{user.fullName}</p>
                      <p className="text-stone-500 truncate">{user.email}</p>
                      <p className="mt-1 inline-block text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 font-medium">
                        {user.role === 'ROLE_ADMIN' ? 'Canteen Manager' : 'Student Account'}
                      </p>
                    </div>

                    {isAdmin && (
                      <div className="py-1 border-b border-stone-100 bg-amber-50/40">
                        <button
                          onClick={() => {
                            handleNavClick('admin-dashboard');
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-3.5 py-1.5 text-stone-800 hover:bg-amber-100/60 flex items-center space-x-2 transition-colors font-bold"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5 text-amber-700" />
                          <span>Admin Dashboard</span>
                        </button>

                        <button
                          onClick={() => {
                            handleNavClick('admin-menu');
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-3.5 py-1.5 text-stone-800 hover:bg-amber-100/60 flex items-center space-x-2 transition-colors font-medium"
                        >
                          <Utensils className="w-3.5 h-3.5 text-amber-700" />
                          <span>Menu Management</span>
                        </button>

                        <button
                          onClick={() => {
                            handleNavClick('admin-orders');
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-3.5 py-1.5 text-stone-800 hover:bg-amber-100/60 flex items-center space-x-2 transition-colors font-medium"
                        >
                          <Layers className="w-3.5 h-3.5 text-amber-700" />
                          <span>Order Management</span>
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        handleNavClick('orders');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-stone-700 hover:bg-stone-50 flex items-center space-x-2 transition-colors font-medium border-b border-stone-100"
                    >
                      <Receipt className="w-3.5 h-3.5 text-amber-600" />
                      <span>My Orders & Tracking</span>
                    </button>

                    <button
                      onClick={() => {
                        logout();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-rose-600 hover:bg-rose-50 flex items-center space-x-2 transition-colors font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleNavClick('login')}
                  className="px-3.5 py-2 rounded-lg text-sm font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-50 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNavClick('register')}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-all"
                >
                  Register
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={toggleDrawer}
              className="relative p-2 rounded-lg text-stone-600 hover:text-amber-600"
            >
              <ShoppingCart className="w-5 h-5" />
              {displayCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {displayCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                  currentView === link.id
                    ? 'text-amber-700 bg-amber-50 font-semibold'
                    : 'text-stone-600 hover:bg-stone-50'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-stone-100">
            {isAuthenticated && user ? (
              <div className="space-y-3">
                <div className="px-3 text-xs">
                  <p className="font-semibold text-stone-900">{user.fullName}</p>
                  <p className="text-stone-500">{user.email}</p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleNavClick('login')}
                  className="w-full py-2 px-3 text-center rounded-lg text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNavClick('register')}
                  className="w-full py-2 px-3 text-center rounded-lg text-sm font-medium bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
