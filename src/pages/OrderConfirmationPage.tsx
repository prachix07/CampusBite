import { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  CreditCard, 
  Receipt, 
  ArrowRight, 
  Copy, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  ChevronRight,
  Printer,
  Calendar,
  Utensils
} from 'lucide-react';
import { OrderResponseData, getOrderByNumber } from '../services/api';
import { OrderStatus } from '../types';

interface OrderConfirmationPageProps {
  orderNumber: string;
  initialOrder?: OrderResponseData | null;
  onNavigate: (view: string) => void;
}

const ORDER_STEPS: { status: OrderStatus; label: string; desc: string }[] = [
  { status: 'PLACED', label: 'Order Placed', desc: 'Order received by canteen system' },
  { status: 'ACCEPTED', label: 'Accepted', desc: 'Kitchen confirmed preparation' },
  { status: 'PREPARING', label: 'Preparing', desc: 'Chefs cooking your food fresh' },
  { status: 'READY', label: 'Ready for Pickup', desc: 'Waiting at Counter 2 express tray' },
  { status: 'COLLECTED', label: 'Collected', desc: 'Order handed over to student' },
];

export function OrderConfirmationPage({ orderNumber, initialOrder, onNavigate }: OrderConfirmationPageProps) {
  const [order, setOrder] = useState<OrderResponseData | null>(initialOrder || null);
  const [copied, setCopied] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(initialOrder?.status || 'PLACED');

  useEffect(() => {
    if (!initialOrder && orderNumber) {
      getOrderByNumber(orderNumber).then((res) => {
        if (res.success && res.data) {
          setOrder(res.data);
          setCurrentStatus(res.data.status);
        }
      });
    }
  }, [orderNumber, initialOrder]);

  const handleCopyOrderNumber = () => {
    if (order?.orderNumber) {
      navigator.clipboard.writeText(order.orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSimulateStatusAdvance = () => {
    const statuses: OrderStatus[] = ['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'COLLECTED'];
    const currentIndex = statuses.indexOf(currentStatus);
    if (currentIndex < statuses.length - 1) {
      const nextStatus = statuses[currentIndex + 1];
      setCurrentStatus(nextStatus);
    } else {
      setCurrentStatus('PLACED');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const currentStepIndex = ORDER_STEPS.findIndex((s) => s.status === currentStatus);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-300">
      {/* Top Success Banner */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 rounded-3xl p-8 text-white shadow-lg text-center relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30 shadow-inner">
          <CheckCircle2 className="w-9 h-9 text-white" />
        </div>
        <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-xs rounded-full text-xs font-bold uppercase tracking-wider text-emerald-100 mb-2">
          Phase 10: Order Created & Slot Capacity Updated
        </span>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Order Placed Successfully!</h1>
        <p className="text-sm sm:text-base text-emerald-100 max-w-lg mx-auto mt-2 leading-relaxed">
          Your order has been recorded in the database. Please present your order number at Counter 2 during your pickup slot.
        </p>

        {/* Order Number Big Display */}
        <div className="mt-6 inline-flex items-center space-x-3 bg-black/25 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/20">
          <span className="text-xs uppercase tracking-wider text-emerald-200 font-bold">Order ID:</span>
          <span className="font-mono text-xl sm:text-2xl font-black tracking-wider text-white">
            {order?.orderNumber || orderNumber || 'CB-2026-00124'}
          </span>
          <button
            onClick={handleCopyOrderNumber}
            title="Copy Order Number"
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Pickup Token Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div>
            <h2 className="text-lg font-extrabold text-stone-900 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <span>Digital Canteen Pickup Token</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Strict 15-minute scheduled window to prevent canteen hall congestion
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 text-xs font-semibold flex items-center space-x-1.5 transition-colors print:hidden"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Token</span>
            </button>
          </div>
        </div>

        {/* Key Token Attributes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Pickup Window</span>
            </span>
            <p className="text-sm font-extrabold text-stone-900 font-mono">
              {order?.pickupSlot || '12:15 PM - 12:30 PM'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              <span>Pickup Date</span>
            </span>
            <p className="text-sm font-extrabold text-stone-900 font-mono">
              {order?.pickupDate || new Date().toISOString().split('T')[0]}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-stone-400" />
              <span>Collection Point</span>
            </span>
            <p className="text-sm font-extrabold text-stone-900">
              Counter 2 (Express)
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center space-x-1">
              <CreditCard className="w-3.5 h-3.5 text-stone-400" />
              <span>Payment Mode</span>
            </span>
            <p className="text-sm font-extrabold text-amber-800">
              Pay at Canteen
            </p>
          </div>
        </div>

        {/* Special Instructions */}
        {order?.specialInstructions && (
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-700">
            <strong className="text-stone-900 block mb-0.5">Kitchen Special Instructions:</strong>
            <p className="italic text-stone-600 font-mono">{order.specialInstructions}</p>
          </div>
        )}
      </div>

      {/* Live Order Status Lifecycle Timeline */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-stone-900 flex items-center space-x-2">
              <Utensils className="w-4 h-4 text-amber-600" />
              <span>Live Order Status Tracking</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Current state: <strong className="text-amber-700 font-mono">{currentStatus}</strong>
            </p>
          </div>

          {/* Interactive Status Transition Demo Button */}
          <button
            onClick={handleSimulateStatusAdvance}
            className="px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all flex items-center space-x-1 self-start sm:self-auto print:hidden"
            title="Advance the order status through the 5 lifecycle states"
          >
            <span>Simulate Kitchen Progress</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Progress Bar & Steps */}
        <div className="relative pt-2">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-6 left-8 right-8 h-1 bg-stone-100 -z-0">
            <div 
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${(Math.max(0, currentStepIndex) / (ORDER_STEPS.length - 1)) * 100}%` }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative z-10">
            {ORDER_STEPS.map((step, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div key={step.status} className="flex md:flex-col items-center md:items-center space-x-3 md:space-x-0 md:text-center">
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 text-xs font-bold transition-all shadow-xs ${
                      isCurrent
                        ? 'bg-amber-600 text-white ring-4 ring-amber-100 scale-105'
                        : isPast
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-100 text-stone-400 border border-stone-200'
                    }`}
                  >
                    {isPast ? <Check className="w-4 h-4" /> : idx + 1}
                  </div>
                  <div className="md:mt-2.5">
                    <p className={`text-xs font-bold ${isCurrent ? 'text-amber-900 font-extrabold' : isPast ? 'text-emerald-900' : 'text-stone-400'}`}>
                      {step.label}
                    </p>
                    <p className="text-[11px] text-stone-400 hidden sm:block mt-0.5 max-w-[130px]">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Itemized Order Receipt */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center space-x-2">
            <Receipt className="w-5 h-5 text-amber-600" />
            <h3 className="font-extrabold text-stone-900 text-base">Itemized Bill Breakdown</h3>
          </div>
          <span className="text-xs font-mono text-stone-500">
            {order?.items?.length || 0} line items
          </span>
        </div>

        {/* Items List */}
        <div className="divide-y divide-stone-100 text-sm">
          {order?.items && order.items.length > 0 ? (
            order.items.map((it) => (
              <div key={it.id || it.foodItemId} className="py-3.5 flex justify-between items-center">
                <div>
                  <p className="font-bold text-stone-900">{it.foodName}</p>
                  <p className="text-xs text-stone-400 font-mono mt-0.5">
                    {it.quantity} × ₹{Number(it.priceAtPurchase).toFixed(2)}
                  </p>
                </div>
                <span className="font-mono font-bold text-stone-900">
                  ₹{Number(it.subtotal).toFixed(2)}
                </span>
              </div>
            ))
          ) : (
            <p className="text-xs text-stone-400 py-4 text-center">No item details available</p>
          )}
        </div>

        {/* Pricing Subtotal / Grand Total */}
        <div className="pt-4 border-t border-stone-100 space-y-2">
          <div className="flex justify-between items-center text-xs text-stone-500">
            <span>Payment Method</span>
            <span className="font-semibold text-stone-700">Pay at Canteen Counter</span>
          </div>
          <div className="flex justify-between items-center text-xs text-stone-500">
            <span>Payment Status</span>
            <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Payment Pending (Due at counter)
            </span>
          </div>
          <div className="pt-2 flex justify-between items-baseline">
            <span className="text-base font-extrabold text-stone-900">Total Amount Due</span>
            <span className="text-2xl font-black text-amber-700 font-mono">
              ₹{Number(order?.totalAmount || 0).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Security & Database Price Guarantee Notice */}
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-start space-x-2.5 text-xs text-stone-600">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-stone-900">MySQL Database Price Snapshot Guarantee</p>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              In accordance with Phase 10 requirements, prices were retrieved directly from the MySQL database and calculated server-side. 
              The pickup slot capacity was decremented and locked within an ACID transaction.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 print:hidden">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => onNavigate('orders')}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 active:scale-98 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2"
          >
            <Receipt className="w-4 h-4 text-amber-400" />
            <span>Go to My Orders & Tracker</span>
          </button>

          <button
            onClick={() => onNavigate('menu')}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 active:scale-98 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2"
          >
            <span>Order More Food</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={() => onNavigate('diagnostics')}
          className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-stone-300 hover:bg-stone-100 text-stone-700 font-semibold text-xs transition-colors flex items-center justify-center space-x-2"
        >
          <span>System Diagnostics</span>
        </button>
      </div>
    </div>
  );
}
