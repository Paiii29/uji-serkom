'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

export default function Checkout() {
  const { cart, checkoutItems, setCheckoutItems, hapusItemCheckout } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ nama: '', email: '', telepon: '', alamat: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Fallback: kalau checkoutItems kosong, pakai semua cart
  const items = checkoutItems.length > 0 ? checkoutItems : cart;
  const total = items.reduce((sum, item) => sum + item.harga * item.qty, 0);

  const validate = () => {
    const err: Record<string, string> = {};
    if (!form.nama.trim()) err.nama = 'Nama wajib diisi';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) err.email = 'Email tidak valid';
    if (!form.telepon.match(/^[0-9]{10,13}$/)) err.telepon = 'Telepon harus 10-13 digit angka';
    if (!form.alamat.trim()) err.alamat = 'Alamat wajib diisi';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // ============================================
  // TOMBOL CLOSE — HANYA balik ke keranjang
  // TIDAK menghapus apapun dari cart
  // ============================================
  const handleClose = () => {
    setCheckoutItems([]);  // reset pilihan checkout
    router.push('/keranjang');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Cek stok
    for (const item of items) {
      const { data: produkDb } = await supabase
        .from('produk')
        .select('stok, nama')
        .eq('id', item.id)
        .single();

      if (!produkDb) {
        alert(`Produk ${item.nama} tidak ditemukan.`);
        return;
      }
      if (produkDb.stok < item.qty) {
        alert(`Stok "${item.nama}" tidak cukup. Tersisa: ${produkDb.stok}, diminta: ${item.qty}`);
        return;
      }
    }

    setLoading(true);

    // Insert transaksi
    const { data: trx, error: trxError } = await supabase
      .from('transaksi')
      .insert({
        pembeli: { ...form, user_id: user?.id || null },
        items: items,
        total: total,
        status: 'Pending',
      })
      .select()
      .single();

    if (trxError) {
      alert('Checkout gagal: ' + trxError.message);
      setLoading(false);
      return;
    }

    // Update stok
    for (const item of items) {
      const { data: produkDb } = await supabase
        .from('produk')
        .select('stok')
        .eq('id', item.id)
        .single();

      if (produkDb) {
        const stokBaru = produkDb.stok - item.qty;
        await supabase.from('produk').update({ stok: stokBaru }).eq('id', item.id);
      }
    }

    // Hapus HANYA item yang di-checkout dari keranjang
    const idCheckout = items.map((i) => i.id);
    hapusItemCheckout(idCheckout);
    setCheckoutItems([]);

    setLoading(false);
    alert(`Checkout berhasil!\nID Transaksi: ${trx.id}`);
    router.push('/');
  };

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <div className="section">
          <div className="empty-state">
            <p className="empty-state-title">Tidak Ada Produk untuk Checkout</p>
            <button onClick={handleClose} className="btn">
              Kembali ke Keranjang
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="section" style={{ maxWidth: '700px' }}>
        {/* HEADER DENGAN TOMBOL CLOSE */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '0.5rem',
          }}
        >
          <div>
            <h2 className="section-title">
              Checkout <span>Pesanan</span>
            </h2>
            <div className="divider"></div>
          </div>
          <button onClick={handleClose} className="btn-close" title="Kembali ke Keranjang">
            ✕
          </button>
        </div>

        {/* LIST PRODUK YANG DICHECKOUT */}
        <div
          style={{
            background: '#f5f5f5',
            padding: '1rem',
            marginBottom: '1.5rem',
            borderLeft: '4px solid var(--red)',
          }}
        >
          <p
            style={{
              fontWeight: 800,
              textTransform: 'uppercase',
              fontSize: '0.8rem',
              letterSpacing: '1px',
              marginBottom: '0.75rem',
            }}
          >
            Produk yang Dibeli ({items.length})
          </p>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.85rem',
                marginBottom: '0.4rem',
                color: 'var(--text-dim)',
              }}
            >
              <span>
                {item.nama} × {item.qty}
              </span>
              <span style={{ fontWeight: 700, color: 'var(--text)' }}>
                Rp {(item.harga * item.qty).toLocaleString('id-ID')}
              </span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nama Lengkap</label>
            <input
              type="text"
              className="form-input"
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
            />
            {errors.nama && <p className="form-error">{errors.nama}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="text"
              className="form-input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {errors.email && <p className="form-error">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Nomor Telepon</label>
            <input
              type="text"
              className="form-input"
              value={form.telepon}
              onChange={(e) => setForm({ ...form, telepon: e.target.value })}
            />
            {errors.telepon && <p className="form-error">{errors.telepon}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Alamat Pengiriman</label>
            <textarea
              className="form-textarea"
              rows={4}
              value={form.alamat}
              onChange={(e) => setForm({ ...form, alamat: e.target.value })}
            />
            {errors.alamat && <p className="form-error">{errors.alamat}</p>}
          </div>

          <div className="cart-total" style={{ marginBottom: '1.5rem' }}>
            <p className="cart-total-label">Total Bayar</p>
            <p className="cart-total-amount">Rp {total.toLocaleString('id-ID')}</p>
          </div>

          <button type="submit" className="btn btn-block" disabled={loading}>
            {loading ? 'Memproses...' : 'Konfirmasi Pesanan'}
          </button>
        </form>
      </div>
    </>
  );
}