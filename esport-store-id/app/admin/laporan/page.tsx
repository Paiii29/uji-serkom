'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import AdminNavbar from '@/components/AdminNavbar';
import StrukModal from '@/components/StrukModal';
import AlertModal from '@/components/AlertModal';

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

const STATUS_LIST = ['Pending', 'Diproses', 'Dikirim', 'Selesai', 'Dibatalkan'];

export default function AdminLaporan() {
  const { user } = useAuth();
  const router = useRouter();
  const [transaksi, setTransaksi] = useState<Transaksi[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAwal, setFilterAwal] = useState('');
  const [filterAkhir, setFilterAkhir] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState<Transaksi | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Modal struk
  const [strukOpen, setStrukOpen] = useState(false);
  const [strukData, setStrukData] = useState<Transaksi | null>(null);

  // Alert state
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState<'warning' | 'error' | 'success' | 'info' | 'confirm'>('warning');
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertConfirmAction, setAlertConfirmAction] = useState<(() => void) | null>(null);
  const [alertShowCancel, setAlertShowCancel] = useState(false);

  const showAlert = (type: 'warning' | 'error' | 'success' | 'info', title: string, message: string) => {
    setAlertType(type);
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertConfirmAction(null);
    setAlertShowCancel(false);
    setAlertOpen(true);
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setAlertType('confirm');
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertConfirmAction(() => onConfirm);
    setAlertShowCancel(true);
    setAlertOpen(true);
  };

  const closeAlert = () => {
    setAlertOpen(false);
    setAlertConfirmAction(null);
  };

  const fetchTransaksi = async () => {
    setLoading(true);
    let query = supabase.from('transaksi').select('*').order('tanggal', { ascending: false });

    if (filterAwal) query = query.gte('tanggal', filterAwal);
    if (filterAkhir) {
      const akhir = new Date(filterAkhir);
      akhir.setDate(akhir.getDate() + 1);
      query = query.lt('tanggal', akhir.toISOString());
    }

    const { data, error } = await query;
    if (error) console.error(error);
    else setTransaksi(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      router.push('/login');
      return;
    }
    fetchTransaksi();
  }, [user, router, filterAwal, filterAkhir]);

  const ubahStatus = (id: number, statusBaru: string) => {
    showConfirm(
      'Ubah Status Transaksi?',
      `Ubah status transaksi #${id} menjadi "${statusBaru}"?\n\nCustomer akan melihat perubahan status ini.`,
      async () => {
        setUpdatingStatus(true);
        const { error } = await supabase
          .from('transaksi')
          .update({ status: statusBaru })
          .eq('id', id);

        if (error) {
          showAlert('error', 'Gagal Ubah Status', error.message);
        } else {
          setTransaksi((prev) =>
            prev.map((t) => (t.id === id ? { ...t, status: statusBaru } : t))
          );
          if (detailData && detailData.id === id) {
            setDetailData({ ...detailData, status: statusBaru });
          }
          showAlert('success', 'Berhasil', `Status transaksi #${id} berhasil diubah menjadi "${statusBaru}".`);
        }
        setUpdatingStatus(false);
      }
    );
  };

  const transaksiFilter = transaksi.filter((t) => {
    if (filterStatus === 'Semua') return true;
    return t.status === filterStatus;
  });

  const totalTransaksi = transaksiFilter.length;
  const totalPendapatan = transaksiFilter.reduce((sum, t) => sum + Number(t.total), 0);
  const totalItemTerjual = transaksiFilter.reduce(
    (sum, t) => sum + t.items.reduce((s, i) => s + i.qty, 0),
    0
  );

  const produkTerlaris = (() => {
    const map = new Map<string, { nama: string; qty: number; pendapatan: number }>();
    transaksiFilter.forEach((t) => {
      t.items.forEach((item) => {
        const existing = map.get(item.nama);
        if (existing) {
          existing.qty += item.qty;
          existing.pendapatan += item.harga * item.qty;
        } else {
          map.set(item.nama, { nama: item.nama, qty: item.qty, pendapatan: item.harga * item.qty });
        }
      });
    });
    return Array.from(map.values()).sort((a, b) => b.qty - a.qty).slice(0, 5);
  })();

  const bukaDetail = (t: Transaksi) => {
    setDetailData(t);
    setDetailOpen(true);
  };

  const bukaStruk = (t: Transaksi) => {
    setStrukData(t);
    setStrukOpen(true);
  };

  const handleReset = () => {
    setFilterAwal('');
    setFilterAkhir('');
    setFilterStatus('Semua');
  };

  const handlePrint = () => {
    window.print();
  };

  const formatTanggal = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Fungsi untuk memformat tanggal filter (tanpa jam) agar rapi di struk cetak
  const formatTanggalFilter = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  // Teks dinamis untuk header cetak
  const teksPeriode = (() => {
    if (filterAwal && filterAkhir) {
      return `Laporan Penjualan dari tanggal ${formatTanggalFilter(filterAwal)} sampai tanggal ${formatTanggalFilter(filterAkhir)}`;
    }
    if (filterAwal) {
      return `Laporan Penjualan dari tanggal ${formatTanggalFilter(filterAwal)} sampai sekarang`;
    }
    if (filterAkhir) {
      return `Laporan Penjualan sampai tanggal ${formatTanggalFilter(filterAkhir)}`;
    }
    return `Laporan Penjualan dari tanggal 1 sampai tanggal ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}`;
  })();

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
    <div className="admin-wrapper">
      <div className="no-print">
        <AdminNavbar />
      </div>

      <div className="admin-section print-area">
        <div className="print-header">
          <h1>ESPORT STORE ID</h1>
          <p>Laporan Penjualan</p>
          <p>Dicetak: {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p>
          
          {/* TEKS PERIODE - RAPI & MENYATU DENGAN HEADER */}
          <p style={{ marginTop: '0.3rem' }}>
            {teksPeriode}
          </p>
        </div>

        <div className="admin-header no-print">
          <h1 className="admin-title">Laporan Penjualan</h1>
          <button onClick={handlePrint} className="btn">Cetak Laporan</button>
        </div>

        <div className="laporan-filter no-print">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Dari Tanggal</label>
            <input type="date" className="form-input" value={filterAwal} onChange={(e) => setFilterAwal(e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Sampai Tanggal</label>
            <input type="date" className="form-input" value={filterAkhir} onChange={(e) => setFilterAkhir(e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Status</label>
            <select className="form-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="Semua">Semua Status</option>
              {STATUS_LIST.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <button onClick={handleReset} className="btn btn-outline">Reset</button>
        </div>

        <div className="stat-grid" style={{ marginTop: '1.5rem' }}>
          <div className="stat-card">
            <p className="stat-label">Total Transaksi</p>
            <p className="stat-value">{totalTransaksi}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Total Pendapatan</p>
            <p className="stat-value" style={{ fontSize: '1.3rem' }}>
              Rp {totalPendapatan.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Item Terjual</p>
            <p className="stat-value">{totalItemTerjual}</p>
          </div>
        </div>

        {produkTerlaris.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h2 className="admin-title" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
              Produk Terlaris
            </h2>
            <div className="laporan-terlaris-grid">
              {produkTerlaris.map((p, i) => (
                <div key={i} className="laporan-terlaris-card">
                  <p className="laporan-terlaris-rank">#{i + 1}</p>
                  <p className="laporan-terlaris-nama">{p.nama}</p>
                  <p className="laporan-terlaris-qty">{p.qty} terjual</p>
                  <p className="laporan-terlaris-pendapatan">
                    Rp {p.pendapatan.toLocaleString('id-ID')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <h2 className="admin-title" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
          Daftar Transaksi
        </h2>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>Memuat data...</p>
        ) : transaksiFilter.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>Belum ada transaksi.</p>
        ) : (
          <div className="laporan-table-wrapper">
            <table className="laporan-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tanggal</th>
                  <th>Pembeli</th>
                  <th>Jumlah Item</th>
                  <th>Total</th>
                  <th className="no-print">Status</th>
                  <th className="no-print">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {transaksiFilter.map((t) => (
                  <tr key={t.id}>
                    <td>#{t.id}</td>
                    <td>{formatTanggal(t.tanggal)}</td>
                    <td>{t.pembeli?.nama || '-'}</td>
                    <td>{t.items.reduce((s, i) => s + i.qty, 0)}</td>
                    <td style={{ fontWeight: 800, color: 'var(--red)' }}>
                      Rp {Number(t.total).toLocaleString('id-ID')}
                    </td>
                    <td className="no-print">
                      <span className={getStatusClass(t.status)}>{t.status}</span>
                    </td>
                    <td className="no-print">
                      <button onClick={() => bukaDetail(t)} className="btn btn-sm">
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {detailOpen && detailData && (
        <div className="modal-overlay no-print" onClick={() => setDetailOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <h2 className="modal-title">Detail Transaksi #{detailData.id}</h2>

            <div className="detail-trx-section">
              <p className="detail-trx-label">Tanggal</p>
              <p className="detail-trx-value">{formatTanggal(detailData.tanggal)}</p>
            </div>

            <div className="detail-trx-section">
              <p className="detail-trx-label">Ubah Status Transaksi</p>
              <select
                className="form-select"
                value={detailData.status}
                onChange={(e) => ubahStatus(detailData.id, e.target.value)}
                disabled={updatingStatus}
                style={{ fontWeight: 700 }}
              >
                {STATUS_LIST.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.4rem' }}>
                Ubah status agar customer tahu proses pesanannya.
              </p>
            </div>

            <div className="detail-trx-section">
              <p className="detail-trx-label">Pembeli</p>
              <p className="detail-trx-value"><strong>{detailData.pembeli?.nama}</strong></p>
              <p className="detail-trx-value">Email: {detailData.pembeli?.email}</p>
              <p className="detail-trx-value">Telepon: {detailData.pembeli?.telepon}</p>
              <p className="detail-trx-value">Alamat: {detailData.pembeli?.alamat}</p>
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
                Cetak Struk Pengiriman
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

      {/* ALERT MODAL */}
      <AlertModal
        open={alertOpen}
        type={alertType}
        title={alertTitle}
        message={alertMessage}
        onClose={closeAlert}
        onConfirm={alertConfirmAction || undefined}
        showCancel={alertShowCancel}
        confirmText={alertShowCancel ? 'Ya, Ubah' : 'Mengerti'}
      />
    </div>
  );
}