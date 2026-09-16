'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';
import Navbar from '@/components/Navbar';

interface Produk {
  id: number;
  nama: string;
  kategori: string;
  harga: number;
  stok: number;
  deskripsi: string;
  gambar: string;
}

export default function DetailProduk() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [produk, setProduk] = useState<Produk | null>(null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    async function fetchProduk() {
      const { data, error } = await supabase
        .from('produk')
        .select('*')
        .eq('id', Number(params.id))
        .single();
      if (!error) setProduk(data);
    }
    fetchProduk();
  }, [params.id]);

  if (!produk) {
    return (
      <>
        <Navbar />
        <div className="section"><p style={{ textAlign: 'center', padding: '2rem' }}>Memuat produk...</p></div>
      </>
    );
  }

  const habis = produk.stok <= 0;

  const handleAddToCart = () => {
    if (habis) {
      alert('Stok produk habis');
      return;
    }
    if (qty > produk.stok) {
      alert(`Stok tidak cukup. Tersisa: ${produk.stok}`);
      return;
    }
    addToCart(produk, qty);
    alert('Produk berhasil ditambahkan ke keranjang!');
    router.push('/keranjang');
  };

  return (
    <>
      <Navbar />
      <div className="section">
        {/* TOMBOL TUTUP DI ATAS */}
        <button
          onClick={() => router.push('/')}
          className="btn-tutup"
          title="Kembali ke Katalog"
        >
          ← Kembali ke Katalog
        </button>

        <div className="detail-grid" style={{ marginTop: '1.5rem' }}>
          <img src={produk.gambar} alt={produk.nama} className="detail-img" />
          <div>
            {habis && <span className="badge-habis">STOK HABIS</span>}
            <p className="detail-kategori">{produk.kategori}</p>
            <h1 className="detail-nama">{produk.nama}</h1>
            <p className="detail-harga">Rp {produk.harga.toLocaleString('id-ID')}</p>
            <p className="detail-deskripsi">{produk.deskripsi}</p>
            <p className="detail-stok" style={{ fontWeight: 800, color: habis ? 'var(--red)' : 'var(--text-dim)' }}>
              {habis ? '❌ Stok Habis' : `✅ Stok Tersedia: ${produk.stok}`}
            </p>

            {!habis && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', marginTop: '1rem' }}>
                  <label style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Jumlah:</label>
                  <input
                    type="number"
                    min="1"
                    max={produk.stok}
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                    className="qty-input"
                  />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Maks: {produk.stok}</span>
                </div>

                <button onClick={handleAddToCart} className="btn btn-block">
                  Tambah ke Keranjang
                </button>
              </>
            )}

            {habis && (
              <button disabled className="btn btn-block" style={{ opacity: 0.5, cursor: 'not-allowed', marginTop: '1rem' }}>
                Stok Habis
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}