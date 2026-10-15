/**
 * CampusBite Core TypeScript Data Types & Interfaces
 * Mirrors the Spring Boot Backend Entities and DTOs
 */

export type RoleName = 'ROLE_STUDENT' | 'ROLE_ADMIN';

export interface User {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  role: RoleName;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  type: string; // 'Bearer'
  user: User;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  displayOrder?: number;
}

export interface FoodItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category?: Category | string;
  categoryId?: number;
  categoryName?: string;
  imageUrl?: string;
  available: boolean;
  preparationTime: number; // in minutes
  createdAt?: string;
  updatedAt?: string;
}

export interface PickupSlot {
  id: number;
  startTime: string; // e.g. "12:00 PM" or "12:00"
  endTime: string;   // e.g. "12:15 PM" or "12:15"
  displayLabel: string; // e.g. "12:00 PM - 12:15 PM"
  maxCapacity: number;  // default 10
  currentBookings?: number;
  isAvailable?: boolean;
}

export type OrderStatus =
  | 'PLACED'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY'
  | 'COLLECTED'
  | 'CANCELLED'
  | 'REJECTED';

export interface OrderItem {
  id?: number;
  foodItemId: number;
  foodName: string;
  priceAtPurchase: number;
  quantity: number;
  subtotal: number;
  imageUrl?: string;
}

export interface Order {
  id: number;
  orderNumber: string; // e.g., "CB-2026-00124"
  studentId: number;
  studentName?: string;
  studentEmail?: string;
  studentPhone?: string;
  items: OrderItem[];
  totalAmount: number;
  pickupDate: string; // YYYY-MM-DD
  pickupSlot: string; // "12:00 PM - 12:15 PM"
  status: OrderStatus;
  paymentMethod: 'PAY_AT_CANTEEN';
  createdAt: string;
  updatedAt?: string;
}

export interface CartItem {
  foodItem: FoodItem;
  quantity: number;
}

export interface SlotAvailabilityResponse {
  slotId: number;
  startTime: string;
  endTime: string;
  displayLabel: string;
  maxCapacity: number;
  bookedCount: number;
  remainingCount: number;
  isFull: boolean;
  isPast: boolean;
  isAvailable: boolean;
}

export interface DashboardStats {
  todayOrdersCount: number;
  pendingOrdersCount: number;
  preparingOrdersCount: number;
  readyOrdersCount: number;
  todayRevenue: number;
  totalOrdersCount: number;
}
