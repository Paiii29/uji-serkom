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
  // Untuk checkout partial
  checkoutItems: CartItem[];
  setCheckoutItems: (items: CartItem[]) => void;
  hapusItemCheckout: (ids: number[]) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load dari localStorage saat pertama kali
  useEffect(() => {
    const saved = localStorage.getItem('cart-esport');
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch (e) {
        console.error('Gagal load cart:', e);
      }
    }
    setLoaded(true);
  }, []);

  // Simpan ke localStorage hanya setelah loaded
  useEffect(() => {
    if (loaded) {
      localStorage.setItem('cart-esport', JSON.stringify(cart));
    }
  }, [cart, loaded]);

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

  // Hapus item tertentu dari keranjang (setelah checkout sukses)
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