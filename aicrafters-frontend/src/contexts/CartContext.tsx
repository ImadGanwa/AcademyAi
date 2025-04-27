import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface CartItem {
  id: string;
  imageId: string;
  title: string;
  instructor: string;
  price: number;
  originalPrice: number;
  type: 'individual' | 'pack';
  packId?: string;
  courses?: Array<{
    id: string;
    imageId: string;
    title: string;
    instructor: string;
    price: number;
    originalPrice: number;
  }>;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  totalPrice: number;
  originalTotalPrice: number;
  promoCode: string | null;
  applyPromoCode: (code: string) => void;
  removePromoCode: () => void;
}

const CART_STORAGE_KEY = 'aicrafters_cart';
const PROMO_CODE_STORAGE_KEY = 'aicrafters_promo_code';

// Helper function to safely parse JSON from localStorage
const getStoredData = <T,>(key: string, defaultValue: T): T => {
  try {
    const storedData = localStorage.getItem(key);
    return storedData ? JSON.parse(storedData) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage:`, error);
    return defaultValue;
  }
};

export const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  clearCart: () => {},
  totalPrice: 0,
  originalTotalPrice: 0,
  promoCode: null,
  applyPromoCode: () => {},
  removePromoCode: () => {}
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from localStorage
  const [items, setItems] = useState<CartItem[]>(() => 
    getStoredData<CartItem[]>(CART_STORAGE_KEY, [])
  );
  const [promoCode, setPromoCode] = useState<string | null>(() => 
    getStoredData<string | null>(PROMO_CODE_STORAGE_KEY, null)
  );

  // Persist items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // Persist promo code to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(PROMO_CODE_STORAGE_KEY, JSON.stringify(promoCode));
  }, [promoCode]);

  const addItem = useCallback((newItem: CartItem) => {
    setItems(prevItems => {
      // If adding a pack
      if (newItem.type === 'pack') {
        // Get all course IDs in the pack
        const packCourseIds = newItem.courses?.map(course => course.id) || [];
        
        // Filter out any individual courses that are part of the pack
        const filteredItems = prevItems.filter(item => {
          if (item.type === 'individual') {
            return !packCourseIds.includes(item.id);
          }
          return true;
        });

        // Check if pack already exists
        const packExists = filteredItems.some(item => item.id === newItem.id);
        if (packExists) {
          return filteredItems; // Don't add duplicate pack
        }

        return [...filteredItems, newItem];
      }

      // If adding an individual course
      if (newItem.type === 'individual') {
        // Check if course is already part of any existing pack
        const isInPack = prevItems.some(item => 
          item.type === 'pack' && 
          item.courses?.some(course => course.id === newItem.id)
        );

        if (isInPack) {
          return prevItems; // Don't add if course is already in a pack
        }

        // Check if course already exists as individual
        const courseExists = prevItems.some(item => 
          item.type === 'individual' && item.id === newItem.id
        );

        if (courseExists) {
          return prevItems; // Don't add duplicate individual course
        }

        return [...prevItems, newItem];
      }

      return prevItems;
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setPromoCode(null);
    localStorage.removeItem(CART_STORAGE_KEY);
    localStorage.removeItem(PROMO_CODE_STORAGE_KEY);
  }, []);

  const applyPromoCode = useCallback((code: string) => {
    setPromoCode(code);
  }, []);

  const removePromoCode = useCallback(() => {
    setPromoCode(null);
  }, []);

  // Calculate totals
  const originalTotalPrice = items.reduce((sum, item) => sum + item.originalPrice, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const totalPrice = promoCode ? subtotal * 0.5 : subtotal;

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      clearCart,
      totalPrice,
      originalTotalPrice,
      promoCode,
      applyPromoCode,
      removePromoCode
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 