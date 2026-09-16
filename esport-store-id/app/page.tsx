'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

export default function Home() {
  const [produk, setProduk] = useState<Produk[]>([]);
  const [cari, setCari] = useState('');
  const [kategoriAktif, setKategoriAktif] = useState('Semua');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const { addToCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [loginModal, setLoginModal] = useState(false);

  useEffect(() => {
    async function fetchProduk() {
      const { data, error } = await supabase
        .from('produk')
        .select('*')
        .order('id', { ascending: false });
      if (error) console.error(error);
      else setProduk(data || []);
      setLoading(false);
    }
    fetchProduk();
  }, []);

  const kategoriList = ['Semua', ...Array.from(new Set(produk.map((p) => p.kategori)))];

  const produkFilter = produk.filter((p) => {
    const matchCari = p.nama.toLowerCase().includes(cari.toLowerCase());
    const matchKategori = kategoriAktif === 'Semua' || p.kategori === kategoriAktif;
    return matchCari && matchKategori;
  });

  const handleTambahKeKeranjang = (e: React.MouseEvent, p: Produk) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      setLoginModal(true);
      return;
    }

    if (p.stok <= 0) {
      alert('Stok habis');
      return;
    }

    addToCart(p, 1);
    setToast(`${p.nama} ditambahkan ke keranjang`);
    setTimeout(() => setToast(''), 2500);
  };

  const tutupModal = () => setLoginModal(false);

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

      {toast && <div className="toast">{toast}</div>}

      <section className="hero">
        <h1 className="hero-title">Esport Store ID</h1>
        <p className="hero-sub">Merchandise Resmi Tim Esport Favoritmu</p>
      </section>

      <div className="section">
        <h2 className="section-title">Katalog <span>Produk</span></h2>
        <div className="divider"></div>

        <input
          type="text"
          className="search-box"
          placeholder="Cari produk esport..."
          value={cari}
          onChange={(e) => setCari(e.target.value)}
        />

        <div className="kategori-list">
          {kategoriList.map((kat) => (
            <button
              key={kat}
              className={`kategori-btn ${kategoriAktif === kat ? 'active' : ''}`}
              onClick={() => setKategoriAktif(kat)}
            >
              {kat}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>Memuat produk...</p>
        ) : produkFilter.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>Produk tidak ditemukan.</p>
        ) : (
          <div className="grid-produk">
            {produkFilter.map((p) => {
              const habis = p.stok <= 0;
              return (
                <div key={p.id} className="card-produk">
                  <Link href={`/produk/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ position: 'relative' }}>
                      <img src={p.gambar} alt={p.nama} className="card-produk-img" />
                      {habis && (
                        <span
                          className="badge-habis"
                          style={{ position: 'absolute', top: '10px', left: '10px', marginBottom: 0 }}
                        >
                          STOK HABIS
                        </span>
                      )}
                    </div>
                    <div className="card-produk-body" style={{ paddingBottom: '0.5rem' }}>
                      <p className="card-produk-kategori">{p.kategori}</p>
                      <p className="card-produk-nama">{p.nama}</p>
                      <p className="card-produk-harga">Rp {p.harga.toLocaleString('id-ID')}</p>
                      <p className={`card-produk-stok ${habis ? 'habis' : ''}`}>
                        {habis ? 'Stok Habis' : `Stok: ${p.stok}`}
                      </p>
                    </div>
                  </Link>

                  <div className="card-produk-actions">
                    <button
                      onClick={(e) => handleTambahKeKeranjang(e, p)}
                      disabled={habis}
                      className="btn-beli"
                      style={habis ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                    >
                      {habis ? 'Habis' : 'Beli'}
                    </button>
                    <button
                      onClick={(e) => handleTambahKeKeranjang(e, p)}
                      disabled={habis}
                      className="btn-keranjang"
                      title="Tambah ke Keranjang"
                      style={habis ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL LOGIN REQUIRED */}
      {loginModal && (
        <div className="modal-overlay" onClick={tutupModal}>
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
                onClick={tutupModal}
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