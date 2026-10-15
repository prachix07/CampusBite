import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { FoodItem, CartItem } from '../types';

interface CartContextType {
  items: CartItem[];
  addToCart: (food: FoodItem, quantity?: number) => void;
  increaseQuantity: (foodId: number) => void;
  decreaseQuantity: (foodId: number) => void;
  removeFromCart: (foodId: number) => void;
  clearCart: () => void;
  getItemQuantity: (foodId: number) => number;
  totalCount: number;
  subtotal: number;
  total: number;
  estimatedPrepTime: number;
  isCartEmpty: boolean;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  selectedDate: string;
  selectedSlot: string | null;
  setSelectedDate: (date: string) => void;
  setSelectedSlot: (slot: string | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'campusbite_cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    // Restore cart from localStorage on initial render
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse cart from localStorage', e);
    }
    return [];
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // Sync cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to persist cart to localStorage', e);
    }
  }, [items]);

  const addToCart = (food: FoodItem, quantity = 1) => {
    if (!food.available) return;

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((ci) => ci.foodItem.id === food.id);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      } else {
        return [...prevItems, { foodItem: food, quantity }];
      }
    });
  };

  const increaseQuantity = (foodId: number) => {
    setItems((prevItems) =>
      prevItems.map((ci) =>
        ci.foodItem.id === foodId
          ? { ...ci, quantity: ci.quantity + 1 }
          : ci
      )
    );
  };

  const decreaseQuantity = (foodId: number) => {
    setItems((prevItems) => {
      const existing = prevItems.find((ci) => ci.foodItem.id === foodId);
      if (!existing) return prevItems;

      if (existing.quantity <= 1) {
        // Remove item if quantity hits 0
        return prevItems.filter((ci) => ci.foodItem.id !== foodId);
      }

      return prevItems.map((ci) =>
        ci.foodItem.id === foodId
          ? { ...ci, quantity: ci.quantity - 1 }
          : ci
      );
    });
  };

  const removeFromCart = (foodId: number) => {
    setItems((prevItems) => prevItems.filter((ci) => ci.foodItem.id !== foodId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const getItemQuantity = (foodId: number): number => {
    const item = items.find((ci) => ci.foodItem.id === foodId);
    return item ? item.quantity : 0;
  };

  // Computations
  const totalCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const price = Number(item.foodItem.price) || 0;
      return sum + price * item.quantity;
    }, 0);
  }, [items]);

  const total = subtotal; // For college canteen, no hidden convenience fees

  const estimatedPrepTime = useMemo(() => {
    // In canteen kitchen batching, the longest preparation time among chosen items dominates
    if (items.length === 0) return 0;
    return Math.max(...items.map((i) => i.foodItem.preparationTime || 10));
  }, [items]);

  const isCartEmpty = items.length === 0;

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);
  const toggleDrawer = () => setIsDrawerOpen((prev) => !prev);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        getItemQuantity,
        totalCount,
        subtotal,
        total,
        estimatedPrepTime,
        isCartEmpty,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        toggleDrawer,
        selectedDate,
        selectedSlot,
        setSelectedDate,
        setSelectedSlot,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
