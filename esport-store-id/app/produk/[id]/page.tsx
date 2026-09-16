'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
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
  const { user } = useAuth();
  const [produk, setProduk] = useState<Produk | null>(null);
  const [qty, setQty] = useState(1);
  const [loginModal, setLoginModal] = useState(false);

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
    if (!user) {
      setLoginModal(true);
      return;
    }

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

  const keLogin = () => {
    setLoginModal(false);
    router.push('/login');
  };

  const keDaftar = () => {
    setLoginModal(false);
    router.push('/register');
  };

  return (
    <>
      <Navbar />
      <div className="section">
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
              {habis ? 'Stok Habis' : `Stok Tersedia: ${produk.stok}`}
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

      {/* MODAL LOGIN REQUIRED */}
      {loginModal && (
        <div className="modal-overlay" onClick={() => setLoginModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '420px', textAlign: 'center', borderTop: '6px solid var(--red)' }}
          >
            <h2 className="modal-title" style={{ textAlign: 'center', marginBottom: '1rem' }}>
              Login Dulu Yuk!
            </h2>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Untuk membeli produk atau menambah ke keranjang, kamu harus <strong>login</strong> terlebih dahulu.
              <br /><br />
              Belum punya akun? Silakan daftar dulu gratis.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button onClick={keLogin} className="btn btn-block">
                Login Sekarang
              </button>
              <button onClick={keDaftar} className="btn btn-outline btn-block">
                Daftar Akun Baru
              </button>
              <button
                onClick={() => setLoginModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-dim)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  marginTop: '0.25rem',
                }}
              >
                Nanti saja
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}