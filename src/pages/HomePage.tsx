import { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Clock, 
  ShoppingBag, 
  CalendarClock, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Zap,
  TrendingUp,
  ChevronRight
} from 'lucide-react';
import { FoodItem } from '../types';
import { getFoods } from '../services/api';
import { FoodCard } from '../components/food/FoodCard';
import { useAuth } from '../context/AuthContext';

interface HomePageProps {
  onNavigate: (view: string) => void;
  onAddToCart?: (food: FoodItem) => void;
}

export function HomePage({ onNavigate, onAddToCart }: HomePageProps) {
  const { isAuthenticated } = useAuth();
  const [popularFoods, setPopularFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadFeaturedFoods() {
      setLoading(true);
      const res = await getFoods({ availableOnly: true });
      if (res.success && res.data) {
        // Take top 4 items for the popular section
        setPopularFoods(res.data.slice(0, 4));
      }
      setLoading(false);
    }
    loadFeaturedFoods();
  }, []);

  const steps = [
    {
      number: '01',
      title: 'Browse Menu',
      description: 'Explore breakfast snacks, lunch combos, beverages, and desserts updated daily by canteen staff.',
      icon: ShoppingBag,
    },
    {
      number: '02',
      title: 'Choose Food',
      description: 'Pick your items, view clear pricing, ingredients, and accurate kitchen preparation times.',
      icon: Sparkles,
    },
    {
      number: '03',
      title: 'Select Pickup Slot',
      description: 'Reserve a 15-minute time window that aligns perfectly with your class timetable.',
      icon: CalendarClock,
    },
    {
      number: '04',
      title: 'Place Order',
      description: 'Review your order summary and receive an instant unique order code (e.g. CB-2026-00124).',
      icon: CheckCircle2,
    },
    {
      number: '05',
      title: 'Pick Up Without Waiting',
      description: 'Walk right up to the dedicated pre-order counter and pick up your hot, freshly packed meal.',
      icon: Zap,
    },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-50/60 via-orange-50/30 to-stone-50 pt-10 sm:pt-16 pb-12 rounded-3xl border border-amber-100/60 mx-4 sm:mx-6 lg:mx-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-100/80 text-amber-800 text-xs font-semibold mb-4 border border-amber-200 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Official College Canteen Pre-Order System</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-stone-900 tracking-tight leading-tight">
            Skip the Queue. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700">
              Enjoy Your Food.
            </span>
          </h1>

          <p className="mt-4 sm:mt-6 text-stone-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Pre-order your favorite campus meals and pick them up when they’re ready. 
            No more waiting in 20-minute lunch lines between lectures.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('menu')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-sm sm:text-base transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
            >
              <span>Order Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {!isAuthenticated && (
              <button
                onClick={() => onNavigate('login')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 font-semibold text-sm sm:text-base transition-all shadow-2xs"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Quick Perks Bar */}
          <div className="mt-12 pt-8 border-t border-amber-200/50 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-stone-600">
            <div className="flex items-center justify-center space-x-2">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>15-Min Pickup Slots</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Real Kitchen Inventory</span>
            </div>
            <div className="col-span-2 sm:col-span-1 flex items-center justify-center space-x-2">
              <Zap className="w-4 h-4 text-orange-600 shrink-0" />
              <span>Zero Counter Waiting</span>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Menu Items Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center space-x-2 text-amber-700 text-xs font-bold uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Student Favorites</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
              Popular Canteen Items
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Freshly prepared daily with verified kitchen availability.
            </p>
          </div>

          <button
            onClick={() => onNavigate('menu')}
            className="inline-flex items-center space-x-1.5 text-sm font-semibold text-amber-700 hover:text-amber-800 transition-colors group"
          >
            <span>View Full Menu</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-2xl p-4 border border-stone-200 animate-pulse space-y-3">
                <div className="h-44 bg-stone-200 rounded-xl"></div>
                <div className="h-4 bg-stone-200 rounded w-3/4"></div>
                <div className="h-3 bg-stone-200 rounded w-1/2"></div>
                <div className="h-8 bg-stone-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : popularFoods.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularFoods.map((food) => (
              <FoodCard
                key={food.id}
                food={food}
                onAddToCart={onAddToCart}
                onClickDetails={() => onNavigate('menu')}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 p-8">
            <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="font-bold text-stone-800">Canteen Menu is Loading</h3>
            <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
              Make sure your Spring Boot backend is running on port 8080 or click below to browse categories.
            </p>
            <button
              onClick={() => onNavigate('menu')}
              className="mt-4 px-4 py-2 rounded-lg bg-amber-600 text-white text-xs font-semibold"
            >
              Go to Menu Page
            </button>
          </div>
        )}
      </section>

      {/* How It Works Section */}
      <section className="bg-white py-14 border-y border-stone-200" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-amber-700 text-xs font-bold uppercase tracking-wider">
              Effortless Canteen Dining
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
              How CampusBite Works
            </h2>
            <p className="text-sm text-stone-500 mt-2">
              From browsing to pickup in five simple, queue-free steps:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div 
                  key={step.number}
                  className="bg-stone-50 rounded-2xl p-5 border border-stone-200/80 flex flex-col justify-between relative hover:border-amber-300 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-extrabold text-stone-300 font-mono">
                        {step.number}
                      </span>
                    </div>
                    <h3 className="font-bold text-stone-900 text-base mb-1.5">{step.title}</h3>
                    <p className="text-xs text-stone-600 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Use CampusBite? */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-stone-900 to-stone-950 text-white rounded-3xl p-8 sm:p-12 shadow-lg">
          <div className="max-w-3xl">
            <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">
              Built for Campus Life
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              Why College Students Love CampusBite
            </h2>
            <p className="text-stone-300 text-sm sm:text-base mt-3 leading-relaxed">
              Between fast-paced morning lectures, lab sessions, and exams, nobody has 25 minutes to stand 
              in a packed canteen queue. CampusBite gives you control over your meal schedule.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-white/5 border border-white/10">
                <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white text-sm">Capacity Controlled Slots</h4>
                  <p className="text-stone-400 mt-0.5">Maximum 10 orders per 15-minute slot ensures the canteen kitchen is never overwhelmed.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-white/5 border border-white/10">
                <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white text-sm">Real Price & Total Integrity</h4>
                  <p className="text-stone-400 mt-0.5">Spring Boot backend computes all order totals directly from the MySQL database.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-white/5 border border-white/10">
                <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white text-sm">Real-Time Kitchen Availability</h4>
                  <p className="text-stone-400 mt-0.5">If an item runs out, canteen managers update it instantly so you never order sold-out food.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-white/5 border border-white/10">
                <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white text-sm">Pay at Canteen Pickup</h4>
                  <p className="text-stone-400 mt-0.5">Show your unique order ID (e.g. CB-2026-00124) at the pickup counter and pay in cash or UPI.</p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={() => onNavigate('menu')}
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-sm transition-all"
              >
                Browse Canteen Menu Now
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
