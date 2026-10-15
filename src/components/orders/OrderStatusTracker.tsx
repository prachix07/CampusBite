import React from 'react';
import { 
  Check, 
  Clock, 
  CheckCircle2, 
  ChefHat, 
  BellRing, 
  PackageCheck, 
  XCircle, 
  AlertTriangle,
  Info
} from 'lucide-react';
import { OrderStatus } from '../../types';

interface OrderStatusTrackerProps {
  status: OrderStatus;
  pickupSlot?: string;
  orderNumber?: string;
  createdAt?: string;
  compact?: boolean;
}

interface StepDefinition {
  status: OrderStatus;
  label: string;
  shortLabel: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  tip: string;
}

const HAPPY_STEPS: StepDefinition[] = [
  {
    status: 'PLACED',
    label: 'Order Placed',
    shortLabel: 'Placed',
    desc: 'Order received by canteen server',
    icon: Clock,
    tip: 'Your order is recorded and waiting for kitchen queue confirmation.',
  },
  {
    status: 'ACCEPTED',
    label: 'Order Accepted',
    shortLabel: 'Accepted',
    desc: 'Kitchen confirmed preparation',
    icon: CheckCircle2,
    tip: 'Canteen team acknowledged your order and ingredients are staged.',
  },
  {
    status: 'PREPARING',
    label: 'Preparing Food',
    shortLabel: 'Preparing',
    desc: 'Chefs cooking your food fresh',
    icon: ChefHat,
    tip: 'Your meal is actively being prepared on the hot counters.',
  },
  {
    status: 'READY',
    label: 'Ready for Pickup',
    shortLabel: 'Ready',
    desc: 'Packed at Counter 2 pickup rack',
    icon: BellRing,
    tip: 'Your food is ready! Please proceed to Counter 2 with your order ID.',
  },
  {
    status: 'COLLECTED',
    label: 'Order Collected',
    shortLabel: 'Collected',
    desc: 'Handed over to student',
    icon: PackageCheck,
    tip: 'Order completed and collected. Bon appétit!',
  },
];

