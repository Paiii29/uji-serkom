'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import AdminNavbar from '@/components/AdminNavbar';
import AlertModal from '@/components/AlertModal';

interface Produk {
  id: number;
  nama: string;
  kategori: string;
  harga: number;
  stok: number;
  deskripsi: string;
  gambar: string;
}

interface Kategori {
  id: number;
  nama: string;
}

export default function AdminProduk() {
  const { user } = useAuth();
  const router = useRouter();
  const [produk, setProduk] = useState<Produk[]>([]);
  const [kategori, setKategori] = useState<Kategori[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string>('');
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Alert Modal state
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState<'warning' | 'error' | 'success' | 'info' | 'confirm'>('warning');
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertConfirmAction, setAlertConfirmAction] = useState<(() => void) | null>(null);
  const [alertShowCancel, setAlertShowCancel] = useState(false);

  const [form, setForm] = useState({
    nama: '',
    kategori: '',
    harga: '',
    stok: '',
    deskripsi: '',
    gambar: '',
  });

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

  const fetchData = async () => {
    const [p, k] = await Promise.all([
      supabase.from('produk').select('*').order('id', { ascending: false }),
      supabase.from('kategori').select('*').order('nama'),
    ]);
    setProduk(p.data || []);
    setKategori(k.data || []);
  };

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      router.push('/login');
      return;
    }
    fetchData();
  }, [user, router]);

  const bukaTambah = () => {
    setEditId(null);
    setForm({ nama: '', kategori: '', harga: '', stok: '', deskripsi: '', gambar: '' });
    setPreview('');
    setFileError('');
    setModalOpen(true);
  };

  const bukaEdit = (p: Produk) => {
    setEditId(p.id);
    setForm({
      nama: p.nama,
      kategori: p.kategori,
      harga: formatRupiah(p.harga),
      stok: String(p.stok),
      deskripsi: p.deskripsi,
      gambar: p.gambar,
    });
    setPreview(p.gambar);
    setFileError('');
    setModalOpen(true);
  };

  const formatRupiah = (angka: number | string): string => {
    const num = typeof angka === 'string' ? angka.replace(/\D/g, '') : String(angka);
    if (!num) return '';
    return Number(num).toLocaleString('id-ID');
  };

  const handleHargaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    const formatted = raw ? Number(raw).toLocaleString('id-ID') : '';
    setForm({ ...form, harga: formatted });
  };

  const handleStokChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setForm({ ...form, stok: raw });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError('');

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setFileError('Hanya file JPG, JPEG, atau PNG yang diizinkan');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setFileError('Ukuran file maksimal 2MB');
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    setUploading(true);
    const fileName = `produk-${Date.now()}-${file.name.replace(/\s/g, '-')}`;

    const { data, error } = await supabase.storage
      .from('produk')
      .upload(fileName, file);

    if (error) {
      setFileError('Gagal upload: ' + error.message);
      setUploading(false);
      return;
    }

    const { data: publicUrl } = supabase.storage
      .from('produk')
      .getPublicUrl(data.path);

    setForm({ ...form, gambar: publicUrl.publicUrl });
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (uploading) {
      showAlert('info', 'Tunggu Sebentar', 'Foto masih diupload, mohon tunggu.');
      return;
    }
    if (!form.gambar) {
      setFileError('Foto produk wajib diupload');
      return;
    }

    const hargaNum = Number(form.harga.replace(/\D/g, ''));
    const stokNum = Number(form.stok);

    if (!hargaNum || hargaNum <= 0) {
      showAlert('warning', 'Harga Tidak Valid', 'Harga harus diisi dan lebih dari 0.');
      return;
    }
    if (stokNum < 0) {
      showAlert('warning', 'Stok Tidak Valid', 'Stok tidak boleh negatif.');
      return;
    }

    setLoading(true);

    const dataKirim = {
      nama: form.nama,
      kategori: form.kategori,
      harga: hargaNum,
      stok: stokNum,
      deskripsi: form.deskripsi,
      gambar: form.gambar,
    };

    if (editId) {
      const { error } = await supabase
        .from('produk')
        .update(dataKirim)
        .eq('id', editId);
      if (error) {
        showAlert('error', 'Gagal Update', error.message);
      } else {
        setModalOpen(false);
        showAlert('success', 'Berhasil', 'Produk berhasil diupdate.');
      }
    } else {
      const { error } = await supabase.from('produk').insert(dataKirim);
      if (error) {
        showAlert('error', 'Gagal Tambah', error.message);
      } else {
        setModalOpen(false);
        showAlert('success', 'Berhasil', 'Produk berhasil ditambahkan.');
      }
    }

    setLoading(false);
    setForm({ nama: '', kategori: '', harga: '', stok: '', deskripsi: '', gambar: '' });
    setPreview('');
    setEditId(null);
    fetchData();
  };

  const handleHapus = async (id: number, nama: string) => {
    const { data: transaksi } = await supabase
      .from('transaksi')
      .select('id, items');

    const pernahTerjual = (transaksi || []).some((trx: any) =>
      trx.items?.some((item: any) => item.id === id)
    );

    if (pernahTerjual) {
      showAlert(
        'warning',
        'Tidak Bisa Dihapus',
        `Produk "${nama}" sudah pernah terjual di transaksi sebelumnya.\n\nMenghapusnya akan merusak riwayat transaksi customer.`
      );
      return;
    }

    showConfirm(
      'Hapus Produk?',
      `Yakin ingin menghapus produk "${nama}"?\n\nTindakan ini tidak dapat dibatalkan.`,
      async () => {
        const { error } = await supabase.from('produk').delete().eq('id', id);
        if (error) {
          showAlert('error', 'Gagal Hapus', error.message);
        } else {
          showAlert('success', 'Berhasil', `Produk "${nama}" berhasil dihapus.`);
          fetchData();
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
          <h1 className="admin-title">Kelola Produk</h1>
          <button onClick={bukaTambah} className="btn">+ Tambah Produk</button>
        </div>

        {produk.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
            Belum ada produk. Klik "+ Tambah Produk" untuk memulai.
          </p>
        ) : (
          <div className="produk-admin-grid">
            {produk.map((p) => (
              <div key={p.id} className="produk-admin-card">
                <img src={p.gambar} alt={p.nama} className="produk-admin-img" />
                <p className="card-produk-kategori">{p.kategori}</p>
                <p className="produk-admin-nama">{p.nama}</p>
                <p className="produk-admin-harga">Rp {p.harga.toLocaleString('id-ID')}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>Stok: {p.stok}</p>
                <div className="produk-admin-actions">
                  <button onClick={() => bukaEdit(p)} className="btn btn-sm">Edit</button>
                  <button onClick={() => handleHapus(p.id, p.nama)} className="btn btn-sm btn-danger">Hapus</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">{editId ? 'Edit Produk' : 'Tambah Produk'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nama Produk</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  placeholder="Contoh: Jersey Esport Pro"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Kategori</label>
                <select
                  className="form-select"
                  value={form.kategori}
                  onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                  required
                >
                  <option value="">-- Pilih Kategori --</option>
                  {kategori.map((k) => (
                    <option key={k.id} value={k.nama}>{k.nama}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Harga (Rp)</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.harga}
                  onChange={handleHargaChange}
                  placeholder="Contoh: 185.000"
                  required
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.3rem' }}>
                  Ketik angka saja, titik ribuan otomatis muncul
                </p>
              </div>

              <div className="form-group">
                <label className="form-label">Stok</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.stok}
                  onChange={handleStokChange}
                  placeholder="Contoh: 25"
                  required
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.3rem' }}>
                  Isi manual jumlah stok tersedia
                </p>
              </div>

              <div className="form-group">
                <label className="form-label">Deskripsi</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={form.deskripsi}
                  onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  placeholder="Deskripsi produk..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Foto Produk</label>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
                  Format: JPG, JPEG, PNG. Maks 2MB. Foto otomatis dipangkas 4:3.
                </p>

                {preview && (
                  <div className="upload-preview">
                    <img src={preview} alt="Preview" />
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-outline"
                  disabled={uploading}
                  style={{ width: '100%', marginTop: '0.5rem' }}
                >
                  {uploading ? 'Mengupload...' : preview ? 'Ganti Foto' : 'Pilih Foto dari Galeri'}
                </button>

                {fileError && <p className="form-error">{fileError}</p>}
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-outline">Batal</button>
                <button type="submit" className="btn" disabled={loading || uploading}>
                  {loading ? 'Menyimpan...' : uploading ? 'Mengupload...' : editId ? 'Update' : 'Simpan'}
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