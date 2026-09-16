'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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

export default function Home() {
  const [produk, setProduk] = useState<Produk[]>([]);
  const [cari, setCari] = useState('');
  const [kategoriAktif, setKategoriAktif] = useState('Semua');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const { addToCart } = useCart();

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

    if (p.stok <= 0) {
      alert('Stok habis');
      return;
    }

    addToCart(p, 1);
    setToast(`✓ ${p.nama} ditambahkan ke keranjang`);
    setTimeout(() => setToast(''), 2500);
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

                  {/* 2 TOMBOL: BELI + KERANJANG */}
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
                      🛒
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}