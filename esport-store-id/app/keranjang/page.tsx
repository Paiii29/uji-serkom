'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';
import Navbar from '@/components/Navbar';

interface StokProduk {
  id: number;
  stok: number;
  nama: string;
}

export default function Keranjang() {
  const { cart, removeFromCart, updateQty, totalHarga, setCheckoutItems } = useCart();
  const router = useRouter();
  const [stokData, setStokData] = useState<StokProduk[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loadingStok, setLoadingStok] = useState(true);

  // Set default: semua produk terpilih saat pertama load
  useEffect(() => {
    if (cart.length > 0 && selected.length === 0) {
      setSelected(cart.map((item) => item.id));
    }
  }, [cart, selected.length]);

  // Fetch stok terbaru dari Supabase
  useEffect(() => {
    async function fetchStok() {
      if (cart.length === 0) {
        setLoadingStok(false);
        return;
      }
      setLoadingStok(true);
      const ids = cart.map((item) => item.id);
      const { data } = await supabase
        .from('produk')
        .select('id, stok, nama')
        .in('id', ids);
      setStokData(data || []);
      setLoadingStok(false);
    }
    fetchStok();
  }, [cart]);

  const getStok = (id: number) => {
    const found = stokData.find((s) => s.id === id);
    return found ? found.stok : null;
  };

  const toggleSelected = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSemua = () => {
    if (selected.length === cart.length) {
      setSelected([]);
    } else {
      setSelected(cart.map((item) => item.id));
    }
  };

  const produkDipilih = cart.filter((item) => selected.includes(item.id));
  const totalDipilih = produkDipilih.reduce(
    (sum, item) => sum + item.harga * item.qty,
    0
  );

  // Cek apakah ada masalah stok di produk yang dipilih
  const produkBermasalah = cart.filter((item) => {
    const stok = getStok(item.id);
    return stok !== null && (stok <= 0 || item.qty > stok);
  });

  const adaMasalah = produkBermasalah.length > 0;

  const bisaCheckout =
    selected.length > 0 &&
    !adaMasalah &&
    produkDipilih.length > 0 &&
    produkDipilih.every((item) => {
      const stok = getStok(item.id);
      return stok !== null && stok >= item.qty;
    });

  const handleLanjutCheckout = () => {
    if (!bisaCheckout) return;
    setCheckoutItems(produkDipilih);
    router.push('/checkout');
  };

  if (cart.length === 0) {
    return (
      <>
        <Navbar />
        <div className="section">
          <div className="empty-state">
            <p className="empty-state-title">Keranjang Kosong</p>
            <Link href="/" className="btn">Kembali Belanja</Link>
          </div>
        </div>
      </>
    );
  }

  const semuaTerpilih = selected.length === cart.length && cart.length > 0;

  return (
    <>
      <Navbar />
      <div className="section">
        <h2 className="section-title">Keranjang <span>Belanja</span></h2>
        <div className="divider"></div>

        {/* Warning kalau ada produk habis */}
        {adaMasalah && (
          <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
            <strong>Perhatian!</strong> Ada {produkBermasalah.length} produk di keranjang yang sudah habis atau stoknya tidak cukup. Hapus produk tersebut atau kurangi jumlahnya untuk melanjutkan checkout.
          </div>
        )}

        <div className="cart-pilih-semua">
          <label className="cart-checkbox-label">
            <input
              type="checkbox"
              checked={semuaTerpilih}
              onChange={toggleSemua}
              className="cart-checkbox"
            />
            <span>Pilih Semua ({selected.length}/{cart.length})</span>
          </label>
        </div>

        {cart.map((item) => {
          const stok = getStok(item.id);
          const habisTotal = stok !== null && stok <= 0;
          const kurangStok = stok !== null && stok > 0 && item.qty > stok;
          const adaIsu = habisTotal || kurangStok;
          const isSelected = selected.includes(item.id);

          return (
            <div
              key={item.id}
              className={`cart-item ${adaIsu ? 'cart-item-habis' : ''}`}
              style={{
                borderLeft: adaIsu
                  ? '4px solid var(--red)'
                  : isSelected
                  ? '4px solid var(--red)'
                  : '4px solid transparent',
                opacity: adaIsu ? 0.85 : isSelected ? 1 : 0.6,
              }}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleSelected(item.id)}
                className="cart-checkbox"
                disabled={adaIsu}
              />

              {/* FOTO dengan overlay kalau stok habis */}
              <div className="cart-item-img-wrap">
                <img src={item.gambar} alt={item.nama} className="cart-item-img" />
                {habisTotal && (
                  <div className="cart-item-overlay">
                    <span>STOK HABIS</span>
                  </div>
                )}
              </div>

              <div className="cart-item-info">
                <p className="cart-item-nama">{item.nama}</p>
                <p className="cart-item-harga">Rp {item.harga.toLocaleString('id-ID')}</p>

                {stok !== null && (
                  <p
                    style={{
                      fontSize: '0.75rem',
                      color: adaIsu ? 'var(--red)' : 'var(--text-dim)',
                      marginTop: '0.3rem',
                      fontWeight: 700,
                    }}
                  >
                    {habisTotal
                      ? 'Stok Habis - Silakan hapus produk ini'
                      : kurangStok
                      ? `Stok tersisa: ${stok} (Anda minta ${item.qty})`
                      : `Stok tersedia: ${stok}`}
                  </p>
                )}
              </div>

              <input
                type="number"
                min="1"
                max={stok && stok > 0 ? stok : undefined}
                value={item.qty}
                onChange={(e) => updateQty(item.id, Number(e.target.value))}
                className="qty-input"
                style={adaIsu ? { borderColor: 'var(--red)' } : {}}
                disabled={habisTotal}
              />

              <button
                onClick={() => removeFromCart(item.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--red)',
                  fontWeight: 800,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Hapus
              </button>
            </div>
          );
        })}

        <div className="cart-total">
          <p className="cart-total-label">
            Total {selected.length} Produk Dipilih
          </p>
          <p className="cart-total-amount">
            Rp {totalDipilih.toLocaleString('id-ID')}
          </p>
        </div>

        {selected.length === 0 && (
          <div className="alert alert-error" style={{ marginTop: '1.5rem' }}>
            Pilih minimal 1 produk untuk checkout.
          </div>
        )}

        <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
          {!bisaCheckout ? (
            <button
              disabled
              className="btn"
              style={{ opacity: 0.5, cursor: 'not-allowed' }}
            >
              {adaMasalah
                ? 'Perbaiki Keranjang Dulu'
                : 'Pilih Produk Dulu'}
            </button>
          ) : (
            <button onClick={handleLanjutCheckout} className="btn">
              Checkout ({selected.length} Produk) →
            </button>
          )}
        </div>
      </div>
    </>
  );
}