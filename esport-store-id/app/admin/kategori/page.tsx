'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import AdminNavbar from '@/components/AdminNavbar';
import AlertModal from '@/components/AlertModal';

interface Kategori {
  id: number;
  nama: string;
  deskripsi: string;
  created_at: string;
}

export default function AdminKategori() {
  const { user } = useAuth();
  const router = useRouter();
  const [kategori, setKategori] = useState<Kategori[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ nama: '', deskripsi: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const fetchKategori = async () => {
    const { data, error } = await supabase
      .from('kategori')
      .select('*')
      .order('nama', { ascending: true });
    if (error) console.error(error);
    else setKategori(data || []);
  };

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      router.push('/login');
      return;
    }
    fetchKategori();
  }, [user, router]);

  const bukaTambah = () => {
    setEditId(null);
    setForm({ nama: '', deskripsi: '' });
    setError('');
    setModalOpen(true);
  };

  const bukaEdit = (k: Kategori) => {
    setEditId(k.id);
    setForm({ nama: k.nama, deskripsi: k.deskripsi || '' });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (editId) {
      const { error } = await supabase
        .from('kategori')
        .update(form)
        .eq('id', editId);
      if (error) {
        setError('Gagal update: ' + error.message);
        setLoading(false);
        return;
      }
      setModalOpen(false);
      showAlert('success', 'Berhasil', 'Kategori berhasil diupdate.');
    } else {
      const { error } = await supabase.from('kategori').insert(form);
      if (error) {
        setError('Gagal tambah: ' + error.message);
        setLoading(false);
        return;
      }
      setModalOpen(false);
      showAlert('success', 'Berhasil', 'Kategori berhasil ditambahkan.');
    }

    setLoading(false);
    setForm({ nama: '', deskripsi: '' });
    setEditId(null);
    fetchKategori();
  };

  const handleHapus = async (id: number, nama: string) => {
    const { data: produkPakai } = await supabase
      .from('produk')
      .select('id')
      .eq('kategori', nama);

    if (produkPakai && produkPakai.length > 0) {
      showAlert(
        'warning',
        'Tidak Bisa Dihapus',
        `Kategori "${nama}" masih dipakai oleh ${produkPakai.length} produk aktif.\n\nPindahkan atau hapus produk tersebut terlebih dahulu.`
      );
      return;
    }

    const { data: transaksi } = await supabase
      .from('transaksi')
      .select('id, items');

    const pernahTerjual = (transaksi || []).some((trx: any) =>
      trx.items?.some((item: any) => item.kategori === nama)
    );

    if (pernahTerjual) {
      showAlert(
        'warning',
        'Tidak Bisa Dihapus',
        `Kategori "${nama}" sudah pernah ada di riwayat transaksi.\n\nMenghapusnya akan merusak riwayat transaksi customer.`
      );
      return;
    }

    showConfirm(
      'Hapus Kategori?',
      `Yakin ingin menghapus kategori "${nama}"?\n\nTindakan ini tidak dapat dibatalkan.`,
      async () => {
        const { error } = await supabase.from('kategori').delete().eq('id', id);
        if (error) {
          showAlert('error', 'Gagal Hapus', error.message);
        } else {
          showAlert('success', 'Berhasil', `Kategori "${nama}" berhasil dihapus.`);
          fetchKategori();
        }
      }
    );
  };

  if (!user) return null;

  return (
    <div className="admin-wrapper">
      <AdminNavbar />
      <div className="admin-section">
        <div className="admin-header">
          <h1 className="admin-title">Kelola Kategori</h1>
          <button onClick={bukaTambah} className="btn">+ Tambah Kategori</button>
        </div>

        <p style={{ color: 'var(--text-dim)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
          Kategori ini akan muncul di dropdown saat menambah produk, dan di filter katalog customer.
        </p>

        {kategori.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
            Belum ada kategori. Klik "+ Tambah Kategori" untuk memulai.
          </p>
        ) : (
          <div className="kategori-admin-grid">
            {kategori.map((k) => (
              <div key={k.id} className="kategori-admin-card">
                <p className="card-produk-kategori">{k.nama}</p>
                <p className="kategori-admin-desc">{k.deskripsi || 'Tidak ada deskripsi'}</p>
                <div className="produk-admin-actions">
                  <button onClick={() => bukaEdit(k)} className="btn btn-sm">Edit</button>
                  <button onClick={() => handleHapus(k.id, k.nama)} className="btn btn-sm btn-danger">Hapus</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">
              {editId ? 'Edit Kategori' : 'Tambah Kategori'}
            </h2>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nama Kategori</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  placeholder="Contoh: Sepatu"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Deskripsi</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={form.deskripsi}
                  onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  placeholder="Deskripsi kategori (opsional)"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn btn-outline"
                >
                  Batal
                </button>
                <button type="submit" className="btn" disabled={loading}>
                  {loading ? 'Menyimpan...' : editId ? 'Update' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AlertModal
        open={alertOpen}
        type={alertType}
        title={alertTitle}
        message={alertMessage}
        onClose={closeAlert}
        onConfirm={alertConfirmAction || undefined}
        showCancel={alertShowCancel}
        confirmText={alertShowCancel ? 'Ya, Hapus' : 'Mengerti'}
      />
    </div>
  );
}