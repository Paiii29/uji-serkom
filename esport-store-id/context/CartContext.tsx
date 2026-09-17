'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Produk {
  id: number;
  nama: string;
  kategori: string;
  harga: number;
  stok: number;
  deskripsi: string;
  gambar: string;
}

interface CartItem extends Produk {
  qty: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (produk: Produk, qty: number) => void;
  removeFromCart: (id: number) => void;
  updateQty: (id: number, qty: number) => void;
  clearCart: () => void;
  totalHarga: number;
  checkoutItems: CartItem[];
  setCheckoutItems: (items: CartItem[]) => void;
  hapusItemCheckout: (ids: number[]) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Helper: dapatkan key localStorage berdasarkan user
function getCartKey(): string {
  if (typeof window === 'undefined') return 'cart-esport-guest';
  const userData = localStorage.getItem('user-esport');
  if (!userData) return 'cart-esport-guest';
  try {
    const user = JSON.parse(userData);
    return `cart-esport-${user.id}`;
  } catch {
    return 'cart-esport-guest';
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [currentKey, setCurrentKey] = useState<string>('cart-esport-guest');

  // Load cart dari localStorage sesuai user
  useEffect(() => {
    const key = getCartKey();
    setCurrentKey(key);
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch (e) {
        console.error('Gagal load cart:', e);
      }
    } else {
      setCart([]);
    }
    setLoaded(true);
  }, []);

  // Dengerin perubahan login/logout
  useEffect(() => {
    const handleUserChange = () => {
      const key = getCartKey();
      setCurrentKey(key);
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          setCart(JSON.parse(saved));
        } catch {
          setCart([]);
        }
      } else {
        setCart([]);
      }
      setCheckoutItems([]);
    };

    window.addEventListener('user-login', handleUserChange);
    window.addEventListener('user-logout', handleUserChange);
    window.addEventListener('storage', handleUserChange);

    return () => {
      window.removeEventListener('user-login', handleUserChange);
      window.removeEventListener('user-logout', handleUserChange);
      window.removeEventListener('storage', handleUserChange);
    };
  }, []);

  // Simpan ke localStorage setiap kali cart berubah
  useEffect(() => {
    if (loaded) {
      localStorage.setItem(currentKey, JSON.stringify(cart));
    }
  }, [cart, loaded, currentKey]);

  const addToCart = (produk: Produk, qty: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === produk.id);
      if (existing) {
        return prev.map((item) =>
          item.id === produk.id ? { ...item, qty: item.qty + qty } : item
        );
      }
      return [...prev, { ...produk, qty }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQty = (id: number, qty: number) => {
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qty } : item))
    );
  };

  const clearCart = () => setCart([]);

  const hapusItemCheckout = (ids: number[]) => {
    setCart((prev) => prev.filter((item) => !ids.includes(item.id)));
  };

  const totalHarga = cart.reduce((sum, item) => sum + item.harga * item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        totalHarga,
        checkoutItems,
        setCheckoutItems,
        hapusItemCheckout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart harus dipakai di dalam CartProvider');
  return context;
}