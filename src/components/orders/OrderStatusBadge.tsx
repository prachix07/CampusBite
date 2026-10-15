import React from 'react';
import { 
  Clock, 
  CheckCircle2, 
  ChefHat, 
  BellRing, 
  PackageCheck, 
  XCircle, 
  AlertTriangle 
} from 'lucide-react';
import { OrderStatus } from '../../types';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function OrderStatusBadge({ status, size = 'md', showIcon = true }: OrderStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'PLACED':
        return {
          label: 'Order Placed',
          icon: Clock,
          classes: 'bg-amber-50 text-amber-800 border-amber-200/80',
          dotClass: 'bg-amber-500',
        };
      case 'ACCEPTED':
        return {
          label: 'Accepted by Kitchen',
          icon: CheckCircle2,
          classes: 'bg-blue-50 text-blue-800 border-blue-200/80',
          dotClass: 'bg-blue-500',
        };
      case 'PREPARING':
        return {
          label: 'Preparing Meal',
          icon: ChefHat,
          classes: 'bg-purple-50 text-purple-800 border-purple-200/80',
          dotClass: 'bg-purple-500',
        };
      case 'READY':
        return {
          label: 'Ready for Pickup',
          icon: BellRing,
          classes: 'bg-emerald-50 text-emerald-800 border-emerald-200/80 ring-1 ring-emerald-300/50',
          dotClass: 'bg-emerald-500 animate-pulse',
        };
      case 'COLLECTED':
        return {
          label: 'Collected',
          icon: PackageCheck,
          classes: 'bg-stone-100 text-stone-700 border-stone-200',
          dotClass: 'bg-stone-500',
        };
      case 'CANCELLED':
        return {
          label: 'Cancelled',
          icon: XCircle,
          classes: 'bg-rose-50 text-rose-800 border-rose-200',
          dotClass: 'bg-rose-500',
        };
      case 'REJECTED':
        return {
          label: 'Rejected',
          icon: AlertTriangle,
          classes: 'bg-red-50 text-red-900 border-red-300',
          dotClass: 'bg-red-600',
        };
      default:
        return {
          label: status,
          icon: Clock,
          classes: 'bg-stone-100 text-stone-700 border-stone-200',
          dotClass: 'bg-stone-400',
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 space-x-1 font-medium',
    md: 'text-xs px-2.5 py-1 space-x-1.5 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 space-x-2 font-bold',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-lg border shadow-2xs whitespace-nowrap ${config.classes} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass} shrink-0`} />
      {showIcon && <IconComponent className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />}
      <span>{config.label}</span>
    </span>
  );
}
