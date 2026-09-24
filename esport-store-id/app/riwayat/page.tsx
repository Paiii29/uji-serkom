'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import StrukModal from '@/components/StrukModal';

interface Transaksi {
  id: number;
  pembeli: {
    nama: string;
    email: string;
    telepon: string;
    alamat: string;
    user_id: number | null;
  };
  items: {
    id: number;
    nama: string;
    harga: number;
    qty: number;
    gambar: string;
  }[];
  total: number;
  status: string;
  tanggal: string;
}

const STATUS_STEPS = ['Pending', 'Diproses', 'Dikirim', 'Selesai'];

export default function RiwayatPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [transaksi, setTransaksi] = useState<Transaksi[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState<Transaksi | null>(null);

  // Modal struk
  const [strukOpen, setStrukOpen] = useState(false);
  const [strukData, setStrukData] = useState<Transaksi | null>(null);

  const fetchRiwayat = async (showLoading = false) => {
    if (!user) return;
    if (showLoading) setLoading(true);
    else setRefreshing(true);

    const { data, error } = await supabase
      .from('transaksi')
      .select('*')
      .order('tanggal', { ascending: false });

    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(error);
      }
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const filtered = (data || []).filter(
      (trx: Transaksi) => trx.pembeli?.user_id === user?.id
    );

    setTransaksi(filtered);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchRiwayat(true);
  }, [user, router]);

  // AUTO-REFRESH 10 detik
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      fetchRiwayat(false);
    }, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const bukaDetail = (t: Transaksi) => {
    setDetailData(t);
    setDetailOpen(true);
  };

  const bukaStruk = (t: Transaksi) => {
    setStrukData(t);
    setStrukOpen(true);
  };

  const handleRefreshManual = () => {
    fetchRiwayat(false);
  };

  const formatTanggal = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Pending': return 'badge-pending';
      case 'Diproses': return 'badge-diproses';
      case 'Dikirim': return 'badge-dikirim';
      case 'Selesai': return 'badge-selesai';
      case 'Dibatalkan': return 'badge-dibatalkan';
      default: return 'badge-status';
    }
  };

  if (!user) return null;

  return (
    <>
      <Navbar />
      <div className="section">
        <div className="section-header-with-close">
          <div>
            <h2 className="section-title">Riwayat <span>Transaksi</span></h2>
            <div className="divider"></div>
          </div>
          <button
            onClick={() => router.push('/')}
            className="btn-close"
            title="Kembali ke Beranda"
          >
            ✕
          </button>
        </div>

        {!loading && transaksi.length > 0 && (
          <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: 0 }}>
              Status otomatis diperbarui setiap 10 detik
            </p>
            <button
              type="button"
              onClick={handleRefreshManual}
              className="btn btn-sm btn-outline"
              disabled={refreshing}
            >
              {refreshing ? 'Memuat...' : 'Refresh Status'}
            </button>
          </div>
        )}

        {loading ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>
            Memuat riwayat transaksi...
          </p>
        ) : transaksi.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-title">Belum Ada Transaksi</p>
            <p style={{ color: 'var(--text-dim)', marginBottom: '1.5rem' }}>
              Kamu belum pernah melakukan pembelian. Yuk, mulai belanja!
            </p>
            <Link href="/" className="btn">Mulai Belanja</Link>
          </div>
        ) : (
          <div className="riwayat-list">
            {transaksi.map((t) => {
              const totalItem = t.items.reduce((sum, item) => sum + item.qty, 0);
              const currentStep = STATUS_STEPS.indexOf(t.status);
              const dibatalkan = t.status === 'Dibatalkan';

              return (
                <div key={t.id} className="riwayat-card">
                  <div className="riwayat-header">
                    <div>
                      <p className="riwayat-id">Transaksi #{t.id}</p>
                      <p className="riwayat-tanggal">{formatTanggal(t.tanggal)}</p>
                    </div>
                    <span className={getStatusClass(t.status)}>{t.status}</span>
                  </div>

                  {!dibatalkan && (
                    <div className="status-steps">
                      {STATUS_STEPS.map((step, i) => {
                        const isActive = i <= currentStep;
                        return (
                          <div key={step} className="status-step">
                            <div className={`status-dot ${isActive ? 'active' : ''}`}></div>
                            <p className={`status-label ${isActive ? 'active' : ''}`}>{step}</p>
                            {i < STATUS_STEPS.length - 1 && (
                              <div className={`status-line ${i < currentStep ? 'active' : ''}`}></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {dibatalkan && (
                    <div className="alert alert-error" style={{ marginBottom: '1rem', marginTop: '0.5rem' }}>
                      Pesanan ini telah dibatalkan.
                    </div>
                  )}

                  <div className="riwayat-items-preview">
                    {t.items.slice(0, 3).map((item, i) => (
                      <img
                        key={i}
                        src={item.gambar}
                        alt={item.nama}
                        className="riwayat-item-img"
                      />
                    ))}
                    {t.items.length > 3 && (
                      <div className="riwayat-item-more">+{t.items.length - 3}</div>
                    )}
                  </div>

                  <div className="riwayat-footer">
                    <div>
                      <p className="riwayat-label">Total Item</p>
                      <p className="riwayat-value">{totalItem} produk</p>
                    </div>
                    <div>
                      <p className="riwayat-label">Total Bayar</p>
                      <p className="riwayat-total">Rp {Number(t.total).toLocaleString('id-ID')}</p>
                    </div>
                  </div>

                  <div className="riwayat-actions">
                    <button onClick={() => bukaDetail(t)} className="btn btn-sm">
                      Lihat Detail
                    </button>
                    <button
                      onClick={() => bukaStruk(t)}
                      className="btn btn-sm btn-outline"
                    >
                      Cetak Struk
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL DETAIL TRANSAKSI */}
      {detailOpen && detailData && (
        <div className="modal-overlay" onClick={() => setDetailOpen(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '700px' }}
          >
            <h2 className="modal-title">Detail Transaksi #{detailData.id}</h2>

            <div className="detail-trx-section">
              <p className="detail-trx-label">Tanggal</p>
              <p className="detail-trx-value">{formatTanggal(detailData.tanggal)}</p>
            </div>

            <div className="detail-trx-section">
              <p className="detail-trx-label">Status Pesanan</p>
              <p className="detail-trx-value">
                <span className={getStatusClass(detailData.status)}>{detailData.status}</span>
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
                {detailData.status === 'Pending' && 'Pesanan kamu sedang menunggu diproses admin.'}
                {detailData.status === 'Diproses' && 'Pesanan kamu sedang dikerjakan oleh admin.'}
                {detailData.status === 'Dikirim' && 'Pesanan kamu sedang dalam pengiriman.'}
                {detailData.status === 'Selesai' && 'Pesanan kamu sudah selesai. Terima kasih!'}
                {detailData.status === 'Dibatalkan' && 'Pesanan kamu telah dibatalkan.'}
              </p>
            </div>

            <div className="detail-trx-section">
              <p className="detail-trx-label">Alamat Pengiriman</p>
              <p className="detail-trx-value">{detailData.pembeli?.alamat}</p>
            </div>

            <div className="detail-trx-section">
              <p className="detail-trx-label">Produk yang Dibeli</p>
              {detailData.items.map((item, i) => (
                <div key={i} className="detail-trx-item">
                  <img src={item.gambar} alt={item.nama} className="detail-trx-item-img" />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 800, fontSize: '0.9rem' }}>{item.nama}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                      Rp {item.harga.toLocaleString('id-ID')} × {item.qty}
                    </p>
                  </div>
                  <p style={{ fontWeight: 800, color: 'var(--red)' }}>
                    Rp {(item.harga * item.qty).toLocaleString('id-ID')}
                  </p>
                </div>
              ))}
            </div>

            <div className="cart-total" style={{ marginBottom: '1rem' }}>
              <p className="cart-total-label">Total Bayar</p>
              <p className="cart-total-amount">
                Rp {Number(detailData.total).toLocaleString('id-ID')}
              </p>
            </div>

            <div className="modal-actions">
              <button onClick={() => bukaStruk(detailData)} className="btn">
                Cetak Struk
              </button>
              <button onClick={() => setDetailOpen(false)} className="btn btn-outline">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL STRUK */}
      {strukOpen && strukData && (
        <StrukModal transaksi={strukData} onClose={() => setStrukOpen(false)} />
      )}
    </>
  );
}