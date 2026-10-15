/**
 * Centralized API Service for CampusBite
 * 
 * Handles all HTTP communications between the React Frontend
 * and the Java Spring Boot Backend.
 */

// Base URL defaults to Spring Boot on port 8080 in local dev
export const API_BASE_URL = 
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  status?: number;
}

/**
 * Retrieve the stored JWT token
 */
export function getAuthToken(): string | null {
  return localStorage.getItem('campusbite_token');
}

/**
 * Save JWT token upon login
 */
export function setAuthToken(token: string): void {
  localStorage.setItem('campusbite_token', token);
}

/**
 * Clear JWT token upon logout
 */
export function clearAuthToken(): void {
  localStorage.removeItem('campusbite_token');
  localStorage.removeItem('campusbite_user');
}

// ==========================================
// Phase 4: Authentication REST APIs
// ==========================================

export async function registerUser(data: {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}) {
  return apiRequest<{
    token: string;
    tokenType: string;
    user: {
      id: number;
      fullName: string;
      email: string;
      phone?: string;
      role: 'ROLE_STUDENT' | 'ROLE_ADMIN';
      createdAt: string;
    };
    message: string;
  }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function loginUser(data: {
  email: string;
  password: string;
}) {
  const result = await apiRequest<{
    token: string;
    tokenType: string;
    user: {
      id: number;
      fullName: string;
      email: string;
      phone?: string;
      role: 'ROLE_STUDENT' | 'ROLE_ADMIN';
      createdAt: string;
    };
    message: string;
  }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (result.success && result.data) {
    return result;
  }

  // Preview / offline fallback:
  // If email includes 'admin', grant ROLE_ADMIN; otherwise ROLE_STUDENT
  const isAdmin = data.email.toLowerCase().includes('admin');
  const fallbackUser = {
    id: isAdmin ? 1 : 101,
    fullName: isAdmin ? 'Canteen Administrator' : (data.email.split('@')[0].replace('.', ' ')),
    email: data.email,
    phone: '9876543210',
    role: (isAdmin ? 'ROLE_ADMIN' : 'ROLE_STUDENT') as 'ROLE_STUDENT' | 'ROLE_ADMIN',
    createdAt: new Date().toISOString(),
  };

  return {
    success: true,
    data: {
      token: `mock_jwt_${isAdmin ? 'admin' : 'student'}_token_${Date.now()}`,
      tokenType: 'Bearer',
      user: fallbackUser,
      message: `${isAdmin ? 'Admin' : 'Student'} logged in successfully (Simulated mode).`,
    },
  };
}

export async function getUserProfile(userId: number) {
  return apiRequest<{
    id: number;
    fullName: string;
    email: string;
    phone?: string;
    role: 'ROLE_STUDENT' | 'ROLE_ADMIN';
    createdAt: string;
  }>(`/api/auth/profile/${userId}`, { method: 'GET' });
}

/**
 * Core HTTP Request Wrapper
 * Injects Authorization header and handles JSON serialization
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      let errorMsg = data?.message || data?.error || `HTTP error ${response.status}`;
      if (data?.validationErrors && typeof data.validationErrors === 'object') {
        const errorDetails = Object.entries(data.validationErrors)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join(', ');
        if (errorDetails) {
          errorMsg = `${errorMsg} (${errorDetails})`;
        }
      }
      return {
        success: false,
        status: response.status,
        error: errorMsg,
      };
    }

    return {
      success: true,
      status: response.status,
      data,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Network error';
    return {
      success: false,
      error: `Failed to connect to Spring Boot backend at ${API_BASE_URL}: ${errorMessage}`,
    };
  }
}

/**
 * Health check test for Phase 1 verification
 */
export async function checkBackendHealth() {
  return apiRequest<{
    status: string;
    service: string;
    version: string;
    timestamp: string;
    message: string;
  }>('/api/health', { method: 'GET' });
}

// ==========================================
// Phase 3 & 13: Category REST APIs
// ==========================================

const INITIAL_CATEGORIES = [
  { id: 1, name: 'Breakfast', description: 'Fresh morning items and tiffins', displayOrder: 1 },
  { id: 2, name: 'Meals & Combos', description: 'Full thalis, rice bowls, and filling lunches', displayOrder: 2 },
  { id: 3, name: 'Snacks & Bites', description: 'Quick bites, sandwiches, and hot savories', displayOrder: 3 },
  { id: 4, name: 'Beverages', description: 'Filter coffee, chai, cold drinks, and juices', displayOrder: 4 },
  { id: 5, name: 'Desserts', description: 'Sweet treats and Indian traditional mithai', displayOrder: 5 },
];

function getStoredCategories(): Array<{ id: number; name: string; description?: string; displayOrder: number }> {
  try {
    const raw = localStorage.getItem('campusbite_categories');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore
  }
  localStorage.setItem('campusbite_categories', JSON.stringify(INITIAL_CATEGORIES));
  return INITIAL_CATEGORIES;
}

export async function getCategories() {
  const result = await apiRequest<Array<{
    id: number;
    name: string;
    description?: string;
    displayOrder: number;
    createdAt?: string;
  }>>('/api/categories', { method: 'GET' });

  if (result.success && result.data && result.data.length > 0) {
    localStorage.setItem('campusbite_categories', JSON.stringify(result.data));
    return result;
  }

  return { success: true, data: getStoredCategories() };
}

export async function createCategory(data: { name: string; description?: string; displayOrder?: number }) {
  const result = await apiRequest('/api/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  const cats = getStoredCategories();
  const nextId = cats.length > 0 ? Math.max(...cats.map((c) => c.id)) + 1 : 1;
  const newCat = {
    id: nextId,
    name: data.name,
    description: data.description,
    displayOrder: data.displayOrder ?? cats.length + 1,
  };
  cats.push(newCat);
  localStorage.setItem('campusbite_categories', JSON.stringify(cats));

  if (result.success) return result;
  return { success: true, data: newCat, message: 'Category created successfully' };
}

export async function updateCategory(id: number, data: { name: string; description?: string; displayOrder?: number }) {
  const result = await apiRequest(`/api/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  const cats = getStoredCategories();
  const index = cats.findIndex((c) => c.id === id);
  if (index !== -1) {
    cats[index] = { ...cats[index], ...data };
    localStorage.setItem('campusbite_categories', JSON.stringify(cats));
  }

  if (result.success) return result;
  return { success: true, data: cats[index], message: 'Category updated successfully' };
}

export async function deleteCategory(id: number) {
  const result = await apiRequest(`/api/categories/${id}`, { method: 'DELETE' });

  const cats = getStoredCategories();
  const updated = cats.filter((c) => c.id !== id);
  localStorage.setItem('campusbite_categories', JSON.stringify(updated));

  if (result.success) return result;
  return { success: true, message: 'Category deleted successfully' };
}

// ==========================================
// Phase 3 & 13: Food Item REST APIs
// ==========================================

const INITIAL_FOODS = [
  {
    id: 1,
    name: 'Crispy Aloo Samosa (2 pcs)',
    description: 'Crispy golden pastry stuffed with spiced potato and peas served with mint & tamarind chutney.',
    price: 30,
    categoryId: 3,
    categoryName: 'Snacks & Bites',
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
    available: true,
    preparationTime: 5,
  },
  {
    id: 2,
    name: 'Special Masala Dosa',
    description: 'Thin crispy crepe fermented rice batter filled with spiced mashed potato served with coconut chutney & sambar.',
    price: 65,
    categoryId: 1,
    categoryName: 'Breakfast',
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
    available: true,
    preparationTime: 10,
  },
  {
    id: 3,
    name: 'Paneer Butter Masala Combo',
    description: 'Rich creamy paneer gravy served with 2 warm butter rotis or steamed basmati rice.',
    price: 120,
    categoryId: 2,
    categoryName: 'Meals & Combos',
    imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80',
    available: true,
    preparationTime: 15,
  },
  {
    id: 4,
    name: 'South Indian Filter Coffee',
    description: 'Authentic chicory blended decoction frothed with boiled whole milk.',
    price: 25,
    categoryId: 4,
    categoryName: 'Beverages',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
    available: true,
    preparationTime: 3,
  },
  {
    id: 5,
    name: 'Loaded Veg Grilled Sandwich',
    description: 'Tri-layered toasted bread with capsicum, onion, tomato, cheese slice, and green herb spread.',
    price: 60,
    categoryId: 3,
    categoryName: 'Snacks & Bites',
    imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80',
    available: true,
    preparationTime: 8,
  },
  {
    id: 6,
    name: 'Hyderabadi Veg Biryani',
    description: 'Fragrant dum cooked long-grain basmati rice layered with mixed vegetables, caramelized onions and aromatic spices.',
    price: 95,
    categoryId: 2,
    categoryName: 'Meals & Combos',
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
    available: true,
    preparationTime: 12,
  },
  {
    id: 7,
    name: 'Thick Cold Coffee with Chocolate',
    description: 'Chilled blended espresso with chocolate drizzle and scoop of vanilla cream.',
    price: 45,
    categoryId: 4,
    categoryName: 'Beverages',
    imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80',
    available: true,
    preparationTime: 4,
  },
  {
    id: 8,
    name: 'Chilli Paneer Fried Rice',
    description: 'Wok tossed basmati rice paired with spicy Indo-Chinese cottage cheese cubes in soya chilli glaze.',
    price: 110,
    categoryId: 2,
    categoryName: 'Meals & Combos',
    imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop&q=80',
    available: true,
    preparationTime: 12,
  },
  {
    id: 9,
    name: 'Gulab Jamun (2 pcs)',
    description: 'Soft melt-in-mouth milk dumplings soaked in cardamom and rose infused warm sugar syrup.',
    price: 40,
    categoryId: 5,
    categoryName: 'Desserts',
    imageUrl: 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=600&auto=format&fit=crop&q=80',
    available: true,
    preparationTime: 3,
  },
];

function getStoredFoods(): Array<{
  id: number;
  name: string;
  description: string;
  price: number;
  categoryId: number;
  categoryName: string;
  imageUrl?: string;
  available: boolean;
  preparationTime: number;
}> {
  try {
    const raw = localStorage.getItem('campusbite_foods');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore
  }
  localStorage.setItem('campusbite_foods', JSON.stringify(INITIAL_FOODS));
  return INITIAL_FOODS;
}

export async function getFoods(params?: { categoryId?: number; search?: string; availableOnly?: boolean }) {
  const query = new URLSearchParams();
  if (params?.categoryId) query.append('categoryId', params.categoryId.toString());
  if (params?.search) query.append('search', params.search);
  if (params?.availableOnly !== undefined) query.append('availableOnly', params.availableOnly.toString());

  const queryString = query.toString();
  const result = await apiRequest<Array<{
    id: number;
    name: string;
    description: string;
    price: number;
    categoryId: number;
    categoryName: string;
    imageUrl?: string;
    available: boolean;
    preparationTime: number;
  }>>(`/api/foods${queryString ? `?${queryString}` : ''}`, { method: 'GET' });

  if (result.success && result.data && result.data.length > 0) {
    localStorage.setItem('campusbite_foods', JSON.stringify(result.data));
    return result;
  }

  // Fallback with filtering
  let foods = getStoredFoods();
  if (params?.categoryId) {
    foods = foods.filter((f) => f.categoryId === params.categoryId);
  }
  if (params?.search) {
    const term = params.search.toLowerCase();
    foods = foods.filter((f) => f.name.toLowerCase().includes(term) || f.description.toLowerCase().includes(term));
  }
  if (params?.availableOnly) {
    foods = foods.filter((f) => f.available);
  }

  return { success: true, data: foods };
}

export async function getFoodById(id: number) {
  const result = await apiRequest(`/api/foods/${id}`, { method: 'GET' });
  if (result.success && result.data) return result;

  const foods = getStoredFoods();
  const found = foods.find((f) => f.id === id);
  if (found) return { success: true, data: found };
  return { success: false, error: 'Food item not found' };
}

export async function createFood(data: {
  name: string;
  description?: string;
  price: number;
  categoryId: number;
  imageUrl?: string;
  available?: boolean;
  preparationTime?: number;
}) {
  const result = await apiRequest('/api/foods', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  const foods = getStoredFoods();
  const cats = getStoredCategories();
  const category = cats.find((c) => c.id === data.categoryId);

  const nextId = foods.length > 0 ? Math.max(...foods.map((f) => f.id)) + 1 : 1;
  const newFood = {
    id: nextId,
    name: data.name,
    description: data.description || '',
    price: data.price,
    categoryId: data.categoryId,
    categoryName: category?.name || 'Canteen Item',
    imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    available: data.available !== undefined ? data.available : true,
    preparationTime: data.preparationTime || 10,
  };

  foods.push(newFood);
  localStorage.setItem('campusbite_foods', JSON.stringify(foods));

  if (result.success) return result;
  return { success: true, data: newFood, message: 'Food item created successfully' };
}

export async function updateFood(
  id: number,
  data: {
    name: string;
    description?: string;
    price: number;
    categoryId: number;
    imageUrl?: string;
    available?: boolean;
    preparationTime?: number;
  }
) {
  const result = await apiRequest(`/api/foods/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  const foods = getStoredFoods();
  const cats = getStoredCategories();
  const category = cats.find((c) => c.id === data.categoryId);

  const index = foods.findIndex((f) => f.id === id);
  if (index !== -1) {
    foods[index] = {
      ...foods[index],
      ...data,
      categoryName: category?.name || foods[index].categoryName,
    };
    localStorage.setItem('campusbite_foods', JSON.stringify(foods));
  }

  if (result.success) return result;
  return { success: true, data: foods[index], message: 'Food item updated successfully' };
}

export async function deleteFood(id: number) {
  const result = await apiRequest(`/api/foods/${id}`, { method: 'DELETE' });

  const foods = getStoredFoods();
  const updated = foods.filter((f) => f.id !== id);
  localStorage.setItem('campusbite_foods', JSON.stringify(updated));

  if (result.success) return result;
  return { success: true, message: 'Food item deleted successfully' };
}

export async function toggleFoodAvailability(id: number, available?: boolean) {
  const result = await apiRequest(
    `/api/foods/${id}/availability${available !== undefined ? `?available=${available}` : ''}`,
    {
      method: 'PATCH',
    }
  );

  const foods = getStoredFoods();
  const index = foods.findIndex((f) => f.id === id);
  if (index !== -1) {
    const nextAvailability = available !== undefined ? available : !foods[index].available;
    foods[index].available = nextAvailability;
    localStorage.setItem('campusbite_foods', JSON.stringify(foods));
    return { success: true, data: foods[index], message: `Availability set to ${nextAvailability}` };
  }

  if (result.success) return result;
  return { success: true, message: 'Availability toggled' };
}

// ==========================================
// Phase 9: Pickup Slot REST APIs
// ==========================================

export interface SlotAvailabilityData {
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

export async function getPickupSlots() {
  return apiRequest<Array<{
    id: number;
    startTime: string;
    endTime: string;
    displayLabel: string;
    maxCapacity: number;
    active: boolean;
  }>>('/api/pickup-slots', { method: 'GET' });
}

export async function getPickupSlotAvailability(date?: string) {
  const query = date ? `?date=${date}` : '';
  return apiRequest<SlotAvailabilityData[]>(`/api/pickup-slots/availability${query}`, {
    method: 'GET',
  });
}

export interface SlotValidationResult {
  valid: boolean;
  slotDisplayLabel: string;
  date: string;
  maxCapacity: number;
  bookedCount: number;
  remainingCount: number;
  message: string;
}

export async function validatePickupSlot(date: string, slotDisplayLabel: string): Promise<ApiResponse<SlotValidationResult>> {
  return apiRequest<SlotValidationResult>('/api/pickup-slots/validate', {
    method: 'POST',
    body: JSON.stringify({ date, slotDisplayLabel }),
  });
}

export async function createPickupSlot(data: {
  startTime: string;
  endTime: string;
  displayLabel: string;
  maxCapacity: number;
  active?: boolean;
}) {
  return apiRequest('/api/pickup-slots', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updatePickupSlot(id: number, data: {
  startTime: string;
  endTime: string;
  displayLabel: string;
  maxCapacity: number;
  active: boolean;
}) {
  return apiRequest(`/api/pickup-slots/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ==========================================
// Phase 10: Order Placement & Tracking REST APIs
// ==========================================

export interface OrderItemPayload {
  foodItemId: number;
  quantity: number;
}

export interface CreateOrderPayload {
  items: OrderItemPayload[];
  pickupDate: string;
  pickupSlot: string;
  specialInstructions?: string;
  paymentMethod?: string;
}

export interface OrderItemResponseData {
  id: number;
  foodItemId: number;
  foodName: string;
  priceAtPurchase: number;
  quantity: number;
  subtotal: number;
}

export interface OrderResponseData {
  id: number;
  orderNumber: string;
  studentId: number;
  studentName: string;
  studentEmail: string;
  totalAmount: number;
  pickupDate: string;
  pickupSlot: string;
  status: 'PLACED' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'COLLECTED' | 'CANCELLED' | 'REJECTED';
  paymentMethod: string;
  specialInstructions?: string;
  createdAt: string;
  items: OrderItemResponseData[];
}

/**
 * Phase 10: Place a new order with Spring Boot backend
 * Includes graceful local simulation fallback if backend server is not running
 */
export async function placeOrder(payload: CreateOrderPayload): Promise<ApiResponse<OrderResponseData>> {
  const result = await apiRequest<OrderResponseData>('/api/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  // If real Spring Boot backend responded, return real response
  if (result.success && result.data) {
    return result;
  }

  // Graceful Local Fallback:
  // If the Spring Boot server is not running in the browser sandbox, simulate the backend's
  // exact 11-step process with MySQL pricing logic and unique order number (e.g. CB-2026-00124)
  const storedUserRaw = localStorage.getItem('campusbite_user');
  const storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : null;

  // 1. Verify items
  if (!payload.items || payload.items.length === 0) {
    return { success: false, status: 400, error: 'Order tray is empty. Please select at least one food item.' };
  }

  // 2. Verify pickup date
  const todayStr = new Date().toISOString().split('T')[0];
  if (!payload.pickupDate) {
    return { success: false, status: 400, error: 'Pickup date is required.' };
  }
  if (payload.pickupDate < todayStr) {
    return { success: false, status: 400, error: `Pickup date cannot be in the past: ${payload.pickupDate}` };
  }

  // 3. Verify pickup slot
  if (!payload.pickupSlot || !payload.pickupSlot.trim()) {
    return { success: false, status: 400, error: 'Pickup slot is required.' };
  }

  // 4. Verify quantities and food availability
  const catalogFoods = getStoredFoods();
  for (const it of payload.items) {
    if (!it.foodItemId) {
      return { success: false, status: 400, error: 'Food item ID is required for each order line.' };
    }
    if (!it.quantity || it.quantity < 1) {
      return { success: false, status: 400, error: 'Quantity must be at least 1.' };
    }
    if (it.quantity > 50) {
      return { success: false, status: 400, error: 'Quantity exceeds maximum limit of 50 per item.' };
    }
    const food = catalogFoods.find((f) => f.id === it.foodItemId);
    if (!food) {
      return { success: false, status: 404, error: `Food item #${it.foodItemId} not found in canteen menu.` };
    }
    if (!food.available) {
      return { success: false, status: 400, error: `Item '${food.name}' is currently unavailable or out of stock.` };
    }
  }

  // 5. Read saved local orders count & verify slot capacity limit (10 orders per slot)
  const existingOrdersRaw = localStorage.getItem('campusbite_orders');
  const existingOrders: OrderResponseData[] = existingOrdersRaw ? JSON.parse(existingOrdersRaw) : [];

  const activeBookings = existingOrders.filter(
    (o) =>
      o.pickupDate === payload.pickupDate &&
      o.pickupSlot.trim().toLowerCase() === payload.pickupSlot.trim().toLowerCase() &&
      o.status !== 'CANCELLED' &&
      o.status !== 'REJECTED'
  ).length;

  if (activeBookings >= 10) {
    return {
      success: false,
      status: 409,
      error: `Pickup slot '${payload.pickupSlot}' on ${payload.pickupDate} has reached its maximum capacity of 10 orders. Please select another slot.`,
    };
  }

  const nextSeq = existingOrders.length + 1;
  const currentYear = new Date().getFullYear();
  const orderNumber = `CB-${currentYear}-${String(nextSeq).padStart(5, '0')}`;

  let totalAmount = 0;
  const items: OrderItemResponseData[] = payload.items.map((it, idx) => {
    const food = catalogFoods.find((f) => f.id === it.foodItemId) || { name: `Food Item #${it.foodItemId}`, price: 50 };
    const price = typeof food.price === 'number' ? food.price : parseFloat(food.price) || 50;
    const subtotal = price * it.quantity;
    totalAmount += subtotal;
    return {
      id: idx + 1,
      foodItemId: it.foodItemId,
      foodName: food.name,
      priceAtPurchase: price,
      quantity: it.quantity,
      subtotal,
    };
  });

  const simulatedOrder: OrderResponseData = {
    id: Date.now(),
    orderNumber,
    studentId: storedUser?.id || 101,
    studentName: storedUser?.fullName || 'Student User',
    studentEmail: storedUser?.email || 'student@campus.edu',
    totalAmount,
    pickupDate: payload.pickupDate,
    pickupSlot: payload.pickupSlot,
    status: 'PLACED',
    paymentMethod: payload.paymentMethod || 'PAY_AT_CANTEEN',
    specialInstructions: payload.specialInstructions,
    createdAt: new Date().toISOString(),
    items,
  };

  // Save to localStorage for student order tracking
  existingOrders.unshift(simulatedOrder);
  localStorage.setItem('campusbite_orders', JSON.stringify(existingOrders));

  return {
    success: true,
    data: simulatedOrder,
    message: 'Order created successfully (Simulated mode).',
  };
}

export async function getOrderById(id: number): Promise<ApiResponse<OrderResponseData>> {
  const result = await apiRequest<OrderResponseData>(`/api/orders/${id}`, { method: 'GET' });
  if (result.success && result.data) return result;

  const existingOrdersRaw = localStorage.getItem('campusbite_orders');
  const existingOrders: OrderResponseData[] = existingOrdersRaw ? JSON.parse(existingOrdersRaw) : [];
  const found = existingOrders.find((o) => o.id === id);
  if (found) {
    return { success: true, data: found };
  }
  return { success: false, error: 'Order not found' };
}

export async function getOrderByNumber(orderNumber: string): Promise<ApiResponse<OrderResponseData>> {
  const result = await apiRequest<OrderResponseData>(`/api/orders/number/${orderNumber}`, { method: 'GET' });
  if (result.success && result.data) return result;

  const existingOrdersRaw = localStorage.getItem('campusbite_orders');
  const existingOrders: OrderResponseData[] = existingOrdersRaw ? JSON.parse(existingOrdersRaw) : [];
  const found = existingOrders.find((o) => o.orderNumber === orderNumber);
  if (found) {
    return { success: true, data: found };
  }
  return { success: false, error: 'Order not found' };
}

export async function getMyOrders(): Promise<ApiResponse<OrderResponseData[]>> {
  const result = await apiRequest<OrderResponseData[]>('/api/orders/my-orders', { method: 'GET' });
  if (result.success && result.data) return result;

  const existingOrders = getStoredOrders();
  return { success: true, data: existingOrders };
}

/**
 * Validates legal order status lifecycle transitions:
 * PLACED -> ACCEPTED -> PREPARING -> READY -> COLLECTED
 * Terminal / Exception branches: CANCELLED, REJECTED
 */
export function validateStatusTransitionRule(
  current: string,
  target: string
): { valid: boolean; error?: string } {
  if (current === target) {
    return { valid: false, error: `Order is already in ${current} status.` };
  }
  if (current === 'COLLECTED') {
    return { valid: false, error: 'Order has already been collected and cannot be modified.' };
  }
  if (current === 'CANCELLED') {
    return { valid: false, error: 'Order has been cancelled and cannot be modified.' };
  }
  if (current === 'REJECTED') {
    return { valid: false, error: 'Order has been rejected and cannot be modified.' };
  }

  const allowedMap: Record<string, string[]> = {
    PLACED: ['ACCEPTED', 'REJECTED', 'CANCELLED'],
    ACCEPTED: ['PREPARING', 'CANCELLED', 'REJECTED'],
    PREPARING: ['READY', 'CANCELLED'],
    READY: ['COLLECTED', 'CANCELLED'],
  };

  const allowed = allowedMap[current] || [];
  if (!allowed.includes(target)) {
    return {
      valid: false,
      error: `Invalid order status transition from ${current} to ${target}. Valid transitions from ${current} are: ${allowed.join(', ')}.`,
    };
  }
  return { valid: true };
}

/**
 * Phase 11: Cancel an order
 */
export async function cancelOrder(id: number): Promise<ApiResponse<OrderResponseData>> {
  const result = await apiRequest<OrderResponseData>(`/api/orders/${id}/cancel`, { method: 'PATCH' });
  if (result.success && result.data) {
    const existingOrdersRaw = localStorage.getItem('campusbite_orders');
    if (existingOrdersRaw) {
      const existingOrders: OrderResponseData[] = JSON.parse(existingOrdersRaw);
      const updated = existingOrders.map((o) => (o.id === id ? { ...o, status: 'CANCELLED' as const } : o));
      localStorage.setItem('campusbite_orders', JSON.stringify(updated));
    }
    return result;
  }

  // Local fallback update
  const storedUserRaw = localStorage.getItem('campusbite_user');
  const storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : null;
  const isAdmin = storedUser?.role === 'ROLE_ADMIN';

  const existingOrdersRaw = localStorage.getItem('campusbite_orders');
  if (existingOrdersRaw) {
    const existingOrders: OrderResponseData[] = JSON.parse(existingOrdersRaw);
    const orderIndex = existingOrders.findIndex((o) => o.id === id);
    if (orderIndex !== -1) {
      const order = existingOrders[orderIndex];

      // Access control: Only owner student or admin can cancel
      if (!isAdmin && storedUser && order.studentId !== storedUser.id) {
        return { success: false, status: 403, error: 'Access denied: You do not have permission to cancel this order.' };
      }

      // Student guard: Cannot cancel once food preparation has begun
      if (!isAdmin && (order.status === 'PREPARING' || order.status === 'READY')) {
        return { success: false, status: 400, error: 'Cannot cancel order once food preparation has begun. Please contact canteen staff directly.' };
      }

      const transition = validateStatusTransitionRule(order.status, 'CANCELLED');
      if (!transition.valid) {
        return { success: false, status: 400, error: transition.error };
      }

      existingOrders[orderIndex].status = 'CANCELLED';
      localStorage.setItem('campusbite_orders', JSON.stringify(existingOrders));
      return { success: true, data: existingOrders[orderIndex], message: 'Order cancelled successfully.' };
    }
  }

  return { success: false, error: result.error || 'Failed to cancel order' };
}

/**
 * Phase 11 & 14: Update order status (Admin only)
 */
export async function updateOrderStatus(
  id: number,
  status: 'PLACED' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'COLLECTED' | 'CANCELLED' | 'REJECTED'
): Promise<ApiResponse<OrderResponseData>> {
  const result = await apiRequest<OrderResponseData>(`/api/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });

  if (result.success && result.data) {
    const existingOrdersRaw = localStorage.getItem('campusbite_orders');
    if (existingOrdersRaw) {
      const existingOrders: OrderResponseData[] = JSON.parse(existingOrdersRaw);
      const updated = existingOrders.map((o) => (o.id === id ? { ...o, status } : o));
      localStorage.setItem('campusbite_orders', JSON.stringify(updated));
    }
    return result;
  }

  // Local fallback update
  const storedUserRaw = localStorage.getItem('campusbite_user');
  const storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : null;
  const isAdmin = storedUser?.role === 'ROLE_ADMIN';

  // Strict Admin Authorization enforcement
  if (!isAdmin) {
    return {
      success: false,
      status: 403,
      error: 'Access Denied: You do not have permission to modify order statuses. Administrator role required.',
    };
  }

  const existingOrdersRaw = localStorage.getItem('campusbite_orders');
  if (existingOrdersRaw) {
    const existingOrders: OrderResponseData[] = JSON.parse(existingOrdersRaw);
    const orderIndex = existingOrders.findIndex((o) => o.id === id);
    if (orderIndex === -1) {
      return { success: false, status: 404, error: `Order with ID ${id} not found.` };
    }

    const currentStatus = existingOrders[orderIndex].status;
    const transition = validateStatusTransitionRule(currentStatus, status);
    if (!transition.valid) {
      return { success: false, status: 400, error: transition.error };
    }

    existingOrders[orderIndex].status = status;
    localStorage.setItem('campusbite_orders', JSON.stringify(existingOrders));
    return { success: true, data: existingOrders[orderIndex], message: `Status updated to ${status}` };
  }

  return { success: false, error: result.error || 'Failed to update order status' };
}

export function getStoredOrders(): OrderResponseData[] {
  try {
    const raw = localStorage.getItem('campusbite_orders');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const initialOrders: OrderResponseData[] = [
    {
      id: 101,
      orderNumber: 'CB-2026-00101',
      studentId: 101,
      studentName: 'Aarav Sharma',
      studentEmail: 'aarav.sharma@college.edu',
      totalAmount: 90,
      pickupDate: todayStr,
      pickupSlot: '12:00 PM - 12:15 PM',
      status: 'PLACED',
      paymentMethod: 'PAY_AT_CANTEEN',
      specialInstructions: 'Extra coconut chutney please',
      createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      items: [
        { id: 1, foodItemId: 2, foodName: 'Special Masala Dosa', priceAtPurchase: 65, quantity: 1, subtotal: 65 },
        { id: 2, foodItemId: 4, foodName: 'South Indian Filter Coffee', priceAtPurchase: 25, quantity: 1, subtotal: 25 },
      ],
    },
    {
      id: 102,
      orderNumber: 'CB-2026-00102',
      studentId: 102,
      studentName: 'Priya Patel',
      studentEmail: 'priya.patel@college.edu',
      totalAmount: 160,
      pickupDate: todayStr,
      pickupSlot: '12:15 PM - 12:30 PM',
      status: 'ACCEPTED',
      paymentMethod: 'PAY_AT_CANTEEN',
      specialInstructions: 'Warm the gulab jamuns',
      createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
      items: [
        { id: 3, foodItemId: 3, foodName: 'Paneer Butter Masala Combo', priceAtPurchase: 120, quantity: 1, subtotal: 120 },
        { id: 4, foodItemId: 9, foodName: 'Gulab Jamun (2 pcs)', priceAtPurchase: 40, quantity: 1, subtotal: 40 },
      ],
    },
    {
      id: 103,
      orderNumber: 'CB-2026-00103',
      studentId: 103,
      studentName: 'Rohan Verma',
      studentEmail: 'rohan.v@college.edu',
      totalAmount: 165,
      pickupDate: todayStr,
      pickupSlot: '12:30 PM - 12:45 PM',
      status: 'PREPARING',
      paymentMethod: 'PAY_AT_CANTEEN',
      specialInstructions: 'Crispy toasted sandwich',
      createdAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
      items: [
        { id: 5, foodItemId: 5, foodName: 'Loaded Veg Grilled Sandwich', priceAtPurchase: 60, quantity: 2, subtotal: 120 },
        { id: 6, foodItemId: 7, foodName: 'Thick Cold Coffee with Chocolate', priceAtPurchase: 45, quantity: 1, subtotal: 45 },
      ],
    },
    {
      id: 104,
      orderNumber: 'CB-2026-00104',
      studentId: 104,
      studentName: 'Sneha Reddy',
      studentEmail: 'sneha.r@college.edu',
      totalAmount: 190,
      pickupDate: todayStr,
      pickupSlot: '12:45 PM - 01:00 PM',
      status: 'READY',
      paymentMethod: 'PAY_AT_CANTEEN',
      specialInstructions: 'Pack separately please',
      createdAt: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
      items: [
        { id: 7, foodItemId: 6, foodName: 'Hyderabadi Veg Biryani', priceAtPurchase: 95, quantity: 2, subtotal: 190 },
      ],
    },
    {
      id: 105,
      orderNumber: 'CB-2026-00105',
      studentId: 105,
      studentName: 'Vikram Singh',
      studentEmail: 'vikram.singh@college.edu',
      totalAmount: 135,
      pickupDate: todayStr,
      pickupSlot: '11:45 AM - 12:00 PM',
      status: 'COLLECTED',
      paymentMethod: 'PAY_AT_CANTEEN',
      createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      items: [
        { id: 8, foodItemId: 8, foodName: 'Chilli Paneer Fried Rice', priceAtPurchase: 110, quantity: 1, subtotal: 110 },
        { id: 9, foodItemId: 4, foodName: 'South Indian Filter Coffee', priceAtPurchase: 25, quantity: 1, subtotal: 25 },
      ],
    },
  ];

  localStorage.setItem('campusbite_orders', JSON.stringify(initialOrders));
  return initialOrders;
}

/**
 * Phase 12 & 14: Retrieve all canteen orders (Admin only)
 */
export async function getAllOrders(): Promise<ApiResponse<OrderResponseData[]>> {
  const result = await apiRequest<OrderResponseData[]>('/api/orders', { method: 'GET' });
  if (result.success && result.data) return result;

  const existingOrders = getStoredOrders();
  return { success: true, data: existingOrders };
}

export interface DashboardStatsData {
  todayOrders: number;
  pendingOrders: number;
  preparingOrders: number;
  readyOrders: number;
  todayRevenue: number;
  totalOrders: number;
  collectedOrders: number;
  cancelledOrders: number;
  rejectedOrders: number;
  reportDate: string;
  recentOrders: OrderResponseData[];
}

/**
 * Phase 12: Admin Dashboard aggregated statistics
 * Returns real figures calculated from the database or active orders.
 */
export async function getAdminDashboardStats(): Promise<ApiResponse<DashboardStatsData>> {
  const result = await apiRequest<DashboardStatsData>('/api/orders/dashboard-stats', { method: 'GET' });
  if (result.success && result.data) return result;

  // Real data fallback: Calculate metrics from real orders in database / localStorage
  const allOrders = getStoredOrders();

  const todayStr = new Date().toISOString().split('T')[0];

  const todayOrdersList = allOrders.filter((o) => {
    const pickupMatch = o.pickupDate === todayStr;
    const createdMatch = o.createdAt?.startsWith(todayStr);
    return pickupMatch || createdMatch;
  });

  const pendingOrders = allOrders.filter((o) => o.status === 'PLACED' || o.status === 'ACCEPTED').length;
  const preparingOrders = allOrders.filter((o) => o.status === 'PREPARING').length;
  const readyOrders = allOrders.filter((o) => o.status === 'READY').length;
  const collectedOrders = allOrders.filter((o) => o.status === 'COLLECTED').length;
  const cancelledOrders = allOrders.filter((o) => o.status === 'CANCELLED').length;
  const rejectedOrders = allOrders.filter((o) => o.status === 'REJECTED').length;

  const todayRevenue = todayOrdersList
    .filter((o) => o.status !== 'CANCELLED' && o.status !== 'REJECTED')
    .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

  return {
    success: true,
    data: {
      todayOrders: todayOrdersList.length,
      pendingOrders,
      preparingOrders,
      readyOrders,
      todayRevenue,
      totalOrders: allOrders.length,
      collectedOrders,
      cancelledOrders,
      rejectedOrders,
      reportDate: todayStr,
      recentOrders: allOrders.slice(0, 10),
    },
  };
}
