'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import AdminNavbar from '@/components/AdminNavbar';

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

  // Form pakai string untuk harga & stok (biar bisa kosong)
  const [form, setForm] = useState({
    nama: '',
    kategori: '',
    harga: '',      // string biar bisa kosong & di-format
    stok: '',       // string biar bisa kosong
    deskripsi: '',
    gambar: '',
  });

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
      harga: formatRupiah(p.harga),   // tampilkan dengan titik
      stok: String(p.stok),
      deskripsi: p.deskripsi,
      gambar: p.gambar,
    });
    setPreview(p.gambar);
    setFileError('');
    setModalOpen(true);
  };

  // ============================================
  // FORMAT ANGKA JADI RUPIAH (5.000 / 10.000)
  // ============================================
  const formatRupiah = (angka: number | string): string => {
    const num = typeof angka === 'string' ? angka.replace(/\D/g, '') : String(angka);
    if (!num) return '';
    return Number(num).toLocaleString('id-ID');
  };

  // ============================================
  // HANDLE INPUT HARGA (auto-format dengan titik)
  // ============================================
  const handleHargaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Ambil hanya angka (hapus titik/koma/spasi)
    const raw = e.target.value.replace(/\D/g, '');
    // Format dengan titik ribuan
    const formatted = raw ? Number(raw).toLocaleString('id-ID') : '';
    setForm({ ...form, harga: formatted });
  };

  // ============================================
  // HANDLE INPUT STOK (hanya angka)
  // ============================================
  const handleStokChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setForm({ ...form, stok: raw });
  };

  // ============================================
  // HANDLE UPLOAD FOTO
  // ============================================
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

  // ============================================
  // SUBMIT
  // ============================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (uploading) {
      alert('Tunggu, foto masih diupload...');
      return;
    }
    if (!form.gambar) {
      setFileError('Foto produk wajib diupload');
      return;
    }

    // Convert harga & stok dari string ke number
    const hargaNum = Number(form.harga.replace(/\D/g, ''));
    const stokNum = Number(form.stok);

    if (!hargaNum || hargaNum <= 0) {
      alert('Harga harus diisi dan lebih dari 0');
      return;
    }
    if (stokNum < 0) {
      alert('Stok tidak boleh negatif');
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
      if (error) alert('Gagal update: ' + error.message);
    } else {
      const { error } = await supabase.from('produk').insert(dataKirim);
      if (error) alert('Gagal tambah: ' + error.message);
    }

    setLoading(false);
    setModalOpen(false);
    setForm({ nama: '', kategori: '', harga: '', stok: '', deskripsi: '', gambar: '' });
    setPreview('');
    setEditId(null);
    fetchData();
  };

  const handleHapus = async (id: number) => {
    if (!confirm('Yakin hapus produk ini?')) return;
    const { error } = await supabase.from('produk').delete().eq('id', id);
    if (error) alert('Gagal hapus: ' + error.message);
    else fetchData();
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
                  <button onClick={() => handleHapus(p.id)} className="btn btn-sm btn-danger">Hapus</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
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
    </div>
  );
}