export function OrderStatusTracker({
  status,
  pickupSlot,
  orderNumber,
  compact = false,
}: OrderStatusTrackerProps) {
  const isCancelled = status === 'CANCELLED';
  const isRejected = status === 'REJECTED';
  const isException = isCancelled || isRejected;

  // Compute active step index for the 5 happy steps
  const activeIndex = HAPPY_STEPS.findIndex((s) => s.status === status);

  // If compact view (for My Orders list cards)
  if (compact) {
    if (isCancelled) {
      return (
        <div className="flex items-center space-x-2 py-1.5 px-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="font-semibold">Order Cancelled</span>
          <span className="text-stone-400">·</span>
          <span className="text-rose-700">No payment charged</span>
        </div>
      );
    }

    if (isRejected) {
      return (
        <div className="flex items-center space-x-2 py-1.5 px-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-900">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span className="font-semibold">Order Rejected</span>
          <span className="text-stone-400">·</span>
          <span className="text-red-700">Kitchen slot full or out of stock</span>
        </div>
      );
    }

    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-medium text-stone-500">
          <span>Status: <strong className="text-amber-800">{HAPPY_STEPS[activeIndex]?.label || status}</strong></span>
          <span>Step {Math.max(1, activeIndex + 1)} of 5</span>
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {HAPPY_STEPS.map((step, idx) => {
            const isDone = idx < activeIndex;
            const isCurrent = idx === activeIndex;

            return (
              <div key={step.status} className="group relative">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isCurrent
                      ? 'bg-amber-600 ring-2 ring-amber-300 shadow-xs'
                      : isDone
                      ? 'bg-emerald-600'
                      : 'bg-stone-200'
                  }`}
                />
                <span className="sr-only">{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Full Tracker View
  return (
    <div className="space-y-6">
      {/* CANCELLED Alert Banner */}
      {isCancelled && (
        <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700 shrink-0">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-950">This Order Has Been Cancelled</h4>
              <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                Order <code className="font-mono font-semibold">{orderNumber || 'ID'}</code> was cancelled. 
                Because CampusBite uses <em>Pay at Canteen</em>, no money was deducted from your account. 
                If you cancelled by mistake or have any questions, you can place a new order or visit the canteen counter.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* REJECTED Alert Banner */}
      {isRejected && (
        <div className="p-5 rounded-2xl bg-red-50 border border-red-300 text-red-950 space-y-2">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-red-100 text-red-700 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-red-950">Order Rejected by Canteen Kitchen</h4>
              <p className="text-xs text-red-800 mt-1 leading-relaxed">
                We are sorry! The canteen kitchen was unable to accept this order due to kitchen queue capacity limits
                or a sudden stock shortage for an ordered item. 
                Please choose another pickup window slot or select alternative menu items.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* The 5-Step Visual Tracker: PLACED → ACCEPTED → PREPARING → READY → COLLECTED */}
      <div className="bg-stone-50/80 rounded-2xl p-4 sm:p-6 border border-stone-200">
        <div className="flex items-center justify-between pb-4 border-b border-stone-200/80 mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Order Lifecycle Progress
            </span>
            {pickupSlot && (
              <>
                <span className="text-stone-300">·</span>
                <span className="text-xs font-medium text-stone-600">
                  Target Slot: <strong className="text-stone-900">{pickupSlot}</strong>
                </span>
              </>
            )}
          </div>
          {!isException && activeIndex >= 0 && (
            <span className="text-xs font-semibold text-amber-800 bg-amber-100/70 px-2.5 py-0.5 rounded-md">
              Step {activeIndex + 1} of 5: {HAPPY_STEPS[activeIndex]?.label}
            </span>
          )}
        </div>

        {/* Visual Progression Steps */}
        <div className="relative">
          {/* Background Connector Bar (Desktop) */}
          <div className="hidden lg:block absolute top-5 left-12 right-12 h-1 bg-stone-200 -z-0">
            <div
              className={`h-full transition-all duration-500 ${
                isException ? 'bg-rose-400' : 'bg-emerald-600'
              }`}
              style={{
                width: isException
                  ? '20%'
                  : `${(Math.max(0, activeIndex) / (HAPPY_STEPS.length - 1)) * 100}%`,
              }}
            />
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-2 relative z-10">
            {HAPPY_STEPS.map((step, idx) => {
              const isPast = !isException && idx < activeIndex;
              const isCurrent = !isException && idx === activeIndex;
              const isFuture = isException || idx > activeIndex;
              const IconComp = step.icon;

              let iconBg = 'bg-white text-stone-400 border border-stone-300';
              if (isPast) {
                iconBg = 'bg-emerald-600 text-white shadow-xs';
              } else if (isCurrent) {
                iconBg = 'bg-amber-600 text-white ring-4 ring-amber-100 shadow-md scale-105';
              } else if (isException && idx === 0) {
                iconBg = 'bg-stone-300 text-stone-600';
              }

              return (
                <div
                  key={step.status}
                  className={`flex lg:flex-col items-center lg:items-center space-x-3 lg:space-x-0 lg:text-center p-3 rounded-xl transition-all ${
                    isCurrent
                      ? 'bg-amber-50/70 border border-amber-200/80 shadow-2xs'
                      : isPast
                      ? 'bg-white/60'
                      : 'opacity-70'
                  }`}
                >
                  {/* Step Icon circle */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform ${iconBg}`}
                  >
                    {isPast ? (
                      <Check className="w-5 h-5 stroke-[2.5]" />
                    ) : (
                      <IconComp className="w-5 h-5" />
                    )}
                  </div>

                  {/* Step Text Info */}
                  <div className="lg:mt-3 min-w-0">
                    <div className="flex items-center space-x-1 lg:justify-center">
                      <span className="text-[10px] font-mono text-stone-400 font-bold">
                        0{idx + 1}.
                      </span>
                      <p
                        className={`text-xs font-bold truncate ${
                          isCurrent
                            ? 'text-amber-950 font-extrabold'
                            : isPast
                            ? 'text-emerald-950'
                            : 'text-stone-500'
                        }`}
                      >
                        {step.label}
                      </p>
                    </div>
                    <p className="text-[11px] text-stone-500 hidden sm:block mt-0.5 leading-tight">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Contextual Guidance Box */}
        {!isException && activeIndex >= 0 && (
          <div className="mt-6 p-4 rounded-xl bg-white border border-stone-200/90 flex items-start space-x-3 text-xs">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-stone-900 font-semibold block">
                {HAPPY_STEPS[activeIndex]?.label}:
              </strong>
              <p className="text-stone-600 mt-0.5 leading-relaxed">
                {HAPPY_STEPS[activeIndex]?.tip}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
